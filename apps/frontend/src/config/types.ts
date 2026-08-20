export interface FrontendPublicConfig {
  app: {
    name: string;
    environment: string;
  };
  api: {
    baseUrl: string;
  };
  media: {
    /** Origin that serves images and video. Empty means they are served from this app. */
    baseUrl: string;
  };
  sentry: {
    dsn: string;
  };
  google: {
    clientId: string;
  };
}
