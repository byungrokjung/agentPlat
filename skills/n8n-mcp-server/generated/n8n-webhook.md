# n8n: Webhook

> Create webhook endpoints to receive data from external services

## Overview

- **Name:** `webhook`
- **Category:** Core
- **Version:** 2
- **Docs:** https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/

## Parameters

### Required

#### `httpMethod`
- **Type:** options
- **Options:** `GET`, `POST`, `PUT`, `DELETE`

#### `path`
- **Type:** string

### Optional

#### `authentication`
- **Type:** options
- **Options:** `none`, `basicAuth`, `headerAuth`

#### `responseMode`
- **Type:** options
- **Options:** `onReceived`, `lastNode`, `responseNode`

## Workflow JSON Template

```json
{
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 2,
  "position": [
    0,
    0
  ],
  "parameters": {
    "httpMethod": "<options>",
    "path": "<string>"
  }
}
```

## Tips

- Use expressions with `{{ $json.fieldName }}` to reference data from previous nodes
- Access environment variables with `{{ $env.VARIABLE_NAME }}`
- Use `{{ $now }}` for current timestamp
