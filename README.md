# CV Builder Pro

A multi-user academic CV builder platform built with Next.js, TypeScript, and Prisma.

## Features

- **User Authentication**: Secure login and registration with email verification
- **Captcha Integration**: Built-in CAPTCHA for spam protection
- **CV Editor**: Rich text editor for creating professional academic CVs
- **AI Suggestions**: AI-powered content suggestions and improvements for CV sections
- **Import Functionality**: Import publications from BibTeX and Google Scholar
- **Multiple Themes**: Extensive collection of customizable CV themes and layouts
- **PDF Generation**: High-quality PDF export with proper formatting
- **Document Export**: Export CVs to DOCX, HTML, and other formats
- **Photo Upload & Editing**: Upload and crop profile photos with image processing
- **Section Management**: Drag-and-drop section reordering and customization
- **Sharing System**: Share CVs with unique links, QR codes, and public access
- **Admin Dashboard**: Comprehensive admin panel for user management and system oversight
- **Responsive Design**: Fully responsive interface optimized for desktop and mobile
- **Real-time Preview**: Live preview of CV changes
- **Theme Customization**: Advanced theme editor with color and font options
- **Data Export/Import**: Backup and restore CV data
- **Email Notifications**: Automated email sending for verification and notifications
- **Security**: Password hashing, session management, and secure API endpoints

## Installation

### Prerequisites

- Node.js 18.17.0 or higher
- PostgreSQL or another database supported by Prisma

### Setup

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd cv-builder-pro
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   # Configure your database connection in .env
   # Run database migrations
   npm run db:migrate
   # Generate Prisma client
   npm run db:generate
   # Seed the database with initial data
   npm run db:push
   npx prisma db seed
   ```

4. Configure environment variables:
   Create a `.env.local` file with necessary environment variables (database URL, NextAuth secret, etc.)

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Admin Account

A default admin account is created during database seeding:
- Email: abdkhan@rykhet.com
- Password: demo

Use this account to access administrative features.

## Usage

- Register a new account or log in
- Create and edit your CV using the intuitive editor
- Choose from various themes and layouts
- Export your CV in multiple formats
- Share your CV with others

## Technologies Used

- Next.js 14
- TypeScript
- Prisma ORM
- NextAuth.js
- Tailwind CSS
- React PDF
- Puppeteer
- And more...

## Contact

For support or inquiries, contact: abdkhan@rykhet.com

## License

This project is private.