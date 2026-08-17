# Grounded

Grounded is a wellness web application designed to help users build consistent habits through a calm, focused, and accessible interface.

The project is currently under active development. The frontend is complete, and the core backend (database, Prisma ORM, server-side data access, and Supabase authentication) is implemented.

## Preview

Screenshots and a live demo will be added after the first production deployment.

## Features

- Responsive wellness dashboard.
- Habit-focused user experience.
- Login interface with form validation.
- Responsive layout for mobile and desktop.
- Accessible keyboard navigation and visible focus states.
- Loading, empty, and error states.
- Component and end-to-end testing.
- Continuous integration with GitHub Actions.
- Lighthouse-validated frontend quality.

## Tech Stack

- Next.js (App Router, server actions)
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
- Prisma

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

The project also includes automated unit, component, and end-to-end tests. GitHub Actions runs formatting checks, linting, tests, Playwright tests, and the production build on every push.

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm

### Installation

Clone the repository and install the dependencies:

```bash
git clone <your-repository-url>
cd grounded-wellness-app
npm ci
```

### Environment variables

Create a `.env.local` file in the project root for local development:

```env
E2E_TEST_EMAIL=your-test-email
E2E_TEST_PASSWORD=your-test-password
```

For production builds (e.g., AWS Amplify), the build process creates a `.env.production` file that includes:

```env
DATABASE_URL=<your-production-database-url>
```

Do not commit `.env.local`, `.env.production`, or any file containing real credentials. These files are ignored by `.gitignore`.

Next.js loads environment variables according to the environment in which the application runs. Public variables intended for browser-side use must use the `NEXT_PUBLIC_` prefix. [Next.js environment variables](https://nextjs.org/docs/pages/guides/environment-variables)

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

Run Playwright tests:

```bash
npx playwright test
```

Install Playwright browsers when needed:

```bash
npx playwright install --with-deps chromium
```

## Project Status

The frontend is complete. The core backend (database schema, Prisma ORM, server-side data access, and Supabase authentication) is implemented.

Completed work includes:

- Responsive UI implementation.
- Accessible keyboard navigation.
- Form validation.
- Automated unit and component tests.
- End-to-end browser testing.
- GitHub Actions CI workflow.
- Lighthouse performance and accessibility audit (all scores 100).
- Database schema and migrations.
- Prisma ORM integration.
- Server-side data access logic.
- Supabase authentication (sign in, session management).

Next work includes:

- Expanding habit-tracking features and data-driven UI.
- Optional: sign-up flow, password recovery, and additional auth features.
- Production deployment and environment configuration.

## Deployment

The application is configured for deployment on AWS Amplify Hosting.

The deployment is connected to the project's GitHub repository. Automated builds are triggered by changes to the `main` branch using the `amplify.yml` build specification.

## License

This project is currently a personal portfolio project.
