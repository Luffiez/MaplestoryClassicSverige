# MaplestoryClassicWeb

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.24.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

The development configuration runs in dev mode. Discord authorization is bypassed and player requests use the fixtures in `src/app/mocks/mock-users.ts`, so the backend does not need to be running. Production builds disable dev mode and use the real Discord and backend integrations.

In production, member presence is refreshed every 30 seconds and members are shown as online for up to two minutes after their latest authenticated heartbeat.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## GitHub Pages deployment

Pushing to `master` builds the production site and publishes the generated files to the `gh-pages` branch. Configure GitHub Pages to deploy from the `gh-pages` branch, using the root folder.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
