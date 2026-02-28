import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "../data/nodes.json");

export interface N8nNode {
  name: string;
  displayName: string;
  description: string;
  category: string;
  subcategory?: string;
  version: number;
  parameters: Parameter[];
  credentials?: string[];
  documentation?: string;
  examples?: Example[];
}

interface Parameter {
  name: string;
  displayName: string;
  type: string;
  description?: string;
  required?: boolean;
  default?: unknown;
  options?: { name: string; value: string; description?: string }[];
}

interface Example {
  name: string;
  description: string;
  workflow: object;
}

// Load nodes data
function loadNodes(): N8nNode[] {
  if (!existsSync(DATA_PATH)) {
    console.error(`[n8n-mcp] Warning: ${DATA_PATH} not found. Run 'npm run crawl' to fetch node data.`);
    return getSampleNodes();
  }
  return JSON.parse(readFileSync(DATA_PATH, "utf-8"));
}

// Sample nodes for testing before crawl
function getSampleNodes(): N8nNode[] {
  return [
    {
      name: "httpRequest",
      displayName: "HTTP Request",
      description: "Makes HTTP requests and returns the response data",
      category: "Core",
      version: 4,
      parameters: [
        { name: "method", displayName: "Method", type: "options", required: true, options: [
          { name: "GET", value: "GET" },
          { name: "POST", value: "POST" },
          { name: "PUT", value: "PUT" },
          { name: "PATCH", value: "PATCH" },
          { name: "DELETE", value: "DELETE" },
        ]},
        { name: "url", displayName: "URL", type: "string", required: true, description: "The URL to make the request to" },
        { name: "authentication", displayName: "Authentication", type: "options", options: [
          { name: "None", value: "none" },
          { name: "Basic Auth", value: "basicAuth" },
          { name: "Bearer Token", value: "bearerToken" },
          { name: "OAuth2", value: "oAuth2" },
        ]},
        { name: "sendBody", displayName: "Send Body", type: "boolean", default: false },
        { name: "bodyContentType", displayName: "Body Content Type", type: "options", options: [
          { name: "JSON", value: "json" },
          { name: "Form Data", value: "formData" },
          { name: "Raw", value: "raw" },
        ]},
        { name: "body", displayName: "Body", type: "json", description: "Request body (JSON)" },
        { name: "sendHeaders", displayName: "Send Headers", type: "boolean", default: false },
        { name: "headers", displayName: "Headers", type: "fixedCollection", description: "Custom headers" },
        { name: "sendQuery", displayName: "Send Query Parameters", type: "boolean", default: false },
        { name: "queryParameters", displayName: "Query Parameters", type: "fixedCollection" },
      ],
      documentation: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/",
      examples: [
        {
          name: "Simple GET",
          description: "Fetch data from an API",
          workflow: {
            nodes: [{
              type: "n8n-nodes-base.httpRequest",
              parameters: { method: "GET", url: "https://api.example.com/data" }
            }]
          }
        }
      ]
    },
    {
      name: "slack",
      displayName: "Slack",
      description: "Send messages, manage channels, and interact with Slack",
      category: "Communication",
      version: 2,
      credentials: ["slackApi", "slackOAuth2Api"],
      parameters: [
        { name: "resource", displayName: "Resource", type: "options", required: true, options: [
          { name: "Message", value: "message" },
          { name: "Channel", value: "channel" },
          { name: "User", value: "user" },
          { name: "File", value: "file" },
          { name: "Reaction", value: "reaction" },
        ]},
        { name: "operation", displayName: "Operation", type: "options", required: true, options: [
          { name: "Send", value: "send" },
          { name: "Update", value: "update" },
          { name: "Delete", value: "delete" },
        ]},
        { name: "channel", displayName: "Channel", type: "string", required: true },
        { name: "text", displayName: "Message Text", type: "string" },
        { name: "attachments", displayName: "Attachments", type: "json" },
        { name: "blocks", displayName: "Blocks", type: "json", description: "Block Kit UI components" },
      ],
      documentation: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.slack/",
    },
    {
      name: "code",
      displayName: "Code",
      description: "Execute custom JavaScript or Python code",
      category: "Core",
      version: 2,
      parameters: [
        { name: "language", displayName: "Language", type: "options", required: true, options: [
          { name: "JavaScript", value: "javaScript" },
          { name: "Python", value: "python" },
        ]},
        { name: "jsCode", displayName: "JavaScript Code", type: "string", description: "JavaScript code to execute" },
        { name: "pythonCode", displayName: "Python Code", type: "string", description: "Python code to execute" },
        { name: "mode", displayName: "Mode", type: "options", options: [
          { name: "Run Once for All Items", value: "runOnceForAllItems" },
          { name: "Run Once for Each Item", value: "runOnceForEachItem" },
        ]},
      ],
      documentation: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.code/",
    },
    {
      name: "if",
      displayName: "If",
      description: "Route items based on conditions",
      category: "Core",
      version: 2,
      parameters: [
        { name: "conditions", displayName: "Conditions", type: "filter", required: true },
        { name: "combineConditions", displayName: "Combine", type: "options", options: [
          { name: "AND", value: "and" },
          { name: "OR", value: "or" },
        ]},
      ],
      documentation: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.if/",
    },
    {
      name: "webhook",
      displayName: "Webhook",
      description: "Create webhook endpoints to receive data from external services",
      category: "Core",
      version: 2,
      parameters: [
        { name: "httpMethod", displayName: "HTTP Method", type: "options", required: true, options: [
          { name: "GET", value: "GET" },
          { name: "POST", value: "POST" },
          { name: "PUT", value: "PUT" },
          { name: "DELETE", value: "DELETE" },
        ]},
        { name: "path", displayName: "Path", type: "string", required: true },
        { name: "authentication", displayName: "Authentication", type: "options", options: [
          { name: "None", value: "none" },
          { name: "Basic Auth", value: "basicAuth" },
          { name: "Header Auth", value: "headerAuth" },
        ]},
        { name: "responseMode", displayName: "Response Mode", type: "options", options: [
          { name: "Immediately", value: "onReceived" },
          { name: "When Last Node Finishes", value: "lastNode" },
          { name: "Using Respond to Webhook Node", value: "responseNode" },
        ]},
      ],
      documentation: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/",
    },
  ];
}

let nodesCache: N8nNode[] | null = null;

function getNodes(): N8nNode[] {
  if (!nodesCache) {
    nodesCache = loadNodes();
  }
  return nodesCache;
}

export async function searchNodes(args: { query: string; category?: string; limit?: number }) {
  const { query, category, limit = 10 } = args;
  const nodes = getNodes();
  const queryLower = query.toLowerCase();

  let results = nodes.filter((node) => {
    const matchesQuery =
      node.name.toLowerCase().includes(queryLower) ||
      node.displayName.toLowerCase().includes(queryLower) ||
      node.description.toLowerCase().includes(queryLower);
    
    const matchesCategory = !category || node.category.toLowerCase() === category.toLowerCase();
    
    return matchesQuery && matchesCategory;
  });

  results = results.slice(0, limit);

  return {
    count: results.length,
    nodes: results.map((n) => ({
      name: n.name,
      displayName: n.displayName,
      description: n.description,
      category: n.category,
    })),
  };
}

export async function getNodeDetails(args: { nodeName: string }) {
  const nodes = getNodes();
  const node = nodes.find(
    (n) => n.name.toLowerCase() === args.nodeName.toLowerCase() ||
           n.displayName.toLowerCase() === args.nodeName.toLowerCase()
  );

  if (!node) {
    throw new Error(`Node '${args.nodeName}' not found. Use search_nodes to find available nodes.`);
  }

  return node;
}

export async function listCategories() {
  const nodes = getNodes();
  const categories = new Map<string, number>();

  for (const node of nodes) {
    categories.set(node.category, (categories.get(node.category) || 0) + 1);
  }

  return {
    categories: Array.from(categories.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
  };
}

export { getNodes };
