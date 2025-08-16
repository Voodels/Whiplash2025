// constants/colors.js
// Centralized ANSI color codes for consistent terminal output across the application

export const colors = {
    // Reset and formatting
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    
    // Basic colors
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    
    // Background colors
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m'
};

// Color scheme constants for different types of operations
export const colorSchemes = {
    // HTTP Methods
    http: {
        GET: colors.green,
        POST: colors.yellow,
        PUT: colors.blue,
        DELETE: colors.red,
        PATCH: colors.magenta
    },
    
    // Log levels
    log: {
        info: colors.cyan,
        success: colors.green,
        warning: colors.yellow,
        error: colors.red,
        debug: colors.magenta
    },
    
    // Components
    components: {
        server: colors.green,
        socket: colors.cyan,
        middleware: colors.cyan,
        controller: colors.blue,
        service: colors.magenta,
        database: colors.yellow
    }
};

export default colors;
