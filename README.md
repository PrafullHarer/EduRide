# EduRide - Safe & Smart Student Transport

**EduRide** (formerly School Bus Buddy) is a comprehensive transport management system designed to bridge the gap between schools, parents, and bus drivers. It ensures student safety through real-time tracking, automated alerts, and efficient route management.

<div align="center">
  <img src="/public/favicon.svg" alt="EduRide Logo" width="100" />
</div>

## 🚀 Features

### 🎓 For Students & Parents
- **Live Bus Tracking:** Real-time visual tracking of the assigned bus.
- **Trip History:** View past trips and attendance.
- **Subscription Management:** Easy renewal and payment history.
- **Notifications:** Adjust alert preferences for delays and arrivals.

### 🚌 For Drivers
- **Route Navigation:** View assigned route stops and students.
- **Attendance:** Digital checklist for boarding/deboarding students with morning/evening shifts.
- **Duty Schedule:** View upcoming shifts and assigned buses.
- **Trip Logs:** Automatic logging of completed trips with timestamps and student counts.
- **Dashboard:** "Today's Status" overview with quick actions for marking trips complete.

### 🛡️ For Admins
- **Dashboard:** High-level overview of fleet status, active trips, and revenue.
- **Fleet Management:** Add/Edit buses, routes, and assign drivers.
- **User Management:** Manage student subscriptions and driver profiles.
- **Message Center:** View and respond to inquiries from the "Contact Us" page.
- **Financials:** Track payments, subscription statuses, and generate pricing plans.

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Lucide Icons.
- **Backend:** Node.js, Express.js, MongoDB (Mongoose), Socket.IO.
- **State Management:** React Query (TanStack Query), Context API.
- **Deployment:** Vercel (Frontend & Serverless Functions compatible).

## 🏁 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (A local or Atlas connection string)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/eduride.git
    cd eduride
    ```

2.  **Install Root & Frontend Dependencies:**
    ```bash
    npm install
    ```

3.  **Install Backend Dependencies:**
    ```bash
    cd server
    npm install
    cd ..
    ```

4.  **Environment Setup:**
    - Create a `.env` file in `server/` with:
      ```env
      MONGO_URI=your_mongodb_connection_string
      JWT_SECRET=your_jwt_secret
      PORT=5000
      ```

5.  **Run the Project:**
    You need to run both the frontend and backend servers.
    
    **Terminal 1 (Backend):**
    ```bash
    cd server
    npm run dev
    ```
    
    **Terminal 2 (Frontend):**
    ```bash
    # From root directory
    npm run dev
    ```

6.  **Access the App:**
    Open [http://localhost:8080](http://localhost:8080) to view it in your browser.

## 📚 Documentation

For detailed architecture, API endpoints, and folder structure, please refer to the [User & Developer Guide](./docs/DOCUMENTATION.md).

## 📄 License

This project is licensed under the MIT License.
