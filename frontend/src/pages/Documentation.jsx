import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Book, ChevronRight, ChevronDown, Home, HelpCircle, Users, Settings,
    Mail, Folder, Send, Shield, AlertTriangle, MessageSquare, Wrench,
    BookOpen, Zap, Info, Lock, List, X, Menu, ExternalLink, ArrowLeft
} from 'lucide-react';

// ============================================
// DOCUMENTATION CONTENT
// ============================================

const DOCS_CONTENT = {
    'welcome': {
        title: 'Welcome to सनdesh',
        icon: Home,
        content: `
# Welcome to सनdesh

**सनdesh** (Sandesh) is a local-first email system designed for private networks. It gives you a complete email experience without requiring internet connectivity, external servers, or third-party services.

## Who is सनdesh for?

- **Teams and organizations** who need private internal communication
- **Home labs and developers** who want a local email testing environment
- **Air-gapped networks** that cannot connect to the internet
- **Privacy-conscious users** who want complete control over their data

## What सनdesh is NOT

सनdesh is intentionally simple and focused. It is:

- **Not** a replacement for Gmail, Outlook, or other internet email
- **Not** designed to send or receive external emails
- **Not** a cloud service—your data stays on your network
- **Not** tracking you or selling your data

## Design Philosophy

We built सनdesh with three principles:

1. **Local-first**: Everything runs on your own infrastructure
2. **Simplicity**: Easy to set up, easy to use, easy to understand
3. **Transparency**: No hidden behaviors, no surprising defaults

Ready to get started? Continue to the [Quick Start](#/docs/quick-start) guide.
    `
    },

    'what-is-sandesh': {
        title: 'What is सनdesh?',
        icon: Info,
        content: `
# What is सनdesh?

सनdesh is a **self-hosted, local email system** that runs entirely on your network. It provides:

- A web-based email client (what you're using now)
- A local SMTP server for sending and receiving mail
- User management and authentication
- Folder organization

## How It Works

\`\`\`
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│   सनdesh    │────▶│   Inbox     │
│  (Your UI)  │◀────│   Server    │◀────│  (SQLite)   │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                    ┌──────┴──────┐
                    │ Local SMTP  │
                    │  (Port 2525)│
                    └─────────────┘
\`\`\`

When you send an email:

1. The web interface sends it to the सनdesh backend
2. The backend stores a copy in your Sent folder
3. The local SMTP server delivers it to the recipient's Inbox
4. The recipient sees it instantly in their inbox

## Key Characteristics

### 🏠 Local-Only Delivery
Emails can only be sent between users on the same सनdesh instance. There is no connection to the outside internet.

### 🔒 No Third-Party Services
No external authentication, no cloud storage, no analytics. Your data never leaves your network.

### ⚡ Instant Delivery
Because everything is local, emails arrive immediately. No spam filters, no delays.

### 📦 Single Container
सनdesh runs as a single Docker container—easy to deploy, backup, and manage.

## What सनdesh is NOT

| Feature | सनdesh | Traditional Email |
|---------|--------|-------------------|
| External email | ❌ No | ✅ Yes |
| Cloud-based | ❌ No | ✅ Often |
| Spam filtering | ❌ No | ✅ Yes |
| IMAP/POP access | ❌ No | ✅ Usually |
| Mobile apps | ❌ Web only | ✅ Yes |

This is by design. सनdesh is focused on **private, local communication**.
    `
    },

    'quick-start': {
        title: 'Quick Start',
        icon: Zap,
        content: `
# Quick Start

Get productive with सनdesh in 5 minutes.

---

## For Users

### Step 1: Log In

1. Open your browser and go to your सनdesh URL (e.g., \`http://localhost:8000\`)
2. Enter your **username** and **password**
3. Click **Sign in**

> 💡 Your username was created by your administrator. If you don't have one, ask them.

### Step 2: Explore Your Inbox

After logging in, you'll see:

- **Sidebar** (left): Your folders—Inbox, Sent, Trash
- **Main area**: Your email list or welcome screen
- **Compose button**: Big button to write new emails

### Step 3: Send Your First Email

1. Click the **Compose** button
2. Enter a recipient: \`username@namespace\` (e.g., \`alice@sandesh\`)
3. Add a subject and message
4. Click **Send**

That's it! The recipient will see your email instantly.

### Step 4: Customize Your Profile

1. Click your name in the bottom-left corner
2. Select **Your Profile**
3. Update your **Display Name** (how others see you in emails)
4. Add an optional **Signature**
5. Save changes

---

## For Administrators

### Step 1: First Login

1. Open सनdesh in your browser
2. Log in with the default admin credentials:
   - Username: \`admin\` (or your configured admin)
   - Password: \`admin123\` (or your configured password)

> ⚠️ **Change the admin password immediately in production!**

### Step 2: Understand the Namespace

Your namespace determines all email addresses:

- Namespace: \`sandesh\`
- User \`alice\` → Email: \`alice@sandesh\`

To view or change: Click profile → **System Settings**

### Step 3: Create Users

1. Click **Admin Console** in the sidebar
2. Click **Add User**
3. Enter:
   - **Username**: Will become part of their email (e.g., \`bob\` → \`bob@sandesh\`)
   - **Password**: Their login password
   - **Display Name**: Optional friendly name
4. Click **Create User**

### Step 4: Share Login Info

Give each user:
- The सनdesh URL
- Their username
- Their password
- Their email address format: \`username@namespace\`

---

## You're Ready!

You now know enough to use सनdesh productively. For deeper understanding, continue reading the documentation.
    `
    },

    'identity': {
        title: 'Understanding Identity & Email Addresses',
        icon: Users,
        content: `
# Understanding Identity & Email Addresses

This is the most important concept in सनdesh. Read this page carefully.

---

## The Three Parts of Your Identity

Every user in सनdesh has three identity components:

### 1. Username (Permanent)

- Created by admin when your account is made
- **Cannot be changed** after creation
- Used for login
- Becomes part of your email address

Example: \`prashant\`

### 2. Display Name (Changeable)

- Your human-friendly name
- Shown in the UI and email headers
- **You can change this anytime** in Settings

Example: \`Prashant Choudhary\`

### 3. Namespace (System-wide)

- Set by administrator
- Same for all users on the instance
- Forms the "domain" part of email addresses

Example: \`sandesh\`

---

## How Your Email Address is Generated

Your email address is automatically created by combining:

\`\`\`
Email = Username + "@" + Namespace
\`\`\`

**Example:**
- Username: \`prashant\`
- Namespace: \`sandesh\`
- **Email Address**: \`prashant@sandesh\`

---

## How Emails Appear to Recipients

When you send an email, the recipient sees:

\`\`\`
From: Prashant Choudhary <prashant@sandesh>
\`\`\`

This combines:
- Your **Display Name** ("Prashant Choudhary")
- Your **Email Address** ("<prashant@sandesh>")

---

## What You CAN Change

| Field | Changeable? | Where? |
|-------|-------------|--------|
| Display Name | ✅ Yes | Settings → Profile |
| Signature | ✅ Yes | Settings → Profile |
| Avatar Color | ✅ Yes | Settings → Profile |

## What You CANNOT Change

| Field | Changeable? | Why? |
|-------|-------------|------|
| Username | ❌ No | Part of your email address |
| Email Address | ❌ No | Derived from username + namespace |
| Role | ❌ No | Set by administrator |

---

## Why Email Addresses Look This Way

You might wonder: "Why \`alice@sandesh\` instead of \`alice@gmail.com\`?"

सनdesh uses a **local namespace** instead of internet domains because:

1. **No internet required**: We don't need DNS or external servers
2. **You control it**: The admin chooses what makes sense for your organization
3. **Simplicity**: No domain registration or email verification needed

Common namespace examples:
- \`sandesh\` (default)
- \`office\`
- \`team\`
- \`hackathon\`
- \`company-name\`

---

## A Complete Example

**Setup:**
- Admin creates user with username \`alice\`
- System namespace is \`office\`
- Alice sets her display name to "Alice Johnson"

**Result:**
- Login: \`alice\`
- Email Address: \`alice@office\`
- Emails show as: \`Alice Johnson <alice@office>\`

---

## FAQ

**Q: Can I have multiple email addresses?**
A: No. Each user has exactly one email address.

**Q: What if I want to change my email address?**
A: You would need a new account with a different username. Only admins can create accounts.

**Q: What happens if the namespace changes?**
A: All email addresses change. The admin must confirm this action because it affects all users.
    `
    },

    'using-sandesh': {
        title: 'Using सनdesh',
        icon: Mail,
        content: `
# Using सनdesh

This guide covers the everyday user experience.

---

## The Main Interface

After logging in, you see three areas:

### 1. Sidebar (Left)

- **Compose**: Create a new email
- **Inbox**: Received emails
- **Sent**: Emails you've sent
- **Trash**: Deleted emails
- **Custom folders**: Any folders you've created
- **Your profile**: Bottom of sidebar

### 2. Email List (Center)

When you select a folder:
- List of emails with sender, subject, and preview
- Unread emails appear **bold**
- Click to open an email

### 3. Email View (Center)

When you open an email:
- Full email content
- Action buttons (Reply, Delete, Move)
- Back button to return to list

---

## Reading Emails

### Finding Emails

1. Click a folder in the sidebar (e.g., Inbox)
2. Scroll through the email list
3. Click an email to read it

### Unread vs Read

- **Unread**: Bold text, slightly different background
- **Read**: Normal text

Clicking an email automatically marks it as read.

### Email Information

Each email shows:
- **Sender**: Who sent it (Display Name and email)
- **Subject**: The topic
- **Body**: The message content
- **Timestamp**: When it was sent

---

## Managing Emails

### Deleting Emails

**From the list:**
1. Hover over an email
2. Click the trash icon

**From the email view:**
1. Open the email
2. Click **Delete** in the action bar

Deleted emails go to Trash.

### Moving Emails

1. Open the email
2. Click **Move to**
3. Select the destination folder

### Selecting Multiple Emails

1. Check the boxes next to emails
2. Use the bulk action bar that appears
3. Choose an action (Delete, etc.)

---

## Your Profile

Access your profile by clicking your name at the bottom of the sidebar.

### What You Can Change

1. **Display Name**: How you appear in emails
2. **Email Signature**: Text added to outgoing emails
3. **Avatar Color**: Your profile icon color

### What You Cannot Change

- Username (fixed at account creation)
- Email address (derived from username)
- Role (set by admin)

---

## Tips for Effective Use

1. **Use meaningful display names**: "Alice Johnson" is better than "alice"
2. **Add a signature**: Helps recipients know who you are
3. **Organize with folders**: Create folders for projects or topics
4. **Empty trash periodically**: Keep your account clean
    `
    },

    'email-features': {
        title: 'Email Features & Behavior',
        icon: Send,
        content: `
# Email Features & Behavior

Understanding how emails work in सनdesh.

---

## Sending Emails

### To Field

- Enter recipient email addresses
- Format: \`username@namespace\` (e.g., \`alice@sandesh\`)
- Multiple recipients: Add each on a new line or separate with commas

### CC Field

- Carbon Copy: Additional recipients
- Everyone can see CC recipients
- Toggle CC field visibility in Compose

### Subject

- Optional but recommended
- Appears in recipient's inbox list

### Body

- Your message content
- Plain text (no rich formatting currently)

### Signature

- If you've set a signature in Settings, it's automatically appended
- Appears after your message with a separator (\`--\`)

---

## Delivery Behavior

### Instant Delivery

Emails are delivered **immediately**. There's no queue or delay because everything is local.

### Local Only

सनdesh can only deliver to users on the same instance:

| Recipient | Delivery |
|-----------|----------|
| \`alice@sandesh\` (same namespace) | ✅ Delivered |
| \`alice@gmail.com\` (external) | ❌ Not delivered |

### What Happens If User Doesn't Exist?

If you send to a username that doesn't exist, the email is silently dropped. No error message is sent back.

---

## Sent Folder

Every email you send is **automatically saved** to your Sent folder. This happens:

- Before delivery attempt
- Even if delivery fails
- With full content preserved

---

## Receiving Emails

### Notifications

Currently, सनdesh doesn't have push notifications. To see new emails:

- Refresh the page
- Click on Inbox
- Use the refresh button if available

### Unread Count

The sidebar shows unread counts next to folders (e.g., "Inbox 3").

---

## Timestamps

All timestamps are stored in UTC and displayed in your browser's local timezone.

---

## Email Storage

### Where Emails Are Stored

- All emails are stored in a SQLite database
- On disk in the Docker volume (\`/data/sandesh.db\`)

### Email Limits

No hard limits on:
- Number of emails
- Email size
- Attachment size (attachments not currently supported)

However, very large databases may affect performance.

---

## Replies and Forwards

### Current Behavior

- Reply and Forward buttons exist in the UI
- They pre-populate the Compose window appropriately

### Threading

Currently, emails are not threaded. Each email appears separately in your inbox.
    `
    },

    'folders': {
        title: 'Folder & Inbox Management',
        icon: Folder,
        content: `
# Folder & Inbox Management

Organize your emails effectively.

---

## Default Folders

Every user has three default folders:

### Inbox
- Receives all incoming emails
- Cannot be deleted or renamed

### Sent
- Automatically stores all sent emails
- Cannot be deleted or renamed

### Trash
- Holds deleted emails
- Cannot be deleted or renamed
- Emails here can be permanently deleted or restored

---

## Creating Folders

1. In the sidebar, find "Create folder" or the + icon
2. Enter a name for your folder
3. Press Enter or click Create

**Naming rules:**
- Cannot use names of default folders (Inbox, Sent, Trash)
- Keep names short and descriptive
- Special characters allowed but not recommended

---

## Moving Emails to Folders

### From Email View

1. Open the email
2. Click **Move to** button
3. Select destination folder

### From Email List

1. Select emails using checkboxes
2. Use the bulk action menu
3. Choose Move and select folder

---

## Deleting Emails

### To Trash

- Click delete button → Email moves to Trash
- Not permanent, can be recovered

### From Trash

- Currently: Delete again to remove permanently
- This action cannot be undone

---

## Managing Folders

### Accessing a Folder

Click the folder name in the sidebar to view its contents.

### Folder Counts

Some folders show unread counts (e.g., "Inbox 5").

---

## Best Practices

1. **Use descriptive names**: "Project Alpha" is better than "Stuff"
2. **Archive completed projects**: Move old emails to project folders
3. **Empty Trash regularly**: Don't let deleted emails accumulate
4. **Don't over-organize**: Too many folders can be harder to manage than too few
    `
    },

    'compose': {
        title: 'Compose & Sending Email',
        icon: Send,
        content: `
# Compose & Sending Email

How to write and send emails in सनdesh.

---

## Opening Compose

Click the **Compose** button in the sidebar. A compose window appears.

---

## The Compose Window

### Floating Mode

The compose window floats at the bottom-right of your screen, similar to Gmail. You can:

- **Minimize**: Click the minimize button to collapse
- **Maximize**: Click again to restore
- **Close**: Click X (if you have content, you'll be asked to confirm)

### Fields

| Field | Required | Description |
|-------|----------|-------------|
| To | ✅ Yes | Recipient email address |
| CC | ❌ No | Carbon copy recipients |
| Subject | ❌ No | Email subject line |
| Body | ❌ No | Your message |

---

## Entering Recipients

### Format

Always use the full email format:
\`\`\`
username@namespace
\`\`\`

Example: \`alice@sandesh\`

### Multiple Recipients

Enter each recipient on a new line, or separate with commas:
\`\`\`
alice@sandesh
bob@sandesh
charlie@sandesh
\`\`\`

### CC (Carbon Copy)

Click **CC** to reveal the CC field. CC recipients:
- Receive the email
- Are visible to all other recipients
- Appear in the email header

---

## Writing Your Message

### Subject Line

- Keep it descriptive and concise
- Helps recipients understand the email's purpose
- Shows in their inbox list

### Body

- Write your message in plain text
- Press Enter for new lines
- No rich text formatting currently

---

## Signatures

If you've set a signature in Settings:
- It's automatically appended to every email
- Separated by \`--\` line
- You can edit or remove it before sending

---

## Sending

Click the **Send** button to send your email.

### What Happens

1. Email is saved to your Sent folder
2. Email is delivered to recipient's Inbox
3. Compose window closes
4. You see a success confirmation

### If Sending Fails

- An error message appears
- Your message is NOT lost (still in the compose window)
- Try again or copy your content

---

## Discarding Drafts

If you close the compose window with unsaved content:
- A confirmation dialog appears
- Choose to **discard** or **keep writing**

There is no auto-save or draft folder currently.

---

## Tips

1. **Double-check recipients**: There's no undo after sending
2. **Use clear subjects**: Makes emails easier to find later
3. **Keep it concise**: Respect your recipients' time
4. **Add a signature**: Set it once in Settings, appears automatically
    `
    },

    'admin-guide': {
        title: 'Admin Guide',
        icon: Shield,
        content: `
# Admin Guide

Everything administrators need to know.

---

## Admin vs User Role

| Capability | Admin | User |
|------------|-------|------|
| Send/receive email | ✅ | ✅ |
| Manage own profile | ✅ | ✅ |
| Create users | ✅ | ❌ |
| Deactivate users | ✅ | ❌ |
| Access System Settings | ✅ | ❌ |
| Change namespace | ✅ | ❌ |

---

## Accessing Admin Features

### Admin Console

1. Look for **Admin Console** in the sidebar
2. Click to open user management

### System Settings

1. Click your profile (bottom-left)
2. Select **System Settings**

---

## Creating Users

### Step by Step

1. Go to Admin Console
2. Click **Add User**
3. Fill in:
   - **Username**: Will become part of their email (letters, numbers, underscores)
   - **Password**: Their login password (minimum 6 characters)
   - **Display Name**: Optional friendly name
4. Click **Create User**

### After Creation

The new user:
- Can log in immediately
- Has default folders (Inbox, Sent, Trash)
- Has email address: \`username@namespace\`

### What to Tell New Users

Provide them with:
- सनdesh URL
- Their username
- Their password
- Their email format: \`username@namespace\`

---

## Username Rules

Usernames must:
- Start with a letter
- Be 3-30 characters
- Contain only lowercase letters, numbers, and underscores
- Be unique

**Important**: Usernames cannot be changed after creation because they're part of the email address.

---

## Deactivating Users

### When to Deactivate

- User leaves the organization
- Security concerns
- Temporary suspension

### How to Deactivate

1. Go to Admin Console
2. Find the user
3. Click **Deactivate** (or delete icon)
4. Confirm the action

### What Happens

- User cannot log in
- User's emails are preserved
- User's data remains in the database
- Can be reactivated (if you implement this feature)

---

## Managing System Settings

### Instance Name

- Cosmetic name for your installation
- Shown on login page
- Change anytime without impact

### Mail Namespace

- Defines all email addresses
- **Changing this affects ALL users**
- Requires confirmation

See [System Settings & Namespace](#/docs/namespace) for details.

---

## Security Responsibilities

As admin, you should:

1. **Use strong passwords**: For admin and all users
2. **Limit admin accounts**: Only trusted people
3. **Monitor users**: Regularly review user list
4. **Backup data**: Regularly backup the database volume
5. **Secure network**: Ensure सनdesh is only accessible on trusted networks
    `
    },

    'namespace': {
        title: 'System Settings & Namespace',
        icon: Settings,
        content: `
# System Settings & Namespace

Configure your सनdesh instance.

---

## Accessing System Settings

1. Click your profile in the bottom-left corner
2. Select **System Settings**
3. Only administrators can access this

---

## Instance Name

### What It Is

The display name for your सनdesh installation.

### Where It Appears

- Login page
- Page titles
- System information

### Changing It

1. Edit the Instance Name field
2. Click Save
3. No impact on users or emails

---

## Mail Namespace

### What It Is

The "domain" part of all email addresses in your system.

\`\`\`
Email = username@NAMESPACE
\`\`\`

### Default Value

The default namespace is \`local\` or whatever was set during installation.

### Examples

| Namespace | Example Email |
|-----------|---------------|
| \`sandesh\` | \`alice@sandesh\` |
| \`office\` | \`alice@office\` |
| \`company\` | \`alice@company\` |
| \`hackathon\` | \`alice@hackathon\` |

---

## Changing the Namespace

### ⚠️ This is a Significant Action

Changing the namespace affects **every user** in your system:

- All email addresses change immediately
- Users need to know their new address
- Existing emails keep their original sender info

### How to Change

1. Go to System Settings
2. Edit the Mail Namespace field
3. Review the warnings shown
4. Click Save
5. Confirm in the confirmation dialog

### What Happens After

- New emails use the new namespace
- Old emails keep their historical sender information
- Users now log in the same way but have new email addresses

### Namespace Rules

Must be:
- 2-20 characters
- Start with a letter
- Lowercase letters, numbers, and hyphens only

---

## When to Change Namespace

**Good reasons:**
- Rebranding your organization
- Initial setup was done with placeholder value
- Merging systems

**Bad reasons:**
- Just to try it out (causes confusion)
- One user wants a different email (not possible individually)

---

## Reverting a Namespace Change

You can change the namespace again to revert:

1. Go to System Settings
2. Enter the old namespace
3. Confirm

However, any emails sent during the changed period will show the old sender information.
    `
    },

    'security': {
        title: 'Security & Privacy Model',
        icon: Lock,
        content: `
# Security & Privacy Model

Understand how सनdesh handles security and privacy.

---

## Privacy by Design

### Local-First

- All data stays on your server
- No cloud sync
- No external services

### No Tracking

- No analytics
- No usage statistics
- No telemetry

### No Third Parties

- No external authentication
- No CDN dependencies
- No external APIs

---

## Security Model

### Authentication

- Username and password login
- JWT tokens for session management
- Tokens expire after 60 minutes (by default)
- Passwords hashed with bcrypt

### Authorization

- Two roles: Admin and User
- Role-based access control
- Admin actions require admin role

### Network

⚠️ **Important**: सनdesh does NOT include:
- HTTPS/TLS encryption by default
- Network security features

**You should**:
- Run behind an HTTPS reverse proxy (nginx, Caddy)
- Restrict network access to trusted networks
- Use a VPN for remote access

---

## What's NOT Secured

Be aware of these design decisions:

### No Email Encryption

Emails are stored in plain text in the database. Anyone with database access can read all emails.

### No TLS for SMTP

The local SMTP server (port 2525) does not use TLS. This is acceptable for local networks but not for internet-facing deployments.

### Trusted Network Assumption

सनdesh assumes it's running on a trusted network. It doesn't protect against:
- Network sniffing
- Man-in-the-middle attacks
- Malicious internal users with network access

---

## Admin Access

Administrators can:
- See the user list (but not read their emails through the UI)
- Create and deactivate users
- Change system settings

Administrators cannot (through the UI):
- Read other users' emails
- Access other users' passwords
- Impersonate other users

However, anyone with database access could read all data.

---

## Data Protection Recommendations

1. **Secure the host**: Use strong OS-level security
2. **Limit admin accounts**: Minimize who has admin access
3. **Use HTTPS**: Put a reverse proxy in front of सनdesh
4. **Backup regularly**: Database is in the Docker volume
5. **Network segmentation**: Only accessible from trusted networks
6. **Strong passwords**: Enforce for all users

---

## Incident Response

If you suspect a security issue:

1. Check who has admin access
2. Review recent user activity
3. Check Docker/container logs
4. Rotate admin passwords if needed
5. Consider backing up and redeploying
    `
    },

    'limitations': {
        title: 'Limitations & Design Choices',
        icon: AlertTriangle,
        content: `
# Limitations & Design Choices

Understanding what सनdesh intentionally doesn't do.

---

## Why This Page Exists

Every product makes tradeoffs. We believe in **transparency** about what सनdesh doesn't do and why.

---

## Intentional Limitations

### No External Email

**What**: सनdesh cannot send or receive emails to/from Gmail, Outlook, or any internet address.

**Why**: 
- Simplifies setup dramatically
- No DNS, MX records, or domain management
- No spam filtering needed
- No deliverability issues

**Alternative**: For external email, use a traditional email provider.

---

### No IMAP/POP3

**What**: You cannot access सनdesh through Outlook, Apple Mail, or other email clients.

**Why**:
- Reduces complexity significantly
- Web interface is the primary experience
- Fewer security surfaces

**Alternative**: Use the web interface on any device with a browser.

---

### No Mobile App

**What**: There's no dedicated iOS or Android app.

**Why**:
- Web app works on mobile browsers
- Reduces development and maintenance burden
- One codebase to maintain

**Alternative**: Add the web app to your home screen.

---

### No Rich Text / HTML Email

**What**: Emails are plain text only.

**Why**:
- Avoids security risks from HTML
- Simpler storage and rendering
- Plain text is actually more accessible

**Alternative**: Use clear formatting with line breaks and symbols.

---

### No Attachments (Currently)

**What**: You cannot attach files to emails.

**Why**:
- Simplifies storage management
- Avoids large file handling issues
- May be added in future versions

**Alternative**: Share files through other means and reference them in email.

---

## Technical Choices

### SQLite Database

**What**: सनdesh uses SQLite, not PostgreSQL or MySQL.

**Why**:
- Zero configuration needed
- Single file, easy to backup
- Sufficient for intended scale

**Limitation**: Not suitable for hundreds of concurrent users or massive email volumes.

---

### Single Instance

**What**: सनdesh runs as one container, not a distributed system.

**Why**:
- Simple deployment
- No orchestration needed
- Easy to understand and debug

**Limitation**: Vertical scaling only. Can't distribute load.

---

### Synchronous Database Access

**What**: Database operations are synchronous, not async.

**Why**:
- SQLite doesn't benefit from async
- Simpler code
- Easier to debug

**Limitation**: High concurrency may cause delays.

---

## What We Might Add

These are not promises, but areas we've considered:

- Attachments
- Email search
- Email threading
- Dark mode
- Keyboard shortcuts
- Email templates

---

## What We Won't Add

Some things are intentionally out of scope:

- External email (SMTP relay)
- IMAP/POP3 server
- Calendar integration
- Chat/messaging
- File storage

सनdesh is an email system, and we want to do that well.
    `
    },

    'faq': {
        title: 'FAQ',
        icon: MessageSquare,
        content: `
# Frequently Asked Questions

Common questions and clear answers.

---

## General Questions

### What does "सनdesh" mean?

"संदेश" (Sandesh) is a Hindi word meaning "message." We write it as "सनdesh" to blend Hindi and English characters.

### Is सनdesh free?

Yes, सनdesh is open source and free to use.

### Who made सनdesh?

सनdesh was created as a local-first email system for private networks.

---

## Email Questions

### Why can't I email Gmail or external addresses?

सनdesh is designed for **local-only** email. It doesn't connect to the internet or external mail servers. This is a feature, not a bug—it keeps things simple and private.

### Why does my email address look like \`alice@sandesh\`?

Email addresses in सनdesh use a local namespace instead of an internet domain. Your admin chose the namespace (like "sandesh" or "office"). This is normal for सनdesh.

### Can I change my email address?

No. Your email address is derived from your username, which is permanent. If you need a different email address, you would need a new account.

### Why didn't my email arrive?

Check that:
1. You used the correct recipient address (\`username@namespace\`)
2. The recipient exists in the system
3. You're looking in the right folder

### Can I send to multiple people?

Yes! Enter multiple addresses in the To or CC fields, separated by commas or on separate lines.

---

## Account Questions

### How do I change my password?

Currently, password changes require admin assistance. Contact your administrator.

### I forgot my password. What do I do?

Contact your administrator. They can reset your account.

### Can I delete my account?

Contact your administrator. They can deactivate your account.

### Why can't I change my username?

Usernames are permanent because they're part of your email address. Changing them would change your email address, which could cause confusion.

---

## Admin Questions

### How do I create new users?

Go to Admin Console, click Add User, fill in the details, and create.

### What happens when I deactivate a user?

They can't log in, but their emails are preserved in the database.

### Can I change the namespace?

Yes, but carefully. Changing the namespace changes ALL email addresses in the system. It requires confirmation.

### How do I backup सنदesh?

Backup the Docker volume containing the SQLite database (\`/data/sandesh.db\`).

---

## Technical Questions

### What port does सनdesh use?

- **8000**: Web interface (HTTP)
- **2525**: SMTP server (for local delivery)

### Can I use my own database?

सनdesh uses SQLite by default. Using a different database would require code changes.

### Is there an API?

Yes, सनdesh has a REST API. Authentication is via JWT tokens.

---

## Getting Help

If your question isn't answered here:
1. Check the [Troubleshooting](#/docs/troubleshooting) section
2. Review the full documentation
3. Check the project repository for issues
    `
    },

    'troubleshooting': {
        title: 'Troubleshooting',
        icon: Wrench,
        content: `
# Troubleshooting

Common problems and how to fix them.

---

## Login Issues

### "Incorrect username or password"

**Causes**:
- Mistyped username or password
- Caps Lock is on
- Copy-pasted with extra spaces

**Solutions**:
1. Type credentials carefully
2. Check Caps Lock
3. Ask admin to verify your username

### "Account is deactivated"

**Cause**: Your account has been disabled by an administrator.

**Solution**: Contact your administrator.

### "Could not validate credentials"

**Cause**: Your session has expired.

**Solution**: Log in again.

---

## Missing Emails

### Sent email not in recipient's inbox

**Possible causes**:
1. Recipient username doesn't exist
2. Wrong namespace in address
3. Typo in email address

**Solutions**:
1. Verify the recipient exists in the system
2. Check you used the correct format: \`username@namespace\`
3. Check your Sent folder to confirm it was sent

### Emails disappeared

**Possible causes**:
1. Moved to another folder
2. Deleted

**Solutions**:
1. Check Trash and other folders
2. Check with admin about database status

---

## Compose Issues

### Can't send email

**Possible causes**:
1. No recipient entered
2. Invalid email format
3. Server error

**Solutions**:
1. Ensure at least one recipient is entered
2. Use format \`username@namespace\`
3. Check browser console for errors

### Lost my draft

**Cause**: Compose window was closed without sending.

**Prevention**: सनdesh doesn't have auto-save. Confirm the discard dialog carefully.

---

## Display Issues

### Page doesn't load

**Solutions**:
1. Clear browser cache
2. Try a different browser
3. Check if the server is running

### UI looks broken

**Solutions**:
1. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Try incognito mode

---

## Admin Issues

### Can't access Admin Console

**Cause**: You're not logged in as an administrator.

**Solution**: Log in with an admin account.

### Can't change namespace

**Possible causes**:
1. Not an admin
2. Didn't confirm the change

**Solution**: Ensure you check the confirmation box when prompted.

---

## Performance Issues

### Slow loading

**Possible causes**:
1. Large number of emails
2. Network latency
3. Server resources

**Solutions**:
1. Archive old emails to folders
2. Check server logs
3. Increase server resources

---

## Still Stuck?

If you can't resolve an issue:

1. Check the server logs:
   \`\`\`bash
   docker logs sandesh
   \`\`\`

2. Restart the container:
   \`\`\`bash
   docker compose restart
   \`\`\`

3. Check for errors in browser developer tools (F12)

4. Consult the project documentation or repository
    `
    },

    'glossary': {
        title: 'Glossary',
        icon: BookOpen,
        content: `
# Glossary

Key terms used in सनdesh documentation.

---

## A

### Admin / Administrator
A user with elevated privileges who can create users, change system settings, and manage the सनdesh instance.

---

## D

### Display Name
The human-friendly name that appears in emails and the UI. Can be changed by the user at any time.

### Draft
An unsent email being composed. सनdesh currently does not save drafts automatically.

---

## E

### Email Address
The full identifier used to send email to a user. Format: \`username@namespace\`. Cannot be changed directly.

---

## F

### Folder
A container for organizing emails. Default folders are Inbox, Sent, and Trash.

---

## I

### Instance
A running सनdesh installation. All users on an instance share the same namespace.

---

## L

### Local-First
A design philosophy where all data is stored and processed locally, not in the cloud.

---

## N

### Namespace
The "domain" portion of email addresses. Set by the administrator. All users share the same namespace.

Example: In \`alice@office\`, "office" is the namespace.

---

## R

### Role
A user's privilege level. सनdesh has two roles: Admin and User.

---

## S

### Signature
Text that is automatically appended to outgoing emails. Set in user profile settings.

### SMTP (Simple Mail Transfer Protocol)
The standard protocol for sending email. सनdesh runs a local SMTP server on port 2525.

### SQLite
A lightweight database engine. सनdesh uses SQLite to store all data in a single file.

---

## T

### Token (JWT)
A security credential that proves you're logged in. Expires after a set time (default: 60 minutes).

### Trash
A special folder where deleted emails are moved. Emails in Trash can be permanently deleted.

---

## U

### Username
The unique identifier used to log in. Becomes part of the email address. Cannot be changed after account creation.

---

## W

### Web Interface
The browser-based application you use to access सनdesh. No software installation required.
    `
    }
};

// ============================================
// NAVIGATION STRUCTURE
// ============================================

const NAV_SECTIONS = [
    {
        title: 'Getting Started',
        items: [
            { id: 'welcome', title: 'Welcome to सনdesh' },
            { id: 'what-is-sandesh', title: 'What is सনdesh?' },
            { id: 'quick-start', title: 'Quick Start' },
        ]
    },
    {
        title: 'Core Concepts',
        items: [
            { id: 'identity', title: 'Identity & Email Addresses' },
        ]
    },
    {
        title: 'User Guide',
        items: [
            { id: 'using-sandesh', title: 'Using সনdesh' },
            { id: 'email-features', title: 'Email Features & Behavior' },
            { id: 'folders', title: 'Folder & Inbox Management' },
            { id: 'compose', title: 'Compose & Sending Email' },
        ]
    },
    {
        title: 'Administration',
        items: [
            { id: 'admin-guide', title: 'Admin Guide' },
            { id: 'namespace', title: 'System Settings & Namespace' },
        ]
    },
    {
        title: 'Security & Privacy',
        items: [
            { id: 'security', title: 'Security & Privacy Model' },
            { id: 'limitations', title: 'Limitations & Design Choices' },
        ]
    },
    {
        title: 'Reference',
        items: [
            { id: 'faq', title: 'FAQ' },
            { id: 'troubleshooting', title: 'Troubleshooting' },
            { id: 'glossary', title: 'Glossary' },
        ]
    }
];

// ============================================
// MARKDOWN RENDERER (Simple)
// ============================================

function renderMarkdown(content) {
    if (!content) return null;

    // Process content line by line
    const lines = content.trim().split('\n');
    const elements = [];
    let inCodeBlock = false;
    let codeContent = [];
    let codeLanguage = '';
    let inTable = false;
    let tableRows = [];
    let listItems = [];
    let listType = null;

    const flushList = () => {
        if (listItems.length > 0) {
            if (listType === 'ul') {
                elements.push(
                    <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 mb-4 text-[#4A4A4A]">
                        {listItems.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInline(item) }} />)}
                    </ul>
                );
            } else {
                elements.push(
                    <ol key={`ol-${elements.length}`} className="list-decimal list-inside space-y-1 mb-4 text-[#4A4A4A]">
                        {listItems.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInline(item) }} />)}
                    </ol>
                );
            }
            listItems = [];
            listType = null;
        }
    };

    const flushTable = () => {
        if (tableRows.length > 0) {
            const headerRow = tableRows[0];
            const bodyRows = tableRows.slice(2); // Skip header and separator
            elements.push(
                <div key={`table-${elements.length}`} className="overflow-x-auto mb-4">
                    <table className="min-w-full text-sm border border-[#E5E8EB] rounded-lg overflow-hidden">
                        <thead className="bg-[#F6F8FC]">
                            <tr>
                                {headerRow.map((cell, i) => (
                                    <th key={i} className="px-4 py-2 text-left font-medium text-[#3D3D3D] border-b border-[#E5E8EB]">
                                        {cell}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {bodyRows.map((row, i) => (
                                <tr key={i} className={i % 2 === 1 ? 'bg-[#F6F8FC]/50' : ''}>
                                    {row.map((cell, j) => (
                                        <td key={j} className="px-4 py-2 text-[#4A4A4A] border-b border-[#E5E8EB]" dangerouslySetInnerHTML={{ __html: processInline(cell) }} />
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
            tableRows = [];
            inTable = false;
        }
    };

    const processInline = (text) => {
        return text
            .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-[#3D3D3D]">$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 bg-[#F6F8FC] text-[#A3A380] rounded text-sm font-mono">$1</code>')
            .replace(/\[(.+?)\]\(#\/docs\/(.+?)\)/g, '<a href="#/docs/$2" class="text-[#A3A380] hover:text-[#8B8B68] underline">$1</a>')
            .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-[#A3A380] hover:text-[#8B8B68] underline" target="_blank" rel="noopener">$1</a>');
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Code blocks
        if (line.startsWith('```')) {
            if (inCodeBlock) {
                elements.push(
                    <pre key={`code-${elements.length}`} className="bg-[#2D2D2D] text-[#E5E5E5] p-4 rounded-lg overflow-x-auto mb-4 text-sm font-mono">
                        <code>{codeContent.join('\n')}</code>
                    </pre>
                );
                codeContent = [];
                inCodeBlock = false;
            } else {
                flushList();
                flushTable();
                inCodeBlock = true;
                codeLanguage = line.slice(3);
            }
            continue;
        }

        if (inCodeBlock) {
            codeContent.push(line);
            continue;
        }

        // Table rows
        if (line.startsWith('|')) {
            flushList();
            inTable = true;
            const cells = line.split('|').slice(1, -1).map(c => c.trim());
            tableRows.push(cells);
            continue;
        } else if (inTable) {
            flushTable();
        }

        // Headers
        if (line.startsWith('# ')) {
            flushList();
            elements.push(
                <h1 key={`h1-${elements.length}`} className="text-3xl font-bold text-[#3D3D3D] mb-6 pb-3 border-b border-[#E5E8EB]">
                    {line.slice(2)}
                </h1>
            );
            continue;
        }
        if (line.startsWith('## ')) {
            flushList();
            elements.push(
                <h2 key={`h2-${elements.length}`} className="text-2xl font-bold text-[#3D3D3D] mt-8 mb-4">
                    {line.slice(3)}
                </h2>
            );
            continue;
        }
        if (line.startsWith('### ')) {
            flushList();
            elements.push(
                <h3 key={`h3-${elements.length}`} className="text-xl font-semibold text-[#3D3D3D] mt-6 mb-3">
                    {line.slice(4)}
                </h3>
            );
            continue;
        }

        // Horizontal rule
        if (line === '---') {
            flushList();
            elements.push(<hr key={`hr-${elements.length}`} className="my-8 border-[#E5E8EB]" />);
            continue;
        }

        // Blockquotes
        if (line.startsWith('> ')) {
            flushList();
            const content = line.slice(2);
            const isWarning = content.includes('⚠️');
            const isInfo = content.includes('💡');
            elements.push(
                <blockquote
                    key={`quote-${elements.length}`}
                    className={`pl-4 py-3 pr-4 mb-4 rounded-r-lg border-l-4 ${isWarning ? 'bg-[#FEF3C7] border-[#F59E0B] text-[#92400E]' :
                            isInfo ? 'bg-[#E0F2FE] border-[#0EA5E9] text-[#0369A1]' :
                                'bg-[#F6F8FC] border-[#A3A380] text-[#4A4A4A]'
                        }`}
                    dangerouslySetInnerHTML={{ __html: processInline(content) }}
                />
            );
            continue;
        }

        // Lists
        if (line.match(/^[-*] /)) {
            listType = 'ul';
            listItems.push(line.slice(2));
            continue;
        }
        if (line.match(/^\d+\. /)) {
            listType = 'ol';
            listItems.push(line.replace(/^\d+\. /, ''));
            continue;
        }

        // Flush list if we hit non-list content
        if (listItems.length > 0 && line.trim() !== '') {
            flushList();
        }

        // Empty line
        if (line.trim() === '') {
            flushList();
            continue;
        }

        // Regular paragraph
        elements.push(
            <p
                key={`p-${elements.length}`}
                className="text-[#4A4A4A] mb-4 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: processInline(line) }}
            />
        );
    }

    // Flush remaining
    flushList();
    flushTable();

    return elements;
}

// ============================================
// DOCUMENTATION COMPONENT
// ============================================

export default function Documentation() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [expandedSections, setExpandedSections] = useState(
        NAV_SECTIONS.reduce((acc, section) => ({ ...acc, [section.title]: true }), {})
    );

    // Get current page from hash
    const [currentPage, setCurrentPage] = useState('welcome');

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            if (hash.startsWith('#/docs/')) {
                setCurrentPage(hash.replace('#/docs/', ''));
            } else if (hash === '#/docs' || hash === '') {
                setCurrentPage('welcome');
            }
        };

        handleHashChange();
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const pageContent = DOCS_CONTENT[currentPage];
    const PageIcon = pageContent?.icon || Book;

    const toggleSection = (title) => {
        setExpandedSections(prev => ({ ...prev, [title]: !prev[title] }));
    };

    const navigateTo = (id) => {
        window.location.hash = `/docs/${id}`;
        setMobileSidebarOpen(false);
    };

    return (
        <div className="min-h-screen bg-white flex">
            {/* Mobile sidebar overlay */}
            {mobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-40 lg:hidden"
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed lg:sticky top-0 left-0 z-50 lg:z-0
        w-72 h-screen bg-[#F9FAFB] border-r border-[#E5E8EB]
        transform transition-transform duration-200
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
                {/* Header */}
                <div className="p-4 border-b border-[#E5E8EB]">
                    <div className="flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-2 text-[#3D3D3D] hover:text-[#A3A380]">
                            <ArrowLeft className="w-4 h-4" />
                            <span className="text-sm">Back to App</span>
                        </Link>
                        <button
                            onClick={() => setMobileSidebarOpen(false)}
                            className="lg:hidden p-1 text-[#6B6B6B] hover:text-[#3D3D3D]"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#A3A380] to-[#8B8B68] flex items-center justify-center">
                            <Book className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-[#3D3D3D]">सनdesh Docs</h1>
                            <p className="text-xs text-[#8B8B8B]">Documentation</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4">
                    {NAV_SECTIONS.map((section) => (
                        <div key={section.title} className="mb-4">
                            <button
                                onClick={() => toggleSection(section.title)}
                                className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-semibold text-[#8B8B8B] uppercase tracking-wider hover:text-[#3D3D3D]"
                            >
                                {section.title}
                                <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections[section.title] ? '' : '-rotate-90'}`} />
                            </button>

                            {expandedSections[section.title] && (
                                <div className="mt-1 space-y-0.5">
                                    {section.items.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => navigateTo(item.id)}
                                            className={`
                        w-full text-left px-3 py-2 text-sm rounded-lg transition-colors
                        ${currentPage === item.id
                                                    ? 'bg-[#A3A380]/10 text-[#A3A380] font-medium'
                                                    : 'text-[#4A4A4A] hover:bg-[#E5E8EB] hover:text-[#3D3D3D]'
                                                }
                      `}
                                        >
                                            {item.title}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-[#E5E8EB]">
                    <p className="text-xs text-[#8B8B8B]">
                        सनdesh Documentation<br />
                        Last updated: December 2024
                    </p>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 min-w-0">
                {/* Mobile header */}
                <header className="lg:hidden sticky top-0 bg-white border-b border-[#E5E8EB] px-4 py-3 flex items-center gap-3 z-30">
                    <button
                        onClick={() => setMobileSidebarOpen(true)}
                        className="p-2 -ml-2 text-[#6B6B6B] hover:text-[#3D3D3D] hover:bg-[#F6F8FC] rounded-lg"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        <Book className="w-5 h-5 text-[#A3A380]" />
                        <span className="font-semibold text-[#3D3D3D]">सनdesh Docs</span>
                    </div>
                </header>

                {/* Content */}
                <div className="max-w-3xl mx-auto px-6 py-8 lg:py-12">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-[#8B8B8B] mb-6">
                        <button
                            onClick={() => navigateTo('welcome')}
                            className="hover:text-[#A3A380]"
                        >
                            Docs
                        </button>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-[#3D3D3D] font-medium">{pageContent?.title || 'Page'}</span>
                    </div>

                    {/* Page content */}
                    <article className="prose prose-slate max-w-none">
                        {pageContent ? (
                            renderMarkdown(pageContent.content)
                        ) : (
                            <div className="text-center py-12">
                                <HelpCircle className="w-12 h-12 text-[#E5E8EB] mx-auto mb-4" />
                                <h2 className="text-xl font-semibold text-[#3D3D3D] mb-2">Page Not Found</h2>
                                <p className="text-[#8B8B8B] mb-4">The documentation page you're looking for doesn't exist.</p>
                                <button
                                    onClick={() => navigateTo('welcome')}
                                    className="text-[#A3A380] hover:text-[#8B8B68]"
                                >
                                    Go to Welcome page
                                </button>
                            </div>
                        )}
                    </article>

                    {/* Navigation footer */}
                    {pageContent && (
                        <div className="mt-12 pt-8 border-t border-[#E5E8EB]">
                            <div className="flex items-center justify-between">
                                {/* Previous */}
                                {(() => {
                                    const allItems = NAV_SECTIONS.flatMap(s => s.items);
                                    const currentIndex = allItems.findIndex(i => i.id === currentPage);
                                    const prevItem = currentIndex > 0 ? allItems[currentIndex - 1] : null;

                                    return prevItem ? (
                                        <button
                                            onClick={() => navigateTo(prevItem.id)}
                                            className="flex items-center gap-2 text-sm text-[#6B6B6B] hover:text-[#A3A380]"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            <span>{prevItem.title}</span>
                                        </button>
                                    ) : <div />;
                                })()}

                                {/* Next */}
                                {(() => {
                                    const allItems = NAV_SECTIONS.flatMap(s => s.items);
                                    const currentIndex = allItems.findIndex(i => i.id === currentPage);
                                    const nextItem = currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null;

                                    return nextItem ? (
                                        <button
                                            onClick={() => navigateTo(nextItem.id)}
                                            className="flex items-center gap-2 text-sm text-[#6B6B6B] hover:text-[#A3A380]"
                                        >
                                            <span>{nextItem.title}</span>
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    ) : <div />;
                                })()}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
