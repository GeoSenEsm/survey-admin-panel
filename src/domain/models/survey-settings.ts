export interface SurveySettings {
  showSendingPolicyCalendar: boolean;
  csvColumnSeparator: string;
  csvDecimalSeparator: string;
}

export const DEFAULT_SURVEY_SETTINGS: SurveySettings = {
  showSendingPolicyCalendar: true,
  csvColumnSeparator: ',',
  csvDecimalSeparator: '.',
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
