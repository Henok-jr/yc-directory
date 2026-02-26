import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://16e05dafef70455d6324c59c80c7fab6@o4510896988880896.ingest.us.sentry.io/4510896998121472",

  integrations: [
    Sentry.replayIntegration(),
    Sentry.feedbackIntegration({
      colorScheme: "system",
      // Keep the feedback button visible but avoid overlapping the fixed Views badge
      buttonLabel: "Report bug",
      buttonPosition: "bottom-left",
    }),
  ],

  // Performance monitoring
  tracesSampleRate: 1,

  // Enable logs
  enableLogs: true,

  // Session Replay sampling
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Send PII
  sendDefaultPii: true,
});

export const onRouterTransitionStart =
  Sentry.captureRouterTransitionStart;