/**
 * Centralized logging utility for Rampante
 * 
 * Provides consistent logging interface with different levels:
 * - info: General information messages
 * - success: Success messages with ✅ prefix  
 * - warn: Warning messages with ⚠️ prefix
 * - error: Error messages with ❌ prefix
 * - debug: Debug messages (only shown in debug mode)
 */

export interface LoggerOptions {
  debug?: boolean;
  silent?: boolean;
}

export class Logger {
  private options: LoggerOptions;

  constructor(options: LoggerOptions = {}) {
    this.options = {
      debug: false,
      silent: false,
      ...options,
    };
  }

  /**
   * Log informational message
   */
  info(message: string): void {
    if (!this.options.silent) {
      console.log(message);
    }
  }

  /**
   * Log success message with checkmark
   */
  success(message: string): void {
    if (!this.options.silent) {
      console.log(`✅ ${message}`);
    }
  }

  /**
   * Log warning message
   */
  warn(message: string): void {
    if (!this.options.silent) {
      console.warn(`⚠️  ${message}`);
    }
  }

  /**
   * Log error message
   */
  error(message: string): void {
    if (!this.options.silent) {
      console.error(`❌ ${message}`);
    }
  }

  /**
   * Log debug message (only in debug mode)
   */
  debug(message: string): void {
    if (!this.options.silent && this.options.debug) {
      console.log(`🐛 DEBUG: ${message}`);
    }
  }

  /**
   * Create a scoped logger with a prefix
   */
  scope(prefix: string): ScopedLogger {
    return new ScopedLogger(this, prefix);
  }

  /**
   * Log dry-run activation notice
   */
  dryRunActivated(context?: Record<string, unknown>): void {
    if (!this.options.silent) {
      const contextInfo = context ? 
        ` | ${Object.entries(context).map(([k, v]) => `${k}: ${v}`).join(', ')}` : 
        '';
      console.log(`🔍 DRY RUN MODE: No execution, generating prompts only${contextInfo}`);
    }
  }
}

export class ScopedLogger {
  constructor(
    private logger: Logger,
    private prefix: string,
  ) {}

  info(message: string): void {
    this.logger.info(`[${this.prefix}] ${message}`);
  }

  success(message: string): void {
    this.logger.success(`[${this.prefix}] ${message}`);
  }

  warn(message: string): void {
    this.logger.warn(`[${this.prefix}] ${message}`);
  }

  error(message: string): void {
    this.logger.error(`[${this.prefix}] ${message}`);
  }

  debug(message: string): void {
    this.logger.debug(`[${this.prefix}] ${message}`);
  }

  /**
   * Log dry-run activation notice with scope prefix
   */
  dryRunActivated(context?: Record<string, unknown>): void {
    const scopedContext = { scope: this.prefix, ...context };
    this.logger.dryRunActivated(scopedContext);
  }
}

// Default logger instance
export const logger = new Logger();

/**
 * Enhanced error class with additional context
 */
export class RampanteError extends Error {
  constructor(
    message: string,
    public code?: string,
    public context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'RampanteError';
  }

  /**
   * Create error with context
   */
  static withContext(
    message: string,
    context: Record<string, unknown>,
    code?: string,
  ): RampanteError {
    return new RampanteError(message, code, context);
  }

  /**
   * Format error for display
   */
  format(): string {
    let formatted = `${this.message}`;
    
    if (this.code) {
      formatted += ` (${this.code})`;
    }
    
    if (this.context && Object.keys(this.context).length > 0) {
      const contextStr = Object.entries(this.context)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      formatted += ` | Context: ${contextStr}`;
    }
    
    return formatted;
  }
}

/**
 * Error handling utility functions
 */
export class ErrorHandler {
  /**
   * Handle and format error for CLI output
   */
  static handleCliError(error: unknown, logger: Logger): never {
    if (error instanceof RampanteError) {
      logger.error(error.format());
      if (error.context?.debug && logger) {
        logger.debug(error.stack || 'No stack trace available');
      }
    } else if (error instanceof Error) {
      logger.error(error.message);
      logger.debug(error.stack || 'No stack trace available');
    } else {
      logger.error(`Unknown error: ${String(error)}`);
    }
    
    Deno.exit(1);
  }

  /**
   * Wrap async operation with error context
   */
  static async withContext<T>(
    operation: () => Promise<T>,
    context: string,
    logger?: Logger | ScopedLogger,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const enhancedError = new RampanteError(
        `${context}: ${message}`,
        'OPERATION_FAILED',
        { originalError: error },
      );
      
      if (logger) {
        logger.debug(`Error in ${context}: ${message}`);
      }
      
      throw enhancedError;
    }
  }
}