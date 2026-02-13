{{/*
Expand the name of the chart.
*/}}
{{- define "garage-webui.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "garage-webui.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "garage-webui.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "garage-webui.labels" -}}
helm.sh/chart: {{ include "garage-webui.chart" . }}
{{ include "garage-webui.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "garage-webui.selectorLabels" -}}
app.kubernetes.io/name: {{ include "garage-webui.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "garage-webui.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "garage-webui.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Return the secret name, with validation when enabled.
*/}}
{{- define "garage-webui.secretName" -}}
{{- if and .Values.secretRefs .Values.secretRefs.enabled }}
  {{- if not .Values.secretRefs.name }}
    {{- fail "secretRefs.name must be set when secretRefs.enabled=true" }}
  {{- end }}
{{- end }}
{{- if .Values.secretRefs }}{{ .Values.secretRefs.name | default "" }}{{ end }}
{{- end }}

{{/*
Generate env variables based on secretRefs.keys.
*/}}
{{- define "garage-webui.secretEnv" -}}
{{- if and .Values.secretRefs .Values.secretRefs.enabled .Values.secretRefs.keys }}
{{- $secretName := include "garage-webui.secretName" . }}
{{- range $envName, $keyName := .Values.secretRefs.keys }}
{{- if $keyName }}
- name: {{ $envName }}
  valueFrom:
    secretKeyRef:
      name: {{ $secretName }}
      key: {{ $keyName }}
{{- end }}
{{- end }}
{{- end }}
{{- end }}
