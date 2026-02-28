# n8n: HTTP Request

> Makes HTTP requests and returns the response data

## Overview

- **Name:** `httpRequest`
- **Category:** Core
- **Version:** 4
- **Docs:** https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/

## Parameters

### Required

#### `method`
- **Type:** options
- **Options:** `GET`, `POST`, `PUT`, `PATCH`, `DELETE`

#### `url`
- **Type:** string
- **Description:** The URL to make the request to

### Optional

#### `authentication`
- **Type:** options
- **Options:** `none`, `basicAuth`, `bearerToken`, `oAuth2`

#### `sendBody`
- **Type:** boolean
- **Default:** `false`

#### `bodyContentType`
- **Type:** options
- **Options:** `json`, `formData`, `raw`

#### `body`
- **Type:** json
- **Description:** Request body (JSON)

#### `sendHeaders`
- **Type:** boolean
- **Default:** `false`

#### `headers`
- **Type:** fixedCollection
- **Description:** Custom headers

#### `sendQuery`
- **Type:** boolean
- **Default:** `false`

#### `queryParameters`
- **Type:** fixedCollection

## Examples

### Simple GET

Fetch data from an API

```json
{
  "nodes": [
    {
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "GET",
        "url": "https://api.example.com/data"
      }
    }
  ]
}
```

## Workflow JSON Template

```json
{
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4,
  "position": [
    0,
    0
  ],
  "parameters": {
    "method": "<options>",
    "url": "<string>",
    "sendBody": false,
    "sendHeaders": false,
    "sendQuery": false
  }
}
```

## Tips

- Use expressions with `{{ $json.fieldName }}` to reference data from previous nodes
- Access environment variables with `{{ $env.VARIABLE_NAME }}`
- Use `{{ $now }}` for current timestamp
