export type NotificationRelativeTo = 'beginning' | 'end';

export interface SurveyNotificationDto {
  id?: string;
  order: number;
  relativeTo: NotificationRelativeTo;
  minutesBefore: number;
  rowVersion?: number;
}

export const DEFAULT_SURVEY_NOTIFICATIONS: SurveyNotificationDto[] = [
  { order: 0, relativeTo: 'beginning', minutesBefore: 0 },
  { order: 1, relativeTo: 'end', minutesBefore: 15 },
];
