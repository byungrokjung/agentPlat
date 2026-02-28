#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { searchNodes, getNodeDetails, listCategories } from "./tools/search.js";
import { generateSkill, batchGenerateSkills } from "./tools/generate-skill.js";

const server = new Server(
  { name: "n8n-mcp-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// Tool definitions
const tools = [
  {
    name: "search_nodes",
    description: "Search n8n nodes by name, description, or category. Returns matching nodes with basic info.",
    inputSchema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Search query (node name, keyword, or category)" },
        category: { type: "string", description: "Filter by category (optional)" },
        limit: { type: "number", description: "Max results (default: 10)" },
      },
      required: ["query"],
    },
  },
  {
    name: "get_node_details",
    description: "Get detailed information about a specific n8n node including all parameters, options, and usage examples.",
    inputSchema: {
      type: "object" as const,
      properties: {
        nodeName: { type: "string", description: "Node name (e.g., 'httpRequest', 'slack', 'gmail')" },
      },
      required: ["nodeName"],
    },
  },
  {
    name: "list_categories",
    description: "List all available n8n node categories with node counts.",
    inputSchema: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "generate_skill",
    description: "Generate a Claude Code skill file (.md) for a specific n8n node. Outputs to skills/n8n-mcp-server/generated/",
    inputSchema: {
      type: "object" as const,
      properties: {
        nodeName: { type: "string", description: "Node name to generate skill for" },
        outputPath: { type: "string", description: "Custom output path (optional)" },
      },
      required: ["nodeName"],
    },
  },
  {
    name: "batch_generate_skills",
    description: "Generate Claude Code skill files for multiple nodes at once. Use category='all' for all nodes.",
    inputSchema: {
      type: "object" as const,
      properties: {
        category: { type: "string", description: "Category to generate skills for, or 'all'" },
        nodes: { 
          type: "array", 
          items: { type: "string" },
          description: "Specific node names (alternative to category)" 
        },
      },
    },
  },
];

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: unknown;

    switch (name) {
      case "search_nodes":
        result = await searchNodes(args as { query: string; category?: string; limit?: number });
        break;
      case "get_node_details":
        result = await getNodeDetails(args as { nodeName: string });
        break;
      case "list_categories":
        result = await listCategories();
        break;
      case "generate_skill":
        result = await generateSkill(args as { nodeName: string; outputPath?: string });
        break;
      case "batch_generate_skills":
        result = await batchGenerateSkills(args as { category?: string; nodes?: string[] });
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[n8n-mcp] Server started");
}

main().catch(console.error);
