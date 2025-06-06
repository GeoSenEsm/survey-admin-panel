# SurveyAdminPanel

## Build docker image

You are able to build a docker image with this application simply by runnning 

```bash
docker build -t your_image_name:your_tag .
```

The interenal docker image port, the applicatoin is listening on, is `80`.

### Environmental variables

In the docker container, you can configure an `API_URL` environmental variable. It is responsible for configuring a URL of the backend server.
By default it is set to `http://localhost:8080`.

## Install dependencies 

```
npm install --force
```

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.2.2.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
