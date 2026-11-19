# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Keep presentation, logic, and data responsibilities in their existing tiers. The React components use the shared API client and provide loading, empty, and accessible error states. Express routes delegate business rules to the service layer, and Mongoose models own persisted data shape and references. Do not add authentication in this exercise.

- Presentation tier decision: Keep the four capability pages as separate React components. Use relative `/api` requests through the shared client so Vite's proxy remains the default; render API data and clear loading, empty, and failure states.
- Logic tier decision: Keep routes thin and put validation, persistence orchestration, scoring, ranking, and suggestion selection in `octofitService`. Return deliberate 4xx responses for invalid input or missing resources rather than leaking database cast errors as 500s.
- Data tier decision: Define required fields and user/team references in the Mongoose models. Seed representative users, teams, activities, and workouts idempotently; preserve unrelated records and existing team membership when seeding.
- Activity tracking approach: Validate the activity payload, ensure its user and team IDs are well-formed and refer to existing records, and award one point per submitted minute on the server. Persist and return the user, team, type, minutes, points, and occurrence date.
- Team management approach: Create and list teams with their submitted names and mascots and member references. Require a name, and default an omitted member list to an empty array.
- Leaderboard approach: Sum activity points by team, order teams by total points descending, and assign ranks starting at 1.
- Workout suggestions approach: Find the user by email, rank workouts matching their fitness goal first and otherwise use their most recent activity pattern, and include a reason for the first suggestion. Return a 4xx response when no user matches.

## Test plan

Run the focused contract suites first, then build both applications. The backend API suite uses an in-memory MongoDB; the frontend suite stubs network responses, so these checks do not require the local MongoDB or running API/frontend servers.

- `npm run test:data --prefix octofit-tracker/backend` — checks model requirements, defaults, references, and that seeding creates representative data idempotently without removing unrelated records. Failures point to a schema or seed-data contract regression.
- `npm run test:api --prefix octofit-tracker/backend` — checks activity and team creation/listing, invalid-input responses, leaderboard totals/order/ranks, and user-specific workout suggestions. Failures point to route, service, persistence, or response-contract behavior; a 5xx for invalid input is also a failure.
- `npm test --prefix octofit-tracker/frontend` — checks that each capability renders returned data and meaningful loading, empty, and accessible error states, and that workouts request suggestions for the expected user. Failures point to component rendering or API-client integration.
- `npm run build --prefix octofit-tracker/backend` — runs the backend TypeScript check. A failure indicates a backend type or compile-time contract issue.
- `npm run build --prefix octofit-tracker/frontend` — runs the frontend TypeScript check and Vite production build. A failure indicates a frontend type, import, or bundling issue.
