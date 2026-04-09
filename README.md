# Manowealth — Student Wellness Platform

> A full-stack mental health and wellness platform built for **IIT Patna**, providing psychosocial assessments, mood tracking, counselor connectivity, AI chat support, and more — all in a React Native mobile app backed by a Node.js/Express API.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Mobile App Setup](#mobile-app-setup)
- [Configuration](#configuration)
- [Roles & Access](#roles--access)
- [Screens](#screens)
- [API Overview](#api-overview)
- [Notification System](#notification-system)
- [Team](#team)

---

## Overview

**Manowealth** is a mobile wellness platform designed for students at IIT Patna. It helps students track their mental health through a 50-question psychosocial wellness survey, daily mood logs, and AI-assisted chat. Counselors (admins) can monitor student wellbeing, receive SOS alerts, manage appointments, and send targeted announcements. A Super Admin oversees the entire system.

---

## Features

### Student (User)
- **Wellness Survey** — 50-question psychosocial assessment with scoring
- **Mood Tracking** — Daily mood logs with bar chart visualisation
- **AI Chatbot** — 24/7 wellness companion
- **Appointments** — Book and manage counseling sessions
- **Help a Friend** — Anonymous report submission for at-risk peers
- **SOS Alert** — Instantly notify assigned counselor
- **Notifications** — Receive announcements from admin/super admin
- **Upcoming Events** — Animated swipeable event carousel (sorted by date)
- **Wellness Score** — Computed from survey responses

### Admin (Counselor)
- View all assigned students and their survey results/scores
- Receive and resolve SOS alerts
- Manage appointment logs
- Send targeted announcements to assigned students
- View incoming Help-a-Friend reports

### Super Admin
- Full system overview — student count, admin count, survey completions
- Add / manage admins
- Post campus events (auto-notifies all students)
- Broadcast announcements to all students, all admins, or specific individuals
- View all SOS logs, appointments, and Help-a-Friend entries

### Public (Home Screen)
- Platform overview with feature highlights
- Upcoming events carousel
- Inspirational quote carousel with auto-rotation
- Support resources (Counselor Unit, Gymkhana, Academic Affairs)
- Meet the Team & Student Gymkhana Core Team
- Help a Friend (no login required)

---

## Tech Stack

### Mobile (Frontend)
| Technology | Version |
|---|---|
| React Native | 0.83.4 |
| Expo | ~55.0.12 |
| React Navigation | v6 |
| Axios | ^1.7.2 |
| AsyncStorage | 2.2.0 |
| React Native Reanimated | 4.2.1 |
| React Native Toast Message | ^2.2.0 |
| @react-native-picker/picker | 2.11.4 |

### Backend
| Technology | Version |
|---|---|
| Node.js + Express | ^4.22.1 |
| MongoDB + Mongoose | ^8.23.0 |
| JSON Web Token | ^9.0.2 |
| Multer + Cloudinary | ^1.4.5 / ^2.2.0 |
| Nodemailer + OTPLib | ^6.9.13 / ^13.4.0 |
| Nodemon | ^3.1.0 |

---

## Project Structure

```
Manowealth_Mobile/
├── index.js                        # Express server entry point
├── mailService.js                  # Email service
├── otpService.js                   # OTP generation
├── backend/
│   ├── config/
│   │   └── database.js             # MongoDB connection
│   ├── controllers/
│   │   ├── userController.js       # Auth, profile, mood, survey
│   │   ├── adminController.js      # Admin operations
│   │   ├── supAdminController.js   # Super admin operations
│   │   ├── announcementController.js
│   │   ├── eventController.js
│   │   ├── appointmentController.js
│   │   ├── SoScontroller.js
│   │   ├── moodController.js
│   │   ├── surveyController.js
│   │   └── helpAFriendController.js
│   ├── middlewares/
│   │   ├── authenticateToken.js    # JWT verification
│   │   ├── fileUpload.js           # Multer + Cloudinary
│   │   └── verify_role.js
│   ├── models/
│   │   ├── userSchema.js
│   │   ├── announcementModel.js
│   │   ├── eventModel.js
│   │   ├── eventNotifModel.js
│   │   ├── notificationModel.js    # SOS alerts
│   │   ├── profileModel.js
│   │   ├── appointmentModel.js
│   │   └── superAdminModel.js
│   └── routes/
│       ├── useRoutes.js            # Main API routes
│       ├── announcementRoutes.js
│       ├── eventRoutes.js
│       └── ReviewRoutes.js
└── mobile/
    ├── App.js
    ├── app.json                    # Expo config
    └── src/
        ├── api/
        │   └── api.js              # Axios instance with JWT interceptor
        ├── config.js               # API base URL
        ├── context/
        │   ├── AuthContext.js      # Auth state (user / admin / superAdmin)
        │   └── ThemeContext.js     # Dark/light theme
        ├── navigation/
        │   └── AppNavigator.js     # Stack + Tab navigators
        ├── screens/
        │   ├── home/               # Public home screen
        │   ├── auth/               # Login, Signup, ForgotPassword
        │   ├── user/               # Student screens
        │   ├── admin/              # Counselor screens
        │   ├── superadmin/         # Super admin screens
        │   └── notifications/      # Announcement screens (all roles)
        └── components/
            └── CalendarTimePicker.js
```

---

## Getting Started

### Prerequisites

- **Node.js** v18+ and npm
- **MongoDB** (local or Atlas URI)
- **Expo CLI** — `npm install -g expo-cli`
- **Expo Go** app on your phone (for development)

---

### Backend Setup

```bash
# 1. Install dependencies
npm install

# 2. Create a .env file in the root
DB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/manowealth
PORT=3030

# 3. Start the server
npm start
# or
nodemon index.js
```

The server runs on **port 3030** and binds to `0.0.0.0` (accessible on local network).

---

### Mobile App Setup

```bash
cd mobile

# 1. Install dependencies
npm install

# 2. Update the API base URL to your machine's local IP
# Edit: mobile/src/config.js
#   export default 'http://<YOUR_LOCAL_IP>:3030/v1';

# 3. Start Expo
npx expo start

# 4. Scan the QR code with Expo Go on your device
```

> **Note:** Your phone and development machine must be on the **same Wi-Fi network**.

---

## Configuration

### `mobile/src/config.js`
```js
const API_BASE_URL = 'http://10.42.25.198:3030/v1';
export default API_BASE_URL;
```
Change the IP to match your machine's LAN address.

### Cloudinary (Profile Pictures)
Configured directly in `backend/middlewares/fileUpload.js`:
```js
cloudinary.config({
  cloud_name: 'YOUR_CLOUD_NAME',
  api_key: 'YOUR_API_KEY',
  api_secret: 'YOUR_API_SECRET'
});
```

### JWT Secret
In `backend/controllers/userController.js` and `backend/middlewares/authenticateToken.js` — both use the same secret string. Set it in `.env` for production.

---

## Roles & Access

| Role | How to Login | Access |
|---|---|---|
| **Student** | `/login` (email + password) | Survey, Mood, Chatbot, Appointments, SOS, Notifications |
| **Admin** | Admin Login screen | Student data, SOS alerts, Appointments, Announcements |
| **Super Admin** | Super Admin Login screen | Everything + Event posting, System-wide announcements |

The app automatically routes to the correct stack based on which role object is set in `AuthContext`.

---

## Screens

### Student
| Screen | Description |
|---|---|
| DemographicForm | One-time profile setup after first login |
| Dashboard | Greeting, quick actions, events, quotes, mood summary |
| Survey | 50-question psychosocial wellness assessment |
| MoodTracker | Log and visualise daily mood |
| Chatbot | AI wellness chat companion |
| Appointments | Book / view counseling appointments |
| Help a Friend | Submit anonymous report for a peer |
| Summary | View personal wellness score breakdown |
| Notifications | Read announcements from counselors / admin |
| Profile | View and edit profile |

### Admin
| Screen | Description |
|---|---|
| AdminDashboard | Overview, student list, stats, 🔔 announcements |
| UserData | All assigned students |
| UserReport | Individual student survey + mood report |
| SOSNotifications | Live SOS alert feed with resolve action |
| AllAppointments | Appointment log |
| Notifications | Send/receive announcements |

### Super Admin
| Screen | Description |
|---|---|
| SuperAdminDashboard | Stats, management menu, 📢 announce button |
| AllStudents | Full student list |
| AllAdmins | Admin list |
| AddAdmin | Create new admin account |
| AllSOSLogs | All SOS entries across system |
| AllAppointments | All appointments |
| HelpAFriendEntries | All anonymous friend reports |
| Notifications | Broadcast to all / individuals |

---

## API Overview

All endpoints are prefixed with `/v1`. Protected routes require `Authorization: Bearer <token>`.

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/login` | Student login |
| POST | `/signup` | Student registration |
| POST | `/admin-login` | Admin login |
| POST | `/super-login` | Super admin login |
| POST | `/send-otp` | Send OTP for password reset |
| POST | `/reset-password` | Reset password with OTP |

### User / Profile
| Method | Endpoint | Description |
|---|---|---|
| GET | `/get-user-info/:id` | Get user profile + info |
| POST | `/update-profile` | Update demographic profile |
| POST | `/update-tnc` | Accept terms & conditions |

### Survey & Mood
| Method | Endpoint | Description |
|---|---|---|
| POST | `/submit-survey` | Submit wellness survey answers |
| GET | `/get-mood-logs/:id` | Get user mood history |
| POST | `/log-mood` | Log daily mood |

### Events
| Method | Endpoint | Description |
|---|---|---|
| GET | `/events` | Get all upcoming events |
| POST | `/events` | Create event (Super Admin) |
| DELETE | `/events/:id` | Delete event |
| GET | `/events/notifications/:userId` | Unread event notifications |
| PATCH | `/events/notifications/read/:userId` | Mark all event notifs read |

### Announcements
| Method | Endpoint | Description |
|---|---|---|
| POST | `/announcements` | Create announcement |
| GET | `/announcements/user/:userId` | Announcements for student |
| GET | `/announcements/admin/:adminId` | Announcements for admin |
| GET | `/announcements/all` | All announcements (Super Admin) |
| PATCH | `/announcements/:id/read/:userId` | Mark as read |

### SOS
| Method | Endpoint | Description |
|---|---|---|
| POST | `/send-sos` | Send SOS to assigned counselor |
| GET | `/get-all-sos/:adminId` | Get all SOS for admin |
| PATCH | `/sos/resolve/:id` | Mark SOS as resolved |

### Appointments
| Method | Endpoint | Description |
|---|---|---|
| POST | `/appointment` | Book appointment |
| GET | `/admin/appointments/:adminId` | Get admin's appointments |

---

## Notification System

Three parallel notification channels:

1. **SOS Alerts** — Real-time distress signal from student to assigned counselor. Admin sees active/resolved feed.

2. **Event Notifications** — Auto-generated when Super Admin posts an event. Badge count shown on student dashboard.

3. **Announcements** — Rich targeted messaging system:

| Sender | Can send to |
|---|---|
| Super Admin | All Students / All Admins / Everyone / Specific individual |
| Admin | Own assigned students |

Announcements support read-receipts. Unread count shown as badge on the 🔔 bell button in each dashboard.

---

## Team

### Wellness Team — IIT Patna
| Name | Role |
|---|---|
| Prof. Jimson Mathew | Dean, Student Affairs |
| Dr. Mahendar Ram | PIC Wellness |
| Mr. Aditya Sahu | Counselor |


### Developers
| Name | Institution |
|---|---|
| Parul Garg | IIT Patna |
| Mihika Saxena | IIT Patna |

---

## License

This project is developed for internal use at **IIT Patna**. All rights reserved.
