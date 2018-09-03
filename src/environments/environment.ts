// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
export const environment = {
  production: false,
  APP_NAME_VERSION: 'OpenRadiation app 2.0.0 test',
  API_KEY: '50adef3bdec466edc25f40c8fedccbce',
  API_URI: 'https://submit.open-radiation.net/measurements',
  IN_APP_BROWSER_URI: {
    base: 'https://request.open-radiation.net',
    suffix: 'openradiation'
  }
};
