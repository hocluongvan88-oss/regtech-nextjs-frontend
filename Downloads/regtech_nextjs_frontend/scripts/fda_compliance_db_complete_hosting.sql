-- ============================================================
-- FDA COMPLIANCE DATABASE - COMPLETE VERSION FOR HOSTING
-- ============================================================
-- This file contains ALL production tables for SQL hosting
-- The CREATE DATABASE statement has been removed (pre-created by host)
-- Compatible with: cPanel, Plesk, AWS RDS, Google Cloud SQL, Azure
--
-- UPLOAD INSTRUCTIONS:
-- 1. Login to your hosting control panel (cPanel/Plesk)
-- 2. Open phpMyAdmin
-- 3. Select the 'fda_compliance_db' database
-- 4. Click "Import" tab
-- 5. Choose this file and click "Go"
-- ============================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- ============================================================
-- SECTION 1: CORE TABLES (Organizations, Users, Products)
-- ============================================================

CREATE TABLE IF NOT EXISTS `organizations` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `fda_registration_number` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `duns_number` varchar(9) DEFAULT NULL COMMENT 'D-U-N-S Number',
  `duns_verified` tinyint(1) DEFAULT 0,
  `duns_verified_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fda_registration_number` (`fda_registration_number`),
  KEY `idx_organizations_duns` (`duns_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(36) NOT NULL,
  `organization_id` varchar(36) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `role` enum('user','admin','official_correspondent','establishment_contact','super_admin') NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `duns_number` varchar(9) DEFAULT NULL,
  `renewal_years` int(11) DEFAULT 1 CHECK (`renewal_years` in (1,2,3,5)),
  `two_fa_enabled` tinyint(1) DEFAULT 0,
  `two_fa_secret` varchar(255) DEFAULT NULL,
  `two_fa_verified_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_organization` (`organization_id`),
  KEY `idx_email` (`email`),
  KEY `idx_users_duns` (`duns_number`),
  KEY `idx_users_organization` (`organization_id`),
  KEY `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `tbl_users` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `client_id` char(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `position` varchar(100) DEFAULT NULL,
  `role_id` char(36) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tbl_users_email` (`email`),
  KEY `idx_tbl_users_client_id` (`client_id`),
  KEY `idx_tbl_users_role_id` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `establishment_registrations` (
  `id` varchar(36) NOT NULL,
  `organization_id` varchar(36) NOT NULL,
  `fda_registration_number` varchar(50) NOT NULL,
  `establishment_name` varchar(255) NOT NULL,
  `establishment_type` varchar(100) DEFAULT NULL,
  `address` text NOT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `zip_code` varchar(20) DEFAULT NULL,
  `country` varchar(100) NOT NULL,
  `official_correspondent_id` varchar(36) DEFAULT NULL,
  `registration_date` date NOT NULL,
  `expiration_date` date NOT NULL,
  `status` varchar(50) DEFAULT 'active',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `fda_registration_number` (`fda_registration_number`),
  KEY `official_correspondent_id` (`official_correspondent_id`),
  KEY `idx_organization` (`organization_id`),
  KEY `idx_status` (`status`),
  KEY `idx_expiration` (`expiration_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `tbl_client_facilities` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `client_id` char(36) NOT NULL,
  `facility_name` varchar(255) NOT NULL,
  `facility_type` varchar(100) DEFAULT NULL,
  `address` text NOT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `zip_code` varchar(20) DEFAULT NULL,
  `country` varchar(100) NOT NULL,
  `status` varchar(50) DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_tbl_client_facilities_client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `products` (
  `id` varchar(36) NOT NULL,
  `organization_id` varchar(36) NOT NULL,
  `registration_id` varchar(36) DEFAULT NULL,
  `product_code` varchar(50) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_type` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `ndc_number` varchar(50) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `listing_date` date NOT NULL,
  `expiration_date` date DEFAULT NULL,
  `status` varchar(50) DEFAULT 'active',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `product_code` (`product_code`),
  KEY `idx_organization` (`organization_id`),
  KEY `idx_registration` (`registration_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `tbl_products` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `client_id` char(36) NOT NULL,
  `product_code` varchar(50) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_type` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `ndc_number` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tbl_products_code` (`product_code`),
  KEY `idx_tbl_products_client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `tbl_product_ingredients` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `product_id` char(36) NOT NULL,
  `ingredient_name` varchar(255) NOT NULL,
  `ingredient_quantity` varchar(100) DEFAULT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_tbl_product_ingredients_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================
-- SECTION 2: REGULATORY & RCM TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS `tbl_regulatory_intelligence` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `client_id` varchar(36) NOT NULL,
  `regulatory_body` varchar(255) DEFAULT NULL,
  `change_type` varchar(100) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `source_url` varchar(500) DEFAULT NULL,
  `regulatory_reference_id` varchar(100) DEFAULT NULL,
  `content_summary` text DEFAULT NULL,
  `preliminary_impact_assessment` text DEFAULT NULL,
  `affected_areas` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`affected_areas`)),
  `risk_level` varchar(50) NOT NULL COMMENT 'low, medium, high, critical',
  `announcement_date` date DEFAULT NULL,
  `effective_date` date DEFAULT NULL,
  `comment_deadline_date` date DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'new' COMMENT 'new, under_review, requires_action, implemented, archived',
  `rcm_officer_id` char(36) DEFAULT NULL,
  `action_required` tinyint(1) DEFAULT 0,
  `action_items_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_ri_client` (`client_id`),
  KEY `idx_ri_status` (`status`),
  KEY `idx_ri_risk_level` (`risk_level`),
  KEY `idx_ri_effective_date` (`effective_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Central repository for regulatory changes';

-- Adding missing RCM action items table
CREATE TABLE IF NOT EXISTS `tbl_rcm_action_items` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `client_id` char(36) NOT NULL,
  `regulatory_intelligence_id` char(36) NOT NULL,
  `action_title` varchar(255) NOT NULL,
  `action_description` text DEFAULT NULL,
  `action_type` varchar(100) DEFAULT NULL,
  `assigned_to` char(36) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `due_date` date NOT NULL,
  `priority` varchar(50) NOT NULL DEFAULT 'medium' COMMENT 'low, medium, high, critical',
  `status` varchar(50) NOT NULL DEFAULT 'pending' COMMENT 'pending, in_progress, completed, blocked, cancelled',
  `completion_date` timestamp NULL DEFAULT NULL,
  `risk_if_not_completed` text DEFAULT NULL,
  `estimated_hours` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_rcm_action_items_client` (`client_id`),
  KEY `idx_rcm_action_items_intelligence` (`regulatory_intelligence_id`),
  KEY `idx_rcm_action_items_assigned` (`assigned_to`),
  KEY `idx_rcm_action_items_status` (`status`),
  KEY `idx_rcm_action_items_due_date` (`due_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Action items generated from regulatory changes';

-- Adding missing RCM impact assessments table
CREATE TABLE IF NOT EXISTS `tbl_rcm_impact_assessments` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `client_id` char(36) NOT NULL,
  `regulatory_intelligence_id` char(36) NOT NULL,
  `assessment_date` date NOT NULL,
  `assessed_by` char(36) NOT NULL,
  `labeling_impact_required` tinyint(1) DEFAULT 0,
  `labeling_update_hours` decimal(10,2) DEFAULT NULL,
  `quality_impact_required` tinyint(1) DEFAULT 0,
  `qms_update_hours` decimal(10,2) DEFAULT NULL,
  `manufacturing_impact_required` tinyint(1) DEFAULT 0,
  `manufacturing_change_hours` decimal(10,2) DEFAULT NULL,
  `training_required` tinyint(1) DEFAULT 0,
  `training_estimated_hours` decimal(10,2) DEFAULT NULL,
  `total_estimated_hours` decimal(10,2) NOT NULL,
  `estimated_cost_usd` decimal(12,2) DEFAULT NULL,
  `implementation_risk` varchar(50) DEFAULT NULL COMMENT 'low, medium, high',
  `compliance_risk_if_not_implemented` varchar(50) DEFAULT NULL COMMENT 'low, medium, high',
  `status` varchar(50) NOT NULL DEFAULT 'pending_approval' COMMENT 'pending_approval, approved, rejected, in_progress',
  `approved_by` char(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_rcm_impact_assessments_client` (`client_id`),
  KEY `idx_rcm_impact_assessments_intelligence` (`regulatory_intelligence_id`),
  KEY `idx_rcm_impact_assessments_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Impact assessments for regulatory changes';

CREATE TABLE IF NOT EXISTS `tbl_product_regulation_mappings` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `client_id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `regulatory_intelligence_id` varchar(36) NOT NULL,
  `applicability_level` varchar(50) NOT NULL COMMENT 'critical, high, medium, low',
  `requires_action` tinyint(1) DEFAULT 0,
  `notes` text DEFAULT NULL,
  `mapped_by` varchar(36) DEFAULT NULL,
  `mapped_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_prm_product_regulation` (`client_id`,`product_id`,`regulatory_intelligence_id`),
  KEY `fk_prm_mapped_by` (`mapped_by`),
  KEY `idx_prm_client` (`client_id`),
  KEY `idx_prm_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='RCM product-regulation mappings';

-- ============================================================
-- SECTION 3: FDA DATA SYNC & API TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS `fda_api_sync_logs` (
  `id` varchar(36) NOT NULL,
  `sync_type` varchar(50) DEFAULT NULL,
  `records_processed` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  `last_successful_sync` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `fda_sync_events` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `sync_type` varchar(50) NOT NULL COMMENT 'enforcement, recalls, adverse_events',
  `total_records` int(11) DEFAULT 0,
  `records_inserted` int(11) DEFAULT 0,
  `records_updated` int(11) DEFAULT 0,
  `error_message` text DEFAULT NULL,
  `sync_started_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `sync_completed_at` timestamp NULL DEFAULT NULL,
  `status` varchar(50) DEFAULT 'pending' COMMENT 'pending, running, success, failed',
  PRIMARY KEY (`id`),
  KEY `idx_sync_type` (`sync_type`),
  KEY `idx_sync_status` (`status`),
  KEY `idx_sync_started` (`sync_started_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `fda_enforcement_data` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `fda_enforcement_id` varchar(100) UNIQUE,
  `recall_number` varchar(50) DEFAULT NULL,
  `product_description` text,
  `reason_for_recall` text,
  `recall_initiation_date` date DEFAULT NULL,
  `product_quantity` varchar(100) DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `report_date` date DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `fda_url` varchar(500) DEFAULT NULL,
  `raw_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`raw_data`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_recall_number` (`recall_number`),
  KEY `idx_company_name` (`company_name`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `tbl_fda_api_log` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `client_id` char(36) DEFAULT NULL,
  `sync_type` varchar(50) NOT NULL,
  `records_processed` int(11) DEFAULT 0,
  `records_inserted` int(11) DEFAULT 0,
  `records_failed` int(11) DEFAULT 0,
  `error_message` text DEFAULT NULL,
  `sync_started_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `sync_completed_at` timestamp NULL DEFAULT NULL,
  `status` varchar(50) DEFAULT 'pending',
  PRIMARY KEY (`id`),
  KEY `idx_tbl_fda_api_log_client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================
-- SECTION 4: DOCUMENT & FILE MANAGEMENT TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS `tbl_documents` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `client_id` char(36) NOT NULL,
  `document_name` varchar(255) NOT NULL,
  `document_type` varchar(100) DEFAULT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `uploaded_by` char(36) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_tbl_documents_client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `tbl_document_versions` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `document_id` char(36) NOT NULL,
  `version_number` int(11) DEFAULT 1,
  `file_path` varchar(500) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_tbl_document_versions_document_id` (`document_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `tbl_document_approvals` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `document_id` char(36) NOT NULL,
  `approved_by` char(36) NOT NULL,
  `approval_status` varchar(50) DEFAULT 'pending',
  `approval_comments` text DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_tbl_document_approvals_document_id` (`document_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================
-- SECTION 5: AUDIT & LOGGING TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` varchar(36) NOT NULL,
  `organization_id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(100) NOT NULL,
  `entity_id` varchar(36) DEFAULT NULL,
  `changes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`changes`)),
  `ip_address` varchar(50) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_organization` (`organization_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `tbl_audit_log` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `client_id` char(36) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(100) DEFAULT NULL,
  `entity_id` char(36) DEFAULT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `ip_address` varchar(50) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'success',
  `error_message` text DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_audit_log_client_id` (`client_id`),
  KEY `idx_audit_log_user_id` (`user_id`),
  KEY `idx_audit_log_timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================
-- SECTION 6: COMPLIANCE & ALERTS TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS `compliance_alerts` (
  `id` varchar(36) NOT NULL,
  `organization_id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `severity` varchar(50) NOT NULL,
  `category` varchar(100) NOT NULL,
  `related_entity_type` varchar(50) DEFAULT NULL,
  `related_entity_id` varchar(36) DEFAULT NULL,
  `is_acknowledged` tinyint(1) DEFAULT 0,
  `acknowledged_by` varchar(36) DEFAULT NULL,
  `acknowledged_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_organization` (`organization_id`),
  KEY `idx_severity` (`severity`),
  KEY `idx_acknowledged` (`is_acknowledged`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `fda_alerts` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `alert_type` varchar(100) NOT NULL,
  `alert_title` varchar(255) NOT NULL,
  `alert_description` text DEFAULT NULL,
  `severity` varchar(50) DEFAULT 'medium',
  `alert_date` date DEFAULT NULL,
  `status` varchar(50) DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_alert_type` (`alert_type`),
  KEY `idx_severity` (`severity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================
-- SECTION 7: RENEWAL & REMINDER TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS `tbl_reminders` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `client_id` char(36) NOT NULL,
  `reminder_type` varchar(100) NOT NULL,
  `entity_type` varchar(100) DEFAULT NULL,
  `entity_id` char(36) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `message` text DEFAULT NULL,
  `due_date` date NOT NULL,
  `is_completed` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_tbl_reminders_client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `tbl_renewal_schedule` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `client_id` char(36) NOT NULL,
  `registration_id` char(36) DEFAULT NULL,
  `entity_type` varchar(100) DEFAULT NULL,
  `entity_id` char(36) DEFAULT NULL,
  `renewal_date` date NOT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_tbl_renewal_schedule_client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `tbl_renewal_alerts` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `client_id` char(36) NOT NULL,
  `entity_type` varchar(100) NOT NULL,
  `entity_id` char(36) NOT NULL,
  `renewal_date` date NOT NULL,
  `alert_status` varchar(50) DEFAULT 'pending',
  `alert_sent_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_tbl_renewal_alerts_client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `tbl_renewal_execution` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `client_id` char(36) NOT NULL,
  `entity_type` varchar(100) NOT NULL,
  `entity_id` char(36) NOT NULL,
  `renewal_date` date DEFAULT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `execution_notes` text DEFAULT NULL,
  `executed_by` char(36) DEFAULT NULL,
  `executed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_tbl_renewal_execution_client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================
-- SECTION 8: ROLE & ACCESS CONTROL TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS `tbl_roles` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `client_id` char(36) NOT NULL,
  `role_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`permissions`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_tbl_roles_client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `tbl_user_roles` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `user_id` char(36) NOT NULL,
  `role_id` char(36) NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tbl_user_roles` (`user_id`,`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================
-- SECTION 9: SIGNATURE & ENCRYPTION TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS `tbl_e_signatures` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `document_id` char(36) NOT NULL,
  `signed_by` char(36) NOT NULL,
  `signature_data` longtext DEFAULT NULL,
  `signature_timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_valid` tinyint(1) DEFAULT 1,
  `certificate_id` char(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_tbl_e_signatures_document_id` (`document_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `tbl_encryption_keys` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `client_id` char(36) NOT NULL,
  `key_name` varchar(255) NOT NULL,
  `key_hash` varchar(255) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `rotated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_tbl_encryption_keys_client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `tbl_encryption_audit` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `client_id` char(36) NOT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(100) DEFAULT NULL,
  `entity_id` char(36) NOT NULL,
  `performed_by` char(36) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_tbl_encryption_audit_client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================
-- SECTION 10: NOTIFICATION & PREFERENCE TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS `notification_preferences` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `organization_id` varchar(36) NOT NULL,
  `notification_type` varchar(100) NOT NULL,
  `channel` enum('email','sms','in_app') NOT NULL,
  `is_enabled` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_organization` (`organization_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `email_notifications` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `sent_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================
-- SECTION 11: CLIENTS/ORGANIZATIONS ADDITIONAL TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS `tbl_clients` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `organization_name` varchar(255) NOT NULL,
  `organization_type` varchar(50) DEFAULT NULL,
  `duns_number` varchar(20) DEFAULT NULL,
  `fei_number` varchar(20) DEFAULT NULL,
  `registration_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` varchar(50) DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_organization_name` (`organization_name`),
  KEY `idx_status` (`status`),
  KEY `idx_fei_number` (`fei_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `tbl_client_service_status` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `client_id` char(36) NOT NULL,
  `service_type` varchar(100) NOT NULL,
  `status` varchar(50) DEFAULT 'active',
  `last_accessed` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_tbl_client_service_status_client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================
-- SECTION 12: ADDITIONAL SYSTEM TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS `session_tokens` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `token` varchar(500) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `two_fa_logs` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `user_id` varchar(36) NOT NULL,
  `action` varchar(100) NOT NULL,
  `status` varchar(50) DEFAULT 'success',
  `ip_address` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `tbl_no_change_certification` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `client_id` char(36) NOT NULL,
  `certification_type` varchar(100) DEFAULT NULL,
  `certification_date` date DEFAULT NULL,
  `certifying_user` char(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_tbl_no_change_certification_client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `tbl_document_integrity` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `document_id` char(36) NOT NULL,
  `file_hash` varchar(255) DEFAULT NULL,
  `hash_algorithm` varchar(50) DEFAULT 'SHA256',
  `integrity_verified` tinyint(1) DEFAULT 0,
  `verified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_tbl_document_integrity_document_id` (`document_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================
-- SAMPLE DATA INSERTS
-- ============================================================

INSERT IGNORE INTO `organizations` (`id`, `name`, `fda_registration_number`, `address`, `country`, `status`) VALUES
('00000000-0000-0000-0000-000000000000', 'Vexim System', 'VEXIM-SYSTEM', NULL, 'USA', 'active'),
('550e8400-e29b-41d4-a716-446655440000', 'Global Pharma Corp', 'FDA-3012345', '123 Medical Drive', 'United States', 'active'),
('550e8400-e29b-41d4-a716-446655440001', 'MedTech Solutions Inc', 'FDA-3012346', '456 Innovation Blvd', 'United States', 'active');

INSERT IGNORE INTO `users` (`id`, `organization_id`, `email`, `password_hash`, `full_name`, `role`, `is_active`) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'super_admin@vexim.com', '$2y$10$hash', 'Vexim Admin', 'super_admin', 1),
('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'admin@globalpharma.com', '$2a$10$hash', 'John Admin', 'admin', 1);

INSERT IGNORE INTO `tbl_clients` (`id`, `organization_name`, `organization_type`, `fei_number`, `status`) VALUES
('00000000-0000-0000-0000-000000000000', 'Vexim System', 'System', 'VEXIM-SYSTEM', 'active'),
('550e8400-e29b-41d4-a716-446655440000', 'Global Pharma Corp', 'Manufacturer', 'FDA-3012345', 'active'),
('vexim-global-sp', 'Vexim Global SP', 'Manufacturer', 'FDA-3002391', 'active');

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
