# Sandesh (सनdesh)

**Local-First, Namespace-Based Email System**

Sandesh is a self-contained intranet email system designed for offline environments like hackathons, campuses, and secure offices. It allows users on the same local network to send and receive emails without internet access, domains, or third-party servers.

## Features

*   **Zero Internet Required:** Works entirely on LAN/WiFi/Hotspot.
*   **No Domain Names:** Uses local namespaces (e.g., `user@hackathon`).
*   **Webmail UI:** Clean, responsive React-based interface.
*   **Full Email Support:** Send, Receive, CC, Folders.
*   **Admin Control:** Centralized user management.
*   **Portable:** Single Docker container deployment.

## Tech Stack

*   **Backend:** Python 3.11+, FastAPI, SQLite, Custom SMTP (aiosmtpd).
*   **Frontend:** React, Vite, Tailwind CSS.
*   **Infrastructure:** Docker, Docker Compose.

## Prerequisites

*   Docker & Docker Compose installed.

## How to Run

1.  **Clone the repository:**
    ```bash
    git clone <repo_url>
    cd sandesh
    ```

2.  **Configure Environment (Optional):**
    Edit `docker-compose.yml` or set environment variables:
    *   `SANDESH_NAMESPACE`: The local "domain" (default: `local`).
    *   `SANDESH_ADMIN_USER`: Admin username (default: `admin`).
    *   `SANDESH_ADMIN_PASSWORD`: Admin password (default: `admin123`).

3.  **Start the System:**
    ```bash
    docker compose up --build -d
    ```

4.  **Access Web UI:**
    Open `http://localhost:8000` (or the server's LAN IP).

5.  **Setup Users:**
    *   Login as Admin.
    *   Go to "Admin" in the sidebar.
    *   Create users (e.g., `alice`, `bob`).

## Usage

*   **Address Format:** `username@namespace` (e.g., `alice@local` if namespace is `local`).
*   **Sending Mail:** Click "Compose", enter recipients (comma separated), subject, and body.
*   **SMTP:** The server listens on port `2525` for internal routing.

## Screenshots

*(Placeholders)*
*   [Login Screen]
*   [Inbox View]
*   [Compose Window]

## License

MIT License
