# FDA RegTech API Documentation

Complete API reference for the FDA Registration System.

## Base URL

Production: \`https://api.regtech.example.com\`
Development: \`http://localhost:3000/api\`

## Authentication

All API requests (except /auth/register and /auth/login) require JWT token in the Authorization header:

\`\`\`
Authorization: Bearer <jwt_token>
\`\`\`

Tokens are set as httpOnly cookies automatically on login/register.

## Error Responses

All errors follow this format:

\`\`\`json
{
  "error": "Error message",
  "status": 400,
  "timestamp": "2025-01-01T12:00:00Z"
}
\`\`\`

## Endpoints

### Authentication

#### Register
\`\`\`
POST /auth/register
Content-Type: application/json

{
  "organization_name": "Acme Pharma Inc",
  "email": "admin@acmepharma.com",
  "first_name": "John",
  "last_name": "Doe",
  "password": "SecurePassword123!",
  "password_confirm": "SecurePassword123!"
}

Response: 201
{
  "message": "Registration successful",
  "user": {
    "id": "uuid",
    "email": "admin@acmepharma.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
\`\`\`

#### Login
\`\`\`
POST /auth/login
Content-Type: application/json

{
  "email": "admin@acmepharma.com",
  "password": "SecurePassword123!"
}

Response: 200
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "admin@acmepharma.com",
    "roles": ["admin"]
  }
}
\`\`\`

### Clients

#### Get All Clients
\`\`\`
GET /clients

Response: 200
[
  {
    "id": "uuid",
    "organization_name": "Acme Pharma Inc",
    "organization_type": "Manufacturer",
    "fei_number": "1234567890",
    "status": "active",
    "created_at": "2025-01-01T12:00:00Z"
  }
]
\`\`\`

#### Create Client
\`\`\`
POST /clients
Content-Type: application/json

{
  "organization_name": "Acme Pharma Inc",
  "organization_type": "Manufacturer",
  "duns_number": "123456789",
  "fei_number": "1234567890"
}

Response: 201
{
  "id": "uuid",
  "organization_name": "Acme Pharma Inc",
  "status": "active",
  "created_at": "2025-01-01T12:00:00Z"
}
\`\`\`

### Facilities

#### Get Facilities
\`\`\`
GET /facilities?client_id=uuid

Response: 200
[
  {
    "id": "uuid",
    "client_id": "uuid",
    "facility_name": "Main Manufacturing Plant",
    "facility_type": "Manufacturer",
    "fei_number": "9876543210",
    "registration_status": "approved",
    "status": "active"
  }
]
\`\`\`

#### Create Facility
\`\`\`
POST /facilities
Content-Type: application/json

{
  "client_id": "uuid",
  "facility_name": "Main Manufacturing Plant",
  "facility_type": "Manufacturer",
  "street_address": "123 Main St",
  "city": "Springfield",
  "state_province": "IL",
  "postal_code": "62701",
  "country": "USA",
  "fei_number": "9876543210",
  "primary_contact_name": "Jane Smith",
  "primary_contact_email": "jane@acmepharma.com"
}

Response: 201
{
  "id": "uuid",
  "facility_name": "Main Manufacturing Plant",
  "registration_status": "draft"
}
\`\`\`

### Products

#### Get Products
\`\`\`
GET /products?client_id=uuid&facility_id=uuid

Response: 200
[
  {
    "id": "uuid",
    "product_name": "Aspirin 500mg Tablet",
    "product_code": "ASP-500",
    "product_type": "Drug",
    "product_classification": "Class I",
    "regulatory_pathway": "OTC",
    "status": "active"
  }
]
\`\`\`

#### Create Product
\`\`\`
POST /products
Content-Type: application/json

{
  "client_id": "uuid",
  "facility_id": "uuid",
  "product_name": "Aspirin 500mg Tablet",
  "product_code": "ASP-500",
  "product_type": "Drug",
  "product_classification": "Class I",
  "intended_use": "Pain reliever",
  "regulatory_pathway": "OTC",
  "ndc_number": "12345-678"
}

Response: 201
{
  "id": "uuid",
  "product_name": "Aspirin 500mg Tablet",
  "status": "active",
  "version": 1
}
\`\`\`

### Submissions

#### Get Submissions
\`\`\`
GET /submissions?client_id=uuid&status=submitted

Response: 200
[
  {
    "id": "uuid",
    "submission_type": "registration",
    "submission_status": "submitted",
    "submission_number": "SUB-2025-000001",
    "fda_submission_id": "FDA-123456",
    "submitted_date": "2025-01-01T12:00:00Z"
  }
]
\`\`\`

#### Create Submission
\`\`\`
POST /submissions
Content-Type: application/json

{
  "client_id": "uuid",
  "facility_id": "uuid",
  "submission_type": "registration",
  "product_ids": ["uuid1", "uuid2"]
}

Response: 201
{
  "id": "uuid",
  "submission_status": "draft",
  "submission_number": "SUB-2025-000001"
}
\`\`\`

#### Update Submission Status
\`\`\`
PUT /submissions/uuid
Content-Type: application/json

{
  "submission_status": "submitted",
  "comments": "Ready for FDA review"
}

Response: 200
{
  "id": "uuid",
  "submission_status": "submitted",
  "comments": "Ready for FDA review"
}
\`\`\`

### FDA Integration

#### Submit to FDA
\`\`\`
POST /fda/submit
Content-Type: application/json

{
  "submissionId": "uuid",
  "clientId": "uuid"
}

Response: 200
{
  "message": "Submission sent to FDA",
  "fdaSubmissionId": "FDA-123456"
}
\`\`\`

#### Check Submission Status
\`\`\`
GET /fda/status?submission_id=uuid&fda_submission_id=FDA-123456&client_id=uuid

Response: 200
{
  "status": "pending_review",
  "details": {...}
}
\`\`\`

### Audit Log

#### Get Audit Logs
\`\`\`
GET /audit-log?limit=100&offset=0&action=CREATE&entity_type=products

Response: 200
{
  "logs": [
    {
      "id": "uuid",
      "action": "CREATE",
      "entity_type": "products",
      "entity_id": "uuid",
      "timestamp": "2025-01-01T12:00:00Z",
      "status": "success"
    }
  ],
  "pagination": {
    "total": 250,
    "limit": 100,
    "offset": 0,
    "pages": 3
  }
}
\`\`\`

#### Generate Audit Report
\`\`\`
GET /audit-log/report?start_date=2025-01-01T00:00:00Z&end_date=2025-01-31T23:59:59Z

Response: 200
{
  "summary": {
    "period": {"start": "...", "end": "..."},
    "total_records": 1250,
    "by_action": {"CREATE": 500, "UPDATE": 600, "DELETE": 150},
    "by_entity": {"products": 400, "facilities": 200, ...},
    "by_status": {"success": 1200, "failure": 50}
  },
  "logs": [...]
}
\`\`\`

## Rate Limiting

API endpoints are rate limited to prevent abuse:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

Rate limit headers:
- \`X-RateLimit-Limit\`: Maximum requests allowed
- \`X-RateLimit-Remaining\`: Requests remaining
- \`X-RateLimit-Reset\`: Unix timestamp when limit resets

## Pagination

Responses with multiple records support pagination:

\`\`\`
GET /endpoint?limit=50&offset=0

Parameters:
- limit: Number of records (max 100)
- offset: Number of records to skip
\`\`\`

## Status Codes

- \`200\` - Success
- \`201\` - Created
- \`204\` - No Content
- \`400\` - Bad Request
- \`401\` - Unauthorized
- \`403\` - Forbidden
- \`404\` - Not Found
- \`409\` - Conflict
- \`500\` - Internal Server Error
