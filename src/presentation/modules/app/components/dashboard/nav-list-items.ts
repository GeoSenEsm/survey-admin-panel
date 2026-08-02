export interface NavListItem {
  display: string;
  matIcon: string;
  link: string;
}

export function getNavListItems(): NavListItem[] {
  return [
    {
      display: 'app.dashboard.configuration',
      matIcon: 'settings',
      link: 'configuration',
    },
    {
      display: 'app.dashboard.surveySettings',
      matIcon: 'tune',
      link: 'surveySettings',
    },
    {
      display: 'app.dashboard.contactPhoneNumbers',
      matIcon: 'phone',
      link: 'contactPhoneNumbers',
    },
    {
      display: 'app.dashboard.startSurvey',
      matIcon: 'list',
      link: 'startSurvey',
    },
    {
      display: 'app.dashboard.respondents',
      matIcon: 'group',
      link: 'respondents',
    },
    {
      display: 'app.dashboard.issues',
      matIcon: 'report_problem',
      link: 'issues',
    },
    {
      display: 'app.dashboard.surveyWindow',
      matIcon: 'date_range',
      link: 'surveyWindow',
    },
    {
      display: 'app.dashboard.surveys',
      matIcon: 'content_paste',
      link: 'surveys',
    },
    {
      display: 'app.dashboard.createSurvey',
      matIcon: 'add_box',
      link: 'surveys/new',
    },
    {
      display: 'app.dashboard.results',
      matIcon: 'bar_chart',
      link: 'summaries',
    },
    {
      display: 'app.dashboard.responseDocuments',
      matIcon: 'description',
      link: 'responseDocuments',
    },
    {
      display: 'app.dashboard.statistics',
      matIcon: 'insights',
      link: 'statistics',
    },
    {
      display: 'app.dashboard.dailyCompletion',
      matIcon: 'view_module',
      link: 'dailyCompletion',
    },
    {
      display: 'app.dashboard.temepratureSensors',
      matIcon: 'device_thermostat',
      link: 'temperature',
    },
    {
      display: 'app.dashboard.sensorDevices',
      matIcon: 'bluetooth',
      link: 'sensorDevices'
    },
    {
      display: 'app.dashboard.map',
      matIcon: 'map',
      link: 'map',
    },
  ];
}
