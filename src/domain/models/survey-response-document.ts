export interface SurveyResponseDocumentSelectedOption {
  optionId: string;
  label: string;
}

export interface SurveyResponseDocumentAnswer {
  questionId: string;
  questionContent: string;
  questionType: string;
  selectedOptions: SurveyResponseDocumentSelectedOption[];
  numericAnswer: number | null;
  yesNoAnswer: boolean | null;
  textAnswer: string | null;
}

export interface SurveyResponseDocumentSensorReading {
  dateTime: string;
  temperature: number;
  humidity: number;
}

export interface SurveyResponseDocument {
  participationId: string;
  surveyId: string;
  surveyName: string;
  respondentId: string;
  respondentUsername: string;
  participationDate: string;
  surveyStartDate: string;
  surveyFinishDate: string;
  answers: SurveyResponseDocumentAnswer[];
  sensorData: SurveyResponseDocumentSensorReading | null;
  persistedAt: string;
}

export interface SurveyResponseDocumentFilter {
  surveyId?: string;
  respondentId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page: number;
  size: number;
}

export interface PagedResponseDocuments {
  content: SurveyResponseDocument[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
