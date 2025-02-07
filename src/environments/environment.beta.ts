export const environment = {
  production: true,
  APP_NAME_VERSION: 'OpenRadiation app 3.1 beta',
  API_KEY: '50adef3bdec466edc25f40c8fedccbce',
  API_URI: 'https://submit.openradiation.preprod.ul2i.fr/measurements',
  IN_APP_BROWSER_URI: {
    base: 'https://request.openradiation.preprod.ul2i.fr',
    suffix: 'openradiation',
  },
  mockDevice: false,
  isTestEnvironment: false,
  backgroundMeasureServerURL: 'http://background-measure-server-url.fr',
  backgroundMeasureThreshold: 50,
  backgroundMeasureStepDurationMinutes: 0.03,
  backgroundMeasureStepCountBeforeSending: 10,
};
