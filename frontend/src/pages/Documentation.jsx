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
    `,
        lastUpdated: 'December 24, 2024'
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
    `,
        lastUpdated: 'December 24, 2024'
    },

    'quick-start': {
        title: 'Quick Start',
        icon: Zap,
        content: `
# Quick Start

Get productive with सनdesh in 5 minutes.

---

## For Users

### 1. Log In
Use the credentials provided by your administrator.
- **Username**: Used for login
- **Password**: Your secret key

### 2. Update Your Identity
Go to **Settings** (click your name → Your Profile).
- Set your **Display Name** (e.g., "Alice Smith")
- Add a **Signature** if you like
- Verify your **Email Address**

### 3. Send Your First Email
1. Click **Compose**
2. Enter a recipient (e.g., \`bob@sandesh\`)
3. Write a subject and message
4. Click **Send**

That's it! You're using local email.

---

## For Administrators

### 1. Initial Setup
Log in with the default admin account (\`admin\`). Go to **System Settings** to configure:
- **Instance Name**: What users see on the login screen
- **Mail Namespace**: The domain for all emails (e.g., \`@office\`)

### 2. Create Users
Go to the **Admin Console**.
1. Click **Add User**
2. Define their username (this sets their email address)
3. Set a temporary password

### 3. Share Details
Send your users:
- The URL to this instance
- Their username & password
- Their new email address (\`username@namespace\`)

> 💡 **Tip**: Change your admin password immediately after first login.
    `,
        lastUpdated: 'December 24, 2024'
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

> 💡 **Why this format?** This ensures recipients know who you are (Display Name) and where the email came from (Email Address) without any ambiguity.
    `,
        lastUpdated: 'December 24, 2024'
    },

    'user-settings': {
        title: 'User Settings',
        icon: Wrench,
        content: `
# User Settings

Manage your personal profile and preferences.

---

## Accessing Settings

1. Click your **Name** or Avatar in the bottom-left corner of the sidebar.
2. Select **Your Profile** / **Settings**.

---

## What You Can Change

### Display Name
**Purpose**: The name people see when you send them email.
- **Recommendation**: Use your real first and last name (e.g., "Alice Smith").
- **Effect**: Updates instantly on new emails. Old emails keep the name used when they were sent.

### Avatar Color
**Purpose**: The background color of your profile icon.
- **Recommendation**: Pick a color that distinguishes you from others.
- **Effect**: Updates instantly across the UI.

### Email Signature
**Purpose**: Text automatically added to the end of every email you write.
- **Usage**: Good for job titles, contact info, or friendly sign-offs.
- **Format**: Plain text. Links (URLs) are clickable in most email clients.

---

## What You Cannot Change

| Field | Reason |
|-------|--------|
| **Username** | It determines your unique identity and login. Changing it would break your account history. |
| **Email Address** | Derived directly from your username and the system namespace. |
| **Role** | Only administrators can promote or demote users. |

> ❓ **Need to change these?** Contact your administrator. They may need to create a new account for you.
    `,
        lastUpdated: 'December 24, 2024'
    },

    'using-sandesh': {
        title: 'Using सनdesh',
        icon: Mail,
        content: `
# Using सनdesh

This guide covers the everyday user experience of reading and organizing mail.

---

## The Inbox Interface

After logging in, you see three areas:

### 1. Sidebar (Left)
- **Compose**: Create a new email
- **Inbox**: Received emails
- **Sent**: Emails you've sent
- **Trash**: Deleted emails
- **Custom folders**: Any folders you've created

### 2. Email List (Center)
When you select a folder, you see a list of emails.
- **Unread**: Bold text
- **Read**: Normal text
- **Selection**: Checkboxes for bulk actions

### 3. Email View (Center/Right)
Click an email to read it.
- **Header**: Sender, To, Date
- **Body**: The message content
- **Actions**: Reply, Delete, Move

---

## Reading Emails

### Finding Emails
1. Click a folder in the sidebar.
2. Scroll to find the message.
3. Click to open.

### Marking as Read
Emails are automatically marked as read when you open them.
- To keep an email "Unread", you can't currently toggle it back (feature coming soon).

---

## Organizing

### Moving Emails
1. Open the email.
2. Click **Move to**.
3. Select a destination folder.

### Deleting
1. Click the **Trash** icon.
2. The email moves to the **Trash** folder.
3. To permanently delete, go to Trash and delete it again.
    `,
        lastUpdated: 'December 24, 2024'
    },

    'email-features': {
        title: 'Email Features & Behavior',
        icon: Send,
        content: `
# Email Features & Behavior

Understanding the capabilities of the system.

---

## Sending Capabilities

### Recipients
- **Internal Only**: You can only email users on this सनdesh instance.
- **Format**: \`username@namespace\` (e.g., \`alice@sandesh\`).
- **Multiple**: Separate addresses with commas or new lines.

### CC (Carbon Copy)
- Works just like standard email.
- All recipients can see who was CC'd.

### Attachments
- ❌ **Not supported yet**. Text only.

---

## Delivery

### Instant Delivery
Emails transfer directly within the local database. Delivery is effectively instantaneous.

### Failed Delivery
If you try to send to a user that **does not exist**:
- The system will accept the email (to prevent username enumeration probing).
- It will silently fail to deliver to that specific bad address.
- Valid recipients will still receive the email.

---

## Storage
- **Sent Folder**: Every email you send is saved here.
- **No Quotas**: There are currently no storage limits enforced, but please be respectful of disk space.
    `,
        lastUpdated: 'December 24, 2024'
    },

    'email-lifecycle': {
        title: 'Email Lifecycle',
        icon: Zap,
        content: `
# Email Lifecycle

What happens when you send an email? Here is the journey of a message in सनdesh.

---

## 1. Composition
- **State**: You are typing in the Compose window.
- **Storage**: In-memory only.
- ⚠️ **Note**: If you refresh or close the tab without sending, the draft is **lost**.

## 2. Sending
- **Action**: You click the **Send** button.
- **Validation**: System checks if the format of addresses is valid.
- **Processing**: The backend receives your message.

## 3. Storage (Sent)
- **Action**: The system immediately saves a copy to your **Sent** folder.
- **Status**: The email is now permanently recorded in your history.

## 4. Delivery (Local SMTP)
- **Action**: The backend hands the message to the internal SMTP server.
- **Routing**: The server looks up the recipients in the local database.
- **Deposit**: The message is inserted into the recipient's **Inbox**.

## 5. Receipt
- **Action**: The recipient's view updates (upon refresh/poll).
- **Status**: The email is available for them to read.

---

## Diagram

\`\`\`
[ You ]  →  [ Backend ]  →  [ Your Sent Folder ]
                 ↓
            [ SMTP Engine ]
                 ↓
[ Recipient Inbox ]  ←  [ Recipient ]
\`\`\`

## What if delivery fails?
Because सनdesh is local-only, failure is rare. It usually means:
- The recipient username does not exist.
- The system prevents delivery to protect privacy (silent fail).

In these cases, the email **remains in your Sent folder** as proof you sent it, but it never reaches a destination.
    `,
        lastUpdated: 'December 24, 2024'
    },

    'folders': {
        title: 'Folder & Inbox Management',
        icon: Folder,
        content: `
# Folder & Inbox Management

Keep your mailbox clean and organized.

---

## Default Folders
These exist for everyone and cannot be deleted.

1. **Inbox**: Where new mail arrives.
2. **Sent**: Archive of everything you've sent.
3. **Trash**: Holding area for deleted items.

## Custom Folders
You can create your own folders to organize projects or topics.

### Creating a Folder
1. Click **Create folder** in the sidebar.
2. Name it (e.g., "Finance", "Project X").
3. It appears in the sidebar instantly.

### Using Folders
- **Move** emails from Inbox to Custom Folders to reach "Inbox Zero".
- **Delete** a folder to remove it. ⚠️ **Warning**: This deletes all emails inside it!

## Trash Behavior
- Moving email to Trash **does not** hide it forever.
- To permanently delete, you must delete it **from** the Trash.
- Currently, Trash is not auto-emptied. You must do it manually.
    `,
        lastUpdated: 'December 24, 2024'
    },

    'compose': {
        title: 'Compose & Sending Email',
        icon: Send,
        content: `
# Compose & Sending Email

How to write and send messages.

---

## The Compose Window
Click **Compose** to open the floating window.
- **Minimize**: Keep it open while checking other emails.
- **Maximize**: Focus on writing.
- **Close**: Discard the message.

## Writing
- **To**: Enter \`username@namespace\`.
- **Subject**: Keep it short and clear.
- **Body**: Plain text message.

## Confirmation & Safety
To prevent accidental data loss:
- If you try to **close** the window while text is written, a **Confirmation Dialog** will appear.
- You must explicitly choose to **Discard** the draft.

> ⚠️ **No Auto-Save**: Drafts are not saved to the server while you type. Do not stick properly to the "Sent" lifecycle until you actually click Send.

## Tips
- **Self-Email**: You can send email to yourself (\`yourname@namespace\`) to test features or keep notes.
- **Signatures**: Set a signature in Settings to avoid typing your name every time.
    `,
        lastUpdated: 'December 24, 2024'
    },

    'confirmation-safety': {
        title: 'Confirmation & Safety',
        icon: Shield,
        content: `
# Confirmation & Safety

Why does सनdesh ask "Are you sure?"

---

## Design Philosophy
We believe software should be **forgiving**. However, some actions are destructive or irreversible. In those cases, we require explicit confirmation to prevent accidents.

## When You Will See Confirmations

### 1. Discarding Drafts
**Action**: Closing the Compose window with unsaved text.
- **Why**: To prevent losing a long email you were writing just because you misclicked.
- **Choice**: "Keep Editing" saves your work; "Discard" deletes it.

### 2. Deleting Items
**Action**: Deleting a folder or user.
- **Why**: Deleting a folder deletes all emails inside it. This cannot be undone.
- **Choice**: You must confirm the deletion.

### 3. Changing Namespace (Admin)
**Action**: Changing the system Mail Namespace.
- **Why**: This changes the email address of **every user in the system**. It breaks communication history continuity.
- **Safety**: This requires a specific "Critical Action" confirmation.

## Summary
If you see a popup dialog, **pause and read it**. It usually means data is about to be permanently changed or removed.
    `,
        lastUpdated: 'December 24, 2024'
    },

    'admin-guide': {
        title: 'Admin Guide',
        icon: Shield,
        content: `
# Admin Guide

For operators and system administrators.

---

## Your Responsibilities

### 1. User Management
- **Create Users**: You are the only one who can make new accounts.
- **Reset Access**: Use Deactivate/Delete if a user is compromised.
- **Privacy**: You verify that the instance is running on a secure network.

### 2. System Configuration
- **Namespace**: You assert ownership of the \`@namespace\`.
- **Instance Name**: You set the tone for the login screen.

---

## Managing Users

### Creating a User
1. Go to **Admin Console**.
2. Click **Add User**.
3. **Username**: Simple, lowercase (e.g., \`alice\`).
4. **Password**: Share this securely with the user.
5. **Display Name**: You can set a default, but they should update it.

### Deactivating a User
- **Effect**: User cannot log in. Data remains.
- **Use Case**: Employee leaves the company.

### Deleting a User
- **Effect**: User AND all their emails are permanently removed.
- **Use Case**: Cleanup of test accounts.

---

## Best Practices
1. **Dont use 'admin' for daily email**: Create a personal account (e.g., \`prashant\`) for your actual email usage.
2. **Secure the Admin Password**: It has full control over the system.
3. **Backup**: Regularly backup the \`/data\` folder (Docker volume).
    `,
        lastUpdated: 'December 24, 2024'
    },

    'namespace': {
        title: 'System Settings & Namespace',
        icon: Settings,
        content: `
# System Settings & Namespace

Configuring the core identity of your instance.

---

## The Mail Namespace
The namespace is the text after the \`@\` in email addresses.

### Rules
- **Length**: 2-20 characters.
- **Allowed**: Lowercase letters, numbers, hyphens.
- **Example**: \`sandesh\` → \`user@sandesh\`.

### Changing the Namespace
**⚠️ Critical Action**
Changing this setting updates the derived email address for **everyone**.
1. Go to **System Settings**.
2. Edit **Mail Namespace**.
3. Review the impact warning.
4. Confirm the change.

**Why is this dangerous?**
- If Alice was \`alice@old\`, she is now \`alice@new\`.
- Anyone trying to reply to her old emails (\`alice@old\`) might get a delivery failure or confusion.

## Intance Name
This is purely cosmetic. It changes the title on the Login page and browser tab. Use it to brand your internal tool (e.g., "Acme Corp Mail").
    `,
        lastUpdated: 'December 24, 2024'
    },

    'limitations': {
        title: 'Limitations & Design Choices',
        icon: AlertTriangle,
        content: `
# Limitations & Design Choices

To trust a system, you must know what it **cannot** do.

---

## Intentionally Missing Features

### ❌ No External Email
**Detail**: You cannot email Gmail, Outlook, or Yahoo.
**Reason**: Strict privacy isolation. No data ever leaves your local network.

### ❌ No IMAP / POP3
**Detail**: You cannot connect Outlook or Thunderbird desktop apps.
**Reason**: We focus 100% on a high-quality web experience.

### ❌ No Mobile App
**Detail**: There is no iOS or Android app to download.
**Reason**: The web interface is responsive and works on mobile browsers.

### ❌ No Rich Text / HTML
**Detail**: Emails are plain text only.
**Reason**: Security (no XSS execution) and simplicity.

---

## Technical Constraints

### Single Instance
- **Scope**: Designed for one server (Docker container).
- **Scale**: Good for 1-1000 users. Not designed for millions.

### SQLite Database
- **Storage**: All data lives in a single \`.db\` file.
- **Pros**: insanely easy to backup (copy one file).
- **Cons**: Write-heavy loads (thousands of emails/second) will eventually be slow.

### No "Forgot Password"
- **Detail**: There is no automated password reset.
- **Reason**: No external email to send a reset link to!
- **Solution**: Admins must manually reset passwords.
    `,
        lastUpdated: 'December 24, 2024'
    },

    'security': {
        title: 'Security & Privacy Model',
        icon: Lock,
        content: `
# Security & Privacy Model

---

## Privacy
- **Zero Tracking**: We collect no data.
- **Local Storage**: Data stays on your disk.

## Network Security
- **No TLS (HTTPS)**: The container runs on HTTP. **You are responsible** for putting it behind a secure proxy (like Nginx) if running on an untrusted network.
- **Local SMTP**: Port 2525 is open for internal delivery. It is not secured for the public internet.

## Application Security
- **Passwords**: Hashed using **bcrypt** (industry standard).
- **Sessions**: JWT (JSON Web Tokens) with expiration.
- **XSS Protection**: React automatically escapes content.

> 🛡️ **Recommendation**: Only run सनdesh on a trusted private network (LAN/VPN) or behind a secure authentication proxy.
    `,
        lastUpdated: 'December 24, 2024'
    },

    'faq': {
        title: 'FAQ',
        icon: MessageSquare,
        content: `
# Frequently Asked Questions

---

### General
**Q: Can I email my personal Gmail account?**
**A**: No. सनdesh is a closed, private network system.

**Q: Where is my data stored?**
**A**: In the \`/data\` folder of your Docker installation.

### Identity
**Q: Can I change my email address?**
**A**: No, it is permanently linked to your username. You would need a new account.

**Q: Can I change my username?**
**A**: No. Ask your admin to create a new user and delete the old one.

### Troubleshooting
**Q: My email didn't arrive.**
**A**: Check if the username was correct. If the user doesn't exist, the email is dropped.

**Q: I forgot my password.**
**A**: Ask your administrator to reset it.
    `,
        lastUpdated: 'December 24, 2024'
    },

    'troubleshooting': {
        title: 'Troubleshooting',
        icon: Wrench,
        content: `
# Troubleshooting

Common issues and solutions.

---

## Login Problems
**Issue**: "Invalid credentials"
- **Fix**: Check Caps Lock. Ask admin to verify username.

**Issue**: "Could not connect to server"
- **Fix**: Ensure the Docker container is running. Check your network connection.

## Email Problems
**Issue**: Recipient never got the email.
- **Check**: Did you mistype the username? \`alice\` vs \`alic\`?
- **Check**: Is the recipient actually part of your instance?

## System Problems
**Issue**: System Settings won't save.
- **Fix**: Refresh the page. Ensure you are logged in as Admin.
    `,
        lastUpdated: 'December 24, 2024'
    },

    'glossary': {
        title: 'Glossary',
        icon: BookOpen,
        content: `
# Glossary

Terms used in user documentation.

---

### Admin / Administrator
A user with elevated privileges (can create users, change settings).

### Display Name
Your "Human" name shown to others (e.g., "Prashant"). **Editable**.

### Local-First
Software that prioritizes running on your own machine over the cloud.

### Namespace
The "domain" part of your email address (e.g., \`@sandesh\`). Set by Admin.

### SMTP
"Simple Mail Transfer Protocol". The language email servers use to talk.

### Username
Your unique login ID. **Not Editable**.
    `,
        lastUpdated: 'December 24, 2024'
    }
};

// ============================================
// NAVIGATION STRUCTURE
// ============================================

const NAV_SECTIONS = [
    {
        title: 'Getting Started',
        items: [
            { id: 'welcome', title: 'Welcome to सनdesh' },
            { id: 'what-is-sandesh', title: 'What is सनdesh?' },
            { id: 'quick-start', title: 'Quick Start' },
        ]
    },
    {
        title: 'Core Concepts',
        items: [
            { id: 'identity', title: 'Identity & Email Addresses' },
            { id: 'email-lifecycle', title: 'Email Lifecycle' },
        ]
    },
    {
        title: 'User Guide',
        items: [
            { id: 'using-sandesh', title: 'Inbox & Reading' },
            { id: 'user-settings', title: 'User Settings' },
            { id: 'compose', title: 'Compose & Sending' },
            { id: 'email-features', title: 'Features & Behavior' },
            { id: 'folders', title: 'Folders & Organization' },
            { id: 'confirmation-safety', title: 'Confirmation & Safety' },
        ]
    },
    {
        title: 'Administration',
        items: [
            { id: 'admin-guide', title: 'Admin Guide' },
            { id: 'namespace', title: 'System Settings' },
        ]
    },
    {
        title: 'Security & Privacy',
        items: [
            { id: 'security', title: 'Security Model' },
            { id: 'limitations', title: 'Limitations & Choices' },
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
            const isGuide = content.includes('🛡️');
            const isQuestion = content.includes('❓');

            let bg = 'bg-[#F6F8FC]';
            let border = 'border-[#A3A380]';
            let text = 'text-[#4A4A4A]';

            if (isWarning) {
                bg = 'bg-[#FEF3C7]';
                border = 'border-[#F59E0B]';
                text = 'text-[#92400E]';
            } else if (isInfo) {
                bg = 'bg-[#E0F2FE]';
                border = 'border-[#0EA5E9]';
                text = 'text-[#0369A1]';
            } else if (isGuide || isQuestion) {
                bg = 'bg-[#ECFCCB]';
                border = 'border-[#84CC16]';
                text = 'text-[#365314]';
            }

            elements.push(
                <blockquote
                    key={`quote-${elements.length}`}
                    className={`pl-4 py-3 pr-4 mb-4 rounded-r-lg border-l-4 ${bg} ${border} ${text}`}
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
                            <>
                                {renderMarkdown(pageContent.content)}
                                {pageContent.lastUpdated && (
                                    <div className="mt-8 pt-4 border-t border-[#E5E8EB] text-xs text-[#8B8B8B] italic">
                                        Last updated: {pageContent.lastUpdated}
                                    </div>
                                )}
                            </>
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
