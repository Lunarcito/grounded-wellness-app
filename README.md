# Grounded

Grounded is a wellness web application designed to help users build consistent habits through a calm, focused, and accessible interface.

The project is a portfolio MVP built with Next.js, Prisma, PostgreSQL, and Supabase Authentication. It supports user onboarding, daily wellness check-ins, habit tracking, streaks, dashboard progress metrics, and protected routes.

## Preview

Screenshots and a live demo will be added after the first production deployment.

## Features

- Responsive wellness dashboard.
- User onboarding with wellness goals and focus areas.
- Daily check-ins for mood, energy, sleep, stress, water, and movement.
- Habit creation, daily completion, streak tracking, and archiving.
- Dashboard metrics for recent check-ins, habit completion, active streaks, and average mood.
- Water and movement progress shown against the user's configured goals.
- Protected routes with Supabase Authentication.
- Loading, empty, and error states.
- Accessible keyboard navigation and visible focus states.
- Unit, component, and end-to-end browser tests.
- Continuous integration with GitHub Actions.
- Lighthouse-validated frontend quality.

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- React Hook Form
- Vitest
- React Testing Library
- Playwright
- Lighthouse
- GitHub Actions
- AWS Amplify Hosting
- Prisma ORM
- PostgreSQL
- Supabase Authentication

### Backend

- Supabase Auth
- PostgreSQL
- Prisma ORM

## Quality

The latest Lighthouse audit of the production build reported:

- Performance: 100
- Accessibility: 100
- Best Practices: 100
- SEO: 100

The project includes automated unit, component, and end-to-end tests. GitHub Actions runs formatting checks, linting, tests, Playwright tests, and the production build on every push.

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm
- A PostgreSQL database
- A Supabase project for authentication
- A dedicated test account for Playwright tests

### Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/Lunarcito/grounded-wellness-app.git
cd grounded-wellness-app
npm ci
```

### Environment variables

Create a `.env` file in the project root for local development:

```env
E2E_TEST_EMAIL=your-dedicated-test-email
E2E_TEST_PASSWORD=your-dedicated-test-password
```

The Playwright authentication setup reads `E2E_TEST_EMAIL` and `E2E_TEST_PASSWORD` from the environment. Use a dedicated test account and never commit real credentials.

At the moment, the repository uses `.env` rather than `.env.example`. If you create an example file later, keep only placeholder values in it and document the copy step separately.

Next.js environment variables are available on the server by default. Variables intended for browser-side use must use the `NEXT_PUBLIC_` prefix. Server-only secrets must not use that prefix. [Next.js environment variables](https://nextjs.org/docs/app/guides/environment-variables)

For AWS Amplify deployments, configure the required environment variables in the Amplify environment settings. Do not commit production environment files or real credentials. [AWS Amplify environment variables](https://docs.aws.amazon.com/amplify/latest/userguide/environment-variables.html)

Confirm that `.env` and other environment files are ignored by `.gitignore` before committing changes.

### Database setup

Apply the Prisma migrations to the configured database:

```bash
npx prisma migrate deploy
```

For local development, use the appropriate migration command for your workflow. Do not run destructive database commands against a production database.

### Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The root route redirects users to the login page.

### Run the production build locally

```bash
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000).

## Testing

Run formatting checks:

```bash
npm run format:check
```

Run linting:

```bash
npm run lint
```

Run unit and component tests:

```bash
npm run test:run
```

Run all Playwright tests:

```bash
npx playwright test
```

Run a specific Playwright test file:

```bash
npx playwright test e2e/habits.spec.ts
```

Install the Playwright Chromium browser when needed:

```bash
npx playwright install --with-deps chromium
```

Open the Playwright HTML report after a test run:

```bash
npx playwright show-report
```

## Project Status

Grounded is an active portfolio MVP. The core application flow is implemented:

- User authentication with Supabase.
- Protected routes and session handling.
- User onboarding.
- Daily wellness check-ins.
- Habit creation, completion, streaks, and archiving.
- Dashboard activity and progress metrics.
- Prisma schema, migrations, and server-side data access.
- Automated unit, component, and end-to-end tests.
- GitHub Actions CI workflow.
- Lighthouse audit with all reported scores at 100.

Potential future work includes:

- Expanding habit-tracking features and data-driven UI.
- Historical wellness trends and review views.
- Production screenshots and live demo documentation.

## Deployment

The application is configured for deployment on AWS Amplify Hosting.

The deployment is connected to the project's GitHub repository. Automated builds are triggered by changes to the `main` branch using the `amplify.yml` build specification.

Production environment variables must be configured through the hosting provider and must not be committed to the repository.

## License

This project is currently a personal portfolio project.
