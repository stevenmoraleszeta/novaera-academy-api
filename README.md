# 🎓 Novaera Academy API

> A comprehensive RESTful API backend for Novaera Academy, a modern e-learning platform that manages courses, students, mentors, payments, and educational resources.

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.1.0-lightgrey.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-1.0.0-blue.svg)](package.json)

## ✨ Introduction

Novaera Academy API is a robust backend service built with Node.js and Express that powers a comprehensive e-learning platform. It provides secure authentication, course management, student tracking, mentor assignments, payment processing, and resource management capabilities.

### Key Features

- 🔐 **Authentication & Authorization**: JWT-based authentication with Google OAuth 2.0 integration
- 📚 **Course Management**: Complete CRUD operations for courses, modules, classes, and resources
- 👥 **User Management**: Student profiles, mentors, and role-based access control
- 💳 **Payment Processing**: Integrated payment system for course enrollments
- 📊 **Progress Tracking**: Student course progress and completed classes tracking
- 📧 **Email Notifications**: Automated email notifications using Nodemailer
- ☁️ **Firebase Integration**: Firebase Admin SDK for storage and authentication
- 🗄️ **PostgreSQL Database**: Robust database management with stored procedures

## 🚀 Technologies Used

### Core Technologies
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **PostgreSQL** - Relational database management system
- **JWT (JSON Web Tokens)** - Secure authentication mechanism
- **Passport.js** - Authentication middleware

### Key Dependencies
- **bcrypt** - Password hashing
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable management
- **express-validator** - Input validation
- **express-session** - Session management
- **firebase-admin** - Firebase Admin SDK
- **jsonwebtoken** - JWT token generation and verification
- **nodemailer** - Email sending functionality
- **passport-google-oauth20** - Google OAuth 2.0 strategy
- **pg** - PostgreSQL client for Node.js

### Development Tools
- **nodemon** - Development server with auto-reload

## ⚙️ Installation

### Prerequisites

- Node.js (v18.x or higher)
- PostgreSQL (v12.x or higher)
- npm or yarn package manager
- Google OAuth 2.0 credentials (for Google authentication)
- Firebase project with Admin SDK credentials

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/novaera-academy-api.git
   cd novaera-academy-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   - Database credentials
   - JWT secret key
   - Google OAuth credentials
   - Firebase Admin SDK credentials
   - Email service credentials
   - Frontend and backend URLs

4. **Set up the database**
   - Create a PostgreSQL database
   - Run the database migration scripts (if available)
   - Ensure stored procedures are created

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Start the production server**
   ```bash
   npm start
   ```

The API will be running on `http://localhost:3001` (or the port specified in your `.env` file).

## 🧩 Project Structure

```
novaera-academy-api/
├── config/
│   └── firebaseAdmin.js      # Firebase Admin SDK configuration
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── categoriesController.js
│   ├── classesController.js
│   ├── coursesController.js
│   ├── mentorsController.js
│   ├── paymentsControllers.js
│   ├── projectsController.js
│   ├── studentController.js
│   └── ...                   # Other controllers
├── db/
│   └── index.js              # PostgreSQL database connection
├── routes/
│   ├── auth.js               # Authentication routes
│   ├── googleAuth.js         # Google OAuth routes
│   ├── courses.js            # Course routes
│   ├── students.js           # Student routes
│   └── ...                   # Other route files
├── utils/
│   ├── mailer.js             # Email utility functions
│   └── projectNotifications.js
├── app.js                    # Main application entry point
├── passport.js               # Passport.js configuration
├── package.json              # Project dependencies
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
├── LICENSE                   # License file
└── README.md                 # Project documentation
```

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/request-password-reset` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `PUT /api/auth/change-password` - Change password
- `GET /auth/google` - Google OAuth authentication
- `GET /auth/google/callback` - Google OAuth callback

#### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create new course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

#### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student

#### Other Endpoints
- `/api/modalities` - Course modalities
- `/api/categories` - Course categories
- `/api/mentors` - Mentor management
- `/api/projects` - Project management
- `/api/payments` - Payment processing
- `/api/classes` - Class management
- `/api/modules` - Module management
- `/api/recordings` - Recording management

## 🔒 Environment Variables

See `.env.example` for all required environment variables. Key variables include:

- `PORT` - Server port (default: 3001)
- `PGHOST` - PostgreSQL host
- `PGUSER` - PostgreSQL user
- `PGPASSWORD` - PostgreSQL password
- `PGDATABASE` - PostgreSQL database name
- `PGPORT` - PostgreSQL port
- `JWT_SECRET` - JWT secret key
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `BACKEND_URL` - Backend API URL
- `FRONTEND_URL` - Frontend application URL
- `EMAIL_USER` - Email service user
- `EMAIL_PASSWORD` - Email service password
- `FIREBASE_PROJECT_ID` - Firebase project ID
- `FIREBASE_PRIVATE_KEY` - Firebase private key
- `FIREBASE_CLIENT_EMAIL` - Firebase client email

## 🚀 Deployment

### Recommended Deployment Platforms

#### Vercel
- Suitable for serverless deployments
- Easy integration with GitHub
- Automatic SSL certificates

#### Render
- Simple deployment process
- PostgreSQL database hosting
- Free tier available

#### AWS (EC2/Elastic Beanstalk)
- Full control over infrastructure
- Scalable and reliable
- Suitable for production environments

#### Railway
- Simple deployment with PostgreSQL
- Environment variable management
- Automatic deployments from GitHub

### Deployment Steps

1. **Prepare environment variables**
   - Set all required environment variables in your deployment platform
   - Ensure database credentials are secure

2. **Database setup**
   - Set up PostgreSQL database on your hosting platform
   - Run migration scripts
   - Verify stored procedures are created

3. **Deploy application**
   - Connect your GitHub repository
   - Configure build and start commands
   - Set environment variables

4. **Configure domain and SSL**
   - Set up custom domain (optional)
   - Configure SSL certificates
   - Update CORS settings if needed

### Build Commands
- **Build**: Not required for Node.js
- **Start**: `npm start`
- **Development**: `npm run dev`

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test
```

## 📝 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (to be implemented)

## 🤝 Contributing

This is a proprietary project. For contributions or inquiries, please contact the repository owner.

## 📜 License

This project is proprietary software. All rights reserved.

**Copyright (c) 2024 Steven Morales Fallas**

All rights reserved. Redistribution, modification, reproduction, sublicensing, or any form of transaction (including commercial, educational, or promotional use) involving this repository, its source code, or derived works is strictly prohibited without the explicit and personal written authorization of the Lead Developer, Steven Morales Fallas.

Unauthorized commercial use, resale, or licensing of this repository or its contents is strictly forbidden and will be subject to applicable legal action.

For full license details, see [LICENSE](LICENSE) file.

## 👤 Author

**Steven Morales Fallas**
- Full Stack Developer
- Repository: [novaera-academy-api](https://github.com/yourusername/novaera-academy-api)

## 📞 Contact

For questions or inquiries about this project, please contact the repository owner.

---

**Note**: This API is part of the Novaera Academy platform. Ensure proper security measures are implemented before deploying to production.

