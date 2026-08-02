export type SensorIntegrationMode =
  | 'profile'
  | 'native'
  | 'manual'
  | 'none';

export type SensorProfileRevisionStatus = 'draft' | 'published' | 'archived';
export type SensorProfileTransport = 'gatt_sequence' | 'ble_advertisement';
export type GattProfileOperationKind =
  | 'write'
  | 'delay'
  | 'acquire';
export type AdvertisementDecoderId = 'xiaomi_mibeacon_v4_v5';

export interface GattProfileOperation {
  kind: GattProfileOperationKind;
  serviceUuid?: string;
  characteristicUuid?: string;
  payloadHex?: string;
  timeoutMs?: number;
  durationMs?: number;
  acquisition?: { mode: 'read' | 'notification' | 'indication'; timeoutMs?: number; maxPackets?: number };
  frame?: { length?: number; prefixHex?: string; checksum?: string };
  assertions?: { offset: number; equals: number[] }[];
  decoders?: unknown[];
}

export interface AdvertisementObjectMapping {
  objectId: string;
  parameter: string;
  type: 'uint8' | 'bool';
  values?: Record<string, string>;
}

export interface GattSequenceProfileSpecification {
  transport: 'gatt_sequence';
  discovery: unknown;
  operations: GattProfileOperation[];
  goldenPackets: unknown[];
}

export interface BleAdvertisementProfileSpecification {
  transport: 'ble_advertisement';
  advertisement: {
    matcher: unknown;
    decoderId: AdvertisementDecoderId;
    objects: AdvertisementObjectMapping[];
  };
  requiredSecrets?: 'bind_key'[];
  goldenPackets: unknown[];
}

export type SensorProfileSpecification =
  | GattSequenceProfileSpecification
  | BleAdvertisementProfileSpecification;

export interface SensorProfileCapabilities {
  supportedSchemaVersions: number[];
  currentEngineVersion: string;
  supportedAdapterKeys: string[];
  supportedTransports?: SensorProfileTransport[];
  supportedGattOperations?: GattProfileOperationKind[];
  supportedAdvertisementDecoders?: AdvertisementDecoderId[];
}


export interface SensorProfileSensorType {
  id: string;
  code: string;
  name: string;
  integrationMode: SensorIntegrationMode;
  adapterKey?: string | null;
}

export interface CreateSensorProfileTypeRequest {
  code: string;
  name: string;
  integrationMode: SensorIntegrationMode;
  adapterKey?: string | null;
}

export interface SensorProfileDraftRequest {
  minEngineVersion: string;
  spec: unknown;
}

export interface SensorProfileRevision {
  id: string;
  sensorTypeId: string;
  sensorTypeCode: string;
  schemaVersion: number;
  revision: number;
  status: SensorProfileRevisionStatus;
  spec: unknown;
  specHash?: string | null;
  minEngineVersion: string;
  readOnly: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  rowVersion?: string;
}

export interface SensorProfileValidationIssue {
  path: string;
  code: string;
  message: string;
}

export interface SensorProfileGoldenVectorResult {
  name: string;
  passed: boolean;
  errors: SensorProfileValidationIssue[];
  decodedValues: Record<string, number>;
}

export interface SensorProfileValidationResult {
  valid: boolean;
  canonicalHash?: string;
  errors: SensorProfileValidationIssue[];
  goldenVectors: SensorProfileGoldenVectorResult[];
}
