export interface NavListItem {
  display: string;
  matIcon: string;
  link: string;
}

export interface NavGroup {
  display: string;
  matIcon: string;
  children: NavListItem[];
}

export type NavEntry = NavListItem | NavGroup;

export function isNavGroup(entry: NavEntry): entry is NavGroup {
  return 'children' in entry;
}

export function getNavListItems(): NavEntry[] {
  return [
    {
      display: 'app.dashboard.navCategory.settings',
      matIcon: 'settings',
      children: [
        {
          display: 'app.dashboard.surveySettings',
          matIcon: 'tune',
          link: 'surveySettings',
        },
        {
          display: 'app.dashboard.researchArea',
          matIcon: 'place',
          link: 'researchArea',
        },
        {
          display: 'app.dashboard.contactPhoneNumbers',
          matIcon: 'phone',
          link: 'contactPhoneNumbers',
        },
      ],
    },
    {
      display: 'app.dashboard.navCategory.respondents',
      matIcon: 'group',
      children: [
        {
          display: 'app.dashboard.respondentList',
          matIcon: 'group',
          link: 'respondents',
        },
        {
          display: 'app.dashboard.surveyWindow',
          matIcon: 'date_range',
          link: 'surveyWindow',
        },
      ],
    },
    {
      display: 'app.dashboard.navCategory.statistics',
      matIcon: 'insights',
      children: [
        {
          display: 'app.dashboard.dailyCompletion',
          matIcon: 'view_module',
          link: 'dailyCompletion',
        },
        {
          display: 'app.dashboard.issues',
          matIcon: 'report_problem',
          link: 'issues',
        },
        {
          display: 'app.dashboard.statistics',
          matIcon: 'insights',
          link: 'statistics',
        },
      ],
    },
    {
      display: 'app.dashboard.navCategory.sensors',
      matIcon: 'device_thermostat',
      children: [
        {
          display: 'app.dashboard.temepratureSensors',
          matIcon: 'device_thermostat',
          link: 'temperature',
        },
        {
          display: 'app.dashboard.sensorDevices',
          matIcon: 'bluetooth',
          link: 'sensorDevices',
        },
      ],
    },
    {
      display: 'app.dashboard.navCategory.results',
      matIcon: 'bar_chart',
      children: [
        {
          display: 'app.dashboard.map',
          matIcon: 'map',
          link: 'map',
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
      ],
    },
    {
      display: 'app.dashboard.navCategory.surveys',
      matIcon: 'content_paste',
      children: [
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
          display: 'app.dashboard.startSurvey',
          matIcon: 'list',
          link: 'startSurvey',
        },
      ],
    },
  ];
}

export function navGroupContainsLink(group: NavGroup, url: string): boolean {
  return group.children.some(
    (child) => url === `/${child.link}` || url.startsWith(`/${child.link}/`)
  );
}
