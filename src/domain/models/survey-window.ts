export interface SurveyWindowActivityPoint {
  date: string;
  activeCount: number;
}

export interface AssignSurveyWindowRequest {
  respondentIds: string[];
  surveyStartDate: string | null;
  surveyEndDate: string | null;
}

export interface AssignSurveyWindowResponse {
  updated: number;
}
