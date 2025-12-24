# Sandesh (सनdesh) 📬

**A local-first email system for private networks.**

Sandesh provides a complete, self-hosted email experience without requiring internet connectivity or external mail servers. Perfect for office intranets, home labs, development environments, and air-gapped networks.

![License](https://img.shields.io/badge/license-MIT-green)
![Docker](https://img.shields.io/badge/docker-supported-blue)

---

## Features

- 📧 **Full Email Experience** - Send, receive, organize, and search emails
- 🔐 **Local Authentication** - No external auth providers needed
- 📁 **Folder Management** - Inbox, Sent, Trash, plus custom folders
- 👥 **Multi-user Support** - Create accounts for your team
- 🎨 **Modern UI** - Gmail-inspired interface with dark/light themes
- 🔧 **Admin Console** - Manage users and system settings
- 📦 **Docker Ready** - Single container deployment
- 🌐 **No Internet Required** - Works completely offline

---
<img width="1807" height="889" alt="image" src="https://github.com/user-attachments/assets/f1f00595-f89b-4690-857c-6e6f90605ef7" />
<img width="1917" height="937" alt="image" src="https://github.com/user-attachments/assets/f95c9494-48e4-47d8-934a-135cd9973d5d" />
<img width="1487" height="843" alt="image" src="https://github.com/user-attachments/assets/92c41c0a-cadb-4f9c-9f68-9bbc46f3fb14" />


## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Port 8000 (web) and 2525 (SMTP) available

### 1. Clone and Deploy

```bash
git clone https://github.com/yourusername/sandesh.git
cd sandesh
docker compose up --build -d
```

### 2. Access the Web Interface

Open [http://localhost:8000](http://localhost:8000) in your browser.

### 3. Login as Administrator

Default credentials:
- **Username**: `admin`
- **Password**: `admin123`

> ⚠️ Change the admin password in production by setting environment variables.

---

## Configuration

### Environment Variables

Set these in `docker-compose.yml` or your deployment environment:

| Variable | Description | Default |
|----------|-------------|---------|
| `SANDESH_NAMESPACE` | Email domain (e.g., `office`) | `local` |
| `SANDESH_ADMIN_USER` | Admin username | `admin` |
| `SANDESH_ADMIN_PASSWORD` | Admin password | `admin123` |
| `DATABASE_URL` | SQLite database path | `sqlite:////data/sandesh.db` |

### Example docker-compose.yml

```yaml
version: '3.8'
services:
  sandesh:
    build: .
    ports:
      - "8000:8000"  # Web UI
      - "2525:2525"  # SMTP
    volumes:
      - sandesh_data:/data
    environment:
      - SANDESH_NAMESPACE=office
      - SANDESH_ADMIN_USER=admin
      - SANDESH_ADMIN_PASSWORD=supersecret123
      - DATABASE_URL=sqlite:////data/sandesh.db

volumes:
  sandesh_data:
```

---

## Getting Started Guide

### Step 1: First Login

1. Open http://localhost:8000
2. Login with admin credentials
3. You'll see the main inbox view

### Step 2: Update Your Profile

1. Click your username in the bottom-left sidebar
2. Select "Your Profile"
3. Set your **Display Name** (how you appear in emails)
4. Add an optional **Email Signature**
5. Save changes

### Step 3: Create Users (Admin)

1. Click "Admin Console" in the sidebar
2. Click "Add User"
3. Enter username (becomes part of their email address)
4. Enter a password
5. Optionally set their display name
6. Click "Create User"

**Understanding Email Addresses:**
- Username: `alice`
- Namespace: `office`
- Email: `alice@office`

### Step 4: Customize Instance (Admin)

1. Click your username → "System Settings"
2. Set **Instance Name** (shown on login page)
3. Set **Mail Namespace** (changes all email addresses)
   - ⚠️ Changing namespace affects all users
4. Save with confirmation

### Step 5: Send Your First Email

1. Click the **Compose** button
2. Enter recipient: `username@namespace`
3. Add subject and message
4. Click **Send**

---

## Identity System

Sandesh uses a clear identity model:

| Field | Editable By | Description |
|-------|-------------|-------------|
| Username | Nobody | Permanent unique identifier |
| Display Name | User | Friendly name shown in UI and emails |
| Email Address | Admin only | Generated: `username@namespace` |
| Signature | User | Auto-appended to outgoing emails |

### How Emails Appear

```
From: Alice Johnson <alice@office>
To: bob@office
Subject: Hello!

Hi Bob, ...

--
Alice Johnson
Engineering Team
```

---

## API Documentation

See [DOCUMENTATION.md](DOCUMENTATION.md) for complete API reference.

### Quick Examples

**Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**Get Profile:**
```bash
curl http://localhost:8000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Send Email:**
```bash
curl -X POST http://localhost:8000/api/mail/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"to":["bob@office"],"subject":"Hello","body":"Hi there!"}'
```

---

## Tech Stack

- **Frontend**: React, React Router, Lucide Icons
- **Backend**: FastAPI, SQLAlchemy, Pydantic
- **Database**: SQLite
- **SMTP**: aiosmtpd
- **Auth**: JWT tokens, bcrypt
- **Deployment**: Docker, multi-stage build

---

## Development

### Local Development

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn backend.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

### Project Structure

```
sandesh/
├── backend/
│   ├── api/          # REST endpoints
│   ├── core/         # Domain entities, exceptions
│   ├── infrastructure/  # DB, SMTP, security
│   ├── services/     # Business logic
│   ├── main.py       # FastAPI app
│   └── config.py     # Configuration
├── frontend/
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page views
│   │   └── api.js       # API client
│   └── index.html
├── docker-compose.yml
├── Dockerfile
├── DOCUMENTATION.md
└── README.md
```

---

## Troubleshooting

### Port already in use
```bash
# Check what's using ports 8000 or 2525
lsof -i :8000
lsof -i :2525
```

### Container won't start
```bash
# View logs
docker logs sandesh

# Rebuild from scratch
docker compose down -v
docker compose up --build
```

### Forgot admin password
```bash
# Stop container
docker compose down

# Delete database (loses all data!)
docker volume rm sandesh_sandesh_data

# Restart with new password in environment
docker compose up -d
```

---

## Security Notes

- Change default admin credentials in production
- Use HTTPS reverse proxy for production deployments
- Database is stored in Docker volume - back it up regularly
- Passwords are hashed with bcrypt
- JWT tokens expire after 60 minutes by default

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Contributing

Contributions welcome! Please read the contribution guidelines first.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Built with ❤️ for local-first email**
