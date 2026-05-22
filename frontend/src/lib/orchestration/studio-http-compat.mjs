import { Hono } from "hono";

const app = new Hono();

const ASSISTANT_ID = "srm_company_assistant";

const assistant = {
  assistant_id: ASSISTANT_ID,
  graph_id: "srm_company_assistant",
  config: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  metadata: {
    name: "SRM Company Assistant",
    description: "Company orchestration assistant"
  }
};

app.get("/info", (c) => {
  return c.json({
    version: "1.0.0",
    assistants: true
  });
});

app.post("/assistants/search", (c) => {
  console.log("[DEBUG] POST /assistants/search");

  return c.json([assistant]);
});

app.get("/assistants/:id", (c) => {
  const id = c.req.param("id");

  console.log("[DEBUG] GET /assistants/:id", id);

  if (id !== ASSISTANT_ID) {
    return c.json(
      { error: "Assistant not found" },
      404
    );
  }

  return c.json(assistant);
});

app.get("/assistants/:id/schemas", (c) => {
  const id = c.req.param("id");

  console.log("[DEBUG] GET /assistants/:id/schemas", id);

  if (id !== ASSISTANT_ID) {
    return c.json(
      { error: "Assistant not found" },
      404
    );
  }

  return c.json({
    assistant_id: ASSISTANT_ID,

    graph_id: "srm_company_assistant",

    input_schema: {
      title: "CompanyResearchInput",

      type: "object",

      properties: {
        company_name: {
          type: "string",
          title: "Company Name",
          description: "Target company name"
        },

        country: {
          type: "string",
          title: "Country",
          description: "Target country"
        }
      },

      required: ["company_name"]
    },

    output_schema: {
      title: "CompanyResearchOutput",
      type: "object",
      properties: {
        result: {
          type: "object",
          properties: {
            company_name: { type: "string" },
            operating_countries: { type: "array", items: { type: "string" } },
            key_competitors: { type: "array", items: { type: "string" } },
            core_values: { type: "array", items: { type: "string" } },
            strategic_priorities: { type: "array", items: { type: "string" } },
            focus_sectors: { type: "array", items: { type: "string" } },
            competitive_advantages: { type: "array", items: { type: "string" } },
            board_members: { 
              type: "array", 
              items: { 
                type: "object", 
                properties: { name: { type: "string" }, position: { type: "string" } } 
              } 
            },
            key_leaders: { 
              type: "array", 
              items: { 
                type: "object", 
                properties: { name: { type: "string" }, role: { type: "string" } } 
              } 
            }
          }
        }
      }
    },
    state_schema: {
      title: "CompanyResearchState",
      type: "object",
      properties: {
        company_name: { type: "string" },
        country: { type: "string" },
        operating_countries: { type: "array", items: { type: "string" } },
        key_competitors: { type: "array", items: { type: "string" } },
        core_values: { type: "array", items: { type: "string" } },
        strategic_priorities: { type: "array", items: { type: "string" } },
        focus_sectors: { type: "array", items: { type: "string" } },
        competitive_advantages: { type: "array", items: { type: "string" } },
        board_members: { type: "array", items: { type: "object" } },
        key_leaders: { type: "array", items: { type: "object" } },
        result: { type: "object" }
      }
    },

    config_schema: {
      title: "RunnableConfig",

      type: "object",

      properties: {}
    }
  });
});

export default app;