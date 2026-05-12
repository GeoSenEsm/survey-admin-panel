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
  displayName: string;
}

export const MAP_PROVIDER_OPTIONS: MapProviderOption[] = [
  { value: 'openstreetmap', labelKey: 'configuration.mapProvider.openStreetMap', displayName: 'OpenStreetMap' },
  { value: 'baidu', labelKey: 'configuration.mapProvider.baidu', displayName: 'Baidu' },
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
    // Keep overlays in the same Leaflet coordinate space for every provider.
    // The Baidu layer is rendered through Leaflet's normal map projection, so
    // shifting data coordinates here makes points/polygons drift away from the
    // correct OpenStreetMap location.
    return [latitude, longitude];
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
}
