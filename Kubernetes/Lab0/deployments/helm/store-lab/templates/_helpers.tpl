{{- define "store-lab.name" -}}
{{- .Chart.Name -}}
{{- end -}}

{{- define "store-lab.fullname" -}}
{{- printf "%s-%s" .Release.Name (include "store-lab.name" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "store-lab.labels" -}}
app.kubernetes.io/name: {{ include "store-lab.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

