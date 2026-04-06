# Manowealth Mobile App - Setup Guide

## Prerequisites
- Node.js (v18+)
- Expo CLI: `npm install -g expo-cli`
- Android Studio (for Android emulator) or Xcode (for iOS simulator)
- Or Expo Go app on physical device

## Installation

```bash
cd mobile
npm install
```

## Configure Backend URL

Edit `src/config.js`:

```js
// For Android emulator
const API_BASE_URL = 'http://10.0.2.2:3030/v1';

// For iOS simulator
const API_BASE_URL = 'http://localhost:3030/v1';

// For physical device (replace with your computer's local IP)
const API_BASE_URL = 'http://192.168.x.x:3030/v1';
```

## Run the App

```bash
# Start Expo development server
npm start

# Android
npm run android

# iOS
npm run ios
```

## Features Included

### User Features
- Student Login / Sign Up (IITP email only: @iitp.ac.in)
- Forgot Password with OTP
- Demographic Form (degree, department, semester, gender, age)
- User Dashboard with quick actions, quotes, mood charts
- **51-Question Wellness Survey** (same as website)
- Survey Results & Scores (WHO-5, PHQ-9, GAD-7, Overall)
- Mood Tracker (5 dimensions: mood, stress, sleep, energy, appetite)
- AI Chatbot (Mano)
- Book Appointments with counselor
- Help a Friend (confidential reporting)
- Profile Management with photo upload
- SOS Alert (sends emergency notification to counselor)
- Dark / Light theme

### Admin Features
- Admin Login
- Dashboard with assigned students, SOS alerts
- View all assigned students with scores
- Detailed student reports (overview, mood history, demographics)
- SOS Notifications management

### Super Admin Features
- Super Admin Login
- Dashboard with system-wide stats
- Manage all admins (create, delete)
- View all students
- All SOS logs, mood logs, appointments, surveys
- Manage events

## Theme Colors (same as website)
- Accent: `#7c83e0` (indigo)
- Background: `#0f1117` (dark)
- Success: `#4caf8a` (green)
- Sage: `#6ecb8a`
- Teal: `#3ecfbe`
- Amber: `#f0a96a`
- Danger: `#e07c7c`
