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

  it('keeps overlay coordinates unchanged for Baidu so they align with OpenStreetMap locations', () => {
    const service = new MapProviderService(storage, configService as ConfigService);

    service.setProvider('baidu');

    expect(service.toDisplayLatLng(31.2304, 121.4737)).toEqual([31.2304, 121.4737]);
  });

  it('persists selected map provider', () => {
    const service = new MapProviderService(storage, configService as ConfigService);

    service.setProvider('baidu');

    expect(storage.save).toHaveBeenCalledWith('mapProvider', 'baidu');
  });
});
