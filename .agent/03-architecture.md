# PBX Dashboard — Architecture

## High-level

Frontend
→ REST/WebSocket API
→ Backend service
→ PostgreSQL / realtime configuration
→ PBX/Asterisk integration

The dashboard should not directly edit `pjsip.conf` from the browser.

## Backend responsibilities

The backend should:
- Authenticate users
- Validate configuration
- Persist PBX configuration
- Expose CRUD APIs
- Expose operational status
- Generate/preview PJSIP configuration
- Apply/synchronize configuration to Asterisk
- Record audit information for configuration changes
- Publish realtime status updates where applicable

## Suggested API domains

### Trunks
- `GET /api/trunks`
- `POST /api/trunks`
- `GET /api/trunks/:id`
- `PUT /api/trunks/:id`
- `DELETE /api/trunks/:id`
- `POST /api/trunks/:id/test`

### Extensions
- `GET /api/extensions`
- `POST /api/extensions`
- `GET /api/extensions/:id`
- `PUT /api/extensions/:id`
- `DELETE /api/extensions/:id`

### Routing
- `GET /api/routes`
- `POST /api/routes`
- `PUT /api/routes/:id`
- `DELETE /api/routes/:id`

### Dashboard
- `GET /api/dashboard/summary`
- `GET /api/calls/recent`

### Configuration
- `GET /api/config/source`
- `PUT /api/config/source`
- `GET /api/config/preview`
- `POST /api/config/apply`

Do not implement these endpoints exactly if an existing backend API already exists. First inspect the repository and reuse existing conventions.

## Realtime

Prefer WebSocket/SSE for:
- Trunk registration changes
- Extension contact changes
- Active calls
- PBX health/status

REST remains appropriate for CRUD operations.

## Security

Never expose:
- SIP passwords
- authentication secrets
- database credentials
- AMI credentials
- ARI credentials

Secret fields should be masked in UI and protected in API responses.

Configuration changes should be auditable.

## Data model direction

Suggested entities:
- users
- trunks
- trunk_credentials
- extensions
- extension_credentials
- routes
- ring_groups
- campaigns
- campaign_agents
- calls
- configuration_versions
- audit_logs

Adapt to the existing database instead of creating duplicate concepts.
