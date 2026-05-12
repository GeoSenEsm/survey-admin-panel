import { Inject, Injectable } from '@angular/core';
import L from 'leaflet';
import { BehaviorSubject, Observable } from 'rxjs';
import { STORAGE_SERVICE_TOKEN } from './injection-tokens';
import { LocalStorageService } from './local-storage';
import { ConfigService } from './config.service';

export type MapProvider = 'openstreetmap' | 'baidu';

export interface MapProviderOption {
  value: MapProvider;
  labelKey: string;
}

export const MAP_PROVIDER_OPTIONS: MapProviderOption[] = [
  { value: 'openstreetmap', labelKey: 'configuration.mapProvider.openStreetMap' },
  { value: 'baidu', labelKey: 'configuration.mapProvider.baidu' },
];

const MAP_PROVIDER_STORAGE_KEY = 'mapProvider';

@Injectable({
  providedIn: 'root'
})
export class MapProviderService {
  private readonly selectedProviderSubject: BehaviorSubject<MapProvider>;

  constructor(
    @Inject(STORAGE_SERVICE_TOKEN) private readonly storage: LocalStorageService,
    private readonly configService: ConfigService
  ) {
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

  toDisplayLatLng(latitude: number, longitude: number): L.LatLngExpression {
    if (this.selectedProvider !== 'baidu' || this.isOutsideChina(latitude, longitude)) {
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
      maxZoom: 18,
    });

    layer.getTileUrl = (coords: L.Coords): string => {
      const offset = Math.pow(2, coords.z - 1);
      const x = coords.x - offset;
      const y = offset - coords.y - 1;
      const subdomain = Math.abs(coords.x + coords.y) % 4;

      return `https://maponline${subdomain}.bdimg.com/tile/?qt=tile&x=${x}&y=${y}&z=${coords.z}&styles=pl&scaler=1&p=1`;
    };

    return layer;
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
    const xPi = Math.PI * 3000.0 / 180.0;
    const z = Math.sqrt(longitude * longitude + latitude * latitude) + 0.00002 * Math.sin(latitude * xPi);
    const theta = Math.atan2(latitude, longitude) + 0.000003 * Math.cos(longitude * xPi);

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
}
