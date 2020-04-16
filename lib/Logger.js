const Sentry = require('@sentry/node');
const Severity = require('@sentry/types');

class Logger {
    constructor() {
        const sentryDsn = process.env.SENTRY_DSN;
        Sentry.init({dsn: sentryDsn});
    }

    info(message) {
        console.log(`[D] ${message}`);
    }

    warning(message) {
        console.warn(`[W] ${message}`);
        Sentry.captureMessage(message, Severity.Warning);
    }

    error(message) {
        console.error(`[E] ${message}`);
        Sentry.captureMessage(message, Severity.Error);
    }

    exception(exception) {
        console.error(`[E] ${exception}`);
        Sentry.captureException(exception);
    }
}

module.exports = Logger;
