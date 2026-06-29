package shopload

import (
	"encoding/json"
	"io"
	"log"
	"time"
)

type Logger struct {
	logger *log.Logger
}

func NewLogger(writer io.Writer) *Logger {
	return &Logger{logger: log.New(writer, "", 0)}
}

func (l *Logger) Info(message string, fields map[string]any) {
	l.write("info", message, nil, fields)
}

func (l *Logger) Error(message string, err error, fields map[string]any) {
	l.write("error", message, err, fields)
}

func (l *Logger) write(level string, message string, err error, fields map[string]any) {
	payload := map[string]any{
		"ts":      time.Now().UTC().Format(time.RFC3339Nano),
		"level":   level,
		"message": message,
	}
	if err != nil {
		payload["error"] = err.Error()
	}
	for key, value := range fields {
		payload[key] = value
	}
	encodedPayload, marshalErr := json.Marshal(payload)
	if marshalErr != nil {
		l.logger.Printf(`{"level":"error","message":"log_marshal_failed","error":%q}`, marshalErr.Error())
		return
	}
	l.logger.Print(string(encodedPayload))
}
