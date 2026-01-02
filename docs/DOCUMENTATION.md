# EduRide - Developer & User Guide

This document provides a comprehensive overview of the EduRide project structure, features, and technical details.

## 📂 Project Structure

The project follows a monorepo-style structure where both frontend and backend reside in the same repository.

```
eduride/
├── api/                # Vercel Serverless Function entry point
├── dist/               # Production build output
├── public/             # Static assets (favicons, manifest)
├── server/             # Backend (Express + MongoDB)
│   ├── config/         # DB configuration
│   ├── middleware/     # Auth & Error handling
│   ├── models/         # Mongoose Schemas (User, Bus, Route, Message...)
│   ├── routes/         # API Routes
│   └── index.js        # Local Server entry point
├── src/                # Frontend (React + Vite)
│   ├── components/     # Reusable UI components (shadcn/ui)
│   ├── contexts/       # Global State (AuthContext)
│   ├── lib/            # Utilities (API wrapper, formatting)
│   ├── pages/          # Page views (Admin, Driver, Student)
│   ├── App.tsx         # Main Router configuration
│   └── main.tsx        # Entry point
├── index.html          # HTML template
├── package.json        # Root dependencies & scripts
└── README.md           # Project overview
```

## 🔐 User Roles & Access

The application supports three distinct user roles:

1.  **Student / Parent**
    -   Access to personal dashboard.
    -   Can track assigned bus.
    -   View subscription status.
    -   Cannot access admin or driver routes.

2.  **Driver**
    -   Access to driver dashboard.
    -   Can view assigned route details (stops, students).
    -   Can mark attendance.
    -   Cannot modify system settings.

3.  **Admin**
    -   Full system access.
    -   Can manage users, buses, routes, and subscriptions.
    -   Can view system analytics and messages.

*To create an Admin user, you may need to manually update the `role` in the database or use a seed script.*

## 🔌 API Reference (Key Endpoints)

All API calls are prefixed with `/api`.

### Authentication
-   `POST /auth/register` - Register a new user.
-   `POST /auth/login` - Login and receive JWT.
-   `GET /auth/me` - Get current user profile.

### Dashboard Data
-   `GET /dashboard/student` - Aggregated data for student view (Proifle, Bus, Route).

### Resources
-   `GET/POST /students` - Manage students.
-   `GET/POST /drivers` - Manage drivers.
-   `GET/POST /buses` - Manage buses.
-   `GET/POST /routes` - Manage routes.
-   `POST /messages` - (Public) Send contact message.
-   `GET /messages` - (Admin) View messages.

## 🚀 Deployment

### Vercel (Recommended)
This project is configured for Vercel. The `api/index.js` file serves as the serverless function entry point to handle backend requests.

1.  Connect your GitHub repo to Vercel.
2.  Set `Framework Preset` to **Vite**.
3.  Add Environment Variables (`MONGODB_URI`, `JWT_SECRET`).
4.  Deploy.

### Manual / VPS
1.  Run `npm run build` to generate the `dist` folder.
2.  Serve the `dist` folder using a static file server (e.g., Nginx, serve).
3.  Run the backend using `node server/index.js` (managed by PM2 or similar).

## 💡 Troubleshooting

-   **"404 Not Found" on API in Local Dev:** Ensure you assume the server is running on port 5000 and the frontend on 8080. The frontend proxies `/api` to `localhost:5000` or uses the absolute URL if configured.
-   **Black Screen on Load:** If the app stays blank, ensure the backend is reachable. The `PageLoader` handles waiting for auth, but network errors might stall it. Check console logs.

## 📞 Support
For technical support, contact the dev team or open an issue in the repository.
