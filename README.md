# WorkSphere - A Comprehensive Employee Management System

WorkSphere is a modern employee management system designed for Employees, HR personnel, and Admins. It simplifies work tracking, payroll management, and role-based data access with a secure and responsive experience.

🌐 **Live Demo:** [https://worksphere-demo.vercel.app/](https://worksphere-demo.vercel.app/)

---

## 🚀 Features

### 🌐 General Features

#### 🔐 User Authentication
- Secure registration, login, and logout with email/password & Google Sign-In.
- Authentication powered by Firebase Authentication.

#### 👤 Profile Management
- Users can view and update personal profile details (name, photo, designation, bank account).

#### 🧭 Role-Based Dashboard
- Dynamic sidebar & content based on role (Employee, HR, Admin).
- Custom `useUserRole` hook for role management.

#### 📊 Dashboard Statistics
- Home page shows role-specific statistics (e.g., total worksheets, paid salaries, total users).

#### 📱 Responsive Design
- Fully responsive design for desktop, tablet, and mobile.

### 👨‍💼 Employee Features

- **Employee Dashboard:** Personalized view for work insights.
- **My WorkSheet:** Submit and manage daily work logs.
- **My Payment History:** View salary payment history.

### 👩‍💻 HR Features

- **HR Dashboard:** Organized links for HR operations.
- **Employee List:** View employee profiles and toggle verification status.
- **Employee Details:** View profile & monthly work hours chart (Recharts).
- **Progress:** View and filter submitted worksheets by multiple criteria.
- **Payment History:** View & filter salary payments.
- **Create Payment Request:** Create salary payment requests for employees.

### 👑 Admin Features

- **Manage Users:** View, edit roles, or delete user accounts (except self).
- **All Employee List:** Reuse `EmployeeList` to view all employees.
- **Payroll:** Approve/reject salary payment requests with transaction ID input.

---

## 🛠️ Technologies Used

### 🔧 Frontend

- **React.js**: UI library.
- **React Router DOM**: Routing.
- **Tailwind CSS**: Styling framework.
- **TanStack Query (React Query):** Server state & caching.
- **React Hook Form:** Form handling.
- **Recharts:** Charts & graphs.
- **SweetAlert2:** Alerts & confirmations.
- **LottieFiles:** Animations.
- **React Icons:** Icon library.
- **Axios:** HTTP client.

### 🔧 Backend

- **Node.js:** Runtime.
- **Express.js:** Web framework.
- **Firebase Admin SDK:** JWT verification & Firebase access.
- **MongoDB:** NoSQL database.
- **CORS:** Cross-Origin requests.
- **dotenv:** Manage environment variables.

### 🔧 Database

- **MongoDB Atlas:** Cloud-hosted database.

### 🔧 Authentication

- **Firebase Authentication:** Client-side auth.
- **Firebase Admin SDK:** Server-side auth validation.

### 🔧 Other

- **ImgBB:** Image hosting for profile pictures.

---

## ⚙️ Setup Instructions

### 1. Prerequisites

- Node.js v18+
- npm v8+
- MongoDB Atlas Account
- Firebase Project
- ImgBB Account (optional, for profile images)

### 2. Environment Variables

#### 📁 Server (`work-sphere-server/.env`)

```bash
PORT=3000
DB_MONGODB_URI=<Your MongoDB Atlas URI>
```

#### 📁 Client (`work-sphere-client/.env`)

```bash
VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
VITE_IMGBB_API_KEY=YOUR_IMGBB_API_KEY
VITE_SERVER_BASE_URL=http://localhost:3000
```

🔑 **Firebase Admin SDK Key:**
Download your service account key from the Firebase console and save it as `worksphere-firebase-adminsdk.json` in the server root.

### 3. Backend Setup

```bash
cd work-sphere-server
npm install
node server.js
# or
nodemon server.js
```

### 4. Frontend Setup

```bash
cd work-sphere-client
npm install
npm run dev
```

---

## 💡 Usage

- Visit `http://localhost:5173` (or your live URL).
- Register your first user.
- To make a user an Admin, manually update their `role` in MongoDB Atlas.
- Log in as Employee, HR, or Admin to explore their respective dashboards.

---


