export const environment = {
  production: false,
  APP_NAME_VERSION: 'OpenRadiation app 3.1 dev',
  API_KEY: '50adef3bdec466edc25f40c8fedccbce',
  API_URI: 'https://submit.open-radiation.net/measurements',
  IN_APP_BROWSER_URI: {
    base: 'https://request.open-radiation.net',
    suffix: 'openradiation',
  },
  mockDevice: false,
  isTestEnvironment: false,
  backgroundMeasureServerURL: 'http://background-measure-server-url.fr',
  backgroundMeasureThreshold: 50,
  backgroundMeasureStepDurationMinutes: 0.03,
  backgroundMeasureStepCountBeforeSending: 10,
};
