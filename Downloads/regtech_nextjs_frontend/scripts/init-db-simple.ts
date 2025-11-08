import mysql from "mysql2/promise"
import * as dotenv from "dotenv"

dotenv.config()

async function initDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "localhost",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "fda_registry",
    multipleStatements: true,
  })

  try {
    console.log("Connected to MySQL database")
    console.log("Creating tables...")

    // Create tables one by one
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tbl_clients (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        organization_name VARCHAR(255) NOT NULL UNIQUE,
        organization_type VARCHAR(50),
        duns_number VARCHAR(20),
        fei_number VARCHAR(20),
        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        INDEX idx_clients_status (status),
        INDEX idx_clients_fei_number (fei_number)
      )
    `)
    console.log("✓ Created tbl_clients")

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tbl_client_facilities (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        client_id CHAR(36) NOT NULL,
        facility_name VARCHAR(255) NOT NULL,
        facility_type VARCHAR(100),
        street_address VARCHAR(255),
        city VARCHAR(100),
        state_province VARCHAR(100),
        postal_code VARCHAR(20),
        country VARCHAR(100),
        fei_number VARCHAR(20) UNIQUE,
        duns_number VARCHAR(20),
        primary_contact_name VARCHAR(255),
        primary_contact_email VARCHAR(255),
        primary_contact_phone VARCHAR(20),
        status VARCHAR(50) DEFAULT 'active',
        registration_status VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        CONSTRAINT fk_facilities_client FOREIGN KEY (client_id) REFERENCES tbl_clients(id) ON DELETE CASCADE,
        INDEX idx_facilities_client_id (client_id),
        INDEX idx_facilities_fei_number (fei_number),
        INDEX idx_facilities_status (status)
      )
    `)
    console.log("✓ Created tbl_client_facilities")

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tbl_products (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        client_id CHAR(36) NOT NULL,
        facility_id CHAR(36),
        product_name VARCHAR(255) NOT NULL,
        product_code VARCHAR(100),
        product_type VARCHAR(100),
        product_classification VARCHAR(50),
        intended_use TEXT,
        ingredient_statement TEXT,
        manufacturing_process TEXT,
        regulatory_pathway VARCHAR(100),
        device_list_number VARCHAR(50),
        ndc_number VARCHAR(20),
        status VARCHAR(50) DEFAULT 'active',
        version INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        CONSTRAINT fk_products_client FOREIGN KEY (client_id) REFERENCES tbl_clients(id) ON DELETE CASCADE,
        CONSTRAINT fk_products_facility FOREIGN KEY (facility_id) REFERENCES tbl_client_facilities(id) ON DELETE SET NULL,
        INDEX idx_products_client_id (client_id),
        INDEX idx_products_facility_id (facility_id),
        INDEX idx_products_product_code (product_code),
        INDEX idx_products_status (status)
      )
    `)
    console.log("✓ Created tbl_products")

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tbl_product_ingredients (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        product_id CHAR(36) NOT NULL,
        ingredient_name VARCHAR(255) NOT NULL,
        percentage_composition DECIMAL(5,2),
        cas_number VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_ingredients_product FOREIGN KEY (product_id) REFERENCES tbl_products(id) ON DELETE CASCADE
      )
    `)
    console.log("✓ Created tbl_product_ingredients")

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tbl_users (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        client_id CHAR(36) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        password_hash VARCHAR(255),
        phone VARCHAR(20),
        status VARCHAR(50) DEFAULT 'active',
        email_verified BOOLEAN DEFAULT FALSE,
        email_verified_at TIMESTAMP NULL,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        CONSTRAINT fk_users_client FOREIGN KEY (client_id) REFERENCES tbl_clients(id) ON DELETE CASCADE,
        INDEX idx_users_client_id (client_id),
        INDEX idx_users_email (email),
        INDEX idx_users_status (status)
      )
    `)
    console.log("✓ Created tbl_users")

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tbl_roles (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        role_name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        client_id CHAR(36),
        is_system_role BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_roles_client FOREIGN KEY (client_id) REFERENCES tbl_clients(id) ON DELETE CASCADE
      )
    `)
    console.log("✓ Created tbl_roles")

    // Insert default roles
    await connection.execute(`
      INSERT IGNORE INTO tbl_roles (id, role_name, description, is_system_role) VALUES
        (UUID(), 'admin', 'Full system access and management', TRUE),
        (UUID(), 'compliance_officer', 'Can manage compliance and submissions', TRUE),
        (UUID(), 'submitter', 'Can submit registrations and products', TRUE),
        (UUID(), 'viewer', 'Read-only access', TRUE)
    `)
    console.log("✓ Inserted default roles")

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tbl_user_roles (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id CHAR(36) NOT NULL,
        role_id CHAR(36) NOT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        assigned_by CHAR(36),
        UNIQUE(user_id, role_id),
        CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES tbl_users(id) ON DELETE CASCADE,
        CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES tbl_roles(id) ON DELETE CASCADE,
        CONSTRAINT fk_user_roles_assigned_by FOREIGN KEY (assigned_by) REFERENCES tbl_users(id) ON DELETE SET NULL,
        INDEX idx_user_roles_user_id (user_id),
        INDEX idx_user_roles_role_id (role_id)
      )
    `)
    console.log("✓ Created tbl_user_roles")

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tbl_submissions (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        client_id CHAR(36) NOT NULL,
        facility_id CHAR(36) NOT NULL,
        submission_type VARCHAR(50) NOT NULL,
        submission_status VARCHAR(50) DEFAULT 'draft',
        submission_number VARCHAR(50) UNIQUE,
        fda_submission_id VARCHAR(100),
        submitted_date TIMESTAMP NULL,
        submitted_by CHAR(36),
        reviewed_date TIMESTAMP NULL,
        reviewed_by CHAR(36),
        approval_date TIMESTAMP NULL,
        expiration_date TIMESTAMP NULL,
        comments TEXT,
        rejection_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        CONSTRAINT fk_submissions_client FOREIGN KEY (client_id) REFERENCES tbl_clients(id) ON DELETE CASCADE,
        CONSTRAINT fk_submissions_facility FOREIGN KEY (facility_id) REFERENCES tbl_client_facilities(id) ON DELETE CASCADE,
        CONSTRAINT fk_submissions_submitted_by FOREIGN KEY (submitted_by) REFERENCES tbl_users(id) ON DELETE SET NULL,
        CONSTRAINT fk_submissions_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES tbl_users(id) ON DELETE SET NULL,
        INDEX idx_submissions_client_id (client_id),
        INDEX idx_submissions_facility_id (facility_id),
        INDEX idx_submissions_status (submission_status),
        INDEX idx_submissions_fda_id (fda_submission_id),
        INDEX idx_submissions_submitted_date (submitted_date)
      )
    `)
    console.log("✓ Created tbl_submissions")

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tbl_submission_products (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        submission_id CHAR(36) NOT NULL,
        product_id CHAR(36) NOT NULL,
        product_version INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(submission_id, product_id),
        CONSTRAINT fk_sub_products_submission FOREIGN KEY (submission_id) REFERENCES tbl_submissions(id) ON DELETE CASCADE,
        CONSTRAINT fk_sub_products_product FOREIGN KEY (product_id) REFERENCES tbl_products(id) ON DELETE CASCADE
      )
    `)
    console.log("✓ Created tbl_submission_products")

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tbl_compliance_status (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        client_id CHAR(36) NOT NULL,
        facility_id CHAR(36),
        compliance_type VARCHAR(100),
        compliance_status VARCHAR(50) DEFAULT 'pending',
        last_inspection_date TIMESTAMP NULL,
        next_inspection_due DATE,
        warning_message TEXT,
        action_required BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_compliance_client FOREIGN KEY (client_id) REFERENCES tbl_clients(id) ON DELETE CASCADE,
        CONSTRAINT fk_compliance_facility FOREIGN KEY (facility_id) REFERENCES tbl_client_facilities(id) ON DELETE SET NULL,
        INDEX idx_compliance_client_id (client_id),
        INDEX idx_compliance_facility_id (facility_id),
        INDEX idx_compliance_status (compliance_status)
      )
    `)
    console.log("✓ Created tbl_compliance_status")

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tbl_documents (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        client_id CHAR(36) NOT NULL,
        submission_id CHAR(36),
        facility_id CHAR(36),
        document_name VARCHAR(255) NOT NULL,
        document_type VARCHAR(100),
        file_path VARCHAR(500),
        file_size INT,
        file_mime_type VARCHAR(100),
        uploaded_by CHAR(36),
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_required BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        CONSTRAINT fk_documents_client FOREIGN KEY (client_id) REFERENCES tbl_clients(id) ON DELETE CASCADE,
        CONSTRAINT fk_documents_submission FOREIGN KEY (submission_id) REFERENCES tbl_submissions(id) ON DELETE SET NULL,
        CONSTRAINT fk_documents_facility FOREIGN KEY (facility_id) REFERENCES tbl_client_facilities(id) ON DELETE SET NULL,
        CONSTRAINT fk_documents_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES tbl_users(id) ON DELETE SET NULL,
        INDEX idx_documents_client_id (client_id),
        INDEX idx_documents_submission_id (submission_id),
        INDEX idx_documents_facility_id (facility_id)
      )
    `)
    console.log("✓ Created tbl_documents")

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tbl_audit_log (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        client_id CHAR(36) NOT NULL,
        user_id CHAR(36),
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(100),
        entity_id CHAR(36),
        old_values JSON,
        new_values JSON,
        ip_address VARCHAR(50),
        user_agent VARCHAR(500),
        status VARCHAR(50) DEFAULT 'success',
        error_message TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_audit_client FOREIGN KEY (client_id) REFERENCES tbl_clients(id) ON DELETE CASCADE,
        CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES tbl_users(id) ON DELETE SET NULL,
        INDEX idx_audit_log_client_id (client_id),
        INDEX idx_audit_log_user_id (user_id),
        INDEX idx_audit_log_entity_type (entity_type),
        INDEX idx_audit_log_timestamp (timestamp),
        INDEX idx_audit_log_action (action)
      )
    `)
    console.log("✓ Created tbl_audit_log")

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tbl_fda_api_log (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        client_id CHAR(36) NOT NULL,
        submission_id CHAR(36),
        api_endpoint VARCHAR(255),
        request_method VARCHAR(10),
        request_payload JSON,
        response_status INT,
        response_payload JSON,
        error_message TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        retry_count INT DEFAULT 0,
        CONSTRAINT fk_fda_api_client FOREIGN KEY (client_id) REFERENCES tbl_clients(id) ON DELETE CASCADE,
        CONSTRAINT fk_fda_api_submission FOREIGN KEY (submission_id) REFERENCES tbl_submissions(id) ON DELETE SET NULL,
        INDEX idx_fda_api_log_client_id (client_id),
        INDEX idx_fda_api_log_submission_id (submission_id),
        INDEX idx_fda_api_log_timestamp (timestamp)
      )
    `)
    console.log("✓ Created tbl_fda_api_log")

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tbl_reminders (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        client_id CHAR(36) NOT NULL,
        submission_id CHAR(36),
        facility_id CHAR(36),
        reminder_type VARCHAR(100),
        reminder_title VARCHAR(255),
        reminder_description TEXT,
        due_date DATE NOT NULL,
        is_sent BOOLEAN DEFAULT FALSE,
        sent_date TIMESTAMP NULL,
        is_completed BOOLEAN DEFAULT FALSE,
        completed_date TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_reminders_client FOREIGN KEY (client_id) REFERENCES tbl_clients(id) ON DELETE CASCADE,
        CONSTRAINT fk_reminders_submission FOREIGN KEY (submission_id) REFERENCES tbl_submissions(id) ON DELETE SET NULL,
        CONSTRAINT fk_reminders_facility FOREIGN KEY (facility_id) REFERENCES tbl_client_facilities(id) ON DELETE SET NULL,
        INDEX idx_reminders_client_id (client_id),
        INDEX idx_reminders_due_date (due_date),
        INDEX idx_reminders_is_sent (is_sent)
      )
    `)
    console.log("✓ Created tbl_reminders")

    console.log("\n✅ Database initialization completed successfully!")
    console.log("All 14 tables have been created.")
  } catch (error) {
    console.error("❌ Error initializing database:", error)
    throw error
  } finally {
    await connection.end()
  }
}

initDatabase()
  .then(() => {
    console.log("\n🎉 Setup complete! You can now start the application.")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Failed to initialize database:", error)
    process.exit(1)
  })
