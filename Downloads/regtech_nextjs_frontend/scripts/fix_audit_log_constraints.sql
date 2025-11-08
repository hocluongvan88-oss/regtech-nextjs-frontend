-- Fix audit log table to support encrypted data
-- The JSON CHECK constraints conflict with encrypted data storage

USE veximfda;

-- Drop the CHECK constraints on old_values and new_values
-- These columns store encrypted data which is not valid JSON
ALTER TABLE tbl_audit_log 
  MODIFY COLUMN `old_values` LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  MODIFY COLUMN `new_values` LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL;

-- Verify the change
SHOW CREATE TABLE tbl_audit_log;
