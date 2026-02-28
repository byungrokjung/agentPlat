import { writeFileSync, mkdirSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { getNodes, N8nNode } from "./search.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const GENERATED_PATH = join(__dirname, "../../generated");

// Ensure generated directory exists
if (!existsSync(GENERATED_PATH)) {
  mkdirSync(GENERATED_PATH, { recursive: true });
}

function generateMarkdown(node: N8nNode): string {
  const lines: string[] = [];

  // Header
  lines.push(`# n8n: ${node.displayName}`);
  lines.push("");
  lines.push(`> ${node.description}`);
  lines.push("");

  // Metadata
  lines.push("## Overview");
  lines.push("");
  lines.push(`- **Name:** \`${node.name}\``);
  lines.push(`- **Category:** ${node.category}${node.subcategory ? ` > ${node.subcategory}` : ""}`);
  lines.push(`- **Version:** ${node.version}`);
  if (node.documentation) {
    lines.push(`- **Docs:** ${node.documentation}`);
  }
  if (node.credentials && node.credentials.length > 0) {
    lines.push(`- **Credentials:** ${node.credentials.join(", ")}`);
  }
  lines.push("");

  // Parameters
  if (node.parameters && node.parameters.length > 0) {
    lines.push("## Parameters");
    lines.push("");

    const required = node.parameters.filter((p) => p.required);
    const optional = node.parameters.filter((p) => !p.required);

    if (required.length > 0) {
      lines.push("### Required");
      lines.push("");
      for (const param of required) {
        lines.push(`#### \`${param.name}\``);
        lines.push(`- **Type:** ${param.type}`);
        if (param.description) {
          lines.push(`- **Description:** ${param.description}`);
        }
        if (param.options && param.options.length > 0) {
          lines.push(`- **Options:** ${param.options.map((o) => `\`${o.value}\``).join(", ")}`);
        }
        lines.push("");
      }
    }

    if (optional.length > 0) {
      lines.push("### Optional");
      lines.push("");
      for (const param of optional) {
        lines.push(`#### \`${param.name}\``);
        lines.push(`- **Type:** ${param.type}`);
        if (param.description) {
          lines.push(`- **Description:** ${param.description}`);
        }
        if (param.default !== undefined) {
          lines.push(`- **Default:** \`${JSON.stringify(param.default)}\``);
        }
        if (param.options && param.options.length > 0) {
          lines.push(`- **Options:** ${param.options.map((o) => `\`${o.value}\``).join(", ")}`);
        }
        lines.push("");
      }
    }
  }

  // Examples
  if (node.examples && node.examples.length > 0) {
    lines.push("## Examples");
    lines.push("");
    for (const example of node.examples) {
      lines.push(`### ${example.name}`);
      lines.push("");
      lines.push(example.description);
      lines.push("");
      lines.push("```json");
      lines.push(JSON.stringify(example.workflow, null, 2));
      lines.push("```");
      lines.push("");
    }
  }

  // Usage in workflow JSON
  lines.push("## Workflow JSON Template");
  lines.push("");
  lines.push("```json");
  lines.push(JSON.stringify({
    type: `n8n-nodes-base.${node.name}`,
    typeVersion: node.version,
    position: [0, 0],
    parameters: Object.fromEntries(
      node.parameters
        .filter((p) => p.required || p.default !== undefined)
        .map((p) => [p.name, p.default ?? `<${p.type}>`])
    ),
  }, null, 2));
  lines.push("```");
  lines.push("");

  // Tips
  lines.push("## Tips");
  lines.push("");
  lines.push("- Use expressions with `{{ $json.fieldName }}` to reference data from previous nodes");
  lines.push("- Access environment variables with `{{ $env.VARIABLE_NAME }}`");
  lines.push("- Use `{{ $now }}` for current timestamp");
  lines.push("");

  return lines.join("\n");
}

export async function generateSkill(args: { nodeName: string; outputPath?: string }) {
  const nodes = getNodes();
  const node = nodes.find(
    (n) => n.name.toLowerCase() === args.nodeName.toLowerCase() ||
           n.displayName.toLowerCase() === args.nodeName.toLowerCase()
  );

  if (!node) {
    throw new Error(`Node '${args.nodeName}' not found. Use search_nodes to find available nodes.`);
  }

  const markdown = generateMarkdown(node);
  const filename = `n8n-${node.name}.md`;
  const outputPath = args.outputPath || join(GENERATED_PATH, filename);

  writeFileSync(outputPath, markdown, "utf-8");

  return {
    success: true,
    node: node.displayName,
    path: outputPath,
    size: markdown.length,
    message: `Generated skill file for ${node.displayName}`,
  };
}

export async function batchGenerateSkills(args: { category?: string; nodes?: string[] }) {
  const allNodes = getNodes();
  let targetNodes: N8nNode[];

  if (args.nodes && args.nodes.length > 0) {
    targetNodes = allNodes.filter((n) =>
      args.nodes!.some(
        (name) => n.name.toLowerCase() === name.toLowerCase() ||
                  n.displayName.toLowerCase() === name.toLowerCase()
      )
    );
  } else if (args.category) {
    if (args.category.toLowerCase() === "all") {
      targetNodes = allNodes;
    } else {
      targetNodes = allNodes.filter(
        (n) => n.category.toLowerCase() === args.category!.toLowerCase()
      );
    }
  } else {
    throw new Error("Either 'category' or 'nodes' must be specified");
  }

  const results: { node: string; path: string; success: boolean }[] = [];

  for (const node of targetNodes) {
    try {
      const markdown = generateMarkdown(node);
      const filename = `n8n-${node.name}.md`;
      const outputPath = join(GENERATED_PATH, filename);
      writeFileSync(outputPath, markdown, "utf-8");
      results.push({ node: node.displayName, path: outputPath, success: true });
    } catch (error) {
      results.push({ node: node.displayName, path: "", success: false });
    }
  }

  return {
    total: targetNodes.length,
    successful: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    files: results,
    outputDirectory: GENERATED_PATH,
  };
}
