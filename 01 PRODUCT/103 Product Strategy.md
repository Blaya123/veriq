# Product Strategy

## Purpose
Define the strategic decisions that guide product development.

## Build vs Buy Decisions

| Capability | Decision | Rationale |
|------------|----------|-----------|
| Chat integrations (WhatsApp, IG, etc.) | Build | Core differentiator. Must own the integration layer for reliability and UX. |
| Email integration | Build | Deeply tied to AI context. Off-the-shelf solutions lack flexibility. |
| AI/LLM layer | Build (on top of foundation models) | AI is our core moat. We build the orchestration, prompt management, and context layer. |
| Foundation models (GPT, Claude, etc.) | Buy | No competitive advantage in training our own LLM. Use best-in-class APIs. |
| Payment processing | Buy (Stripe) | Stripe is the gold standard. Building is a distraction. |
| File storage | Buy (S3, Cloudflare R2) | Commodity infrastructure. Use managed services. |
| Video/voice calling | Buy (Twilio, Daily) | Niche need. Focus on core async communication first. |
| Authentication | Build (on Auth0/ Clerk) | Need full control over UX. Use auth platform as backend. |

## Platform Approach

VERIQ is a platform, not a product. This distinction shapes every decision:

1. **API-first:** Every feature is accessible via API from day one. The UI is one client of many.
2. **Extensible:** Third-party developers can build integrations, widgets, and automations on VERIQ.
3. **Data-driven:** All actions produce structured data. All data is queryable. No black boxes.
4. **Composable:** Features are modular. Users compose their own workflow from available blocks.

## API-First Architecture

All product capabilities are exposed through a RESTful + GraphQL API:

- **Public API** — Open to third-party developers (Phase 3)
- **Partner API** — For integration partners (Phase 2)
- **Internal API** — Used by VERIQ frontend (Phase 1)

The frontend never calls external services directly. All requests route through the API gateway. This ensures consistent authentication, rate limiting, logging, and versioning.

## AI-First Architecture

AI is not a feature. AI is the architecture.

- **Context Engine:** Maintains a unified context model across all channels and modules. Every message, deal, contact, and task contributes to a living business knowledge graph.
- **Agent Layer:** Decomposable AI agents handle specific tasks — responding, qualifying, scheduling, invoicing. Agents coordinate and hand off context.
- **Human-in-the-Loop:** AI proposes; humans approve. Every AI action is reviewable, editable, and reversible.
- **Continuous Learning:** AI improves from human corrections. Every rejection is a training signal.

## Competitive Strategy

| Competitor | VERIQ Advantage |
|------------|-----------------|
| HubSpot | All-in-one with AI-native architecture, lower complexity, lower price |
| Salesforce | Modern UX, AI-first, no customization tax |
| Slack/Teams | Business OS vs communication tool. VERIQ includes comms + operations |
| Notion | Structured workflows + AI actions vs documents + databases |
| ManyChat/Zendesk | Full business OS vs channel-specific bots or ticketing |
