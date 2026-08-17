import { SensorIntegrationMode } from './sensor-profile';

export interface SurveySettings {
  showSendingPolicyCalendar: boolean;
  csvColumnSeparator: string;
  csvDecimalSeparator: string;
  logoPath: string | null;
}

export interface SensorParameterSource {
  id?: string;
  sensorTypeCode: string;
  rawParameterCode: string;
}

export interface SensorParameterDefinition {
  id?: string;
  code: string;
  name: string;
  dataType: string;
  unit?: string;
  displayOrder: number;
  sources: SensorParameterSource[];
}

/** Write payload for `POST /api/surveysettings/sensordata/parameters`. */
export interface CreateSensorParameterDefinitionRequest {
  code: string;
  name: string;
  dataType: string;
  unit?: string | null;
}

/**
 * Write payload for `PUT /api/surveysettings/sensordata/parameters/{id}`. `code` is immutable
 * once created — it's the wire-format identity referenced by stored readings, GATT profile
 * specs, and the mobile app.
 */
export interface EditSensorParameterDefinitionRequest {
  name: string;
  dataType: string;
  unit?: string | null;
  displayOrder: number;
}

export interface SensorTypeSetting {
  id?: string;
  sensorTypeCode: string;
  sensorTypeName?: string;
  enabled: boolean;
  connectionTimeoutSeconds: number;
  displayOrder: number;
  integrationMode?: SensorIntegrationMode;
  adapterKey?: string | null;
}

export interface SurveySensorDataSettings {
  mode: 'no_sensor_data' | 'configured_sensors';
  sensorTypes: SensorTypeSetting[];
  parameters: SensorParameterDefinition[];
}

/**
 * Write payload for `PUT /api/surveysettings/sensordata`. Only `mode` and `sensorTypes` are
 * bulk-replaced here. Which physical sensor a respondent has is managed separately, via the
 * Sensor devices screen (`PUT /api/sensormac/{sensorId}/respondent`), and stays editable
 * throughout a live study. `parameters` are also excluded: "used sensor data" parameters are now
 * created/edited one at a time (`POST`/`PUT /api/surveysettings/sensordata/parameters[/{id}]`)
 * and wired via a sensor type's raw parameter catalog
 * (`/api/sensorprofiles/types/{sensorTypeId}/parameters`), not as part of this bulk replace.
 */
export type SurveySensorDataSettingsWrite = Pick<SurveySensorDataSettings, 'mode' | 'sensorTypes'>;

export const DEFAULT_SURVEY_SETTINGS: SurveySettings = {
  showSendingPolicyCalendar: true,
  csvColumnSeparator: ',',
  csvDecimalSeparator: '.',
  logoPath: null,
};

export const DEFAULT_SENSOR_DATA_SETTINGS: SurveySensorDataSettings = {
  mode: 'no_sensor_data',
  sensorTypes: [],
  parameters: [],
};

export const CSV_COLUMN_SEPARATOR_OPTIONS: { value: string; labelKey: string }[] = [
  { value: ',', labelKey: 'surveySettings.csvSeparatorComma' },
  { value: ';', labelKey: 'surveySettings.csvSeparatorSemicolon' },
  { value: '|', labelKey: 'surveySettings.csvSeparatorPipe' },
  { value: '\t', labelKey: 'surveySettings.csvSeparatorTab' },
];

export const CSV_DECIMAL_SEPARATOR_OPTIONS: { value: string; labelKey: string }[] = [
  { value: '.', labelKey: 'surveySettings.csvDecimalDot' },
  { value: ',', labelKey: 'surveySettings.csvDecimalComma' },
];

/**
 * The full set of `sensor_parameter_definition.data_type` values understood by the mobile
 * app and admin panel. Kept as a closed list (rather than free text) so an admin cannot save
 * a value the rest of the platform does not know how to render or export.
 */
export const SENSOR_PARAMETER_DATA_TYPE_OPTIONS: { value: string; labelKey: string }[] = [
  { value: 'decimal', labelKey: 'surveySettings.sensorData.dataTypes.decimal' },
  { value: 'integer', labelKey: 'surveySettings.sensorData.dataTypes.integer' },
  { value: 'boolean', labelKey: 'surveySettings.sensorData.dataTypes.boolean' },
  { value: 'text', labelKey: 'surveySettings.sensorData.dataTypes.text' },
];
