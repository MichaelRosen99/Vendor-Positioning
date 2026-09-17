import Anthropic from "@anthropic-ai/sdk";
import type { VendorRow } from "./types";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not configured on the server. Add it to your environment to enable vendor lookups."
    );
  }
  return new Anthropic({ apiKey });
}

const TARGET_MARKETS = ["Consumer", "SMB", "Mid-Market", "Large Enterprise"] as const;
const SENTIMENT_LABELS = ["Positive", "Mixed", "Negative"] as const;

const vendorRowSchema = {
  type: "object" as const,
  properties: {
    name: { type: "string", description: "The company's commonly used name." },
    product: {
      type: "string",
      description:
        "The specific product being positioned, if the lookup is about a product rather than the whole company. Omit if not applicable.",
    },
    revenue: {
      type: "string",
      description:
        "Approximate annual revenue with a year/estimate caveat, e.g. '$2.1B (FY2024, est.)' or 'Undisclosed (private)'.",
    },
    employees: {
      type: "string",
      description: "Approximate employee count, e.g. '~8,500' or a range if uncertain.",
    },
    hqLocation: { type: "string", description: "Headquarters city and country/state." },
    products: {
      type: "array",
      items: { type: "string" },
      description: "Key products or product lines relevant to this comparison.",
    },
    targetMarket: {
      type: "array",
      items: { type: "string", enum: TARGET_MARKETS as unknown as string[] },
      description: "Which customer segments the vendor primarily targets. Can include multiple.",
    },
    representativeClients: {
      type: "array",
      items: { type: "string" },
      description: "A handful of well-known, publicly-referenced customers or case studies.",
    },
    sentiment: {
      type: "object",
      properties: {
        label: { type: "string", enum: SENTIMENT_LABELS as unknown as string[] },
        summary: {
          type: "string",
          description:
            "1-2 sentence summary of market/analyst/customer sentiment (e.g. review scores, analyst commentary, common praise or complaints).",
        },
      },
      required: ["label", "summary"],
    },
  },
  required: [
    "name",
    "revenue",
    "employees",
    "hqLocation",
    "products",
    "targetMarket",
    "representativeClients",
    "sentiment",
  ],
};

const SYSTEM_PROMPT = `You are a market research analyst assistant embedded in a vendor-positioning tool.
Given a technology vendor (and optionally a specific product), you provide a concise,
well-structured competitive snapshot using your best knowledge.

Guidelines:
- Be factual and specific. If a figure is an estimate or your knowledge may be dated, say so
  briefly within the field itself (e.g. "~$500M (est.)") rather than refusing to answer.
- Never fabricate implausible precision; round sensibly.
- Representative clients should be well-known, plausible customers of that vendor — only
  include names you are reasonably confident about; a shorter accurate list beats a padded one.
- Sentiment should reflect a realistic synthesis of how the market/analysts/customers generally
  perceive the vendor (e.g. review platforms, analyst reports, common praise/complaints), not a
  guess with no basis.
- Choose competitors that are genuinely the closest alternatives for the same product/use case,
  not just any large company in the same broad industry.`;

function extractToolInput<T>(message: Anthropic.Messages.Message, toolName: string): T {
  const block = message.content.find(
    (b): b is Anthropic.Messages.ToolUseBlock => b.type === "tool_use" && b.name === toolName
  );
  if (!block) {
    throw new Error("The model did not return structured data. Please try again.");
  }
  return block.input as T;
}

export async function lookupVendorAndCompetitors(
  vendorName: string,
  product?: string
): Promise<{ vendor: VendorRow; competitors: VendorRow[] }> {
  const client = getClient();

  const subject = product ? `${vendorName} (product: ${product})` : vendorName;

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    tools: [
      {
        name: "provide_vendor_analysis",
        description:
          "Return the structured vendor positioning table: the requested vendor plus its 3-6 closest competitors.",
        input_schema: {
          type: "object",
          properties: {
            vendor: vendorRowSchema,
            competitors: {
              type: "array",
              minItems: 3,
              maxItems: 6,
              items: vendorRowSchema,
              description: "The 3 to 6 closest competitors to the requested vendor/product.",
            },
          },
          required: ["vendor", "competitors"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "provide_vendor_analysis" },
    messages: [
      {
        role: "user",
        content: `Research this technology vendor: ${subject}.

Return:
1. The vendor's own row (using the specific product's positioning if a product was named).
2. Between 3 and 6 of its closest competitors for that same product/use case, each with the
   same fields, ranked roughly by how directly they compete.`,
      },
    ],
  });

  return extractToolInput(message, "provide_vendor_analysis");
}

export async function lookupSingleCompany(
  name: string,
  product: string | undefined,
  existingCompanies: string[]
): Promise<VendorRow> {
  const client = getClient();
  const subject = product ? `${name} (product: ${product})` : name;

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    tools: [
      {
        name: "provide_company_row",
        description: "Return a single structured vendor/product row to add to an existing comparison table.",
        input_schema: vendorRowSchema,
      },
    ],
    tool_choice: { type: "tool", name: "provide_company_row" },
    messages: [
      {
        role: "user",
        content: `Add this company/product to an existing vendor comparison table: ${subject}.
${
  existingCompanies.length
    ? `The table already includes: ${existingCompanies.join(", ")}. Keep the framing and level of
detail consistent with those entries.`
    : ""
}
Return just the one row for ${subject}.`,
      },
    ],
  });

  return extractToolInput(message, "provide_company_row");
}
