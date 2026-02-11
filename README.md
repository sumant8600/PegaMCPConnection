Pega Student MCP – Configuration Guide

This MCP server connects to Pega REST APIs using a base URL stored in an environment variable.

create a service in pega and add base url in .env file 

and run command npm install 

this is only for reernce puropese


for cloude desktop you have to add in claude_desktop_config.json 



{
  "mcpServers": {
    "pega-student-mcp": {
      "command": "node",
      "args": [
        "C:/Users/suman/OneDrive/Desktop/pega-student-mcp-http/src/index.js"
      ]
    }
  }
}

