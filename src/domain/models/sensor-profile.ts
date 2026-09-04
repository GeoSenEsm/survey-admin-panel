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

export interface SensorProfileTemplate {
  code: string;
  name: string;
  parameterCodes: string[];
  installed: boolean;
}

export interface CreateSensorProfileTypeRequest {
  code: string;
  name: string;
  integrationMode: SensorIntegrationMode;
  adapterKey?: string | null;
}

/**
 * A sensor type's own raw parameter catalog: what that sensor type can possibly produce,
 * independent of whether it has been promoted ("used") into "used sensor data" yet
 * (`SensorParameterDefinition` in `survey-settings.ts`). Unlike a used parameter, `(name, unit)`
 * is not unique here — the same reading can appear under different sensor types with no conflict.
 */
export interface SensorTypeParameter {
  id: string;
  sensorTypeId: string;
  sensorTypeCode: string;
  code: string;
  name: string;
  dataType: string;
  unit?: string | null;
  usedParameterId?: string | null;
  usedParameterCode?: string | null;
}

/** Write payload for `POST /api/sensorprofiles/types/{sensorTypeId}/parameters`. */
export interface CreateSensorTypeParameterRequest {
  code: string;
  name: string;
  dataType: string;
  unit?: string | null;
}

/**
 * Write payload for `PUT /api/sensorprofiles/types/{sensorTypeId}/parameters/{id}`. `code` is
 * immutable once created — delete and recreate the row if it was wrong.
 */
export interface EditSensorTypeParameterRequest {
  name: string;
  dataType: string;
  unit?: string | null;
}

/**
 * Write payload for `POST /api/sensorprofiles/types/{sensorTypeId}/parameters/{id}/use` —
 * promotes a raw catalog row into "used sensor data". Set `usedParameterId` to link to an
 * already-used parameter (adding a fallback source); leave it unset and provide
 * `name`/`dataType`/`unit` to create a new used parameter instead.
 */
export interface UseSensorTypeParameterRequest {
  usedParameterId?: string | null;
  name?: string;
  dataType?: string;
  unit?: string | null;
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
