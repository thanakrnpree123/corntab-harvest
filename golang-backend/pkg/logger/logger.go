
package logger

import (
	"log"
	"os"
	
	"crontab/internal/config"
)

// Logger provides structured logging capabilities
type Logger struct {
	infoLogger  *log.Logger
	errorLogger *log.Logger
	debugLogger *log.Logger
	isDebug     bool
}

// New creates a new Logger instance
func New(cfg *config.Config) *Logger {
	isDebug := cfg.GetBool("DEBUG", false)
	
	return &Logger{
		infoLogger:  log.New(os.Stdout, "[INFO] ", log.Ldate|log.Ltime),
		errorLogger: log.New(os.Stderr, "[ERROR] ", log.Ldate|log.Ltime|log.Lshortfile),
		debugLogger: log.New(os.Stdout, "[DEBUG] ", log.Ldate|log.Ltime|log.Lshortfile),
		isDebug:     isDebug,
	}
}

// Info logs an informational message
func (l *Logger) Info(msg string, args ...interface{}) {
	l.infoLogger.Printf(msg, args...)
}

// Error logs an error message
func (l *Logger) Error(msg string, args ...interface{}) {
	l.errorLogger.Printf(msg, args...)
}

// Fatal logs an error message and exits
func (l *Logger) Fatal(msg string, args ...interface{}) {
	l.errorLogger.Fatalf(msg, args...)
}

// Debug logs a debug message (only if debug is enabled)
func (l *Logger) Debug(msg string, args ...interface{}) {
	if l.isDebug {
		l.debugLogger.Printf(msg, args...)
	}
}
