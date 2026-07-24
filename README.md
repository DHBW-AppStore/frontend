# Frontend

[![Coverage](https://img.shields.io/endpoint?url=https://six7-click-n-deploy.github.io/frontend/badge.json)](https://six7-click-n-deploy.github.io/frontend/)

Vue 3 SPA für den App Store. Studierende und Dozierende verwalten hier Apps, deployen sie auf OpenStack und sehen ihre Deployments.

## Setup

Dieses Repository wird nicht eigenständig gestartet. Der gesamte Stack — inklusive Frontend — wird über das deployment-Repository hochgefahren. Vollständige Anleitung: [deployment/README.md](https://github.com/six7-click-n-deploy/deployment#readme).

Voraussetzung für alle folgenden Befehle: `make dev-up` aus dem `deployment/`-Verzeichnis wurde ausgeführt und der Stack läuft.

## Entwicklung

Alle `make`-Befehle werden aus dem `deployment/`-Verzeichnis des [deployment-Repos](https://github.com/six7-click-n-deploy/deployment) ausgeführt — dort liegt das Makefile.

```bash
# in app-store/deployment
make dev-restart-frontend   # Frontend-Container neu starten
make dev-logs-frontend      # Frontend-Logs verfolgen
make shell-frontend         # interaktive Shell im Container
```

Lint, Type-Check und Tests werden im Frontend-Container ausgeführt — `make shell-frontend` öffnet eine Shell, in der die üblichen `npm run lint`, `npm run type-check`, `npm run test:unit` und `npm run build` zur Verfügung stehen.

## Technologie-Stack

- **Vue 3** mit Composition API und TypeScript
- **Pinia** für globalen State
- **Vue Router** mit Auth-Guards
- **Axios** mit Keycloak-Bearer-Interceptor
- **Tailwind CSS** für Styling
- **vue-i18n** für Mehrsprachigkeit (DE/EN)
- **oidc-client-ts** für Keycloak-Login

## Code-Struktur

Der Code liegt in `src/`. Der typische Datenfluss: eine **View** ruft einen **Store** (Pinia), der Store spricht über einen **API-Layer** mit dem Backend, und `api/axios.ts` hängt automatisch den Keycloak-Bearer-Token an jeden Request.

```
src/
├── main.ts        # App-Bootstrap (Pinia, Router, i18n)
├── views/         # Seiten (Route-Ziele), z.B. Deployment-Wizard, App-Katalog
├── layouts/       # Rahmen-Layouts (App/Auth/User), per Route-Meta gewählt
├── components/    # Wiederverwendbare Komponenten; ui/ = generische Bausteine
├── stores/        # Pinia-Stores: globaler State + Aktionen (*.store.ts)
├── api/           # HTTP-Layer, ein File pro Ressource (*.api.ts) + axios.ts
├── composables/   # Wiederverwendbare Logik (use*), z.B. Auth, SSE-Stream
├── services/      # Nicht-UI-Dienste (aktuell: auth.service für Keycloak)
├── router/        # Vue-Router-Definition + Auth-Guards (requiresAuth/requiresGuest)
├── types/         # TypeScript-Typen (OpenStack-Credentials, Quota, ...)
├── utils/         # Helfer (clouds-yaml-Parsing, Formatierung, HTTP-Fehler)
└── i18n/          # vue-i18n Setup + Locales (DE/EN)
```

> Die `.d.ts`-Dateien neben den `.ts` sind generierte Type-Declarations (Build-Artefakte), kein handgeschriebener Code.

**Zentrale Mechanismen:**

| Datei | Zweck |
|---|---|
| `api/axios.ts` | Request-Interceptor hängt `Authorization: Bearer <token>` an; Response-Interceptor behandelt 401 |
| `stores/auth.store.ts` | Login-State, Rollen (student/teacher/admin) |
| `composables/useKeycloak.ts` | OIDC-Login/Logout via `oidc-client-ts` |
| `composables/useDeploymentStream.ts` | Abonniert den SSE-Live-Status eines Deployments |
| `router/index.ts` | Routen + Guards, Layout-Wahl über `meta.layout` |

**views/** — Kern ist der mehrstufige Deployment-Wizard (`NewDeploymentConfigView` → `…VariableView` → `…GroupsAssignmentView` → `…SummaryView`), dazu App-Katalog (`AppsView`/`AppsDetailView`), Deployments (`DeploymentsView`/`DeploymentDetailView`), Kurse, Dashboard und Settings.

**api/ ↔ stores/** — spiegeln sich paarweise: zu jeder Ressource gibt es ein `*.api.ts` (reine HTTP-Calls) und meist einen `*.store.ts` (State + Aktionen, ruft den API-Layer). Beispiele: `deployment`, `app`, `course`, `team`, `user`, `credentials`.

## Mehr

- Architektur und projektübergreifende Doku: [.github-Repo](https://github.com/six7-click-n-deploy/.github)
- API-Docs (Backend Swagger): http://localhost:8000/docs (nach `make dev-up`)
