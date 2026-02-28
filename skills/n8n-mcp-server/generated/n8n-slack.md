# n8n: Slack

> Send messages, manage channels, and interact with Slack

## Overview

- **Name:** `slack`
- **Category:** Communication
- **Version:** 2
- **Docs:** https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.slack/
- **Credentials:** slackApi, slackOAuth2Api

## Parameters

### Required

#### `resource`
- **Type:** options
- **Options:** `message`, `channel`, `user`, `file`, `reaction`

#### `operation`
- **Type:** options
- **Options:** `send`, `update`, `delete`

#### `channel`
- **Type:** string

### Optional

#### `text`
- **Type:** string

#### `attachments`
- **Type:** json

#### `blocks`
- **Type:** json
- **Description:** Block Kit UI components

## Workflow JSON Template

```json
{
  "type": "n8n-nodes-base.slack",
  "typeVersion": 2,
  "position": [
    0,
    0
  ],
  "parameters": {
    "resource": "<options>",
    "operation": "<options>",
    "channel": "<string>"
  }
}
```

## Tips

- Use expressions with `{{ $json.fieldName }}` to reference data from previous nodes
- Access environment variables with `{{ $env.VARIABLE_NAME }}`
- Use `{{ $now }}` for current timestamp
