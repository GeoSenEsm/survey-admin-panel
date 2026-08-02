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
  priorityOrder: number;
}

export interface SensorParameterDefinition {
  id?: string;
  code: string;
  name: string;
  dataType: string;
  unit?: string;
  required: boolean;
  active: boolean;
  displayOrder: number;
  sources: SensorParameterSource[];
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

export interface RespondentSensorAssignment {
  id?: string;
  respondentId: string;
  respondentUsername?: string;
  sensorTypeCode: string;
  sensorTypeName?: string;
  sensorMacId?: string;
  sensorId?: string;
  sensorMac?: string;
  enabled: boolean;
  priorityOrder: number;
}

export interface SurveySensorDataSettings {
  mode: 'no_sensor_data' | 'configured_sensors';
  sensorTypes: SensorTypeSetting[];
  parameters: SensorParameterDefinition[];
  assignments: RespondentSensorAssignment[];
}

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
  assignments: [],
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
