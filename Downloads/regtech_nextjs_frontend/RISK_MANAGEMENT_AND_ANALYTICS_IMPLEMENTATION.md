# Risk Management & Advanced Analytics Module Implementation

## Overview
Complete implementation of Risk Management and Advanced Analytics modules with database schemas, service layers, APIs, and React components.

## Database Schema Changes
### New Tables Created (8 total):
1. **tbl_risk_registers** - Risk catalog with probability/impact scoring
2. **tbl_risk_mitigations** - Mitigation strategies and tracking
3. **tbl_risk_assessments** - Periodic risk assessments (quarterly/annual)
4. **tbl_compliance_analytics** - Daily compliance metrics and FDA events
5. **tbl_kpi_tracking** - Key Performance Indicators with status tracking
6. **tbl_trend_analysis** - Historical trend data for charts
7. **tbl_risk_audit_trail** - Audit trail for 21 CFR Part 11 compliance

### Run Migration:
\`\`\`bash
npm run db:migrate scripts/10_add_risk_management_analytics_schema.sql
\`\`\`

## Risk Management Module

### Features:
- Risk Register: Create/track risks with probability/impact scoring
- Risk Score Calculation: 1-64 scale (probability × impact × 4)
- Risk Mitigation: Track mitigation strategies with effectiveness ratings
- Risk Assessments: Periodic risk assessments with category breakdowns
- Risk Status: open, mitigated, monitoring, closed

### API Endpoints (4 total):
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/risk-management/registers` | GET/POST | Create/list risk registers |
| `/api/risk-management/mitigations` | GET/POST | Track mitigation actions |
| `/api/risk-management/assessments` | GET/POST | Create/view risk assessments |
| `/api/risk-management/[registerId]/status` | PUT | Update risk status |

### Usage Examples:

#### Create Risk Register:
\`\`\`typescript
const response = await fetch('/api/risk-management/registers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    clientId: 'client-123',
    facilityId: 'facility-456',
    risk_category: 'regulatory',
    risk_title: 'FDA Inspection Unpreparedness',
    risk_description: 'Facility not ready for FDA inspection',
    probability: 'high',
    impact: 'critical',
    identified_date: '2025-01-15'
  })
})
\`\`\`

#### Get Risk Registers:
\`\`\`typescript
const risks = await fetch(
  '/api/risk-management/registers?clientId=client-123&facilityId=facility-456'
).then(r => r.json())
\`\`\`

#### Create Mitigation:
\`\`\`typescript
const mitigation = await fetch('/api/risk-management/mitigations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    riskRegisterId: 'risk-789',
    mitigation_title: 'Pre-Inspection Audit',
    mitigation_description: 'Conduct internal audit before FDA visit',
    mitigation_strategy: 'reduce',
    assigned_to: 'user-456',
    target_completion_date: '2025-02-01'
  })
}).then(r => r.json())
\`\`\`

## Analytics Module

### Features:
- Compliance Analytics: Daily/weekly/monthly compliance metrics
- FDA Event Tracking: 483s, warning letters, complaints
- KPI Tracking: Monitor key performance indicators with status alerts
- Trend Analysis: Historical trend data for visualization
- Risk Scoring: Automatic risk score calculation from compliance data

### API Endpoints (3 total):
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/analytics/compliance` | GET/POST | Compliance metrics and analytics |
| `/api/analytics/kpi` | GET/POST | KPI tracking and measurement |
| `/api/analytics/trends` | GET/POST | Trend data collection/retrieval |

### Usage Examples:

#### Generate Compliance Analytics:
\`\`\`typescript
const analytics = await fetch('/api/analytics/compliance', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    clientId: 'client-123',
    facilityId: 'facility-456'
  })
}).then(r => r.json())
// Returns: compliance_percentage, fda_483_count, warning_letters, etc.
\`\`\`

#### Track KPI:
\`\`\`typescript
const kpi = await fetch('/api/analytics/kpi', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    clientId: 'client-123',
    kpi_name: 'On-Time Submission Rate',
    current_value: 94.5,
    target_value: 95,
    category: 'efficiency'
  })
}).then(r => r.json())
// Returns: status (on_track, at_risk, critical), trend
\`\`\`

#### Get KPI by Category:
\`\`\`typescript
const kpis = await fetch(
  '/api/analytics/kpi?clientId=client-123&category=compliance'
).then(r => r.json())
\`\`\`

## React Components

### Risk Management Components:
1. **RiskRegisterList** - Display and manage risk register
   - Properties: `clientId`, `facilityId` (optional)
   - Features: Real-time risk count, critical risk highlight, risk scoring

2. **RiskAssessmentChart** - Visualize risk trends
   - Properties: `clientId`
   - Features: Line chart showing overall/compliance/operational trends

### Analytics Components:
1. **ComplianceMetricsDashboard** - Main compliance metrics view
   - Properties: `clientId`
   - Features: Compliance %, FDA events, trend charts, 30-day history

2. **KPIDashboard** - KPI tracking and monitoring
   - Properties: `clientId`
   - Features: Category filtering, status badges, trend indicators, progress bars

## Integration with Existing System

### Type Definitions:
All types are exported in `lib/types/index.ts`:
\`\`\`typescript
export interface RiskRegister { ... }
export interface RiskAssessment { ... }
export interface ComplianceAnalytics { ... }
export interface KPITracking { ... }
\`\`\`

### Service Layers:
- `lib/risk-management-service.ts` - Risk business logic
- `lib/analytics-service.ts` - Analytics business logic

### Audit Trail:
All risk and analytics changes logged via `logAuditTrail()` for 21 CFR Part 11 compliance.

## Security Implementation

### Row Level Security (RLS):
- **risk_register_access**: Users see only their client's risks
- **risk_mitigation_access**: Users see assigned mitigations
- **compliance_analytics_access**: Users see their client's analytics

### Data Isolation:
Multi-tenant data isolation enforced at database level. All queries filtered by `client_id`.

## Testing Checklist

- [ ] Create risk register via API
- [ ] Update risk status
- [ ] Create risk mitigation
- [ ] Fetch risk assessments
- [ ] Generate compliance analytics
- [ ] Track KPI
- [ ] Fetch trend data
- [ ] Verify audit trail entries
- [ ] Test RLS access control
- [ ] Verify components render correctly
- [ ] Validate risk score calculations
- [ ] Check KPI status transitions

## Next Steps

1. Create cron job to auto-generate compliance analytics daily
2. Add email alerts for critical risks
3. Implement risk heat maps by facility
4. Add export functionality (PDF/Excel)
5. Create regulatory change impact assessment workflow
6. Add risk rollup views for parent organizations

## Performance Optimization

- Indexes created on frequently queried fields
- Historical data archival strategy for trend analysis
- Caching strategy for KPI calculations
- Pagination for large risk/analytics result sets

---
**Implementation Date**: January 2025
**Status**: Complete
**Compliance**: 21 CFR Part 11, FDA 21 CFR Part 312
