# 🎓 CV Builder Pro

```
 ██████╗██╗   ██╗    ██████╗ ██╗   ██╗██╗██╗     ██████╗ ███████╗██████╗
██╔════╝██║   ██║    ██╔══██╗██║   ██║██║██║     ██╔══██╗██╔════╝██╔══██╗
██║     ██║   ██║    ██████╔╝██║   ██║██║██║     ██║  ██║█████╗  ██████╔╝
██║     ╚██╗ ██╔╝    ██╔══██╗██║   ██║██║██║     ██║  ██║██╔══╝  ██╔══██╗
╚██████╗ ╚████╔╝     ██████╔╝╚██████╔╝██║███████╗██████╔╝███████╗██║  ██║
 ╚═════╝  ╚═══╝      ╚═════╝  ╚═════╝ ╚═╝╚══════╝╚═════╝ ╚══════╝╚═╝  ╚═╝
```

> **Professional Academic CV Builder Platform** - Create stunning CVs with AI assistance, multiple themes, and advanced sharing capabilities.

[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github)](https://github.com/abdkhanstd/cvbuilderpro)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-green?style=flat-square&logo=prisma)](https://www.prisma.io/)

## ✨ Features

### 🤖 AI-Powered Features
- **AI Content Suggestions**: Get intelligent suggestions for improving your CV content
- **AI CV Review**: Comprehensive AI-powered review and feedback on your CV
- **AI-Based CV Imports**: Import and enhance CVs from previous versions with AI assistance
- **Smart Content Generation**: AI helps generate professional descriptions and summaries

### 📝 CV Creation & Editing
- **Rich Text Editor**: Professional editor for creating academic CVs
- **Drag-and-Drop Sections**: Easily reorder and customize CV sections
- **Real-time Preview**: Live preview of changes as you edit
- **Multiple Layouts**: Choose from various professional layouts

### 🔄 Import & Export
- **BibTeX Import**: Import publications directly from BibTeX files
- **Google Scholar Import**: Sync publications from Google Scholar
- **Multiple Export Formats**: Export to PDF, DOCX, HTML, and more
- **High-Quality PDF Generation**: Professional PDF output with proper formatting

### 🎨 Customization
- **Theme Collection**: Extensive library of customizable CV themes
- **Advanced Theme Editor**: Create custom themes with colors and fonts
- **Photo Upload & Editing**: Upload and crop profile photos
- **Responsive Design**: Optimized for desktop and mobile devices

### 🔗 Sharing & Collaboration
- **CV Sharing System**: Share CVs with unique links and QR codes
- **Public Access Control**: Set privacy levels for shared CVs
- **Download Permissions**: Control who can download your shared CVs
- **View Tracking**: Monitor views and downloads of shared CVs

### 🔐 Security & Administration
- **User Authentication**: Secure login with email verification
- **Admin Dashboard**: Comprehensive admin panel for system management
- **Captcha Integration**: Built-in spam protection *(Note: Current CAPTCHA implementation is basic and not highly secure)*
- **Email Notifications**: Automated verification and notification emails

## 📸 Screenshots

<p align="center">
  <img src="images/1.png" width="45%" />
  <img src="images/2.png" width="45%" />
</p>

<p align="center">
  <img src="images/3.png" width="45%" />
  <img src="images/4.png" width="45%" />
</p>

<p align="center">
  <img src="images/5.png" width="45%" />
  <img src="images/6.png" width="45%" />
</p>

<p align="center">
  <img src="images/7.png" width="30%" />
</p>

## 🚀 Quick Start

### Prerequisites
- Node.js 18.17.0 or higher
- Database (PostgreSQL recommended, SQLite for development)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/abdkhanstd/cvbuilderpro.git
   cd cvbuilderpro
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up the database:**
   ```bash
   # Configure database connection in .env.local
   npm run db:migrate
   npm run db:generate
   npm run db:push
   npx prisma db seed
   ```

4. **Configure environment variables:**
   Create `.env.local` with required variables (database URL, NextAuth secret, admin credentials, etc.)

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Visit [http://localhost:3000](http://localhost:3000)

## 👨‍💼 Admin Access

An admin user is created during database seeding using environment variables:

- **Default Email:** `admin@example.com` (configurable via `ADMIN_EMAIL`)
- **Default Password:** `admin123` (configurable via `ADMIN_PASSWORD`)

**⚠️ IMPORTANT:** Change these credentials before deploying to production!

Set the following environment variables to customize admin credentials:
```bash
ADMIN_EMAIL=your-admin@example.com
ADMIN_PASSWORD=your-secure-password
ADMIN_NAME=Your Name
```

### Environment Variables

Copy `.env.example` to `.env.local` and configure the following variables:

**Required:**
- `DATABASE_URL` - Database connection string
- `NEXTAUTH_SECRET` - Secret key for NextAuth.js
- `NEXTAUTH_URL` - Base URL for authentication

**Admin Configuration:**
- `ADMIN_EMAIL` - Admin user email (default: admin@example.com)
- `ADMIN_PASSWORD` - Admin user password (default: admin123)
- `ADMIN_NAME` - Admin user name (default: Administrator)

**Email Configuration:**
- `RESEND_API_KEY` - Resend API key for email sending
- `EMAIL_FROM` - From email address for outgoing emails
- `SUPPORT_EMAIL` - Email address for support inquiries (default: support@cvbuilder.com)

**Optional:**
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` - Google reCAPTCHA site key
- `RECAPTCHA_SECRET_KEY` - Google reCAPTCHA secret key
- `GOOGLE_SCHOLAR_API_KEY` - Google Scholar API key
- `AWS_ACCESS_KEY_ID` - AWS access key for S3 storage
- `AWS_SECRET_ACCESS_KEY` - AWS secret key for S3 storage
- `AWS_REGION` - AWS region
- `AWS_S3_BUCKET` - S3 bucket name
- `APP_URL` - Application URL
- `NODE_ENV` - Environment (development/production)

- **Framework:** Next.js 15.5.2
- **Language:** TypeScript
- **Database:** Prisma ORM with SQLite/PostgreSQL
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS
- **PDF Generation:** React PDF
- **AI Integration:** OpenAI API
- **Deployment:** Vercel/Railway/Cloudflare

## ⚠️ Security Notice

**Important:** The current CAPTCHA implementation is basic and may not provide adequate protection against sophisticated attacks. For production use, consider upgrading to a more robust CAPTCHA solution like Google reCAPTCHA or hCaptcha.

## 📖 Usage Guide

1. **Sign Up/Login** - Create an account or log in
2. **Create CV** - Use the editor to build your professional CV
3. **AI Enhancement** - Get AI suggestions and reviews
4. **Customize Theme** - Choose from themes or create custom ones
5. **Import Data** - Import publications from BibTeX or Google Scholar
6. **Share & Export** - Share your CV or export in multiple formats

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support or inquiries: abdkhan@rykhet.com

## 📄 License

This project is licensed for **personal and educational use only**. Commercial use is strictly prohibited.

**Terms:**
- ✅ **Personal use:** Allowed for individual academic and professional CV creation
- ✅ **Educational use:** Permitted for learning and teaching purposes
- ❌ **Commercial use:** Not allowed for any business or commercial purposes
- ❌ **Redistribution:** Not permitted without explicit permission

**Note:** This is an academic project intended for educational and personal use. Not recommended for commercial deployment without additional security enhancements and proper licensing arrangements.