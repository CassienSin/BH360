# BH360 - Barangay Management System

A comprehensive web application for modern barangay governance and incident management, built with React, TypeScript, and Material-UI.

## 🚀 Features

### 1. **User Management**
- Resident registration and authentication
- Role-based access control (Resident, Admin, Tanod, Staff)
- Profile management with avatar upload
- Account verification system

### 2. **AI-Powered Help Desk**
- Intelligent chatbot for barangay inquiries
- Information about barangay services
- Requirements for clearances, certificates, and permits
- Automated responses to FAQs
- Ticket creation for complex concerns

### 3. **Incident Reporting System**
- Report various incident types (crime, noise, disputes, hazards)
- Upload photos and videos as evidence
- Location tracking with map integration
- Incident categorization (minor, urgent, emergency)
- AI-based priority scoring
- Real-time status tracking (Submitted, In Progress, Resolved)

### 4. **Tanod Management**
- Tanod member profiles
- Duty scheduling (day/night shifts)
- Patrol area assignments
- Attendance and duty time logging
- Incident response tracking
- Performance metrics and ratings

### 5. **AI Features**
- Automatic incident classification
- Priority scoring for urgent cases
- Trend analysis of incident patterns
- Suggested response actions
- Performance insights and analytics

### 6. **Notification & Alert System**
- Real-time notifications for:
  - New incidents
  - Assigned tickets
  - Schedule changes
- Emergency alerts
- Admin broadcast announcements

### 7. **Dashboard & Analytics**
- Comprehensive admin dashboard
- Interactive charts and statistics
- Incident heat maps
- Response time tracking
- Tanod performance reports
- Downloadable monthly/yearly reports

### 8. **Community Announcements**
- Barangay announcements and advisories
- Emergency alerts (weather, curfew, evacuation)
- Event postings (meetings, clean-up drives)

### 9. **Feedback & Rating System**
- Rate incident handling
- Tanod response feedback
- AI-powered feedback summarization

### 10. **Security & Privacy**
- Secure JWT authentication
- Role-based permissions
- Activity logging
- Data privacy compliance



## 📦 Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd BH360-K
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create environment file:
\`\`\`bash
cp .env.example .env
\`\`\`

4. Update the \`.env\` file with your configuration:
\`\`\`env
VITE_API_BASE_URL=http://localhost:3000/api
\`\`\`

## 🚀 Development

Start the development server:
\`\`\`bash
npm run dev
\`\`\`

The application will be available at \`http://localhost:5173\`

## 🏗️ Build

Build for production:
\`\`\`bash
npm run build
\`\`\`

Preview production build:
\`\`\`bash
npm run preview
\`\`\`

## 📁 Project Structure

\`\`\`
BH360-K/
├── public/              # Static assets
├── src/
│   ├── api/            # API client configuration
│   ├── components/     # Reusable components
│   │   └── layout/    # Layout components (Header, Sidebar, etc.)
│   ├── pages/         # Page components
│   │   ├── Auth/      # Authentication pages
│   │   ├── Dashboard/ # Dashboard page
│   │   ├── Incidents/ # Incident management
│   │   ├── Tanod/     # Tanod management
│   │   ├── Users/     # User management
│   │   ├── HelpDesk/  # AI Help Desk
│   │   ├── Announcements/ # Announcements
│   │   ├── Analytics/ # Analytics & Reports
│   │   └── Profile/   # User profile
│   ├── store/         # Redux store
│   │   └── slices/    # Redux slices
│   ├── styles/        # Global styles
│   ├── theme/         # MUI theme configuration
│   ├── App.tsx        # Main app component
│   └── main.tsx       # Entry point
├── .env.example       # Environment variables template
├── tsconfig.json      # TypeScript configuration
├── vite.config.ts     # Vite configuration
└── package.json       # Dependencies
\`\`\`

## 🎨 Design System

### Colors
- **Primary:** Royal Azure (#3457D5) - Trust, authority, professionalism
- **Secondary:** Steel Blue (#4682b4) - Balance, reliability
- **Success:** Green (#2E7D32)
- **Error:** Red (#D32F2F)
- **Warning:** Orange (#ED6C02)
- **Info:** Light Blue (#0288D1)

### Typography
- **Font Family:** Inter
- **Weights:** 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)

### Mock Login Credentials:
- **Email:** Any email
- **Password:** Any password

