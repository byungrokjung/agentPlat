# n8n: If

> Route items based on conditions

## Overview

- **Name:** `if`
- **Category:** Core
- **Version:** 2
- **Docs:** https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.if/

## Parameters

### Required

#### `conditions`
- **Type:** filter

### Optional

#### `combineConditions`
- **Type:** options
- **Options:** `and`, `or`

## Workflow JSON Template

```json
{
  "type": "n8n-nodes-base.if",
  "typeVersion": 2,
  "position": [
    0,
    0
  ],
  "parameters": {
    "conditions": "<filter>"
  }
}
```

## Tips

- Use expressions with `{{ $json.fieldName }}` to reference data from previous nodes
- Access environment variables with `{{ $env.VARIABLE_NAME }}`
- Use `{{ $now }}` for current timestamp
