export const COMPLIANCE_EVENT_TYPES = {
  RENEWAL: "renewal",
  ANNUAL_FEE: "annual_fee",
  INSPECTION: "inspection",
  WARNING_LETTER: "warning_letter",
  RECALL: "recall",
  PRODUCT_LISTING: "product_listing",
  FACILITY_REGISTRATION: "facility_registration",
  COE_SUBMISSION: "coe_submission",
  DOCUMENT_REVIEW: "document_review",
} as const

export const RENEWAL_ALERT_THRESHOLDS = {
  CRITICAL: 30, // 30 days before deadline
  HIGH: 60, // 60 days before deadline
  MEDIUM: 90, // 90 days before deadline
}

export const PRODUCT_REGULATORY_PATHWAYS = {
  DEVICES_510K: "510k",
  DEVICES_PMA: "pma",
  DRUGS_NDA: "nda",
  DRUGS_ANDA: "anda",
  FOOD_FACILITY_REGISTRATION: "food_facility",
  COSMETIC_FACILITY_REGISTRATION: "cosmetic_facility",
} as const

export const US_AGENT_RESPONSE_TIME = 10 // 10 business days per FDA

export const COMPLIANCE_STATUSES = {
  COMPLIANT: "compliant",
  NON_COMPLIANT: "non_compliant",
  PENDING_APPROVAL: "pending_approval",
  ACTION_REQUIRED: "action_required",
  IN_REVIEW: "in_review",
}
