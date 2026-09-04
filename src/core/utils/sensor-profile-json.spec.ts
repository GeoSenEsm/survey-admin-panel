import {
  parseAndFormatProfileJson,
  summarizeProfile,
} from './sensor-profile-json';

describe('sensor profile JSON utilities', () => {
  it('formats an object profile', () => {
    const result = parseAndFormatProfileJson('{"operations":[]}');

    expect(result.error).toBeUndefined();
    expect(result.value).toEqual({ operations: [] });
    expect(result.formatted).toBe('{\n  "operations": []\n}');
  });

  it('rejects malformed and non-object JSON', () => {
    expect(parseAndFormatProfileJson('{"operations":').error).toBeTruthy();
    expect(parseAndFormatProfileJson('[]').error).toBe('profileMustBeObject');
  });

  it('summarizes profile operations by kind, splitting acquire steps by acquisition mode', () => {
    expect(
      summarizeProfile({
        transport: 'gatt_sequence',
        discovery: { exactName: 'sensor' },
        operations: [
          {
            kind: 'acquire',
            acquisition: { mode: 'read' },
            decoders: [{ type: 'uint8' }, { type: 'uint16' }],
          },
          {
            kind: 'acquire',
            acquisition: { mode: 'notification' },
            decoders: [{ type: 'uint8' }],
          },
          { kind: 'write' },
          { kind: 'delay' },
        ],
        goldenPackets: [{ characteristicUuid: 'abcd' }],
      })
    ).toEqual({
      transport: 'gatt_sequence',
      discoveryMatchers: 1,
      operations: { read: 1, notification: 1, write: 1, delay: 1 },
      decoders: 3,
      decoderId: undefined,
      objectMappings: 0,
      goldenVectors: 1,
    });
  });

  it('summarizes whitelisted advertisement decoding', () => {
    expect(
      summarizeProfile({
        transport: 'ble_advertisement',
        advertisement: {
          matcher: { serviceUuid: 'fe95' },
          decoderId: 'xiaomi_mibeacon_v4_v5',
          objects: [{ objectId: '1004', parameter: 'temperature', type: 'uint8' }],
        },
        goldenPackets: [],
      })
    ).toEqual(
      jasmine.objectContaining({
        transport: 'ble_advertisement',
        discoveryMatchers: 1,
        decoderId: 'xiaomi_mibeacon_v4_v5',
        objectMappings: 1,
      })
    );
  });
});
