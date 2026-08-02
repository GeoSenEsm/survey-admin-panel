# survey-admin-panel

Angular admin portal for GeoSenEsm researchers. Configure surveys, manage
respondents, review results, statistics, daily completion, issues, and
download response documents from the backend. On each survey's sending-policy
tab you can also configure phone notification rules (count and timing relative
to the beginning or end of each time slot).

| | |
|---|---|
| Stack | Angular 17, Angular Material, Leaflet / ngx-leaflet, echarts / ngx-charts / chart.js, ngx-translate, papaparse |
| Dev server | `http://localhost:4200` |
| Docker port | `80` (nginx) |
| Backend | `survey-api` (`API_URL` / `config.json` → `apiUrl`) |
| Sibling clients | `mobile-app` (respondent) |

---

## Repository contents

| Path | Purpose |
|---|---|
| `src/presentation/` | Angular modules, routes, feature components (dashboard tabs) |
| `src/core/` | HTTP services, mappers, guards, utils, injection tokens |
| `src/domain/` | Models and `external_services` interfaces |
| `src/assets/config/config.json` | Runtime API base URL (`apiUrl`) and map provider |
| `src/assets/i18n/` | ngx-translate language files (keep all locales in sync) |
| `nginx.conf` / `start-admin-panel.sh` | Docker: nginx + rewrite of `apiUrl` from `API_URL` |
| `Dockerfile` | Production image (listens on `80`) |
| `angular.json` / `package.json` | Angular CLI project config |

### Source layout

```
src/
├── presentation/   UI — components, templates, dashboard navigation
├── core/           Services (extend ApiService), mappers, guards, tokens
├── domain/         Models + service contracts (external_services)
└── assets/         config.json, i18n, static assets
```

Components must not call `HttpClient` directly — inject a service from
`core/services/` that implements a `domain/external_services` interface.
Register new services in `prodivers.ts` / injection tokens.

### Main dashboard areas

Grouped sidenav categories:

| Category | Items |
|---|---|
| Settings | Survey settings, Research area (`/researchArea`), Contact numbers |
| Respondents | Respondent list, Survey dates |
| Statistics | Daily completion, Issues, Statistics |
| Sensors | Sensors data, Sensor devices |
| Results | Map, Results, Response documents |
| Surveys | Surveys, Create survey, Initial survey |

---

## Local development

### Prerequisites

- Node.js 20+ and npm
- Running `survey-api` on `http://localhost:8080` (or update `apiUrl`)

### Install and run

```bash
npm install --force
npm start                 # or: ng serve
```

Open `http://localhost:4200`. Hot reload is enabled.

Ensure the backend `ALLOWED_ORIGINS` includes `http://localhost:4200`
(or leave it unset to allow `*`).

### Point at a backend

Edit `src/assets/config/config.json`:

```json
{
  "apiUrl": "http://localhost:8080",
  "mapProvider": "openstreetmap"
}
```

`mapProvider` accepts `openstreetmap` or `baidu`.

### Preferred full stack

From the workspace root:

```powershell
./scripts/dev-up.ps1
```

See `../scripts/README.md`.

### Build

```bash
ng build
```

Artifacts are written to `dist/`.

### Tests

```bash
ng test                   # Karma unit tests
```

End-to-end testing requires an additional e2e package; none is wired by
default. Use `ng help` or the [Angular CLI docs](https://angular.io/cli)
for generator and tooling reference.

---

## Docker image

```bash
docker build -t survey-admin-panel:<tag> .
docker run -p 8081:80 -e API_URL=http://host.docker.internal:8080 survey-admin-panel:<tag>
```

| Variable | Purpose | Default |
|---|---|---|
| `API_URL` | Backend base URL written into `config.json` at container start | `http://localhost:8080` |

The container listens on port `80`.
