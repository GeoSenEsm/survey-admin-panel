import { Inject, Injectable } from '@angular/core';
import L from 'leaflet';
import { BehaviorSubject, Observable } from 'rxjs';
import { STORAGE_SERVICE_TOKEN } from './injection-tokens';
import { LocalStorageService } from './local-storage';
import { ConfigService } from './config.service';

export type MapProvider = 'openstreetmap' | 'baidu';

const MAP_PROVIDER_STORAGE_KEY = 'mapProvider';
const BAIDU_MAX_ZOOM = 18;
const X_PI = Math.PI * 3000.0 / 180.0;
const BAIDU_LL_BAND = [75, 60, 45, 30, 15, 0];
const BAIDU_MC_BAND = [12890594.86, 8362377.87, 5591021, 3481989.83, 1678043.12, 0];
const BAIDU_LL_TO_MC = [
  [-0.0015702102444, 111320.7020616939, 1704480524535203, -10338987376042340, 26112667856603880, -35149669176653700, 26595700718403920, -10725012454188240, 1800819912950474, 82.5],
  [0.0008277824516172526, 111320.7020463578, 647795574.6671607, -4082003173.641316, 10774905663.51142, -15171875531.51559, 12053065338.62167, -5124939663.577472, 913311935.9512032, 67.5],
  [0.00337398766765, 111320.7020202162, 4481351.045890365, -23393751.19931662, 79682215.47186455, -115964993.2797253, 97236711.15602145, -43661946.33752821, 8477230.501135234, 52.5],
  [0.00220636496208, 111320.7020209128, 51751.86112841131, 3796837.749470245, 992013.7397791013, -1221952.21711287, 1340652.697009075, -620943.6990984312, 144416.9293806241, 37.5],
  [-0.0003441963504368392, 111320.7020576856, 278.2353980772752, 2485758.690035394, 6070.750963243378, 54821.18345352118, 9540.606633304236, -2710.55326746645, 1405.483844121726, 22.5],
  [-0.0003218135878613132, 111320.7020701615, 0.00369383431289, 823725.6402795718, 0.46104986909093, 2351.343141331292, 1.58060784298199, 8.77738589078284, 0.37238884252424, 7.45],
];
const BAIDU_MC_TO_LL = [
  [1.410526172116255e-8, 8.98305509648872e-6, -1.9939833816331, 200.9824383106796, -187.2403703815547, 91.6087516669843, -23.38765649603339, 2.57121317296198, -0.03801003308653, 17337981.2],
  [-7.435856389565537e-9, 8.983055097726239e-6, -0.78625201886289, 96.32687599759846, -1.85204757529826, -59.36935905485877, 47.40033549296737, -16.50741931063887, 2.28786674699375, 10260144.86],
  [-3.030883460898826e-8, 8.98305509983578e-6, 0.30071316287616, 59.74293618442277, 7.357984074871, -25.38371002664745, 13.45380521110908, -3.29883767235584, 0.32710905363475, 6856817.37],
  [-1.981981304930552e-8, 8.983055099779535e-6, 0.03278182852591, 40.31678527705744, 0.65659298677277, -4.44255534477492, 0.85341911805263, 0.12923347998204, -0.04625736007561, 4482777.06],
  [3.09191371068437e-9, 8.983055096812155e-6, 0.00006995724062, 23.10934304144901, -0.00023663490511, -0.6321817810242, -0.00663494467273, 0.03430082397953, -0.00466043876332, 2555164.4],
  [2.890871144776878e-9, 8.983055095805407e-6, -0.00000003068298, 7.47137025468032, -0.00000353937994, -0.02145144861037, -0.00001234426596, 0.00010322952773, -0.00000323890364, 826088.5],
];

@Injectable({
  providedIn: 'root'
})
export class MapProviderService {
  private readonly selectedProviderSubject: BehaviorSubject<MapProvider>;
  private readonly baiduCrs: L.CRS;

  constructor(
    @Inject(STORAGE_SERVICE_TOKEN) private readonly storage: LocalStorageService,
    private readonly configService: ConfigService
  ) {
    this.baiduCrs = this.createBaiduCrs();
    this.selectedProviderSubject = new BehaviorSubject<MapProvider>(
      this.normalizeProvider(
        this.storage.get<string>(MAP_PROVIDER_STORAGE_KEY) ?? this.configService.mapProvider
      )
    );
  }

  get selectedProvider$(): Observable<MapProvider> {
    return this.selectedProviderSubject.asObservable();
  }

  get selectedProvider(): MapProvider {
    return this.selectedProviderSubject.value;
  }

  setProvider(provider: MapProvider): void {
    const normalizedProvider = this.normalizeProvider(provider);
    this.storage.save(MAP_PROVIDER_STORAGE_KEY, normalizedProvider);
    this.selectedProviderSubject.next(normalizedProvider);
  }

  createTileLayer(provider: MapProvider = this.selectedProvider): L.TileLayer {
    if (provider === 'baidu') {
      return this.createBaiduTileLayer();
    }

    return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });
  }

  createMapOptions(center: [number, number], zoom: number, provider: MapProvider = this.selectedProvider): L.MapOptions {
    return {
      center: this.toDisplayLatLng(center[0], center[1], provider),
      zoom,
      crs: this.getCrs(provider),
    };
  }

  getCrs(provider: MapProvider = this.selectedProvider): L.CRS {
    return provider === 'baidu' ? this.baiduCrs : L.CRS.EPSG3857;
  }

  toDisplayLatLng(latitude: number, longitude: number, provider: MapProvider = this.selectedProvider): L.LatLngExpression {
    if (provider !== 'baidu' || this.isOutsideChina(latitude, longitude)) {
      return [latitude, longitude];
    }

    const gcj02 = this.wgs84ToGcj02(latitude, longitude);
    const bd09 = this.gcj02ToBd09(gcj02.latitude, gcj02.longitude);
    return [bd09.latitude, bd09.longitude];
  }

  private normalizeProvider(provider: string | null | undefined): MapProvider {
    return provider === 'baidu' ? 'baidu' : 'openstreetmap';
  }

  private createBaiduTileLayer(): L.TileLayer {
    const layer = L.tileLayer('', {
      attribution: '&copy; Baidu',
      minZoom: 3,
      maxZoom: BAIDU_MAX_ZOOM,
    });

    layer.getTileUrl = (coords: L.Coords): string => {
      const x = coords.x;
      const y = -coords.y - 1;
      const subdomain = Math.abs(x + y) % 4;

      return `https://maponline${subdomain}.bdimg.com/tile/?qt=tile&x=${x}&y=${y}&z=${coords.z}&styles=pl&scaler=1&p=1`;
    };

    return layer;
  }

  private createBaiduCrs(): L.CRS {
    const projection: L.Projection = {
      bounds: L.bounds([-20037726.37, -12474104.17], [20037726.37, 12474104.17]),
      project: (latLng: L.LatLng): L.Point => {
        const point = this.baiduLatLngToMercator(latLng.lat, latLng.lng);
        return L.point(point.x, point.y);
      },
      unproject: (point: L.Point): L.LatLng => {
        const latLng = this.baiduMercatorToLatLng(point.x, point.y);
        return L.latLng(latLng.latitude, latLng.longitude);
      },
    };

    return L.extend({}, L.CRS.Earth, {
      code: 'BAIDU',
      projection,
      transformation: new L.Transformation(1, 0, -1, 0),
      scale: (zoom: number) => Math.pow(2, zoom - BAIDU_MAX_ZOOM),
      zoom: (scale: number) => Math.log(scale) / Math.LN2 + BAIDU_MAX_ZOOM,
      infinite: true,
    }) as L.CRS;
  }

  private baiduLatLngToMercator(latitude: number, longitude: number): { x: number; y: number } {
    const lat = this.clamp(latitude, -74, 74);
    const lon = this.normalizeLongitude(longitude);
    const factor = BAIDU_LL_TO_MC[BAIDU_LL_BAND.findIndex((band) => lat >= band)];
    const fallbackFactor = BAIDU_LL_TO_MC[BAIDU_LL_TO_MC.length - 1];
    return this.baiduConvertor(lon, lat, factor ?? fallbackFactor);
  }

  private baiduMercatorToLatLng(x: number, y: number): { latitude: number; longitude: number } {
    const absY = Math.abs(y);
    const factor = BAIDU_MC_TO_LL[BAIDU_MC_BAND.findIndex((band) => absY >= band)];
    const fallbackFactor = BAIDU_MC_TO_LL[BAIDU_MC_TO_LL.length - 1];
    const point = this.baiduConvertor(x, y, factor ?? fallbackFactor);
    return { latitude: point.y, longitude: point.x };
  }

  private baiduConvertor(x: number, y: number, factors: number[]): { x: number; y: number } {
    const xTemp = factors[0] + factors[1] * Math.abs(x);
    const cC = Math.abs(y) / factors[9];
    let yTemp = factors[2]
      + factors[3] * cC
      + factors[4] * cC * cC
      + factors[5] * Math.pow(cC, 3)
      + factors[6] * Math.pow(cC, 4)
      + factors[7] * Math.pow(cC, 5)
      + factors[8] * Math.pow(cC, 6);

    return {
      x: xTemp * (x < 0 ? -1 : 1),
      y: yTemp * (y < 0 ? -1 : 1),
    };
  }

  private isOutsideChina(latitude: number, longitude: number): boolean {
    return longitude < 72.004 || longitude > 137.8347 || latitude < 0.8293 || latitude > 55.8271;
  }

  private wgs84ToGcj02(latitude: number, longitude: number): { latitude: number; longitude: number } {
    const a = 6378245.0;
    const ee = 0.00669342162296594323;
    let dLat = this.transformLat(longitude - 105.0, latitude - 35.0);
    let dLon = this.transformLon(longitude - 105.0, latitude - 35.0);
    const radLat = latitude / 180.0 * Math.PI;
    let magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;
    const sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * Math.PI);
    dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * Math.PI);

    return {
      latitude: latitude + dLat,
      longitude: longitude + dLon,
    };
  }

  private gcj02ToBd09(latitude: number, longitude: number): { latitude: number; longitude: number } {
    const z = Math.sqrt(longitude * longitude + latitude * latitude) + 0.00002 * Math.sin(latitude * X_PI);
    const theta = Math.atan2(latitude, longitude) + 0.000003 * Math.cos(longitude * X_PI);

    return {
      latitude: z * Math.sin(theta) + 0.006,
      longitude: z * Math.cos(theta) + 0.0065,
    };
  }

  private transformLat(x: number, y: number): number {
    let result = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    result += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
    result += (20.0 * Math.sin(y * Math.PI) + 40.0 * Math.sin(y / 3.0 * Math.PI)) * 2.0 / 3.0;
    result += (160.0 * Math.sin(y / 12.0 * Math.PI) + 320 * Math.sin(y * Math.PI / 30.0)) * 2.0 / 3.0;
    return result;
  }

  private transformLon(x: number, y: number): number {
    let result = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    result += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
    result += (20.0 * Math.sin(x * Math.PI) + 40.0 * Math.sin(x / 3.0 * Math.PI)) * 2.0 / 3.0;
    result += (150.0 * Math.sin(x / 12.0 * Math.PI) + 300.0 * Math.sin(x / 30.0 * Math.PI)) * 2.0 / 3.0;
    return result;
  }

  private normalizeLongitude(longitude: number): number {
    let normalized = longitude;
    while (normalized > 180) {
      normalized -= 360;
    }
    while (normalized < -180) {
      normalized += 360;
    }
    return normalized;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }
}
