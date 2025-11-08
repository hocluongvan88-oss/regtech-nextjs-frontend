// FDA RegTech SaaS Type Definitions

export type Client = {
  id: string
  organization_name: string
  organization_type?: string
  duns_number?: string
  fei_number?: string
  registration_date: Date
  status: "active" | "inactive" | "suspended"
  created_at: Date
  updated_at: Date
  deleted_at?: Date
}

export type ClientFacility = {
  id: string
  client_id: string
  facility_name: string
  facility_type?: string
  street_address?: string
  city?: string
  state_province?: string
  postal_code?: string
  country?: string
  fei_number?: string
  duns_number?: string
  primary_contact_name?: string
  primary_contact_email?: string
  primary_contact_phone?: string
  status: "active" | "inactive" | "suspended"
  registration_status: "draft" | "submitted" | "approved" | "rejected"
  created_at: Date
  updated_at: Date
}

export type Product = {
  id: string
  client_id: string
  facility_id?: string
  product_name: string
  product_code?: string
  product_type?: string
  product_classification?: "Class I" | "Class II" | "Class III"
  intended_use?: string
  regulatory_pathway?: string
  device_list_number?: string
  ndc_number?: string
  status: "active" | "inactive"
  version: number
  created_at: Date
  updated_at: Date
}

export type User = {
  id: string
  client_id: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  status: "active" | "inactive" | "suspended"
  email_verified: boolean
  email_verified_at?: Date
  last_login?: Date
  created_at: Date
  updated_at: Date
}

export type Role = "admin" | "compliance_officer" | "submitter" | "viewer"

export type Submission = {
  id: string
  client_id: string
  facility_id: string
  submission_type: "registration" | "amendment" | "renewal"
  submission_status: "draft" | "submitted" | "pending_review" | "approved" | "rejected"
  submission_number?: string
  fda_submission_id?: string
  submitted_date?: Date
  submitted_by?: string
  reviewed_date?: Date
  reviewed_by?: string
  approval_date?: Date
  expiration_date?: Date
  comments?: string
  rejection_reason?: string
  created_at: Date
  updated_at: Date
}

export type AuditLogEntry = {
  id: string
  client_id: string
  user_id?: string
  action: "CREATE" | "UPDATE" | "DELETE" | "VIEW" | "SUBMIT" | "APPROVE"
  entity_type: string
  entity_id?: string
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  ip_address?: string
  timestamp: Date
  status: "success" | "failure"
}

export type ServiceContract = {
  id: string
  client_id: string
  facility_id?: string
  contract_type: "US_AGENT_REP" | "QMS_SUPPORT" | "COMPLIANCE_SERVICES"
  contract_start_date: string // ISO date
  contract_end_date: string // ISO date
  contract_duration_months: number
  contract_status: "active" | "pending_renewal" | "expired" | "cancelled" | "suspended"
  billing_status: "paid" | "due" | "overdue" | "failed" | "cancelled"
  agent_user_id?: string
  assigned_by?: string
  assigned_date: string
  contract_notes?: string
  created_at: string
  updated_at: string
}

export type AgentConsentTracking = {
  id: string
  service_contract_id: string
  client_id: string
  facility_id?: string
  agent_user_id: string
  agent_email: string
  consent_status: "pending" | "acknowledged" | "declined" | "timeout"
  acknowledgment_deadline_date: string // ISO date
  acknowledged_date?: string
  acknowledgment_overdue: boolean
  consent_requested_date: string
  created_at: string
}

export type ClientServiceStatus = {
  id: string
  client_id: string
  has_active_us_agent_contract: boolean
  last_active_contract_end_date?: string
  services_suspended: boolean
  suspension_reason?: string
  compliance_status: "compliant" | "non_compliant" | "at_risk"
  days_since_contract_expired?: number
  last_checked: string
}

export type RegulatoryIntelligence = {
  id: string
  client_id: string
  regulatory_body: string
  change_type: string
  title: string
  description?: string
  source_url?: string
  regulatory_reference_id?: string
  content_summary?: string
  preliminary_impact_assessment?: string
  affected_areas: string[]
  risk_level: "low" | "medium" | "high" | "critical"
  announcement_date?: string
  effective_date?: string
  comment_deadline_date?: string
  status: "new" | "under_review" | "requires_action" | "implemented" | "archived"
  rcm_officer_id?: string
  action_required: boolean
  action_items_count: number
  created_at: string
  updated_at: string
}

export type RCMActionItem = {
  id: string
  client_id: string
  regulatory_intelligence_id: string
  action_title: string
  action_description?: string
  action_type: string
  assigned_to: string
  department?: string
  due_date: string
  priority: "low" | "medium" | "high" | "critical"
  status: "pending" | "in_progress" | "completed" | "blocked" | "cancelled"
  completion_date?: string
  risk_if_not_completed?: string
  estimated_hours?: number
  created_at: string
  updated_at: string
}

export type RCMImpactAssessment = {
  id: string
  client_id: string
  regulatory_intelligence_id: string
  assessment_date: string
  assessed_by: string
  labeling_impact_required: boolean
  labeling_update_hours?: number
  quality_impact_required: boolean
  qms_update_hours?: number
  manufacturing_impact_required: boolean
  manufacturing_change_hours?: number
  training_required: boolean
  training_estimated_hours?: number
  total_estimated_hours: number
  estimated_cost_usd?: number
  implementation_risk: "low" | "medium" | "high"
  compliance_risk_if_not_implemented: "low" | "medium" | "high"
  status: "pending_approval" | "approved" | "rejected" | "in_progress"
  approved_by?: string
  created_at: string
  updated_at: string
}

export type ServiceRequest = {
  id: string
  client_id: string
  request_type: string
  request_category?: string
  priority: "low" | "medium" | "high" | "critical" | "urgent"
  title: string
  description?: string
  regulatory_source?: string
  reference_number?: string
  assigned_to: string
  secondary_assignee?: string
  created_by: string
  received_date?: string
  required_response_date?: string
  estimated_completion_date?: string
  status: "open" | "in_progress" | "pending_info" | "escalated" | "on_hold" | "resolved" | "closed" | "cancelled"
  status_reason?: string
  attachment_count: number
  resolution_summary?: string
  resolved_date?: string
  resolved_by?: string
  created_at: string
  updated_at: string
}

export type ServiceRequestActivity = {
  id: string
  service_request_id: string
  client_id: string
  activity_type: string
  title?: string
  description?: string
  created_by: string
  metadata?: any
  created_at: string
}

export type ServiceRequestEscalation = {
  id: string
  service_request_id: string
  client_id: string
  escalation_reason: string
  escalated_from_user?: string
  escalated_to_user: string
  escalation_date: string
  required_resolution_date?: string
  status: "pending" | "acknowledged" | "resolved" | "cancelled"
  resolution_notes?: string
  created_at: string
  updated_at: string
}

export type ServiceRequestSLA = {
  id: string
  service_request_id: string
  client_id: string
  response_time_hours: number
  resolution_time_hours: number
  first_response_time_hours?: number
  resolution_time_hours_actual?: number
  response_sla_met?: boolean
  resolution_sla_met?: boolean
  response_sla_warning: boolean
  resolution_sla_warning: boolean
  created_at: string
  updated_at: string
}
