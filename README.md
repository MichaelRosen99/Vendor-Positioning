# Vendor Positioning

A clean, simple website for researching how a technology vendor stacks up against
its closest competitors.

Enter a vendor name (and optionally a specific product) and the app returns a
table with:

- Company size (revenue and employee count)
- HQ location
- Products
- Target market (Consumer, SMB, Mid-Market, Large Enterprise)
- Representative clients
- Market sentiment

...for the vendor plus its 3-6 closest competitors. You can then add more
companies or products to the same table for a broader comparison.

## How it works

The app has no static vendor database. Instead, each lookup calls the
Anthropic API server-side with a structured tool-use request, asking Claude to
research and return the comparison as typed JSON, which is then rendered as a
table.

## Getting started

```bash
npm install
cp .env.example .env.local   # then add your ANTHROPIC_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Configuration

| Env var             | Required | Description                                   |
| -------------------- | -------- | ---------------------------------------------- |
| `ANTHROPIC_API_KEY`  | Yes      | Server-side API key used for vendor lookups.  |
| `ANTHROPIC_MODEL`    | No       | Overrides the default model (`claude-sonnet-5`). |

## Project structure

- `src/app/page.tsx` — main UI: search form, results table, "add company" form.
- `src/app/api/vendor-lookup/route.ts` — vendor + competitors lookup endpoint.
- `src/app/api/add-company/route.ts` — endpoint for adding one more row.
- `src/lib/anthropic.ts` — prompt construction and structured-output schema.
- `src/components/` — `VendorTable` and `SentimentBadge` presentational components.
