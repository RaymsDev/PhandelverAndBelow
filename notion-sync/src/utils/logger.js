/**
 * Logger utility with colored output using chalk
 */
import chalk from 'chalk';
import ora from 'ora';

let verboseMode = false;
let spinner = null;

/**
 * Enable or disable verbose logging
 */
export function setVerbose(enabled) {
  verboseMode = enabled;
}

/**
 * Log an info message
 */
export function info(message) {
  console.log(chalk.blue('ℹ'), message);
}

/**
 * Log a success message
 */
export function success(message) {
  console.log(chalk.green('✓'), message);
}

/**
 * Log a warning message
 */
export function warn(message) {
  console.log(chalk.yellow('⚠'), message);
}

/**
 * Log an error message
 */
export function error(message) {
  console.error(chalk.red('✗'), message);
}

/**
 * Log a debug message (only in verbose mode)
 */
export function debug(message) {
  if (verboseMode) {
    console.log(chalk.gray('→'), message);
  }
}

/**
 * Start a spinner with a message
 */
export function startSpinner(message) {
  spinner = ora(message).start();
  return spinner;
}

/**
 * Update spinner text
 */
export function updateSpinner(message) {
  if (spinner) {
    spinner.text = message;
  }
}

/**
 * Stop spinner with success
 */
export function succeedSpinner(message) {
  if (spinner) {
    spinner.succeed(message);
    spinner = null;
  }
}

/**
 * Stop spinner with failure
 */
export function failSpinner(message) {
  if (spinner) {
    spinner.fail(message);
    spinner = null;
  }
}

/**
 * Stop spinner
 */
export function stopSpinner() {
  if (spinner) {
    spinner.stop();
    spinner = null;
  }
}

/**
 * Log a section header
 */
export function section(title) {
  console.log('\n' + chalk.bold.cyan(`━━━ ${title} ━━━`));
}

/**
 * Print a progress bar
 */
export function progress(current, total, item = '') {
  const percentage = Math.round((current / total) * 100);
  const bar = '█'.repeat(Math.round(percentage / 5));
  const empty = '░'.repeat(20 - Math.round(percentage / 5));

  process.stdout.write(
    `\r${chalk.cyan(bar)}${chalk.gray(empty)} ${percentage}% (${current}/${total}) ${item}`
  );

  if (current === total) {
    process.stdout.write('\n');
  }
}

/**
 * Log an error with stack trace
 */
export function errorWithStack(message, err) {
  error(message);
  if (verboseMode && err && err.stack) {
    console.error(chalk.red(err.stack));
  } else if (err && err.message) {
    console.error(chalk.red('  ', err.message));
  }
}

/**
 * Pretty print an object (debug mode only)
 */
export function debugObject(label, obj) {
  if (verboseMode) {
    console.log(chalk.gray(`→ ${label}:`), JSON.stringify(obj, null, 2));
  }
}
