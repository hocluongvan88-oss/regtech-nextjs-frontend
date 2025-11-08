# FDA Public Data API Integration Guide

## Overview

The system now integrates real FDA public data through the official FDA OpenData portal. This provides live regulatory intelligence including enforcement actions, product recalls, adverse events, and device classifications.

## Architecture

### 1. FDA OpenData API Client (`lib/fda-public-data-api.ts`)
Connects to official FDA APIs:
- **FDA OpenData Base**: https://api.fda.gov/
  - Drug and device enforcement data
  - Adverse event reports (FAERS)
  - Device classifications
- **No authentication required** for public data
- Real-time data from FDA databases

### 2. API Endpoints

#### GET `/api/fda/enforcement-actions`
Fetches FDA enforcement actions (warnings, recalls, seizures)

**Query Parameters:**
- `client_id` (required): Your client ID
- `search` (optional): Product name or description
- `classification` (optional): Class1, Class2, Class3
- `limit` (optional): Default 100

**Response:**
\`\`\`json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "enforcement_id": "E123456",
      "classification": "Class1",
      "product_description": "...",
      "reason_for_recall": "...",
      "recall_initiation_date": "20240115",
      "center_classification_date": "20240120"
    }
  ],
  "lastSyncedAt": "2024-01-20T10:30:00Z"
}
\`\`\`

#### GET `/api/fda/recalls`
Product recall data with status tracking

**Query Parameters:**
- `client_id` (required)
- `product` (optional): Product name
- `status` (optional): Ongoing, Completed, Pending
- `limit` (optional): Default 100

#### GET `/api/fda/adverse-events`
FAERS adverse event reports for drugs and devices

**Query Parameters:**
- `client_id` (required)
- `product` (optional): Drug or device name
- `reaction` (optional): Medical condition name
- `serious_only` (optional): true/false
- `limit` (optional): Default 100

#### GET `/api/fda/device-classification`
FDA device product classifications

**Query Parameters:**
- `client_id` (required)
- `product_code` (optional): FDA product code
- `device_name` (optional): Device name
- `limit` (optional): Default 100

### 3. RCM Integration

FDA data automatically syncs into the Regulatory Change Management module as regulatory intelligence items.

#### POST `/api/rcm/sync-fda-intelligence`
Manually trigger FDA data synchronization

**Request Body:**
\`\`\`json
{
  "clientId": "client-123",
  "userId": "user-456"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "synced": {
    "enforcementActions": 5,
    "recalls": 3,
    "adverseEvents": 12
  },
  "total": 20
}
\`\`\`

### 4. Automatic Synchronization

**Cron Job:** `/api/cron/sync-fda-data`
- **Frequency**: Hourly (configurable)
- **Trigger**: Via Vercel Cron or external scheduler
- **Credentials**: Requires `CRON_SECRET` header
- **Scope**: Processes all active clients

**Setup:**
Add to `vercel.json`:
\`\`\`json
{
  "crons": [
    {
      "path": "/api/cron/sync-fda-data",
      "schedule": "0 * * * *"
    }
  ]
}
\`\`\`

### 5. UI Components

#### EnforcementActionsWidget
Displays recent FDA enforcement actions
\`\`\`tsx
import { EnforcementActionsWidget } from "@/components/fda/enforcement-actions-widget"

<EnforcementActionsWidget clientId="client-123" />
\`\`\`

#### RecallsAlertWidget
Shows active product recalls
\`\`\`tsx
import { RecallsAlertWidget } from "@/components/fda/recalls-alert-widget"

<RecallsAlertWidget clientId="client-123" />
\`\`\`

#### FDAIntelligenceFeed
Displays FDA-sourced regulatory intelligence with sync button
\`\`\`tsx
import { FDAIntelligenceFeed } from "@/components/rcm/fda-intelligence-feed"

<FDAIntelligenceFeed clientId="client-123" />
\`\`\`

## Database Schema

### tbl_fda_data_sync_log
Tracks all FDA API calls and synchronization:
- `client_id`: Client identifier
- `data_type`: enforcement_actions, recalls, adverse_events, device_classifications
- `records_synced`: Number of records processed
- `sync_status`: success or error
- `error_message`: Error details if failed
- `sync_timestamp`: When sync occurred

### tbl_fda_sync_events
Records FDA sync events for audit trail:
- `client_id`: Client identifier
- `event_type`: manual_sync, cron_sync, cron_sync_error
- `summary`: Event description
- `sync_timestamp`: Event time

## Data Flow

\`\`\`
FDA OpenData API
        ↓
API Endpoints (/api/fda/*)
        ↓
RCM Sync Service
        ↓
Regulatory Intelligence
        ↓
RCM Dashboard & Workflows
\`\`\`

## Automatic Features

1. **Risk Level Mapping**: FDA classifications automatically mapped to risk levels (critical/high/medium/low)
2. **Action Item Creation**: Critical enforcement actions auto-create action items
3. **Deduplication**: System prevents duplicate entries across syncs
4. **Status Tracking**: Recall status automatically updated
5. **Audit Trail**: 21 CFR Part 11 compliant logging of all operations

## Environment Variables

None required - FDA public APIs require no authentication. However, for cron jobs:

\`\`\`
CRON_SECRET=your-secure-token
\`\`\`

## API Rate Limits

- FDA OpenData API: 100 requests/minute per IP
- System implements automatic backoff and retry logic
- Sync operations are rate-limited to prevent API throttling

## Testing

\`\`\`bash
# Test enforcement actions endpoint
curl "http://localhost:3000/api/fda/enforcement-actions?client_id=test&limit=5"

# Test recalls endpoint
curl "http://localhost:3000/api/fda/recalls?client_id=test&status=Ongoing"

# Test manual sync
curl -X POST http://localhost:3000/api/rcm/sync-fda-intelligence \
  -H "Content-Type: application/json" \
  -d '{"clientId":"test","userId":"admin"}'
\`\`\`

## Error Handling

- Failed API calls are logged but don't block other operations
- Automatic retry with exponential backoff
- User-friendly error messages in UI widgets
- Full error trails in database for debugging

## Best Practices

1. Run manual sync after setting up a new client to get baseline data
2. Schedule cron job to run during off-peak hours
3. Monitor `tbl_fda_sync_log` for sync errors
4. Review FDA intelligence feed daily for high-risk items
5. Create action items immediately for critical recalls
