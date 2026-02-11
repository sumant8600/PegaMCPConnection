import dotenv from "dotenv";
import axios from "axios";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

dotenv.config();

// Use the URL from your successful curl test
 const PEGA_BASE_URL = process.env.PEGA_BASE_URL;

const GET_ALL_STUDENT_URL = `${PEGA_BASE_URL}/FormCPDemo/v1/FormCPDemo/v1/GetAllStudent`;
const SAVE_STUDENT_URL = `${PEGA_BASE_URL}/FormCPDemo/v1/FormCPDemo/v1/SaveStudent`;

console.log("Pega Base URL:", PEGA_BASE_URL); // Debug log to confirm URL is correct

// This is the EXACT header that worked in your curl.exe test
const axiosConfig = {
  headers: {
    'Authorization': 'Basic Rm9yTUNQRGVtbzpyb290',
    'Content-Type': 'application/json'
  }
};

const server = new Server({
    name: "pega-student-mcp",
    version: "1.0.0",
}, {
    capabilities: { tools: {} }
});

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "get_all_students",
      description: "Get all student records from Pega",
      inputSchema: { type: "object", properties: {} }
    },
    {
      name: "saveStudent",
      description: "Create a new student record in Pega",
      inputSchema: {
        type: "object",
        properties: {
          laptopid: { type: "number" },
          sid: { type: "number" },
          sname: { type: "string" }
        },
        required: ["laptopid", "sid", "sname"]
      }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name: toolName, arguments: args } = request.params;

  try {
    if (toolName === "get_all_students") {
      const response = await axios.get(GET_ALL_STUDENT_URL, axiosConfig);
      return {
        content: [{ type: "text", text: JSON.stringify(response.data) }]
      };
    }

    if (toolName === "saveStudent") {
      // Mapping keys to lowercase as seen in your successful JSON response
      const body = {
        Laptopid: args.laptopid,
        Sid: args.sid,
        Sname: args.sname
      };
console.error("Sending to Pega:", JSON.stringify(body)); // Debug log
      const pegaRes = await axios.post(SAVE_STUDENT_URL, body, axiosConfig);

      return {
        content: [{ 
          type: "text", 
          text: `Success! Student saved. Pega Response: ${JSON.stringify(pegaRes.data)}` 
        }]
      };
    }

    throw new Error(`Unknown tool: ${toolName}`);
  } catch (err) {
    return {
      isError: true,
      content: [{ 
        type: "text", 
        text: `Error: ${err.response?.data?.message || err.message}` 
      }]
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);