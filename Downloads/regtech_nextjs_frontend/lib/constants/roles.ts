export const ROLE_PERMISSIONS = {
  // ========== TIER 1: SYSTEM PROVIDER ADMIN ROLES ==========

  // System Administrator - Full system access for service provider
  system_administrator: [
    "manage_system_health",
    "manage_all_tenants",
    "create_tenant",
    "view_all_tenant_data",
    "manage_rbac_rules",
    "deploy_system_changes",
    "manage_audit_logs_system",
    "configure_domain_isolation",
    "create_rls_policies",
    "view_all_audit_logs",
  ],

  // Service Manager - Monitor compliance and audit for service provider
  service_manager: [
    "view_assigned_tenant_data",
    "monitor_compliance_status",
    "enforce_sod_policies",
    "view_audit_logs_assigned_tenants",
    "generate_compliance_reports",
  ],

  // ========== TIER 2: TENANT ADMIN & FDA ROLES ==========

  // Tenant Administrator - Internal admin for exporting company
  tenant_administrator: [
    "manage_internal_users",
    "assign_fda_roles",
    "manage_tenant_settings",
    "customize_tenant_interface",
    "manage_user_approval_requests",
    "view_all_tenant_data",
  ],

  // Official Correspondent - Chịu trách nhiệm đăng ký hàng năm, nhận thư từ FDA
  official_correspondent: [
    "manage_facilities",
    "manage_products",
    "create_submissions",
    "submit_registrations",
    "manage_renewal",
    "cancel_submissions",
    "edit_submissions",
    "view_submissions",
    "upload_documents",
    "view_documents",
    "manage_compliance",
    "view_audit_logs",
    "view_own_facilities",
  ],

  // US Agent - Điểm liên hệ tại Mỹ cho thanh tra và các vấn đề khẩn cấp
  us_agent: [
    "view_own_facilities",
    "view_submissions_readonly",
    "view_documents_readonly",
    "acknowledge_inspection",
    "view_compliance_status",
    "view_audit_logs_readonly",
  ],

  // Compliance Specialist - Hỗ trợ lập hồ sơ, quản lý QMS, theo dõi hạn chót
  compliance_specialist: [
    "view_facilities",
    "manage_products",
    "edit_documents",
    "manage_document_versions",
    "review_submissions",
    "view_submissions",
    "upload_documents",
    "view_audit_logs",
    "view_compliance_alerts",
    "manage_deadlines",
    "create_renewal_tasks",
  ],

  // Executive - Lãnh đạo công ty, giám sát trạng thái tuân thủ và rủi ro
  executive: [
    "view_dashboard",
    "view_compliance_status",
    "view_risk_reports",
    "view_audit_logs_readonly",
    "view_submissions_readonly",
    "export_reports",
  ],

  // Admin - Full system access
  admin: [
    "manage_clients",
    "manage_users",
    "manage_facilities",
    "manage_products",
    "manage_submissions",
    "view_all_tenant_data",
    "view_facilities",
    "view_products",
    "view_submissions",
    "view_audit_logs",
    "manage_compliance",
    "system_settings",
    "manage_roles",
    "view_all_data",
  ],

  // Legacy roles for backward compatibility
  compliance_officer: [
    "view_facilities",
    "manage_products",
    "review_submissions",
    "manage_compliance",
    "view_audit_logs",
    "upload_documents",
  ],

  submitter: [
    "view_own_facilities",
    "create_products",
    "submit_registrations",
    "view_own_submissions",
    "upload_documents",
  ],

  viewer: ["view_own_data", "view_submissions_readonly"],
} as const

export const SYSTEM_ROLES = [
  "system_administrator",
  "service_manager",
  "tenant_administrator",
  "admin",
  "official_correspondent",
  "us_agent",
  "compliance_specialist",
  "executive",
  "compliance_officer",
  "submitter",
  "viewer",
] as const

export const FDA_ROLE_DISPLAY_NAMES: Record<string, string> = {
  system_administrator: "System Administrator",
  service_manager: "Service Manager",
  tenant_administrator: "Tenant Administrator",
  official_correspondent: "Official Correspondent",
  us_agent: "U.S. Agent",
  compliance_specialist: "Compliance Specialist",
  executive: "Executive",
  admin: "Administrator",
  compliance_officer: "Compliance Officer",
  submitter: "Submitter",
  viewer: "Viewer",
}

export const ROLE_DESCRIPTIONS: Record<string, string> = {
  system_administrator:
    "System Administrator for service provider. Full access to platform infrastructure, tenant management, and system configuration.",
  service_manager:
    "Service Manager for service provider. Monitor compliance across assigned tenants, enforce separation of duties (SoD), and generate compliance reports.",
  tenant_administrator:
    "Tenant Administrator for exporting company. Manage internal users, assign FDA roles, configure tenant settings, and approve user role assignments.",
  official_correspondent:
    "Responsible for annual registration, receives FDA communications. Full authority over registrations and listings.",
  us_agent: "U.S. contact point for inspections and emergencies. Read-only access to facility and listing information.",
  compliance_specialist:
    "Supports document preparation, manages QMS, tracks deadlines. Can edit and review documents but cannot submit.",
  executive: "Company leadership. View-only access to dashboard, compliance status, and risk reports.",
  admin: "Full system access and management capabilities.",
  compliance_officer: "Can manage compliance, review submissions, and view audit logs.",
  submitter: "Can submit registrations and create products.",
  viewer: "Read-only access to own data and submissions.",
}
