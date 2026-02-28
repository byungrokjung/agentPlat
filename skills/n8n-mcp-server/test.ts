// Quick test - generate skills for sample nodes
import { generateSkill, batchGenerateSkills } from "./src/tools/generate-skill.js";

async function test() {
  console.log("🧪 Testing skill generation...\n");

  // Single node
  const result1 = await generateSkill({ nodeName: "httpRequest" });
  console.log("✅ Single:", result1);

  // Batch - Core category
  const result2 = await batchGenerateSkills({ category: "Core" });
  console.log("\n✅ Batch (Core):", result2);
}

test().catch(console.error);
