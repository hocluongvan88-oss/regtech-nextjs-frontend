# COMPREHENSIVE UI/UX, RBAC & RLS AUDIT REPORT
## FDA RegTech SaaS System - Complete Analysis

**Date:** January 2025  
**Audit Scope:** Full system review of UI/UX, RBAC implementation, and Multi-tenant RLS enforcement

---

## EXECUTIVE SUMMARY

### Critical Issues Found: 12
### High Priority Issues: 8  
### Medium Priority Issues: 6
### Total Issues: 26

---

## PART 1: RBAC & PERMISSION ISSUES

### CRITICAL ISSUES

#### 1. **NO RBAC ENFORCEMENT ON CLIENT-SIDE PAGES** ❌
**Severity:** CRITICAL  
**Impact:** Any authenticated user can access any page regardless of role

**Affected Files:**
- `/app/dashboard/facilities/page.tsx` - No permission check
- `/app/dashboard/products/page.tsx` - No permission check  
- `/app/dashboard/submissions/page.tsx` - No permission check
- `/app/dashboard/documents/page.tsx` - No permission check
- `/app/dashboard/compliance/page.tsx` - No permission check
- `/app/dashboard/renewals/page.tsx` - No permission check
- `/app/dashboard/contracts/page.tsx` - No permission check
- `/app/dashboard/fees/page.tsx` - No permission check
- `/app/dashboard/rcm/page.tsx` - No permission check
- `/app/dashboard/risk/page.tsx` - No permission check

**Required Fix:**
\`\`\`typescript
// Every page needs:
import { useAuth } from "@/lib/hooks/use-auth"
import { ROLE_PERMISSIONS } from "@/lib/constants/roles"

export default function Page() {
  const { user, hasPermission } = useAuth()
  
  // Check permission
  if (!hasPermission("view_facilities")) {
    return <AccessDenied />
  }
  
  // Rest of component
}
\`\`\`

#### 2. **NO CLIENT CONTEXT IN API CALLS** ❌
**Severity:** CRITICAL  
**Impact:** RLS cannot be enforced - users can access other tenants' data

**Affected Files:**
- All `/app/dashboard/**/page.tsx` files make API calls without headers

**Current Code:**
\`\`\`typescript
const response = await fetch("/api/facilities")
\`\`\`

**Required Fix:**
\`\`\`typescript
const response = await fetch("/api/facilities", {
  headers: {
    "x-client-id": user.clientId,
    "x-user-id": user.id,
    "x-user-roles": JSON.stringify(user.roles),
  }
})
\`\`\`

#### 3. **MISSING API ROUTE RLS ENFORCEMENT** ❌
**Severity:** CRITICAL  
**Impact:** API routes don't use RLS handlers - direct database access without tenant filtering

**Affected Files:**
- `/app/api/facilities/route.ts` - Missing
- `/app/api/products/route.ts` - Missing
- `/app/api/submissions/route.ts` - Missing
- `/app/api/documents/route.ts` - Missing

**Required Fix:**
\`\`\`typescript
import { withRLSEnforcement } from "@/lib/api-rls-handler"

export const GET = withRLSEnforcement(async (request, context) => {
  // context.clientId is automatically enforced
  const facilities = await getFacilitiesWithRLS(context.clientId)
  return NextResponse.json(facilities)
})
\`\`\`

---

### HIGH PRIORITY ISSUES

#### 4. **NO ROLE-BASED UI HIDING** ⚠️
**Severity:** HIGH  
**Impact:** Users see buttons/actions they can't perform

**Example:** US Agent sees "Edit" and "Delete" buttons but shouldn't

**Required Fix:**
\`\`\`typescript
{hasPermission("manage_facilities") && (
  <Button onClick={handleEdit}>Edit</Button>
)}

{hasPermission("delete_facilities") && (
  <Button onClick={handleDelete}>Delete</Button>
)}
\`\`\`

#### 5. **MISSING useAuth HOOK** ⚠️
**Severity:** HIGH  
**Impact:** No centralized way to check permissions in components

**Required:** Create `/lib/hooks/use-auth.ts`

#### 6. **NO SEPARATION OF DUTIES (SoD) ENFORCEMENT** ⚠️
**Severity:** HIGH  
**Impact:** Users can approve their own submissions

**Required:** Implement SoD checks in approval workflows

#### 7. **MISSING TENANT CONTEXT PROVIDER** ⚠️
**Severity:** HIGH  
**Impact:** No global state for current tenant/user

**Required:** Create React Context for auth state

---

## PART 2: MULTI-TENANT RLS ISSUES

### CRITICAL ISSUES

#### 8. **NO RLS CONTEXT SET IN MIDDLEWARE** ❌
**Severity:** CRITICAL  
**Impact:** Database session variables not set - RLS views won't work

**File:** `/middleware.ts`

**Required Fix:**
\`\`\`typescript
// In middleware, after auth check:
await setRLSContext({
  clientId: user.clientId,
  userId: user.id,
  isSystemAdmin: user.roles.includes("system_administrator"),
  isServiceManager: user.roles.includes("service_manager"),
})
\`\`\`

#### 9. **API ROUTES DON'T VERIFY RECORD OWNERSHIP** ❌
**Severity:** CRITICAL  
**Impact:** Users can access records from other tenants by guessing IDs

**Example:** `/api/facilities/[id]/route.ts`

**Required Fix:**
\`\`\`typescript
export const GET = withRLSEnforcement(async (request, context) => {
  const { id } = params
  
  // Verify ownership
  const owns = await verifyRecordOwnership("tbl_client_facilities", id, context.clientId)
  if (!owns) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  
  // Fetch data
})
\`\`\`

---

### HIGH PRIORITY ISSUES

#### 10. **MISSING RLS ENFORCEMENT IN SEARCH/FILTER** ⚠️
**Severity:** HIGH  
**Impact:** Search across all tenants possible

**Required:** All search queries must include `client_id` filter

#### 11. **NO AUDIT LOG FOR RLS VIOLATIONS** ⚠️
**Severity:** HIGH  
**Impact:** Can't detect unauthorized access attempts

**Required:** Log all failed ownership checks

---

## PART 3: UI/UX MISSING FEATURES

### CRITICAL MISSING PAGES

#### 12. **NO USER MANAGEMENT PAGE** ❌
**Required for:** Tenant Administrator role  
**Path:** `/dashboard/users`  
**Features:**
- List users in tenant
- Invite new users
- Assign roles (with OC approval for compliance_specialist)
- Deactivate users

#### 13. **NO ROLE ASSIGNMENT APPROVAL WORKFLOW** ❌
**Required for:** Official Correspondent approval  
**Path:** `/dashboard/users/approvals`  
**Features:**
- Pending role assignment requests
- Approve/reject with reason
- Audit trail

#### 14. **NO SYSTEM ADMIN DASHBOARD** ❌
**Required for:** System Administrator & Service Manager  
**Path:** `/admin/dashboard`  
**Features:**
- Tenant list
- System health metrics
- Cross-tenant compliance overview
- Zero-access approval requests

#### 15. **NO ACCESS DENIED PAGE** ❌
**Required for:** RBAC enforcement  
**Path:** `/dashboard/access-denied`  
**Features:**
- Clear message about insufficient permissions
- Contact admin button
- Return to dashboard

---

### HIGH PRIORITY MISSING COMPONENTS

#### 16. **NO PERMISSION-AWARE BUTTON COMPONENT** ⚠️
**Required:** Wrapper that hides buttons based on permissions

\`\`\`typescript
<PermissionButton permission="manage_facilities" onClick={handleEdit}>
  Edit
</PermissionButton>
\`\`\`

#### 17. **NO ROLE BADGE COMPONENT** ⚠️
**Required:** Display user roles with proper styling

#### 18. **NO TENANT SWITCHER (for System Admin)** ⚠️
**Required:** System admins need to switch between tenants

---

### MEDIUM PRIORITY MISSING FEATURES

#### 19. **NO BULK ACTIONS** 
**Affected:** Facilities, Products, Documents pages  
**Required:** Select multiple items and perform batch operations

#### 20. **NO EXPORT FUNCTIONALITY**
**Affected:** All list pages  
**Required:** Export to CSV/Excel with RLS filtering

#### 21. **NO ADVANCED FILTERS**
**Affected:** All list pages  
**Required:** Date range, status, type filters

#### 22. **NO PAGINATION**
**Affected:** All list pages  
**Required:** Handle large datasets (100+ records)

#### 23. **NO LOADING SKELETONS**
**Affected:** All pages  
**Required:** Better UX during data fetch

#### 24. **NO ERROR BOUNDARIES**
**Affected:** All pages  
**Required:** Graceful error handling

---

## PART 4: MISSING API ROUTES

### CRITICAL

#### 25. **MISSING CORE API ROUTES** ❌
- `/api/facilities/route.ts` - GET, POST
- `/api/facilities/[id]/route.ts` - GET, PUT, DELETE
- `/api/products/route.ts` - GET, POST
- `/api/products/[id]/route.ts` - GET, PUT, DELETE
- `/api/submissions/route.ts` - GET, POST
- `/api/submissions/[id]/route.ts` - GET, PUT, DELETE
- `/api/documents/route.ts` - GET, POST
- `/api/documents/[id]/route.ts` - GET, PUT, DELETE
- `/api/users/route.ts` - GET, POST (tenant users)
- `/api/users/[id]/route.ts` - GET, PUT, DELETE
- `/api/users/approvals/route.ts` - GET, POST (role approvals)

### HIGH PRIORITY

#### 26. **MISSING UTILITY API ROUTES** ⚠️
- `/api/auth/me` - Get current user with permissions
- `/api/auth/permissions` - Check specific permission
- `/api/audit/logs` - Get audit logs with RLS
- `/api/search` - Global search with RLS

---

## IMPLEMENTATION PRIORITY

### PHASE 1: SECURITY CRITICAL (Week 1)
1. Create `useAuth` hook
2. Create Auth Context Provider
3. Add RLS enforcement to all API routes
4. Add RBAC checks to all pages
5. Create Access Denied page
6. Fix API calls to include client context headers

### PHASE 2: CORE FUNCTIONALITY (Week 2)
7. Create all missing API routes
8. Add record ownership verification
9. Implement audit logging for violations
10. Create User Management page
11. Create Role Approval Workflow page

### PHASE 3: SYSTEM ADMIN (Week 3)
12. Create System Admin Dashboard
13. Create Tenant Switcher
14. Implement Zero-Access approval workflow
15. Add cross-tenant reporting

### PHASE 4: UX IMPROVEMENTS (Week 4)
16. Add pagination to all lists
17. Add advanced filters
18. Add bulk actions
19. Add export functionality
20. Add loading skeletons
21. Add error boundaries

---

## COMPLIANCE IMPACT

**Current State:** System is NOT compliant with:
- 21 CFR Part 11 (no proper access controls)
- Multi-tenant security requirements (RLS not enforced)
- FDA requirements (no role separation)

**Risk Level:** CRITICAL - System should not be used in production

**Estimated Fix Time:** 4 weeks for full compliance

---

## NEXT STEPS

1. **IMMEDIATE:** Implement Phase 1 (Security Critical)
2. **Week 2:** Implement Phase 2 (Core Functionality)
3. **Week 3:** Implement Phase 3 (System Admin)
4. **Week 4:** Implement Phase 4 (UX Improvements)
5. **Week 5:** Full system testing and validation

---

**Report Generated:** January 2025  
**Auditor:** v0 AI System Analyst
