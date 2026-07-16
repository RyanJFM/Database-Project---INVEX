-- Create Database
CREATE DATABASE IF NOT EXISTS forensic_db;

-- Create Dedicated App User and Grant Permissions
CREATE USER IF NOT EXISTS 'invex_user'@'localhost' IDENTIFIED BY 'invex_secure_password_2026';
GRANT ALL PRIVILEGES ON forensic_db.* TO 'invex_user'@'localhost';
FLUSH PRIVILEGES;

USE forensic_db;

-- 1. Reference Tables
CREATE TABLE IF NOT EXISTS Gender (
  gender_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS District (
  district_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS Marital_Status (
  marital_status_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS Blood_Group (
  blood_group_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(20) NOT NULL
);

-- 2. Patient Table
CREATE TABLE IF NOT EXISTS Patient (
  patient_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  nic VARCHAR(20) UNIQUE,
  age INT,
  gender_id INT,
  district_id INT,
  marital_status_id INT,
  blood_group_id INT,
  address TEXT,
  FOREIGN KEY (gender_id) REFERENCES Gender(gender_id),
  FOREIGN KEY (district_id) REFERENCES District(district_id),
  FOREIGN KEY (marital_status_id) REFERENCES Marital_Status(marital_status_id),
  FOREIGN KEY (blood_group_id) REFERENCES Blood_Group(blood_group_id)
);

-- 3. Case Tables
CREATE TABLE IF NOT EXISTS Police_Station (
  station_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS Court (
  court_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS Case_Type (
  case_type_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS Case_Status (
  case_status_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL
);

-- 4. Forensic Case Table
CREATE TABLE IF NOT EXISTS Forensic_Case (
  case_id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  user_id INT,
  station_id INT,
  court_id INT,
  case_type_id INT,
  case_status_id INT,
  incident_details TEXT,
  FOREIGN KEY (patient_id) REFERENCES Patient(patient_id),
  FOREIGN KEY (station_id) REFERENCES Police_Station(station_id),
  FOREIGN KEY (court_id) REFERENCES Court(court_id),
  FOREIGN KEY (case_type_id) REFERENCES Case_Type(case_type_id),
  FOREIGN KEY (case_status_id) REFERENCES Case_Status(case_status_id)
);

-- Seed Reference Data
INSERT IGNORE INTO Gender (gender_id, name) VALUES (1, 'Male'), (2, 'Female');
INSERT IGNORE INTO District (district_id, name) VALUES (1, 'Colombo'), (2, 'Gampaha'), (3, 'Kalutara');
INSERT IGNORE INTO Marital_Status (marital_status_id, name) VALUES (1, 'Single'), (2, 'Married');
INSERT IGNORE INTO Blood_Group (blood_group_id, name) VALUES (1, 'O+'), (2, 'A+'), (3, 'B+'), (4, 'AB+');

-- Seed Sample Patient
INSERT IGNORE INTO Patient (patient_id, name, nic, age, gender_id, district_id, marital_status_id, blood_group_id, address) 
VALUES (1, 'Saman Fernando', '198420304910', 42, 1, 1, 2, 1, '12/A, Galle Rd, Colombo 03');
