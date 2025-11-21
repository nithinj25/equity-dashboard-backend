# Equity Dashboard Backend

An Express + TypeScript + Mongoose backend for managing capitalization tables, importing equity data via CSV, and running financing & exit simulations. Deployable to Vercel (serverless) or as a traditional Node server.

## Table of Contents
1. Features
2. Architecture Overview
3. Tech Stack
4. Environment Variables
5. Local Development
6. Running Tests
7. API Endpoints
8. Simulation Scenarios
9. CSV Import Format
10. Deployment (Vercel)
11. Production Hardening Recommendations
12. Troubleshooting

---
## 1. Features
- Company CRUD (currently create + fetch)
- CSV ingestion of share classes, shareholders, and instruments
- Round financing simulation (dilution, pro‑forma cap table)
- Exit distribution simulation
- Serverless-ready MongoDB connection caching
- Structured logging with Pino
- Validation & error handling scaffolding (extensible)

## 2. Architecture Overview
```
Request
  -> Express Router (/api/v1)
    -> Controller (company.controller)
      -> Repository (company.repository)
        -> Mongoose Models (Company, ShareClass, Shareholder, Instrument)
      -> Services (csvImporter.service, simulation.service)
  -> Middleware (auth, validation, error handler)
  -> Response (JSON)
```
- `src/app.ts` wires middleware and mounts routes under `/api/v1`.
- `src/server.ts` is for traditional Node runtime (not used on Vercel).
- `api/index.ts` is the Vercel serverless entry exporting the Express app.
- `src/config/database.ts` provides cached connection logic for serverless environments.

## 3. Tech Stack
- Runtime: Node.js + TypeScript
- Web: Express
- DB: MongoDB (Mongoose ODM)
- File Upload: Multer (in-memory)
- CSV Parsing: `csv-parse/sync`
- Math Precision: `decimal.js` (wrapped by `decimal.util.ts`)
- Logging: Pino
- Testing: Jest + Supertest (scaffolding)

## 4. Environment Variables
Put real values in `.env` (never commit). Example in `.env.example`:
```
PORT=4000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-host>/<database>?retryWrites=true&w=majority
JWT_SECRET=replace_me
NODE_ENV=development
LOG_LEVEL=info
```
Notes:
- Always include a database name (e.g. `/equitydb`) at the end of the URI.
- On Atlas make sure the user has proper roles and your IP / Vercel IP range is whitelisted.

## 5. Local Development
Install dependencies and start the dev server:
```powershell
npm install
npm run dev
```
The server listens on `PORT` (default 4000). Base API path: `http://localhost:4000/api/v1`.

## 6. Running Tests
Currently minimal tests. Run:
```powershell
npm test
```
Add more integration tests under `__tests__/` using Supertest.

## 7. API Endpoints
Base Path: `/api/v1`

### Health / Root
`GET /` → `{ ok: true }` (mounted directly in `app.ts` at root, not under `/api/v1`).

### Companies
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/companies` | Create a company |
| GET | `/api/v1/companies/:companyId` | Fetch company with related share classes, shareholders & instruments |
| POST | `/api/v1/companies/:companyId/import-csv` | Import CSV rows (multipart) |
| POST | `/api/v1/companies/:companyId/simulate` | Run scenario simulation | 

#### Create Company
Request Body:
```json
{
  "name": "Acme Corp",
  "currency": "USD"
}
```
Response:
```json
{
  "_id": "...",
  "name": "Acme Corp",
  "currency": "USD",
  "createdAt": "..."
}
```

#### Get Company
`GET /api/v1/companies/<id>` returns:
```json
{
  "company": { "_id": "...", "name": "Acme Corp", "currency": "USD" },
  "shareClasses": [ { "name": "Common", ... } ],
  "shareholders": [ { "name": "Founder", ... } ],
  "instruments": [ { "shares": 1000, "shareholder": { ... }, "shareClass": { ... } } ]
}
```

#### Import CSV
Multipart/form-data field: `file`
CSV Columns (headers):
```
shareholder,share_class,shares,price_per_share,grant_date,class_type,email
```
Minimal Sample:
```
shareholder,share_class,shares
Alice,Common,1000
Bob,Common,500
VC Fund,Series A,20000
```
Response:
```json
{ "success": true, "results": [ { "_id": "...", "shares": 1000, ... } ] }
```

### Simulation
`POST /api/v1/companies/:companyId/simulate`
Supports two scenario types: `round` and `exit`.

#### Financing Round Scenario
Request:
```json
{
  "type": "round",
  "data": {
    "preMoney": 15000000,
    "amountRaised": 5000000,
    "investorName": "Series A Investor",
    "shareClassName": "Series A Preferred"
  }
}
```
Response:
```json
{
  "type": "round",
  "pricePerShare": "15.0000",
  "newShares": "333333.3333",
  "proformaTotal": "533333.3333",
  "holdings": [
    { "shareholder": "Founder", "shares": "1000000", "percent": "65.0000" },
    { "shareholder": "Series A Investor", "shares": "333333.3333", "percent": "35.0000" }
  ]
}
```
(Values illustrative.)

#### Exit Scenario
Request:
```json
{
  "type": "exit",
  "data": { "exitValue": 250000000 }
}
```
Response:
```json
{
  "type": "exit",
  "exitValue": "250000000",
  "distributions": [
    { "shareholder": "Founder", "shares": "1000000", "payout": "150000000.00" },
    { "shareholder": "Investor", "shares": "666666.6667", "payout": "100000000.00" }
  ]
}
```

#### Errors
If `type` is not `round` or `exit` → `400` with `{ "message": "Unknown scenario type" }`.

## 8. Simulation Internals
- Builds a capitalization snapshot from instruments by share class.
- Round: Computes price-per-share from `preMoney / existingShares`; creates new shares = `amountRaised / pricePerShare`; aggregates pro forma ownership.
- Exit: Pro-rata distribution by total shares.
- Precision via Decimal wrapper (`D()` helper) ensures accurate fractional math.

## 9. CSV Import Format Details
- Rows create/share existing Share Classes & Shareholders idempotently.
- `class_type` defaults to `COMMON` if omitted.
- Optional fields: `price_per_share`, `grant_date` (ISO or YYYY-MM-DD), `email`.
- Size Limits (Vercel): Large files (>4–6 MB) may fail. For big imports, consider an object storage flow or chunked uploads.

## 10. Deployment (Vercel)
1. Push repository to GitHub.
2. Import project in Vercel.
3. Ensure `vercel.json` exists:
```json
{
  "version": 2,
  "builds": [{ "src": "api/index.ts", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "/api/index.ts" }]
}
```
4. Add Environment Variables in Vercel dashboard (`MONGO_URI`, `JWT_SECRET`, etc.).
5. Atlas: Whitelist Vercel or temporarily allow all for testing.
6. Deploy → API base will be `https://<project>.vercel.app/api/v1`.

### Serverless Notes
- Do NOT call `src/server.ts` on Vercel; platform wraps `api/index.ts` export.
- Mongo connection caching prevents repeated handshake overhead.

## 11. Production Hardening Recommendations
- Add rate limiting (e.g. `express-rate-limit`).
- Restrict CORS origins.
- Replace in-memory file upload with streaming to object storage for large CSVs.
- Add request validation for all endpoints (express-validator scaffolding available).
- Implement authentication & authorization around simulations and imports.
- Enable structured security headers (already using Helmet; tune CSP).
- Add pagination for large instrument/shareholder lists.

## 12. Troubleshooting
| Issue | Cause | Fix |
|-------|-------|-----|
| Mongo auth fails | Wrong credentials / missing DB name | Ensure URI includes db; verify user roles |
| "Unknown scenario type" | Wrong `type` field | Use `round` or `exit` with proper `data` object |
| CSV import 400 | Missing `file` field | Send multipart form with `file` name |
| Slow cold start | Connection not cached | Ensure using `connectDatabase` (serverless deploy) |
| Large CSV rejects | Body size limit | Stream or chunk uploads |

## 13. Example cURL Requests
Create Company:
```bash
curl -X POST http://localhost:4000/api/v1/companies \
  -H "Content-Type: application/json" \
  -d '{"name":"Acme","currency":"USD"}'
```
Get Company:
```bash
curl http://localhost:4000/api/v1/companies/<companyId>
```
Financing Simulation:
```bash
curl -X POST http://localhost:4000/api/v1/companies/<companyId>/simulate \
  -H "Content-Type: application/json" \
  -d '{"type":"round","data":{"preMoney":15000000,"amountRaised":5000000,"investorName":"Series A","shareClassName":"Series A Preferred"}}'
```
Exit Simulation:
```bash
curl -X POST http://localhost:4000/api/v1/companies/<companyId>/simulate \
  -H "Content-Type: application/json" \
  -d '{"type":"exit","data":{"exitValue":250000000}}'
```

---
## 14. Next Steps
- Implement update/delete for companies.
- Add full validation layer for payloads.
- Expand tests (unit + integration + simulation edge cases).

---
MIT Licensed or proprietary (define as needed).
