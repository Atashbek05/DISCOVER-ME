'use strict';

const LEVELS = { error: 0, warn: 1, info: 2, http: 3, debug: 4 };

const COLORS = {
  error: '\x1b[31m',  // red
  warn:  '\x1b[33m',  // yellow
  info:  '\x1b[36m',  // cyan
  http:  '\x1b[35m',  // magenta
  debug: '\x1b[37m',  // white
  reset: '\x1b[0m',
};

const currentLevel = LEVELS[process.env.LOG_LEVEL] ?? (process.env.NODE_ENV === 'production' ? LEVELS.warn : LEVELS.debug);

function log(level, ...args) {
  if (LEVELS[level] > currentLevel) return;
  const ts = new Date().toISOString();
  const prefix = `${COLORS[level]}[${ts}] [${level.toUpperCase()}]${COLORS.reset}`;
  // eslint-disable-next-line no-console
  console[level === 'http' ? 'log' : level](prefix, ...args);
}

const logger = {
  error: (...a) => log('error', ...a),
  warn:  (...a) => log('warn',  ...a),
  info:  (...a) => log('info',  ...a),
  http:  (...a) => log('http',  ...a),
  debug: (...a) => log('debug', ...a),
};

module.exports = logger;
