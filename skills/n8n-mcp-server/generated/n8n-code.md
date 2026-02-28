# n8n: Code

> Execute custom JavaScript or Python code

## Overview

- **Name:** `code`
- **Category:** Core
- **Version:** 2
- **Docs:** https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.code/

## Parameters

### Required

#### `language`
- **Type:** options
- **Options:** `javaScript`, `python`

### Optional

#### `jsCode`
- **Type:** string
- **Description:** JavaScript code to execute

#### `pythonCode`
- **Type:** string
- **Description:** Python code to execute

#### `mode`
- **Type:** options
- **Options:** `runOnceForAllItems`, `runOnceForEachItem`

## Workflow JSON Template

```json
{
  "type": "n8n-nodes-base.code",
  "typeVersion": 2,
  "position": [
    0,
    0
  ],
  "parameters": {
    "language": "<options>"
  }
}
```

## Tips

- Use expressions with `{{ $json.fieldName }}` to reference data from previous nodes
- Access environment variables with `{{ $env.VARIABLE_NAME }}`
- Use `{{ $now }}` for current timestamp
