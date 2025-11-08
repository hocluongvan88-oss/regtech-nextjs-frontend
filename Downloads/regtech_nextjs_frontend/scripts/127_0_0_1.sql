-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th10 07, 2025 lúc 04:52 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `fda_compliance_db`
--
CREATE DATABASE IF NOT EXISTS `fda_compliance_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `fda_compliance_db`;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` varchar(36) NOT NULL,
  `organization_id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(100) NOT NULL,
  `entity_id` varchar(36) DEFAULT NULL,
  `changes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`changes`)),
  `ip_address` varchar(50) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `compliance_alerts`
--

CREATE TABLE `compliance_alerts` (
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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ;

--
-- Đang đổ dữ liệu cho bảng `compliance_alerts`
--

INSERT INTO `compliance_alerts` (`id`, `organization_id`, `title`, `message`, `severity`, `category`, `related_entity_type`, `related_entity_id`, `is_acknowledged`, `acknowledged_by`, `acknowledged_at`, `created_at`) VALUES
('990e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Registration Expiring Soon', 'FDA-REG-2024-001 will expire in 45 days. Please renew before December 31, 2024.', 'warning', 'registration_expiring', 'registration', '770e8400-e29b-41d4-a716-446655440000', 0, NULL, NULL, '2025-11-04 15:03:17'),
('990e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Product Listing Expiring', 'PROD-004 (Ibuprofen 200mg) listing expires in 30 days.', 'warning', 'product_expiring', 'product', '880e8400-e29b-41d4-a716-446655440003', 0, NULL, NULL, '2025-11-04 15:03:17'),
('990e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Registration Renewal Required', 'FDA-REG-2024-003 renewal is pending. Action required immediately.', 'critical', 'registration_expiring', 'registration', '770e8400-e29b-41d4-a716-446655440002', 0, NULL, NULL, '2025-11-04 15:03:17'),
('990e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'System Update', 'New FDA compliance guidelines have been published. Review required.', 'info', 'system_update', NULL, NULL, 1, NULL, NULL, '2025-11-04 15:03:17');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `customers`
--

CREATE TABLE `customers` (
  `id` varchar(36) NOT NULL,
  `vexim_agent_id` varchar(36) DEFAULT NULL,
  `company_name` varchar(255) NOT NULL,
  `contact_email` varchar(255) NOT NULL,
  `contact_phone` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `industry` varchar(100) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'active',
  `subscription_plan` varchar(50) DEFAULT 'standard',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `duns_number` varchar(9) DEFAULT NULL COMMENT 'D-U-N-S Number for customer business verification',
  `duns_verified` tinyint(1) DEFAULT 0,
  `duns_verified_at` timestamp NULL DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `detailed_audit_logs`
--

CREATE TABLE `detailed_audit_logs` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `organization_id` varchar(36) DEFAULT NULL,
  `user_id` varchar(36) NOT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(100) NOT NULL,
  `entity_id` varchar(36) DEFAULT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `ip_address` varchar(50) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `status` enum('success','failed') DEFAULT 'success',
  `error_message` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `establishment_registrations`
--

CREATE TABLE `establishment_registrations` (
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Đang đổ dữ liệu cho bảng `establishment_registrations`
--

INSERT INTO `establishment_registrations` (`id`, `organization_id`, `fda_registration_number`, `establishment_name`, `establishment_type`, `address`, `city`, `state`, `zip_code`, `country`, `official_correspondent_id`, `registration_date`, `expiration_date`, `status`, `notes`, `created_at`, `updated_at`) VALUES
('770e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'FDA-REG-2024-001', 'Global Pharma Manufacturing Plant', 'Manufacturing Facility', '123 Medical Drive', 'Boston', 'MA', '02101', 'United States', '660e8400-e29b-41d4-a716-446655440001', '2024-01-15', '2024-12-31', 'active', NULL, '2025-11-04 15:03:17', '2025-11-04 15:03:17'),
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'FDA-REG-2024-002', 'Global Pharma Distribution Center', 'Distribution Center', '789 Logistics Way', 'Chicago', 'IL', '60601', 'United States', '660e8400-e29b-41d4-a716-446655440001', '2024-02-01', '2024-12-31', 'active', NULL, '2025-11-04 15:03:17', '2025-11-04 15:03:17'),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'FDA-REG-2024-003', 'MedTech Device Lab', 'Testing Laboratory', '456 Innovation Blvd', 'San Francisco', 'CA', '94102', 'United States', '660e8400-e29b-41d4-a716-446655440003', '2023-11-01', '2024-10-31', 'pending', NULL, '2025-11-04 15:03:17', '2025-11-04 15:03:17');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `fda_alerts`
--

CREATE TABLE `fda_alerts` (
  `id` varchar(36) NOT NULL,
  `customer_id` varchar(36) NOT NULL,
  `establishment_id` varchar(36) DEFAULT NULL,
  `alert_type` varchar(100) DEFAULT NULL,
  `severity` varchar(50) DEFAULT 'info',
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `fda_source_url` varchar(500) DEFAULT NULL,
  `fda_data` longtext DEFAULT NULL,
  `status` varchar(50) DEFAULT 'new',
  `acknowledged_by` varchar(36) DEFAULT NULL,
  `acknowledged_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `fda_api_sync_logs`
--

CREATE TABLE `fda_api_sync_logs` (
  `id` varchar(36) NOT NULL,
  `sync_type` varchar(50) DEFAULT NULL,
  `records_processed` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  `last_successful_sync` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `fda_establishments`
--

CREATE TABLE `fda_establishments` (
  `id` varchar(36) NOT NULL,
  `customer_id` varchar(36) NOT NULL,
  `fda_registration_number` varchar(50) NOT NULL,
  `establishment_name` varchar(255) NOT NULL,
  `establishment_type` varchar(100) DEFAULT NULL,
  `address` text NOT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `zip_code` varchar(20) DEFAULT NULL,
  `country` varchar(100) NOT NULL,
  `industry` varchar(100) DEFAULT NULL,
  `registration_date` date DEFAULT NULL,
  `last_renewal_date` date DEFAULT NULL,
  `next_renewal_date` date DEFAULT NULL,
  `status` varchar(50) DEFAULT 'active',
  `fda_data` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `duns_number` varchar(9) DEFAULT NULL COMMENT 'D-U-N-S Number (Data Universal Numbering System) - 9 digit business identifier required for FDA registration',
  `duns_verified` tinyint(1) DEFAULT 0 COMMENT 'Whether the DUNS number has been verified against Dun & Bradstreet database',
  `duns_verified_at` timestamp NULL DEFAULT NULL COMMENT 'Timestamp when DUNS was last verified',
  `duns_company_name` varchar(255) DEFAULT NULL COMMENT 'Official company name from D&B verification'
) ;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `notification_preferences`
--

CREATE TABLE `notification_preferences` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `email_alerts` tinyint(1) DEFAULT 1,
  `sms_alerts` tinyint(1) DEFAULT 0,
  `phone_number` varchar(50) DEFAULT NULL,
  `alert_days_before_deadline` int(11) DEFAULT 30,
  `renewal_reminder` tinyint(1) DEFAULT 1,
  `warning_alerts` tinyint(1) DEFAULT 1,
  `fda_updates` tinyint(1) DEFAULT 1,
  `preferred_contact_method` varchar(50) DEFAULT 'email',
  `quiet_hours_start` time DEFAULT NULL,
  `quiet_hours_end` time DEFAULT NULL,
  `timezone` varchar(100) DEFAULT 'UTC',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `organizations`
--

CREATE TABLE `organizations` (
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
  `duns_number` varchar(9) DEFAULT NULL COMMENT 'D-U-N-S Number for organization-level business verification',
  `duns_verified` tinyint(1) DEFAULT 0,
  `duns_verified_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `organizations`
--

INSERT INTO `organizations` (`id`, `name`, `fda_registration_number`, `address`, `country`, `phone`, `email`, `website`, `status`, `created_at`, `updated_at`, `duns_number`, `duns_verified`, `duns_verified_at`) VALUES
('00000000-0000-0000-0000-000000000000', 'Vexim System', 'VEXIM-SYSTEM', NULL, 'USA', NULL, NULL, NULL, 'active', '2025-11-04 15:59:11', '2025-11-04 15:59:11', NULL, 0, NULL),
('00000000-0000-0000-0000-000000000001', 'Vexim System - Super Admin', NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2025-11-05 08:31:41', '2025-11-05 08:31:41', NULL, 0, NULL),
('00000000-0000-0000-0000-000000000002', 'Vexim System - Admin', NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2025-11-05 08:31:41', '2025-11-05 08:31:41', NULL, 0, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'Global Pharma Corp', 'FDA-3012345', '123 Medical Drive, Suite 100', 'United States', '+1-555-0100', 'contact@globalpharma.com', 'https://globalpharma.com', 'active', '2025-11-04 15:03:17', '2025-11-04 15:03:17', NULL, 0, NULL),
('550e8400-e29b-41d4-a716-446655440001', 'MedTech Solutions Inc', 'FDA-3012346', '456 Innovation Blvd', 'United States', '+1-555-0200', 'info@medtechsolutions.com', 'https://medtechsolutions.com', 'active', '2025-11-04 15:03:17', '2025-11-04 15:03:17', NULL, 0, NULL),
('550e8400-e29b-41d4-a716-446655440010', 'Luong Organization', NULL, NULL, NULL, NULL, NULL, NULL, 'active', '2025-11-05 08:31:41', '2025-11-05 08:31:41', NULL, 0, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `products`
--

CREATE TABLE `products` (
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Đang đổ dữ liệu cho bảng `products`
--

INSERT INTO `products` (`id`, `organization_id`, `registration_id`, `product_code`, `product_name`, `product_type`, `description`, `ndc_number`, `quantity`, `unit`, `listing_date`, `expiration_date`, `status`, `notes`, `created_at`, `updated_at`) VALUES
('880e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', 'PROD-001', 'Aspirin 500mg Tablets', 'pharmaceutical', 'Pain relief medication', '12345-678-90', 10000, 'tablets', '2024-01-20', '2025-01-20', 'active', NULL, '2025-11-04 15:03:17', '2025-11-04 15:03:17'),
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', 'PROD-002', 'Vitamin C 1000mg', 'dietary_supplement', 'Immune support supplement', '12345-678-91', 5000, 'capsules', '2024-02-15', '2025-02-15', 'active', NULL, '2025-11-04 15:03:17', '2025-11-04 15:03:17'),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002', 'PROD-003', 'Digital Thermometer Pro', 'medical_device', 'Clinical-grade digital thermometer', NULL, 2000, 'units', '2024-03-01', '2025-03-01', 'active', NULL, '2025-11-04 15:03:17', '2025-11-04 15:03:17'),
('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', 'PROD-004', 'Ibuprofen 200mg', 'pharmaceutical', 'Anti-inflammatory medication', '12345-678-92', 8000, 'tablets', '2023-12-01', '2024-11-30', 'pending', NULL, '2025-11-04 15:03:17', '2025-11-04 15:03:17');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `rate_limits`
--

CREATE TABLE `rate_limits` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `user_id` varchar(36) NOT NULL,
  `action` varchar(100) NOT NULL,
  `count` int(11) DEFAULT 1,
  `reset_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `renewal_reminders`
--

CREATE TABLE `renewal_reminders` (
  `id` varchar(36) NOT NULL,
  `customer_id` varchar(36) NOT NULL,
  `establishment_id` varchar(36) DEFAULT NULL,
  `reminder_type` varchar(50) DEFAULT NULL,
  `scheduled_date` date NOT NULL,
  `is_sent` tinyint(1) DEFAULT 0,
  `sent_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `role_change_audit`
--

CREATE TABLE `role_change_audit` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `user_id` varchar(255) NOT NULL,
  `old_role` varchar(50) DEFAULT NULL,
  `new_role` varchar(50) DEFAULT NULL,
  `changed_by` varchar(255) DEFAULT NULL,
  `changed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `role_change_requests`
--

CREATE TABLE `role_change_requests` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `requester_id` varchar(36) NOT NULL,
  `target_user_id` varchar(36) NOT NULL,
  `new_role` enum('super_admin','admin','official_correspondent','establishment_contact','user') NOT NULL,
  `old_role` enum('super_admin','admin','official_correspondent','establishment_contact','user') NOT NULL,
  `reason` text NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `approved_by` varchar(36) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `session_tokens`
--

CREATE TABLE `session_tokens` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `user_id` varchar(36) NOT NULL,
  `token` varchar(500) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `ip_address` varchar(50) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `system_settings`
--

CREATE TABLE `system_settings` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `key` varchar(255) NOT NULL,
  `value` text DEFAULT NULL,
  `setting_type` varchar(50) NOT NULL,
  `created_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_audit_log`
--

CREATE TABLE `tbl_audit_log` (
  `id` char(36) NOT NULL DEFAULT uuid(),
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
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_clients`
--

CREATE TABLE `tbl_clients` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `organization_name` varchar(255) NOT NULL,
  `organization_type` varchar(50) DEFAULT NULL,
  `duns_number` varchar(20) DEFAULT NULL,
  `fei_number` varchar(20) DEFAULT NULL,
  `registration_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` varchar(50) DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_client_facilities`
--

CREATE TABLE `tbl_client_facilities` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `client_id` char(36) NOT NULL,
  `facility_name` varchar(255) NOT NULL,
  `facility_type` varchar(100) DEFAULT NULL,
  `street_address` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state_province` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `fei_number` varchar(20) DEFAULT NULL,
  `duns_number` varchar(20) DEFAULT NULL,
  `primary_contact_name` varchar(255) DEFAULT NULL,
  `primary_contact_email` varchar(255) DEFAULT NULL,
  `primary_contact_phone` varchar(20) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'active',
  `registration_status` varchar(50) DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_compliance_status`
--

CREATE TABLE `tbl_compliance_status` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `client_id` char(36) NOT NULL,
  `facility_id` char(36) DEFAULT NULL,
  `compliance_type` varchar(100) DEFAULT NULL,
  `compliance_status` varchar(50) DEFAULT 'pending',
  `last_inspection_date` timestamp NULL DEFAULT NULL,
  `next_inspection_due` date DEFAULT NULL,
  `warning_message` text DEFAULT NULL,
  `action_required` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_documents`
--

CREATE TABLE `tbl_documents` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `client_id` char(36) NOT NULL,
  `submission_id` char(36) DEFAULT NULL,
  `facility_id` char(36) DEFAULT NULL,
  `document_name` varchar(255) NOT NULL,
  `document_type` varchar(100) DEFAULT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `file_mime_type` varchar(100) DEFAULT NULL,
  `uploaded_by` char(36) DEFAULT NULL,
  `upload_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_required` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_fda_api_log`
--

CREATE TABLE `tbl_fda_api_log` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `client_id` char(36) NOT NULL,
  `submission_id` char(36) DEFAULT NULL,
  `api_endpoint` varchar(255) DEFAULT NULL,
  `request_method` varchar(10) DEFAULT NULL,
  `request_payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`request_payload`)),
  `response_status` int(11) DEFAULT NULL,
  `response_payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`response_payload`)),
  `error_message` text DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `retry_count` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_products`
--

CREATE TABLE `tbl_products` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `client_id` char(36) NOT NULL,
  `facility_id` char(36) DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_code` varchar(100) DEFAULT NULL,
  `product_type` varchar(100) DEFAULT NULL,
  `product_classification` varchar(50) DEFAULT NULL,
  `intended_use` text DEFAULT NULL,
  `ingredient_statement` text DEFAULT NULL,
  `manufacturing_process` text DEFAULT NULL,
  `regulatory_pathway` varchar(100) DEFAULT NULL,
  `device_list_number` varchar(50) DEFAULT NULL,
  `ndc_number` varchar(20) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'active',
  `version` int(11) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_product_ingredients`
--

CREATE TABLE `tbl_product_ingredients` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `product_id` char(36) NOT NULL,
  `ingredient_name` varchar(255) NOT NULL,
  `percentage_composition` decimal(5,2) DEFAULT NULL,
  `cas_number` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_reminders`
--

CREATE TABLE `tbl_reminders` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `client_id` char(36) NOT NULL,
  `submission_id` char(36) DEFAULT NULL,
  `facility_id` char(36) DEFAULT NULL,
  `reminder_type` varchar(100) DEFAULT NULL,
  `reminder_title` varchar(255) DEFAULT NULL,
  `reminder_description` text DEFAULT NULL,
  `due_date` date NOT NULL,
  `is_sent` tinyint(1) DEFAULT 0,
  `sent_date` timestamp NULL DEFAULT NULL,
  `is_completed` tinyint(1) DEFAULT 0,
  `completed_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_roles`
--

CREATE TABLE `tbl_roles` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `role_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `client_id` char(36) DEFAULT NULL,
  `is_system_role` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `tbl_roles`
--

INSERT INTO `tbl_roles` (`id`, `role_name`, `description`, `client_id`, `is_system_role`, `created_at`) VALUES
('e96660f8-bab5-11f0-83f1-c86000e1344a', 'admin', 'Full system access and management', NULL, 1, '2025-11-06 02:11:31'),
('e96662dd-bab5-11f0-83f1-c86000e1344a', 'compliance_officer', 'Can manage compliance and submissions', NULL, 1, '2025-11-06 02:11:31'),
('e9666397-bab5-11f0-83f1-c86000e1344a', 'submitter', 'Can submit registrations and products', NULL, 1, '2025-11-06 02:11:31'),
('e966643a-bab5-11f0-83f1-c86000e1344a', 'viewer', 'Read-only access', NULL, 1, '2025-11-06 02:11:31');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_submissions`
--

CREATE TABLE `tbl_submissions` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `client_id` char(36) NOT NULL,
  `facility_id` char(36) NOT NULL,
  `submission_type` varchar(50) NOT NULL,
  `submission_status` varchar(50) DEFAULT 'draft',
  `submission_number` varchar(50) DEFAULT NULL,
  `fda_submission_id` varchar(100) DEFAULT NULL,
  `submitted_date` timestamp NULL DEFAULT NULL,
  `submitted_by` char(36) DEFAULT NULL,
  `reviewed_date` timestamp NULL DEFAULT NULL,
  `reviewed_by` char(36) DEFAULT NULL,
  `approval_date` timestamp NULL DEFAULT NULL,
  `expiration_date` timestamp NULL DEFAULT NULL,
  `comments` text DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_submission_counter`
--

CREATE TABLE `tbl_submission_counter` (
  `id` int(11) NOT NULL,
  `counter` int(11) DEFAULT 0,
  `last_year` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `tbl_submission_counter`
--

INSERT INTO `tbl_submission_counter` (`id`, `counter`, `last_year`) VALUES
(1, 0, 2025);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_submission_products`
--

CREATE TABLE `tbl_submission_products` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `submission_id` char(36) NOT NULL,
  `product_id` char(36) NOT NULL,
  `product_version` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_users`
--

CREATE TABLE `tbl_users` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `client_id` char(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'active',
  `email_verified` tinyint(1) DEFAULT 0,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_user_roles`
--

CREATE TABLE `tbl_user_roles` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `user_id` char(36) NOT NULL,
  `role_id` char(36) NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `assigned_by` char(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `two_factor_auth`
--

CREATE TABLE `two_factor_auth` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `user_id` varchar(36) NOT NULL,
  `secret` varchar(255) NOT NULL,
  `backup_codes` text NOT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
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
  `two_fa_verified_at` timestamp NULL DEFAULT NULL
) ;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `organization_id`, `email`, `password_hash`, `full_name`, `role`, `phone`, `is_active`, `last_login`, `created_at`, `updated_at`, `duns_number`, `renewal_years`, `two_fa_enabled`, `two_fa_secret`, `two_fa_verified_at`) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'super_admin@vexim.com', '$2y$10$XMFStjEpllh95wIImU2VGOxaL.8bHL5HQVVzyGGcEkYpCombNHIQy', 'Vexim Super Administrator', 'super_admin', NULL, 1, NULL, '2025-11-04 16:02:47', '2025-11-05 13:46:23', NULL, 1, 0, NULL, NULL),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'admin@vexim.com', '$2b$10$YourHashedPasswordHere', 'Vexim System Administrator', 'super_admin', NULL, 1, NULL, '2025-11-04 16:18:49', '2025-11-05 08:31:41', NULL, 1, 0, NULL, NULL),
('26b5ef2f-00d2-4588-8dd7-d41692307bf0', '550e8400-e29b-41d4-a716-446655440010', 'luonghoangminh88@gmail.com', '$2b$10$a3DH8gA6iQJDCIWAoBTKDeYkgsyWsjM/6OQyG.U.0bIW3InuynUVy', 'Luong Van Hoc', 'official_correspondent', NULL, 1, NULL, '2025-11-05 01:26:35', '2025-11-05 08:31:41', NULL, 1, 0, NULL, NULL),
('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'admin@globalpharma.com', '$2a$10$rKvVLZ8Z8Z8Z8Z8Z8Z8Z8OqKvVLZ8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8', 'John Admin', 'official_correspondent', '+1-555-0101', 0, NULL, '2025-11-04 15:03:17', '2025-11-04 23:58:01', NULL, 1, 0, NULL, NULL),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'correspondent@globalpharma.com', '$2a$10$rKvVLZ8Z8Z8Z8Z8Z8Z8Z8OqKvVLZ8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8', 'Sarah Correspondent', 'official_correspondent', '+1-555-0102', 1, NULL, '2025-11-04 15:03:17', '2025-11-04 15:03:17', NULL, 1, 0, NULL, NULL),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'admin@medtechsolutions.com', '$2a$10$rKvVLZ8Z8Z8Z8Z8Z8Z8Z8OqKvVLZ8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8', 'Lisa Admin', 'establishment_contact', '+1-555-0201', 1, NULL, '2025-11-04 15:03:17', '2025-11-04 23:57:23', NULL, 1, 0, NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_sessions`
--

CREATE TABLE `user_sessions` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `token` varchar(500) NOT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_activity` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Stores active user sessions for authentication';

--
-- Đang đổ dữ liệu cho bảng `user_sessions`
--

INSERT INTO `user_sessions` (`id`, `user_id`, `token`, `ip_address`, `user_agent`, `expires_at`, `last_activity`, `created_at`) VALUES
('', '00000000-0000-0000-0000-000000000001', 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoic3VwZXJfYWRtaW5AdmV4aW0uY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwib3JnYW5pemF0aW9uX2lkIjoiMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAwIiwiaWF0IjoxNzYyMzEyMDg5LCJleHAiOjE3NjI5MTY4ODl9.x0Wd3EXIy4fknkZcf9cBmB7AH4fm4CVzxrJdea6qP74', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '2025-11-05 03:08:24', '2025-11-05 03:08:24', '2025-11-05 03:08:09'),
('03696983-1dbc-4e25-a87e-f05c4ea94131', '26b5ef2f-00d2-4588-8dd7-d41692307bf0', 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjI2YjVlZjJmLTAwZDItNDU4OC04ZGQ3LWQ0MTY5MjMwN2JmMCIsImVtYWlsIjoibHVvbmdob2FuZ21pbmg4OEBnbWFpbC5jb20iLCJyb2xlIjoib2ZmaWNpYWxfY29ycmVzcG9uZGVudCIsIm9yZ2FuaXphdGlvbl9pZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAxMCIsImlhdCI6MTc2MjM1MTg3NCwiZXhwIjoxNzYyOTU2Njc0fQ.EweRzWTi_UxaZEnJooCXp6oPZpFfg-_L0kB8dN4n76M', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 14:11:15', '2025-11-05 14:11:15', '2025-11-05 14:11:14'),
('03debe7e-6d38-4799-8b27-012c9d7d481b', '00000000-0000-0000-0000-000000000001', 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoic3VwZXJfYWRtaW5AdmV4aW0uY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwib3JnYW5pemF0aW9uX2lkIjoiMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAxIiwiaWF0IjoxNzYyMzUxOTMyLCJleHAiOjE3NjI5NTY3MzJ9.Zt1BicPS3rti5l-pRkpmbBPbS4gFG4KqPuQKQx50FE4', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 14:12:13', '2025-11-05 14:12:13', '2025-11-05 14:12:12'),
('09b38a30-257a-4589-84af-3d3f860c5b87', '00000000-0000-0000-0000-000000000001', 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoic3VwZXJfYWRtaW5AdmV4aW0uY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwib3JnYW5pemF0aW9uX2lkIjoiMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAxIiwiaWF0IjoxNzYyMzUxMzEwLCJleHAiOjE3NjI5NTYxMTB9.NhtXJIse5IaNEieQpzzdytcaQyRfR8_hmS_jXrJAPLs', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 14:01:51', '2025-11-05 14:01:51', '2025-11-05 14:01:50'),
('12ade2d0-f087-4a62-8790-73dd16407271', '26b5ef2f-00d2-4588-8dd7-d41692307bf0', 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjI2YjVlZjJmLTAwZDItNDU4OC04ZGQ3LWQ0MTY5MjMwN2JmMCIsImVtYWlsIjoibHVvbmdob2FuZ21pbmg4OEBnbWFpbC5jb20iLCJyb2xlIjoib2ZmaWNpYWxfY29ycmVzcG9uZGVudCIsIm9yZ2FuaXphdGlvbl9pZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAxMCIsImlhdCI6MTc2MjMzMjgyMywiZXhwIjoxNzYyOTM3NjIzfQ.Utus91AiHCWBTZYPV4F9z7ea_zeCS3eoo4TiOB_VCWY', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 08:53:47', '2025-11-05 08:53:47', '2025-11-05 08:53:43'),
('1d49d5d8-482f-4e24-a579-1b8429d907e3', '00000000-0000-0000-0000-000000000001', 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoic3VwZXJfYWRtaW5AdmV4aW0uY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwib3JnYW5pemF0aW9uX2lkIjoiMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAxIiwiaWF0IjoxNzYyMzUxOTE2LCJleHAiOjE3NjI5NTY3MTZ9.z9r5db9zIs8gb3zQbjrnsBoF_2w_FwA1Pb32fNge9Og', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 14:11:57', '2025-11-05 14:11:57', '2025-11-05 14:11:56'),
('225dad86-030b-4822-83c5-b7c75810ebba', '00000000-0000-0000-0000-000000000001', 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoic3VwZXJfYWRtaW5AdmV4aW0uY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwib3JnYW5pemF0aW9uX2lkIjoiMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAwIiwiaWF0IjoxNzYyMzEzNDU2LCJleHAiOjE3NjI5MTgyNTZ9.oZmORUKjUJ_w-76ykYWzJDT0u_6FQy386bH7JhIR7l0', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 08:31:21', '2025-11-05 01:31:21', '2025-11-05 03:30:56'),
('3ad4b881-0b99-47f9-8e90-6c51aa736296', '00000000-0000-0000-0000-000000000001', 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoic3VwZXJfYWRtaW5AdmV4aW0uY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwib3JnYW5pemF0aW9uX2lkIjoiMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAwIiwiaWF0IjoxNzYyMzEyNzU0LCJleHAiOjE3NjI5MTc1NTR9.ZLIO9T4SdajPVlCiRxDQlhZwpl0FrABCeUyltBYUuPI', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 03:30:22', '2025-11-05 03:30:22', '2025-11-05 03:19:14'),
('3e9de06f-557b-4c86-8be8-dfd70208ff95', '00000000-0000-0000-0000-000000000001', 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoic3VwZXJfYWRtaW5AdmV4aW0uY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwib3JnYW5pemF0aW9uX2lkIjoiMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAxIiwiaWF0IjoxNzYyMzUyMTE3LCJleHAiOjE3NjI5NTY5MTd9.h4CSxnKM2cmrPJqHQVoADt6GG1kS6LW6904eSGzmqV8', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 14:15:20', '2025-11-05 14:15:20', '2025-11-05 14:15:17'),
('3eb87d90-49e2-42b6-a2c3-464d23e697f2', '00000000-0000-0000-0000-000000000001', 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoic3VwZXJfYWRtaW5AdmV4aW0uY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwib3JnYW5pemF0aW9uX2lkIjoiMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAxIiwiaWF0IjoxNzYyMzUwNDEzLCJleHAiOjE3NjI5NTUyMTN9.VdBwj0ATuE7h7PCV6wSOKnmBBPc4PgQnWo7Xc1_LMF4', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 13:53:28', '2025-11-05 13:53:28', '2025-11-05 13:46:53'),
('4814ea0f-71ba-46b0-bb53-6435aeb77fa2', '26b5ef2f-00d2-4588-8dd7-d41692307bf0', 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjI2YjVlZjJmLTAwZDItNDU4OC04ZGQ3LWQ0MTY5MjMwN2JmMCIsImVtYWlsIjoibHVvbmdob2FuZ21pbmg4OEBnbWFpbC5jb20iLCJyb2xlIjoib2ZmaWNpYWxfY29ycmVzcG9uZGVudCIsIm9yZ2FuaXphdGlvbl9pZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAxMCIsImlhdCI6MTc2MjM0NDM5MywiZXhwIjoxNzYyOTQ5MTkzfQ.ZfmJxpqK6wUZahMZMg3riBorivWJB2u-is_NFLt0Uj8', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 12:06:33', '2025-11-05 12:06:33', '2025-11-05 05:06:33'),
('52a539f9-0ae1-4819-9973-9dfbaaa5a70b', '00000000-0000-0000-0000-000000000001', 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoic3VwZXJfYWRtaW5AdmV4aW0uY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwib3JnYW5pemF0aW9uX2lkIjoiMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAxIiwiaWF0IjoxNzYyMzQzNDk5LCJleHAiOjE3NjI5NDgyOTl9.JvIqS4qitBPjWR_D95PfpVGOPZDEFpL4_bIr522qNTc', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 11:51:43', '2025-11-05 11:51:43', '2025-11-05 11:51:39'),
('77191956-ba61-44e0-a541-ef2d386ed6b7', '00000000-0000-0000-0000-000000000001', 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoic3VwZXJfYWRtaW5AdmV4aW0uY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwib3JnYW5pemF0aW9uX2lkIjoiMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAwIiwiaWF0IjoxNzYyMzEyNzAyLCJleHAiOjE3NjI5MTc1MDJ9.iPnh05-EixzUZldwpi6ttHps8DYKfqL7QfmfmjYKdnA', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '2025-11-05 03:18:47', '2025-11-05 03:18:47', '2025-11-05 03:18:22'),
('7d49d980-5d88-4358-9bd5-3fb48f1f03f7', '00000000-0000-0000-0000-000000000001', 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoic3VwZXJfYWRtaW5AdmV4aW0uY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwib3JnYW5pemF0aW9uX2lkIjoiMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAxIiwiaWF0IjoxNzYyMzQzNzc4LCJleHAiOjE3NjI5NDg1Nzh9.GWWwG5OPkYgB4R1zicx-lEwhLMkvijAd3RUAjDLdwsc', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 11:56:20', '2025-11-05 11:56:20', '2025-11-05 11:56:18'),
('7d6328c0-7bdd-488d-8bfa-5135867070dd', '26b5ef2f-00d2-4588-8dd7-d41692307bf0', 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjI2YjVlZjJmLTAwZDItNDU4OC04ZGQ3LWQ0MTY5MjMwN2JmMCIsImVtYWlsIjoibHVvbmdob2FuZ21pbmg4OEBnbWFpbC5jb20iLCJyb2xlIjoib2ZmaWNpYWxfY29ycmVzcG9uZGVudCIsIm9yZ2FuaXphdGlvbl9pZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAxMCIsImlhdCI6MTc2MjM0MjY1MCwiZXhwIjoxNzYyOTQ3NDUwfQ.CgPe_fKXJfHuRURfTaHTZJVHS5vRHQYQURzkELJ6aJ0', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 11:37:31', '2025-11-05 11:37:31', '2025-11-05 11:37:30'),
('809c0142-fad5-4416-a61c-17f5a82b42c0', '26b5ef2f-00d2-4588-8dd7-d41692307bf0', 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjI2YjVlZjJmLTAwZDItNDU4OC04ZGQ3LWQ0MTY5MjMwN2JmMCIsImVtYWlsIjoibHVvbmdob2FuZ21pbmg4OEBnbWFpbC5jb20iLCJyb2xlIjoib2ZmaWNpYWxfY29ycmVzcG9uZGVudCIsIm9yZ2FuaXphdGlvbl9pZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAxMCIsImlhdCI6MTc2MjMzMjQzNiwiZXhwIjoxNzYyOTM3MjM2fQ.Wm7rQnQN84W0tb0oHwUA5iwavYFGKnRMbplVEI1oFm8', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 08:47:16', '2025-11-05 08:47:16', '2025-11-05 01:47:16'),
('89eafe4e-7fbc-411d-a010-029e36b07ec6', '26b5ef2f-00d2-4588-8dd7-d41692307bf0', 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjI2YjVlZjJmLTAwZDItNDU4OC04ZGQ3LWQ0MTY5MjMwN2JmMCIsImVtYWlsIjoibHVvbmdob2FuZ21pbmg4OEBnbWFpbC5jb20iLCJyb2xlIjoib2ZmaWNpYWxfY29ycmVzcG9uZGVudCIsIm9yZ2FuaXphdGlvbl9pZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAxMCIsImlhdCI6MTc2MjM1MDEyOSwiZXhwIjoxNzYyOTU0OTI5fQ.7Ep4w_7XgXJs7rQiicJBg9lipD9TuMJGXtv5Iq8Mpdo', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 13:42:31', '2025-11-05 13:42:31', '2025-11-05 13:42:09'),
('8d13f5e4-aa69-4629-b06c-257b9f959388', '00000000-0000-0000-0000-000000000001', 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoic3VwZXJfYWRtaW5AdmV4aW0uY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwib3JnYW5pemF0aW9uX2lkIjoiMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAxIiwiaWF0IjoxNzYyMzUxOTQzLCJleHAiOjE3NjI5NTY3NDN9.BMYFpHFBv70p40alJyfCabT0KWYoh7E0AjKdAKwjE44', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 14:12:26', '2025-11-05 14:12:26', '2025-11-05 14:12:23'),
('9926544f-5593-40cf-8ba4-6d09c0c072d7', '26b5ef2f-00d2-4588-8dd7-d41692307bf0', 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjI2YjVlZjJmLTAwZDItNDU4OC04ZGQ3LWQ0MTY5MjMwN2JmMCIsImVtYWlsIjoibHVvbmdob2FuZ21pbmg4OEBnbWFpbC5jb20iLCJyb2xlIjoib2ZmaWNpYWxfY29ycmVzcG9uZGVudCIsIm9yZ2FuaXphdGlvbl9pZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAxMCIsImlhdCI6MTc2MjMzMzUyOCwiZXhwIjoxNzYyOTM4MzI4fQ.cD2q3DTjJJCa7rQhpyS5Jm5KxuT7mxiVYp4Fls-Eepc', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 09:06:44', '2025-11-05 09:06:44', '2025-11-05 09:05:28'),
('99ec874c-50af-40b0-a618-ec544c9d1ef5', '00000000-0000-0000-0000-000000000001', 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoic3VwZXJfYWRtaW5AdmV4aW0uY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwib3JnYW5pemF0aW9uX2lkIjoiMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAxIiwiaWF0IjoxNzYyMzQzNTQ1LCJleHAiOjE3NjI5NDgzNDV9.0VJctcc9VPaebEGbqv1xVrDzfTVoC2wK3xns5FBLTa0', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 11:56:09', '2025-11-05 11:56:09', '2025-11-05 11:52:25'),
('a0a98469-2cd9-47ff-ad90-363ffbab9fe9', '26b5ef2f-00d2-4588-8dd7-d41692307bf0', 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjI2YjVlZjJmLTAwZDItNDU4OC04ZGQ3LWQ0MTY5MjMwN2JmMCIsImVtYWlsIjoibHVvbmdob2FuZ21pbmg4OEBnbWFpbC5jb20iLCJyb2xlIjoib2ZmaWNpYWxfY29ycmVzcG9uZGVudCIsIm9yZ2FuaXphdGlvbl9pZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAxMCIsImlhdCI6MTc2MjMzMzczMSwiZXhwIjoxNzYyOTM4NTMxfQ.Z6-wlzbFAIYR43vXhftjpy8f9u-m2IKyh6LhVCi2H2U', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 11:36:02', '2025-11-05 11:36:02', '2025-11-05 09:08:51'),
('b13b18eb-7d78-45ac-8b08-d7856eb5b58c', '26b5ef2f-00d2-4588-8dd7-d41692307bf0', 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjI2YjVlZjJmLTAwZDItNDU4OC04ZGQ3LWQ0MTY5MjMwN2JmMCIsImVtYWlsIjoibHVvbmdob2FuZ21pbmg4OEBnbWFpbC5jb20iLCJyb2xlIjoib2ZmaWNpYWxfY29ycmVzcG9uZGVudCIsIm9yZ2FuaXphdGlvbl9pZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAxMCIsImlhdCI6MTc2MjM1MTUxMSwiZXhwIjoxNzYyOTU2MzExfQ.a6KCdHOYa4r0VOPpJZj8iL8FfkX4aoULEbpbk5soQL4', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 14:05:11', '2025-11-05 14:05:11', '2025-11-05 14:05:11'),
('b216ff19-e3a8-4fed-96ea-e4c01a9f6387', '00000000-0000-0000-0000-000000000001', 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoic3VwZXJfYWRtaW5AdmV4aW0uY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwib3JnYW5pemF0aW9uX2lkIjoiMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAxIiwiaWF0IjoxNzYyMzUwMzkzLCJleHAiOjE3NjI5NTUxOTN9.PHgBz2g6KZ2NrDSgaKNDgsRDU-BgZV0G1ITARJ1JjZE', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 13:46:41', '2025-11-05 13:46:41', '2025-11-05 13:46:33'),
('b224ceeb-9081-477e-b2a0-0a3f631f0d3c', '00000000-0000-0000-0000-000000000001', 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoic3VwZXJfYWRtaW5AdmV4aW0uY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwib3JnYW5pemF0aW9uX2lkIjoiMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAxIiwiaWF0IjoxNzYyMzUxNjA2LCJleHAiOjE3NjI5NTY0MDZ9.ZUMq4XkX0PF4JDNAgEXchmN31gISlcmNMBdGHGeakhE', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 14:06:49', '2025-11-05 14:06:49', '2025-11-05 14:06:46'),
('b2810798-7052-41ab-a37f-3e4376e183de', '26b5ef2f-00d2-4588-8dd7-d41692307bf0', 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjI2YjVlZjJmLTAwZDItNDU4OC04ZGQ3LWQ0MTY5MjMwN2JmMCIsImVtYWlsIjoibHVvbmdob2FuZ21pbmg4OEBnbWFpbC5jb20iLCJyb2xlIjoib2ZmaWNpYWxfY29ycmVzcG9uZGVudCIsIm9yZ2FuaXphdGlvbl9pZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAxMCIsImlhdCI6MTc2MjM1MDExNiwiZXhwIjoxNzYyOTU0OTE2fQ.bYLkRgIjCwPy3WnQL0xwQOiBYOEI_O0Rd3DISt-HbYY', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 13:41:57', '2025-11-05 13:41:57', '2025-11-05 13:41:56'),
('b8c3a891-a8cd-47a8-85fa-d0d3ef489965', '26b5ef2f-00d2-4588-8dd7-d41692307bf0', 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjI2YjVlZjJmLTAwZDItNDU4OC04ZGQ3LWQ0MTY5MjMwN2JmMCIsImVtYWlsIjoibHVvbmdob2FuZ21pbmg4OEBnbWFpbC5jb20iLCJyb2xlIjoib2ZmaWNpYWxfY29ycmVzcG9uZGVudCIsIm9yZ2FuaXphdGlvbl9pZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAxMCIsImlhdCI6MTc2MjMzMjY2NCwiZXhwIjoxNzYyOTM3NDY0fQ.B55gMHTUnATAfHd7n9WPxNJpxIgFN1vhwtN13Fu0y1E', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 08:51:05', '2025-11-05 08:51:05', '2025-11-05 08:51:04'),
('cd386f3b-cd75-4237-aa9b-f47eac684ed3', '26b5ef2f-00d2-4588-8dd7-d41692307bf0', 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjI2YjVlZjJmLTAwZDItNDU4OC04ZGQ3LWQ0MTY5MjMwN2JmMCIsImVtYWlsIjoibHVvbmdob2FuZ21pbmg4OEBnbWFpbC5jb20iLCJyb2xlIjoib2ZmaWNpYWxfY29ycmVzcG9uZGVudCIsIm9yZ2FuaXphdGlvbl9pZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAxMCIsImlhdCI6MTc2MjMzMjYzMSwiZXhwIjoxNzYyOTM3NDMxfQ.YzEncvi_X7OanDY-UtbXF2guE0F1W8l9O2TSpENppao', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 08:50:36', '2025-11-05 08:50:36', '2025-11-05 08:50:31'),
('ce00b1fe-ea67-4eba-abe8-c666e89fbfec', '00000000-0000-0000-0000-000000000001', 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoic3VwZXJfYWRtaW5AdmV4aW0uY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwib3JnYW5pemF0aW9uX2lkIjoiMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAxIiwiaWF0IjoxNzYyMzUxMzIwLCJleHAiOjE3NjI5NTYxMjB9.BlSkUmXZXjekJt3hiqN-Kbs4PL3JIeR_CRjl3PHj8Z0', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 14:02:03', '2025-11-05 14:02:03', '2025-11-05 14:02:00'),
('d4c9d839-acef-4d0b-b87e-7837bc654158', '26b5ef2f-00d2-4588-8dd7-d41692307bf0', 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjI2YjVlZjJmLTAwZDItNDU4OC04ZGQ3LWQ0MTY5MjMwN2JmMCIsImVtYWlsIjoibHVvbmdob2FuZ21pbmg4OEBnbWFpbC5jb20iLCJyb2xlIjoib2ZmaWNpYWxfY29ycmVzcG9uZGVudCIsIm9yZ2FuaXphdGlvbl9pZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAxMCIsImlhdCI6MTc2MjM1MTE3NSwiZXhwIjoxNzYyOTU1OTc1fQ.Ts-JaBnZRFRE2rBo8oaXvfjXGY1IN40zMPf9j9NTM8A', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-06 13:59:35', '2025-11-05 13:59:35', '2025-11-05 13:59:35'),
('eb3d4a8f-d91a-4ac0-86c8-a6fa75f36f58', '26b5ef2f-00d2-4588-8dd7-d41692307bf0', 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjI2YjVlZjJmLTAwZDItNDU4OC04ZGQ3LWQ0MTY5MjMwN2JmMCIsImVtYWlsIjoibHVvbmdob2FuZ21pbmg4OEBnbWFpbC5jb20iLCJyb2xlIjoib2ZmaWNpYWxfY29ycmVzcG9uZGVudCIsIm9yZ2FuaXphdGlvbl9pZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAxMCIsImlhdCI6MTc2MjM0NjM2OCwiZXhwIjoxNzYyOTUxMTY4fQ.R7JyskuV7jN4oPQmuR_jdxjmVgg2QrsiNrbvZAKDv5s', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-05 12:39:28', '2025-11-05 12:39:28', '2025-11-05 05:39:28');

-- --------------------------------------------------------

--
-- Cấu trúc đóng vai cho view `v_audit_summary`
-- (See below for the actual view)
--
CREATE TABLE `v_audit_summary` (
`log_date` date
,`action` varchar(100)
,`entity_type` varchar(100)
,`count` bigint(21)
,`successful` decimal(22,0)
,`failed` decimal(22,0)
);

-- --------------------------------------------------------

--
-- Cấu trúc cho view `v_audit_summary`
--
DROP TABLE IF EXISTS `v_audit_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_audit_summary`  AS SELECT cast(`tbl_audit_log`.`timestamp` as date) AS `log_date`, `tbl_audit_log`.`action` AS `action`, `tbl_audit_log`.`entity_type` AS `entity_type`, count(0) AS `count`, sum(case when `tbl_audit_log`.`status` = 'success' then 1 else 0 end) AS `successful`, sum(case when `tbl_audit_log`.`status` = 'failure' then 1 else 0 end) AS `failed` FROM `tbl_audit_log` GROUP BY cast(`tbl_audit_log`.`timestamp` as date), `tbl_audit_log`.`action`, `tbl_audit_log`.`entity_type` ;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_organization` (`organization_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_created` (`created_at`),
  ADD KEY `idx_audit_organization` (`organization_id`),
  ADD KEY `idx_audit_user` (`user_id`),
  ADD KEY `idx_audit_created` (`created_at`);

--
-- Chỉ mục cho bảng `compliance_alerts`
--
ALTER TABLE `compliance_alerts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `acknowledged_by` (`acknowledged_by`),
  ADD KEY `idx_organization` (`organization_id`),
  ADD KEY `idx_severity` (`severity`),
  ADD KEY `idx_acknowledged` (`is_acknowledged`),
  ADD KEY `idx_alerts_organization` (`organization_id`),
  ADD KEY `idx_alerts_severity` (`severity`),
  ADD KEY `idx_alerts_acknowledged` (`is_acknowledged`);

--
-- Chỉ mục cho bảng `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_industry` (`industry`),
  ADD KEY `idx_customers_duns` (`duns_number`);

--
-- Chỉ mục cho bảng `detailed_audit_logs`
--
ALTER TABLE `detailed_audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `organization_id` (`organization_id`),
  ADD KEY `idx_audit_logs_user` (`user_id`),
  ADD KEY `idx_audit_logs_action` (`action`),
  ADD KEY `idx_audit_logs_created` (`created_at`);

--
-- Chỉ mục cho bảng `establishment_registrations`
--
ALTER TABLE `establishment_registrations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `fda_registration_number` (`fda_registration_number`),
  ADD KEY `official_correspondent_id` (`official_correspondent_id`),
  ADD KEY `idx_organization` (`organization_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_expiration` (`expiration_date`),
  ADD KEY `idx_registrations_organization` (`organization_id`),
  ADD KEY `idx_registrations_status` (`status`),
  ADD KEY `idx_registrations_expiration` (`expiration_date`);

--
-- Chỉ mục cho bảng `fda_alerts`
--
ALTER TABLE `fda_alerts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `establishment_id` (`establishment_id`),
  ADD KEY `acknowledged_by` (`acknowledged_by`),
  ADD KEY `idx_customer` (`customer_id`),
  ADD KEY `idx_severity` (`severity`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created` (`created_at`);

--
-- Chỉ mục cho bảng `fda_api_sync_logs`
--
ALTER TABLE `fda_api_sync_logs`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `fda_establishments`
--
ALTER TABLE `fda_establishments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `fda_registration_number` (`fda_registration_number`),
  ADD KEY `idx_customer` (`customer_id`),
  ADD KEY `idx_industry` (`industry`),
  ADD KEY `idx_renewal` (`next_renewal_date`),
  ADD KEY `idx_establishments_duns` (`duns_number`);

--
-- Chỉ mục cho bảng `notification_preferences`
--
ALTER TABLE `notification_preferences`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`);

--
-- Chỉ mục cho bảng `organizations`
--
ALTER TABLE `organizations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `fda_registration_number` (`fda_registration_number`),
  ADD KEY `idx_organizations_duns` (`duns_number`);

--
-- Chỉ mục cho bảng `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `product_code` (`product_code`),
  ADD KEY `idx_organization` (`organization_id`),
  ADD KEY `idx_registration` (`registration_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_products_organization` (`organization_id`),
  ADD KEY `idx_products_registration` (`registration_id`),
  ADD KEY `idx_products_status` (`status`);

--
-- Chỉ mục cho bảng `rate_limits`
--
ALTER TABLE `rate_limits`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_rate_limit_user` (`user_id`),
  ADD KEY `idx_rate_limit_reset` (`reset_at`);

--
-- Chỉ mục cho bảng `renewal_reminders`
--
ALTER TABLE `renewal_reminders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `establishment_id` (`establishment_id`),
  ADD KEY `idx_date` (`scheduled_date`);

--
-- Chỉ mục cho bảng `role_change_audit`
--
ALTER TABLE `role_change_audit`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_role_change_user` (`user_id`),
  ADD KEY `idx_role_change_changed_by` (`changed_by`);

--
-- Chỉ mục cho bảng `role_change_requests`
--
ALTER TABLE `role_change_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `idx_role_requests_status` (`status`),
  ADD KEY `idx_role_requests_requester` (`requester_id`),
  ADD KEY `idx_role_requests_target` (`target_user_id`);

--
-- Chỉ mục cho bảng `session_tokens`
--
ALTER TABLE `session_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `idx_session_user` (`user_id`),
  ADD KEY `idx_session_expires` (`expires_at`);

--
-- Chỉ mục cho bảng `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `key` (`key`),
  ADD KEY `created_by` (`created_by`);

--
-- Chỉ mục cho bảng `tbl_audit_log`
--
ALTER TABLE `tbl_audit_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_audit_log_client_id` (`client_id`),
  ADD KEY `idx_audit_log_user_id` (`user_id`),
  ADD KEY `idx_audit_log_entity_type` (`entity_type`),
  ADD KEY `idx_audit_log_timestamp` (`timestamp`),
  ADD KEY `idx_audit_log_action` (`action`);

--
-- Chỉ mục cho bảng `tbl_clients`
--
ALTER TABLE `tbl_clients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `organization_name` (`organization_name`),
  ADD KEY `idx_clients_status` (`status`),
  ADD KEY `idx_clients_fei_number` (`fei_number`);

--
-- Chỉ mục cho bảng `tbl_client_facilities`
--
ALTER TABLE `tbl_client_facilities`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `fei_number` (`fei_number`),
  ADD KEY `idx_facilities_client_id` (`client_id`),
  ADD KEY `idx_facilities_fei_number` (`fei_number`),
  ADD KEY `idx_facilities_status` (`status`);

--
-- Chỉ mục cho bảng `tbl_compliance_status`
--
ALTER TABLE `tbl_compliance_status`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_compliance_client_id` (`client_id`),
  ADD KEY `idx_compliance_facility_id` (`facility_id`),
  ADD KEY `idx_compliance_status` (`compliance_status`);

--
-- Chỉ mục cho bảng `tbl_documents`
--
ALTER TABLE `tbl_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_documents_uploaded_by` (`uploaded_by`),
  ADD KEY `idx_documents_client_id` (`client_id`),
  ADD KEY `idx_documents_submission_id` (`submission_id`),
  ADD KEY `idx_documents_facility_id` (`facility_id`);

--
-- Chỉ mục cho bảng `tbl_fda_api_log`
--
ALTER TABLE `tbl_fda_api_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_fda_api_log_client_id` (`client_id`),
  ADD KEY `idx_fda_api_log_submission_id` (`submission_id`),
  ADD KEY `idx_fda_api_log_timestamp` (`timestamp`);

--
-- Chỉ mục cho bảng `tbl_products`
--
ALTER TABLE `tbl_products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_products_client_id` (`client_id`),
  ADD KEY `idx_products_facility_id` (`facility_id`),
  ADD KEY `idx_products_product_code` (`product_code`),
  ADD KEY `idx_products_status` (`status`);

--
-- Chỉ mục cho bảng `tbl_product_ingredients`
--
ALTER TABLE `tbl_product_ingredients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_ingredients_product` (`product_id`);

--
-- Chỉ mục cho bảng `tbl_reminders`
--
ALTER TABLE `tbl_reminders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_reminders_submission` (`submission_id`),
  ADD KEY `fk_reminders_facility` (`facility_id`),
  ADD KEY `idx_reminders_client_id` (`client_id`),
  ADD KEY `idx_reminders_due_date` (`due_date`),
  ADD KEY `idx_reminders_is_sent` (`is_sent`);

--
-- Chỉ mục cho bảng `tbl_roles`
--
ALTER TABLE `tbl_roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `role_name` (`role_name`),
  ADD KEY `fk_roles_client` (`client_id`);

--
-- Chỉ mục cho bảng `tbl_submissions`
--
ALTER TABLE `tbl_submissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `submission_number` (`submission_number`),
  ADD KEY `fk_submissions_submitted_by` (`submitted_by`),
  ADD KEY `fk_submissions_reviewed_by` (`reviewed_by`),
  ADD KEY `idx_submissions_client_id` (`client_id`),
  ADD KEY `idx_submissions_facility_id` (`facility_id`),
  ADD KEY `idx_submissions_status` (`submission_status`),
  ADD KEY `idx_submissions_fda_id` (`fda_submission_id`),
  ADD KEY `idx_submissions_submitted_date` (`submitted_date`);

--
-- Chỉ mục cho bảng `tbl_submission_counter`
--
ALTER TABLE `tbl_submission_counter`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `tbl_submission_products`
--
ALTER TABLE `tbl_submission_products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `submission_id` (`submission_id`,`product_id`),
  ADD KEY `fk_sub_products_product` (`product_id`);

--
-- Chỉ mục cho bảng `tbl_users`
--
ALTER TABLE `tbl_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_client_id` (`client_id`),
  ADD KEY `idx_users_email` (`email`),
  ADD KEY `idx_users_status` (`status`);

--
-- Chỉ mục cho bảng `tbl_user_roles`
--
ALTER TABLE `tbl_user_roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`,`role_id`),
  ADD KEY `fk_user_roles_assigned_by` (`assigned_by`),
  ADD KEY `idx_user_roles_user_id` (`user_id`),
  ADD KEY `idx_user_roles_role_id` (`role_id`);

--
-- Chỉ mục cho bảng `two_factor_auth`
--
ALTER TABLE `two_factor_auth`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `idx_2fa_user` (`user_id`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_organization` (`organization_id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_users_duns` (`duns_number`),
  ADD KEY `idx_users_organization` (`organization_id`),
  ADD KEY `idx_users_email` (`email`),
  ADD KEY `idx_users_role` (`role`);

--
-- Chỉ mục cho bảng `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `idx_token` (`token`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_expires_at` (`expires_at`),
  ADD KEY `idx_last_activity` (`last_activity`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `tbl_submission_counter`
--
ALTER TABLE `tbl_submission_counter`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `audit_logs_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `compliance_alerts`
--
ALTER TABLE `compliance_alerts`
  ADD CONSTRAINT `compliance_alerts_ibfk_1` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `compliance_alerts_ibfk_2` FOREIGN KEY (`acknowledged_by`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `detailed_audit_logs`
--
ALTER TABLE `detailed_audit_logs`
  ADD CONSTRAINT `detailed_audit_logs_ibfk_1` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `detailed_audit_logs_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `establishment_registrations`
--
ALTER TABLE `establishment_registrations`
  ADD CONSTRAINT `establishment_registrations_ibfk_1` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `establishment_registrations_ibfk_2` FOREIGN KEY (`official_correspondent_id`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `fda_alerts`
--
ALTER TABLE `fda_alerts`
  ADD CONSTRAINT `fda_alerts_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fda_alerts_ibfk_2` FOREIGN KEY (`establishment_id`) REFERENCES `fda_establishments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fda_alerts_ibfk_3` FOREIGN KEY (`acknowledged_by`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `fda_establishments`
--
ALTER TABLE `fda_establishments`
  ADD CONSTRAINT `fda_establishments_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `notification_preferences`
--
ALTER TABLE `notification_preferences`
  ADD CONSTRAINT `notification_preferences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`registration_id`) REFERENCES `establishment_registrations` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `rate_limits`
--
ALTER TABLE `rate_limits`
  ADD CONSTRAINT `rate_limits_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `renewal_reminders`
--
ALTER TABLE `renewal_reminders`
  ADD CONSTRAINT `renewal_reminders_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `renewal_reminders_ibfk_2` FOREIGN KEY (`establishment_id`) REFERENCES `fda_establishments` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `role_change_audit`
--
ALTER TABLE `role_change_audit`
  ADD CONSTRAINT `role_change_audit_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_change_audit_ibfk_2` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `role_change_requests`
--
ALTER TABLE `role_change_requests`
  ADD CONSTRAINT `role_change_requests_ibfk_1` FOREIGN KEY (`requester_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_change_requests_ibfk_2` FOREIGN KEY (`target_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_change_requests_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `session_tokens`
--
ALTER TABLE `session_tokens`
  ADD CONSTRAINT `session_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `system_settings`
--
ALTER TABLE `system_settings`
  ADD CONSTRAINT `system_settings_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `tbl_audit_log`
--
ALTER TABLE `tbl_audit_log`
  ADD CONSTRAINT `fk_audit_client` FOREIGN KEY (`client_id`) REFERENCES `tbl_clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `tbl_client_facilities`
--
ALTER TABLE `tbl_client_facilities`
  ADD CONSTRAINT `fk_facilities_client` FOREIGN KEY (`client_id`) REFERENCES `tbl_clients` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `tbl_compliance_status`
--
ALTER TABLE `tbl_compliance_status`
  ADD CONSTRAINT `fk_compliance_client` FOREIGN KEY (`client_id`) REFERENCES `tbl_clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_compliance_facility` FOREIGN KEY (`facility_id`) REFERENCES `tbl_client_facilities` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `tbl_documents`
--
ALTER TABLE `tbl_documents`
  ADD CONSTRAINT `fk_documents_client` FOREIGN KEY (`client_id`) REFERENCES `tbl_clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_documents_facility` FOREIGN KEY (`facility_id`) REFERENCES `tbl_client_facilities` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_documents_submission` FOREIGN KEY (`submission_id`) REFERENCES `tbl_submissions` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_documents_uploaded_by` FOREIGN KEY (`uploaded_by`) REFERENCES `tbl_users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `tbl_fda_api_log`
--
ALTER TABLE `tbl_fda_api_log`
  ADD CONSTRAINT `fk_fda_api_client` FOREIGN KEY (`client_id`) REFERENCES `tbl_clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_fda_api_submission` FOREIGN KEY (`submission_id`) REFERENCES `tbl_submissions` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `tbl_products`
--
ALTER TABLE `tbl_products`
  ADD CONSTRAINT `fk_products_client` FOREIGN KEY (`client_id`) REFERENCES `tbl_clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_products_facility` FOREIGN KEY (`facility_id`) REFERENCES `tbl_client_facilities` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `tbl_product_ingredients`
--
ALTER TABLE `tbl_product_ingredients`
  ADD CONSTRAINT `fk_ingredients_product` FOREIGN KEY (`product_id`) REFERENCES `tbl_products` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `tbl_reminders`
--
ALTER TABLE `tbl_reminders`
  ADD CONSTRAINT `fk_reminders_client` FOREIGN KEY (`client_id`) REFERENCES `tbl_clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_reminders_facility` FOREIGN KEY (`facility_id`) REFERENCES `tbl_client_facilities` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_reminders_submission` FOREIGN KEY (`submission_id`) REFERENCES `tbl_submissions` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `tbl_roles`
--
ALTER TABLE `tbl_roles`
  ADD CONSTRAINT `fk_roles_client` FOREIGN KEY (`client_id`) REFERENCES `tbl_clients` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `tbl_submissions`
--
ALTER TABLE `tbl_submissions`
  ADD CONSTRAINT `fk_submissions_client` FOREIGN KEY (`client_id`) REFERENCES `tbl_clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_submissions_facility` FOREIGN KEY (`facility_id`) REFERENCES `tbl_client_facilities` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_submissions_reviewed_by` FOREIGN KEY (`reviewed_by`) REFERENCES `tbl_users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_submissions_submitted_by` FOREIGN KEY (`submitted_by`) REFERENCES `tbl_users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `tbl_submission_products`
--
ALTER TABLE `tbl_submission_products`
  ADD CONSTRAINT `fk_sub_products_product` FOREIGN KEY (`product_id`) REFERENCES `tbl_products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_sub_products_submission` FOREIGN KEY (`submission_id`) REFERENCES `tbl_submissions` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `tbl_users`
--
ALTER TABLE `tbl_users`
  ADD CONSTRAINT `fk_users_client` FOREIGN KEY (`client_id`) REFERENCES `tbl_clients` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `tbl_user_roles`
--
ALTER TABLE `tbl_user_roles`
  ADD CONSTRAINT `fk_user_roles_assigned_by` FOREIGN KEY (`assigned_by`) REFERENCES `tbl_users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_user_roles_role` FOREIGN KEY (`role_id`) REFERENCES `tbl_roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `two_factor_auth`
--
ALTER TABLE `two_factor_auth`
  ADD CONSTRAINT `two_factor_auth_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
--
-- Cơ sở dữ liệu: `fda_registry`
--
CREATE DATABASE IF NOT EXISTS `fda_registry` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `fda_registry`;
--
-- Cơ sở dữ liệu: `fda_vexim`
--
CREATE DATABASE IF NOT EXISTS `fda_vexim` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `fda_vexim`;
--
-- Cơ sở dữ liệu: `forma204_db`
--
CREATE DATABASE IF NOT EXISTS `forma204_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `forma204_db`;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `alerts`
--

CREATE TABLE `alerts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `facility_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `type` enum('renewal_reminder','expiry_warning','audit_notice','compliance_warning','fda_inspection','risk_alert') NOT NULL DEFAULT 'renewal_reminder',
  `priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  `status` enum('active','acknowledged','resolved') NOT NULL DEFAULT 'active',
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `alert_date` date NOT NULL,
  `due_date` date DEFAULT NULL,
  `acknowledged_at` timestamp NULL DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `email_sent` tinyint(1) NOT NULL DEFAULT 0,
  `email_sent_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `archival_audit_logs`
--

CREATE TABLE `archival_audit_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `original_id` bigint(20) UNSIGNED NOT NULL COMMENT 'Original ID from audit_logs table',
  `event_type` varchar(50) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `auditable_type` varchar(255) DEFAULT NULL,
  `auditable_id` bigint(20) UNSIGNED DEFAULT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `archived_at` timestamp NULL DEFAULT NULL COMMENT 'When this record was moved to archival',
  `archived_by` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'User who triggered archival',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `archival_cte_events`
--

CREATE TABLE `archival_cte_events` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `original_id` bigint(20) UNSIGNED NOT NULL COMMENT 'Original ID from cte_events table',
  `event_type` enum('receiving','transformation','shipping') NOT NULL,
  `trace_record_id` bigint(20) UNSIGNED NOT NULL,
  `event_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `location_id` bigint(20) UNSIGNED NOT NULL,
  `partner_id` bigint(20) UNSIGNED DEFAULT NULL,
  `input_tlcs` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'For transformation events' CHECK (json_valid(`input_tlcs`)),
  `reference_doc` varchar(100) DEFAULT NULL COMMENT 'PO, Invoice, BOL number',
  `notes` text DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `archived_at` timestamp NULL DEFAULT NULL COMMENT 'When this record was moved to archival',
  `archived_by` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'User who triggered archival',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `archival_documents`
--

CREATE TABLE `archival_documents` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `original_id` bigint(20) UNSIGNED NOT NULL COMMENT 'Original ID from documents table',
  `doc_number` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(255) NOT NULL,
  `file_size` bigint(20) NOT NULL,
  `version` varchar(255) NOT NULL DEFAULT '1.0',
  `status` varchar(255) NOT NULL,
  `effective_date` date DEFAULT NULL,
  `review_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `uploaded_by` bigint(20) UNSIGNED NOT NULL,
  `approved_by` bigint(20) UNSIGNED DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `organization_id` bigint(20) UNSIGNED NOT NULL,
  `file_hash` varchar(255) DEFAULT NULL,
  `metadata_hash` varchar(255) DEFAULT NULL,
  `is_encrypted` tinyint(1) NOT NULL DEFAULT 0,
  `encrypted_at` timestamp NULL DEFAULT NULL,
  `archived_at` timestamp NULL DEFAULT NULL COMMENT 'When this record was moved to archival',
  `archived_by` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'User who triggered archival',
  `has_signatures` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Whether document had signatures',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `archival_document_versions`
--

CREATE TABLE `archival_document_versions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `original_id` bigint(20) UNSIGNED NOT NULL COMMENT 'Original ID from document_versions table',
  `document_id` bigint(20) UNSIGNED NOT NULL,
  `version` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_size` bigint(20) NOT NULL,
  `change_notes` text DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `archived_at` timestamp NULL DEFAULT NULL,
  `archived_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `archival_e_signatures`
--

CREATE TABLE `archival_e_signatures` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `original_id` bigint(20) UNSIGNED NOT NULL COMMENT 'Original ID from e_signatures table',
  `record_type` varchar(255) NOT NULL,
  `record_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `action` varchar(255) NOT NULL,
  `meaning_of_signature` text NOT NULL,
  `reason` text DEFAULT NULL,
  `signature_hash` varchar(255) NOT NULL,
  `timestamp_token` text DEFAULT NULL,
  `certificate_id` bigint(20) UNSIGNED DEFAULT NULL,
  `verification_report` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`verification_report`)),
  `signed_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_revoked` tinyint(1) NOT NULL DEFAULT 0,
  `revoked_at` timestamp NULL DEFAULT NULL,
  `revoked_by` bigint(20) UNSIGNED DEFAULT NULL,
  `revocation_reason` text DEFAULT NULL,
  `archived_at` timestamp NULL DEFAULT NULL,
  `archived_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `archival_logs`
--

CREATE TABLE `archival_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `organization_id` bigint(20) UNSIGNED NOT NULL,
  `data_type` varchar(50) NOT NULL,
  `strategy` enum('database','s3_glacier','local') NOT NULL DEFAULT 'database',
  `records_archived` int(11) NOT NULL DEFAULT 0,
  `records_verified` int(11) NOT NULL DEFAULT 0,
  `records_deleted_from_hot` int(11) NOT NULL DEFAULT 0,
  `archival_location` text DEFAULT NULL,
  `executed_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `executed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `status` enum('success','failed','partial') NOT NULL DEFAULT 'success',
  `error_message` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `archival_trace_records`
--

CREATE TABLE `archival_trace_records` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `original_id` bigint(20) UNSIGNED NOT NULL COMMENT 'Original ID from trace_records table',
  `tlc` varchar(255) NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `available_quantity` decimal(10,2) NOT NULL DEFAULT 0.00,
  `consumed_quantity` decimal(10,2) NOT NULL DEFAULT 0.00,
  `unit` varchar(20) NOT NULL DEFAULT 'kg',
  `lot_code` varchar(255) DEFAULT NULL,
  `harvest_date` date DEFAULT NULL,
  `location_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('active','consumed','shipped','destroyed','voided') NOT NULL DEFAULT 'active',
  `path` text DEFAULT NULL,
  `organization_id` bigint(20) UNSIGNED DEFAULT NULL,
  `materialized_path` varchar(500) DEFAULT NULL,
  `archived_at` timestamp NULL DEFAULT NULL COMMENT 'When this record was moved to archival',
  `archived_by` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'User who triggered archival',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `archival_trace_relationships`
--

CREATE TABLE `archival_trace_relationships` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `original_id` bigint(20) UNSIGNED NOT NULL COMMENT 'Original ID from trace_relationships table',
  `parent_id` bigint(20) UNSIGNED NOT NULL,
  `child_id` bigint(20) UNSIGNED DEFAULT NULL,
  `relationship_type` enum('INPUT','OUTPUT','VOID','transformation','aggregation','disaggregation') NOT NULL,
  `cte_event_id` bigint(20) UNSIGNED DEFAULT NULL,
  `archived_at` timestamp NULL DEFAULT NULL COMMENT 'When this record was moved to archival',
  `archived_by` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'User who triggered archival',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `organization_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `table_name` varchar(50) DEFAULT NULL,
  `record_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `integrity_hash` varchar(64) DEFAULT NULL,
  `event_category` varchar(50) NOT NULL DEFAULT 'SYSTEM'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `audit_logs_details`
--

CREATE TABLE `audit_logs_details` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `audit_log_id` bigint(20) UNSIGNED NOT NULL,
  `organization_id` bigint(20) UNSIGNED NOT NULL,
  `event_category` varchar(50) NOT NULL DEFAULT 'SYSTEM',
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `batch_signature_operations`
--

CREATE TABLE `batch_signature_operations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `organization_id` bigint(20) UNSIGNED DEFAULT NULL,
  `total_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `completed_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `failed_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `status` enum('queued','processing','paused','completed','partial_complete','cancelled','failed') NOT NULL DEFAULT 'queued',
  `meaning_of_signature` text NOT NULL,
  `progress_percentage` double NOT NULL DEFAULT 0,
  `error_messages` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`error_messages`)),
  `batch_metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`batch_metadata`)),
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `paused_at` timestamp NULL DEFAULT NULL,
  `resumed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('fsma_204_traceability_cache_5c785c036466adea360111aa28563bfd556b5fba', 'i:2;', 1762252030),
('fsma_204_traceability_cache_5c785c036466adea360111aa28563bfd556b5fba:timer', 'i:1762252030;', 1762252030);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `compliance_reports`
--

CREATE TABLE `compliance_reports` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `organization_id` bigint(20) UNSIGNED NOT NULL,
  `report_type` varchar(255) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'generated',
  `summary` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cte_events`
--

CREATE TABLE `cte_events` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `event_type` enum('receiving','transformation','shipping','VOID','ADJUSTMENT') NOT NULL,
  `status` enum('active','voided') NOT NULL DEFAULT 'active',
  `void_count` int(11) NOT NULL DEFAULT 0 COMMENT 'Number of times this event has been voided',
  `trace_record_id` bigint(20) UNSIGNED NOT NULL,
  `event_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `harvest_date` datetime DEFAULT NULL,
  `pack_date` datetime DEFAULT NULL,
  `cooling_date` timestamp NULL DEFAULT NULL COMMENT 'Initial cooling date for fresh produce (KDE #14)',
  `location_id` bigint(20) UNSIGNED NOT NULL,
  `partner_id` bigint(20) UNSIGNED DEFAULT NULL,
  `organization_id` bigint(20) UNSIGNED NOT NULL,
  `input_tlcs` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'For transformation events' CHECK (json_valid(`input_tlcs`)),
  `reference_doc` varchar(100) DEFAULT NULL COMMENT 'PO, Invoice, BOL number',
  `reference_doc_type` enum('PO','Invoice','BOL','AWB','Other') DEFAULT NULL COMMENT 'Type of reference document (KDE #17)',
  `product_description` varchar(255) DEFAULT NULL COMMENT 'Product name/description for FDA reporting',
  `quantity_received` decimal(12,2) DEFAULT NULL COMMENT 'Quantity received in receiving events',
  `output_quantity` decimal(12,2) DEFAULT NULL,
  `quantity_shipped` decimal(12,2) DEFAULT NULL COMMENT 'Quantity actually shipped (supports partial shipping)',
  `quantity_unit` varchar(50) DEFAULT NULL COMMENT 'Unit of measure (kg, lbs, cases, etc.)',
  `receiving_location_gln` varchar(13) DEFAULT NULL COMMENT 'GLN of receiving location',
  `receiving_location_name` varchar(255) DEFAULT NULL COMMENT 'Name of receiving location',
  `harvest_location_gln` varchar(13) DEFAULT NULL COMMENT 'Harvest location GLN - 13 digits (KDE #8)',
  `harvest_location_name` varchar(255) DEFAULT NULL COMMENT 'Harvest location name (farm/field) (KDE #8)',
  `shipping_location_gln` varchar(13) DEFAULT NULL COMMENT 'GLN of shipping location',
  `destination_gln` varchar(13) DEFAULT NULL COMMENT 'GLN of destination partner',
  `destination_address` text DEFAULT NULL COMMENT 'Full address of destination',
  `shipping_method` varchar(50) DEFAULT NULL COMMENT 'Method of shipment (truck, air, sea, rail, other)',
  `carrier_name` varchar(255) DEFAULT NULL COMMENT 'Name of carrier (FedEx, UPS, etc.)',
  `tracking_number` varchar(100) DEFAULT NULL COMMENT 'BOL/AWB/Tracking number',
  `shipping_location_name` varchar(255) DEFAULT NULL COMMENT 'Name of shipping location',
  `business_name` varchar(255) DEFAULT NULL COMMENT 'Name of business performing the event',
  `business_gln` varchar(13) DEFAULT NULL COMMENT 'GLN of business performing the event',
  `business_address` varchar(500) DEFAULT NULL COMMENT 'Address of business performing the event',
  `traceability_lot_code` varchar(100) DEFAULT NULL COMMENT 'Traceability Lot Code (TLC) assigned to the product',
  `product_lot_code` varchar(100) DEFAULT NULL COMMENT 'Original product lot code from supplier (KDE #12)',
  `output_tlcs` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Output TLCs for transformation events' CHECK (json_valid(`output_tlcs`)),
  `transformation_description` text DEFAULT NULL COMMENT 'Description of transformation process',
  `shipping_reference_doc` varchar(100) DEFAULT NULL COMMENT 'Shipping document reference (BOL, AWB, etc.)',
  `shipping_date` timestamp NULL DEFAULT NULL COMMENT 'Date of shipment',
  `receiving_date_expected` varchar(50) DEFAULT NULL COMMENT 'Expected receiving date',
  `inventory_status` enum('PARTIAL','FULL','RESERVED') NOT NULL DEFAULT 'FULL' COMMENT 'Status of inventory: PARTIAL (partial shipment), FULL (all shipped), RESERVED (held for shipment)',
  `fda_compliant` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Whether event meets FSMA 204 requirements',
  `fda_compliance_notes` text DEFAULT NULL COMMENT 'Notes on FDA compliance status',
  `signature_hash` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `signature_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `voided_by` bigint(20) UNSIGNED DEFAULT NULL,
  `voided_at` timestamp NULL DEFAULT NULL,
  `voids_event_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `digital_certificates`
--

CREATE TABLE `digital_certificates` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `organization_id` bigint(20) UNSIGNED NOT NULL,
  `certificate_id` varchar(255) NOT NULL,
  `certificate_pem` text NOT NULL,
  `certificate_chain` varchar(255) DEFAULT NULL,
  `root_ca_certificate` varchar(255) DEFAULT NULL,
  `intermediate_ca_certificate` varchar(255) DEFAULT NULL,
  `crl_url` varchar(255) DEFAULT NULL,
  `ocsp_url` varchar(255) DEFAULT NULL,
  `crl_last_checked` timestamp NULL DEFAULT NULL,
  `ocsp_last_checked` timestamp NULL DEFAULT NULL,
  `is_crl_valid` tinyint(1) NOT NULL DEFAULT 1,
  `is_ocsp_valid` tinyint(1) NOT NULL DEFAULT 1,
  `certificate_usage` varchar(255) NOT NULL DEFAULT 'signing',
  `signature_count` int(11) NOT NULL DEFAULT 0,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `public_key` text NOT NULL,
  `private_key_encrypted` text DEFAULT NULL COMMENT 'Encrypted private key',
  `issuer` varchar(255) NOT NULL COMMENT 'Certificate issuer',
  `subject` varchar(255) NOT NULL COMMENT 'Certificate subject',
  `serial_number` varchar(255) NOT NULL,
  `issued_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_revoked` tinyint(1) NOT NULL DEFAULT 0,
  `revoked_at` timestamp NULL DEFAULT NULL,
  `revocation_reason` text DEFAULT NULL,
  `signature_algorithm` varchar(255) NOT NULL DEFAULT 'sha256WithRSAEncryption',
  `key_size` int(11) NOT NULL DEFAULT 2048 COMMENT 'RSA key size in bits',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `documents`
--

CREATE TABLE `documents` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `organization_id` bigint(20) UNSIGNED DEFAULT NULL,
  `audit_log_id` bigint(20) UNSIGNED DEFAULT NULL,
  `doc_number` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `type` enum('traceability_plan','sop','fda_correspondence','training_material','audit_report','other') NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('draft','review','approved','archived') NOT NULL DEFAULT 'draft',
  `version` varchar(20) NOT NULL DEFAULT '1.0',
  `effective_date` date DEFAULT NULL,
  `review_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `approved_by` bigint(20) UNSIGNED DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `metadata_hash` varchar(64) DEFAULT NULL,
  `file_integrity_verified_at` timestamp NULL DEFAULT NULL,
  `uploaded_by` bigint(20) UNSIGNED DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_type` varchar(255) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `is_encrypted` tinyint(1) NOT NULL DEFAULT 0,
  `encrypted_at` timestamp NULL DEFAULT NULL,
  `file_hash` varchar(64) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `archived_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `document_approvals`
--

CREATE TABLE `document_approvals` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `document_id` bigint(20) UNSIGNED NOT NULL,
  `organization_id` bigint(20) UNSIGNED NOT NULL,
  `approval_level` int(11) NOT NULL DEFAULT 1,
  `approved_by` bigint(20) UNSIGNED DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `rejected_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `document_versions`
--

CREATE TABLE `document_versions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `organization_id` bigint(20) UNSIGNED NOT NULL,
  `audit_log_id` bigint(20) UNSIGNED DEFAULT NULL,
  `document_id` bigint(20) UNSIGNED NOT NULL,
  `version` varchar(20) NOT NULL,
  `change_type` enum('major','minor','patch') NOT NULL DEFAULT 'patch',
  `change_notes` text DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `is_encrypted` tinyint(1) NOT NULL DEFAULT 0,
  `file_hash` varchar(64) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `email_notifications`
--

CREATE TABLE `email_notifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `facility_id` bigint(20) UNSIGNED DEFAULT NULL,
  `type` varchar(255) NOT NULL,
  `recipient_email` varchar(255) NOT NULL,
  `subject` text NOT NULL,
  `body` text NOT NULL,
  `status` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
  `sent_at` datetime DEFAULT NULL,
  `retry_count` int(11) NOT NULL DEFAULT 0,
  `error_message` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `error_logs`
--

CREATE TABLE `error_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `error_type` varchar(255) NOT NULL,
  `error_message` text NOT NULL,
  `error_code` int(11) DEFAULT NULL,
  `file_path` varchar(255) NOT NULL,
  `line_number` int(11) NOT NULL,
  `stack_trace` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`stack_trace`)),
  `context` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`context`)),
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `organization_id` bigint(20) UNSIGNED DEFAULT NULL,
  `url` text DEFAULT NULL,
  `method` varchar(255) DEFAULT NULL,
  `ip_address` varchar(255) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `error_hash` varchar(255) NOT NULL,
  `is_resolved` tinyint(1) NOT NULL DEFAULT 0,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `resolved_by` bigint(20) UNSIGNED DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `severity` enum('info','warning','error','critical') NOT NULL DEFAULT 'error',
  `frequency` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `export_logs`
--

CREATE TABLE `export_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `export_id` varchar(50) NOT NULL,
  `file_type` enum('json','xml','csv') NOT NULL,
  `export_scope` enum('all','product','tlc') NOT NULL,
  `scope_value` varchar(255) DEFAULT NULL,
  `content_hash` longtext NOT NULL,
  `file_size` bigint(20) UNSIGNED NOT NULL,
  `record_count` int(10) UNSIGNED NOT NULL,
  `start_record_id` varchar(255) DEFAULT NULL,
  `end_record_id` varchar(255) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `verified_at` timestamp NULL DEFAULT NULL,
  `verification_notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `e_signatures`
--

CREATE TABLE `e_signatures` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `organization_id` bigint(20) UNSIGNED DEFAULT NULL,
  `delegated_by_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `delegation_authority` varchar(255) DEFAULT NULL,
  `delegation_valid_until` datetime DEFAULT NULL,
  `is_delegated_signature` tinyint(1) NOT NULL DEFAULT 0,
  `record_type` varchar(50) NOT NULL COMMENT 'products, cte_events, etc.',
  `record_id` bigint(20) UNSIGNED NOT NULL,
  `action` varchar(100) NOT NULL COMMENT 'create, update, delete, approve',
  `reason` text DEFAULT NULL,
  `meaning_of_signature` text DEFAULT NULL,
  `signature_hash` text NOT NULL,
  `signature_algorithm` varchar(50) NOT NULL DEFAULT 'SHA512',
  `signature_format` varchar(255) NOT NULL DEFAULT 'SHA512',
  `xades_metadata` text DEFAULT NULL,
  `certificate_subject` varchar(255) DEFAULT NULL,
  `certificate_issuer` varchar(255) DEFAULT NULL,
  `certificate_serial_number` varchar(255) DEFAULT NULL,
  `tsa_url` varchar(255) DEFAULT NULL,
  `tsa_certificate_subject` varchar(255) DEFAULT NULL,
  `ltv_timestamp_chain` text DEFAULT NULL,
  `ltv_certificate_chain` text DEFAULT NULL,
  `ltv_crl_response` text DEFAULT NULL,
  `ltv_ocsp_response` text DEFAULT NULL,
  `ltv_last_validation_at` timestamp NULL DEFAULT NULL,
  `ltv_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `batch_operation_id` varchar(255) DEFAULT NULL,
  `batch_operation_type` varchar(255) DEFAULT NULL,
  `batch_operation_sequence` int(11) DEFAULT NULL,
  `batch_total_count` int(11) DEFAULT NULL,
  `signature_attributes` text DEFAULT NULL,
  `signature_metadata` text DEFAULT NULL,
  `signature_status` varchar(255) NOT NULL DEFAULT 'valid',
  `record_content_hash` text DEFAULT NULL,
  `certificate_id` varchar(255) DEFAULT NULL,
  `timestamp_token` text DEFAULT NULL,
  `timestamp_token_der` text DEFAULT NULL COMMENT 'DER encoded timestamp token',
  `timestamp_utc_time` timestamp NULL DEFAULT NULL COMMENT 'UTC time from timestamp',
  `timestamp_tsa_url` varchar(255) DEFAULT NULL COMMENT 'TSA URL used',
  `timestamp_tsa_certificate` text DEFAULT NULL COMMENT 'TSA certificate subject',
  `certificate_revocation_checked` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Whether certificate revocation was checked',
  `certificate_revocation_checked_at` timestamp NULL DEFAULT NULL COMMENT 'When revocation was last checked',
  `certificate_revocation_status` varchar(255) DEFAULT NULL COMMENT 'good, revoked, unknown',
  `certificate_revocation_reason` text DEFAULT NULL COMMENT 'Reason if revoked',
  `verification_report` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Detailed verification report' CHECK (json_valid(`verification_report`)),
  `verification_passed` tinyint(1) DEFAULT NULL COMMENT 'Overall verification result',
  `last_verified_at` timestamp NULL DEFAULT NULL COMMENT 'Last verification timestamp',
  `timestamp_provider` varchar(255) DEFAULT NULL COMMENT 'freetsa, digicert, sectigo',
  `timestamp_verified_at` timestamp NULL DEFAULT NULL,
  `is_revoked` tinyint(1) NOT NULL DEFAULT 0,
  `revoked_at` timestamp NULL DEFAULT NULL,
  `revocation_reason` text DEFAULT NULL,
  `mfa_method` varchar(255) DEFAULT NULL COMMENT 'totp, sms, backup_code',
  `user_agent` varchar(255) DEFAULT NULL,
  `ip_address` text NOT NULL,
  `signed_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `signature_valid_from` timestamp NULL DEFAULT NULL COMMENT 'Signature validity start date',
  `signature_valid_until` timestamp NULL DEFAULT NULL COMMENT 'Signature validity end date',
  `signature_expires_at` datetime DEFAULT NULL,
  `is_expired` tinyint(1) NOT NULL DEFAULT 0,
  `expiration_checked_at` datetime DEFAULT NULL,
  `expiration_status` varchar(50) NOT NULL DEFAULT 'active',
  `encryption_algorithm` varchar(50) NOT NULL DEFAULT 'AES-256-CBC',
  `encrypted_fields` varchar(500) DEFAULT NULL,
  `signature_validity_period_days` int(11) NOT NULL DEFAULT 365 COMMENT 'Validity period in days',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `facilities`
--

CREATE TABLE `facilities` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `facility_name` varchar(255) NOT NULL,
  `fda_facility_id` varchar(255) DEFAULT NULL,
  `duns_number` varchar(255) DEFAULT NULL,
  `facility_type` varchar(255) NOT NULL,
  `street_address` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `state` varchar(255) NOT NULL,
  `zip_code` varchar(255) NOT NULL,
  `country` varchar(255) NOT NULL DEFAULT 'US',
  `registration_date` date DEFAULT NULL,
  `renewal_date` date DEFAULT NULL,
  `renewal_deadline` date DEFAULT NULL,
  `registration_status` enum('active','expired','pending_renewal','inactive') NOT NULL DEFAULT 'active',
  `last_audit_date` date DEFAULT NULL,
  `audit_status` varchar(255) DEFAULT NULL,
  `days_to_renewal` int(11) DEFAULT NULL,
  `risk_level` enum('low','medium','high') NOT NULL DEFAULT 'low',
  `risk_notes` text DEFAULT NULL,
  `fda_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`fda_data`)),
  `last_fda_sync` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `fda_accounts`
--

CREATE TABLE `fda_accounts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `organization_id` bigint(20) UNSIGNED NOT NULL,
  `business_name` varchar(255) NOT NULL,
  `fda_registration_number` varchar(100) DEFAULT NULL,
  `fein` varchar(50) DEFAULT NULL,
  `dba_name` varchar(255) DEFAULT NULL,
  `business_type` enum('manufacturer','distributor','retailer','broker','other') NOT NULL DEFAULT 'manufacturer',
  `business_description` text DEFAULT NULL,
  `primary_contact_name` varchar(255) NOT NULL,
  `primary_contact_email` varchar(255) NOT NULL,
  `primary_contact_phone` varchar(20) NOT NULL,
  `secondary_contact_email` varchar(255) DEFAULT NULL,
  `facility_address` varchar(255) NOT NULL,
  `facility_city` varchar(100) NOT NULL,
  `facility_state` varchar(100) NOT NULL,
  `facility_zip` varchar(20) NOT NULL,
  `facility_country` varchar(100) NOT NULL DEFAULT 'USA',
  `product_codes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`product_codes`)),
  `product_description` text DEFAULT NULL,
  `registration_status` enum('pending','active','suspended','expired','revoked') NOT NULL DEFAULT 'pending',
  `registration_date` timestamp NULL DEFAULT NULL,
  `expiry_date` timestamp NULL DEFAULT NULL,
  `last_renewal_date` timestamp NULL DEFAULT NULL,
  `is_compliant` tinyint(1) NOT NULL DEFAULT 0,
  `ai_analysis` text DEFAULT NULL,
  `compliance_alerts` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`compliance_alerts`)),
  `last_ai_analysis` timestamp NULL DEFAULT NULL,
  `last_fda_sync` timestamp NULL DEFAULT NULL,
  `fda_verification_status` varchar(255) NOT NULL DEFAULT 'pending',
  `fda_sync_data` longtext DEFAULT NULL,
  `fda_enforcement_history` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`fda_enforcement_history`)),
  `fda_recall_history` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`fda_recall_history`)),
  `auto_sync_open_fda` tinyint(1) NOT NULL DEFAULT 0,
  `next_fda_sync` timestamp NULL DEFAULT NULL,
  `send_notifications` tinyint(1) NOT NULL DEFAULT 1,
  `notification_frequency` enum('real-time','daily','weekly','monthly') NOT NULL DEFAULT 'weekly',
  `send_ai_alerts` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `fda_account_alerts`
--

CREATE TABLE `fda_account_alerts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `fda_account_id` bigint(20) UNSIGNED NOT NULL,
  `alert_type` enum('expiry_warning','compliance_issue','missing_info','ai_recommended_action','renewal_due','suspension_risk') NOT NULL DEFAULT 'ai_recommended_action',
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `recommended_action` text DEFAULT NULL,
  `severity` varchar(50) NOT NULL DEFAULT 'medium',
  `is_resolved` tinyint(1) NOT NULL DEFAULT 0,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `resolution_notes` text DEFAULT NULL,
  `notification_sent_at` timestamp NULL DEFAULT NULL,
  `notification_recipients` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`notification_recipients`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `fda_alerts`
--

CREATE TABLE `fda_alerts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `facility_id` bigint(20) UNSIGNED DEFAULT NULL,
  `alert_type` enum('renewal','audit','enforcement','import_alert','recall','warning_letter','custom') NOT NULL,
  `severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `due_date` date DEFAULT NULL,
  `status` enum('open','acknowledged','resolved','closed') NOT NULL DEFAULT 'open',
  `fda_reference_number` varchar(255) DEFAULT NULL,
  `fda_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`fda_data`)),
  `assigned_to` bigint(20) UNSIGNED DEFAULT NULL,
  `acknowledged_at` timestamp NULL DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `resolution_notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `fda_audit_logs`
--

CREATE TABLE `fda_audit_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `facility_id` bigint(20) UNSIGNED NOT NULL,
  `audit_date` date NOT NULL,
  `audit_type` enum('routine','for_cause','surveillance','compliance_follow_up') NOT NULL,
  `result` enum('no_action','voluntary_action','official_action','pending') DEFAULT NULL,
  `findings` text DEFAULT NULL,
  `observations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`observations`)),
  `fda_district` varchar(255) DEFAULT NULL,
  `investigator_name` varchar(255) DEFAULT NULL,
  `next_audit_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `fda_facilities`
--

CREATE TABLE `fda_facilities` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `fei_number` varchar(255) NOT NULL,
  `facility_name` varchar(255) NOT NULL,
  `legal_name` varchar(255) DEFAULT NULL,
  `address` text NOT NULL,
  `city` varchar(255) NOT NULL,
  `state_province` varchar(50) NOT NULL,
  `postal_code` varchar(20) NOT NULL,
  `country` varchar(100) NOT NULL,
  `facility_type` varchar(255) DEFAULT NULL,
  `product_codes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`product_codes`)),
  `status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
  `registration_date` date DEFAULT NULL,
  `expiration_date` date DEFAULT NULL,
  `next_renewal_date` date DEFAULT NULL,
  `owner_operator` varchar(255) DEFAULT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(255) DEFAULT NULL,
  `fda_raw_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`fda_raw_data`)),
  `last_synced_at` timestamp NULL DEFAULT NULL,
  `organization_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `fda_registrations`
--

CREATE TABLE `fda_registrations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `facility_id` bigint(20) UNSIGNED NOT NULL,
  `registration_number` varchar(255) NOT NULL,
  `registration_type` enum('initial','renewal','update') NOT NULL DEFAULT 'initial',
  `registration_date` date NOT NULL,
  `expiration_date` date NOT NULL,
  `status` enum('active','expired','pending','cancelled') NOT NULL DEFAULT 'active',
  `notes` text DEFAULT NULL,
  `submission_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`submission_data`)),
  `submitted_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `fda_registration_audits`
--

CREATE TABLE `fda_registration_audits` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `facility_id` bigint(20) UNSIGNED NOT NULL,
  `inspection_id` varchar(255) DEFAULT NULL,
  `inspection_date` date DEFAULT NULL,
  `inspection_type` enum('routine','for_cause','compliance_check','other') NOT NULL DEFAULT 'routine',
  `observations` text DEFAULT NULL,
  `observations_count` int(11) NOT NULL DEFAULT 0,
  `cae_status` enum('open','submitted','approved','closed') NOT NULL DEFAULT 'open',
  `cae_due_date` date DEFAULT NULL,
  `corrective_actions` text DEFAULT NULL,
  `fda_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`fda_data`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `fda_sync_logs`
--

CREATE TABLE `fda_sync_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `facility_id` bigint(20) UNSIGNED DEFAULT NULL,
  `sync_type` enum('registration','audit','risk_assessment','manual') NOT NULL DEFAULT 'manual',
  `status` enum('pending','processing','success','failed') NOT NULL DEFAULT 'pending',
  `request_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`request_data`)),
  `response_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`response_data`)),
  `error_message` text DEFAULT NULL,
  `sync_started_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `sync_completed_at` timestamp NULL DEFAULT NULL,
  `processing_time_ms` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `fda_user_registrations`
--

CREATE TABLE `fda_user_registrations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `fda_account_id` bigint(20) UNSIGNED DEFAULT NULL,
  `business_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `registration_status` enum('submitted','verified','approved','rejected','auto_synced') NOT NULL DEFAULT 'submitted',
  `additional_info` text DEFAULT NULL,
  `auto_submitted_to_fda` tinyint(1) NOT NULL DEFAULT 0,
  `auto_submitted_at` timestamp NULL DEFAULT NULL,
  `fda_submission_reference` varchar(255) DEFAULT NULL,
  `ai_generated_summary` text DEFAULT NULL,
  `ai_verification_results` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`ai_verification_results`)),
  `processed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `fsvp_hazard_analyses`
--

CREATE TABLE `fsvp_hazard_analyses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `hazard_type` enum('biological','chemical','physical','radiological') NOT NULL,
  `hazard_name` varchar(255) NOT NULL,
  `hazard_description` text NOT NULL,
  `severity` enum('low','medium','high','critical') NOT NULL,
  `likelihood` enum('rare','unlikely','possible','likely','certain') NOT NULL,
  `control_measures` text DEFAULT NULL,
  `requires_verification` tinyint(1) NOT NULL DEFAULT 1,
  `analyzed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `analysis_date` date NOT NULL,
  `review_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `fsvp_products`
--

CREATE TABLE `fsvp_products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `supplier_id` bigint(20) UNSIGNED NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_code` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `ingredients` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`ingredients`)),
  `status` enum('approved','pending','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `fsvp_suppliers`
--

CREATE TABLE `fsvp_suppliers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `supplier_name` varchar(255) NOT NULL,
  `supplier_code` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `city` varchar(255) NOT NULL,
  `state_province` varchar(50) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `country` varchar(100) NOT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive','suspended','under_review') NOT NULL DEFAULT 'active',
  `risk_level` enum('low','medium','high') NOT NULL DEFAULT 'medium',
  `approval_date` date DEFAULT NULL,
  `last_audit_date` date DEFAULT NULL,
  `next_audit_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `certifications` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`certifications`)),
  `organization_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `fsvp_verification_activities`
--

CREATE TABLE `fsvp_verification_activities` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `supplier_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED DEFAULT NULL,
  `activity_type` enum('onsite_audit','sampling_testing','record_review','supplier_certification') NOT NULL,
  `activity_date` date NOT NULL,
  `result` enum('pass','fail','conditional_pass','pending') NOT NULL DEFAULT 'pending',
  `findings` text DEFAULT NULL,
  `corrective_actions` text DEFAULT NULL,
  `next_verification_date` date DEFAULT NULL,
  `conducted_by` bigint(20) UNSIGNED DEFAULT NULL,
  `documents` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`documents`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `leads`
--

CREATE TABLE `leads` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `organization_id` bigint(20) UNSIGNED DEFAULT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `company_name` varchar(150) DEFAULT NULL,
  `industry` varchar(100) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `status` enum('new','contacted','qualified','converted','rejected') NOT NULL DEFAULT 'new',
  `source` varchar(50) NOT NULL DEFAULT 'landing_page',
  `utm_source` varchar(100) DEFAULT NULL,
  `utm_medium` varchar(100) DEFAULT NULL,
  `utm_campaign` varchar(100) DEFAULT NULL,
  `utm_content` varchar(100) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `contacted_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `locations`
--

CREATE TABLE `locations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `location_name` varchar(255) NOT NULL,
  `location_type` enum('warehouse','farm','processing','distribution') DEFAULT NULL,
  `gln` varchar(13) DEFAULT NULL,
  `ffrn` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `zip_code` varchar(20) DEFAULT NULL,
  `country` varchar(100) NOT NULL DEFAULT 'VN',
  `organization_id` bigint(20) UNSIGNED DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `locations`
--

INSERT INTO `locations` (`id`, `location_name`, `location_type`, `gln`, `ffrn`, `address`, `city`, `state`, `zip_code`, `country`, `organization_id`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Main Warehouse', 'warehouse', '0614141000001', NULL, '123 Industrial Blvd', 'Los Angeles', 'CA', '90001', 'USA', 2, 'active', '2025-11-04 09:28:33', '2025-11-04 09:28:33'),
(2, 'Processing Facility', 'processing', '0614141000002', NULL, '456 Factory Road', 'Fresno', 'CA', '93650', 'USA', 2, 'active', '2025-11-04 09:28:33', '2025-11-04 09:28:33'),
(3, 'Green Valley Farm', 'farm', '3012345678', NULL, '789 Farm Lane', 'Salinas', 'CA', '93901', 'USA', 2, 'active', '2025-11-04 09:28:33', '2025-11-04 09:28:33');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2024_01_01_000000_add_notification_preferences_table', 1),
(2, '2024_01_01_000000_create_organizations_table', 1),
(3, '2024_01_01_000001_create_users_table', 1),
(4, '2024_01_01_000002_create_products_table', 1),
(5, '2024_01_01_000002_create_sessions_table', 1),
(6, '2024_01_01_000003_create_locations_table', 1),
(7, '2024_01_01_000004_create_partners_table', 1),
(8, '2024_01_01_000005_create_trace_records_table', 1),
(9, '2024_01_01_000006_create_trace_relationships_table', 1),
(10, '2024_01_01_000007_create_cte_events_table', 1),
(11, '2024_01_01_000008_add_cte_event_foreign_to_trace_relationships', 1),
(12, '2024_01_01_000008_add_email_token_to_users_table', 1),
(13, '2024_01_01_000008_create_audit_logs_table', 1),
(14, '2024_01_01_000009_create_e_signatures_table', 1),
(15, '2024_01_01_000010_create_cache_table', 1),
(16, '2024_01_01_000010_create_documents_table', 1),
(17, '2024_01_01_000011_create_document_versions_table', 1),
(18, '2024_01_01_000013_add_package_columns_to_users_table', 1),
(19, '2024_01_01_000014_create_notifications_table', 1),
(20, '2024_01_01_000015_add_organization_id_to_notifications', 1),
(21, '2024_01_01_000015_update_package_limits', 1),
(22, '2024_01_01_000016_sync_package_naming', 1),
(23, '2024_01_01_000017_create_pricing_table', 1),
(24, '2024_01_01_000019_add_organization_id_to_users_table', 1),
(25, '2024_01_01_000020_add_organization_id_to_documents_table', 1),
(26, '2024_01_01_000020_create_error_logs_table', 1),
(27, '2024_01_01_000021_add_preferred_language_to_users', 1),
(28, '2024_01_01_000022_add_2fa_and_certificates_to_users', 1),
(29, '2024_01_01_000023_enhance_e_signatures_table', 1),
(30, '2024_01_01_000024_create_digital_certificates_table', 1),
(31, '2024_01_01_000025_create_two_fa_logs_table', 1),
(32, '2024_01_01_000026_add_timestamp_fields_to_e_signatures', 1),
(33, '2024_01_02_000000_update_notifications_table_add_soft_deletes', 1),
(34, '2024_01_03_000000_create_notification_templates_table', 1),
(35, '2024_01_04_000000_create_notification_audit_logs_table', 1),
(36, '2024_01_15_000001_add_archived_at_to_notifications', 1),
(37, '2024_01_15_000001_add_missing_kdes_to_cte_events', 1),
(38, '2024_01_15_000001_create_leads_table', 1),
(39, '2024_01_15_000002_create_retention_policies_table', 1),
(40, '2024_01_15_000003_create_archival_logs_table', 1),
(41, '2024_01_15_000003_enhance_digital_certificates_table', 1),
(42, '2024_01_15_000004_create_archival_tables', 1),
(43, '2024_01_15_000004_create_signature_record_types_table', 1),
(44, '2024_01_15_000005_create_signature_revocations_table', 1),
(45, '2024_01_15_000009_add_organization_id_to_signature_tables', 1),
(46, '2024_01_20_000000_create_traceability_analytics_table', 1),
(47, '2024_01_20_000001_create_packages_table', 1),
(48, '2024_01_20_000002_seed_packages_table', 1),
(49, '2024_11_01_create_user_feature_overrides_table', 1),
(50, '2024_11_04_000001_create_facilities_table', 1),
(51, '2024_11_04_000002_create_registrations_table', 1),
(52, '2024_11_04_000003_create_alerts_table', 1),
(53, '2024_11_04_000004_create_audit_logs_table', 1),
(54, '2024_11_04_000005_create_fda_sync_logs_table', 1),
(55, '2024_11_04_100001_create_fda_facilities_table', 1),
(56, '2024_11_04_100002_create_fda_registrations_table', 1),
(57, '2024_11_04_100003_create_fda_alerts_table', 1),
(58, '2024_11_04_100004_create_fda_audit_logs_table', 1),
(59, '2024_11_04_110001_create_fsvp_suppliers_table', 1),
(60, '2024_11_04_110002_create_fsvp_products_table', 1),
(61, '2024_11_04_110003_create_fsvp_hazard_analyses_table', 1),
(62, '2024_11_04_110004_create_fsvp_verification_activities_table', 1),
(63, '2024_11_04_120001_create_prior_notices_table', 1),
(64, '2024_11_04_120002_create_prior_notice_items_table', 1),
(65, '2024_11_04_120003_create_pa_shipments_table', 1),
(66, '2024_11_04_130001_create_email_notifications_table', 1),
(67, '2024_12_01_000000_create_user_feature_overrides_table', 1),
(68, '2024_12_01_000001_add_shipping_fields_to_cte_events', 1),
(69, '2024_12_01_000001_create_batch_signature_operations_table', 1),
(70, '2024_12_01_000002_create_signature_templates_table', 1),
(71, '2024_12_03_000000_create_fda_accounts_table', 1),
(72, '2024_12_03_000001_create_fda_account_alerts_table', 1),
(73, '2024_12_03_000002_create_fda_user_registrations_table', 1),
(74, '2024_12_03_000003_add_fda_sync_columns_to_fda_accounts', 1),
(75, '2025_01_01_000000_create_webhook_logs_table', 1),
(76, '2025_01_01_000001_add_package_id_to_organizations', 1),
(77, '2025_01_01_000002_create_organization_quotas_table', 1),
(78, '2025_01_01_000003_migrate_user_packages_to_organizations', 1),
(79, '2025_01_01_000004_remove_package_fields_from_users', 1),
(80, '2025_01_01_000006_assign_default_packages_to_organizations', 1),
(81, '2025_01_01_000007_ensure_admin_users_have_admin_role', 1),
(82, '2025_01_18_add_organization_id_to_packages', 1),
(83, '2025_01_21_000001_add_quantity_tracking_to_trace_records', 1),
(84, '2025_01_21_000001_create_archival_logs_table', 1),
(85, '2025_01_21_000002_create_transformation_items_table', 1),
(86, '2025_01_22_000001_optimize_audit_logs_for_performance', 1),
(87, '2025_01_22_000004_add_organization_id_to_retention_policies', 1),
(88, '2025_01_24_000001_add_organization_foreign_key_to_cte_events', 1),
(89, '2025_01_24_000002_add_organization_id_to_audit_logs', 1),
(90, '2025_01_24_000003_add_organization_id_to_retention_logs', 1),
(91, '2025_01_24_000005_fix_cte_events_organization_id_constraint', 1),
(92, '2025_01_24_000007_ensure_organizations_exist', 1),
(93, '2025_01_24_000008_populate_cte_events_organization_id', 1),
(94, '2025_01_24_000009_fix_organization_id_default_value', 1),
(95, '2025_01_27_000001_add_is_system_admin_to_users', 1),
(96, '2025_01_28_000001_add_missing_columns_to_documents_table', 1),
(97, '2025_01_28_000001_fix_documents_table_columns', 1),
(98, '2025_01_29_000001_create_document_archival_tables', 1),
(99, '2025_10_15_032225_add_status_to_products_table', 1),
(100, '2025_10_17_185643_add_status_to_locations_table', 1),
(101, '2025_10_20_000002_add_payment_order_fields', 1),
(102, '2025_10_20_000003_add_payment_fields_to_users_table', 1),
(103, '2025_10_20_012444_add_integrity_hash_to_audit_logs_table', 1),
(104, '2025_10_20_012952_increase_signature_hash_length_in_e_signatures_table', 1),
(105, '2025_10_20_075443_alter_ip_address_in_e_signatures_table', 1),
(106, '2025_10_20_075800_alter_audit_logs_user_id_nullable', 1),
(107, '2025_10_20_081930_drop_audit_logs_user_id_foreign', 1),
(108, '2025_10_20_083144_fix_audit_logs_user_foreign_key', 1),
(109, '2025_10_20_090000_comprehensive_fix_audit_logs_schema', 1),
(110, '2025_10_20_120000_add_signature_validity_period_to_e_signatures', 1),
(111, '2025_10_20_130000_add_xades_and_ltv_fields_to_e_signatures', 1),
(112, '2025_10_20_131000_create_batch_signature_operations_table', 1),
(113, '2025_10_20_140000_add_delegation_and_expiration_to_e_signatures', 1),
(114, '2025_10_20_141000_create_signature_verifications_table', 1),
(115, '2025_10_20_142000_create_signature_delegations_table', 1),
(116, '2025_10_20_150000_create_signature_performance_metrics_table', 1),
(117, '2025_10_20_182645_normalize_audit_logs_user_foreign_key', 1),
(118, '2025_10_21_000001_set_trial_for_existing_free_users', 1),
(119, '2025_10_21_000002_add_trial_expiry_email_check', 1),
(120, '2025_10_21_180000_update_trace_relationships_enum', 1),
(121, '2025_10_21_190000_add_void_mechanism_to_cte_events', 1),
(122, '2025_10_21_192000_add_void_to_trace_relationships_enum', 1),
(123, '2025_10_21_193000_add_void_tracking_to_cte_events', 1),
(124, '2025_10_21_201000_add_voided_status_to_trace_records', 1),
(125, '2025_10_21_add_quantity_tracking_columns', 1),
(126, '2025_10_22_000001_add_missing_fsma_kdes_to_cte_events', 1),
(127, '2025_10_22_000002_standardize_trace_relationships_types', 1),
(128, '2025_10_22_add_signature_id_to_cte_events', 1),
(129, '2025_10_22_create_export_logs_table', 1),
(130, '2025_10_24_000001_add_package_audit_fields', 1),
(131, '2025_10_24_000002_add_trial_and_features_to_users', 1),
(132, '2025_10_24_000003_add_features_to_packages', 1),
(133, '2025_10_24_000004_update_packages_with_correct_features', 1),
(134, '2025_10_24_000005_update_notifications_table_for_laravel', 1),
(135, '2025_10_24_162500_increase_notification_type_column_length', 1),
(136, '2025_10_25_000000_add_organization_id_to_trace_relationships', 1),
(137, '2025_10_25_000001_add_foreign_key_constraints', 1),
(138, '2025_10_25_000001_add_quota_limits_to_packages', 1),
(139, '2025_10_25_000001_fix_products_organization_id_constraint', 1),
(140, '2025_10_25_000001_fix_products_organization_id_default', 1),
(141, '2025_10_25_000002_fix_products_organization_id_strict_mode', 1),
(142, '2025_10_25_000002_update_trial_period_to_30_days', 1),
(143, '2025_10_25_000003_add_organization_id_to_e_signatures', 1),
(144, '2025_10_25_000003_ensure_default_organization_exists', 1),
(145, '2025_10_25_000003_initialize_quotas_for_existing_organizations', 1),
(146, '2025_10_25_000004_remove_organization_id_from_system_tables', 1),
(147, '2025_10_26_003118_add_soft_deletes_to_organizations_table', 1),
(148, '2025_10_26_100001_add_organization_id_to_packages_table', 1),
(149, '2025_10_26_100002_add_organization_id_to_digital_certificates_table', 1),
(150, '2025_10_26_100003_add_organization_id_to_audit_logs_details_table', 1),
(151, '2025_10_26_100004_add_organization_id_to_archival_logs_table', 1),
(152, '2025_10_27_000001_add_last_activity_at_to_users_table', 1),
(153, '2025_10_28_000001_add_missing_columns_to_packages_table', 1),
(154, '2025_10_28_000001_protect_documents_retention', 1),
(155, '2025_10_28_000002_add_organization_id_to_document_versions', 1),
(156, '2025_10_28_000002_protect_document_versions_retention', 1),
(157, '2025_10_28_000003_add_integrity_hash_to_documents', 1),
(158, '2025_10_28_000003_add_organization_id_to_document_versions', 1),
(159, '2025_10_28_000004_add_documents_to_retention_policy', 1),
(160, '2025_10_28_000004_add_integrity_hash_to_documents', 1),
(161, '2025_10_28_000004_prevent_cascade_delete_document_versions', 1),
(162, '2025_10_28_000005_add_audit_logging_to_documents', 1),
(163, '2025_10_28_000005_add_soft_delete_to_document_versions', 1),
(164, '2025_10_28_000006_add_audit_log_tracking_to_documents', 1),
(165, '2025_10_28_000007_add_file_integrity_columns', 1),
(166, '2025_10_28_000008_create_document_approvals_table', 1),
(167, '2025_10_28_000009_add_encryption_columns_to_documents', 1),
(168, '2025_10_28_000010_encrypt_existing_documents', 1),
(169, '2025_10_28_000011_add_semantic_versioning_to_document_versions', 1),
(170, '2025_10_28_000012_add_fulltext_index_to_documents', 1),
(171, '2025_10_28_add_file_hash_to_documents', 1),
(172, '2025_10_28_add_soft_delete_document_versions', 1),
(173, '2025_10_28_protect_documents_retention', 1),
(174, '2025_10_29_000001_optimize_retention_queries', 1),
(175, '2025_10_29_205811_add_organization_id_to_error_logs_table', 1),
(176, '2025_10_31_000001_fix_sku_uniqueness_per_organization', 1),
(177, '2025_11_02_000001_add_event_category_to_audit_logs', 1),
(178, '2025_11_02_000002_create_missing_retention_policies', 1),
(179, '2025_11_02_add_auditable_columns_to_audit_logs', 1),
(180, '2025_11_02_optimize_notifications_indexes', 1),
(181, '2025_11_04_145730_create_personal_access_tokens_table', 1),
(182, '2025_12_28_000003_add_payment_order_fields', 1),
(183, '2025_12_31_999999_add_webhook_log_fields', 1),
(184, '2026_01_01_999912_create_audit_triggers', 1),
(185, '2026_11_01_000000_create_compliance_reports_table', 1),
(186, '2025_11_04_171516_make_username_nullable_in_users_table', 2);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `organization_id` bigint(20) UNSIGNED DEFAULT NULL,
  `type` varchar(500) NOT NULL,
  `notification_type` enum('general','quota_warning','quota_reached','upgrade_success','feature_locked','package_changed') NOT NULL DEFAULT 'general',
  `title` varchar(255) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `cta_text` varchar(255) DEFAULT NULL,
  `cta_url` varchar(255) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `is_blocking` tinyint(1) NOT NULL DEFAULT 0,
  `priority` int(11) NOT NULL DEFAULT 0,
  `expires_at` timestamp NULL DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `notification_group` varchar(255) DEFAULT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `archived_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `notification_audit_logs`
--

CREATE TABLE `notification_audit_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `notification_id` bigint(20) UNSIGNED DEFAULT NULL,
  `organization_id` bigint(20) UNSIGNED NOT NULL,
  `action` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'success',
  `details` text DEFAULT NULL,
  `ip_address` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `notification_preferences`
--

CREATE TABLE `notification_preferences` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `notification_type` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `is_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `notification_templates`
--

CREATE TABLE `notification_templates` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `organization_id` bigint(20) UNSIGNED DEFAULT NULL,
  `type` varchar(255) NOT NULL,
  `language` varchar(255) NOT NULL DEFAULT 'en',
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `cta_text` varchar(255) DEFAULT NULL,
  `cta_url` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `organizations`
--

CREATE TABLE `organizations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `package_id` varchar(50) NOT NULL DEFAULT 'basic' COMMENT 'Gói dịch vụ: basic, premium, enterprise',
  `max_users` int(11) NOT NULL DEFAULT 1 COMMENT 'Số lượng user tối đa',
  `max_cte_records_monthly` int(11) NOT NULL DEFAULT 500 COMMENT 'Số lượng CTE tối đa mỗi tháng',
  `max_documents` int(11) NOT NULL DEFAULT 10 COMMENT 'Số lượng tài liệu lưu trữ tối đa',
  `subscription_start_date` timestamp NULL DEFAULT NULL,
  `subscription_end_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `organizations`
--

INSERT INTO `organizations` (`id`, `name`, `description`, `is_active`, `package_id`, `max_users`, `max_cte_records_monthly`, `max_documents`, `subscription_start_date`, `subscription_end_date`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Default Organization', 'System default organization for administration and super users.', 1, 'basic', 1, 500, 10, NULL, NULL, '2025-11-04 09:28:33', '2025-11-04 09:28:33', NULL),
(2, 'VEXIM Global (Demo)', 'Tổ chức mẫu cho mục đích demo FSMA 204. VEXIM Global', 1, 'basic', 1, 500, 10, NULL, NULL, '2025-11-04 09:28:33', '2025-11-04 09:28:33', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `organization_quotas`
--

CREATE TABLE `organization_quotas` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `organization_id` bigint(20) UNSIGNED NOT NULL,
  `feature_name` varchar(255) NOT NULL,
  `used_count` int(11) NOT NULL DEFAULT 0,
  `limit_count` int(11) DEFAULT NULL,
  `reset_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `organization_quotas`
--

INSERT INTO `organization_quotas` (`id`, `organization_id`, `feature_name`, `used_count`, `limit_count`, `reset_at`, `created_at`, `updated_at`) VALUES
(1, 1, 'cte_records_monthly', 0, 500, '2025-12-04 09:28:29', '2025-11-04 09:28:29', '2025-11-04 09:28:29'),
(2, 1, 'documents', 0, 10, NULL, '2025-11-04 09:28:29', '2025-11-04 09:28:29'),
(3, 1, 'users', 0, 1, NULL, '2025-11-04 09:28:29', '2025-11-04 09:28:29'),
(4, 1, 'e_signatures', 0, 0, NULL, '2025-11-04 09:28:29', '2025-11-04 09:28:29'),
(5, 1, 'certificates', 0, 0, NULL, '2025-11-04 09:28:29', '2025-11-04 09:28:29'),
(6, 1, 'data_retention', 0, 0, NULL, '2025-11-04 09:28:29', '2025-11-04 09:28:29'),
(7, 1, 'archival', 0, 0, NULL, '2025-11-04 09:28:29', '2025-11-04 09:28:29'),
(8, 1, 'compliance_report', 0, NULL, NULL, '2025-11-04 09:28:29', '2025-11-04 09:28:29');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `packages`
--

CREATE TABLE `packages` (
  `id` varchar(255) NOT NULL,
  `organization_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `max_cte_records_monthly` int(11) NOT NULL DEFAULT 0,
  `max_documents` int(11) NOT NULL DEFAULT 0,
  `max_users` int(11) NOT NULL DEFAULT 1,
  `monthly_list_price` decimal(10,2) DEFAULT NULL,
  `monthly_selling_price` decimal(10,2) DEFAULT NULL,
  `yearly_list_price` decimal(10,2) DEFAULT NULL,
  `yearly_selling_price` decimal(10,2) DEFAULT NULL,
  `currency` varchar(255) NOT NULL DEFAULT 'USD',
  `show_promotion` tinyint(1) NOT NULL DEFAULT 0,
  `promotion_text` varchar(255) DEFAULT NULL,
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`features`)),
  `is_popular` tinyint(1) NOT NULL DEFAULT 0,
  `is_highlighted` tinyint(1) NOT NULL DEFAULT 0,
  `has_traceability` tinyint(1) NOT NULL DEFAULT 1,
  `has_document_management` tinyint(1) NOT NULL DEFAULT 1,
  `has_e_signatures` tinyint(1) NOT NULL DEFAULT 0,
  `max_e_signatures_monthly` int(11) NOT NULL DEFAULT 0 COMMENT '0 = unlimited, null = feature disabled',
  `has_certificates` tinyint(1) NOT NULL DEFAULT 0,
  `max_certificates_monthly` int(11) NOT NULL DEFAULT 0 COMMENT '0 = unlimited, null = feature disabled',
  `has_data_retention` tinyint(1) NOT NULL DEFAULT 0,
  `max_data_retention_days` int(11) NOT NULL DEFAULT 0 COMMENT '0 = unlimited, null = feature disabled',
  `has_archival` tinyint(1) NOT NULL DEFAULT 0,
  `max_archival_storage_gb` int(11) NOT NULL DEFAULT 0 COMMENT '0 = unlimited, null = feature disabled',
  `has_compliance_report` tinyint(1) NOT NULL DEFAULT 0,
  `max_compliance_reports_monthly` int(11) NOT NULL DEFAULT 0 COMMENT '0 = unlimited, null = feature disabled',
  `support_level` varchar(255) NOT NULL DEFAULT 'email',
  `is_visible` tinyint(1) NOT NULL DEFAULT 1,
  `is_selectable` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `packages`
--

INSERT INTO `packages` (`id`, `organization_id`, `name`, `slug`, `description`, `max_cte_records_monthly`, `max_documents`, `max_users`, `monthly_list_price`, `monthly_selling_price`, `yearly_list_price`, `yearly_selling_price`, `currency`, `show_promotion`, `promotion_text`, `features`, `is_popular`, `is_highlighted`, `has_traceability`, `has_document_management`, `has_e_signatures`, `max_e_signatures_monthly`, `has_certificates`, `max_certificates_monthly`, `has_data_retention`, `max_data_retention_days`, `has_archival`, `max_archival_storage_gb`, `has_compliance_report`, `max_compliance_reports_monthly`, `support_level`, `is_visible`, `is_selectable`, `sort_order`, `created_at`, `updated_at`) VALUES
('basic', NULL, 'Basic', 'basic', 'Tính năng cơ bản cho tuân thủ', 500, 10, 1, 59.00, 49.00, 588.00, 470.00, 'USD', 1, 'Save 20% on annual billing', '[\"500 CTE records\\/th\\u00e1ng\",\"10 t\\u00e0i li\\u1ec7u\",\"1 ng\\u01b0\\u1eddi d\\u00f9ng\",\"Truy xu\\u1ea5t ngu\\u1ed3n g\\u1ed1c (Traceability)\",\"Qu\\u1ea3n l\\u00fd T\\u00e0i li\\u1ec7u c\\u01a1 b\\u1ea3n\",\"B\\u00e1o c\\u00e1o Tu\\u00e2n th\\u1ee7 (Compliance Report)\",\"H\\u1ed7 tr\\u1ee3 Email\"]', 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 'email', 1, 1, 2, '2025-11-04 09:28:17', '2025-11-04 09:28:17'),
('enterprise', NULL, 'Enterprise', 'enterprise', 'Tất cả tính năng cho t��� chức lớn', 5000, 999999, 5, NULL, 499.00, NULL, 4990.00, 'USD', 0, 'Custom pricing available', '[\"5,000+ CTE records\\/th\\u00e1ng\",\"T\\u00e0i li\\u1ec7u kh\\u00f4ng gi\\u1edbi h\\u1ea1n\",\"5+ ng\\u01b0\\u1eddi d\\u00f9ng\",\"Truy xu\\u1ea5t ngu\\u1ed3n g\\u1ed1c (Traceability)\",\"Qu\\u1ea3n l\\u00fd T\\u00e0i li\\u1ec7u\",\"Ch\\u1eef k\\u00fd \\u0111i\\u1ec7n t\\u1eed (E-Signatures)\",\"Qu\\u1ea3n l\\u00fd Ch\\u1ee9ng ch\\u1ec9 (Certificates)\",\"L\\u01b0u tr\\u1eef D\\u1eef li\\u1ec7u (Data Retention)\",\"L\\u01b0u tr\\u1eef cho Admin (Archival)\",\"B\\u00e1o c\\u00e1o Tu\\u00e2n th\\u1ee7 (Compliance Report)\",\"Qu\\u1ea3n l\\u00fd t\\u00e0i kho\\u1ea3n ri\\u00eang\",\"H\\u1ed7 tr\\u1ee3 \\u01b0u ti\\u00ean 24\\/7\"]', 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 'dedicated', 1, 0, 4, '2025-11-04 09:28:17', '2025-11-04 09:28:17'),
('free', NULL, 'Free Tier', 'free', 'Dùng thử tất cả tính năng trong 15 ngày', 50, 1, 1, NULL, 0.00, NULL, 0.00, 'USD', 0, NULL, '[\"D\\u00f9ng th\\u1eed 15 ng\\u00e0y t\\u1ea5t c\\u1ea3 t\\u00ednh n\\u0103ng\",\"Truy xu\\u1ea5t ngu\\u1ed3n g\\u1ed1c (Traceability)\",\"Qu\\u1ea3n l\\u00fd T\\u00e0i li\\u1ec7u\",\"Ch\\u1eef k\\u00fd \\u0111i\\u1ec7n t\\u1eed (E-Signatures)\",\"Qu\\u1ea3n l\\u00fd Ch\\u1ee9ng ch\\u1ec9 (Certificates)\",\"L\\u01b0u tr\\u1eef D\\u1eef li\\u1ec7u (Data Retention)\",\"L\\u01b0u tr\\u1eef cho Admin (Archival)\",\"B\\u00e1o c\\u00e1o Tu\\u00e2n th\\u1ee7 (Compliance Report)\",\"H\\u1ed7 tr\\u1ee3 Email\"]', 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 'email', 1, 0, 1, '2025-11-04 09:28:17', '2025-11-04 09:28:17'),
('premium', NULL, 'Premium', 'premium', 'Tính năng nâng cao cho doanh nghiệp', 2500, 999999, 3, 249.00, 199.00, 2388.00, 1910.00, 'USD', 1, 'Save 20% on annual billing', '[\"2,500 CTE records\\/th\\u00e1ng\",\"T\\u00e0i li\\u1ec7u kh\\u00f4ng gi\\u1edbi h\\u1ea1n\",\"3 ng\\u01b0\\u1eddi d\\u00f9ng\",\"Truy xu\\u1ea5t ngu\\u1ed3n g\\u1ed1c (Traceability)\",\"Qu\\u1ea3n l\\u00fd T\\u00e0i li\\u1ec7u\",\"Ch\\u1eef k\\u00fd \\u0111i\\u1ec7n t\\u1eed (E-Signatures)\",\"Qu\\u1ea3n l\\u00fd Ch\\u1ee9ng ch\\u1ec9 (Certificates)\",\"B\\u00e1o c\\u00e1o Tu\\u00e2n th\\u1ee7 (Compliance Report)\",\"H\\u1ed7 tr\\u1ee3 Email & Chat\"]', 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 'email_chat', 1, 1, 3, '2025-11-04 09:28:17', '2025-11-04 09:28:17');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `partners`
--

CREATE TABLE `partners` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `partner_name` varchar(255) NOT NULL,
  `partner_type` enum('supplier','customer','both') NOT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `gln` varchar(50) DEFAULT NULL,
  `organization_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `partners`
--

INSERT INTO `partners` (`id`, `partner_name`, `partner_type`, `contact_person`, `email`, `phone`, `address`, `gln`, `organization_id`, `created_at`, `updated_at`) VALUES
(1, 'Fresh Farms Co.', 'supplier', 'John Smith', 'john@freshfarms.com', '555-0101', '100 Farm Road, Salinas, CA 93901', '0614141000010', 2, '2025-11-04 09:28:33', '2025-11-04 09:28:33'),
(2, 'Retail Supermarket Chain', 'customer', 'Jane Doe', 'jane@retailchain.com', '555-0202', '200 Market St, San Francisco, CA 94102', '0614141000020', 2, '2025-11-04 09:28:33', '2025-11-04 09:28:33'),
(3, 'Food Distributor Inc.', 'both', 'Bob Johnson', 'bob@fooddist.com', '555-0303', '300 Distribution Way, Oakland, CA 94601', '0614141000030', 2, '2025-11-04 09:28:33', '2025-11-04 09:28:33');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payment_orders`
--

CREATE TABLE `payment_orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `organization_id` varchar(255) DEFAULT NULL,
  `order_id` varchar(255) NOT NULL,
  `package_id` varchar(255) NOT NULL,
  `billing_period` varchar(255) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `status` enum('pending','completed','failed','expired') NOT NULL DEFAULT 'pending',
  `payment_gateway` varchar(255) DEFAULT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `stripe_session_id` varchar(255) DEFAULT NULL,
  `stripe_invoice_id` varchar(255) DEFAULT NULL,
  `idempotency_key` varchar(255) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `response_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`response_data`)),
  `error_message` varchar(255) DEFAULT NULL,
  `ip_address` varchar(255) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `pa_shipments`
--

CREATE TABLE `pa_shipments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `prior_notice_id` bigint(20) UNSIGNED NOT NULL,
  `tracking_number` varchar(255) NOT NULL,
  `bill_of_lading` varchar(255) DEFAULT NULL,
  `container_number` varchar(255) DEFAULT NULL,
  `shipment_status` enum('in_transit','arrived','customs_clearance','released','held','refused') NOT NULL DEFAULT 'in_transit',
  `actual_arrival_date` date DEFAULT NULL,
  `release_date` date DEFAULT NULL,
  `customs_notes` text DEFAULT NULL,
  `inspection_results` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`inspection_results`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\User', 4, 'fda-facility-access', '6aba8a624506631f9fc13f29447cde5fad90434680cabc33f1bf30943a8a14a1', '[\"fda-facility\"]', NULL, NULL, '2025-11-04 09:37:07', '2025-11-04 09:37:07'),
(2, 'App\\Models\\User', 4, 'fda-facility-access', '8a5e4952f91cd5d1ad017eb5eb0ddd8787f7cba2a3e25961f91f19ddbe218a38', '[\"fda-facility\"]', NULL, NULL, '2025-11-04 09:46:25', '2025-11-04 09:46:25'),
(3, 'App\\Models\\User', 4, 'fda-facility-access', '17a9fecb5e900505acc3cd9acaa4823acd0df3ce167d2fd434c3a5075552c3ed', '[\"fda-facility\"]', NULL, NULL, '2025-11-04 09:52:52', '2025-11-04 09:52:52'),
(4, 'App\\Models\\User', 4, 'fda-facility-access', 'a2bb38c353ef8ca6bc25e55103035c3bbe36952d4d29dabe550191d1f312baa8', '[\"fda-facility\"]', NULL, NULL, '2025-11-04 10:23:44', '2025-11-04 10:23:44'),
(5, 'App\\Models\\User', 5, 'fsvp-access', '1bfaa394297d5a70db4de87e96545484b4506e0070d06dd98ea5d674d596aec4', '[\"fsvp\"]', NULL, NULL, '2025-11-04 11:10:04', '2025-11-04 11:10:04'),
(6, 'App\\Models\\User', 4, 'fda-facility-access', 'ca75b3ed427efe601706f619068dd6089a856e3ac9891f7e95da736fec8eaa0a', '[\"fda-facility\"]', NULL, NULL, '2025-11-04 11:35:20', '2025-11-04 11:35:20');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `pricing`
--

CREATE TABLE `pricing` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `package_id` enum('free','basic','premium','enterprise') NOT NULL,
  `package_name` varchar(255) NOT NULL,
  `price_monthly` decimal(10,2) NOT NULL DEFAULT 0.00,
  `price_yearly` decimal(10,2) NOT NULL DEFAULT 0.00,
  `list_price_monthly` decimal(10,2) NOT NULL DEFAULT 0.00,
  `list_price_yearly` decimal(10,2) NOT NULL DEFAULT 0.00,
  `max_cte_records_monthly` int(11) NOT NULL DEFAULT 0,
  `max_documents` int(11) NOT NULL DEFAULT 0,
  `max_users` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `pricing`
--

INSERT INTO `pricing` (`id`, `package_id`, `package_name`, `price_monthly`, `price_yearly`, `list_price_monthly`, `list_price_yearly`, `max_cte_records_monthly`, `max_documents`, `max_users`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'free', 'Free Tier', 0.00, 0.00, 0.00, 0.00, 50, 1, 1, 1, NULL, NULL),
(2, 'basic', 'Basic', 0.00, 0.00, 0.00, 0.00, 500, 10, 1, 1, NULL, NULL),
(3, 'premium', 'Premium', 0.00, 0.00, 0.00, 0.00, 2500, 0, 3, 1, NULL, NULL),
(4, 'enterprise', 'Enterprise', 0.00, 0.00, 0.00, 0.00, 0, 0, 0, 1, NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `prior_notices`
--

CREATE TABLE `prior_notices` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `pn_number` varchar(255) NOT NULL,
  `status` enum('draft','submitted','accepted','rejected','arrived','released') NOT NULL DEFAULT 'draft',
  `entry_number` varchar(255) DEFAULT NULL,
  `estimated_arrival_date` date NOT NULL,
  `estimated_arrival_time` time DEFAULT NULL,
  `port_of_arrival` varchar(255) NOT NULL,
  `country_of_origin` varchar(255) NOT NULL,
  `manufacturer_name` varchar(255) NOT NULL,
  `manufacturer_address` text NOT NULL,
  `shipper_name` varchar(255) NOT NULL,
  `shipper_address` text NOT NULL,
  `importer_name` varchar(255) NOT NULL,
  `importer_address` text NOT NULL,
  `carrier_name` varchar(255) DEFAULT NULL,
  `mode_of_transportation` varchar(255) NOT NULL,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `fda_response_at` timestamp NULL DEFAULT NULL,
  `fda_response_message` text DEFAULT NULL,
  `fda_confirmation_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`fda_confirmation_data`)),
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `organization_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `prior_notice_items`
--

CREATE TABLE `prior_notice_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `prior_notice_id` bigint(20) UNSIGNED NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_code` varchar(255) DEFAULT NULL,
  `product_description` text NOT NULL,
  `fda_product_code` varchar(255) DEFAULT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `unit_of_measure` varchar(255) NOT NULL,
  `container_type` varchar(255) DEFAULT NULL,
  `number_of_containers` int(11) DEFAULT NULL,
  `lot_number` varchar(255) DEFAULT NULL,
  `manufacturing_date` date DEFAULT NULL,
  `expiration_date` date DEFAULT NULL,
  `intended_use` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`intended_use`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `products`
--

CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `organization_id` bigint(20) UNSIGNED NOT NULL DEFAULT 1,
  `sku` varchar(255) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `is_ftl` tinyint(1) NOT NULL DEFAULT 1,
  `category` varchar(255) DEFAULT NULL,
  `unit_of_measure` varchar(255) NOT NULL DEFAULT 'kg',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `products`
--

INSERT INTO `products` (`id`, `organization_id`, `sku`, `product_name`, `description`, `status`, `is_ftl`, `category`, `unit_of_measure`, `created_at`, `updated_at`) VALUES
(1, 2, 'TOM-001', 'Fresh Tomatoes', 'Organic Roma Tomatoes', 'active', 1, 'Vegetables', 'kg', '2025-11-04 09:28:33', '2025-11-04 09:28:33'),
(2, 2, 'LET-001', 'Romaine Lettuce', 'Fresh Romaine Lettuce', 'active', 1, 'Leafy Greens', 'kg', '2025-11-04 09:28:33', '2025-11-04 09:28:33'),
(3, 2, 'STR-001', 'Fresh Strawberries', 'Organic Strawberries', 'active', 1, 'Berries', 'kg', '2025-11-04 09:28:33', '2025-11-04 09:28:33');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `registrations`
--

CREATE TABLE `registrations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `facility_id` bigint(20) UNSIGNED NOT NULL,
  `type` enum('initial','renewal','update') NOT NULL DEFAULT 'initial',
  `status` enum('draft','submitted','approved','rejected','expired') NOT NULL DEFAULT 'draft',
  `submitted_at` date DEFAULT NULL,
  `approved_at` date DEFAULT NULL,
  `effective_date` date DEFAULT NULL,
  `expiration_date` date DEFAULT NULL,
  `registration_number` varchar(255) DEFAULT NULL,
  `submission_details` text DEFAULT NULL,
  `submission_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`submission_data`)),
  `fda_response` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`fda_response`)),
  `fda_notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `retention_logs`
--

CREATE TABLE `retention_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `organization_id` bigint(20) UNSIGNED DEFAULT NULL,
  `retention_policy_id` bigint(20) UNSIGNED NOT NULL,
  `data_type` varchar(255) NOT NULL,
  `records_deleted` int(11) NOT NULL DEFAULT 0,
  `records_backed_up` int(11) NOT NULL DEFAULT 0,
  `backup_file_path` varchar(255) DEFAULT NULL,
  `executed_at` datetime NOT NULL,
  `executed_by` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `error_message` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `retention_policies`
--

CREATE TABLE `retention_policies` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `organization_id` bigint(20) UNSIGNED NOT NULL,
  `policy_name` varchar(255) NOT NULL,
  `data_type` varchar(255) NOT NULL,
  `retention_months` int(11) NOT NULL DEFAULT 27,
  `backup_before_deletion` tinyint(1) NOT NULL DEFAULT 1,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `description` text DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `retention_policies`
--

INSERT INTO `retention_policies` (`id`, `organization_id`, `policy_name`, `data_type`, `retention_months`, `backup_before_deletion`, `is_active`, `description`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 'Documents Retention - Default Organization (ID: 1)', 'documents', 0, 0, 1, 'FSMA 204 protected data - indefinite retention required', NULL, NULL, '2025-11-04 09:28:30', '2025-11-04 09:28:30', NULL),
(2, 1, 'Document Versions Retention - Default Organization (ID: 1)', 'document_versions', 0, 0, 1, 'FSMA 204 protected data - indefinite retention required', NULL, NULL, '2025-11-04 09:28:30', '2025-11-04 09:28:30', NULL),
(3, 1, 'Default trace_records for org 1', 'trace_records', 0, 1, 1, 'Core traceability data required for FSMA 204 compliance', 'system', 'system', '2025-11-04 09:28:32', '2025-11-04 09:28:32', NULL),
(4, 1, 'Default cte_events for org 1', 'cte_events', 0, 1, 1, 'Immutable Critical Tracking Events per FSMA 204 Section 204.6', 'system', 'system', '2025-11-04 09:28:32', '2025-11-04 09:28:32', NULL),
(5, 1, 'Default audit_logs for org 1', 'audit_logs', 0, 1, 1, 'Compliance and regulatory audit requirement', 'system', 'system', '2025-11-04 09:28:32', '2025-11-04 09:28:32', NULL),
(6, 1, 'Default e_signatures for org 1', 'e_signatures', 0, 1, 1, 'Legal requirement per 21 CFR Part 11 (Electronic Records)', 'system', 'system', '2025-11-04 09:28:32', '2025-11-04 09:28:32', NULL),
(7, 1, 'Default trace_relationships for org 1', 'trace_relationships', 0, 1, 1, 'Audit trail required for traceability chain integrity', 'system', 'system', '2025-11-04 09:28:32', '2025-11-04 09:28:32', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `signature_delegations`
--

CREATE TABLE `signature_delegations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `delegator_user_id` bigint(20) UNSIGNED NOT NULL,
  `delegatee_user_id` bigint(20) UNSIGNED NOT NULL,
  `delegation_authority` varchar(255) NOT NULL,
  `delegation_scope` text DEFAULT NULL,
  `valid_from` datetime NOT NULL,
  `valid_until` datetime NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `revocation_reason` text DEFAULT NULL,
  `revoked_at` datetime DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `signature_performance_metrics`
--

CREATE TABLE `signature_performance_metrics` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `e_signature_id` bigint(20) UNSIGNED NOT NULL,
  `signature_creation_time_ms` int(11) DEFAULT NULL,
  `timestamp_request_time_ms` int(11) DEFAULT NULL,
  `certificate_verification_time_ms` int(11) DEFAULT NULL,
  `hash_computation_time_ms` int(11) DEFAULT NULL,
  `encryption_time_ms` int(11) DEFAULT NULL,
  `total_signature_time_ms` int(11) DEFAULT NULL,
  `verification_time_ms` int(11) DEFAULT NULL,
  `revocation_check_time_ms` int(11) DEFAULT NULL,
  `ltv_validation_time_ms` int(11) DEFAULT NULL,
  `tsa_provider` varchar(255) DEFAULT NULL,
  `tsa_response_time_ms` int(11) DEFAULT NULL,
  `tsa_retry_count` int(11) NOT NULL DEFAULT 0,
  `tsa_status` varchar(255) DEFAULT NULL,
  `memory_used_mb` int(11) DEFAULT NULL,
  `cpu_time_ms` int(11) DEFAULT NULL,
  `signatures_per_minute` int(11) DEFAULT NULL,
  `verifications_per_minute` int(11) DEFAULT NULL,
  `error_count` int(11) NOT NULL DEFAULT 0,
  `error_log` text DEFAULT NULL,
  `bottleneck_component` varchar(255) DEFAULT NULL,
  `bottleneck_time_ms` int(11) DEFAULT NULL,
  `bottleneck_percentage` decimal(5,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `signature_record_types`
--

CREATE TABLE `signature_record_types` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `record_type` varchar(100) NOT NULL COMMENT 'e.g., products, cte_events, documents, trace_records',
  `model_class` varchar(255) NOT NULL COMMENT 'Full namespace of the model class',
  `display_name` varchar(255) NOT NULL COMMENT 'Human-readable name for UI',
  `description` text DEFAULT NULL,
  `content_fields` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'Fields to include in content hash' CHECK (json_valid(`content_fields`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `signature_revocations`
--

CREATE TABLE `signature_revocations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `signature_id` bigint(20) UNSIGNED NOT NULL,
  `revoked_by_user_id` bigint(20) UNSIGNED NOT NULL,
  `revocation_reason` varchar(500) NOT NULL,
  `revocation_category` varchar(255) NOT NULL COMMENT 'user_request, security_breach, data_modification, compliance, other',
  `revocation_details` text DEFAULT NULL COMMENT 'Additional details about revocation',
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `is_emergency_revocation` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Emergency revocation flag',
  `revoked_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `signature_templates`
--

CREATE TABLE `signature_templates` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `organization_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `meaning_text` text NOT NULL,
  `record_type` varchar(50) DEFAULT NULL,
  `category` enum('approval','acknowledgment','verification','authorization','review','modification','deletion','other') NOT NULL DEFAULT 'other',
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `usage_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `template_metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`template_metadata`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `signature_verifications`
--

CREATE TABLE `signature_verifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `signature_id` bigint(20) UNSIGNED NOT NULL,
  `verified_by_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `verification_type` varchar(50) NOT NULL,
  `verification_status` varchar(50) NOT NULL,
  `verification_details` text DEFAULT NULL,
  `verification_checks` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`verification_checks`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `verification_duration_ms` int(11) DEFAULT NULL,
  `is_brute_force_attempt` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `traceability_analytics`
--

CREATE TABLE `traceability_analytics` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `organization_id` bigint(20) UNSIGNED DEFAULT NULL,
  `trace_record_id` bigint(20) UNSIGNED NOT NULL,
  `query_type` enum('public','admin_report','api') NOT NULL DEFAULT 'public',
  `direction` enum('backward','forward','both') DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `trace_records`
--

CREATE TABLE `trace_records` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tlc` varchar(255) NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `available_quantity` decimal(10,2) NOT NULL DEFAULT 0.00,
  `consumed_quantity` decimal(10,2) NOT NULL DEFAULT 0.00,
  `unit` varchar(20) NOT NULL DEFAULT 'kg',
  `lot_code` varchar(255) DEFAULT NULL,
  `harvest_date` date DEFAULT NULL,
  `location_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('active','consumed','shipped','destroyed','voided') DEFAULT 'active',
  `path` text DEFAULT NULL,
  `organization_id` bigint(20) UNSIGNED DEFAULT NULL,
  `materialized_path` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `trace_relationships`
--

CREATE TABLE `trace_relationships` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `organization_id` bigint(20) UNSIGNED NOT NULL,
  `parent_id` bigint(20) UNSIGNED NOT NULL,
  `child_id` bigint(20) UNSIGNED DEFAULT NULL,
  `relationship_type` enum('INPUT','OUTPUT') NOT NULL,
  `cte_event_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `transformation_items`
--

CREATE TABLE `transformation_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `transformation_event_id` bigint(20) UNSIGNED NOT NULL,
  `input_trace_record_id` bigint(20) UNSIGNED NOT NULL,
  `quantity_used` decimal(10,2) NOT NULL,
  `unit` varchar(20) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `two_fa_logs`
--

CREATE TABLE `two_fa_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `method` varchar(255) NOT NULL COMMENT 'totp, sms, backup_code',
  `success` tinyint(1) NOT NULL DEFAULT 0,
  `ip_address` varchar(45) NOT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `failure_reason` text DEFAULT NULL,
  `attempted_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `package_changed_at` timestamp NULL DEFAULT NULL,
  `package_changed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `trial_used` tinyint(4) NOT NULL DEFAULT 0,
  `subscription_status` enum('active','inactive','canceled','expired') NOT NULL DEFAULT 'inactive',
  `organization_id` bigint(20) UNSIGNED DEFAULT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `preferred_language` varchar(5) NOT NULL DEFAULT 'en',
  `email_token` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `role` enum('admin','manager','operator','fda-facility') NOT NULL DEFAULT 'operator',
  `is_system_admin` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'System-wide admin with global access, not bound to organization',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `two_fa_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `two_fa_secret` varchar(255) DEFAULT NULL,
  `backup_codes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`backup_codes`)),
  `two_fa_enabled_at` timestamp NULL DEFAULT NULL,
  `certificate_id` varchar(255) DEFAULT NULL,
  `public_key` text DEFAULT NULL,
  `certificate_pem` text DEFAULT NULL,
  `certificate_expires_at` timestamp NULL DEFAULT NULL,
  `certificate_revoked` tinyint(1) NOT NULL DEFAULT 0,
  `certificate_revoked_at` timestamp NULL DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `last_activity_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `trial_started_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `subscription_ends_at` timestamp NULL DEFAULT NULL,
  `last_payment_date` timestamp NULL DEFAULT NULL,
  `payment_gateway` varchar(255) DEFAULT NULL,
  `vnpay_transaction_id` varchar(255) DEFAULT NULL,
  `vnpay_order_id` varchar(255) DEFAULT NULL,
  `stripe_customer_id` varchar(255) DEFAULT NULL,
  `stripe_subscription_id` varchar(255) DEFAULT NULL,
  `trial_expires_at` timestamp NULL DEFAULT NULL,
  `max_cte_records_monthly` int(11) NOT NULL DEFAULT 0,
  `max_documents` int(11) NOT NULL DEFAULT 0,
  `max_users` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `package_changed_at`, `package_changed_by`, `trial_used`, `subscription_status`, `organization_id`, `username`, `email`, `preferred_language`, `email_token`, `password`, `full_name`, `role`, `is_system_admin`, `is_active`, `two_fa_enabled`, `two_fa_secret`, `backup_codes`, `two_fa_enabled_at`, `certificate_id`, `public_key`, `certificate_pem`, `certificate_expires_at`, `certificate_revoked`, `certificate_revoked_at`, `last_login`, `last_activity_at`, `remember_token`, `created_at`, `trial_started_at`, `updated_at`, `subscription_ends_at`, `last_payment_date`, `payment_gateway`, `vnpay_transaction_id`, `vnpay_order_id`, `stripe_customer_id`, `stripe_subscription_id`, `trial_expires_at`, `max_cte_records_monthly`, `max_documents`, `max_users`) VALUES
(1, NULL, NULL, 0, 'inactive', 1, 'admin', 'admin@fsma204.com', 'en', NULL, '$2y$12$LCgV2lCGHwd/jiMdWYxCKenVvo45hTzYGc5cghxv6C5WJOxO01pX6', 'System Administrator', 'admin', 0, 1, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2025-11-04 10:26:17', NULL, NULL, '2025-11-04 09:28:33', NULL, '2025-11-04 10:26:17', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0),
(2, NULL, NULL, 0, 'inactive', 2, 'manager', 'manager@fsma204.com', 'en', NULL, '$2y$12$7TKjr1T86vzP7YnD5ogyTOzt7/gglignkXI2LLUh9kEes5H1sLgp6', 'Warehouse Manager', 'manager', 0, 1, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2025-11-04 09:28:34', NULL, '2025-11-04 09:28:34', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0),
(3, NULL, NULL, 0, 'inactive', 2, 'operator', 'operator@fsma204.com', 'en', NULL, '$2y$12$ExGLT/FY9SgpQVupv/nY1.ONH06CMWoeKLtFd69sKsMed9xv4kh4a', 'Floor Operator', 'operator', 0, 1, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2025-11-04 09:28:34', NULL, '2025-11-04 09:28:34', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0),
(4, NULL, NULL, 0, 'inactive', 2, 'fda_admin', 'fda@example.com', 'en', NULL, '$2y$12$EFTuAC7TsMrCHu/bDSb0Qumiw8NMUe3h5R7hZb.l645TY6WQCXAF2', 'FDA Admin', 'admin', 0, 1, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2025-11-04 09:28:34', NULL, '2025-11-04 09:28:34', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0),
(5, NULL, NULL, 0, 'inactive', 2, 'fsvp_manager', 'fsvp@example.com', 'en', NULL, '$2y$12$qPe7pbhOKfX1.vncnLA9ReTSz2VaAZTzC46skFFtumWigNw1RkX1.', 'FSVP Manager', 'manager', 0, 1, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2025-11-04 09:28:34', NULL, '2025-11-04 09:28:34', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0),
(6, NULL, NULL, 0, 'inactive', 2, 'pa_operator', 'pa@example.com', 'en', NULL, '$2y$12$Xn8Xkqq/gWZbVG1l2JeuBe1LPRdnM3SwgzBarZCWcJHIIHG34kl6.', 'PA Operator', 'operator', 0, 1, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2025-11-04 09:28:35', NULL, '2025-11-04 09:28:35', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_feature_overrides`
--

CREATE TABLE `user_feature_overrides` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `organization_id` bigint(20) UNSIGNED NOT NULL,
  `feature_name` varchar(255) NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT 1,
  `reason` text DEFAULT NULL,
  `granted_by_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `webhook_logs`
--

CREATE TABLE `webhook_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `endpoint` varchar(255) NOT NULL,
  `event_type` varchar(255) DEFAULT NULL,
  `request_payload` text NOT NULL,
  `response` text DEFAULT NULL,
  `status_code` int(11) DEFAULT NULL,
  `ip_address` varchar(255) DEFAULT NULL,
  `gateway` varchar(50) DEFAULT NULL,
  `event_id` varchar(255) DEFAULT NULL,
  `attempt_count` int(11) NOT NULL DEFAULT 1,
  `last_attempt_at` timestamp NULL DEFAULT NULL,
  `is_successful` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `alerts`
--
ALTER TABLE `alerts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `alerts_facility_id_foreign` (`facility_id`),
  ADD KEY `alerts_user_id_foreign` (`user_id`);

--
-- Chỉ mục cho bảng `archival_audit_logs`
--
ALTER TABLE `archival_audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `archival_audit_logs_auditable_type_auditable_id_index` (`auditable_type`,`auditable_id`),
  ADD KEY `archival_audit_logs_event_type_index` (`event_type`),
  ADD KEY `archival_audit_logs_user_id_index` (`user_id`),
  ADD KEY `archival_audit_logs_original_id_index` (`original_id`),
  ADD KEY `archival_audit_logs_archived_at_index` (`archived_at`);

--
-- Chỉ mục cho bảng `archival_cte_events`
--
ALTER TABLE `archival_cte_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `archival_cte_events_event_type_index` (`event_type`),
  ADD KEY `archival_cte_events_event_date_index` (`event_date`),
  ADD KEY `archival_cte_events_trace_record_id_index` (`trace_record_id`),
  ADD KEY `archival_cte_events_original_id_event_type_index` (`original_id`,`event_type`),
  ADD KEY `archival_cte_events_original_id_index` (`original_id`),
  ADD KEY `archival_cte_events_archived_at_index` (`archived_at`);

--
-- Chỉ mục cho bảng `archival_documents`
--
ALTER TABLE `archival_documents`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `archival_documents_doc_number_unique` (`doc_number`),
  ADD KEY `archival_documents_doc_number_index` (`doc_number`),
  ADD KEY `archival_documents_type_index` (`type`),
  ADD KEY `archival_documents_status_index` (`status`),
  ADD KEY `archival_documents_organization_id_index` (`organization_id`),
  ADD KEY `archival_documents_uploaded_by_index` (`uploaded_by`),
  ADD KEY `archival_documents_organization_id_status_index` (`organization_id`,`status`),
  ADD KEY `archival_documents_organization_id_type_index` (`organization_id`,`type`),
  ADD KEY `archival_documents_original_id_index` (`original_id`),
  ADD KEY `archival_documents_archived_at_index` (`archived_at`);

--
-- Chỉ mục cho bảng `archival_document_versions`
--
ALTER TABLE `archival_document_versions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `archival_document_versions_document_id_index` (`document_id`),
  ADD KEY `archival_document_versions_version_index` (`version`),
  ADD KEY `archival_document_versions_created_by_index` (`created_by`),
  ADD KEY `archival_document_versions_original_id_index` (`original_id`),
  ADD KEY `archival_document_versions_archived_at_index` (`archived_at`);

--
-- Chỉ mục cho bảng `archival_e_signatures`
--
ALTER TABLE `archival_e_signatures`
  ADD PRIMARY KEY (`id`),
  ADD KEY `archival_e_signatures_record_type_record_id_index` (`record_type`,`record_id`),
  ADD KEY `archival_e_signatures_user_id_index` (`user_id`),
  ADD KEY `archival_e_signatures_signed_at_index` (`signed_at`),
  ADD KEY `archival_e_signatures_is_revoked_index` (`is_revoked`),
  ADD KEY `archival_e_signatures_original_id_index` (`original_id`),
  ADD KEY `archival_e_signatures_archived_at_index` (`archived_at`);

--
-- Chỉ mục cho bảng `archival_logs`
--
ALTER TABLE `archival_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `archival_logs_executed_by_foreign` (`executed_by`),
  ADD KEY `archival_logs_data_type_index` (`data_type`),
  ADD KEY `archival_logs_executed_at_index` (`executed_at`),
  ADD KEY `archival_logs_status_index` (`status`),
  ADD KEY `archival_logs_organization_id_index` (`organization_id`);

--
-- Chỉ mục cho bảng `archival_trace_records`
--
ALTER TABLE `archival_trace_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `archival_trace_records_lot_code_index` (`lot_code`),
  ADD KEY `archival_trace_records_status_index` (`status`),
  ADD KEY `archival_trace_records_materialized_path_index` (`materialized_path`),
  ADD KEY `archival_trace_records_organization_id_index` (`organization_id`),
  ADD KEY `archival_trace_records_tlc_status_index` (`tlc`,`status`),
  ADD KEY `archival_trace_records_original_id_index` (`original_id`),
  ADD KEY `archival_trace_records_tlc_index` (`tlc`),
  ADD KEY `archival_trace_records_archived_at_index` (`archived_at`);

--
-- Chỉ mục cho bảng `archival_trace_relationships`
--
ALTER TABLE `archival_trace_relationships`
  ADD PRIMARY KEY (`id`),
  ADD KEY `archival_trace_relationships_parent_id_child_id_index` (`parent_id`,`child_id`),
  ADD KEY `archival_trace_relationships_relationship_type_index` (`relationship_type`),
  ADD KEY `archival_trace_relationships_cte_event_id_index` (`cte_event_id`),
  ADD KEY `archival_trace_relationships_original_id_index` (`original_id`),
  ADD KEY `archival_trace_relationships_archived_at_index` (`archived_at`);

--
-- Chỉ mục cho bảng `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `audit_logs_user_id_index` (`user_id`),
  ADD KEY `audit_logs_table_name_index` (`table_name`),
  ADD KEY `audit_logs_record_id_index` (`record_id`),
  ADD KEY `audit_logs_created_at_index` (`created_at`),
  ADD KEY `audit_logs_lookup_index` (`table_name`,`record_id`,`created_at`),
  ADD KEY `audit_logs_organization_id_index` (`organization_id`),
  ADD KEY `audit_logs_action_index` (`action`),
  ADD KEY `audit_logs_integrity_hash_index` (`integrity_hash`),
  ADD KEY `idx_audit_logs_org_created` (`organization_id`,`created_at`),
  ADD KEY `audit_logs_organization_id_event_category_created_at_index` (`organization_id`,`event_category`,`created_at`);

--
-- Chỉ mục cho bảng `audit_logs_details`
--
ALTER TABLE `audit_logs_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `audit_logs_details_audit_log_id_index` (`audit_log_id`),
  ADD KEY `audit_logs_details_organization_id_foreign` (`organization_id`);

--
-- Chỉ mục cho bảng `batch_signature_operations`
--
ALTER TABLE `batch_signature_operations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `batch_signature_operations_user_id_foreign` (`user_id`),
  ADD KEY `batch_signature_operations_organization_id_foreign` (`organization_id`),
  ADD KEY `batch_signature_operations_status_index` (`status`),
  ADD KEY `batch_signature_operations_created_at_index` (`created_at`);

--
-- Chỉ mục cho bảng `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Chỉ mục cho bảng `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Chỉ mục cho bảng `compliance_reports`
--
ALTER TABLE `compliance_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `compliance_reports_organization_id_foreign` (`organization_id`),
  ADD KEY `compliance_reports_report_type_index` (`report_type`);

--
-- Chỉ mục cho bảng `cte_events`
--
ALTER TABLE `cte_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cte_events_location_id_foreign` (`location_id`),
  ADD KEY `cte_events_partner_id_foreign` (`partner_id`),
  ADD KEY `cte_events_created_by_foreign` (`created_by`),
  ADD KEY `cte_events_event_type_index` (`event_type`),
  ADD KEY `cte_events_event_date_index` (`event_date`),
  ADD KEY `cte_events_trace_record_id_index` (`trace_record_id`),
  ADD KEY `cte_events_traceability_lot_code_index` (`traceability_lot_code`),
  ADD KEY `cte_events_business_gln_index` (`business_gln`),
  ADD KEY `cte_events_fda_compliant_index` (`fda_compliant`),
  ADD KEY `cte_events_quantity_shipped_index` (`quantity_shipped`),
  ADD KEY `cte_events_inventory_status_index` (`inventory_status`),
  ADD KEY `cte_events_voided_by_foreign` (`voided_by`),
  ADD KEY `cte_events_status_index` (`status`),
  ADD KEY `cte_events_voids_event_id_index` (`voids_event_id`),
  ADD KEY `cte_events_product_lot_code_index` (`product_lot_code`),
  ADD KEY `cte_events_harvest_location_gln_index` (`harvest_location_gln`),
  ADD KEY `cte_events_cooling_date_index` (`cooling_date`),
  ADD KEY `cte_events_signature_id_index` (`signature_id`),
  ADD KEY `idx_cte_events_org_created` (`organization_id`,`created_at`);

--
-- Chỉ mục cho bảng `digital_certificates`
--
ALTER TABLE `digital_certificates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `digital_certificates_certificate_id_unique` (`certificate_id`),
  ADD UNIQUE KEY `digital_certificates_serial_number_unique` (`serial_number`),
  ADD KEY `digital_certificates_user_id_index` (`user_id`),
  ADD KEY `digital_certificates_certificate_id_index` (`certificate_id`),
  ADD KEY `digital_certificates_is_revoked_index` (`is_revoked`),
  ADD KEY `digital_certificates_expires_at_index` (`expires_at`),
  ADD KEY `digital_certificates_organization_id_index` (`organization_id`);

--
-- Chỉ mục cho bảng `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `documents_doc_number_unique` (`doc_number`),
  ADD KEY `documents_approved_by_foreign` (`approved_by`),
  ADD KEY `documents_type_index` (`type`),
  ADD KEY `documents_status_index` (`status`),
  ADD KEY `documents_effective_date_index` (`effective_date`),
  ADD KEY `documents_organization_id_index` (`organization_id`),
  ADD KEY `documents_uploaded_by_foreign` (`uploaded_by`),
  ADD KEY `documents_archived_at_index` (`archived_at`),
  ADD KEY `documents_file_hash_index` (`file_hash`),
  ADD KEY `documents_audit_log_id_index` (`audit_log_id`);
ALTER TABLE `documents` ADD FULLTEXT KEY `documents_fulltext_idx` (`doc_number`,`title`,`description`);

--
-- Chỉ mục cho bảng `document_approvals`
--
ALTER TABLE `document_approvals`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `document_approvals_document_id_approval_level_unique` (`document_id`,`approval_level`),
  ADD KEY `document_approvals_approved_by_foreign` (`approved_by`),
  ADD KEY `document_approvals_document_id_approval_level_index` (`document_id`,`approval_level`),
  ADD KEY `document_approvals_organization_id_status_index` (`organization_id`,`status`);

--
-- Chỉ mục cho bảng `document_versions`
--
ALTER TABLE `document_versions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `document_versions_created_by_foreign` (`created_by`),
  ADD KEY `document_versions_document_id_version_index` (`document_id`,`version`),
  ADD KEY `document_versions_organization_id_index` (`organization_id`),
  ADD KEY `document_versions_file_hash_index` (`file_hash`),
  ADD KEY `document_versions_audit_log_id_index` (`audit_log_id`);

--
-- Chỉ mục cho bảng `email_notifications`
--
ALTER TABLE `email_notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `email_notifications_user_id_foreign` (`user_id`),
  ADD KEY `email_notifications_facility_id_foreign` (`facility_id`),
  ADD KEY `email_notifications_status_index` (`status`),
  ADD KEY `email_notifications_sent_at_index` (`sent_at`);

--
-- Chỉ mục cho bảng `error_logs`
--
ALTER TABLE `error_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `error_logs_resolved_by_foreign` (`resolved_by`),
  ADD KEY `error_logs_error_hash_is_resolved_index` (`error_hash`,`is_resolved`),
  ADD KEY `error_logs_severity_created_at_index` (`severity`,`created_at`),
  ADD KEY `error_logs_user_id_created_at_index` (`user_id`,`created_at`),
  ADD KEY `error_logs_error_hash_index` (`error_hash`),
  ADD KEY `error_logs_is_resolved_index` (`is_resolved`),
  ADD KEY `error_logs_severity_index` (`severity`),
  ADD KEY `error_logs_organization_id_foreign` (`organization_id`);

--
-- Chỉ mục cho bảng `export_logs`
--
ALTER TABLE `export_logs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `export_logs_export_id_unique` (`export_id`),
  ADD KEY `export_logs_user_id_foreign` (`user_id`),
  ADD KEY `export_logs_export_id_index` (`export_id`),
  ADD KEY `export_logs_file_type_index` (`file_type`),
  ADD KEY `export_logs_export_scope_index` (`export_scope`),
  ADD KEY `export_logs_created_at_index` (`created_at`),
  ADD KEY `export_logs_content_hash_index` (`content_hash`(768));

--
-- Chỉ mục cho bảng `e_signatures`
--
ALTER TABLE `e_signatures`
  ADD PRIMARY KEY (`id`),
  ADD KEY `e_signatures_record_type_record_id_index` (`record_type`,`record_id`),
  ADD KEY `e_signatures_user_id_index` (`user_id`),
  ADD KEY `e_signatures_signed_at_index` (`signed_at`),
  ADD KEY `e_signatures_certificate_id_index` (`certificate_id`),
  ADD KEY `e_signatures_is_revoked_index` (`is_revoked`),
  ADD KEY `e_signatures_timestamp_verified_at_index` (`timestamp_verified_at`),
  ADD KEY `e_signatures_signature_valid_until_index` (`signature_valid_until`),
  ADD KEY `e_signatures_certificate_revocation_checked_index` (`certificate_revocation_checked`),
  ADD KEY `e_signatures_verification_passed_index` (`verification_passed`),
  ADD KEY `e_signatures_signature_format_index` (`signature_format`),
  ADD KEY `e_signatures_ltv_enabled_index` (`ltv_enabled`),
  ADD KEY `e_signatures_batch_operation_id_index` (`batch_operation_id`),
  ADD KEY `e_signatures_delegated_by_user_id_index` (`delegated_by_user_id`),
  ADD KEY `e_signatures_is_delegated_signature_index` (`is_delegated_signature`),
  ADD KEY `e_signatures_is_expired_index` (`is_expired`),
  ADD KEY `e_signatures_expiration_status_index` (`expiration_status`),
  ADD KEY `e_signatures_organization_id_index` (`organization_id`);

--
-- Chỉ mục cho bảng `facilities`
--
ALTER TABLE `facilities`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `facilities_fda_facility_id_unique` (`fda_facility_id`),
  ADD UNIQUE KEY `facilities_duns_number_unique` (`duns_number`),
  ADD KEY `facilities_user_id_foreign` (`user_id`);

--
-- Chỉ mục cho bảng `fda_accounts`
--
ALTER TABLE `fda_accounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `fda_accounts_fda_registration_number_unique` (`fda_registration_number`),
  ADD UNIQUE KEY `fda_accounts_fein_unique` (`fein`),
  ADD KEY `fda_accounts_created_by_foreign` (`created_by`),
  ADD KEY `fda_accounts_updated_by_foreign` (`updated_by`),
  ADD KEY `fda_accounts_organization_id_index` (`organization_id`),
  ADD KEY `fda_accounts_fda_registration_number_index` (`fda_registration_number`),
  ADD KEY `fda_accounts_registration_status_index` (`registration_status`),
  ADD KEY `fda_accounts_expiry_date_index` (`expiry_date`),
  ADD KEY `fda_accounts_is_compliant_index` (`is_compliant`);

--
-- Chỉ mục cho bảng `fda_account_alerts`
--
ALTER TABLE `fda_account_alerts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fda_account_alerts_fda_account_id_index` (`fda_account_id`),
  ADD KEY `fda_account_alerts_alert_type_index` (`alert_type`),
  ADD KEY `fda_account_alerts_severity_index` (`severity`),
  ADD KEY `fda_account_alerts_is_resolved_index` (`is_resolved`);

--
-- Chỉ mục cho bảng `fda_alerts`
--
ALTER TABLE `fda_alerts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fda_alerts_facility_id_foreign` (`facility_id`),
  ADD KEY `fda_alerts_assigned_to_foreign` (`assigned_to`);

--
-- Chỉ mục cho bảng `fda_audit_logs`
--
ALTER TABLE `fda_audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fda_audit_logs_facility_id_foreign` (`facility_id`);

--
-- Chỉ mục cho bảng `fda_facilities`
--
ALTER TABLE `fda_facilities`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `fda_facilities_fei_number_unique` (`fei_number`),
  ADD KEY `fda_facilities_organization_id_foreign` (`organization_id`);

--
-- Chỉ mục cho bảng `fda_registrations`
--
ALTER TABLE `fda_registrations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `fda_registrations_registration_number_unique` (`registration_number`),
  ADD KEY `fda_registrations_facility_id_foreign` (`facility_id`),
  ADD KEY `fda_registrations_submitted_by_foreign` (`submitted_by`);

--
-- Chỉ mục cho bảng `fda_registration_audits`
--
ALTER TABLE `fda_registration_audits`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fda_registration_audits_facility_id_foreign` (`facility_id`);

--
-- Chỉ mục cho bảng `fda_sync_logs`
--
ALTER TABLE `fda_sync_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fda_sync_logs_facility_id_foreign` (`facility_id`);

--
-- Chỉ mục cho bảng `fda_user_registrations`
--
ALTER TABLE `fda_user_registrations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fda_user_registrations_processed_by_foreign` (`processed_by`),
  ADD KEY `fda_user_registrations_user_id_index` (`user_id`),
  ADD KEY `fda_user_registrations_fda_account_id_index` (`fda_account_id`),
  ADD KEY `fda_user_registrations_registration_status_index` (`registration_status`),
  ADD KEY `fda_user_registrations_auto_submitted_to_fda_index` (`auto_submitted_to_fda`);

--
-- Chỉ mục cho bảng `fsvp_hazard_analyses`
--
ALTER TABLE `fsvp_hazard_analyses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fsvp_hazard_analyses_product_id_foreign` (`product_id`),
  ADD KEY `fsvp_hazard_analyses_analyzed_by_foreign` (`analyzed_by`);

--
-- Chỉ mục cho bảng `fsvp_products`
--
ALTER TABLE `fsvp_products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `fsvp_products_product_code_unique` (`product_code`),
  ADD KEY `fsvp_products_supplier_id_foreign` (`supplier_id`);

--
-- Chỉ mục cho bảng `fsvp_suppliers`
--
ALTER TABLE `fsvp_suppliers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `fsvp_suppliers_supplier_code_unique` (`supplier_code`),
  ADD KEY `fsvp_suppliers_organization_id_foreign` (`organization_id`);

--
-- Chỉ mục cho bảng `fsvp_verification_activities`
--
ALTER TABLE `fsvp_verification_activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fsvp_verification_activities_supplier_id_foreign` (`supplier_id`),
  ADD KEY `fsvp_verification_activities_product_id_foreign` (`product_id`),
  ADD KEY `fsvp_verification_activities_conducted_by_foreign` (`conducted_by`);

--
-- Chỉ mục cho bảng `leads`
--
ALTER TABLE `leads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `leads_email_index` (`email`),
  ADD KEY `leads_status_index` (`status`),
  ADD KEY `leads_created_at_index` (`created_at`),
  ADD KEY `leads_source_index` (`source`),
  ADD KEY `leads_organization_id_index` (`organization_id`);

--
-- Chỉ mục cho bảng `locations`
--
ALTER TABLE `locations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `locations_gln_unique` (`gln`),
  ADD KEY `locations_location_type_index` (`location_type`),
  ADD KEY `locations_gln_index` (`gln`),
  ADD KEY `locations_organization_id_index` (`organization_id`),
  ADD KEY `locations_status_index` (`status`);

--
-- Chỉ mục cho bảng `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_user_id_is_read_index` (`user_id`,`is_read`),
  ADD KEY `notifications_created_at_index` (`created_at`),
  ADD KEY `notifications_organization_id_index` (`organization_id`),
  ADD KEY `notifications_user_id_is_blocking_index` (`user_id`,`is_blocking`),
  ADD KEY `notifications_organization_id_created_at_index` (`organization_id`,`created_at`),
  ADD KEY `notifications_notification_group_index` (`notification_group`),
  ADD KEY `notifications_expires_at_index` (`expires_at`),
  ADD KEY `notifications_archived_at_index` (`archived_at`),
  ADD KEY `idx_notifications_user_active_unread` (`user_id`,`archived_at`,`is_read`),
  ADD KEY `idx_notifications_user_priority` (`user_id`,`priority`,`created_at`),
  ADD KEY `idx_notifications_blocking` (`user_id`,`is_blocking`,`is_read`,`archived_at`),
  ADD KEY `idx_notifications_user_created` (`user_id`,`created_at`),
  ADD KEY `idx_notifications_user_type` (`user_id`,`type`,`archived_at`);

--
-- Chỉ mục cho bảng `notification_audit_logs`
--
ALTER TABLE `notification_audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notification_audit_logs_organization_id_created_at_index` (`organization_id`,`created_at`),
  ADD KEY `notification_audit_logs_notification_id_action_index` (`notification_id`,`action`),
  ADD KEY `notification_audit_logs_user_id_index` (`user_id`);

--
-- Chỉ mục cho bảng `notification_preferences`
--
ALTER TABLE `notification_preferences`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `notification_preferences_user_id_type_unique` (`user_id`,`type`),
  ADD UNIQUE KEY `uq_preferences_user_type` (`user_id`,`notification_type`),
  ADD KEY `notification_preferences_user_id_index` (`user_id`);

--
-- Chỉ mục cho bảng `notification_templates`
--
ALTER TABLE `notification_templates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notification_templates_type_language_index` (`type`,`language`),
  ADD KEY `notification_templates_organization_id_type_index` (`organization_id`,`type`);

--
-- Chỉ mục cho bảng `organizations`
--
ALTER TABLE `organizations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `organizations_name_unique` (`name`);

--
-- Chỉ mục cho bảng `organization_quotas`
--
ALTER TABLE `organization_quotas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `organization_quotas_organization_id_feature_name_unique` (`organization_id`,`feature_name`),
  ADD KEY `organization_quotas_organization_id_feature_name_index` (`organization_id`,`feature_name`);

--
-- Chỉ mục cho bảng `packages`
--
ALTER TABLE `packages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `packages_slug_unique` (`slug`),
  ADD KEY `packages_organization_id_index` (`organization_id`);

--
-- Chỉ mục cho bảng `partners`
--
ALTER TABLE `partners`
  ADD PRIMARY KEY (`id`),
  ADD KEY `partners_partner_type_index` (`partner_type`),
  ADD KEY `partners_organization_id_index` (`organization_id`);

--
-- Chỉ mục cho bảng `payment_orders`
--
ALTER TABLE `payment_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payment_orders_order_id_unique` (`order_id`),
  ADD UNIQUE KEY `payment_orders_idempotency_key_unique` (`idempotency_key`),
  ADD KEY `payment_orders_order_id_index` (`order_id`),
  ADD KEY `payment_orders_user_id_index` (`user_id`),
  ADD KEY `payment_orders_status_index` (`status`),
  ADD KEY `payment_orders_created_at_index` (`created_at`),
  ADD KEY `payment_orders_expires_at_index` (`expires_at`),
  ADD KEY `payment_orders_organization_id_index` (`organization_id`),
  ADD KEY `payment_orders_stripe_session_id_index` (`stripe_session_id`);

--
-- Chỉ mục cho bảng `pa_shipments`
--
ALTER TABLE `pa_shipments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `pa_shipments_tracking_number_unique` (`tracking_number`),
  ADD KEY `pa_shipments_prior_notice_id_foreign` (`prior_notice_id`);

--
-- Chỉ mục cho bảng `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Chỉ mục cho bảng `pricing`
--
ALTER TABLE `pricing`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `pricing_package_id_unique` (`package_id`);

--
-- Chỉ mục cho bảng `prior_notices`
--
ALTER TABLE `prior_notices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `prior_notices_pn_number_unique` (`pn_number`),
  ADD KEY `prior_notices_created_by_foreign` (`created_by`),
  ADD KEY `prior_notices_organization_id_foreign` (`organization_id`);

--
-- Chỉ mục cho bảng `prior_notice_items`
--
ALTER TABLE `prior_notice_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `prior_notice_items_prior_notice_id_foreign` (`prior_notice_id`);

--
-- Chỉ mục cho bảng `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `prod_org_sku_unique` (`organization_id`,`sku`),
  ADD UNIQUE KEY `products_organization_id_sku_unique` (`organization_id`,`sku`);

--
-- Chỉ mục cho bảng `registrations`
--
ALTER TABLE `registrations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `registrations_facility_id_foreign` (`facility_id`);

--
-- Chỉ mục cho bảng `retention_logs`
--
ALTER TABLE `retention_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `retention_logs_retention_policy_id_foreign` (`retention_policy_id`),
  ADD KEY `retention_logs_data_type_index` (`data_type`),
  ADD KEY `retention_logs_executed_at_index` (`executed_at`),
  ADD KEY `retention_logs_organization_id_index` (`organization_id`),
  ADD KEY `idx_retention_logs_org_status_executed` (`organization_id`,`status`,`executed_at`),
  ADD KEY `idx_retention_logs_org_created` (`organization_id`,`created_at`);

--
-- Chỉ mục cho bảng `retention_policies`
--
ALTER TABLE `retention_policies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `retention_policies_policy_name_unique` (`policy_name`),
  ADD KEY `retention_policies_data_type_index` (`data_type`),
  ADD KEY `retention_policies_is_active_index` (`is_active`),
  ADD KEY `retention_policies_organization_id_index` (`organization_id`),
  ADD KEY `idx_retention_policies_org_active_type` (`organization_id`,`is_active`,`data_type`),
  ADD KEY `idx_retention_policies_org_updated` (`organization_id`,`updated_at`);

--
-- Chỉ mục cho bảng `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Chỉ mục cho bảng `signature_delegations`
--
ALTER TABLE `signature_delegations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `signature_delegations_delegator_user_id_index` (`delegator_user_id`),
  ADD KEY `signature_delegations_delegatee_user_id_index` (`delegatee_user_id`),
  ADD KEY `signature_delegations_is_active_index` (`is_active`),
  ADD KEY `signature_delegations_valid_until_index` (`valid_until`);

--
-- Chỉ mục cho bảng `signature_performance_metrics`
--
ALTER TABLE `signature_performance_metrics`
  ADD PRIMARY KEY (`id`),
  ADD KEY `signature_performance_metrics_e_signature_id_index` (`e_signature_id`),
  ADD KEY `signature_performance_metrics_created_at_index` (`created_at`);

--
-- Chỉ mục cho bảng `signature_record_types`
--
ALTER TABLE `signature_record_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `signature_record_types_record_type_unique` (`record_type`),
  ADD KEY `signature_record_types_is_active_index` (`is_active`),
  ADD KEY `signature_record_types_record_type_index` (`record_type`);

--
-- Chỉ mục cho bảng `signature_revocations`
--
ALTER TABLE `signature_revocations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `signature_revocations_signature_id_index` (`signature_id`),
  ADD KEY `signature_revocations_revoked_by_user_id_index` (`revoked_by_user_id`),
  ADD KEY `signature_revocations_revoked_at_index` (`revoked_at`),
  ADD KEY `signature_revocations_revocation_category_index` (`revocation_category`);

--
-- Chỉ mục cho bảng `signature_templates`
--
ALTER TABLE `signature_templates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `signature_templates_organization_id_foreign` (`organization_id`),
  ADD KEY `signature_templates_user_id_organization_id_index` (`user_id`,`organization_id`),
  ADD KEY `signature_templates_record_type_category_index` (`record_type`,`category`),
  ADD KEY `signature_templates_is_default_index` (`is_default`);

--
-- Chỉ mục cho bảng `signature_verifications`
--
ALTER TABLE `signature_verifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `signature_verifications_signature_id_index` (`signature_id`),
  ADD KEY `signature_verifications_verified_by_user_id_index` (`verified_by_user_id`),
  ADD KEY `signature_verifications_verification_status_index` (`verification_status`),
  ADD KEY `signature_verifications_verification_type_index` (`verification_type`),
  ADD KEY `signature_verifications_created_at_index` (`created_at`);

--
-- Chỉ mục cho bảng `traceability_analytics`
--
ALTER TABLE `traceability_analytics`
  ADD PRIMARY KEY (`id`),
  ADD KEY `traceability_analytics_user_id_foreign` (`user_id`),
  ADD KEY `traceability_analytics_trace_record_id_created_at_index` (`trace_record_id`,`created_at`),
  ADD KEY `traceability_analytics_query_type_created_at_index` (`query_type`,`created_at`),
  ADD KEY `traceability_analytics_organization_id_created_at_index` (`organization_id`,`created_at`),
  ADD KEY `traceability_analytics_ip_address_index` (`ip_address`);

--
-- Chỉ mục cho bảng `trace_records`
--
ALTER TABLE `trace_records`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `trace_records_tlc_unique` (`tlc`),
  ADD KEY `trace_records_product_id_foreign` (`product_id`),
  ADD KEY `trace_records_location_id_foreign` (`location_id`),
  ADD KEY `trace_records_tlc_index` (`tlc`),
  ADD KEY `trace_records_lot_code_index` (`lot_code`),
  ADD KEY `trace_records_status_index` (`status`),
  ADD KEY `trace_records_materialized_path_index` (`materialized_path`),
  ADD KEY `trace_records_organization_id_index` (`organization_id`),
  ADD KEY `idx_trace_records_org_created` (`organization_id`,`created_at`);

--
-- Chỉ mục cho bảng `trace_relationships`
--
ALTER TABLE `trace_relationships`
  ADD PRIMARY KEY (`id`),
  ADD KEY `trace_relationships_child_id_foreign` (`child_id`),
  ADD KEY `trace_relationships_parent_id_child_id_index` (`parent_id`,`child_id`),
  ADD KEY `trace_relationships_relationship_type_index` (`relationship_type`),
  ADD KEY `trace_relationships_cte_event_id_index` (`cte_event_id`),
  ADD KEY `trace_relationships_organization_id_index` (`organization_id`);

--
-- Chỉ mục cho bảng `transformation_items`
--
ALTER TABLE `transformation_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transformation_items_transformation_event_id_index` (`transformation_event_id`),
  ADD KEY `transformation_items_input_trace_record_id_index` (`input_trace_record_id`);

--
-- Chỉ mục cho bảng `two_fa_logs`
--
ALTER TABLE `two_fa_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `two_fa_logs_user_id_index` (`user_id`),
  ADD KEY `two_fa_logs_attempted_at_index` (`attempted_at`),
  ADD KEY `two_fa_logs_success_index` (`success`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_username_unique` (`username`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD UNIQUE KEY `users_email_token_unique` (`email_token`),
  ADD UNIQUE KEY `users_certificate_id_unique` (`certificate_id`),
  ADD KEY `users_email_index` (`email`),
  ADD KEY `users_role_index` (`role`),
  ADD KEY `users_organization_id_index` (`organization_id`),
  ADD KEY `users_preferred_language_index` (`preferred_language`),
  ADD KEY `users_certificate_id_index` (`certificate_id`),
  ADD KEY `users_package_changed_by_foreign` (`package_changed_by`),
  ADD KEY `users_last_activity_at_index` (`last_activity_at`);

--
-- Chỉ mục cho bảng `user_feature_overrides`
--
ALTER TABLE `user_feature_overrides`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_feature_overrides_user_id_feature_name_unique` (`user_id`,`feature_name`),
  ADD KEY `user_feature_overrides_granted_by_user_id_foreign` (`granted_by_user_id`),
  ADD KEY `user_feature_overrides_user_id_feature_name_index` (`user_id`,`feature_name`),
  ADD KEY `user_feature_overrides_organization_id_feature_name_index` (`organization_id`,`feature_name`);

--
-- Chỉ mục cho bảng `webhook_logs`
--
ALTER TABLE `webhook_logs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `webhook_logs_gateway_event_id_unique` (`gateway`,`event_id`),
  ADD KEY `webhook_logs_event_type_index` (`event_type`),
  ADD KEY `webhook_logs_is_successful_index` (`is_successful`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `alerts`
--
ALTER TABLE `alerts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `archival_audit_logs`
--
ALTER TABLE `archival_audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `archival_cte_events`
--
ALTER TABLE `archival_cte_events`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `archival_documents`
--
ALTER TABLE `archival_documents`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `archival_document_versions`
--
ALTER TABLE `archival_document_versions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `archival_e_signatures`
--
ALTER TABLE `archival_e_signatures`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `archival_logs`
--
ALTER TABLE `archival_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `archival_trace_records`
--
ALTER TABLE `archival_trace_records`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `archival_trace_relationships`
--
ALTER TABLE `archival_trace_relationships`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `audit_logs_details`
--
ALTER TABLE `audit_logs_details`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `batch_signature_operations`
--
ALTER TABLE `batch_signature_operations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `compliance_reports`
--
ALTER TABLE `compliance_reports`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `cte_events`
--
ALTER TABLE `cte_events`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `digital_certificates`
--
ALTER TABLE `digital_certificates`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `documents`
--
ALTER TABLE `documents`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `document_approvals`
--
ALTER TABLE `document_approvals`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `document_versions`
--
ALTER TABLE `document_versions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `email_notifications`
--
ALTER TABLE `email_notifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `error_logs`
--
ALTER TABLE `error_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `export_logs`
--
ALTER TABLE `export_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `e_signatures`
--
ALTER TABLE `e_signatures`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `facilities`
--
ALTER TABLE `facilities`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `fda_accounts`
--
ALTER TABLE `fda_accounts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `fda_account_alerts`
--
ALTER TABLE `fda_account_alerts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `fda_alerts`
--
ALTER TABLE `fda_alerts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `fda_audit_logs`
--
ALTER TABLE `fda_audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `fda_facilities`
--
ALTER TABLE `fda_facilities`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `fda_registrations`
--
ALTER TABLE `fda_registrations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `fda_registration_audits`
--
ALTER TABLE `fda_registration_audits`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `fda_sync_logs`
--
ALTER TABLE `fda_sync_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `fda_user_registrations`
--
ALTER TABLE `fda_user_registrations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `fsvp_hazard_analyses`
--
ALTER TABLE `fsvp_hazard_analyses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `fsvp_products`
--
ALTER TABLE `fsvp_products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `fsvp_suppliers`
--
ALTER TABLE `fsvp_suppliers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `fsvp_verification_activities`
--
ALTER TABLE `fsvp_verification_activities`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `leads`
--
ALTER TABLE `leads`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `locations`
--
ALTER TABLE `locations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=187;

--
-- AUTO_INCREMENT cho bảng `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `notification_audit_logs`
--
ALTER TABLE `notification_audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `notification_preferences`
--
ALTER TABLE `notification_preferences`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `notification_templates`
--
ALTER TABLE `notification_templates`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `organizations`
--
ALTER TABLE `organizations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `organization_quotas`
--
ALTER TABLE `organization_quotas`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `partners`
--
ALTER TABLE `partners`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `payment_orders`
--
ALTER TABLE `payment_orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `pa_shipments`
--
ALTER TABLE `pa_shipments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `pricing`
--
ALTER TABLE `pricing`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `prior_notices`
--
ALTER TABLE `prior_notices`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `prior_notice_items`
--
ALTER TABLE `prior_notice_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `registrations`
--
ALTER TABLE `registrations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `retention_logs`
--
ALTER TABLE `retention_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `retention_policies`
--
ALTER TABLE `retention_policies`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `signature_delegations`
--
ALTER TABLE `signature_delegations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `signature_performance_metrics`
--
ALTER TABLE `signature_performance_metrics`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `signature_record_types`
--
ALTER TABLE `signature_record_types`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `signature_revocations`
--
ALTER TABLE `signature_revocations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `signature_templates`
--
ALTER TABLE `signature_templates`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `signature_verifications`
--
ALTER TABLE `signature_verifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `traceability_analytics`
--
ALTER TABLE `traceability_analytics`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `trace_records`
--
ALTER TABLE `trace_records`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `trace_relationships`
--
ALTER TABLE `trace_relationships`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `transformation_items`
--
ALTER TABLE `transformation_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `two_fa_logs`
--
ALTER TABLE `two_fa_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `user_feature_overrides`
--
ALTER TABLE `user_feature_overrides`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `webhook_logs`
--
ALTER TABLE `webhook_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `alerts`
--
ALTER TABLE `alerts`
  ADD CONSTRAINT `alerts_facility_id_foreign` FOREIGN KEY (`facility_id`) REFERENCES `facilities` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `alerts_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `archival_logs`
--
ALTER TABLE `archival_logs`
  ADD CONSTRAINT `archival_logs_executed_by_foreign` FOREIGN KEY (`executed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `archival_logs_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `audit_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `audit_logs_details`
--
ALTER TABLE `audit_logs_details`
  ADD CONSTRAINT `audit_logs_details_audit_log_id_foreign` FOREIGN KEY (`audit_log_id`) REFERENCES `audit_logs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `audit_logs_details_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `batch_signature_operations`
--
ALTER TABLE `batch_signature_operations`
  ADD CONSTRAINT `batch_signature_operations_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `batch_signature_operations_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `compliance_reports`
--
ALTER TABLE `compliance_reports`
  ADD CONSTRAINT `compliance_reports_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `cte_events`
--
ALTER TABLE `cte_events`
  ADD CONSTRAINT `cte_events_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `cte_events_location_id_foreign` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`),
  ADD CONSTRAINT `cte_events_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cte_events_partner_id_foreign` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `cte_events_signature_id_foreign` FOREIGN KEY (`signature_id`) REFERENCES `e_signatures` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `cte_events_trace_record_id_foreign` FOREIGN KEY (`trace_record_id`) REFERENCES `trace_records` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cte_events_voided_by_foreign` FOREIGN KEY (`voided_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `cte_events_voids_event_id_foreign` FOREIGN KEY (`voids_event_id`) REFERENCES `cte_events` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `digital_certificates`
--
ALTER TABLE `digital_certificates`
  ADD CONSTRAINT `digital_certificates_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `documents_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `documents_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `documents_uploaded_by_foreign` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `document_approvals`
--
ALTER TABLE `document_approvals`
  ADD CONSTRAINT `document_approvals_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `document_approvals_document_id_foreign` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `document_approvals_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `document_versions`
--
ALTER TABLE `document_versions`
  ADD CONSTRAINT `document_versions_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `document_versions_document_id_foreign` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `document_versions_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_doc_versions_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `email_notifications`
--
ALTER TABLE `email_notifications`
  ADD CONSTRAINT `email_notifications_facility_id_foreign` FOREIGN KEY (`facility_id`) REFERENCES `fda_facilities` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `email_notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `error_logs`
--
ALTER TABLE `error_logs`
  ADD CONSTRAINT `error_logs_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `error_logs_resolved_by_foreign` FOREIGN KEY (`resolved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `error_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `export_logs`
--
ALTER TABLE `export_logs`
  ADD CONSTRAINT `export_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `e_signatures`
--
ALTER TABLE `e_signatures`
  ADD CONSTRAINT `e_signatures_delegated_by_user_id_foreign` FOREIGN KEY (`delegated_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `e_signatures_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `e_signatures_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `facilities`
--
ALTER TABLE `facilities`
  ADD CONSTRAINT `facilities_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `fda_accounts`
--
ALTER TABLE `fda_accounts`
  ADD CONSTRAINT `fda_accounts_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fda_accounts_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fda_accounts_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `fda_account_alerts`
--
ALTER TABLE `fda_account_alerts`
  ADD CONSTRAINT `fda_account_alerts_fda_account_id_foreign` FOREIGN KEY (`fda_account_id`) REFERENCES `fda_accounts` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `fda_alerts`
--
ALTER TABLE `fda_alerts`
  ADD CONSTRAINT `fda_alerts_assigned_to_foreign` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fda_alerts_facility_id_foreign` FOREIGN KEY (`facility_id`) REFERENCES `fda_facilities` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `fda_audit_logs`
--
ALTER TABLE `fda_audit_logs`
  ADD CONSTRAINT `fda_audit_logs_facility_id_foreign` FOREIGN KEY (`facility_id`) REFERENCES `fda_facilities` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `fda_facilities`
--
ALTER TABLE `fda_facilities`
  ADD CONSTRAINT `fda_facilities_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `fda_registrations`
--
ALTER TABLE `fda_registrations`
  ADD CONSTRAINT `fda_registrations_facility_id_foreign` FOREIGN KEY (`facility_id`) REFERENCES `fda_facilities` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fda_registrations_submitted_by_foreign` FOREIGN KEY (`submitted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `fda_registration_audits`
--
ALTER TABLE `fda_registration_audits`
  ADD CONSTRAINT `fda_registration_audits_facility_id_foreign` FOREIGN KEY (`facility_id`) REFERENCES `facilities` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `fda_sync_logs`
--
ALTER TABLE `fda_sync_logs`
  ADD CONSTRAINT `fda_sync_logs_facility_id_foreign` FOREIGN KEY (`facility_id`) REFERENCES `facilities` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `fda_user_registrations`
--
ALTER TABLE `fda_user_registrations`
  ADD CONSTRAINT `fda_user_registrations_fda_account_id_foreign` FOREIGN KEY (`fda_account_id`) REFERENCES `fda_accounts` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fda_user_registrations_processed_by_foreign` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fda_user_registrations_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `fsvp_hazard_analyses`
--
ALTER TABLE `fsvp_hazard_analyses`
  ADD CONSTRAINT `fsvp_hazard_analyses_analyzed_by_foreign` FOREIGN KEY (`analyzed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fsvp_hazard_analyses_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `fsvp_products` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `fsvp_products`
--
ALTER TABLE `fsvp_products`
  ADD CONSTRAINT `fsvp_products_supplier_id_foreign` FOREIGN KEY (`supplier_id`) REFERENCES `fsvp_suppliers` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `fsvp_suppliers`
--
ALTER TABLE `fsvp_suppliers`
  ADD CONSTRAINT `fsvp_suppliers_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `fsvp_verification_activities`
--
ALTER TABLE `fsvp_verification_activities`
  ADD CONSTRAINT `fsvp_verification_activities_conducted_by_foreign` FOREIGN KEY (`conducted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fsvp_verification_activities_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `fsvp_products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fsvp_verification_activities_supplier_id_foreign` FOREIGN KEY (`supplier_id`) REFERENCES `fsvp_suppliers` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `leads`
--
ALTER TABLE `leads`
  ADD CONSTRAINT `leads_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `locations`
--
ALTER TABLE `locations`
  ADD CONSTRAINT `locations_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `notification_audit_logs`
--
ALTER TABLE `notification_audit_logs`
  ADD CONSTRAINT `notification_audit_logs_notification_id_foreign` FOREIGN KEY (`notification_id`) REFERENCES `notifications` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `notification_audit_logs_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notification_audit_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `notification_templates`
--
ALTER TABLE `notification_templates`
  ADD CONSTRAINT `notification_templates_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `organization_quotas`
--
ALTER TABLE `organization_quotas`
  ADD CONSTRAINT `organization_quotas_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `partners`
--
ALTER TABLE `partners`
  ADD CONSTRAINT `partners_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `payment_orders`
--
ALTER TABLE `payment_orders`
  ADD CONSTRAINT `payment_orders_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `pa_shipments`
--
ALTER TABLE `pa_shipments`
  ADD CONSTRAINT `pa_shipments_prior_notice_id_foreign` FOREIGN KEY (`prior_notice_id`) REFERENCES `prior_notices` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `prior_notices`
--
ALTER TABLE `prior_notices`
  ADD CONSTRAINT `prior_notices_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `prior_notices_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `prior_notice_items`
--
ALTER TABLE `prior_notice_items`
  ADD CONSTRAINT `prior_notice_items_prior_notice_id_foreign` FOREIGN KEY (`prior_notice_id`) REFERENCES `prior_notices` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `registrations`
--
ALTER TABLE `registrations`
  ADD CONSTRAINT `registrations_facility_id_foreign` FOREIGN KEY (`facility_id`) REFERENCES `facilities` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `retention_logs`
--
ALTER TABLE `retention_logs`
  ADD CONSTRAINT `retention_logs_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `retention_logs_retention_policy_id_foreign` FOREIGN KEY (`retention_policy_id`) REFERENCES `retention_policies` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `retention_policies`
--
ALTER TABLE `retention_policies`
  ADD CONSTRAINT `retention_policies_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `signature_delegations`
--
ALTER TABLE `signature_delegations`
  ADD CONSTRAINT `signature_delegations_delegatee_user_id_foreign` FOREIGN KEY (`delegatee_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `signature_delegations_delegator_user_id_foreign` FOREIGN KEY (`delegator_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `signature_performance_metrics`
--
ALTER TABLE `signature_performance_metrics`
  ADD CONSTRAINT `signature_performance_metrics_e_signature_id_foreign` FOREIGN KEY (`e_signature_id`) REFERENCES `e_signatures` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `signature_revocations`
--
ALTER TABLE `signature_revocations`
  ADD CONSTRAINT `signature_revocations_revoked_by_user_id_foreign` FOREIGN KEY (`revoked_by_user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `signature_revocations_signature_id_foreign` FOREIGN KEY (`signature_id`) REFERENCES `e_signatures` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `signature_templates`
--
ALTER TABLE `signature_templates`
  ADD CONSTRAINT `signature_templates_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `signature_templates_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `signature_verifications`
--
ALTER TABLE `signature_verifications`
  ADD CONSTRAINT `signature_verifications_signature_id_foreign` FOREIGN KEY (`signature_id`) REFERENCES `e_signatures` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `signature_verifications_verified_by_user_id_foreign` FOREIGN KEY (`verified_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `traceability_analytics`
--
ALTER TABLE `traceability_analytics`
  ADD CONSTRAINT `traceability_analytics_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `traceability_analytics_trace_record_id_foreign` FOREIGN KEY (`trace_record_id`) REFERENCES `trace_records` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `traceability_analytics_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `trace_records`
--
ALTER TABLE `trace_records`
  ADD CONSTRAINT `trace_records_location_id_foreign` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trace_records_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trace_records_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `trace_relationships`
--
ALTER TABLE `trace_relationships`
  ADD CONSTRAINT `trace_relationships_child_id_foreign` FOREIGN KEY (`child_id`) REFERENCES `trace_records` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trace_relationships_cte_event_id_foreign` FOREIGN KEY (`cte_event_id`) REFERENCES `cte_events` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trace_relationships_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trace_relationships_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `trace_records` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `transformation_items`
--
ALTER TABLE `transformation_items`
  ADD CONSTRAINT `transformation_items_input_trace_record_id_foreign` FOREIGN KEY (`input_trace_record_id`) REFERENCES `trace_records` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transformation_items_transformation_event_id_foreign` FOREIGN KEY (`transformation_event_id`) REFERENCES `cte_events` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `two_fa_logs`
--
ALTER TABLE `two_fa_logs`
  ADD CONSTRAINT `two_fa_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `users_package_changed_by_foreign` FOREIGN KEY (`package_changed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `user_feature_overrides`
--
ALTER TABLE `user_feature_overrides`
  ADD CONSTRAINT `user_feature_overrides_granted_by_user_id_foreign` FOREIGN KEY (`granted_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `user_feature_overrides_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_feature_overrides_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
--
-- Cơ sở dữ liệu: `fsma_trace_app`
--
CREATE DATABASE IF NOT EXISTS `fsma_trace_app` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `fsma_trace_app`;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `archival_audit_logs`
--

CREATE TABLE `archival_audit_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `original_id` bigint(20) UNSIGNED NOT NULL COMMENT 'Original ID from audit_logs table',
  `event_type` varchar(50) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `auditable_type` varchar(255) DEFAULT NULL,
  `auditable_id` bigint(20) UNSIGNED DEFAULT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `archived_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'When this record was moved to archival',
  `archived_by` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'User who triggered archival',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `archival_cte_events`
--

CREATE TABLE `archival_cte_events` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `original_id` bigint(20) UNSIGNED NOT NULL COMMENT 'Original ID from cte_events table',
  `event_type` enum('receiving','transformation','shipping') NOT NULL,
  `trace_record_id` bigint(20) UNSIGNED NOT NULL,
  `event_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `location_id` bigint(20) UNSIGNED NOT NULL,
  `partner_id` bigint(20) UNSIGNED DEFAULT NULL,
  `input_tlcs` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'For transformation events' CHECK (json_valid(`input_tlcs`)),
  `reference_doc` varchar(100) DEFAULT NULL COMMENT 'PO, Invoice, BOL number',
  `notes` text DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `archived_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'When this record was moved to archival',
  `archived_by` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'User who triggered archival',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `archival_logs`
--

CREATE TABLE `archival_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `data_type` varchar(50) NOT NULL,
  `strategy` enum('database','s3_glacier','local') NOT NULL DEFAULT 'database',
  `records_archived` int(11) NOT NULL DEFAULT 0,
  `records_verified` int(11) NOT NULL DEFAULT 0,
  `records_deleted_from_hot` int(11) NOT NULL DEFAULT 0,
  `archival_location` text DEFAULT NULL,
  `executed_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `executed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `status` enum('success','failed','partial') NOT NULL DEFAULT 'success',
  `error_message` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `archival_trace_records`
--

CREATE TABLE `archival_trace_records` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `original_id` bigint(20) UNSIGNED NOT NULL COMMENT 'Original ID from trace_records table',
  `tlc` varchar(255) NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `available_quantity` decimal(10,2) NOT NULL DEFAULT 0.00,
  `consumed_quantity` decimal(10,2) NOT NULL DEFAULT 0.00,
  `unit` varchar(20) NOT NULL DEFAULT 'kg',
  `lot_code` varchar(255) DEFAULT NULL,
  `harvest_date` date DEFAULT NULL,
  `location_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('active','consumed','shipped','destroyed','voided') NOT NULL DEFAULT 'active',
  `path` text DEFAULT NULL,
  `organization_id` bigint(20) UNSIGNED DEFAULT NULL,
  `materialized_path` varchar(500) DEFAULT NULL,
  `archived_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'When this record was moved to archival',
  `archived_by` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'User who triggered archival',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `archival_trace_relationships`
--

CREATE TABLE `archival_trace_relationships` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `original_id` bigint(20) UNSIGNED NOT NULL COMMENT 'Original ID from trace_relationships table',
  `parent_id` bigint(20) UNSIGNED NOT NULL,
  `child_id` bigint(20) UNSIGNED DEFAULT NULL,
  `relationship_type` enum('INPUT','OUTPUT','VOID','transformation','aggregation','disaggregation') NOT NULL,
  `cte_event_id` bigint(20) UNSIGNED DEFAULT NULL,
  `archived_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'When this record was moved to archival',
  `archived_by` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'User who triggered archival',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `table_name` varchar(50) DEFAULT NULL,
  `record_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `integrity_hash` varchar(64) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `table_name`, `record_id`, `created_at`, `integrity_hash`) VALUES
(1, NULL, 'insert', 'products', 1, '2025-10-23 05:12:55', NULL),
(2, NULL, 'insert', 'products', 2, '2025-10-23 05:12:55', NULL),
(3, NULL, 'insert', 'products', 3, '2025-10-23 05:12:55', NULL),
(4, 1, 'create', 'cte_events', 1, '2025-10-23 05:22:59', 'bbd9504b61acb6012f7d7895321d3c39a287a392a3988815efc713b51c7ed765'),
(5, 1, 'POST cte/receiving', 'cte_events', NULL, '2025-10-23 05:22:59', 'fbbc104515b7851c256fc7ffaf065061c11c807e15dbb56fee1408d013ca2971'),
(6, 1, 'void', 'cte_events', 1, '2025-10-23 05:23:27', '5b5407ccd62e1203cd611cedb30fbb843d3d335a9482ef0a02f559ae6fcd5e3f'),
(7, 1, 'POST cte/receiving/1/void', 'cte_events', NULL, '2025-10-23 05:23:27', '5f8c047b0ed7d4a280f18bb1381e6692cb28af5bb119a15d2ad9495508d40ca7'),
(8, 1, 'POST vnpay/create', 'payment_orders', NULL, '2025-10-23 09:59:08', '1c2da91c443cd49dd41f11e35123b4cfbab1e88b8f555bf82089b6726dd31494'),
(9, 1, 'POST vnpay/create', 'payment_orders', NULL, '2025-10-23 11:21:33', '09e17a3f3f53d727b87569b9bd30647b8d49e98a34d02dd12d27db9eb5eed6be'),
(10, 1, 'POST admin/users', 'users', NULL, '2025-10-23 13:26:08', 'd7f34958a907bcdbc9d0d68eed8d8c7819f84ab3567a34ff497fcd5493d471a0'),
(11, 1, 'POST admin/users', 'users', NULL, '2025-10-23 13:26:21', 'fadba290450691a10f7b653bf8c3dcb5e95a66d9c9df889fc6350eb133312a7c'),
(12, 4, 'POST vnpay/create', 'payment_orders', NULL, '2025-10-23 13:36:08', 'fe4ca21c5b4b1a31d1c1322a880457375a33dd8b011df28959db42a6afb57387'),
(13, 1, 'PUT admin/packages/free', 'packages', NULL, '2025-10-23 14:42:36', '427c2f5f75292b9cc187d4a43b2db3540bb31b1481e99b4fcc17e94eb9bd5958'),
(14, 1, 'POST vnpay/create', 'payment_orders', NULL, '2025-10-23 15:55:42', 'b878837b42ce7e3c9277ff2abf55ca5a668a89b83ca069952b51203db9b04838'),
(15, 1, 'PATCH admin/users/4/update-package', 'users', NULL, '2025-10-23 15:59:07', '9f8ecd868f842847b88a8b051403abf06a868c26c196825e592e66a0acdfb092'),
(16, 1, 'PATCH admin/users/4/update-package', 'users', NULL, '2025-10-23 17:33:46', '4c948e0bb65a8bf0007bac3cc356e6ec9c9678907ff4c8f8a0ef94ea14203eea'),
(17, 1, 'PATCH admin/users/4/update-package', 'users', NULL, '2025-10-24 00:53:22', '29ca7413bb5951bd4988ae55981f208bc1d5eaf1063910207b947d809af4877b'),
(18, 4, 'POST vnpay/create', 'payment_orders', NULL, '2025-10-24 03:23:07', 'f9e78be0ff897e81ccbec20f9632ba2cd2c4f33ba05032133b0f1971eb101ff9'),
(19, 1, 'PATCH admin/users/4/update-package', 'users', NULL, '2025-10-24 03:30:12', '6d74d4925191ed3e5e39da60b3b93b0e770cd20c534a59c03638bf759ba9abef'),
(20, 1, 'PATCH admin/users/4/update-package', 'users', NULL, '2025-10-24 04:11:58', '35e5635cd0ea1860606e82edd7e9030ed1b6547c47bbb871b69b8efdcb27d16a'),
(21, 4, 'POST vnpay/create', 'payment_orders', NULL, '2025-10-24 05:46:48', '712bb2d44ced5b92b578b97c43a3def37926289916f74521b632e02d69069d43'),
(22, 4, 'POST admin/users', 'users', NULL, '2025-10-24 05:49:00', '20e0d89f5e397e4021676ffba49de3bfb66357b8c1b2da0731a6607bd9317f41'),
(23, 4, 'POST admin/users', 'users', NULL, '2025-10-24 05:49:11', '8af6dd415c3041ce0e217857c6075febcd15d1a8c4f2ed9ed835da61b890796f'),
(24, 4, 'POST admin/users', 'users', NULL, '2025-10-24 05:49:24', '1c19a4de23b0bdad737c8665fa3c6e579b5c1a50beefa7c1f2a8ce671540f840'),
(25, 5, 'PUT admin/users/5', 'users', NULL, '2025-10-24 05:49:58', '42f4fcd67c0096cd8c5687e6b8b36a9ec83250fa32784cb58ddda0adf4654ec1'),
(26, 5, 'PUT admin/users/5', 'users', NULL, '2025-10-24 05:50:55', 'f14d7ded50a27843d6c84afeaf0dcd68b6c1cd7b5805f89172d850a6ecd0ced3'),
(27, 5, 'PUT admin/users/5', 'users', NULL, '2025-10-24 05:51:16', '4211896d40c81a737dc017a35acb36bd89bb8dfe571004537a81f69b20168a24'),
(28, 4, 'PUT admin/users/5', 'users', NULL, '2025-10-24 05:52:41', '87eca62924e1b1f95332ac8edbc76b0d2774ab4dbf157363abc13c774b0cff09');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `audit_logs_details`
--

CREATE TABLE `audit_logs_details` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `audit_log_id` bigint(20) UNSIGNED NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `audit_logs_details`
--

INSERT INTO `audit_logs_details` (`id`, `audit_log_id`, `ip_address`, `user_agent`, `old_values`, `new_values`) VALUES
(1, 4, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', NULL, '{\"tlc\":\"HH01\",\"quantity\":\"1000\",\"unit\":\"kg\"}'),
(2, 5, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', NULL, '{\"_token\":\"s5************************************4B\",\"tlc\":\"HH01\",\"product_lot_code\":\"LOT-2025\",\"product_id\":\"3\",\"product_description\":null,\"quantity_received\":\"1000\",\"unit\":\"kg\",\"location_id\":\"1\",\"receiving_location_gln\":\"0614141000001\",\"receiving_location_name\":\"Main Warehouse\",\"harvest_location_gln\":null,\"harvest_location_name\":null,\"partner_id\":\"3\",\"business_name\":\"Food Distributor Inc.\",\"business_gln\":\"0614141000030\",\"business_address\":null,\"harvest_date\":\"2025-10-02\",\"pack_date\":\"2025-10-15\",\"cooling_date\":null,\"event_date\":\"2025-10-23T12:21\",\"reference_doc\":\"Hoa don\",\"reference_doc_type\":\"Invoice\",\"fda_compliance_notes\":null,\"notes\":null,\"signature_password\":\"ad****23\",\"signature_reason\":\"L\\u01b0u kho\"}'),
(3, 6, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', NULL, '{\"execution_time_ms\":14.05,\"signature_id\":2,\"reason\":\"data_entry_error\"}'),
(4, 7, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', NULL, '{\"_token\":\"s5************************************4B\",\"event_type\":\"receiving\",\"organization_id\":\"1\",\"void_reason\":\"data_entry_error\",\"void_notes\":\"hjkhsd \\u00e1\",\"signature_password\":\"ad****23\"}'),
(5, 8, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', NULL, '{\"_token\":\"Qf************************************e1\",\"package_id\":\"basic\",\"billing_period\":\"monthly\"}'),
(6, 9, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', NULL, '{\"_token\":\"4b************************************Qf\",\"package_id\":\"basic\",\"billing_period\":\"monthly\"}'),
(7, 10, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', NULL, '{\"_token\":\"Mi************************************5X\",\"username\":\"hocluongvan\",\"full_name\":\"Hoc Luong Van\",\"email\":\"anhnguyen94@gmail.com\",\"role\":\"manager\",\"package_id\":\"basic\",\"password\":\"An*****88\",\"password_confirmation\":\"An****88\",\"is_active\":\"1\"}'),
(8, 11, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', NULL, '{\"_token\":\"Mi************************************5X\",\"username\":\"hocluongvan\",\"full_name\":\"Hoc Luong Van\",\"email\":\"anhnguyen94@gmail.com\",\"role\":\"manager\",\"package_id\":\"basic\",\"password\":\"An*****88\",\"password_confirmation\":\"An*****88\",\"is_active\":\"1\"}'),
(9, 12, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', NULL, '{\"_token\":\"PY************************************fw\",\"package_id\":\"premium\",\"billing_period\":\"monthly\"}'),
(10, 13, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', NULL, '{\"_token\":\"ta************************************ge\",\"_method\":\"PUT\",\"name\":\"Free Tier\",\"description\":\"Perfect for getting started with FSMA 204 compliance\",\"max_cte_records_monthly\":\"100\",\"max_documents\":\"10\",\"max_users\":\"1\",\"monthly_list_price\":null,\"monthly_selling_price\":\"0.00\",\"yearly_list_price\":null,\"yearly_selling_price\":\"0.00\",\"promotion_text\":null,\"features_text\":\"50 CTE records\\/month (permanent)\\r\\n1 document\\r\\n1 user\\r\\nBasic traceability\\r\\nCommunity support\",\"is_visible\":\"1\",\"sort_order\":\"1\"}'),
(11, 14, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', NULL, '{\"_token\":\"XE************************************Kp\",\"package_id\":\"basic\",\"billing_period\":\"monthly\"}'),
(12, 15, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', NULL, '{\"_token\":\"e9************************************1O\",\"_method\":\"PATCH\",\"package_id\":\"premium\"}'),
(13, 16, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', NULL, '{\"_token\":\"GM************************************fq\",\"_method\":\"PATCH\",\"package_id\":\"free\"}'),
(14, 17, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', NULL, '{\"_token\":\"j1************************************BC\",\"_method\":\"PATCH\",\"package_id\":\"basic\"}'),
(15, 18, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', NULL, '{\"_token\":\"EQ************************************3D\",\"package_id\":\"premium\",\"billing_period\":\"monthly\"}'),
(16, 19, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', NULL, '{\"_token\":\"2s************************************W9\",\"_method\":\"PATCH\",\"package_id\":\"premium\"}'),
(17, 20, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', NULL, '{\"_token\":\"IO************************************W4\",\"_method\":\"PATCH\",\"package_id\":\"enterprise\"}'),
(18, 21, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', NULL, '{\"_token\":\"Cp************************************Or\",\"package_id\":\"basic\",\"billing_period\":\"monthly\"}'),
(19, 22, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', NULL, '{\"_token\":\"Cp************************************Or\",\"username\":\"hocluongvan\",\"full_name\":\"Hoc Luong Van\",\"email\":\"hocluongvan88@gmail.com\",\"role\":\"manager\",\"password\":\"An*****88\",\"password_confirmation\":\"An*****88\",\"is_active\":\"1\"}'),
(20, 23, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', NULL, '{\"_token\":\"Cp************************************Or\",\"username\":\"hocluongvan20\",\"full_name\":\"Hoc Luong Van\",\"email\":\"hocluongvan88@gmail.com\",\"role\":\"manager\",\"password\":\"An****88\",\"password_confirmation\":\"An****77\",\"is_active\":\"1\"}'),
(21, 24, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', NULL, '{\"_token\":\"Cp************************************Or\",\"username\":\"hocluongvan20\",\"full_name\":\"Hoc Luong Van\",\"email\":\"hocluongvan88@gmail.com\",\"role\":\"manager\",\"password\":\"An*****88\",\"password_confirmation\":\"An*****88\",\"is_active\":\"1\"}'),
(22, 25, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', NULL, '{\"_token\":\"dK************************************dL\",\"_method\":\"PUT\",\"username\":\"hocluongvan20\",\"full_name\":\"Hoc Luong Van\",\"email\":\"hocluongvan88@gmail.com\",\"role\":\"operator\",\"is_active\":\"1\"}'),
(23, 26, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', NULL, '{\"_token\":\"dK************************************dL\",\"_method\":\"PUT\",\"username\":\"hocluongvan20\",\"full_name\":\"Hoc Luong Van\",\"email\":\"hocluongvan88@gmail.com\",\"role\":\"operator\",\"is_active\":\"1\"}'),
(24, 27, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', NULL, '{\"_token\":\"dK************************************dL\",\"_method\":\"PUT\",\"username\":\"hocluongvan20\",\"full_name\":\"Hoc Luong Van\",\"email\":\"hocluongvan88@gmail.com\",\"role\":\"operator\",\"is_active\":\"1\"}'),
(25, 28, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', NULL, '{\"_token\":\"k4************************************3K\",\"_method\":\"PUT\",\"username\":\"hocluongvan20\",\"full_name\":\"Hoc Luong Van\",\"email\":\"hocluongvan88@gmail.com\",\"role\":\"operator\",\"is_active\":\"1\"}');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `batch_signature_operations`
--

CREATE TABLE `batch_signature_operations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `batch_operation_id` char(36) NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `operation_type` varchar(255) NOT NULL,
  `total_signatures` int(11) NOT NULL,
  `processed_count` int(11) NOT NULL DEFAULT 0,
  `success_count` int(11) NOT NULL DEFAULT 0,
  `failed_count` int(11) NOT NULL DEFAULT 0,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `reason` text DEFAULT NULL,
  `details` text DEFAULT NULL,
  `error_log` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`error_log`)),
  `ip_address` varchar(255) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('fsma_204_traceability_cache_locations_org_1', 'O:29:\"Illuminate\\Support\\Collection\":2:{s:8:\"\0*\0items\";a:3:{i:0;O:8:\"stdClass\":5:{s:2:\"id\";i:3;s:13:\"location_name\";s:17:\"Green Valley Farm\";s:3:\"gln\";N;s:13:\"location_type\";s:4:\"farm\";s:15:\"organization_id\";N;}i:1;O:8:\"stdClass\":5:{s:2:\"id\";i:1;s:13:\"location_name\";s:14:\"Main Warehouse\";s:3:\"gln\";s:13:\"0614141000001\";s:13:\"location_type\";s:9:\"warehouse\";s:15:\"organization_id\";N;}i:2;O:8:\"stdClass\":5:{s:2:\"id\";i:2;s:13:\"location_name\";s:19:\"Processing Facility\";s:3:\"gln\";s:13:\"0614141000002\";s:13:\"location_type\";s:10:\"processing\";s:15:\"organization_id\";N;}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}', 1761291352),
('fsma_204_traceability_cache_partners_org_1_type_supplier', 'O:29:\"Illuminate\\Support\\Collection\":2:{s:8:\"\0*\0items\";a:2:{i:0;O:8:\"stdClass\":5:{s:2:\"id\";i:3;s:12:\"partner_name\";s:21:\"Food Distributor Inc.\";s:12:\"partner_type\";s:4:\"both\";s:3:\"gln\";s:13:\"0614141000030\";s:15:\"organization_id\";N;}i:1;O:8:\"stdClass\":5:{s:2:\"id\";i:1;s:12:\"partner_name\";s:15:\"Fresh Farms Co.\";s:12:\"partner_type\";s:8:\"supplier\";s:3:\"gln\";s:13:\"0614141000010\";s:15:\"organization_id\";N;}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}', 1761291352),
('fsma_204_traceability_cache_products_org_1_ftl_0', 'O:29:\"Illuminate\\Support\\Collection\":2:{s:8:\"\0*\0items\";a:3:{i:0;O:8:\"stdClass\":7:{s:2:\"id\";i:3;s:3:\"sku\";s:7:\"STR-001\";s:12:\"product_name\";s:18:\"Fresh Strawberries\";s:6:\"is_ftl\";i:1;s:8:\"category\";s:7:\"Berries\";s:15:\"unit_of_measure\";s:2:\"kg\";s:15:\"organization_id\";N;}i:1;O:8:\"stdClass\":7:{s:2:\"id\";i:1;s:3:\"sku\";s:7:\"TOM-001\";s:12:\"product_name\";s:14:\"Fresh Tomatoes\";s:6:\"is_ftl\";i:1;s:8:\"category\";s:10:\"Vegetables\";s:15:\"unit_of_measure\";s:2:\"kg\";s:15:\"organization_id\";N;}i:2;O:8:\"stdClass\":7:{s:2:\"id\";i:2;s:3:\"sku\";s:7:\"LET-001\";s:12:\"product_name\";s:15:\"Romaine Lettuce\";s:6:\"is_ftl\";i:1;s:8:\"category\";s:12:\"Leafy Greens\";s:15:\"unit_of_measure\";s:2:\"kg\";s:15:\"organization_id\";N;}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}', 1761291352);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cte_events`
--

CREATE TABLE `cte_events` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `event_type` enum('receiving','transformation','shipping','VOID','ADJUSTMENT') NOT NULL,
  `status` enum('active','voided') NOT NULL DEFAULT 'active',
  `void_count` int(11) NOT NULL DEFAULT 0 COMMENT 'Number of times this event has been voided',
  `trace_record_id` bigint(20) UNSIGNED NOT NULL,
  `event_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `harvest_date` datetime DEFAULT NULL,
  `pack_date` datetime DEFAULT NULL,
  `cooling_date` timestamp NULL DEFAULT NULL COMMENT 'Initial cooling date for fresh produce (KDE #14)',
  `location_id` bigint(20) UNSIGNED NOT NULL,
  `partner_id` bigint(20) UNSIGNED DEFAULT NULL,
  `input_tlcs` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'For transformation events' CHECK (json_valid(`input_tlcs`)),
  `reference_doc` varchar(100) DEFAULT NULL COMMENT 'PO, Invoice, BOL number',
  `reference_doc_type` enum('PO','Invoice','BOL','AWB','Other') DEFAULT NULL COMMENT 'Type of reference document (KDE #17)',
  `product_description` varchar(255) DEFAULT NULL COMMENT 'Product name/description for FDA reporting',
  `quantity_received` decimal(12,2) DEFAULT NULL COMMENT 'Quantity received in receiving events',
  `output_quantity` decimal(12,2) DEFAULT NULL,
  `quantity_unit` varchar(50) DEFAULT NULL COMMENT 'Unit of measure (kg, lbs, cases, etc.)',
  `receiving_location_gln` varchar(13) DEFAULT NULL COMMENT 'GLN of receiving location',
  `receiving_location_name` varchar(255) DEFAULT NULL COMMENT 'Name of receiving location',
  `harvest_location_gln` varchar(13) DEFAULT NULL COMMENT 'Harvest location GLN - 13 digits (KDE #8)',
  `harvest_location_name` varchar(255) DEFAULT NULL COMMENT 'Harvest location name (farm/field) (KDE #8)',
  `shipping_location_gln` varchar(13) DEFAULT NULL COMMENT 'GLN of shipping location',
  `shipping_location_name` varchar(255) DEFAULT NULL COMMENT 'Name of shipping location',
  `business_name` varchar(255) DEFAULT NULL COMMENT 'Name of business performing the event',
  `business_gln` varchar(13) DEFAULT NULL COMMENT 'GLN of business performing the event',
  `business_address` varchar(500) DEFAULT NULL COMMENT 'Address of business performing the event',
  `traceability_lot_code` varchar(100) DEFAULT NULL COMMENT 'Traceability Lot Code (TLC) assigned to the product',
  `product_lot_code` varchar(100) DEFAULT NULL COMMENT 'Original product lot code from supplier (KDE #12)',
  `output_tlcs` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Output TLCs for transformation events' CHECK (json_valid(`output_tlcs`)),
  `transformation_description` text DEFAULT NULL COMMENT 'Description of transformation process',
  `shipping_reference_doc` varchar(100) DEFAULT NULL COMMENT 'Shipping document reference (BOL, AWB, etc.)',
  `shipping_date` timestamp NULL DEFAULT NULL COMMENT 'Date of shipment',
  `receiving_date_expected` varchar(50) DEFAULT NULL COMMENT 'Expected receiving date',
  `fda_compliant` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Whether event meets FSMA 204 requirements',
  `fda_compliance_notes` text DEFAULT NULL COMMENT 'Notes on FDA compliance status',
  `signature_hash` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `signature_id` bigint(20) UNSIGNED DEFAULT NULL,
  `organization_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `voided_by` bigint(20) UNSIGNED DEFAULT NULL,
  `voided_at` timestamp NULL DEFAULT NULL,
  `voids_event_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `cte_events`
--

INSERT INTO `cte_events` (`id`, `event_type`, `status`, `void_count`, `trace_record_id`, `event_date`, `harvest_date`, `pack_date`, `cooling_date`, `location_id`, `partner_id`, `input_tlcs`, `reference_doc`, `reference_doc_type`, `product_description`, `quantity_received`, `output_quantity`, `quantity_unit`, `receiving_location_gln`, `receiving_location_name`, `harvest_location_gln`, `harvest_location_name`, `shipping_location_gln`, `shipping_location_name`, `business_name`, `business_gln`, `business_address`, `traceability_lot_code`, `product_lot_code`, `output_tlcs`, `transformation_description`, `shipping_reference_doc`, `shipping_date`, `receiving_date_expected`, `fda_compliant`, `fda_compliance_notes`, `signature_hash`, `notes`, `created_by`, `signature_id`, `organization_id`, `created_at`, `updated_at`, `voided_by`, `voided_at`, `voids_event_id`) VALUES
(1, 'receiving', 'voided', 1, 1, '2025-10-23 05:23:27', '2025-10-02 00:00:00', '2025-10-15 00:00:00', NULL, 1, 3, NULL, 'Hoa don', 'Invoice', NULL, 1000.00, NULL, 'kg', '0614141000001', 'Main Warehouse', NULL, NULL, NULL, NULL, 'Food Distributor Inc.', '0614141000030', NULL, 'HH01', 'LOT-2025', NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL, 1, 1, NULL, '2025-10-23 05:22:59', '2025-10-23 05:23:27', 1, '2025-10-23 05:23:27', NULL),
(2, 'VOID', 'active', 0, 1, '2025-10-23 05:23:27', NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, 'VOID: data_entry_error - hjkhsd á', 1, NULL, NULL, '2025-10-23 05:23:27', '2025-10-23 05:23:27', NULL, NULL, 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `digital_certificates`
--

CREATE TABLE `digital_certificates` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `certificate_id` varchar(255) NOT NULL,
  `certificate_pem` text NOT NULL,
  `certificate_chain` varchar(255) DEFAULT NULL,
  `root_ca_certificate` varchar(255) DEFAULT NULL,
  `intermediate_ca_certificate` varchar(255) DEFAULT NULL,
  `crl_url` varchar(255) DEFAULT NULL,
  `ocsp_url` varchar(255) DEFAULT NULL,
  `crl_last_checked` timestamp NULL DEFAULT NULL,
  `ocsp_last_checked` timestamp NULL DEFAULT NULL,
  `is_crl_valid` tinyint(1) NOT NULL DEFAULT 1,
  `is_ocsp_valid` tinyint(1) NOT NULL DEFAULT 1,
  `certificate_usage` varchar(255) NOT NULL DEFAULT 'signing',
  `signature_count` int(11) NOT NULL DEFAULT 0,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `public_key` text NOT NULL,
  `private_key_encrypted` text DEFAULT NULL COMMENT 'Encrypted private key',
  `issuer` varchar(255) NOT NULL COMMENT 'Certificate issuer',
  `subject` varchar(255) NOT NULL COMMENT 'Certificate subject',
  `serial_number` varchar(255) NOT NULL,
  `issued_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_revoked` tinyint(1) NOT NULL DEFAULT 0,
  `revoked_at` timestamp NULL DEFAULT NULL,
  `revocation_reason` text DEFAULT NULL,
  `signature_algorithm` varchar(255) NOT NULL DEFAULT 'sha256WithRSAEncryption',
  `key_size` int(11) NOT NULL DEFAULT 2048 COMMENT 'RSA key size in bits',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `documents`
--

CREATE TABLE `documents` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `organization_id` bigint(20) UNSIGNED DEFAULT NULL,
  `doc_number` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `type` enum('traceability_plan','sop','fda_correspondence','training','other') NOT NULL,
  `status` enum('draft','review','approved','archived') NOT NULL DEFAULT 'draft',
  `version` varchar(20) NOT NULL DEFAULT '1.0',
  `effective_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `approved_by` bigint(20) UNSIGNED DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `document_versions`
--

CREATE TABLE `document_versions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `organization_id` bigint(20) UNSIGNED DEFAULT NULL,
  `document_id` bigint(20) UNSIGNED NOT NULL,
  `version` varchar(20) NOT NULL,
  `change_notes` text DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `error_logs`
--

CREATE TABLE `error_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `error_type` varchar(255) NOT NULL,
  `error_message` text NOT NULL,
  `error_code` int(11) DEFAULT NULL,
  `file_path` varchar(255) NOT NULL,
  `line_number` int(11) NOT NULL,
  `stack_trace` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`stack_trace`)),
  `context` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`context`)),
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `url` text DEFAULT NULL,
  `method` varchar(255) DEFAULT NULL,
  `ip_address` varchar(255) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `error_hash` varchar(255) NOT NULL,
  `is_resolved` tinyint(1) NOT NULL DEFAULT 0,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `resolved_by` bigint(20) UNSIGNED DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `severity` enum('info','warning','error','critical') NOT NULL DEFAULT 'error',
  `frequency` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `export_logs`
--

CREATE TABLE `export_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `export_id` varchar(50) NOT NULL,
  `file_type` enum('json','xml','csv') NOT NULL,
  `export_scope` enum('all','product','tlc') NOT NULL,
  `scope_value` varchar(255) DEFAULT NULL,
  `content_hash` longtext NOT NULL,
  `file_size` bigint(20) UNSIGNED NOT NULL,
  `record_count` int(10) UNSIGNED NOT NULL,
  `start_record_id` varchar(255) DEFAULT NULL,
  `end_record_id` varchar(255) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `verified_at` timestamp NULL DEFAULT NULL,
  `verification_notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `e_signatures`
--

CREATE TABLE `e_signatures` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `delegated_by_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `delegation_authority` varchar(255) DEFAULT NULL,
  `delegation_valid_until` datetime DEFAULT NULL,
  `is_delegated_signature` tinyint(1) NOT NULL DEFAULT 0,
  `record_type` varchar(50) NOT NULL COMMENT 'products, cte_events, etc.',
  `record_id` bigint(20) UNSIGNED NOT NULL,
  `action` varchar(100) NOT NULL COMMENT 'create, update, delete, approve',
  `reason` text DEFAULT NULL,
  `meaning_of_signature` text DEFAULT NULL,
  `signature_hash` text NOT NULL,
  `signature_algorithm` varchar(50) NOT NULL DEFAULT 'SHA512',
  `signature_format` varchar(255) NOT NULL DEFAULT 'SHA512',
  `xades_metadata` text DEFAULT NULL,
  `certificate_subject` varchar(255) DEFAULT NULL,
  `certificate_issuer` varchar(255) DEFAULT NULL,
  `certificate_serial_number` varchar(255) DEFAULT NULL,
  `tsa_url` varchar(255) DEFAULT NULL,
  `tsa_certificate_subject` varchar(255) DEFAULT NULL,
  `ltv_timestamp_chain` text DEFAULT NULL,
  `ltv_certificate_chain` text DEFAULT NULL,
  `ltv_crl_response` text DEFAULT NULL,
  `ltv_ocsp_response` text DEFAULT NULL,
  `ltv_last_validation_at` timestamp NULL DEFAULT NULL,
  `ltv_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `batch_operation_id` varchar(255) DEFAULT NULL,
  `batch_operation_type` varchar(255) DEFAULT NULL,
  `batch_operation_sequence` int(11) DEFAULT NULL,
  `batch_total_count` int(11) DEFAULT NULL,
  `signature_attributes` text DEFAULT NULL,
  `signature_metadata` text DEFAULT NULL,
  `signature_status` varchar(255) NOT NULL DEFAULT 'valid',
  `record_content_hash` text DEFAULT NULL,
  `certificate_id` varchar(255) DEFAULT NULL,
  `timestamp_token` text DEFAULT NULL,
  `timestamp_token_der` text DEFAULT NULL COMMENT 'DER encoded timestamp token',
  `timestamp_utc_time` timestamp NULL DEFAULT NULL COMMENT 'UTC time from timestamp',
  `timestamp_tsa_url` varchar(255) DEFAULT NULL COMMENT 'TSA URL used',
  `timestamp_tsa_certificate` text DEFAULT NULL COMMENT 'TSA certificate subject',
  `certificate_revocation_checked` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Whether certificate revocation was checked',
  `certificate_revocation_checked_at` timestamp NULL DEFAULT NULL COMMENT 'When revocation was last checked',
  `certificate_revocation_status` varchar(255) DEFAULT NULL COMMENT 'good, revoked, unknown',
  `certificate_revocation_reason` text DEFAULT NULL COMMENT 'Reason if revoked',
  `verification_report` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Detailed verification report' CHECK (json_valid(`verification_report`)),
  `verification_passed` tinyint(1) DEFAULT NULL COMMENT 'Overall verification result',
  `last_verified_at` timestamp NULL DEFAULT NULL COMMENT 'Last verification timestamp',
  `timestamp_provider` varchar(255) DEFAULT NULL COMMENT 'freetsa, digicert, sectigo',
  `timestamp_verified_at` timestamp NULL DEFAULT NULL,
  `is_revoked` tinyint(1) NOT NULL DEFAULT 0,
  `revoked_at` timestamp NULL DEFAULT NULL,
  `revocation_reason` text DEFAULT NULL,
  `mfa_method` varchar(255) DEFAULT NULL COMMENT 'totp, sms, backup_code',
  `user_agent` varchar(255) DEFAULT NULL,
  `ip_address` text NOT NULL,
  `signed_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `signature_valid_from` timestamp NULL DEFAULT NULL COMMENT 'Signature validity start date',
  `signature_valid_until` timestamp NULL DEFAULT NULL COMMENT 'Signature validity end date',
  `signature_expires_at` datetime DEFAULT NULL,
  `is_expired` tinyint(1) NOT NULL DEFAULT 0,
  `expiration_checked_at` datetime DEFAULT NULL,
  `expiration_status` varchar(50) NOT NULL DEFAULT 'active',
  `encryption_algorithm` varchar(50) NOT NULL DEFAULT 'AES-256-CBC',
  `encrypted_fields` varchar(500) DEFAULT NULL,
  `signature_validity_period_days` int(11) NOT NULL DEFAULT 365 COMMENT 'Validity period in days',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `e_signatures`
--

INSERT INTO `e_signatures` (`id`, `user_id`, `delegated_by_user_id`, `delegation_authority`, `delegation_valid_until`, `is_delegated_signature`, `record_type`, `record_id`, `action`, `reason`, `meaning_of_signature`, `signature_hash`, `signature_algorithm`, `signature_format`, `xades_metadata`, `certificate_subject`, `certificate_issuer`, `certificate_serial_number`, `tsa_url`, `tsa_certificate_subject`, `ltv_timestamp_chain`, `ltv_certificate_chain`, `ltv_crl_response`, `ltv_ocsp_response`, `ltv_last_validation_at`, `ltv_enabled`, `batch_operation_id`, `batch_operation_type`, `batch_operation_sequence`, `batch_total_count`, `signature_attributes`, `signature_metadata`, `signature_status`, `record_content_hash`, `certificate_id`, `timestamp_token`, `timestamp_token_der`, `timestamp_utc_time`, `timestamp_tsa_url`, `timestamp_tsa_certificate`, `certificate_revocation_checked`, `certificate_revocation_checked_at`, `certificate_revocation_status`, `certificate_revocation_reason`, `verification_report`, `verification_passed`, `last_verified_at`, `timestamp_provider`, `timestamp_verified_at`, `is_revoked`, `revoked_at`, `revocation_reason`, `mfa_method`, `user_agent`, `ip_address`, `signed_at`, `signature_valid_from`, `signature_valid_until`, `signature_expires_at`, `is_expired`, `expiration_checked_at`, `expiration_status`, `encryption_algorithm`, `encrypted_fields`, `signature_validity_period_days`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, NULL, NULL, 0, 'cte_events', 1, 'create_receiving', 'Lưu kho', NULL, 'eyJpdiI6IkhpbVJnQXd4SmJiQ05oMlY1c2NDQkE9PSIsInZhbHVlIjoiLzZiaXQvZGxXZzlBNU9LS1RBcCtEbWxCbE1aSlc1NFEzbG9aWXdEQ3pYRFdGbDZQdmRZVk9MTTBQUUtsdmZCaTdtWE1MNVVFRmtUMUlFYldoanpaRnBOMlN3d05raFB6Yi8zK3kybjFRWm9CcjdjVVdOcEVrSzVxZ0JJTjBMVXVpMlJ6Z3JBRlJCSmxCcHRiSk90RDJpT3RSK2NRY3dKN045Y2hSZ1V1ODhOa2hYQURqdktoaUpTcnFpMm42cTZUIiwibWFjIjoiMjI5YWFiYzkzNmMxOTc3YWY2N2EzYTZiNWJhMjJjZjE3ODQyYmY2YWVhNGQ2OTRiODAxMDVkZmQ5Nzg5YjU1NiIsInRhZyI6IiJ9', 'SHA512', 'SHA512', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 'valid', 'eyJpdiI6Ii9VcG02dDJvQ0NNMGtDeitSRjdQOWc9PSIsInZhbHVlIjoiT29BZUpSMTAvM2o4TlNKckRQdnZ5YURDRDNXbG1tWHNvOHU3ekdIMklYWnI3cXZqdndBeWpjZmdWREZjQWt1di8vcUN3YkFsVHpQMzl0QWtORWNYUDVTL1ptVEJvdFRwVDZ6dTloRVVFUk1mcTZFY0JETGMwVW8vUVlrVGd0YjNSVHJtSWdpVHpxMDhFaXU4YzBGSUp2OHY2dUNRalFUNlpHVzVNU212WUdvekttbXFscW9FVTdUcDl4Wjh2KzFkIiwibWFjIjoiY2Y2ZDE4MDU1MzU4NWM4NjBhMjVjNTcxMTE3OTU0NWQ3OGRhZWY1NGUzMzhhNzkxYWE2MWM3OWY2ZjBlYjNiZSIsInRhZyI6IiJ9', NULL, 'eyJpdiI6Ik56VzNBazcxSlFCZkx3YVdTVWtlbFE9PSIsInZhbHVlIjoieUJTbUVGREhyWC9NU1ZUY2RoMEx4UT09IiwibWFjIjoiNDUyY2YwNTc1ZDIwNGZmNzNhZjYyODk5YWQzZWIwMWRmNWQwODEzODBiMjcyNmIyMDA4NTgxNzI2ZmE3NmFkYiIsInRhZyI6IiJ9', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 'eyJpdiI6IlRobjhLbEJEb1BaTlpTcVVJYVM4Q1E9PSIsInZhbHVlIjoiSlU2TTFUcjNNZnBINXVJSWY1L1pDQT09IiwibWFjIjoiYjQ4YTRhM2FmZThhODVkYWI5MGRlMWY2MjcyZGJhZTI5YWQ2YmU1YzFjNTE2M2JjODljY2U4Yjk5NGExMGRiZSIsInRhZyI6IiJ9', '2025-10-23 05:22:59', NULL, NULL, NULL, 0, NULL, 'active', 'AES-256-CBC', NULL, 365, '2025-10-23 05:22:59', '2025-10-23 05:22:59'),
(2, 1, NULL, NULL, NULL, 0, 'cte_events', 1, 'void', 'data_entry_error: hjkhsd á', NULL, 'eyJpdiI6IkVHZ01ncHdvc1d1N0ZmaFl0WitjU1E9PSIsInZhbHVlIjoiOWJFaENzTitrY2R6eVF5eTMyVTFtQ3RTNUpGUGZmMWZiUzFkNDd2OTgwcG4wVEVnMURiS1RDM3ovczhQTENDVWJFYVNrNWFrZlRaMXNGam1tQVI3Y1k1SFVQNnQ3TndVMU5EZU00aENSYnZWSFlvaE9XVFpMZVoxRll6TWM1V2YxVHlJQ3hPaE9ma0cwRVErZ3dxQjdoUmNjbVJrSlpuZ2tIbFN2NXBQNHc5Z0JZYXJ4RVhIMFI1MjNsZ3hWS214IiwibWFjIjoiOWMzNThiZWMyYmFmOGNiM2U0OGYzZTlkM2Y0NzNmZDNkYjNmMWQzZjAyN2EzODRjMjcyNmRkZjA5MTgyZDNjZSIsInRhZyI6IiJ9', 'SHA512', 'SHA512', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 'valid', 'eyJpdiI6IlZRdG44WnpUeUU5K3c3TVFkcll6V3c9PSIsInZhbHVlIjoiT2xQNEFkQU5sTmFoN1Q5elhvY1F6d3hKNDIyS2tEa3BwQ21YaHB3dFdyWlNTZVY3U2JwY29LeFEyRjI1RnJRT3VFeUkxWitNc1lqSThYUUVJR0tCd1UzWmpqOUQrcGc0Vk43dnY0RDN1em01R201cFF1VTAvRXZQQXBvSFNMZCtIUTJDODRmSE52QlB6OGI1dFI3TVdmYXVHTnlqOWtRL1ZqN25lQXpjNGdmQmNXNUY1bC9HQzIzNkVQVDNPMEE1IiwibWFjIjoiNTI2MDQ2ODI0MGRhODllODgzYjZiN2MyNmI2Y2Q2M2FlODc2ODgwODhkYTVhNzM2NTVjMzFiNjA1NGQ4YWQ3YyIsInRhZyI6IiJ9', NULL, 'eyJpdiI6IkVERCt2WVpvRktQYWVsWXM5eVJnT0E9PSIsInZhbHVlIjoiUHhHUDdUOHVFM0xxcW41akg0cUpYUT09IiwibWFjIjoiNjEyYzFiN2ZhNThhOTA1NDgwM2RmYWI5MjliMjBmNGYzZmMyMTdiYjA3MDY4Y2JiZDhjYTkwYjFjODM1MDQ0ZiIsInRhZyI6IiJ9', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 'eyJpdiI6Ikd1Y2kxZTFMaWZkemVLV2RnamlvV3c9PSIsInZhbHVlIjoiOGU5cjZKa1R4dVU1RUkyL3FqRVp2QT09IiwibWFjIjoiYzY0MTdhMTExOGNmZTNiNmUwNzBmZWY3YmFiNjEwMGU4MGIzOTg1MDkwYWE4YWFlNjBmODhhMGYyMGMzYWY3ZCIsInRhZyI6IiJ9', '2025-10-23 05:23:27', NULL, NULL, NULL, 0, NULL, 'active', 'AES-256-CBC', NULL, 365, '2025-10-23 05:23:27', '2025-10-23 05:23:27');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `leads`
--

CREATE TABLE `leads` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `company_name` varchar(150) DEFAULT NULL,
  `industry` varchar(100) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `status` enum('new','contacted','qualified','converted','rejected') NOT NULL DEFAULT 'new',
  `source` varchar(50) NOT NULL DEFAULT 'landing_page',
  `utm_source` varchar(100) DEFAULT NULL,
  `utm_medium` varchar(100) DEFAULT NULL,
  `utm_campaign` varchar(100) DEFAULT NULL,
  `utm_content` varchar(100) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `contacted_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `locations`
--

CREATE TABLE `locations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `location_name` varchar(255) NOT NULL,
  `location_type` enum('warehouse','farm','processing','distribution') DEFAULT NULL,
  `gln` varchar(13) DEFAULT NULL,
  `ffrn` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `zip_code` varchar(20) DEFAULT NULL,
  `country` varchar(100) NOT NULL DEFAULT 'VN',
  `organization_id` bigint(20) UNSIGNED DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `locations`
--

INSERT INTO `locations` (`id`, `location_name`, `location_type`, `gln`, `ffrn`, `address`, `city`, `state`, `zip_code`, `country`, `organization_id`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Main Warehouse', 'warehouse', '0614141000001', NULL, '123 Industrial Blvd', 'Los Angeles', 'CA', '90001', 'USA', NULL, 'active', '2025-10-23 05:12:55', '2025-10-23 05:12:55'),
(2, 'Processing Facility', 'processing', '0614141000002', NULL, '456 Factory Road', 'Fresno', 'CA', '93650', 'USA', NULL, 'active', '2025-10-23 05:12:55', '2025-10-23 05:12:55'),
(3, 'Green Valley Farm', 'farm', NULL, '3012345678', '789 Farm Lane', 'Salinas', 'CA', '93901', 'USA', NULL, 'active', '2025-10-23 05:12:55', '2025-10-23 05:12:55');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2024_01_01_000000_create_organizations_table', 1),
(2, '2024_01_01_000001_create_users_table', 1),
(3, '2024_01_01_000002_create_products_table', 1),
(4, '2024_01_01_000002_create_sessions_table', 1),
(5, '2024_01_01_000003_create_locations_table', 1),
(6, '2024_01_01_000004_create_partners_table', 1),
(7, '2024_01_01_000005_create_trace_records_table', 1),
(8, '2024_01_01_000006_create_trace_relationships_table', 1),
(9, '2024_01_01_000007_create_cte_events_table', 1),
(10, '2024_01_01_000008_add_cte_event_foreign_to_trace_relationships', 1),
(11, '2024_01_01_000008_create_audit_logs_table', 1),
(12, '2024_01_01_000009_create_e_signatures_table', 1),
(13, '2024_01_01_000010_create_cache_table', 1),
(14, '2024_01_01_000010_create_documents_table', 1),
(15, '2024_01_01_000011_create_document_versions_table', 1),
(16, '2024_01_01_000013_add_package_columns_to_users_table', 1),
(17, '2024_01_01_000014_create_notifications_table', 1),
(18, '2024_01_01_000015_update_package_limits', 1),
(19, '2024_01_01_000016_sync_package_naming', 1),
(20, '2024_01_01_000017_create_pricing_table', 1),
(21, '2024_01_01_000019_add_organization_id_to_users_table', 1),
(22, '2024_01_01_000020_add_organization_id_to_documents_table', 1),
(23, '2024_01_01_000020_create_error_logs_table', 1),
(24, '2024_01_01_000021_add_preferred_language_to_users', 1),
(25, '2024_01_01_000022_add_2fa_and_certificates_to_users', 1),
(26, '2024_01_01_000023_enhance_e_signatures_table', 1),
(27, '2024_01_01_000024_create_digital_certificates_table', 1),
(28, '2024_01_01_000025_create_two_fa_logs_table', 1),
(29, '2024_01_01_000026_add_timestamp_fields_to_e_signatures', 1),
(30, '2024_01_15_000001_add_missing_kdes_to_cte_events', 1),
(31, '2024_01_15_000001_create_leads_table', 1),
(32, '2024_01_15_000002_create_retention_policies_table', 1),
(33, '2024_01_15_000003_create_archival_logs_table', 1),
(34, '2024_01_15_000003_enhance_digital_certificates_table', 1),
(35, '2024_01_15_000004_create_archival_tables', 1),
(36, '2024_01_15_000004_create_signature_record_types_table', 1),
(37, '2024_01_15_000005_create_signature_revocations_table', 1),
(38, '2024_01_20_000000_create_traceability_analytics_table', 1),
(39, '2024_01_20_000001_create_packages_table', 1),
(40, '2024_01_20_000002_seed_packages_table', 1),
(41, '2025_01_21_000001_add_quantity_tracking_to_trace_records', 1),
(42, '2025_01_21_000001_create_archival_logs_table', 1),
(43, '2025_01_21_000002_create_archival_tables', 1),
(44, '2025_01_21_000002_create_transformation_items_table', 1),
(45, '2025_01_22_000001_optimize_audit_logs_for_performance', 1),
(46, '2025_10_15_032225_add_status_to_products_table', 1),
(47, '2025_10_17_185643_add_status_to_locations_table', 1),
(48, '2025_10_20_000001_create_payment_orders_table', 1),
(49, '2025_10_20_000002_create_webhook_logs_table', 1),
(50, '2025_10_20_000003_add_payment_fields_to_users_table', 1),
(51, '2025_10_20_012444_add_integrity_hash_to_audit_logs_table', 1),
(52, '2025_10_20_012952_increase_signature_hash_length_in_e_signatures_table', 1),
(53, '2025_10_20_075443_alter_ip_address_in_e_signatures_table', 1),
(54, '2025_10_20_075800_alter_audit_logs_user_id_nullable', 1),
(55, '2025_10_20_081930_drop_audit_logs_user_id_foreign', 1),
(56, '2025_10_20_083144_fix_audit_logs_user_foreign_key', 1),
(57, '2025_10_20_090000_comprehensive_fix_audit_logs_schema', 1),
(58, '2025_10_20_120000_add_signature_validity_period_to_e_signatures', 1),
(59, '2025_10_20_130000_add_xades_and_ltv_fields_to_e_signatures', 1),
(60, '2025_10_20_131000_create_batch_signature_operations_table', 1),
(61, '2025_10_20_140000_add_delegation_and_expiration_to_e_signatures', 1),
(62, '2025_10_20_141000_create_signature_verifications_table', 1),
(63, '2025_10_20_142000_create_signature_delegations_table', 1),
(64, '2025_10_20_150000_create_signature_performance_metrics_table', 1),
(65, '2025_10_20_182645_normalize_audit_logs_user_foreign_key', 1),
(66, '2025_10_21_180000_update_trace_relationships_enum', 1),
(67, '2025_10_21_190000_add_void_mechanism_to_cte_events', 1),
(68, '2025_10_21_192000_add_void_to_trace_relationships_enum', 1),
(69, '2025_10_21_193000_add_void_tracking_to_cte_events', 1),
(70, '2025_10_21_201000_add_voided_status_to_trace_records', 1),
(71, '2025_10_21_add_quantity_tracking_columns', 1),
(72, '2025_10_22_000001_add_missing_fsma_kdes_to_cte_events', 1),
(73, '2025_10_22_000002_standardize_trace_relationships_types', 1),
(74, '2025_10_22_add_signature_id_to_cte_events', 1),
(75, '2025_10_22_create_export_logs_table', 1),
(77, '2024_01_01_000009_add_missing_columns_to_users_table', 2),
(78, '2026_01_01_999912_create_audit_triggers', 3),
(79, '2025_01_23_000001_add_foreign_key_to_users_package_id', 4),
(80, '2025_01_23_000002_remove_duplicate_limit_columns_from_users', 4),
(81, '2025_01_23_000003_add_trial_days_to_packages_table', 4),
(82, '2025_01_23_000004_update_default_package_id_to_free', 4),
(83, '2025_01_23_000005_update_free_package_features', 4),
(84, '2025_10_24_create_permission_audit_logs_table', 5);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `type` enum('quota_warning','quota_reached','upgrade_success','feature_locked') NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `cta_text` varchar(255) DEFAULT NULL,
  `cta_url` varchar(255) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `is_blocking` tinyint(1) NOT NULL DEFAULT 0,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `organizations`
--

CREATE TABLE `organizations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `registration_number` varchar(255) DEFAULT NULL COMMENT 'Mã đăng ký GACC/FDA',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `packages`
--

CREATE TABLE `packages` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `max_cte_records_monthly` int(11) NOT NULL DEFAULT 0,
  `max_documents` int(11) NOT NULL DEFAULT 0,
  `max_users` int(11) NOT NULL DEFAULT 1,
  `trial_days` int(11) NOT NULL DEFAULT 14,
  `monthly_list_price` decimal(10,2) DEFAULT NULL,
  `monthly_selling_price` decimal(10,2) DEFAULT NULL,
  `yearly_list_price` decimal(10,2) DEFAULT NULL,
  `yearly_selling_price` decimal(10,2) DEFAULT NULL,
  `show_promotion` tinyint(1) NOT NULL DEFAULT 0,
  `promotion_text` varchar(255) DEFAULT NULL,
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`features`)),
  `is_visible` tinyint(1) NOT NULL DEFAULT 1,
  `is_selectable` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `packages`
--

INSERT INTO `packages` (`id`, `name`, `description`, `max_cte_records_monthly`, `max_documents`, `max_users`, `trial_days`, `monthly_list_price`, `monthly_selling_price`, `yearly_list_price`, `yearly_selling_price`, `show_promotion`, `promotion_text`, `features`, `is_visible`, `is_selectable`, `sort_order`, `created_at`, `updated_at`) VALUES
('basic', 'Basic', 'For small businesses starting their compliance journey', 500, 10, 1, 14, 59.00, 49.00, 588.00, 470.00, 1, 'Save 20% on annual billing', '[\"500 CTE records\\/month\",\"10 documents\",\"1 user\",\"Full traceability\",\"Export reports\",\"Email support (48h)\"]', 1, 1, 2, '2025-10-23 05:11:31', '2025-10-23 05:11:31'),
('enterprise', 'Enterprise', 'For large organizations with custom requirements', 5000, 999999, 5, 14, NULL, 499.00, NULL, 4990.00, 0, 'Custom pricing available', '[\"Starting from 5,000 CTE records\\/month\",\"Unlimited documents\",\"5+ users\",\"E-Signatures\",\"Compliance reports\",\"Custom integrations\",\"Dedicated account manager\",\"24\\/7 support\",\"SLA 99.9% uptime\"]', 1, 0, 4, '2025-10-23 05:11:31', '2025-10-23 05:11:31'),
('free', 'Free Tier', 'Perfect for getting started with FSMA 204 compliance', 100, 10, 1, 14, NULL, 0.00, NULL, 0.00, 0, NULL, '{\"traceability\":true,\"tlc_generation\":false,\"e_signatures\":false,\"compliance_reports\":false,\"api_access\":false,\"advanced_reports\":false,\"priority_support\":false,\"phone_support\":false,\"custom_integrations\":false,\"dedicated_account_manager\":false,\"sla_uptime\":false}', 1, 0, 1, '2025-10-23 05:11:31', '2025-10-23 17:31:00'),
('premium', 'Premium', 'For growing businesses with advanced needs', 2500, 999999, 3, 14, 249.00, 199.00, 2388.00, 1910.00, 1, 'Save 20% on annual billing', '[\"2,500 CTE records\\/month\",\"Unlimited documents\",\"3 users\",\"Advanced reports\",\"API access\",\"Priority support (24h)\",\"Phone support\"]', 1, 1, 3, '2025-10-23 05:11:31', '2025-10-23 05:11:31');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `partners`
--

CREATE TABLE `partners` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `partner_name` varchar(255) NOT NULL,
  `partner_type` enum('supplier','customer','both') NOT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `gln` varchar(50) DEFAULT NULL,
  `organization_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `partners`
--

INSERT INTO `partners` (`id`, `partner_name`, `partner_type`, `contact_person`, `email`, `phone`, `address`, `gln`, `organization_id`, `created_at`, `updated_at`) VALUES
(1, 'Fresh Farms Co.', 'supplier', 'John Smith', 'john@freshfarms.com', '555-0101', '100 Farm Road, Salinas, CA 93901', '0614141000010', NULL, '2025-10-23 05:12:55', '2025-10-23 05:12:55'),
(2, 'Retail Supermarket Chain', 'customer', 'Jane Doe', 'jane@retailchain.com', '555-0202', '200 Market St, San Francisco, CA 94102', '0614141000020', NULL, '2025-10-23 05:12:55', '2025-10-23 05:12:55'),
(3, 'Food Distributor Inc.', 'both', 'Bob Johnson', 'bob@fooddist.com', '555-0303', '300 Distribution Way, Oakland, CA 94601', '0614141000030', NULL, '2025-10-23 05:12:55', '2025-10-23 05:12:55');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payment_orders`
--

CREATE TABLE `payment_orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `order_id` varchar(255) NOT NULL,
  `package_id` varchar(255) NOT NULL,
  `billing_period` varchar(255) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `status` enum('pending','completed','failed','expired') NOT NULL DEFAULT 'pending',
  `payment_gateway` varchar(255) DEFAULT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `idempotency_key` varchar(255) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `response_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`response_data`)),
  `ip_address` varchar(255) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `payment_orders`
--

INSERT INTO `payment_orders` (`id`, `user_id`, `order_id`, `package_id`, `billing_period`, `amount`, `status`, `payment_gateway`, `transaction_id`, `idempotency_key`, `metadata`, `response_data`, `ip_address`, `user_agent`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 1, 'FSMA204_1_1761213548', 'basic', 'monthly', 500000.00, 'pending', NULL, NULL, '9931e6870d70a705edd7314f01b19b057f1433cbdb650759a127321e19a8cf4f', '{\"max_cte_records\":500,\"max_documents\":10,\"max_users\":1}', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 10:14:08', '2025-10-23 09:59:08', '2025-10-23 09:59:08'),
(2, 1, 'FSMA204_1_1761218493', 'basic', 'monthly', 500000.00, 'pending', NULL, NULL, 'acc521bfe190caed2379968b728b254c52a3f49755766953b236540286487941', '{\"max_cte_records\":500,\"max_documents\":10,\"max_users\":1}', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 11:36:33', '2025-10-23 11:21:33', '2025-10-23 11:21:33');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `permission_audit_logs`
--

CREATE TABLE `permission_audit_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `admin_id` bigint(20) UNSIGNED NOT NULL,
  `action` varchar(255) NOT NULL,
  `resource` varchar(255) NOT NULL,
  `old_value` text DEFAULT NULL,
  `new_value` text DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `ip_address` varchar(255) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `permission_audit_logs`
--

INSERT INTO `permission_audit_logs` (`id`, `user_id`, `admin_id`, `action`, `resource`, `old_value`, `new_value`, `reason`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(1, 4, 1, 'package_updated', 'user_package', 'basic', 'premium', 'Package updated via admin panel', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 03:30:12', '2025-10-24 03:30:12'),
(2, 4, 1, 'package_updated', 'user_package', 'premium', 'enterprise', 'Package updated via admin panel', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 04:11:58', '2025-10-24 04:11:58'),
(3, 5, 5, 'role_changed', 'user_role', 'manager', 'operator', 'Role updated via admin panel', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-24 05:49:58', '2025-10-24 05:49:58');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `pricing`
--

CREATE TABLE `pricing` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `package_id` enum('free','basic','premium','enterprise') NOT NULL,
  `package_name` varchar(255) NOT NULL,
  `price_monthly` decimal(10,2) NOT NULL DEFAULT 0.00,
  `price_yearly` decimal(10,2) NOT NULL DEFAULT 0.00,
  `list_price_monthly` decimal(10,2) NOT NULL DEFAULT 0.00,
  `list_price_yearly` decimal(10,2) NOT NULL DEFAULT 0.00,
  `max_cte_records_monthly` int(11) NOT NULL DEFAULT 0,
  `max_documents` int(11) NOT NULL DEFAULT 0,
  `max_users` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `pricing`
--

INSERT INTO `pricing` (`id`, `package_id`, `package_name`, `price_monthly`, `price_yearly`, `list_price_monthly`, `list_price_yearly`, `max_cte_records_monthly`, `max_documents`, `max_users`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'free', 'Free Tier', 0.00, 0.00, 0.00, 0.00, 50, 1, 1, 1, NULL, NULL),
(2, 'basic', 'Basic', 0.00, 0.00, 0.00, 0.00, 500, 10, 1, 1, NULL, NULL),
(3, 'premium', 'Premium', 0.00, 0.00, 0.00, 0.00, 2500, 0, 3, 1, NULL, NULL),
(4, 'enterprise', 'Enterprise', 0.00, 0.00, 0.00, 0.00, 0, 0, 0, 1, NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `products`
--

CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `sku` varchar(255) NOT NULL,
  `product_name` varchar(200) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `unit_of_measure` varchar(20) NOT NULL DEFAULT 'kg',
  `is_ftl` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Food Traceability List',
  `description` text DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `organization_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `products`
--

INSERT INTO `products` (`id`, `sku`, `product_name`, `category`, `unit_of_measure`, `is_ftl`, `description`, `status`, `organization_id`, `created_at`, `updated_at`) VALUES
(1, 'TOM-001', 'Fresh Tomatoes', 'Vegetables', 'kg', 1, 'Organic Roma Tomatoes', 'active', NULL, '2025-10-23 05:12:55', '2025-10-23 05:12:55'),
(2, 'LET-001', 'Romaine Lettuce', 'Leafy Greens', 'kg', 1, 'Fresh Romaine Lettuce', 'active', NULL, '2025-10-23 05:12:55', '2025-10-23 05:12:55'),
(3, 'STR-001', 'Fresh Strawberries', 'Berries', 'kg', 1, 'Organic Strawberries', 'active', NULL, '2025-10-23 05:12:55', '2025-10-23 05:12:55');

--
-- Bẫy `products`
--
DELIMITER $$
CREATE TRIGGER `after_products_insert` AFTER INSERT ON `products` FOR EACH ROW BEGIN
                DECLARE v_user_id BIGINT DEFAULT NULL;

                INSERT INTO audit_logs (user_id, action, table_name, record_id, created_at)
                VALUES (v_user_id, 'insert', 'products', NEW.id, NOW());
            END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `retention_logs`
--

CREATE TABLE `retention_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `retention_policy_id` bigint(20) UNSIGNED NOT NULL,
  `data_type` varchar(255) NOT NULL,
  `records_deleted` int(11) NOT NULL DEFAULT 0,
  `records_backed_up` int(11) NOT NULL DEFAULT 0,
  `backup_file_path` varchar(255) DEFAULT NULL,
  `executed_at` datetime NOT NULL,
  `executed_by` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `error_message` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `retention_policies`
--

CREATE TABLE `retention_policies` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `policy_name` varchar(255) NOT NULL,
  `data_type` varchar(255) NOT NULL,
  `retention_months` int(11) NOT NULL DEFAULT 27,
  `backup_before_deletion` tinyint(1) NOT NULL DEFAULT 1,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `description` text DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('QG1nc2QjV2BKm8Zz5TU5Q5hOcIjY98b2aTDUhQwT', 5, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiN0d3YWVuOTJNV2xCbFZPbGtnMlNwZlJGMEd0aGxqQ3pLNlplSnQ4SiI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NDg6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9ub3RpZmljYXRpb25zL3VucmVhZC1jb3VudCI7fXM6NTA6ImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjtpOjU7fQ==', 1761286188),
('ZsSOlsNL0B6Z627zwvDm6Fp6K4UUjXzt9FJHmX3d', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 'YTo1OntzOjY6Il90b2tlbiI7czo0MDoibVFmSXV3cFowVlYzeUhNT0h5YXZHNUFFSWZ5RWJmclFtOEVUYTJRdyI7czozOiJ1cmwiO2E6MDp7fXM6OToiX3ByZXZpb3VzIjthOjE6e3M6MzoidXJsIjtzOjM1OiJodHRwOi8vMTI3LjAuMC4xOjgwMDAvbm90aWZpY2F0aW9ucyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fXM6NTA6ImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjtpOjE7fQ==', 1761291188);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `signature_delegations`
--

CREATE TABLE `signature_delegations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `delegator_user_id` bigint(20) UNSIGNED NOT NULL,
  `delegatee_user_id` bigint(20) UNSIGNED NOT NULL,
  `delegation_authority` varchar(255) NOT NULL,
  `delegation_scope` text DEFAULT NULL,
  `valid_from` datetime NOT NULL,
  `valid_until` datetime NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `revocation_reason` text DEFAULT NULL,
  `revoked_at` datetime DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `signature_performance_metrics`
--

CREATE TABLE `signature_performance_metrics` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `e_signature_id` bigint(20) UNSIGNED NOT NULL,
  `signature_creation_time_ms` int(11) DEFAULT NULL,
  `timestamp_request_time_ms` int(11) DEFAULT NULL,
  `certificate_verification_time_ms` int(11) DEFAULT NULL,
  `hash_computation_time_ms` int(11) DEFAULT NULL,
  `encryption_time_ms` int(11) DEFAULT NULL,
  `total_signature_time_ms` int(11) DEFAULT NULL,
  `verification_time_ms` int(11) DEFAULT NULL,
  `revocation_check_time_ms` int(11) DEFAULT NULL,
  `ltv_validation_time_ms` int(11) DEFAULT NULL,
  `tsa_provider` varchar(255) DEFAULT NULL,
  `tsa_response_time_ms` int(11) DEFAULT NULL,
  `tsa_retry_count` int(11) NOT NULL DEFAULT 0,
  `tsa_status` varchar(255) DEFAULT NULL,
  `memory_used_mb` int(11) DEFAULT NULL,
  `cpu_time_ms` int(11) DEFAULT NULL,
  `signatures_per_minute` int(11) DEFAULT NULL,
  `verifications_per_minute` int(11) DEFAULT NULL,
  `error_count` int(11) NOT NULL DEFAULT 0,
  `error_log` text DEFAULT NULL,
  `bottleneck_component` varchar(255) DEFAULT NULL,
  `bottleneck_time_ms` int(11) DEFAULT NULL,
  `bottleneck_percentage` decimal(5,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `signature_record_types`
--

CREATE TABLE `signature_record_types` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `record_type` varchar(100) NOT NULL COMMENT 'e.g., products, cte_events, documents, trace_records',
  `model_class` varchar(255) NOT NULL COMMENT 'Full namespace of the model class',
  `display_name` varchar(255) NOT NULL COMMENT 'Human-readable name for UI',
  `description` text DEFAULT NULL,
  `content_fields` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'Fields to include in content hash' CHECK (json_valid(`content_fields`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `signature_revocations`
--

CREATE TABLE `signature_revocations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `signature_id` bigint(20) UNSIGNED NOT NULL,
  `revoked_by_user_id` bigint(20) UNSIGNED NOT NULL,
  `revocation_reason` varchar(500) NOT NULL,
  `revocation_category` varchar(255) NOT NULL COMMENT 'user_request, security_breach, data_modification, compliance, other',
  `revocation_details` text DEFAULT NULL COMMENT 'Additional details about revocation',
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `is_emergency_revocation` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Emergency revocation flag',
  `revoked_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `signature_verifications`
--

CREATE TABLE `signature_verifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `signature_id` bigint(20) UNSIGNED NOT NULL,
  `verified_by_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `verification_type` varchar(50) NOT NULL,
  `verification_status` varchar(50) NOT NULL,
  `verification_details` text DEFAULT NULL,
  `verification_checks` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`verification_checks`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `verification_duration_ms` int(11) DEFAULT NULL,
  `is_brute_force_attempt` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `traceability_analytics`
--

CREATE TABLE `traceability_analytics` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `trace_record_id` bigint(20) UNSIGNED NOT NULL,
  `query_type` enum('public','admin_report','api') NOT NULL DEFAULT 'public',
  `direction` enum('backward','forward','both') DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `trace_records`
--

CREATE TABLE `trace_records` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tlc` varchar(255) NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `available_quantity` decimal(10,2) NOT NULL DEFAULT 0.00,
  `consumed_quantity` decimal(10,2) NOT NULL DEFAULT 0.00,
  `unit` varchar(20) NOT NULL DEFAULT 'kg',
  `lot_code` varchar(255) DEFAULT NULL,
  `harvest_date` date DEFAULT NULL,
  `location_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('active','consumed','shipped','destroyed','voided') DEFAULT 'active',
  `path` text DEFAULT NULL,
  `organization_id` bigint(20) UNSIGNED DEFAULT NULL,
  `materialized_path` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `trace_records`
--

INSERT INTO `trace_records` (`id`, `tlc`, `product_id`, `quantity`, `available_quantity`, `consumed_quantity`, `unit`, `lot_code`, `harvest_date`, `location_id`, `status`, `path`, `organization_id`, `materialized_path`, `created_at`, `updated_at`) VALUES
(1, 'HH01', 3, 0.00, 0.00, 0.00, 'kg', NULL, '2025-10-02', 1, 'voided', NULL, 1, NULL, '2025-10-23 05:22:59', '2025-10-23 05:23:27');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `trace_relationships`
--

CREATE TABLE `trace_relationships` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `parent_id` bigint(20) UNSIGNED NOT NULL,
  `child_id` bigint(20) UNSIGNED DEFAULT NULL,
  `relationship_type` enum('INPUT','OUTPUT') NOT NULL,
  `cte_event_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `transformation_items`
--

CREATE TABLE `transformation_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `transformation_event_id` bigint(20) UNSIGNED NOT NULL,
  `input_trace_record_id` bigint(20) UNSIGNED NOT NULL,
  `quantity_used` decimal(10,2) NOT NULL,
  `unit` varchar(20) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `two_fa_logs`
--

CREATE TABLE `two_fa_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `method` varchar(255) NOT NULL COMMENT 'totp, sms, backup_code',
  `success` tinyint(1) NOT NULL DEFAULT 0,
  `ip_address` varchar(45) NOT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `failure_reason` text DEFAULT NULL,
  `attempted_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `organization_id` bigint(20) UNSIGNED DEFAULT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `preferred_language` varchar(5) NOT NULL DEFAULT 'en',
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `role` enum('admin','manager','operator') NOT NULL DEFAULT 'operator',
  `package_id` varchar(255) NOT NULL DEFAULT 'free',
  `subscription_status` enum('active','inactive','canceled','expired') NOT NULL DEFAULT 'inactive',
  `subscription_ends_at` timestamp NULL DEFAULT NULL,
  `last_payment_date` timestamp NULL DEFAULT NULL,
  `payment_gateway` varchar(255) DEFAULT NULL,
  `vnpay_transaction_id` varchar(255) DEFAULT NULL,
  `vnpay_order_id` varchar(255) DEFAULT NULL,
  `stripe_customer_id` varchar(255) DEFAULT NULL,
  `stripe_subscription_id` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `two_fa_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `two_fa_secret` varchar(255) DEFAULT NULL,
  `backup_codes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`backup_codes`)),
  `two_fa_enabled_at` timestamp NULL DEFAULT NULL,
  `certificate_id` varchar(255) DEFAULT NULL,
  `public_key` text DEFAULT NULL,
  `certificate_pem` text DEFAULT NULL,
  `certificate_expires_at` timestamp NULL DEFAULT NULL,
  `certificate_revoked` tinyint(1) NOT NULL DEFAULT 0,
  `certificate_revoked_at` timestamp NULL DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `organization_id`, `username`, `email`, `preferred_language`, `password`, `full_name`, `role`, `package_id`, `subscription_status`, `subscription_ends_at`, `last_payment_date`, `payment_gateway`, `vnpay_transaction_id`, `vnpay_order_id`, `stripe_customer_id`, `stripe_subscription_id`, `is_active`, `two_fa_enabled`, `two_fa_secret`, `backup_codes`, `two_fa_enabled_at`, `certificate_id`, `public_key`, `certificate_pem`, `certificate_expires_at`, `certificate_revoked`, `certificate_revoked_at`, `last_login`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 1, 'admin', 'admin@fsma204.com', 'vi', '$2y$12$zhj1HiGMeExfLyRUZOxq3OgUyEuG76faXyLRrf5y2cSyH6PRhqV5q', 'System Administrator', 'admin', 'enterprise', 'inactive', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2025-10-24 06:32:39', NULL, '2025-10-23 05:12:54', '2025-10-24 06:32:39'),
(2, 2, 'manager', 'manager@fsma204.com', 'en', '$2y$12$e16iFVkfK7.m.AOxRoazUeL4oquXdNRXrVIeYNLQpsZIvb8hGvFfe', 'Warehouse Manager', 'manager', 'premium', 'inactive', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, '2025-10-23 05:12:54', '2025-10-23 05:12:54'),
(3, 2, 'operator', 'operator@fsma204.com', 'en', '$2y$12$fhFKciPy28sG5ceSU7mnsOJoRbn6jmpi7WhqPmg.J2JEKKYy8BGSW', 'Floor Operator', 'operator', 'basic', 'inactive', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, '2025-10-23 05:12:55', '2025-10-23 05:12:55'),
(4, 1, 'hocluongvan', 'anhnguyen94@gmail.com', 'en', '$2y$12$v80T/hcMC7Y2Pr8ux0tCR.NxVG6osaVCqyHWuWHfv6R6jzBYZJkKK', 'Hoc Luong Van', 'manager', 'enterprise', 'inactive', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2025-10-24 05:52:32', NULL, '2025-10-23 13:26:21', '2025-10-24 05:52:32'),
(5, 1, 'hocluongvan20', 'hocluongvan88@gmail.com', 'en', '$2y$12$gtafr2DChDW0UGle7SatFeXhBYupviKwr2qVcZUZqVYFDgPdJUSYi', 'Hoc Luong Van', 'operator', 'enterprise', 'inactive', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2025-10-24 06:03:03', NULL, '2025-10-24 05:49:24', '2025-10-24 06:03:03');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `webhook_logs`
--

CREATE TABLE `webhook_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `gateway` varchar(255) NOT NULL,
  `event_id` varchar(255) NOT NULL,
  `event_type` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `status` enum('pending','processed','failed') NOT NULL DEFAULT 'pending',
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`payload`)),
  `response` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`response`)),
  `error_message` text DEFAULT NULL,
  `ip_address` varchar(255) DEFAULT NULL,
  `attempt_count` int(11) NOT NULL DEFAULT 1,
  `last_attempt_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `archival_audit_logs`
--
ALTER TABLE `archival_audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `archival_audit_logs_auditable_type_auditable_id_index` (`auditable_type`,`auditable_id`),
  ADD KEY `archival_audit_logs_event_type_index` (`event_type`),
  ADD KEY `archival_audit_logs_user_id_index` (`user_id`),
  ADD KEY `archival_audit_logs_original_id_index` (`original_id`),
  ADD KEY `archival_audit_logs_archived_at_index` (`archived_at`);

--
-- Chỉ mục cho bảng `archival_cte_events`
--
ALTER TABLE `archival_cte_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `archival_cte_events_event_type_index` (`event_type`),
  ADD KEY `archival_cte_events_event_date_index` (`event_date`),
  ADD KEY `archival_cte_events_trace_record_id_index` (`trace_record_id`),
  ADD KEY `archival_cte_events_original_id_event_type_index` (`original_id`,`event_type`),
  ADD KEY `archival_cte_events_original_id_index` (`original_id`),
  ADD KEY `archival_cte_events_archived_at_index` (`archived_at`);

--
-- Chỉ mục cho bảng `archival_logs`
--
ALTER TABLE `archival_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `archival_logs_executed_by_foreign` (`executed_by`),
  ADD KEY `archival_logs_data_type_index` (`data_type`),
  ADD KEY `archival_logs_executed_at_index` (`executed_at`),
  ADD KEY `archival_logs_status_index` (`status`);

--
-- Chỉ mục cho bảng `archival_trace_records`
--
ALTER TABLE `archival_trace_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `archival_trace_records_lot_code_index` (`lot_code`),
  ADD KEY `archival_trace_records_status_index` (`status`),
  ADD KEY `archival_trace_records_materialized_path_index` (`materialized_path`),
  ADD KEY `archival_trace_records_organization_id_index` (`organization_id`),
  ADD KEY `archival_trace_records_tlc_status_index` (`tlc`,`status`),
  ADD KEY `archival_trace_records_original_id_index` (`original_id`),
  ADD KEY `archival_trace_records_tlc_index` (`tlc`),
  ADD KEY `archival_trace_records_archived_at_index` (`archived_at`);

--
-- Chỉ mục cho bảng `archival_trace_relationships`
--
ALTER TABLE `archival_trace_relationships`
  ADD PRIMARY KEY (`id`),
  ADD KEY `archival_trace_relationships_parent_id_child_id_index` (`parent_id`,`child_id`),
  ADD KEY `archival_trace_relationships_relationship_type_index` (`relationship_type`),
  ADD KEY `archival_trace_relationships_cte_event_id_index` (`cte_event_id`),
  ADD KEY `archival_trace_relationships_original_id_index` (`original_id`),
  ADD KEY `archival_trace_relationships_archived_at_index` (`archived_at`);

--
-- Chỉ mục cho bảng `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `audit_logs_user_id_index` (`user_id`),
  ADD KEY `audit_logs_table_name_index` (`table_name`),
  ADD KEY `audit_logs_record_id_index` (`record_id`),
  ADD KEY `audit_logs_created_at_index` (`created_at`),
  ADD KEY `audit_logs_lookup_index` (`table_name`,`record_id`,`created_at`),
  ADD KEY `audit_logs_action_index` (`action`),
  ADD KEY `audit_logs_integrity_hash_index` (`integrity_hash`);

--
-- Chỉ mục cho bảng `audit_logs_details`
--
ALTER TABLE `audit_logs_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `audit_logs_details_audit_log_id_index` (`audit_log_id`);

--
-- Chỉ mục cho bảng `batch_signature_operations`
--
ALTER TABLE `batch_signature_operations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `batch_signature_operations_batch_operation_id_unique` (`batch_operation_id`),
  ADD KEY `batch_signature_operations_status_index` (`status`),
  ADD KEY `batch_signature_operations_operation_type_index` (`operation_type`),
  ADD KEY `batch_signature_operations_created_at_index` (`created_at`),
  ADD KEY `batch_signature_operations_user_id_index` (`user_id`);

--
-- Chỉ mục cho bảng `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Chỉ mục cho bảng `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Chỉ mục cho bảng `cte_events`
--
ALTER TABLE `cte_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cte_events_location_id_foreign` (`location_id`),
  ADD KEY `cte_events_partner_id_foreign` (`partner_id`),
  ADD KEY `cte_events_created_by_foreign` (`created_by`),
  ADD KEY `cte_events_event_type_index` (`event_type`),
  ADD KEY `cte_events_event_date_index` (`event_date`),
  ADD KEY `cte_events_trace_record_id_index` (`trace_record_id`),
  ADD KEY `cte_events_traceability_lot_code_index` (`traceability_lot_code`),
  ADD KEY `cte_events_business_gln_index` (`business_gln`),
  ADD KEY `cte_events_fda_compliant_index` (`fda_compliant`),
  ADD KEY `cte_events_voided_by_foreign` (`voided_by`),
  ADD KEY `cte_events_status_index` (`status`),
  ADD KEY `cte_events_voids_event_id_index` (`voids_event_id`),
  ADD KEY `cte_events_organization_id_index` (`organization_id`),
  ADD KEY `cte_events_product_lot_code_index` (`product_lot_code`),
  ADD KEY `cte_events_harvest_location_gln_index` (`harvest_location_gln`),
  ADD KEY `cte_events_cooling_date_index` (`cooling_date`),
  ADD KEY `cte_events_signature_id_index` (`signature_id`);

--
-- Chỉ mục cho bảng `digital_certificates`
--
ALTER TABLE `digital_certificates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `digital_certificates_certificate_id_unique` (`certificate_id`),
  ADD UNIQUE KEY `digital_certificates_serial_number_unique` (`serial_number`),
  ADD KEY `digital_certificates_user_id_index` (`user_id`),
  ADD KEY `digital_certificates_certificate_id_index` (`certificate_id`),
  ADD KEY `digital_certificates_is_revoked_index` (`is_revoked`),
  ADD KEY `digital_certificates_expires_at_index` (`expires_at`);

--
-- Chỉ mục cho bảng `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `documents_doc_number_unique` (`doc_number`),
  ADD KEY `documents_approved_by_foreign` (`approved_by`),
  ADD KEY `documents_type_index` (`type`),
  ADD KEY `documents_status_index` (`status`),
  ADD KEY `documents_effective_date_index` (`effective_date`),
  ADD KEY `documents_organization_id_index` (`organization_id`);

--
-- Chỉ mục cho bảng `document_versions`
--
ALTER TABLE `document_versions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `document_versions_created_by_foreign` (`created_by`),
  ADD KEY `document_versions_document_id_version_index` (`document_id`,`version`),
  ADD KEY `document_versions_organization_id_index` (`organization_id`);

--
-- Chỉ mục cho bảng `error_logs`
--
ALTER TABLE `error_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `error_logs_resolved_by_foreign` (`resolved_by`),
  ADD KEY `error_logs_error_hash_is_resolved_index` (`error_hash`,`is_resolved`),
  ADD KEY `error_logs_severity_created_at_index` (`severity`,`created_at`),
  ADD KEY `error_logs_user_id_created_at_index` (`user_id`,`created_at`),
  ADD KEY `error_logs_error_hash_index` (`error_hash`),
  ADD KEY `error_logs_is_resolved_index` (`is_resolved`),
  ADD KEY `error_logs_severity_index` (`severity`);

--
-- Chỉ mục cho bảng `export_logs`
--
ALTER TABLE `export_logs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `export_logs_export_id_unique` (`export_id`),
  ADD KEY `export_logs_user_id_foreign` (`user_id`),
  ADD KEY `export_logs_export_id_index` (`export_id`),
  ADD KEY `export_logs_file_type_index` (`file_type`),
  ADD KEY `export_logs_export_scope_index` (`export_scope`),
  ADD KEY `export_logs_created_at_index` (`created_at`),
  ADD KEY `export_logs_content_hash_index` (`content_hash`(768));

--
-- Chỉ mục cho bảng `e_signatures`
--
ALTER TABLE `e_signatures`
  ADD PRIMARY KEY (`id`),
  ADD KEY `e_signatures_record_type_record_id_index` (`record_type`,`record_id`),
  ADD KEY `e_signatures_user_id_index` (`user_id`),
  ADD KEY `e_signatures_signed_at_index` (`signed_at`),
  ADD KEY `e_signatures_certificate_id_index` (`certificate_id`),
  ADD KEY `e_signatures_is_revoked_index` (`is_revoked`),
  ADD KEY `e_signatures_timestamp_verified_at_index` (`timestamp_verified_at`),
  ADD KEY `e_signatures_signature_valid_until_index` (`signature_valid_until`),
  ADD KEY `e_signatures_certificate_revocation_checked_index` (`certificate_revocation_checked`),
  ADD KEY `e_signatures_verification_passed_index` (`verification_passed`),
  ADD KEY `e_signatures_signature_format_index` (`signature_format`),
  ADD KEY `e_signatures_ltv_enabled_index` (`ltv_enabled`),
  ADD KEY `e_signatures_batch_operation_id_index` (`batch_operation_id`),
  ADD KEY `e_signatures_delegated_by_user_id_index` (`delegated_by_user_id`),
  ADD KEY `e_signatures_is_delegated_signature_index` (`is_delegated_signature`),
  ADD KEY `e_signatures_is_expired_index` (`is_expired`),
  ADD KEY `e_signatures_expiration_status_index` (`expiration_status`);

--
-- Chỉ mục cho bảng `leads`
--
ALTER TABLE `leads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `leads_email_index` (`email`),
  ADD KEY `leads_status_index` (`status`),
  ADD KEY `leads_created_at_index` (`created_at`),
  ADD KEY `leads_source_index` (`source`);

--
-- Chỉ mục cho bảng `locations`
--
ALTER TABLE `locations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `locations_gln_unique` (`gln`),
  ADD KEY `locations_location_type_index` (`location_type`),
  ADD KEY `locations_gln_index` (`gln`),
  ADD KEY `locations_organization_id_index` (`organization_id`),
  ADD KEY `locations_status_index` (`status`);

--
-- Chỉ mục cho bảng `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_user_id_is_read_index` (`user_id`,`is_read`),
  ADD KEY `notifications_created_at_index` (`created_at`);

--
-- Chỉ mục cho bảng `organizations`
--
ALTER TABLE `organizations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `organizations_name_unique` (`name`);

--
-- Chỉ mục cho bảng `packages`
--
ALTER TABLE `packages`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `partners`
--
ALTER TABLE `partners`
  ADD PRIMARY KEY (`id`),
  ADD KEY `partners_partner_type_index` (`partner_type`),
  ADD KEY `partners_organization_id_index` (`organization_id`);

--
-- Chỉ mục cho bảng `payment_orders`
--
ALTER TABLE `payment_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payment_orders_order_id_unique` (`order_id`),
  ADD KEY `payment_orders_order_id_index` (`order_id`),
  ADD KEY `payment_orders_user_id_index` (`user_id`),
  ADD KEY `payment_orders_status_index` (`status`),
  ADD KEY `payment_orders_created_at_index` (`created_at`),
  ADD KEY `payment_orders_expires_at_index` (`expires_at`);

--
-- Chỉ mục cho bảng `permission_audit_logs`
--
ALTER TABLE `permission_audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `permission_audit_logs_user_id_index` (`user_id`),
  ADD KEY `permission_audit_logs_admin_id_index` (`admin_id`),
  ADD KEY `permission_audit_logs_action_index` (`action`),
  ADD KEY `permission_audit_logs_created_at_index` (`created_at`);

--
-- Chỉ mục cho bảng `pricing`
--
ALTER TABLE `pricing`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `pricing_package_id_unique` (`package_id`);

--
-- Chỉ mục cho bảng `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `products_sku_unique` (`sku`),
  ADD KEY `products_sku_index` (`sku`),
  ADD KEY `products_is_ftl_index` (`is_ftl`),
  ADD KEY `products_organization_id_index` (`organization_id`);

--
-- Chỉ mục cho bảng `retention_logs`
--
ALTER TABLE `retention_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `retention_logs_retention_policy_id_foreign` (`retention_policy_id`),
  ADD KEY `retention_logs_data_type_index` (`data_type`),
  ADD KEY `retention_logs_executed_at_index` (`executed_at`);

--
-- Chỉ mục cho bảng `retention_policies`
--
ALTER TABLE `retention_policies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `retention_policies_policy_name_unique` (`policy_name`),
  ADD KEY `retention_policies_data_type_index` (`data_type`),
  ADD KEY `retention_policies_is_active_index` (`is_active`);

--
-- Chỉ mục cho bảng `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Chỉ mục cho bảng `signature_delegations`
--
ALTER TABLE `signature_delegations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `signature_delegations_delegator_user_id_index` (`delegator_user_id`),
  ADD KEY `signature_delegations_delegatee_user_id_index` (`delegatee_user_id`),
  ADD KEY `signature_delegations_is_active_index` (`is_active`),
  ADD KEY `signature_delegations_valid_until_index` (`valid_until`);

--
-- Chỉ mục cho bảng `signature_performance_metrics`
--
ALTER TABLE `signature_performance_metrics`
  ADD PRIMARY KEY (`id`),
  ADD KEY `signature_performance_metrics_e_signature_id_index` (`e_signature_id`),
  ADD KEY `signature_performance_metrics_created_at_index` (`created_at`);

--
-- Chỉ mục cho bảng `signature_record_types`
--
ALTER TABLE `signature_record_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `signature_record_types_record_type_unique` (`record_type`),
  ADD KEY `signature_record_types_is_active_index` (`is_active`),
  ADD KEY `signature_record_types_record_type_index` (`record_type`);

--
-- Chỉ mục cho bảng `signature_revocations`
--
ALTER TABLE `signature_revocations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `signature_revocations_signature_id_index` (`signature_id`),
  ADD KEY `signature_revocations_revoked_by_user_id_index` (`revoked_by_user_id`),
  ADD KEY `signature_revocations_revoked_at_index` (`revoked_at`),
  ADD KEY `signature_revocations_revocation_category_index` (`revocation_category`);

--
-- Chỉ mục cho bảng `signature_verifications`
--
ALTER TABLE `signature_verifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `signature_verifications_signature_id_index` (`signature_id`),
  ADD KEY `signature_verifications_verified_by_user_id_index` (`verified_by_user_id`),
  ADD KEY `signature_verifications_verification_status_index` (`verification_status`),
  ADD KEY `signature_verifications_verification_type_index` (`verification_type`),
  ADD KEY `signature_verifications_created_at_index` (`created_at`);

--
-- Chỉ mục cho bảng `traceability_analytics`
--
ALTER TABLE `traceability_analytics`
  ADD PRIMARY KEY (`id`),
  ADD KEY `traceability_analytics_user_id_foreign` (`user_id`),
  ADD KEY `traceability_analytics_trace_record_id_created_at_index` (`trace_record_id`,`created_at`),
  ADD KEY `traceability_analytics_query_type_created_at_index` (`query_type`,`created_at`),
  ADD KEY `traceability_analytics_ip_address_index` (`ip_address`);

--
-- Chỉ mục cho bảng `trace_records`
--
ALTER TABLE `trace_records`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `trace_records_tlc_unique` (`tlc`),
  ADD KEY `trace_records_product_id_foreign` (`product_id`),
  ADD KEY `trace_records_location_id_foreign` (`location_id`),
  ADD KEY `trace_records_tlc_index` (`tlc`),
  ADD KEY `trace_records_lot_code_index` (`lot_code`),
  ADD KEY `trace_records_status_index` (`status`),
  ADD KEY `trace_records_materialized_path_index` (`materialized_path`),
  ADD KEY `trace_records_organization_id_index` (`organization_id`);

--
-- Chỉ mục cho bảng `trace_relationships`
--
ALTER TABLE `trace_relationships`
  ADD PRIMARY KEY (`id`),
  ADD KEY `trace_relationships_child_id_foreign` (`child_id`),
  ADD KEY `trace_relationships_parent_id_child_id_index` (`parent_id`,`child_id`),
  ADD KEY `trace_relationships_relationship_type_index` (`relationship_type`),
  ADD KEY `trace_relationships_cte_event_id_index` (`cte_event_id`);

--
-- Chỉ mục cho bảng `transformation_items`
--
ALTER TABLE `transformation_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transformation_items_transformation_event_id_index` (`transformation_event_id`),
  ADD KEY `transformation_items_input_trace_record_id_index` (`input_trace_record_id`);

--
-- Chỉ mục cho bảng `two_fa_logs`
--
ALTER TABLE `two_fa_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `two_fa_logs_user_id_index` (`user_id`),
  ADD KEY `two_fa_logs_attempted_at_index` (`attempted_at`),
  ADD KEY `two_fa_logs_success_index` (`success`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_username_unique` (`username`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD UNIQUE KEY `users_certificate_id_unique` (`certificate_id`),
  ADD KEY `users_email_index` (`email`),
  ADD KEY `users_role_index` (`role`),
  ADD KEY `users_organization_id_index` (`organization_id`),
  ADD KEY `users_preferred_language_index` (`preferred_language`),
  ADD KEY `users_certificate_id_index` (`certificate_id`),
  ADD KEY `users_package_id_index` (`package_id`);

--
-- Chỉ mục cho bảng `webhook_logs`
--
ALTER TABLE `webhook_logs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `webhook_logs_event_id_unique` (`event_id`),
  ADD KEY `webhook_logs_user_id_foreign` (`user_id`),
  ADD KEY `webhook_logs_event_id_index` (`event_id`),
  ADD KEY `webhook_logs_gateway_index` (`gateway`),
  ADD KEY `webhook_logs_status_index` (`status`),
  ADD KEY `webhook_logs_created_at_index` (`created_at`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `archival_audit_logs`
--
ALTER TABLE `archival_audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `archival_cte_events`
--
ALTER TABLE `archival_cte_events`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `archival_logs`
--
ALTER TABLE `archival_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `archival_trace_records`
--
ALTER TABLE `archival_trace_records`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `archival_trace_relationships`
--
ALTER TABLE `archival_trace_relationships`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT cho bảng `audit_logs_details`
--
ALTER TABLE `audit_logs_details`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT cho bảng `batch_signature_operations`
--
ALTER TABLE `batch_signature_operations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `cte_events`
--
ALTER TABLE `cte_events`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `digital_certificates`
--
ALTER TABLE `digital_certificates`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `documents`
--
ALTER TABLE `documents`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `document_versions`
--
ALTER TABLE `document_versions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `error_logs`
--
ALTER TABLE `error_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `export_logs`
--
ALTER TABLE `export_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `e_signatures`
--
ALTER TABLE `e_signatures`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `leads`
--
ALTER TABLE `leads`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `locations`
--
ALTER TABLE `locations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=85;

--
-- AUTO_INCREMENT cho bảng `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `organizations`
--
ALTER TABLE `organizations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `partners`
--
ALTER TABLE `partners`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `payment_orders`
--
ALTER TABLE `payment_orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `permission_audit_logs`
--
ALTER TABLE `permission_audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `pricing`
--
ALTER TABLE `pricing`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `retention_logs`
--
ALTER TABLE `retention_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `retention_policies`
--
ALTER TABLE `retention_policies`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `signature_delegations`
--
ALTER TABLE `signature_delegations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `signature_performance_metrics`
--
ALTER TABLE `signature_performance_metrics`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `signature_record_types`
--
ALTER TABLE `signature_record_types`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `signature_revocations`
--
ALTER TABLE `signature_revocations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `signature_verifications`
--
ALTER TABLE `signature_verifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `traceability_analytics`
--
ALTER TABLE `traceability_analytics`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `trace_records`
--
ALTER TABLE `trace_records`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `trace_relationships`
--
ALTER TABLE `trace_relationships`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `transformation_items`
--
ALTER TABLE `transformation_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `two_fa_logs`
--
ALTER TABLE `two_fa_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `webhook_logs`
--
ALTER TABLE `webhook_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `archival_logs`
--
ALTER TABLE `archival_logs`
  ADD CONSTRAINT `archival_logs_executed_by_foreign` FOREIGN KEY (`executed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `audit_logs_details`
--
ALTER TABLE `audit_logs_details`
  ADD CONSTRAINT `audit_logs_details_audit_log_id_foreign` FOREIGN KEY (`audit_log_id`) REFERENCES `audit_logs` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `batch_signature_operations`
--
ALTER TABLE `batch_signature_operations`
  ADD CONSTRAINT `batch_signature_operations_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `cte_events`
--
ALTER TABLE `cte_events`
  ADD CONSTRAINT `cte_events_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `cte_events_location_id_foreign` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`),
  ADD CONSTRAINT `cte_events_partner_id_foreign` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `cte_events_signature_id_foreign` FOREIGN KEY (`signature_id`) REFERENCES `e_signatures` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `cte_events_trace_record_id_foreign` FOREIGN KEY (`trace_record_id`) REFERENCES `trace_records` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cte_events_voided_by_foreign` FOREIGN KEY (`voided_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `cte_events_voids_event_id_foreign` FOREIGN KEY (`voids_event_id`) REFERENCES `cte_events` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `digital_certificates`
--
ALTER TABLE `digital_certificates`
  ADD CONSTRAINT `digital_certificates_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `documents_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `document_versions`
--
ALTER TABLE `document_versions`
  ADD CONSTRAINT `document_versions_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `document_versions_document_id_foreign` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `error_logs`
--
ALTER TABLE `error_logs`
  ADD CONSTRAINT `error_logs_resolved_by_foreign` FOREIGN KEY (`resolved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `error_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `export_logs`
--
ALTER TABLE `export_logs`
  ADD CONSTRAINT `export_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `e_signatures`
--
ALTER TABLE `e_signatures`
  ADD CONSTRAINT `e_signatures_delegated_by_user_id_foreign` FOREIGN KEY (`delegated_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `e_signatures_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `locations`
--
ALTER TABLE `locations`
  ADD CONSTRAINT `locations_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `payment_orders`
--
ALTER TABLE `payment_orders`
  ADD CONSTRAINT `payment_orders_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `permission_audit_logs`
--
ALTER TABLE `permission_audit_logs`
  ADD CONSTRAINT `permission_audit_logs_admin_id_foreign` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `permission_audit_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `retention_logs`
--
ALTER TABLE `retention_logs`
  ADD CONSTRAINT `retention_logs_retention_policy_id_foreign` FOREIGN KEY (`retention_policy_id`) REFERENCES `retention_policies` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `signature_delegations`
--
ALTER TABLE `signature_delegations`
  ADD CONSTRAINT `signature_delegations_delegatee_user_id_foreign` FOREIGN KEY (`delegatee_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `signature_delegations_delegator_user_id_foreign` FOREIGN KEY (`delegator_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `signature_performance_metrics`
--
ALTER TABLE `signature_performance_metrics`
  ADD CONSTRAINT `signature_performance_metrics_e_signature_id_foreign` FOREIGN KEY (`e_signature_id`) REFERENCES `e_signatures` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `signature_revocations`
--
ALTER TABLE `signature_revocations`
  ADD CONSTRAINT `signature_revocations_revoked_by_user_id_foreign` FOREIGN KEY (`revoked_by_user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `signature_revocations_signature_id_foreign` FOREIGN KEY (`signature_id`) REFERENCES `e_signatures` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `signature_verifications`
--
ALTER TABLE `signature_verifications`
  ADD CONSTRAINT `signature_verifications_signature_id_foreign` FOREIGN KEY (`signature_id`) REFERENCES `e_signatures` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `signature_verifications_verified_by_user_id_foreign` FOREIGN KEY (`verified_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `traceability_analytics`
--
ALTER TABLE `traceability_analytics`
  ADD CONSTRAINT `traceability_analytics_trace_record_id_foreign` FOREIGN KEY (`trace_record_id`) REFERENCES `trace_records` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `traceability_analytics_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `trace_records`
--
ALTER TABLE `trace_records`
  ADD CONSTRAINT `trace_records_location_id_foreign` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trace_records_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `trace_relationships`
--
ALTER TABLE `trace_relationships`
  ADD CONSTRAINT `trace_relationships_child_id_foreign` FOREIGN KEY (`child_id`) REFERENCES `trace_records` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trace_relationships_cte_event_id_foreign` FOREIGN KEY (`cte_event_id`) REFERENCES `cte_events` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trace_relationships_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `trace_records` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `transformation_items`
--
ALTER TABLE `transformation_items`
  ADD CONSTRAINT `transformation_items_input_trace_record_id_foreign` FOREIGN KEY (`input_trace_record_id`) REFERENCES `trace_records` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transformation_items_transformation_event_id_foreign` FOREIGN KEY (`transformation_event_id`) REFERENCES `cte_events` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `two_fa_logs`
--
ALTER TABLE `two_fa_logs`
  ADD CONSTRAINT `two_fa_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_package_id_foreign` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`) ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `webhook_logs`
--
ALTER TABLE `webhook_logs`
  ADD CONSTRAINT `webhook_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
--
-- Cơ sở dữ liệu: `phpmyadmin`
--
CREATE DATABASE IF NOT EXISTS `phpmyadmin` DEFAULT CHARACTER SET utf8 COLLATE utf8_bin;
USE `phpmyadmin`;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `pma__bookmark`
--

CREATE TABLE `pma__bookmark` (
  `id` int(10) UNSIGNED NOT NULL,
  `dbase` varchar(255) NOT NULL DEFAULT '',
  `user` varchar(255) NOT NULL DEFAULT '',
  `label` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `query` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Bookmarks';

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `pma__central_columns`
--

CREATE TABLE `pma__central_columns` (
  `db_name` varchar(64) NOT NULL,
  `col_name` varchar(64) NOT NULL,
  `col_type` varchar(64) NOT NULL,
  `col_length` text DEFAULT NULL,
  `col_collation` varchar(64) NOT NULL,
  `col_isNull` tinyint(1) NOT NULL,
  `col_extra` varchar(255) DEFAULT '',
  `col_default` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Central list of columns';

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `pma__column_info`
--

CREATE TABLE `pma__column_info` (
  `id` int(5) UNSIGNED NOT NULL,
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `table_name` varchar(64) NOT NULL DEFAULT '',
  `column_name` varchar(64) NOT NULL DEFAULT '',
  `comment` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `mimetype` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `transformation` varchar(255) NOT NULL DEFAULT '',
  `transformation_options` varchar(255) NOT NULL DEFAULT '',
  `input_transformation` varchar(255) NOT NULL DEFAULT '',
  `input_transformation_options` varchar(255) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Column information for phpMyAdmin';

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `pma__designer_settings`
--

CREATE TABLE `pma__designer_settings` (
  `username` varchar(64) NOT NULL,
  `settings_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Settings related to Designer';

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `pma__export_templates`
--

CREATE TABLE `pma__export_templates` (
  `id` int(5) UNSIGNED NOT NULL,
  `username` varchar(64) NOT NULL,
  `export_type` varchar(10) NOT NULL,
  `template_name` varchar(64) NOT NULL,
  `template_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Saved export templates';

--
-- Đang đổ dữ liệu cho bảng `pma__export_templates`
--

INSERT INTO `pma__export_templates` (`id`, `username`, `export_type`, `template_name`, `template_data`) VALUES
(1, 'root', 'database', 'forma204_db', '{\"quick_or_custom\":\"quick\",\"what\":\"sql\",\"structure_or_data_forced\":\"0\",\"table_select[]\":[\"activities\",\"archival_audit_logs\",\"archival_cte_events\",\"archival_documents\",\"archival_document_versions\",\"archival_e_signatures\",\"archival_logs\",\"archival_trace_records\",\"archival_trace_relationships\",\"audit_logs\",\"audit_logs_details\",\"batch_signature_operations\",\"cache\",\"cache_locks\",\"cte_events\",\"digital_certificates\",\"documents\",\"document_approvals\",\"document_versions\",\"error_logs\",\"export_logs\",\"e_signatures\",\"leads\",\"locations\",\"migrations\",\"notifications\",\"notification_audit_logs\",\"notification_preferences\",\"notification_templates\",\"organizations\",\"organization_quotas\",\"packages\",\"partners\",\"payment_orders\",\"pricing\",\"products\",\"retention_logs\",\"retention_policies\",\"sessions\",\"signature_delegations\",\"signature_performance_metrics\",\"signature_record_types\",\"signature_revocations\",\"signature_verifications\",\"traceability_analytics\",\"trace_records\",\"trace_relationships\",\"transformation_items\",\"two_fa_logs\",\"users\",\"user_preferences\",\"webhook_logs\"],\"table_structure[]\":[\"activities\",\"archival_audit_logs\",\"archival_cte_events\",\"archival_documents\",\"archival_document_versions\",\"archival_e_signatures\",\"archival_logs\",\"archival_trace_records\",\"archival_trace_relationships\",\"audit_logs\",\"audit_logs_details\",\"batch_signature_operations\",\"cache\",\"cache_locks\",\"cte_events\",\"digital_certificates\",\"documents\",\"document_approvals\",\"document_versions\",\"error_logs\",\"export_logs\",\"e_signatures\",\"leads\",\"locations\",\"migrations\",\"notifications\",\"notification_audit_logs\",\"notification_preferences\",\"notification_templates\",\"organizations\",\"organization_quotas\",\"packages\",\"partners\",\"payment_orders\",\"pricing\",\"products\",\"retention_logs\",\"retention_policies\",\"sessions\",\"signature_delegations\",\"signature_performance_metrics\",\"signature_record_types\",\"signature_revocations\",\"signature_verifications\",\"traceability_analytics\",\"trace_records\",\"trace_relationships\",\"transformation_items\",\"two_fa_logs\",\"users\",\"user_preferences\",\"webhook_logs\"],\"table_data[]\":[\"activities\",\"archival_audit_logs\",\"archival_cte_events\",\"archival_documents\",\"archival_document_versions\",\"archival_e_signatures\",\"archival_logs\",\"archival_trace_records\",\"archival_trace_relationships\",\"audit_logs\",\"audit_logs_details\",\"batch_signature_operations\",\"cache\",\"cache_locks\",\"cte_events\",\"digital_certificates\",\"documents\",\"document_approvals\",\"document_versions\",\"error_logs\",\"export_logs\",\"e_signatures\",\"leads\",\"locations\",\"migrations\",\"notifications\",\"notification_audit_logs\",\"notification_preferences\",\"notification_templates\",\"organizations\",\"organization_quotas\",\"packages\",\"partners\",\"payment_orders\",\"pricing\",\"products\",\"retention_logs\",\"retention_policies\",\"sessions\",\"signature_delegations\",\"signature_performance_metrics\",\"signature_record_types\",\"signature_revocations\",\"signature_verifications\",\"traceability_analytics\",\"trace_records\",\"trace_relationships\",\"transformation_items\",\"two_fa_logs\",\"users\",\"user_preferences\",\"webhook_logs\"],\"aliases_new\":\"\",\"output_format\":\"sendit\",\"filename_template\":\"@DATABASE@\",\"remember_template\":\"on\",\"charset\":\"utf-8\",\"compression\":\"none\",\"maxsize\":\"\",\"codegen_structure_or_data\":\"data\",\"codegen_format\":\"0\",\"csv_separator\":\",\",\"csv_enclosed\":\"\\\"\",\"csv_escaped\":\"\\\"\",\"csv_terminated\":\"AUTO\",\"csv_null\":\"NULL\",\"csv_columns\":\"something\",\"csv_structure_or_data\":\"data\",\"excel_null\":\"NULL\",\"excel_columns\":\"something\",\"excel_edition\":\"win\",\"excel_structure_or_data\":\"data\",\"json_structure_or_data\":\"data\",\"json_unicode\":\"something\",\"latex_caption\":\"something\",\"latex_structure_or_data\":\"structure_and_data\",\"latex_structure_caption\":\"Cấu trúc của bảng @TABLE@\",\"latex_structure_continued_caption\":\"Cấu trúc của bảng @TABLE@ (còn nữa)\",\"latex_structure_label\":\"tab:@TABLE@-structure\",\"latex_relation\":\"something\",\"latex_comments\":\"something\",\"latex_mime\":\"something\",\"latex_columns\":\"something\",\"latex_data_caption\":\"Nội dung của bảng @TABLE@\",\"latex_data_continued_caption\":\"Nội dung của bảng @TABLE@ (còn nữa)\",\"latex_data_label\":\"tab:@TABLE@-data\",\"latex_null\":\"\\\\textit{NULL}\",\"mediawiki_structure_or_data\":\"structure_and_data\",\"mediawiki_caption\":\"something\",\"mediawiki_headers\":\"something\",\"htmlword_structure_or_data\":\"structure_and_data\",\"htmlword_null\":\"NULL\",\"ods_null\":\"NULL\",\"ods_structure_or_data\":\"data\",\"odt_structure_or_data\":\"structure_and_data\",\"odt_relation\":\"something\",\"odt_comments\":\"something\",\"odt_mime\":\"something\",\"odt_columns\":\"something\",\"odt_null\":\"NULL\",\"pdf_report_title\":\"\",\"pdf_structure_or_data\":\"structure_and_data\",\"phparray_structure_or_data\":\"data\",\"sql_include_comments\":\"something\",\"sql_header_comment\":\"\",\"sql_use_transaction\":\"something\",\"sql_compatibility\":\"NONE\",\"sql_structure_or_data\":\"structure_and_data\",\"sql_create_table\":\"something\",\"sql_auto_increment\":\"something\",\"sql_create_view\":\"something\",\"sql_procedure_function\":\"something\",\"sql_create_trigger\":\"something\",\"sql_backquotes\":\"something\",\"sql_type\":\"INSERT\",\"sql_insert_syntax\":\"both\",\"sql_max_query_size\":\"50000\",\"sql_hex_for_binary\":\"something\",\"sql_utc_time\":\"something\",\"texytext_structure_or_data\":\"structure_and_data\",\"texytext_null\":\"NULL\",\"xml_structure_or_data\":\"data\",\"xml_export_events\":\"something\",\"xml_export_functions\":\"something\",\"xml_export_procedures\":\"something\",\"xml_export_tables\":\"something\",\"xml_export_triggers\":\"something\",\"xml_export_views\":\"something\",\"xml_export_contents\":\"something\",\"yaml_structure_or_data\":\"data\",\"\":null,\"lock_tables\":null,\"as_separate_files\":null,\"csv_removeCRLF\":null,\"excel_removeCRLF\":null,\"json_pretty_print\":null,\"htmlword_columns\":null,\"ods_columns\":null,\"sql_dates\":null,\"sql_relation\":null,\"sql_mime\":null,\"sql_disable_fk\":null,\"sql_views_as_tables\":null,\"sql_metadata\":null,\"sql_create_database\":null,\"sql_drop_table\":null,\"sql_if_not_exists\":null,\"sql_simple_view_export\":null,\"sql_view_current_user\":null,\"sql_or_replace_view\":null,\"sql_truncate\":null,\"sql_delayed\":null,\"sql_ignore\":null,\"texytext_columns\":null}');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `pma__favorite`
--

CREATE TABLE `pma__favorite` (
  `username` varchar(64) NOT NULL,
  `tables` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Favorite tables';

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `pma__history`
--

CREATE TABLE `pma__history` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `username` varchar(64) NOT NULL DEFAULT '',
  `db` varchar(64) NOT NULL DEFAULT '',
  `table` varchar(64) NOT NULL DEFAULT '',
  `timevalue` timestamp NOT NULL DEFAULT current_timestamp(),
  `sqlquery` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='SQL history for phpMyAdmin';

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `pma__navigationhiding`
--

CREATE TABLE `pma__navigationhiding` (
  `username` varchar(64) NOT NULL,
  `item_name` varchar(64) NOT NULL,
  `item_type` varchar(64) NOT NULL,
  `db_name` varchar(64) NOT NULL,
  `table_name` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Hidden items of navigation tree';

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `pma__pdf_pages`
--

CREATE TABLE `pma__pdf_pages` (
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `page_nr` int(10) UNSIGNED NOT NULL,
  `page_descr` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='PDF relation pages for phpMyAdmin';

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `pma__recent`
--

CREATE TABLE `pma__recent` (
  `username` varchar(64) NOT NULL,
  `tables` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Recently accessed tables';

--
-- Đang đổ dữ liệu cho bảng `pma__recent`
--

INSERT INTO `pma__recent` (`username`, `tables`) VALUES
('root', '[{\"db\":\"forma204_db\",\"table\":\"users\"},{\"db\":\"forma204_db\",\"table\":\"retention_policies\"},{\"db\":\"forma204_db\",\"table\":\"organizations\"},{\"db\":\"forma204_db\",\"table\":\"migrations\"},{\"db\":\"fsma_trace_app\",\"table\":\"users\"}]');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `pma__relation`
--

CREATE TABLE `pma__relation` (
  `master_db` varchar(64) NOT NULL DEFAULT '',
  `master_table` varchar(64) NOT NULL DEFAULT '',
  `master_field` varchar(64) NOT NULL DEFAULT '',
  `foreign_db` varchar(64) NOT NULL DEFAULT '',
  `foreign_table` varchar(64) NOT NULL DEFAULT '',
  `foreign_field` varchar(64) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Relation table';

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `pma__savedsearches`
--

CREATE TABLE `pma__savedsearches` (
  `id` int(5) UNSIGNED NOT NULL,
  `username` varchar(64) NOT NULL DEFAULT '',
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `search_name` varchar(64) NOT NULL DEFAULT '',
  `search_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Saved searches';

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `pma__table_coords`
--

CREATE TABLE `pma__table_coords` (
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `table_name` varchar(64) NOT NULL DEFAULT '',
  `pdf_page_number` int(11) NOT NULL DEFAULT 0,
  `x` float UNSIGNED NOT NULL DEFAULT 0,
  `y` float UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Table coordinates for phpMyAdmin PDF output';

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `pma__table_info`
--

CREATE TABLE `pma__table_info` (
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `table_name` varchar(64) NOT NULL DEFAULT '',
  `display_field` varchar(64) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Table information for phpMyAdmin';

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `pma__table_uiprefs`
--

CREATE TABLE `pma__table_uiprefs` (
  `username` varchar(64) NOT NULL,
  `db_name` varchar(64) NOT NULL,
  `table_name` varchar(64) NOT NULL,
  `prefs` text NOT NULL,
  `last_update` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Tables'' UI preferences';

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `pma__tracking`
--

CREATE TABLE `pma__tracking` (
  `db_name` varchar(64) NOT NULL,
  `table_name` varchar(64) NOT NULL,
  `version` int(10) UNSIGNED NOT NULL,
  `date_created` datetime NOT NULL,
  `date_updated` datetime NOT NULL,
  `schema_snapshot` text NOT NULL,
  `schema_sql` text DEFAULT NULL,
  `data_sql` longtext DEFAULT NULL,
  `tracking` set('UPDATE','REPLACE','INSERT','DELETE','TRUNCATE','CREATE DATABASE','ALTER DATABASE','DROP DATABASE','CREATE TABLE','ALTER TABLE','RENAME TABLE','DROP TABLE','CREATE INDEX','DROP INDEX','CREATE VIEW','ALTER VIEW','DROP VIEW') DEFAULT NULL,
  `tracking_active` int(1) UNSIGNED NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Database changes tracking for phpMyAdmin';

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `pma__userconfig`
--

CREATE TABLE `pma__userconfig` (
  `username` varchar(64) NOT NULL,
  `timevalue` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `config_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='User preferences storage for phpMyAdmin';

--
-- Đang đổ dữ liệu cho bảng `pma__userconfig`
--

INSERT INTO `pma__userconfig` (`username`, `timevalue`, `config_data`) VALUES
('root', '2025-11-03 12:48:53', '{\"Console\\/Mode\":\"collapse\",\"lang\":\"vi\"}');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `pma__usergroups`
--

CREATE TABLE `pma__usergroups` (
  `usergroup` varchar(64) NOT NULL,
  `tab` varchar(64) NOT NULL,
  `allowed` enum('Y','N') NOT NULL DEFAULT 'N'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='User groups with configured menu items';

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `pma__users`
--

CREATE TABLE `pma__users` (
  `username` varchar(64) NOT NULL,
  `usergroup` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Users and their assignments to user groups';

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `pma__bookmark`
--
ALTER TABLE `pma__bookmark`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `pma__central_columns`
--
ALTER TABLE `pma__central_columns`
  ADD PRIMARY KEY (`db_name`,`col_name`);

--
-- Chỉ mục cho bảng `pma__column_info`
--
ALTER TABLE `pma__column_info`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `db_name` (`db_name`,`table_name`,`column_name`);

--
-- Chỉ mục cho bảng `pma__designer_settings`
--
ALTER TABLE `pma__designer_settings`
  ADD PRIMARY KEY (`username`);

--
-- Chỉ mục cho bảng `pma__export_templates`
--
ALTER TABLE `pma__export_templates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `u_user_type_template` (`username`,`export_type`,`template_name`);

--
-- Chỉ mục cho bảng `pma__favorite`
--
ALTER TABLE `pma__favorite`
  ADD PRIMARY KEY (`username`);

--
-- Chỉ mục cho bảng `pma__history`
--
ALTER TABLE `pma__history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `username` (`username`,`db`,`table`,`timevalue`);

--
-- Chỉ mục cho bảng `pma__navigationhiding`
--
ALTER TABLE `pma__navigationhiding`
  ADD PRIMARY KEY (`username`,`item_name`,`item_type`,`db_name`,`table_name`);

--
-- Chỉ mục cho bảng `pma__pdf_pages`
--
ALTER TABLE `pma__pdf_pages`
  ADD PRIMARY KEY (`page_nr`),
  ADD KEY `db_name` (`db_name`);

--
-- Chỉ mục cho bảng `pma__recent`
--
ALTER TABLE `pma__recent`
  ADD PRIMARY KEY (`username`);

--
-- Chỉ mục cho bảng `pma__relation`
--
ALTER TABLE `pma__relation`
  ADD PRIMARY KEY (`master_db`,`master_table`,`master_field`),
  ADD KEY `foreign_field` (`foreign_db`,`foreign_table`);

--
-- Chỉ mục cho bảng `pma__savedsearches`
--
ALTER TABLE `pma__savedsearches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `u_savedsearches_username_dbname` (`username`,`db_name`,`search_name`);

--
-- Chỉ mục cho bảng `pma__table_coords`
--
ALTER TABLE `pma__table_coords`
  ADD PRIMARY KEY (`db_name`,`table_name`,`pdf_page_number`);

--
-- Chỉ mục cho bảng `pma__table_info`
--
ALTER TABLE `pma__table_info`
  ADD PRIMARY KEY (`db_name`,`table_name`);

--
-- Chỉ mục cho bảng `pma__table_uiprefs`
--
ALTER TABLE `pma__table_uiprefs`
  ADD PRIMARY KEY (`username`,`db_name`,`table_name`);

--
-- Chỉ mục cho bảng `pma__tracking`
--
ALTER TABLE `pma__tracking`
  ADD PRIMARY KEY (`db_name`,`table_name`,`version`);

--
-- Chỉ mục cho bảng `pma__userconfig`
--
ALTER TABLE `pma__userconfig`
  ADD PRIMARY KEY (`username`);

--
-- Chỉ mục cho bảng `pma__usergroups`
--
ALTER TABLE `pma__usergroups`
  ADD PRIMARY KEY (`usergroup`,`tab`,`allowed`);

--
-- Chỉ mục cho bảng `pma__users`
--
ALTER TABLE `pma__users`
  ADD PRIMARY KEY (`username`,`usergroup`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `pma__bookmark`
--
ALTER TABLE `pma__bookmark`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `pma__column_info`
--
ALTER TABLE `pma__column_info`
  MODIFY `id` int(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `pma__export_templates`
--
ALTER TABLE `pma__export_templates`
  MODIFY `id` int(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `pma__history`
--
ALTER TABLE `pma__history`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `pma__pdf_pages`
--
ALTER TABLE `pma__pdf_pages`
  MODIFY `page_nr` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `pma__savedsearches`
--
ALTER TABLE `pma__savedsearches`
  MODIFY `id` int(5) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- Cơ sở dữ liệu: `test`
--
CREATE DATABASE IF NOT EXISTS `test` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `test`;
--
-- Cơ sở dữ liệu: `veximfda`
--
CREATE DATABASE IF NOT EXISTS `veximfda` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `veximfda`;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_agent_consent_tracking`
--

CREATE TABLE `tbl_agent_consent_tracking` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `service_contract_id` char(36) NOT NULL,
  `client_id` char(36) NOT NULL,
  `facility_id` char(36) DEFAULT NULL,
  `agent_user_id` char(36) NOT NULL,
  `agent_email` varchar(255) NOT NULL COMMENT 'Agent email for FDA notification',
  `consent_requested_date` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'When FDA consent email was triggered',
  `consent_requested_by` char(36) DEFAULT NULL COMMENT 'Who triggered the consent request',
  `fda_email_sent` tinyint(1) DEFAULT 0,
  `fda_email_sent_date` timestamp NULL DEFAULT NULL,
  `fda_email_tracking_id` varchar(255) DEFAULT NULL COMMENT 'Email service provider tracking ID',
  `consent_status` varchar(50) DEFAULT 'pending' COMMENT 'pending, acknowledged, declined, timeout',
  `acknowledged_date` timestamp NULL DEFAULT NULL COMMENT 'When agent confirmed via FDA email',
  `acknowledgment_deadline_date` date NOT NULL COMMENT 'Deadline for agent to acknowledge (typically +10 business days)',
  `acknowledgment_overdue` tinyint(1) DEFAULT 0,
  `response_message` text DEFAULT NULL COMMENT 'Agent response or reason for decline',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tracks FDA U.S. Agent consent acknowledgment process (10 business day requirement)';

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_approval_steps`
--

CREATE TABLE `tbl_approval_steps` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `approval_workflow_id` char(36) NOT NULL,
  `step_number` int(11) DEFAULT NULL COMMENT 'Approval step number (1, 2, 3, etc.)',
  `assigned_to` char(36) NOT NULL COMMENT 'User ID of approver',
  `required_role` varchar(100) DEFAULT NULL COMMENT 'Required role for approval (OC, Service Manager, etc.)',
  `status` varchar(50) DEFAULT 'pending' COMMENT 'pending, approved, rejected, withdrawn',
  `e_signature_id` char(36) DEFAULT NULL COMMENT 'Link to e-signature if approved',
  `approval_comment` text DEFAULT NULL,
  `assigned_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `completed_date` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Individual approval steps in a workflow';

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_approval_workflows`
--

CREATE TABLE `tbl_approval_workflows` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `client_id` char(36) NOT NULL,
  `document_id` char(36) NOT NULL,
  `workflow_type` varchar(100) DEFAULT NULL COMMENT 'renewal, submission, registration, certification',
  `status` varchar(50) DEFAULT 'pending' COMMENT 'pending, approved, rejected, withdrawn',
  `required_approvers` int(11) DEFAULT NULL COMMENT 'Number of required approvals',
  `current_step` int(11) DEFAULT 1 COMMENT 'Current approval step',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tracks approval workflows for regulatory documents';

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_audit_log`
--

CREATE TABLE `tbl_audit_log` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `client_id` char(36) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(100) DEFAULT NULL,
  `entity_id` char(36) DEFAULT NULL,
  `old_values` longtext DEFAULT NULL COMMENT 'Encrypted JSON of old values',
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `ip_address` varchar(50) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'success',
  `error_message` text DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `reason_for_change` varchar(1000) DEFAULT NULL COMMENT 'Mandatory reason for sensitive data changes (21 CFR Part 11)',
  `is_immutable` tinyint(1) DEFAULT 1 COMMENT 'Mark audit log as immutable (cannot be deleted)',
  `encryption_version` int(11) DEFAULT 1 COMMENT 'Track encryption version for data rotation',
  `retention_period` int(11) DEFAULT 7 COMMENT 'Years to retain audit log (minimum 7 years)',
  `locked_at` timestamp NULL DEFAULT NULL COMMENT 'Timestamp when record was locked (immutable)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Bẫy `tbl_audit_log`
--
DELIMITER $$
CREATE TRIGGER `tbl_audit_log_immutable_delete` BEFORE DELETE ON `tbl_audit_log` FOR EACH ROW BEGIN
  IF OLD.is_immutable = TRUE THEN
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'Audit logs marked as immutable cannot be deleted (21 CFR Part 11 compliance)';
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_clients`
--

CREATE TABLE `tbl_clients` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `organization_name` varchar(255) NOT NULL,
  `organization_type` varchar(50) DEFAULT NULL,
  `duns_number` varchar(20) DEFAULT NULL,
  `fei_number` varchar(20) DEFAULT NULL,
  `registration_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` varchar(50) DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `tbl_clients`
--

INSERT INTO `tbl_clients` (`id`, `organization_name`, `organization_type`, `duns_number`, `fei_number`, `registration_date`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
('05dbd444-bb73-11f0-8ef6-c86000e1344a', 'LIBRA2', 'Manufacturer', '12365478', '', '2025-11-07 00:45:14', 'active', '2025-11-07 00:45:14', '2025-11-07 00:45:14', NULL),
('74ab4bf3-bac4-11f0-83f1-c86000e1344a', 'VNTEETH', NULL, NULL, NULL, '2025-11-06 03:55:37', 'active', '2025-11-06 03:55:37', '2025-11-07 00:46:28', '2025-11-07 00:46:28'),
('9a15c593-bb14-11f0-83f1-c86000e1344a', 'LIBRA', NULL, NULL, NULL, '2025-11-06 13:29:19', 'active', '2025-11-06 13:29:19', '2025-11-06 13:29:19', NULL),
('da4016e0-bb73-11f0-8ef6-c86000e1344a', 'VNTEETH3', 'Manufacturer', '12365487', '', '2025-11-07 00:51:10', 'active', '2025-11-07 00:51:10', '2025-11-07 00:51:10', NULL),
('ee056d32-bac4-11f0-83f1-c86000e1344a', 'VNTEETH2', NULL, NULL, NULL, '2025-11-06 03:59:01', 'active', '2025-11-06 03:59:01', '2025-11-06 03:59:01', NULL),
('vexim-global-sp', 'VEXIM GLOBAL', 'Service Provider', NULL, NULL, '2025-11-06 04:53:28', 'active', '2025-11-06 04:53:28', '2025-11-06 04:53:28', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_client_facilities`
--

CREATE TABLE `tbl_client_facilities` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `client_id` char(36) NOT NULL,
  `facility_name` varchar(255) NOT NULL,
  `facility_type` varchar(100) DEFAULT NULL,
  `street_address` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state_province` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `fei_number` varchar(20) DEFAULT NULL,
  `duns_number` varchar(20) DEFAULT NULL,
  `primary_contact_name` varchar(255) DEFAULT NULL,
  `primary_contact_email` varchar(255) DEFAULT NULL,
  `primary_contact_phone` varchar(20) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'active',
  `registration_status` varchar(50) DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `primary_contact_email_encrypted` tinyint(1) DEFAULT 0 COMMENT 'Flag indicating field is encrypted',
  `primary_contact_phone_encrypted` tinyint(1) DEFAULT 0,
  `primary_contact_name_encrypted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_client_service_status`
--

CREATE TABLE `tbl_client_service_status` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `client_id` char(36) NOT NULL,
  `has_active_us_agent_contract` tinyint(1) DEFAULT 0 COMMENT 'At least one active U.S. Agent service contract',
  `last_active_contract_end_date` date DEFAULT NULL COMMENT 'When last active contract expired',
  `services_suspended` tinyint(1) DEFAULT 0 COMMENT 'If TRUE, block renewal submissions',
  `suspension_reason` varchar(255) DEFAULT NULL COMMENT 'Why services are suspended',
  `compliance_status` varchar(50) DEFAULT 'compliant' COMMENT 'compliant, non_compliant, at_risk',
  `days_since_contract_expired` int(11) DEFAULT NULL COMMENT 'Business days since contract expiration',
  `last_checked` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Operational status: blocks operations if no active U.S. Agent contract';

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_compliance_status`
--

CREATE TABLE `tbl_compliance_status` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `client_id` char(36) NOT NULL,
  `facility_id` char(36) DEFAULT NULL,
  `compliance_type` varchar(100) DEFAULT NULL,
  `compliance_status` varchar(50) DEFAULT 'pending',
  `last_inspection_date` timestamp NULL DEFAULT NULL,
  `next_inspection_due` date DEFAULT NULL,
  `warning_message` text DEFAULT NULL,
  `action_required` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_documents`
--

CREATE TABLE `tbl_documents` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `client_id` char(36) NOT NULL,
  `submission_id` char(36) DEFAULT NULL,
  `facility_id` char(36) DEFAULT NULL,
  `document_name` varchar(255) NOT NULL,
  `document_type` varchar(100) DEFAULT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `file_mime_type` varchar(100) DEFAULT NULL,
  `uploaded_by` char(36) DEFAULT NULL,
  `upload_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_required` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_document_approvals`
--

CREATE TABLE `tbl_document_approvals` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `document_version_id` char(36) NOT NULL,
  `approver_id` char(36) DEFAULT NULL,
  `approval_order` int(11) NOT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `approved_date` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_document_integrity`
--

CREATE TABLE `tbl_document_integrity` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `document_id` char(36) NOT NULL,
  `version_number` int(11) DEFAULT NULL,
  `content_hash` varchar(255) DEFAULT NULL COMMENT 'SHA-256 hash of document content',
  `hash_algorithm` varchar(50) DEFAULT 'SHA-256',
  `integrity_verified` tinyint(1) DEFAULT 1,
  `verification_timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tracks document integrity for 21 CFR Part 11 compliance';

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_document_versions`
--

CREATE TABLE `tbl_document_versions` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `document_id` char(36) NOT NULL,
  `version_number` int(11) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `uploaded_by` char(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `approval_status` varchar(50) DEFAULT 'pending',
  `approved_by` char(36) DEFAULT NULL,
  `approval_date` timestamp NULL DEFAULT NULL,
  `approval_notes` text DEFAULT NULL,
  `change_notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_encryption_audit`
--

CREATE TABLE `tbl_encryption_audit` (
  `id` char(36) NOT NULL,
  `table_name` varchar(255) DEFAULT NULL,
  `record_id` char(36) DEFAULT NULL,
  `field_name` varchar(255) DEFAULT NULL,
  `issue` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `tbl_encryption_audit`
--

INSERT INTO `tbl_encryption_audit` (`id`, `table_name`, `record_id`, `field_name`, `issue`, `created_at`) VALUES
('90d6b1f3-bb72-11f0-8ef6-c86000e1344a', 'tbl_users', '4bb79840-bac6-11f0-83f1-c86000e1344a', 'first_name', 'Not in encrypted format', '2025-11-07 00:41:57'),
('90d6bf29-bb72-11f0-8ef6-c86000e1344a', 'tbl_users', '7e785a43-d92f-4816-a2dc-d3236289050f', 'first_name', 'Not in encrypted format', '2025-11-07 00:41:57'),
('90da17ba-bb72-11f0-8ef6-c86000e1344a', 'tbl_users', '4bb79840-bac6-11f0-83f1-c86000e1344a', 'last_name', 'Not in encrypted format', '2025-11-07 00:41:57'),
('90da24c5-bb72-11f0-8ef6-c86000e1344a', 'tbl_users', '7e785a43-d92f-4816-a2dc-d3236289050f', 'last_name', 'Not in encrypted format', '2025-11-07 00:41:57');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_encryption_keys`
--

CREATE TABLE `tbl_encryption_keys` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `key_version` int(11) NOT NULL,
  `algorithm` varchar(50) DEFAULT 'AES-256-GCM' COMMENT 'Encryption algorithm used',
  `status` varchar(50) DEFAULT 'active' COMMENT 'active, rotating, retired',
  `rotation_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `retirement_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tracks encryption key versions for key rotation and compliance';

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_e_signatures`
--

CREATE TABLE `tbl_e_signatures` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `document_id` char(36) NOT NULL,
  `signed_by` char(36) NOT NULL COMMENT 'User ID of signer',
  `signature_time` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Time of signature (Part 11)',
  `signature_value` longtext DEFAULT NULL COMMENT 'Digital signature value (HMAC-SHA256)',
  `certificate_serial` varchar(255) DEFAULT NULL COMMENT 'Certificate serial for non-repudiation (Part 11)',
  `intent_to_sign` varchar(1000) DEFAULT NULL COMMENT 'User intention/reason for signature',
  `document_hash` varchar(255) DEFAULT NULL COMMENT 'SHA-256 hash for integrity verification (Part 11)',
  `is_valid` tinyint(1) DEFAULT 1 COMMENT 'Signature validity status',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Electronic signatures compliant with 21 CFR Part 11 - Immutable';

--
-- Bẫy `tbl_e_signatures`
--
DELIMITER $$
CREATE TRIGGER `tbl_e_signatures_immutable` BEFORE UPDATE ON `tbl_e_signatures` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000'
  SET MESSAGE_TEXT = 'Electronic signatures are immutable and cannot be modified (21 CFR Part 11)';
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_fda_api_log`
--

CREATE TABLE `tbl_fda_api_log` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `client_id` char(36) NOT NULL,
  `submission_id` char(36) DEFAULT NULL,
  `api_endpoint` varchar(255) DEFAULT NULL,
  `request_method` varchar(10) DEFAULT NULL,
  `request_payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`request_payload`)),
  `response_status` int(11) DEFAULT NULL,
  `response_payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`response_payload`)),
  `error_message` text DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `retry_count` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_field_encryption_audit`
--

CREATE TABLE `tbl_field_encryption_audit` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `client_id` char(36) NOT NULL,
  `table_name` varchar(255) DEFAULT NULL,
  `field_name` varchar(255) DEFAULT NULL,
  `record_id` char(36) DEFAULT NULL,
  `action` varchar(50) DEFAULT NULL COMMENT 'encrypted, decrypted, re_encrypted',
  `encryption_version` int(11) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Audit trail for field-level encryption operations (21 CFR Part 11)';

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_no_change_certification`
--

CREATE TABLE `tbl_no_change_certification` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `client_id` char(36) NOT NULL,
  `facility_id` char(36) NOT NULL,
  `renewal_schedule_id` char(36) NOT NULL,
  `certification_date` date DEFAULT NULL,
  `certification_text` longtext DEFAULT NULL COMMENT 'No changes since last listing',
  `e_signature_id` char(36) DEFAULT NULL COMMENT 'Link to e-signature record',
  `certified_by` varchar(36) DEFAULT NULL COMMENT 'User ID of OC who certified',
  `submitted_to_fda` tinyint(1) DEFAULT 0,
  `submission_id` char(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tracks no-change certifications for drugs/devices with no updates';

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_products`
--

CREATE TABLE `tbl_products` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `client_id` char(36) NOT NULL,
  `facility_id` char(36) DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_code` varchar(100) DEFAULT NULL,
  `product_type` varchar(100) DEFAULT NULL,
  `product_classification` varchar(50) DEFAULT NULL,
  `intended_use` text DEFAULT NULL,
  `ingredient_statement` text DEFAULT NULL,
  `manufacturing_process` text DEFAULT NULL,
  `regulatory_pathway` varchar(100) DEFAULT NULL,
  `device_list_number` varchar(50) DEFAULT NULL,
  `ndc_number` varchar(20) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'active',
  `version` int(11) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_product_ingredients`
--

CREATE TABLE `tbl_product_ingredients` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `product_id` char(36) NOT NULL,
  `ingredient_name` varchar(255) NOT NULL,
  `percentage_composition` decimal(5,2) DEFAULT NULL,
  `cas_number` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_product_regulation_mappings`
--

CREATE TABLE `tbl_product_regulation_mappings` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `client_id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `regulatory_intelligence_id` varchar(36) NOT NULL,
  `applicability_level` varchar(50) NOT NULL COMMENT 'critical, high, medium, low',
  `requires_action` tinyint(1) DEFAULT 0 COMMENT 'Does this product need action for this regulation?',
  `notes` text DEFAULT NULL,
  `mapped_by` varchar(36) DEFAULT NULL COMMENT 'User who created the mapping',
  `mapped_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Maps products to regulatory changes for RCM (Regulatory Change Management) tracking';

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_regulatory_intelligence`
--

CREATE TABLE `tbl_regulatory_intelligence` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `client_id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `summary` text DEFAULT NULL,
  `risk_level` varchar(50) NOT NULL COMMENT 'critical, high, medium, low',
  `affected_areas` text DEFAULT NULL COMMENT 'JSON array of affected product/facility areas',
  `status` varchar(50) NOT NULL DEFAULT 'new' COMMENT 'new, under_review, requires_action, completed',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Central repository for tracking regulatory changes and intelligence';

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_reminders`
--

CREATE TABLE `tbl_reminders` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `client_id` char(36) NOT NULL,
  `submission_id` char(36) DEFAULT NULL,
  `facility_id` char(36) DEFAULT NULL,
  `reminder_type` varchar(100) DEFAULT NULL,
  `alert_category` varchar(50) DEFAULT 'regulatory' COMMENT 'regulatory (FDA deadline) or business (contract renewal)',
  `service_contract_id` char(36) DEFAULT NULL COMMENT 'Link to service contract if business alert',
  `reminder_title` varchar(255) DEFAULT NULL,
  `reminder_description` text DEFAULT NULL,
  `due_date` date NOT NULL,
  `is_sent` tinyint(1) DEFAULT 0,
  `sent_date` timestamp NULL DEFAULT NULL,
  `is_completed` tinyint(1) DEFAULT 0,
  `completed_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_renewal_alerts`
--

CREATE TABLE `tbl_renewal_alerts` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `client_id` char(36) NOT NULL,
  `facility_id` char(36) NOT NULL,
  `renewal_schedule_id` char(36) NOT NULL,
  `alert_type` varchar(50) DEFAULT NULL COMMENT '90_days, 60_days, 30_days, 7_days, overdue',
  `days_before_deadline` int(11) DEFAULT NULL COMMENT 'Days before deadline when alert was triggered',
  `alert_status` varchar(50) DEFAULT 'pending' COMMENT 'pending, sent, acknowledged, expired',
  `sent_to_oc` tinyint(1) DEFAULT 0 COMMENT 'Official Correspondent notified',
  `sent_to_service_manager` tinyint(1) DEFAULT 0 COMMENT 'Service Manager notified',
  `email_sent_date` timestamp NULL DEFAULT NULL,
  `in_app_notification_sent` tinyint(1) DEFAULT 0,
  `acknowledged_at` timestamp NULL DEFAULT NULL,
  `acknowledged_by` varchar(36) DEFAULT NULL COMMENT 'User ID who acknowledged alert',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Multi-stage renewal alerts (90, 60, 30, 7 days before deadline)';

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_renewal_execution`
--

CREATE TABLE `tbl_renewal_execution` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `client_id` char(36) NOT NULL,
  `facility_id` char(36) NOT NULL,
  `renewal_schedule_id` char(36) NOT NULL,
  `renewal_type` varchar(50) DEFAULT NULL COMMENT 'automatic, manual, no_change_certification',
  `submission_id` char(36) DEFAULT NULL COMMENT 'Link to tbl_submissions',
  `executed_by` varchar(36) DEFAULT NULL COMMENT 'User ID or system process',
  `execution_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `execution_status` varchar(50) DEFAULT 'pending' COMMENT 'pending, submitted, approved, rejected, failed',
  `fda_response_code` varchar(100) DEFAULT NULL COMMENT 'FDA submission response code',
  `error_message` text DEFAULT NULL COMMENT 'Any errors during renewal execution',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tracks all renewal execution attempts and results';

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_renewal_schedule`
--

CREATE TABLE `tbl_renewal_schedule` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `client_id` char(36) NOT NULL,
  `facility_id` char(36) NOT NULL,
  `facility_type` varchar(100) DEFAULT NULL COMMENT 'Drug, Device, Food, Cosmetic',
  `renewal_cycle` int(11) DEFAULT NULL COMMENT 'Renewal frequency in months (12 for annual, 24 for biennial)',
  `service_contract_id` char(36) DEFAULT NULL COMMENT 'Link to active service contract',
  `last_renewal_date` date DEFAULT NULL COMMENT 'Last successful renewal date',
  `next_renewal_date` date DEFAULT NULL COMMENT 'Next scheduled renewal date',
  `grace_period_days` int(11) DEFAULT 30 COMMENT 'Days after renewal_date before non-compliance',
  `status` varchar(50) DEFAULT 'active' COMMENT 'active, paused, completed',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tracks renewal schedules per facility (annual for drugs/devices, biennial for food)';

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_roles`
--

CREATE TABLE `tbl_roles` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `role_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `client_id` char(36) DEFAULT NULL,
  `is_system_role` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `tbl_roles`
--

INSERT INTO `tbl_roles` (`id`, `role_name`, `description`, `client_id`, `is_system_role`, `created_at`) VALUES
('46af91a6-bac2-11f0-83f1-c86000e1344a', 'admin', 'Full system access and management', NULL, 1, '2025-11-06 03:40:01'),
('46af94b7-bac2-11f0-83f1-c86000e1344a', 'compliance_officer', 'Can manage compliance and submissions', NULL, 1, '2025-11-06 03:40:01'),
('46af95d5-bac2-11f0-83f1-c86000e1344a', 'submitter', 'Can submit registrations and products', NULL, 1, '2025-11-06 03:40:01'),
('46af968e-bac2-11f0-83f1-c86000e1344a', 'viewer', 'Read-only access', NULL, 1, '2025-11-06 03:40:01'),
('89726e7c-bacc-11f0-83f1-c86000e1344a', 'system_administrator', 'System Administrator - Full system access for service provider', NULL, 1, '2025-11-06 04:53:28'),
('897291ec-bacc-11f0-83f1-c86000e1344a', 'service_manager', 'Service Manager - Compliance monitoring and system oversight', NULL, 1, '2025-11-06 04:53:28'),
('897292cf-bacc-11f0-83f1-c86000e1344a', 'official_correspondent', 'Official Correspondent - FDA regulatory contact', 'vexim-global-sp', 1, '2025-11-06 04:53:28'),
('897293a7-bacc-11f0-83f1-c86000e1344a', 'us_agent', 'US Agent - Facility representative', 'vexim-global-sp', 1, '2025-11-06 04:53:28'),
('89729432-bacc-11f0-83f1-c86000e1344a', 'compliance_specialist', 'Compliance Specialist - Regulatory specialist', 'vexim-global-sp', 1, '2025-11-06 04:53:28'),
('897294ae-bacc-11f0-83f1-c86000e1344a', 'executive', 'Executive - Company leadership', 'vexim-global-sp', 1, '2025-11-06 04:53:28');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_service_contracts`
--

CREATE TABLE `tbl_service_contracts` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `client_id` char(36) NOT NULL,
  `facility_id` char(36) DEFAULT NULL,
  `contract_type` varchar(100) NOT NULL COMMENT 'US_AGENT_REP, QMS_SUPPORT, COMPLIANCE_SERVICES',
  `contract_start_date` date NOT NULL COMMENT 'Service activation date',
  `contract_end_date` date NOT NULL COMMENT 'Service expiration date (e.g., 2027-01-01 for 2-year contract)',
  `contract_duration_months` int(11) DEFAULT NULL COMMENT 'Duration in months (12, 24, 36, etc.)',
  `contract_status` varchar(50) DEFAULT 'active' COMMENT 'active, pending_renewal, expired, cancelled, suspended',
  `billing_status` varchar(50) DEFAULT 'paid' COMMENT 'paid, due, overdue, failed, cancelled',
  `agent_user_id` char(36) DEFAULT NULL COMMENT 'Vexim staff assigned as U.S. Agent',
  `assigned_by` char(36) DEFAULT NULL COMMENT 'Vexim admin who assigned this contract',
  `assigned_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `renewal_reminder_sent` tinyint(1) DEFAULT 0 COMMENT '90-day renewal reminder sent',
  `renewal_reminder_sent_date` timestamp NULL DEFAULT NULL,
  `contract_notes` text DEFAULT NULL COMMENT 'Special terms, conditions, or notes',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tracks multi-year service contracts (e.g., U.S. Agent representation agreements)';

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_service_contract_history`
--

CREATE TABLE `tbl_service_contract_history` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `service_contract_id` char(36) NOT NULL,
  `client_id` char(36) NOT NULL,
  `change_type` varchar(50) DEFAULT NULL COMMENT 'created, renewed, modified, cancelled, expired',
  `old_values` longtext DEFAULT NULL COMMENT 'Encrypted JSON of previous contract values (for modifications)',
  `new_values` longtext DEFAULT NULL COMMENT 'Encrypted JSON of updated contract values',
  `changed_by` char(36) DEFAULT NULL COMMENT 'User ID who made the change',
  `change_reason` text DEFAULT NULL COMMENT 'Why contract was changed',
  `changed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Immutable audit trail for all contract changes (21 CFR Part 11)';

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_submissions`
--

CREATE TABLE `tbl_submissions` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `client_id` char(36) NOT NULL,
  `facility_id` char(36) NOT NULL,
  `submission_type` varchar(50) NOT NULL,
  `submission_status` varchar(50) DEFAULT 'draft',
  `submission_number` varchar(50) DEFAULT NULL,
  `fda_submission_id` varchar(100) DEFAULT NULL,
  `submitted_date` timestamp NULL DEFAULT NULL,
  `submitted_by` char(36) DEFAULT NULL,
  `reviewed_date` timestamp NULL DEFAULT NULL,
  `reviewed_by` char(36) DEFAULT NULL,
  `approval_date` timestamp NULL DEFAULT NULL,
  `expiration_date` timestamp NULL DEFAULT NULL,
  `comments` text DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_submission_counter`
--

CREATE TABLE `tbl_submission_counter` (
  `id` int(11) NOT NULL,
  `counter` int(11) DEFAULT 0,
  `last_year` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `tbl_submission_counter`
--

INSERT INTO `tbl_submission_counter` (`id`, `counter`, `last_year`) VALUES
(1, 0, 2025),
(2, 0, 2025);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_submission_products`
--

CREATE TABLE `tbl_submission_products` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `submission_id` char(36) NOT NULL,
  `product_id` char(36) NOT NULL,
  `product_version` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_users`
--

CREATE TABLE `tbl_users` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `client_id` char(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'active',
  `email_verified` tinyint(1) DEFAULT 0,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `email_encrypted` tinyint(1) DEFAULT 0,
  `first_name_encrypted` tinyint(1) DEFAULT 1,
  `last_name_encrypted` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `tbl_users`
--

INSERT INTO `tbl_users` (`id`, `client_id`, `email`, `first_name`, `last_name`, `password_hash`, `phone`, `status`, `email_verified`, `email_verified_at`, `last_login`, `created_at`, `updated_at`, `deleted_at`, `email_encrypted`, `first_name_encrypted`, `last_name_encrypted`) VALUES
('4bb79840-bac6-11f0-83f1-c86000e1344a', '74ab4bf3-bac4-11f0-83f1-c86000e1344a', 'huongnguyen@gmail.com', 'Luong', 'Van Hoc', '$2b$10$.qpLqzEIV.eST74nE3cXHurWH9SXFEPs9.XRr4T46dkddTt/HuNI2', NULL, 'active', 0, NULL, NULL, '2025-11-06 04:08:48', '2025-11-07 01:23:50', NULL, 0, 1, 1),
('7e785a43-d92f-4816-a2dc-d3236289050f', 'vexim-global-sp', 'admin@veximglobal.com', 'System', 'Administrator', '$2y$10$pTVwC7.jrwCeu4GObF2YsOBilOE6CFWgg3CFPJM4NJ999AlVAJ.yK', NULL, 'active', 1, NULL, NULL, '2025-11-06 05:12:36', '2025-11-07 01:23:50', NULL, 0, 1, 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_user_clients`
--

CREATE TABLE `tbl_user_clients` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `user_id` char(36) NOT NULL,
  `client_id` char(36) NOT NULL,
  `role_in_client` varchar(100) DEFAULT 'member',
  `assigned_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `assigned_by` char(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `tbl_user_clients`
--

INSERT INTO `tbl_user_clients` (`id`, `user_id`, `client_id`, `role_in_client`, `assigned_date`, `assigned_by`) VALUES
('6e588a7e-bb71-11f0-8ef6-c86000e1344a', '4bb79840-bac6-11f0-83f1-c86000e1344a', '74ab4bf3-bac4-11f0-83f1-c86000e1344a', 'member', '2025-11-07 00:33:50', NULL),
('6e58b402-bb71-11f0-8ef6-c86000e1344a', '7e785a43-d92f-4816-a2dc-d3236289050f', 'vexim-global-sp', 'member', '2025-11-07 00:33:50', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tbl_user_roles`
--

CREATE TABLE `tbl_user_roles` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `user_id` char(36) NOT NULL,
  `role_id` char(36) NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `assigned_by` char(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `tbl_user_roles`
--

INSERT INTO `tbl_user_roles` (`id`, `user_id`, `role_id`, `assigned_at`, `assigned_by`) VALUES
('35a92e2a-bacf-11f0-83f1-c86000e1344a', '7e785a43-d92f-4816-a2dc-d3236289050f', '89726e7c-bacc-11f0-83f1-c86000e1344a', '2025-11-06 05:12:36', '7e785a43-d92f-4816-a2dc-d3236289050f');

-- --------------------------------------------------------

--
-- Cấu trúc đóng vai cho view `v_agent_consent_pending`
-- (See below for the actual view)
--
CREATE TABLE `v_agent_consent_pending` (
`consent_id` char(36)
,`service_contract_id` char(36)
,`client_id` char(36)
,`organization_name` varchar(255)
,`facility_name` varchar(255)
,`agent_email` varchar(255)
,`first_name` varchar(100)
,`last_name` varchar(100)
,`consent_status` varchar(50)
,`acknowledgment_deadline_date` date
,`days_remaining` int(7)
,`acknowledgment_overdue` tinyint(1)
);

-- --------------------------------------------------------

--
-- Cấu trúc đóng vai cho view `v_audit_summary`
-- (See below for the actual view)
--
CREATE TABLE `v_audit_summary` (
`log_date` date
,`action` varchar(100)
,`entity_type` varchar(100)
,`count` bigint(21)
,`successful` decimal(22,0)
,`failed` decimal(22,0)
);

-- --------------------------------------------------------

--
-- Cấu trúc đóng vai cho view `v_contracts_expired`
-- (See below for the actual view)
--
CREATE TABLE `v_contracts_expired` (
`contract_id` char(36)
,`client_id` char(36)
,`organization_name` varchar(255)
,`contract_end_date` date
,`days_expired` int(7)
,`contract_status` varchar(50)
,`services_suspended` tinyint(1)
,`compliance_status` varchar(50)
,`agent_email` varchar(255)
);

-- --------------------------------------------------------

--
-- Cấu trúc đóng vai cho view `v_contracts_renewal_due`
-- (See below for the actual view)
--
CREATE TABLE `v_contracts_renewal_due` (
`contract_id` char(36)
,`client_id` char(36)
,`organization_name` varchar(255)
,`contract_end_date` date
,`days_until_expiration` int(7)
,`contract_status` varchar(50)
,`billing_status` varchar(50)
,`agent_email` varchar(255)
,`contract_notes` text
);

-- --------------------------------------------------------

--
-- Cấu trúc đóng vai cho view `v_part11_compliance_status`
-- (See below for the actual view)
--
CREATE TABLE `v_part11_compliance_status` (
`client_id` char(36)
,`document_id` char(36)
,`document_name` varchar(255)
,`signature_count` bigint(21)
,`last_signed` timestamp
,`signature_status` varchar(8)
,`integrity_status` varchar(10)
);

-- --------------------------------------------------------

--
-- Cấu trúc cho view `v_agent_consent_pending`
--
DROP TABLE IF EXISTS `v_agent_consent_pending`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_agent_consent_pending`  AS SELECT `act`.`id` AS `consent_id`, `act`.`service_contract_id` AS `service_contract_id`, `act`.`client_id` AS `client_id`, `c`.`organization_name` AS `organization_name`, `cf`.`facility_name` AS `facility_name`, `u`.`email` AS `agent_email`, `u`.`first_name` AS `first_name`, `u`.`last_name` AS `last_name`, `act`.`consent_status` AS `consent_status`, `act`.`acknowledgment_deadline_date` AS `acknowledgment_deadline_date`, to_days(`act`.`acknowledgment_deadline_date`) - to_days(curdate()) AS `days_remaining`, `act`.`acknowledgment_overdue` AS `acknowledgment_overdue` FROM (((`tbl_agent_consent_tracking` `act` join `tbl_clients` `c` on(`act`.`client_id` = `c`.`id`)) left join `tbl_client_facilities` `cf` on(`act`.`facility_id` = `cf`.`id`)) join `tbl_users` `u` on(`act`.`agent_user_id` = `u`.`id`)) WHERE `act`.`consent_status` in ('pending','timeout') ORDER BY `act`.`acknowledgment_deadline_date` ASC ;

-- --------------------------------------------------------

--
-- Cấu trúc cho view `v_audit_summary`
--
DROP TABLE IF EXISTS `v_audit_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_audit_summary`  AS SELECT cast(`tbl_audit_log`.`timestamp` as date) AS `log_date`, `tbl_audit_log`.`action` AS `action`, `tbl_audit_log`.`entity_type` AS `entity_type`, count(0) AS `count`, sum(case when `tbl_audit_log`.`status` = 'success' then 1 else 0 end) AS `successful`, sum(case when `tbl_audit_log`.`status` = 'failure' then 1 else 0 end) AS `failed` FROM `tbl_audit_log` GROUP BY cast(`tbl_audit_log`.`timestamp` as date), `tbl_audit_log`.`action`, `tbl_audit_log`.`entity_type` ;

-- --------------------------------------------------------

--
-- Cấu trúc cho view `v_contracts_expired`
--
DROP TABLE IF EXISTS `v_contracts_expired`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_contracts_expired`  AS SELECT `sc`.`id` AS `contract_id`, `sc`.`client_id` AS `client_id`, `c`.`organization_name` AS `organization_name`, `sc`.`contract_end_date` AS `contract_end_date`, to_days(curdate()) - to_days(`sc`.`contract_end_date`) AS `days_expired`, `sc`.`contract_status` AS `contract_status`, `css`.`services_suspended` AS `services_suspended`, `css`.`compliance_status` AS `compliance_status`, `u`.`email` AS `agent_email` FROM (((`tbl_service_contracts` `sc` join `tbl_clients` `c` on(`sc`.`client_id` = `c`.`id`)) join `tbl_client_service_status` `css` on(`sc`.`client_id` = `css`.`client_id`)) left join `tbl_users` `u` on(`sc`.`agent_user_id` = `u`.`id`)) WHERE `sc`.`contract_status` = 'active' AND `sc`.`contract_end_date` < curdate() ORDER BY `sc`.`contract_end_date` ASC ;

-- --------------------------------------------------------

--
-- Cấu trúc cho view `v_contracts_renewal_due`
--
DROP TABLE IF EXISTS `v_contracts_renewal_due`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_contracts_renewal_due`  AS SELECT `sc`.`id` AS `contract_id`, `sc`.`client_id` AS `client_id`, `c`.`organization_name` AS `organization_name`, `sc`.`contract_end_date` AS `contract_end_date`, to_days(`sc`.`contract_end_date`) - to_days(curdate()) AS `days_until_expiration`, `sc`.`contract_status` AS `contract_status`, `sc`.`billing_status` AS `billing_status`, `u`.`email` AS `agent_email`, `sc`.`contract_notes` AS `contract_notes` FROM ((`tbl_service_contracts` `sc` join `tbl_clients` `c` on(`sc`.`client_id` = `c`.`id`)) left join `tbl_users` `u` on(`sc`.`agent_user_id` = `u`.`id`)) WHERE `sc`.`contract_status` = 'active' AND `sc`.`contract_end_date` <= curdate() + interval 90 day AND `sc`.`contract_end_date` > curdate() ORDER BY `sc`.`contract_end_date` ASC ;

-- --------------------------------------------------------

--
-- Cấu trúc cho view `v_part11_compliance_status`
--
DROP TABLE IF EXISTS `v_part11_compliance_status`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_part11_compliance_status`  AS SELECT `d`.`client_id` AS `client_id`, `d`.`id` AS `document_id`, `d`.`document_name` AS `document_name`, count(`es`.`id`) AS `signature_count`, max(`es`.`signature_time`) AS `last_signed`, CASE WHEN count(`es`.`id`) > 0 THEN 'SIGNED' ELSE 'UNSIGNED' END AS `signature_status`, CASE WHEN max(`dh`.`content_hash`) is not null THEN 'VERIFIED' ELSE 'UNVERIFIED' END AS `integrity_status` FROM ((`tbl_documents` `d` left join `tbl_e_signatures` `es` on(`d`.`id` = `es`.`document_id`)) left join `tbl_document_integrity` `dh` on(`d`.`id` = `dh`.`document_id`)) GROUP BY `d`.`client_id`, `d`.`id`, `d`.`document_name` ;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `tbl_agent_consent_tracking`
--
ALTER TABLE `tbl_agent_consent_tracking`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_consent_facility` (`facility_id`),
  ADD KEY `fk_consent_requested_by` (`consent_requested_by`),
  ADD KEY `idx_consent_contract` (`service_contract_id`),
  ADD KEY `idx_consent_client` (`client_id`),
  ADD KEY `idx_consent_agent` (`agent_user_id`),
  ADD KEY `idx_consent_status` (`consent_status`),
  ADD KEY `idx_consent_deadline` (`acknowledgment_deadline_date`),
  ADD KEY `idx_consent_by_deadline` (`acknowledgment_deadline_date`,`consent_status`);

--
-- Chỉ mục cho bảng `tbl_approval_steps`
--
ALTER TABLE `tbl_approval_steps`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_approval_steps_signature` (`e_signature_id`),
  ADD KEY `idx_approval_steps_workflow` (`approval_workflow_id`),
  ADD KEY `idx_approval_steps_assigned_to` (`assigned_to`),
  ADD KEY `idx_approval_steps_status` (`status`),
  ADD KEY `idx_approval_steps_completed` (`completed_date`);

--
-- Chỉ mục cho bảng `tbl_approval_workflows`
--
ALTER TABLE `tbl_approval_workflows`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_approval_workflows_client` (`client_id`),
  ADD KEY `idx_approval_workflows_document` (`document_id`),
  ADD KEY `idx_approval_workflows_status` (`status`),
  ADD KEY `idx_approval_workflows_type` (`workflow_type`),
  ADD KEY `idx_approval_workflows_client_doc` (`client_id`,`document_id`);

--
-- Chỉ mục cho bảng `tbl_audit_log`
--
ALTER TABLE `tbl_audit_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_audit_log_client_id` (`client_id`),
  ADD KEY `idx_audit_log_user_id` (`user_id`),
  ADD KEY `idx_audit_log_entity_type` (`entity_type`),
  ADD KEY `idx_audit_log_timestamp` (`timestamp`),
  ADD KEY `idx_audit_log_action` (`action`),
  ADD KEY `idx_audit_log_client_action` (`client_id`,`action`),
  ADD KEY `idx_audit_log_immutable` (`client_id`,`is_immutable`);

--
-- Chỉ mục cho bảng `tbl_clients`
--
ALTER TABLE `tbl_clients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `organization_name` (`organization_name`),
  ADD KEY `idx_clients_status` (`status`),
  ADD KEY `idx_clients_fei_number` (`fei_number`),
  ADD KEY `idx_clients_id` (`id`);

--
-- Chỉ mục cho bảng `tbl_client_facilities`
--
ALTER TABLE `tbl_client_facilities`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `fei_number` (`fei_number`),
  ADD KEY `idx_facilities_client_id` (`client_id`),
  ADD KEY `idx_facilities_fei_number` (`fei_number`),
  ADD KEY `idx_facilities_status` (`status`);

--
-- Chỉ mục cho bảng `tbl_client_service_status`
--
ALTER TABLE `tbl_client_service_status`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `client_id` (`client_id`),
  ADD KEY `idx_service_status_has_contract` (`has_active_us_agent_contract`),
  ADD KEY `idx_service_status_suspended` (`services_suspended`);

--
-- Chỉ mục cho bảng `tbl_compliance_status`
--
ALTER TABLE `tbl_compliance_status`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_compliance_client_id` (`client_id`),
  ADD KEY `idx_compliance_facility_id` (`facility_id`),
  ADD KEY `idx_compliance_status` (`compliance_status`);

--
-- Chỉ mục cho bảng `tbl_documents`
--
ALTER TABLE `tbl_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_documents_uploaded_by` (`uploaded_by`),
  ADD KEY `idx_documents_client_id` (`client_id`),
  ADD KEY `idx_documents_submission_id` (`submission_id`),
  ADD KEY `idx_documents_facility_id` (`facility_id`),
  ADD KEY `idx_documents_client_type` (`client_id`,`document_type`);

--
-- Chỉ mục cho bảng `tbl_document_approvals`
--
ALTER TABLE `tbl_document_approvals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_doc_approvals_approver` (`approver_id`),
  ADD KEY `idx_document_approvals_version_id` (`document_version_id`),
  ADD KEY `idx_document_approvals_status` (`status`);

--
-- Chỉ mục cho bảng `tbl_document_integrity`
--
ALTER TABLE `tbl_document_integrity`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_document_integrity_document` (`document_id`),
  ADD KEY `idx_document_integrity_version` (`version_number`);

--
-- Chỉ mục cho bảng `tbl_document_versions`
--
ALTER TABLE `tbl_document_versions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `document_id` (`document_id`,`version_number`),
  ADD KEY `fk_doc_versions_uploaded_by` (`uploaded_by`),
  ADD KEY `fk_doc_versions_approved_by` (`approved_by`),
  ADD KEY `idx_document_versions_document_id` (`document_id`),
  ADD KEY `idx_document_versions_approval_status` (`approval_status`);

--
-- Chỉ mục cho bảng `tbl_encryption_audit`
--
ALTER TABLE `tbl_encryption_audit`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `tbl_encryption_keys`
--
ALTER TABLE `tbl_encryption_keys`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `key_version` (`key_version`),
  ADD KEY `idx_key_status` (`status`),
  ADD KEY `idx_key_version` (`key_version`);

--
-- Chỉ mục cho bảng `tbl_e_signatures`
--
ALTER TABLE `tbl_e_signatures`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_e_signatures_document` (`document_id`),
  ADD KEY `idx_e_signatures_signed_by` (`signed_by`),
  ADD KEY `idx_e_signatures_timestamp` (`signature_time`),
  ADD KEY `idx_e_signatures_validity` (`is_valid`);

--
-- Chỉ mục cho bảng `tbl_fda_api_log`
--
ALTER TABLE `tbl_fda_api_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_fda_api_log_client_id` (`client_id`),
  ADD KEY `idx_fda_api_log_submission_id` (`submission_id`),
  ADD KEY `idx_fda_api_log_timestamp` (`timestamp`);

--
-- Chỉ mục cho bảng `tbl_field_encryption_audit`
--
ALTER TABLE `tbl_field_encryption_audit`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_field_encryption_audit_client` (`client_id`),
  ADD KEY `idx_field_encryption_audit_table` (`table_name`),
  ADD KEY `idx_field_encryption_audit_timestamp` (`timestamp`);

--
-- Chỉ mục cho bảng `tbl_no_change_certification`
--
ALTER TABLE `tbl_no_change_certification`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_no_change_cert_schedule` (`renewal_schedule_id`),
  ADD KEY `idx_no_change_cert_client` (`client_id`),
  ADD KEY `idx_no_change_cert_facility` (`facility_id`);

--
-- Chỉ mục cho bảng `tbl_products`
--
ALTER TABLE `tbl_products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_products_client_id` (`client_id`),
  ADD KEY `idx_products_facility_id` (`facility_id`),
  ADD KEY `idx_products_product_code` (`product_code`),
  ADD KEY `idx_products_status` (`status`);

--
-- Chỉ mục cho bảng `tbl_product_ingredients`
--
ALTER TABLE `tbl_product_ingredients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_ingredients_product` (`product_id`);

--
-- Chỉ mục cho bảng `tbl_product_regulation_mappings`
--
ALTER TABLE `tbl_product_regulation_mappings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_prm_product_regulation` (`client_id`,`product_id`,`regulatory_intelligence_id`),
  ADD KEY `fk_prm_mapped_by` (`mapped_by`),
  ADD KEY `idx_prm_client` (`client_id`),
  ADD KEY `idx_prm_product` (`product_id`),
  ADD KEY `idx_prm_reg_intel` (`regulatory_intelligence_id`),
  ADD KEY `idx_prm_applicability` (`applicability_level`),
  ADD KEY `idx_prm_requires_action` (`requires_action`),
  ADD KEY `idx_prm_created_at` (`created_at`);

--
-- Chỉ mục cho bảng `tbl_regulatory_intelligence`
--
ALTER TABLE `tbl_regulatory_intelligence`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_ri_client` (`client_id`);

--
-- Chỉ mục cho bảng `tbl_reminders`
--
ALTER TABLE `tbl_reminders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_reminders_submission` (`submission_id`),
  ADD KEY `fk_reminders_facility` (`facility_id`),
  ADD KEY `idx_reminders_client_id` (`client_id`),
  ADD KEY `idx_reminders_due_date` (`due_date`),
  ADD KEY `idx_reminders_is_sent` (`is_sent`),
  ADD KEY `idx_reminders_service_contract` (`service_contract_id`),
  ADD KEY `idx_reminders_category` (`alert_category`);

--
-- Chỉ mục cho bảng `tbl_renewal_alerts`
--
ALTER TABLE `tbl_renewal_alerts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_renewal_alerts_schedule` (`renewal_schedule_id`),
  ADD KEY `idx_renewal_alerts_client` (`client_id`),
  ADD KEY `idx_renewal_alerts_status` (`alert_status`),
  ADD KEY `idx_renewal_alerts_facility` (`facility_id`),
  ADD KEY `idx_renewal_alerts_alert_type` (`alert_type`);

--
-- Chỉ mục cho bảng `tbl_renewal_execution`
--
ALTER TABLE `tbl_renewal_execution`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_renewal_execution_schedule` (`renewal_schedule_id`),
  ADD KEY `idx_renewal_execution_client` (`client_id`),
  ADD KEY `idx_renewal_execution_facility` (`facility_id`),
  ADD KEY `idx_renewal_execution_status` (`execution_status`),
  ADD KEY `idx_renewal_execution_renewal_type` (`renewal_type`);

--
-- Chỉ mục cho bảng `tbl_renewal_schedule`
--
ALTER TABLE `tbl_renewal_schedule`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_renewal_schedule_client` (`client_id`),
  ADD KEY `idx_renewal_schedule_facility` (`facility_id`),
  ADD KEY `idx_renewal_schedule_next_date` (`next_renewal_date`),
  ADD KEY `idx_renewal_schedule_status` (`status`),
  ADD KEY `idx_renewal_by_type` (`facility_type`),
  ADD KEY `idx_renewal_service_contract` (`service_contract_id`);

--
-- Chỉ mục cho bảng `tbl_roles`
--
ALTER TABLE `tbl_roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `role_name` (`role_name`),
  ADD KEY `fk_roles_client` (`client_id`);

--
-- Chỉ mục cho bảng `tbl_service_contracts`
--
ALTER TABLE `tbl_service_contracts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_service_contracts_assigned_by` (`assigned_by`),
  ADD KEY `idx_service_contracts_client` (`client_id`),
  ADD KEY `idx_service_contracts_facility` (`facility_id`),
  ADD KEY `idx_service_contracts_status` (`contract_status`),
  ADD KEY `idx_service_contracts_billing` (`billing_status`),
  ADD KEY `idx_service_contracts_end_date` (`contract_end_date`),
  ADD KEY `idx_service_contracts_agent` (`agent_user_id`),
  ADD KEY `idx_service_contracts_type` (`contract_type`),
  ADD KEY `idx_contracts_client_status` (`client_id`,`contract_status`),
  ADD KEY `idx_contracts_by_end_date` (`contract_end_date`,`contract_status`);

--
-- Chỉ mục cho bảng `tbl_service_contract_history`
--
ALTER TABLE `tbl_service_contract_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_history_changed_by` (`changed_by`),
  ADD KEY `idx_history_contract` (`service_contract_id`),
  ADD KEY `idx_history_client` (`client_id`),
  ADD KEY `idx_history_changed_at` (`changed_at`),
  ADD KEY `idx_history_contract_type` (`service_contract_id`,`change_type`);

--
-- Chỉ mục cho bảng `tbl_submissions`
--
ALTER TABLE `tbl_submissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `submission_number` (`submission_number`),
  ADD KEY `fk_submissions_submitted_by` (`submitted_by`),
  ADD KEY `fk_submissions_reviewed_by` (`reviewed_by`),
  ADD KEY `idx_submissions_client_id` (`client_id`),
  ADD KEY `idx_submissions_facility_id` (`facility_id`),
  ADD KEY `idx_submissions_status` (`submission_status`),
  ADD KEY `idx_submissions_fda_id` (`fda_submission_id`),
  ADD KEY `idx_submissions_submitted_date` (`submitted_date`);

--
-- Chỉ mục cho bảng `tbl_submission_counter`
--
ALTER TABLE `tbl_submission_counter`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `tbl_submission_products`
--
ALTER TABLE `tbl_submission_products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `submission_id` (`submission_id`,`product_id`),
  ADD KEY `fk_sub_products_product` (`product_id`);

--
-- Chỉ mục cho bảng `tbl_users`
--
ALTER TABLE `tbl_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_client_id` (`client_id`),
  ADD KEY `idx_users_email` (`email`),
  ADD KEY `idx_users_status` (`status`);

--
-- Chỉ mục cho bảng `tbl_user_clients`
--
ALTER TABLE `tbl_user_clients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ux_user_client` (`user_id`,`client_id`),
  ADD KEY `assigned_by` (`assigned_by`),
  ADD KEY `idx_user_clients_user_id` (`user_id`),
  ADD KEY `idx_user_clients_client_id` (`client_id`),
  ADD KEY `idx_user_clients_role` (`role_in_client`);

--
-- Chỉ mục cho bảng `tbl_user_roles`
--
ALTER TABLE `tbl_user_roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`,`role_id`),
  ADD KEY `fk_user_roles_assigned_by` (`assigned_by`),
  ADD KEY `idx_user_roles_user_id` (`user_id`),
  ADD KEY `idx_user_roles_role_id` (`role_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `tbl_submission_counter`
--
ALTER TABLE `tbl_submission_counter`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `tbl_agent_consent_tracking`
--
ALTER TABLE `tbl_agent_consent_tracking`
  ADD CONSTRAINT `fk_consent_agent` FOREIGN KEY (`agent_user_id`) REFERENCES `tbl_users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_consent_client` FOREIGN KEY (`client_id`) REFERENCES `tbl_clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_consent_facility` FOREIGN KEY (`facility_id`) REFERENCES `tbl_client_facilities` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_consent_requested_by` FOREIGN KEY (`consent_requested_by`) REFERENCES `tbl_users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_consent_service_contract` FOREIGN KEY (`service_contract_id`) REFERENCES `tbl_service_contracts` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `tbl_approval_steps`
--
ALTER TABLE `tbl_approval_steps`
  ADD CONSTRAINT `fk_approval_steps_signature` FOREIGN KEY (`e_signature_id`) REFERENCES `tbl_e_signatures` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_approval_steps_workflow` FOREIGN KEY (`approval_workflow_id`) REFERENCES `tbl_approval_workflows` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `tbl_approval_workflows`
--
ALTER TABLE `tbl_approval_workflows`
  ADD CONSTRAINT `fk_approval_workflows_client` FOREIGN KEY (`client_id`) REFERENCES `tbl_clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_approval_workflows_document` FOREIGN KEY (`document_id`) REFERENCES `tbl_documents` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `tbl_audit_log`
--
ALTER TABLE `tbl_audit_log`
  ADD CONSTRAINT `fk_audit_client` FOREIGN KEY (`client_id`) REFERENCES `tbl_clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `tbl_client_facilities`
--
ALTER TABLE `tbl_client_facilities`
  ADD CONSTRAINT `fk_facilities_client` FOREIGN KEY (`client_id`) REFERENCES `tbl_clients` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `tbl_client_service_status`
--
ALTER TABLE `tbl_client_service_status`
  ADD CONSTRAINT `fk_service_status_client` FOREIGN KEY (`client_id`) REFERENCES `tbl_clients` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `tbl_compliance_status`
--
ALTER TABLE `tbl_compliance_status`
  ADD CONSTRAINT `fk_compliance_client` FOREIGN KEY (`client_id`) REFERENCES `tbl_clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_compliance_facility` FOREIGN KEY (`facility_id`) REFERENCES `tbl_client_facilities` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `tbl_documents`
--
ALTER TABLE `tbl_documents`
  ADD CONSTRAINT `fk_documents_client` FOREIGN KEY (`client_id`) REFERENCES `tbl_clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_documents_facility` FOREIGN KEY (`facility_id`) REFERENCES `tbl_client_facilities` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_documents_submission` FOREIGN KEY (`submission_id`) REFERENCES `tbl_submissions` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_documents_uploaded_by` FOREIGN KEY (`uploaded_by`) REFERENCES `tbl_users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `tbl_document_approvals`
--
ALTER TABLE `tbl_document_approvals`
  ADD CONSTRAINT `fk_doc_approvals_approver` FOREIGN KEY (`approver_id`) REFERENCES `tbl_users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_doc_approvals_version` FOREIGN KEY (`document_version_id`) REFERENCES `tbl_document_versions` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `tbl_document_integrity`
--
ALTER TABLE `tbl_document_integrity`
  ADD CONSTRAINT `fk_document_integrity_document` FOREIGN KEY (`document_id`) REFERENCES `tbl_documents` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `tbl_document_versions`
--
ALTER TABLE `tbl_document_versions`
  ADD CONSTRAINT `fk_doc_versions_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `tbl_users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_doc_versions_document` FOREIGN KEY (`document_id`) REFERENCES `tbl_documents` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_doc_versions_uploaded_by` FOREIGN KEY (`uploaded_by`) REFERENCES `tbl_users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `tbl_e_signatures`
--
ALTER TABLE `tbl_e_signatures`
  ADD CONSTRAINT `fk_e_signatures_document` FOREIGN KEY (`document_id`) REFERENCES `tbl_documents` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `tbl_fda_api_log`
--
ALTER TABLE `tbl_fda_api_log`
  ADD CONSTRAINT `fk_fda_api_client` FOREIGN KEY (`client_id`) REFERENCES `tbl_clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_fda_api_submission` FOREIGN KEY (`submission_id`) REFERENCES `tbl_submissions` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `tbl_field_encryption_audit`
--
ALTER TABLE `tbl_field_encryption_audit`
  ADD CONSTRAINT `fk_field_encryption_audit_client` FOREIGN KEY (`client_id`) REFERENCES `tbl_clients` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `tbl_no_change_certification`
--
ALTER TABLE `tbl_no_change_certification`
  ADD CONSTRAINT `fk_no_change_cert_client` FOREIGN KEY (`client_id`) REFERENCES `tbl_clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_no_change_cert_facility` FOREIGN KEY (`facility_id`) REFERENCES `tbl_client_facilities` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_no_change_cert_schedule` FOREIGN KEY (`renewal_schedule_id`) REFERENCES `tbl_renewal_schedule` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `tbl_products`
--
ALTER TABLE `tbl_products`
  ADD CONSTRAINT `fk_products_client` FOREIGN KEY (`client_id`) REFERENCES `tbl_clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_products_facility` FOREIGN KEY (`facility_id`) REFERENCES `tbl_client_facilities` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `tbl_product_ingredients`
--
ALTER TABLE `tbl_product_ingredients`
  ADD CONSTRAINT `fk_ingredients_product` FOREIGN KEY (`product_id`) REFERENCES `tbl_products` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `tbl_product_regulation_mappings`
--
ALTER TABLE `tbl_product_regulation_mappings`
  ADD CONSTRAINT `fk_prm_client` FOREIGN KEY (`client_id`) REFERENCES `tbl_clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_prm_mapped_by` FOREIGN KEY (`mapped_by`) REFERENCES `tbl_users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_prm_product` FOREIGN KEY (`product_id`) REFERENCES `tbl_products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_prm_reg_intel` FOREIGN KEY (`regulatory_intelligence_id`) REFERENCES `tbl_regulatory_intelligence` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `tbl_regulatory_intelligence`
--
ALTER TABLE `tbl_regulatory_intelligence`
  ADD CONSTRAINT `fk_ri_client` FOREIGN KEY (`client_id`) REFERENCES `tbl_clients` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `tbl_reminders`
--
ALTER TABLE `tbl_reminders`
  ADD CONSTRAINT `fk_reminders_client` FOREIGN KEY (`client_id`) REFERENCES `tbl_clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_reminders_facility` FOREIGN KEY (`facility_id`) REFERENCES `tbl_client_facilities` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_reminders_service_contract` FOREIGN KEY (`service_contract_id`) REFERENCES `tbl_service_contracts` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_reminders_submission` FOREIGN KEY (`submission_id`) REFERENCES `tbl_submissions` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `tbl_renewal_alerts`
--
ALTER TABLE `tbl_renewal_alerts`
  ADD CONSTRAINT `fk_renewal_alerts_client` FOREIGN KEY (`client_id`) REFERENCES `tbl_clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_renewal_alerts_facility` FOREIGN KEY (`facility_id`) REFERENCES `tbl_client_facilities` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_renewal_alerts_schedule` FOREIGN KEY (`renewal_schedule_id`) REFERENCES `tbl_renewal_schedule` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `tbl_renewal_execution`
--
ALTER TABLE `tbl_renewal_execution`
  ADD CONSTRAINT `fk_renewal_execution_client` FOREIGN KEY (`client_id`) REFERENCES `tbl_clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_renewal_execution_facility` FOREIGN KEY (`facility_id`) REFERENCES `tbl_client_facilities` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_renewal_execution_schedule` FOREIGN KEY (`renewal_schedule_id`) REFERENCES `tbl_renewal_schedule` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `tbl_renewal_schedule`
--
ALTER TABLE `tbl_renewal_schedule`
  ADD CONSTRAINT `fk_renewal_schedule_client` FOREIGN KEY (`client_id`) REFERENCES `tbl_clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_renewal_schedule_facility` FOREIGN KEY (`facility_id`) REFERENCES `tbl_client_facilities` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_rs_service_contract` FOREIGN KEY (`service_contract_id`) REFERENCES `tbl_service_contracts` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `tbl_roles`
--
ALTER TABLE `tbl_roles`
  ADD CONSTRAINT `fk_roles_client` FOREIGN KEY (`client_id`) REFERENCES `tbl_clients` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `tbl_service_contracts`
--
ALTER TABLE `tbl_service_contracts`
  ADD CONSTRAINT `fk_service_contracts_agent` FOREIGN KEY (`agent_user_id`) REFERENCES `tbl_users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_service_contracts_assigned_by` FOREIGN KEY (`assigned_by`) REFERENCES `tbl_users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_service_contracts_client` FOREIGN KEY (`client_id`) REFERENCES `tbl_clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_service_contracts_facility` FOREIGN KEY (`facility_id`) REFERENCES `tbl_client_facilities` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `tbl_service_contract_history`
--
ALTER TABLE `tbl_service_contract_history`
  ADD CONSTRAINT `fk_history_changed_by` FOREIGN KEY (`changed_by`) REFERENCES `tbl_users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_history_client` FOREIGN KEY (`client_id`) REFERENCES `tbl_clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_history_contract` FOREIGN KEY (`service_contract_id`) REFERENCES `tbl_service_contracts` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `tbl_submissions`
--
ALTER TABLE `tbl_submissions`
  ADD CONSTRAINT `fk_submissions_client` FOREIGN KEY (`client_id`) REFERENCES `tbl_clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_submissions_facility` FOREIGN KEY (`facility_id`) REFERENCES `tbl_client_facilities` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_submissions_reviewed_by` FOREIGN KEY (`reviewed_by`) REFERENCES `tbl_users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_submissions_submitted_by` FOREIGN KEY (`submitted_by`) REFERENCES `tbl_users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `tbl_submission_products`
--
ALTER TABLE `tbl_submission_products`
  ADD CONSTRAINT `fk_sub_products_product` FOREIGN KEY (`product_id`) REFERENCES `tbl_products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_sub_products_submission` FOREIGN KEY (`submission_id`) REFERENCES `tbl_submissions` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `tbl_users`
--
ALTER TABLE `tbl_users`
  ADD CONSTRAINT `fk_users_client` FOREIGN KEY (`client_id`) REFERENCES `tbl_clients` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `tbl_user_clients`
--
ALTER TABLE `tbl_user_clients`
  ADD CONSTRAINT `tbl_user_clients_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tbl_user_clients_ibfk_2` FOREIGN KEY (`client_id`) REFERENCES `tbl_clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tbl_user_clients_ibfk_3` FOREIGN KEY (`assigned_by`) REFERENCES `tbl_users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `tbl_user_roles`
--
ALTER TABLE `tbl_user_roles`
  ADD CONSTRAINT `fk_user_roles_assigned_by` FOREIGN KEY (`assigned_by`) REFERENCES `tbl_users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_user_roles_role` FOREIGN KEY (`role_id`) REFERENCES `tbl_roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
