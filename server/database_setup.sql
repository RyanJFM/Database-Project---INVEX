-- ==========================================
-- MASTER SCRIPT: FORENSIC DATABASE BUILDER
-- ==========================================

-- 1. DATABASE INITIALIZATION
CREATE DATABASE IF NOT EXISTS forensic_db;
USE forensic_db;

-- 2. CLEAN SLATE (Safely drops existing tables to prevent conflicts)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS Court_Report, File_Attachment, Evidence, Postmortem_Exam, Clinical_Exam, Forensic_Case, Patient, Audit_Log, User;
DROP TABLE IF EXISTS Report_Status, File_Type, Evidence_Status, Storage_Location, Evidence_Type, Cause_Of_Death_Category, Exam_Type, Case_Status, Case_Type, Court, Police_Station, Blood_Group, Marital_Status, District, Gender, User_Role;
SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================
-- 3. CREATE LOOKUP TABLES (No Foreign Keys)
-- ==========================================

CREATE TABLE User_Role (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL
);

CREATE TABLE Gender (
    gender_id INT AUTO_INCREMENT PRIMARY KEY,
    gender_name VARCHAR(20) NOT NULL
);

CREATE TABLE District (
    district_id INT AUTO_INCREMENT PRIMARY KEY,
    district_name VARCHAR(100) NOT NULL
);

CREATE TABLE Marital_Status (
    status_id INT AUTO_INCREMENT PRIMARY KEY,
    status_name VARCHAR(50) NOT NULL
);

CREATE TABLE Blood_Group (
    blood_group_id INT AUTO_INCREMENT PRIMARY KEY,
    blood_group_name VARCHAR(10) NOT NULL
);

CREATE TABLE Police_Station (
    station_id INT AUTO_INCREMENT PRIMARY KEY,
    station_name VARCHAR(100) NOT NULL
);

CREATE TABLE Court (
    court_id INT AUTO_INCREMENT PRIMARY KEY,
    court_name VARCHAR(100) NOT NULL
);

CREATE TABLE Case_Type (
    case_type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL
);

CREATE TABLE Case_Status (
    case_status_id INT AUTO_INCREMENT PRIMARY KEY,
    status_name VARCHAR(50) NOT NULL
);

CREATE TABLE Exam_Type (
    exam_type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL
);

CREATE TABLE Cause_Of_Death_Category (
    cod_category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL
);

CREATE TABLE Evidence_Type (
    evidence_type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL
);

CREATE TABLE Storage_Location (
    storage_id INT AUTO_INCREMENT PRIMARY KEY,
    location_name VARCHAR(100) NOT NULL
);

CREATE TABLE Evidence_Status (
    evidence_status_id INT AUTO_INCREMENT PRIMARY KEY,
    status_name VARCHAR(50) NOT NULL
);

CREATE TABLE File_Type (
    file_type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL
);

CREATE TABLE Report_Status (
    report_status_id INT AUTO_INCREMENT PRIMARY KEY,
    status_name VARCHAR(50) NOT NULL
);

-- ==========================================
-- 4. CREATE CORE TABLES (With Foreign Keys)
-- ==========================================

CREATE TABLE User (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    FOREIGN KEY (role_id) REFERENCES User_Role(role_id)
);

CREATE TABLE Audit_Log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action_description VARCHAR(255) NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(user_id)
);

CREATE TABLE Patient (
    patient_id INT AUTO_INCREMENT PRIMARY KEY,
    gender_id INT,
    district_id INT,
    marital_status_id INT,
    blood_group_id INT,
    nic VARCHAR(20) UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    dob DATE,
    address TEXT,
    FOREIGN KEY (gender_id) REFERENCES Gender(gender_id),
    FOREIGN KEY (district_id) REFERENCES District(district_id),
    FOREIGN KEY (marital_status_id) REFERENCES Marital_Status(status_id),
    FOREIGN KEY (blood_group_id) REFERENCES Blood_Group(blood_group_id)
);

CREATE TABLE Forensic_Case (
    case_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    user_id INT NOT NULL,
    station_id INT,
    court_id INT,
    case_type_id INT NOT NULL,
    case_status_id INT NOT NULL,
    incident_date DATE,
    description TEXT,
    FOREIGN KEY (patient_id) REFERENCES Patient(patient_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (station_id) REFERENCES Police_Station(station_id),
    FOREIGN KEY (court_id) REFERENCES Court(court_id),
    FOREIGN KEY (case_type_id) REFERENCES Case_Type(case_type_id),
    FOREIGN KEY (case_status_id) REFERENCES Case_Status(case_status_id)
);

CREATE TABLE Clinical_Exam (
    clinical_id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    exam_type_id INT NOT NULL,
    injury_details TEXT,
    exam_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES Forensic_Case(case_id),
    FOREIGN KEY (exam_type_id) REFERENCES Exam_Type(exam_type_id)
);

CREATE TABLE Postmortem_Exam (
    postmortem_id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    cod_category_id INT NOT NULL,
    cause_of_death TEXT,
    pm_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES Forensic_Case(case_id),
    FOREIGN KEY (cod_category_id) REFERENCES Cause_Of_Death_Category(cod_category_id)
);

CREATE TABLE Evidence (
    evidence_id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    evidence_type_id INT NOT NULL,
    storage_id INT NOT NULL,
    evidence_status_id INT NOT NULL,
    description VARCHAR(255),
    collected_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES Forensic_Case(case_id),
    FOREIGN KEY (evidence_type_id) REFERENCES Evidence_Type(evidence_type_id),
    FOREIGN KEY (storage_id) REFERENCES Storage_Location(storage_id),
    FOREIGN KEY (evidence_status_id) REFERENCES Evidence_Status(evidence_status_id)
);

CREATE TABLE File_Attachment (
    file_id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    file_type_id INT NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES Forensic_Case(case_id),
    FOREIGN KEY (file_type_id) REFERENCES File_Type(file_type_id)
);

CREATE TABLE Court_Report (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    user_id INT NOT NULL,
    report_status_id INT NOT NULL,
    submission_date DATE,
    FOREIGN KEY (case_id) REFERENCES Forensic_Case(case_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (report_status_id) REFERENCES Report_Status(report_status_id)
);

-- ==========================================
-- 5. POPULATE LOOKUP TABLES
-- ==========================================

INSERT INTO User_Role (role_name) VALUES ('Admin'), ('Doctor/JMO'), ('Clerk');
INSERT INTO Gender (gender_name) VALUES ('Male'), ('Female'), ('Unknown');
INSERT INTO District (district_name) VALUES ('Kandy'), ('Colombo'), ('Kurunegala');
INSERT INTO Marital_Status (status_name) VALUES ('Single'), ('Married'), ('Divorced');
INSERT INTO Blood_Group (blood_group_name) VALUES ('A+'), ('O+'), ('B-'), ('Unknown');

INSERT INTO Police_Station (station_name) VALUES ('Peradeniya Police'), ('Kandy HQ'), ('Katugastota Police');
INSERT INTO Court (court_name) VALUES ('Kandy Magistrate Court'), ('High Court Kandy');
INSERT INTO Case_Type (type_name) VALUES ('Clinical Forensic'), ('Postmortem'), ('Toxicology');
INSERT INTO Case_Status (status_name) VALUES ('Open'), ('Pending Lab Results'), ('Closed');

INSERT INTO Exam_Type (type_name) VALUES ('Assault Assessment'), ('Accident Trauma'), ('Sexual Assault');
INSERT INTO Cause_Of_Death_Category (category_name) VALUES ('Natural'), ('Accident'), ('Homicide'), ('Suicide');

INSERT INTO Evidence_Type (type_name) VALUES ('Blood Sample'), ('Weapon'), ('Clothing'), ('Toxicology Swab');
INSERT INTO Storage_Location (location_name) VALUES ('Fridge A'), ('Evidence Locker 1'), ('Cabinet 3');
INSERT INTO Evidence_Status (status_name) VALUES ('Logged'), ('At Lab'), ('Returned'), ('Disposed');

INSERT INTO File_Type (type_name) VALUES ('X-Ray'), ('Crime Scene Photo'), ('Scanned MLEF');
INSERT INTO Report_Status (status_name) VALUES ('Draft'), ('Signed'), ('Submitted to Court');

-- ==========================================
-- 6. POPULATE CORE TABLES (Sample Data)
-- ==========================================

INSERT INTO User (role_id, username, password_hash, full_name) VALUES 
(1, 'admin', 'hashed_pw_123', 'System Administrator'),
(2, 'dr_wickrama', 'hashed_pw_456', 'Dr. C. Wickramasinghe'),
(3, 'clerk_nimal', 'hashed_pw_789', 'Nimal Perera');

INSERT INTO Audit_Log (user_id, action_description) VALUES 
(1, 'System Initialization and User Setup');

INSERT INTO Patient (gender_id, district_id, marital_status_id, blood_group_id, nic, full_name, dob, address) VALUES 
(1, 1, 2, 2, '198512345678', 'Kamal Silva', '1985-05-14', '123 Main St, Peradeniya');

INSERT INTO Forensic_Case (patient_id, user_id, station_id, court_id, case_type_id, case_status_id, incident_date, description) VALUES 
(1, 2, 1, 1, 1, 1, '2026-07-06', 'Patient involved in a road traffic accident near Peradeniya hospital.');

INSERT INTO Clinical_Exam (case_id, exam_type_id, injury_details) VALUES 
(1, 2, 'Fracture of the right femur, grazed abrasions on both elbows.');

INSERT INTO Evidence (case_id, evidence_type_id, storage_id, evidence_status_id, description) VALUES 
(1, 1, 1, 2, 'Blood sample drawn for toxicology screening.');