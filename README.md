# INVEX Forensic System

A secured, premium web-based database system for Judicial Medical Officers (JMOs) and forensic clinics to manage patients, forensic cases, clinical exams, autopsies, and evidence logs.

---

## ⚡ Zero-Setup Quick Start

The INVEX Forensic System is engineered to work out-of-the-box on **Windows, macOS, and Linux** using a **hybrid database engine**. 

* **No MySQL installed?** The application automatically falls back to a native local SQLite database (`server/config/forensic_db.sqlite`), builds all tables, and seeds test data instantly.
* **MySQL available?** Create a `server/.env` file with your connection strings (using `server/.env.example` as a template), and it will connect automatically.

### Prerequisites
* **Node.js**: `v22.0.0` or higher (required for native built-in SQLite support).

### Installation & Launch
1. **Clone the repository** and navigate to the project folder:
   ```bash
   cd invex-forensic-system
   ```
2. **Install all dependencies** for both the frontend and backend in one command:
   ```bash
   npm install
   ```
3. **Start the application** (runs the client and server concurrently):
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to **`http://localhost:5173`** (or the port Vite prints in your console).

---

## 🔑 Test Credentials (Seeded)

Use the following seeded accounts to log in and explore different role-based views of the system:

| Role | Username | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `hashed_pw_123` | Full access, system administration. |
| **Doctor/JMO** | `dr_wickrama` | `hashed_pw_456` | Manage patients, cases, exams, log evidence, generate PDF reports. |
| **Clerk** | `clerk_nimal` | `hashed_pw_789` | Limited access: Manage patients only (Forensic Cases tab is hidden). |

---

## 🛠️ Troubleshooting

### 1. Connection Refused / Cannot Sign In
If the server appears to run but you cannot log in, verify that the API server is actually listening and responsive. You can test it by running:
```bash
curl http://127.0.0.1:5000/api/health
```
If this hangs or fails, check if another process is blocking port `5000`.

### 2. Port 5000 is Already in Use / macOS AirPlay Conflict
On macOS Monterey and later, Apple runs the **AirPlay Receiver** on port `5000` by default. This will cause the backend Express server to fail to bind or hang.

To fix this:
* **Option A**: Disable the AirPlay Receiver. Go to **System Settings > General > AirPlay & Handoff**, and uncheck **AirPlay Receiver**.
* **Option B**: Change the backend port. Create a `server/.env` file and set `PORT=5001`. The Vite proxy will dynamically handle requests in development.