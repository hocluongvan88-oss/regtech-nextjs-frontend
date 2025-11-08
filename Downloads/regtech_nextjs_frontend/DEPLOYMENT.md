# FDA RegTech SaaS - Deployment Guide

## Vercel Deployment

### Prerequisites
- Vercel account
- GitHub repository
- PostgreSQL database (Neon recommended)
- FDA API credentials

### Step 1: Prepare Repository

1. Push your code to GitHub
   \`\`\`bash
   git add .
   git commit -m "Initial FDA RegTech commit"
   git push origin main
   \`\`\`

### Step 2: Deploy to Vercel

1. Visit https://vercel.com/new
2. Connect your GitHub repository
3. Select the project
4. Vercel will auto-detect Next.js configuration

### Step 3: Configure Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, add:

**Required Variables:**
- `NEON_DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Generate a strong 32+ character secret
  \`\`\`bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  \`\`\`
- `FDA_API_KEY` - Your FDA ESG NextGen API key
- `FDA_CLIENT_ID` - Your FDA client identifier

**Optional Variables:**
- `FDA_ESG_BASE_URL` - Default: https://esg.fda.gov/api/v1
- `FDA_USP_BASE_URL` - Default: https://submissions.fda.gov/api/v1
- `NODE_ENV` - Set to "production" for prod

### Step 4: Set Build Settings

1. Build Command: \`npm run build\`
2. Install Command: \`npm install\`
3. Development Command: \`npm run dev\`
4. Output Directory: \`.next\`

### Step 5: Deploy

1. Click "Deploy" button
2. Wait for build to complete
3. Your app will be live at https://[project-name].vercel.app

## Post-Deployment

### 1. Test Application
- Access your deployed URL
- Create test account
- Verify authentication works
- Test API endpoints

### 2. Configure Database
- Run migrations to ensure all tables exist
- Verify row-level security is enabled
- Test data isolation between tenants

### 3. Setup FDA Integration
- Test FDA API connection
- Verify submission endpoint works
- Check status synchronization

### 4. Enable Monitoring
- Setup error tracking (Sentry recommended)
- Configure log aggregation
- Set up alerts for critical issues

### 5. Security Checklist
- [ ] All environment variables are set
- [ ] Database backups are configured
- [ ] HTTPS is enforced
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] API keys are rotated
- [ ] Security headers are present

## Database Backups

### Neon Backups
1. Enable automated backups in Neon dashboard
2. Set backup frequency (daily recommended)
3. Configure retention policy

### Manual Backup
\`\`\`bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
\`\`\`

## Monitoring & Logging

### Application Logs
- Vercel Deployments tab shows build logs
- Real-time logs available in Vercel CLI

### Database Logs
- Access in Neon console
- Monitor slow queries
- Check connection metrics

### Audit Logs
- Available in dashboard at `/dashboard/audit-log`
- Generate compliance reports
- Export for regulatory purposes

## Troubleshooting

### Build Failures
- Check build logs in Vercel
- Verify all environment variables are set
- Ensure database connection is valid

### Runtime Errors
- Check Vercel error logs
- Review database query errors
- Verify FDA API connectivity

### Performance Issues
- Monitor database query performance
- Check API response times
- Scale as needed

## Rollback Procedure

1. Go to Vercel Dashboard
2. Click "Deployments"
3. Find previous working deployment
4. Click the three dots → "Promote to Production"

## Support

For deployment issues:
- Check Vercel status page
- Review application logs
- Contact support@regtech.example.com
