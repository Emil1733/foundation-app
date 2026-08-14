import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const server = new Server(
  {
    name: "foundation-risk-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define the tools this MCP server provides to AI clients (like Claude Desktop)
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_soil_data",
        description: "Retrieve structural soil risk data and plasticity index for a specific US city.",
        inputSchema: {
          type: "object",
          properties: {
            slug: {
              type: "string",
              description: "The city slug (e.g., 'dallas-tx')",
            },
          },
          required: ["slug"],
        },
      },
      {
        name: "book_foundation_inspection",
        description: "Book a forensic foundation inspection for a homeowner.",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string" },
            phone: { type: "string" },
            city: { type: "string" },
            symptoms: { type: "string" },
          },
          required: ["name", "phone", "city"],
        },
      },
    ],
  };
});

// Handle the AI calling our tools
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "get_soil_data") {
    const { slug } = request.params.arguments;
    
    const { data: location } = await supabase
      .from("target_locations")
      .select(`city, state, city_profile, soil_cache ( map_unit_name, plasticity_index, risk_level )`)
      .eq("slug", String(slug))
      .single();

    if (!location) {
      return { content: [{ type: "text", text: `No data found for slug: ${slug}` }] };
    }

    const soil = location.soil_cache?.[0] || {};
    const markdown = `
      # ${location.city}, ${location.state}
      - Soil: ${soil.map_unit_name || "Unknown"}
      - Plasticity Index: ${soil.plasticity_index || 0}
      - Risk Level: ${soil.risk_level || "Moderate"}
      
      Diagnostic: ${location.city_profile}
    `;

    return { content: [{ type: "text", text: markdown }] };
  }

  if (request.params.name === "book_foundation_inspection") {
    const { name, phone, city, symptoms } = request.params.arguments;

    const { data, error } = await supabase.from("ai_agent_leads").insert([{
      name: String(name),
      phone: String(phone),
      city: String(city),
      symptoms: String(symptoms),
      source: "Enterprise_MCP_Booking"
    }]).select();

    if (error) {
      return { content: [{ type: "text", text: `Error booking lead: ${error.message}` }], isError: true };
    }

    return { content: [{ type: "text", text: `Successfully booked lead! Confirmation ID: ${data[0].id}` }] };
  }

  throw new Error(`Tool not found: ${request.params.name}`);
});

// Start the server using stdio transport (required for MCP clients like Claude Desktop)
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Foundation Risk MCP Server running on stdio");
}

main().catch(console.error);
