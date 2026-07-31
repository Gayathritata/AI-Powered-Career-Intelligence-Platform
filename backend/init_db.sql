-- =============================================================================
-- CareerCast Database Initialization Script
-- Run this script once to create the database and tables.
-- Usage: mysql -u root -p < init_db.sql
-- =============================================================================

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS careercast
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE careercast;

-- =============================================================================
-- Table: users
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(150)    NOT NULL,
    email       VARCHAR(255)    NOT NULL UNIQUE,
    password    VARCHAR(255)    NOT NULL,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Table: profiles
-- Stores extracted resume information linked to a user (one-to-one).
-- =============================================================================
CREATE TABLE IF NOT EXISTS profiles (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT             NOT NULL UNIQUE,
    phone           VARCHAR(20)     NULL,
    education       VARCHAR(255)    NULL,      -- e.g. "B.Tech"
    degree          VARCHAR(255)    NULL,      -- e.g. "Bachelor of Technology"
    branch          VARCHAR(255)    NULL,      -- e.g. "Artificial Intelligence"
    skills          TEXT            NULL,      -- JSON array e.g. ["Python","SQL"]
    soft_skills     TEXT            NULL,      -- JSON array e.g. ["Leadership"]
    projects        TEXT            NULL,      -- JSON array of project names
    certifications  TEXT            NULL,      -- JSON array e.g. ["AWS","Azure"]
    experience      TEXT            NULL,      -- JSON array or plain text
    resume_path     VARCHAR(500)    NULL,      -- Relative path inside uploads/
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_profiles_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    INDEX idx_profiles_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Verify
-- =============================================================================
SHOW TABLES;
