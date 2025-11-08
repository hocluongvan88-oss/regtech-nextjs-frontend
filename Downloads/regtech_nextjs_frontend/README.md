# FDA Registration System (RegTech SaaS)

Enterprise-grade multi-tenant SaaS platform for FDA facility registration, product compliance, and regulatory submission management.

## Overview

This system provides a complete solution for pharmaceutical and medical device manufacturers to:
- Register manufacturing facilities with FDA
- Manage product information and classifications
- Track FDA compliance status
- Submit registrations electronically via FDA ESG NextGen and Unified Submission Portal APIs
- Maintain complete audit logs for regulatory compliance
- Generate compliance reports

## Features

### Core Capabilities
- **Multi-Tenant Architecture**: Complete tenant isolation with Row-Level Security (RLS)
- **FDA Compliance**: Built to FDA regulations with comprehensive audit logging
- **Facility Management**: Register and manage multiple manufacturing facilities
- **Product Management**: Track products with classifications and regulatory pathways
- **Submission Workflow**: Draft → Review → Submit → Approval workflow
- **FDA API Integration**: Direct integration with FDA ESG NextGen and Unified Submission Portal
- **Audit Logging**: Complete activity tracking for regulatory audits
- **Role-Based Access**: Admin, Compliance Officer, Submitter, and Viewer roles

### Security Features
- JWT-based authentication with secure password hashing (bcrypt)
- Row-Level Security (RLS) for multi-tenant data isolation
- HTTPS/TLS encryption for all communications
- Comprehensive audit logging of all system actions
- IP tracking and user agent logging
- Soft delete for data retention compliance

## Architecture

### Tech Stack
- **Frontend**: Next.js 16, React 19.2, TypeScript, Tailwind CSS
- **Backend**: Next.js Route Handlers, Node.js
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT + Custom Auth
- **APIs**: RESTful with comprehensive error handling

### Database Schema
- **Tenants**: `tbl_clients` (organizations)
- **Facilities**: `tbl_client_facilities`
- **Products**: `tbl_products`, `tbl_product_ingredients`
- **Users**: `tbl_users`, `tbl_roles`, `tbl_user_roles`
- **Submissions**: `tbl_submissions`, `tbl_submission_products`
- **Compliance**: `tbl_compliance_status`, `tbl_reminders`
- **Documents**: `tbl_documents`
- **Audit**: `tbl_audit_log`, `tbl_fda_api_log`

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon recommended)
- FDA API credentials (ESG NextGen & USP)

### Installation

1. **Clone and install dependencies**
   \`\`\`bash
   git clone <repository>
   cd fda-regtech
   npm install
   \`\`\`

2. **Configure environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

3. **Set required environment variables**
   - `NEON_DATABASE_URL`: PostgreSQL connection string
   - `JWT_SECRET`: Secret key for JWT signing (min 32 chars)
   - `FDA_API_KEY`: FDA ESG NextGen API key
   - `FDA_CLIENT_ID`: FDA client identifier

4. **Run database migrations**
   \`\`\`bash
   npm run db:migrate
   \`\`\`

5. **Start development server**
   \`\`\`bash
   npm run dev
   \`\`\`

Visit http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new organization
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Clients (Tenants)
- `GET /api/clients` - List all clients
- `POST /api/clients` - Create new client
- `GET /api/clients/[clientId]` - Get client details
- `PUT /api/clients/[clientId]` - Update client
- `DELETE /api/clients/[clientId]` - Delete client

### Facilities
- `GET /api/facilities` - List facilities
- `POST /api/facilities` - Create facility
- `GET /api/facilities/[facilityId]` - Get facility details
- `PUT /api/facilities/[facilityId]` - Update facility
- `DELETE /api/facilities/[facilityId]` - Delete facility

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/products/[productId]` - Get product details
- `PUT /api/products/[productId]` - Update product
- `DELETE /api/products/[productId]` - Delete product

### Submissions
- `GET /api/submissions` - List submissions
- `POST /api/submissions` - Create submission
- `GET /api/submissions/[submissionId]` - Get submission details
- `PUT /api/submissions/[submissionId]` - Update submission
- `GET /api/submissions/[submissionId]/products` - Get submission products
- `GET /api/submissions/[submissionId]/documents` - Get submission documents

### FDA Integration
- `POST /api/fda/submit` - Submit to FDA
- `GET /api/fda/status` - Check FDA submission status
- `POST /api/fda/sync-status` - Sync all submission statuses

### Audit & Compliance
- `GET /api/audit-log` - Get audit logs
- `GET /api/audit-log/report` - Generate audit report
- `GET /api/compliance` - Get compliance status

## User Roles & Permissions

### Admin
- Full system access
- Manage clients and users
- View all audit logs
- Manage compliance settings

### Compliance Officer
- View and manage facilities
- Review submissions
- Track compliance status
- Generate reports

### Submitter
- Create and submit registrations
- Manage own facilities and products
- Upload documents
- Track own submissions

### Viewer
- Read-only access
- View submissions and compliance status
- Cannot make changes

## Deployment

### Deploy to Vercel
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

\`\`\`bash
vercel deploy
\`\`\`

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure all FDA API credentials
- [ ] Set strong `JWT_SECRET`
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up monitoring and alerts
- [ ] Configure backups for database
- [ ] Review security settings
- [ ] Test all API endpoints
- [ ] Conduct security audit

## Testing

### Run tests
\`\`\`bash
npm run test
\`\`\`

### Test Coverage
\`\`\`bash
npm run test:coverage
\`\`\`

## Compliance

This system is designed for FDA compliance with:
- Row-Level Security (RLS) for data isolation
- Comprehensive audit logging
- User activity tracking
- Data encryption
- Secure authentication
- Privacy controls

## Support

For issues or questions, contact support@regtech.example.com

## License

Proprietary - All rights reserved
