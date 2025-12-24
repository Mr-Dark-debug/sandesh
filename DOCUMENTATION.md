# Sandesh Documentation

## Overview

Sandesh is a local-first email system designed for private networks. It provides a complete email experience without requiring internet connectivity or external mail servers.

---

## Identity Model

### Core Concepts

Sandesh uses a clear identity model that determines how users are identified and how email addresses are generated.

#### 1. Username (Immutable)
- **What it is**: A unique identifier assigned when the account is created
- **Format**: 3-30 characters, lowercase letters, numbers, and underscores
- **Can it change**: **NO** - usernames are permanent
- **Used for**: Login, email address generation

#### 2. Display Name (Mutable)
- **What it is**: A human-friendly name shown in the UI and emails
- **Format**: 1-50 characters, any text
- **Can it change**: **YES** - users can update anytime in Settings
- **Used for**: Email headers, UI display

#### 3. Email Address (Derived)
- **What it is**: Automatically generated from username + namespace
- **Format**: `username@namespace`
- **Can it change**: **Only if admin changes namespace**
- **Used for**: Receiving and sending emails

#### 4. Mail Namespace (System-wide)
- **What it is**: The domain part of all email addresses
- **Format**: 2-20 characters, lowercase letters, numbers, and hyphens
- **Who controls it**: System Administrator only
- **Examples**: `sandesh`, `office`, `hackathon`, `company`

### Email Address Generation

Email addresses are generated server-side using this formula:

```
email_address = username + "@" + mail_namespace
```

**Example:**
- Username: `alice`
- Namespace: `office`
- Email: `alice@office`

### How Emails Appear

When you send an email, recipients see:

```
From: Alice Johnson <alice@office>
```

This format combines:
- **Display Name**: "Alice Johnson" (what you set in Settings)
- **Email Address**: "<alice@office>" (automatically generated)

---

## User Roles

### Regular User

**Can do:**
- View and manage their own emails
- Create folders
- Send emails to other users
- Update their display name
- Add/edit email signature
- Change avatar color

**Cannot do:**
- Access Admin Console
- Create other users
- Change system settings
- Modify the namespace
- Change their username

### Administrator

**Has all user capabilities, plus:**
- Access Admin Console
- Create, view, and deactivate users
- Access System Settings
- Change instance name
- Change mail namespace (with confirmation)

---

## System Settings

### Instance Name
- Cosmetic name for your Sandesh installation
- Displayed on login page and system info
- Example: "Office Mail", "Team Sandesh", "Dev Email"

### Mail Namespace

**What happens when you change it:**
1. All user email addresses change immediately
2. Existing emails keep their stored sender addresses
3. Users need to be informed of their new addresses
4. External systems may need updates

**Example namespace change:**
- Before: `alice@office`
- After changing namespace to `company`: `alice@company`

**Important:** Changing namespace requires explicit confirmation due to its impact.

---

## Email Signature

Users can add an optional email signature that is automatically appended to outgoing emails.

**Example:**
```
-- 
Alice Johnson
Engineering Team
```

**To set up:**
1. Go to Settings (click your profile in sidebar)
2. Enable editing
3. Add your signature text
4. Save changes

---

## API Reference

### System Settings (Admin Only)

#### Get Settings
```
GET /api/system
Authorization: Bearer <admin_token>
```

Response:
```json
{
  "instance_name": "Office Mail",
  "mail_namespace": "office",
  "created_at": "2025-01-01T00:00:00",
  "updated_at": "2025-01-15T12:00:00"
}
```

#### Update Settings
```
PUT /api/system
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "instance_name": "Company Mail",
  "mail_namespace": "company",
  "confirm_namespace_change": true
}
```

### User Profile

#### Get My Profile
```
GET /api/users/me
Authorization: Bearer <token>
```

Response:
```json
{
  "id": 1,
  "username": "alice",
  "display_name": "Alice Johnson",
  "email_address": "alice@office",
  "formatted_sender": "Alice Johnson <alice@office>",
  "is_admin": false,
  "avatar_color": "#A3A380",
  "signature": "-- \nAlice",
  "initials": "AJ"
}
```

#### Update My Profile
```
PUT /api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "display_name": "Alice J.",
  "signature": "Best regards,\nAlice",
  "avatar_color": "#D8A48F"
}
```

---

## FAQ

### Why can't I change my email address?

Email addresses are automatically generated from your username and the system namespace. This ensures consistency and prevents confusion. Only the system administrator can change the namespace.

### Why does my email address look different from normal emails?

Sandesh uses a local namespace (like `office` or `sandesh`) instead of internet domains (like `gmail.com`). This is because Sandesh works entirely on your local network without requiring internet connectivity.

### What happens to old emails if the namespace changes?

Existing emails keep their original sender information. This preserves the historical record accurately - you'll still see who sent the email as they were identified at the time.

### Can I have multiple email addresses?

No, each user has exactly one email address derived from their username. This simplifies identity management and prevents confusion.

### Who can create new users?

Only administrators can create new users through the Admin Console.

---

## Troubleshooting

### "Could not validate credentials"
- Your session has expired - log in again
- Your account may have been deactivated

### "User not found"
- The username doesn't exist in the system
- Check with your administrator

### Emails not being received
- Verify the recipient's email address is correct
- Ensure the recipient user exists in the system
- Check the SMTP server is running (port 2525)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       FRONTEND (React)                       │
│  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌────────────────────┐ │
│  │  Login  │ │  Inbox   │ │ Compose │ │ Settings/Admin     │ │
│  └─────────┘ └──────────┘ └─────────┘ └────────────────────┘ │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP/REST
┌─────────────────────────▼───────────────────────────────────┐
│                    BACKEND (FastAPI)                         │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ API Layer: /api/auth, /api/users, /api/mail, /api/system ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Service Layer: AuthService, UserService, MailService,   ││
│  │                SystemSettingsService                      ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Repository Layer: UserRepo, FolderRepo, EmailRepo,       ││
│  │                   SystemSettingsRepo                      ││
│  └──────────────────────────────────────────────────────────┘│
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    DATABASE (SQLite)                         │
│  Tables: users, folders, emails, system_settings             │
└─────────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    SMTP Server (aiosmtpd)                    │
│  Port 2525 - Local email delivery                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### system_settings (Singleton)
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Always 1 (singleton) |
| instance_name | TEXT | Display name for the installation |
| mail_namespace | TEXT | Domain part of email addresses |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Last update timestamp |

### users
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| username | TEXT | Unique, immutable login name |
| password_hash | TEXT | Bcrypt hashed password |
| display_name | TEXT | Mutable display name |
| signature | TEXT | Email signature |
| avatar_color | TEXT | Hex color for avatar |
| is_admin | BOOLEAN | Administrator flag |
| is_active | BOOLEAN | Account status |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Last update timestamp |

### emails
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| owner_id | INTEGER | FK to users |
| folder_id | INTEGER | FK to folders |
| sender | TEXT | Full sender string |
| sender_display_name | TEXT | Sender's display name at send time |
| sender_email | TEXT | Sender's email at send time |
| recipients | TEXT | JSON array of recipient emails |
| subject | TEXT | Email subject |
| body | TEXT | Email body content |
| is_read | BOOLEAN | Read status |
| timestamp | DATETIME | Send/receive time |

---

*Last updated: December 2025*
