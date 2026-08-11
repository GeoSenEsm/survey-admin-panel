import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ConfigService } from './config.service';
import { SensorProfileServiceImpl } from './sensor-profile.service.impl';

describe('SensorProfileServiceImpl', () => {
  let service: SensorProfileServiceImpl;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        SensorProfileServiceImpl,
        { provide: ConfigService, useValue: { apiUrl: 'https://api.example' } },
      ],
    });
    service = TestBed.inject(SensorProfileServiceImpl);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads engine capabilities instead of accepting arbitrary adapter keys', () => {
    let adapterKeys: string[] = [];
    service
      .getCapabilities()
      .subscribe((capabilities) => (adapterKeys = capabilities.supportedAdapterKeys));

    http
      .expectOne('https://api.example/api/sensorprofiles/capabilities')
      .flush({
        supportedSchemaVersions: [1],
        currentEngineVersion: '1.0.0',
        supportedAdapterKeys: [],
        supportedTransports: ['gatt_sequence', 'ble_advertisement'],
        supportedGattOperations: ['write', 'delay', 'acquire'],
        supportedAdvertisementDecoders: ['xiaomi_mibeacon_v4_v5'],
      });
    expect(adapterKeys).toEqual([]);
  });

  it('uses the revision lifecycle endpoints', () => {
    service.listRevisions('type/id').subscribe();
    const list = http.expectOne(
      (request) =>
        request.url === 'https://api.example/api/sensorprofiles' &&
        request.params.get('sensorTypeId') === 'type/id'
    );
    list.flush([]);

    service
      .updateDraft('profile/id', {
        minEngineVersion: '1.0.0',
        spec: {},
      })
      .subscribe();
    const update = http.expectOne(
      'https://api.example/api/sensorprofiles/profile%2Fid'
    );
    expect(update.request.method).toBe('PUT');
    update.flush({});

    service.publish('profile/id').subscribe();
    const publish = http.expectOne(
      'https://api.example/api/sensorprofiles/profile%2Fid/publish'
    );
    expect(publish.request.method).toBe('POST');
    publish.flush({});

    service.rollback('type/id', 1).subscribe();
    const rollback = http.expectOne(
      'https://api.example/api/sensorprofiles/type%2Fid/rollback/1'
    );
    expect(rollback.request.method).toBe('POST');
    rollback.flush({});
  });

  it('normalizes semantic validation errors', () => {
    let message = '';
    service.validateDraft('profile-1').subscribe((result) => {
      message = result.errors[0].message;
    });

    const request = http.expectOne(
      'https://api.example/api/sensorprofiles/profile-1/validate'
    );
    expect(request.request.method).toBe('POST');
    request.flush({ valid: false, errors: ['Missing matcher'] });
    expect(message).toBe('Missing matcher');
  });

  it('extracts the JSON path prefix from a plain-string validation error', () => {
    let issue: { path: string; code: string; message: string } | undefined;
    service.validateDraft('profile-1').subscribe((result) => (issue = result.errors[0]));

    http
      .expectOne('https://api.example/api/sensorprofiles/profile-1/validate')
      .flush({ valid: false, errors: ['$.discovery.serviceUuid must be a UUID'] });

    expect(issue).toEqual({
      path: '$.discovery.serviceUuid',
      code: '',
      message: '$.discovery.serviceUuid must be a UUID',
    });
  });

  it('also accepts a structured {path, code, message} validation error shape', () => {
    let issue: { path: string; code: string; message: string } | undefined;
    service.validateDraft('profile-1').subscribe((result) => (issue = result.errors[0]));

    http.expectOne('https://api.example/api/sensorprofiles/profile-1/validate').flush({
      valid: false,
      errors: [{ path: '$.schemaVersion', code: 'invalid_schema_version', message: 'must equal 1' }],
    });

    expect(issue).toEqual({
      path: '$.schemaVersion',
      code: 'invalid_schema_version',
      message: 'must equal 1',
    });
  });

  it('sends bind keys only to the write-only device secret endpoint', () => {
    const value = '00112233445566778899aabbccddeeff';
    service.putDeviceSecret('sensor/id', 'bind_key', value).subscribe();

    const request = http.expectOne(
      'https://api.example/api/sensorprofiles/devices/sensor%2Fid/secrets/bind_key'
    );
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ value });
    request.flush(null);
  });
});
