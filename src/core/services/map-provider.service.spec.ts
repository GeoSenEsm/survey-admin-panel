import L from 'leaflet';
import { ConfigService } from './config.service';
import { LocalStorageService } from './local-storage';
import { MapProviderService } from './map-provider.service';

describe('MapProviderService', () => {
  let storage: jasmine.SpyObj<LocalStorageService>;
  let configService: Pick<ConfigService, 'mapProvider'>;

  beforeEach(() => {
    storage = jasmine.createSpyObj<LocalStorageService>('LocalStorageService', ['get', 'save', 'remove']);
    storage.get.and.returnValue(null);
    configService = { mapProvider: 'openstreetmap' } as Pick<ConfigService, 'mapProvider'>;
  });

  it('keeps overlay coordinates unchanged for OpenStreetMap', () => {
    const service = new MapProviderService(storage, configService as ConfigService);

    expect(service.toDisplayLatLng(39.9042, 116.4074, 'openstreetmap')).toEqual([39.9042, 116.4074]);
  });

  it('converts Beijing WGS84 coordinates to Baidu display coordinates', () => {
    const service = new MapProviderService(storage, configService as ConfigService);
    const [latitude, longitude] = service.toDisplayLatLng(39.9042, 116.4074, 'baidu') as [number, number];

    expect(latitude).toBeCloseTo(39.9119, 3);
    expect(longitude).toBeCloseTo(116.4200, 3);
  });

  it('projects Beijing Baidu display coordinates to valid Baidu tile coordinates', () => {
    const service = new MapProviderService(storage, configService as ConfigService);
    const [latitude, longitude] = service.toDisplayLatLng(39.9042, 116.4074, 'baidu') as [number, number];
    const point = service.getCrs('baidu').latLngToPoint(L.latLng(latitude, longitude), 13);
    const tile = point.divideBy(256).floor();

    expect(Number.isFinite(point.x)).toBeTrue();
    expect(Number.isFinite(point.y)).toBeTrue();
    expect(tile.x).toBeGreaterThan(1500);
    expect(tile.x).toBeLessThan(1700);
    expect(tile.y).toBeLessThan(-500);
    expect(tile.y).toBeGreaterThan(-700);
  });

  it('creates Baidu tile URLs from Baidu CRS tile coordinates', () => {
    const service = new MapProviderService(storage, configService as ConfigService);
    const url = service.createTileLayer('baidu').getTileUrl({ x: 1581, y: -590, z: 13 } as L.Coords);

    expect(url).toContain('x=1581');
    expect(url).toContain('y=589');
    expect(url).toContain('z=13');
  });

  it('persists selected map provider', () => {
    const service = new MapProviderService(storage, configService as ConfigService);

    service.setProvider('baidu');

    expect(storage.save).toHaveBeenCalledWith('mapProvider', 'baidu');
  });

  it('uses the selected Baidu provider when converting display coordinates', () => {
    const service = new MapProviderService(storage, configService as ConfigService);

    service.setProvider('baidu');
    const [latitude, longitude] = service.toDisplayLatLng(31.2304, 121.4737) as [number, number];

    expect(latitude).toBeCloseTo(31.2343, 3);
    expect(longitude).toBeCloseTo(121.4859, 3);
  });
});
