# OzzyMeet – WebRTC Video Meeting App 🎥

OzzyMeet is a real-time video conferencing application similar to Google Meet.
It allows users to create or join meeting rooms and communicate through video, audio, and chat using WebRTC technology.

---

## 🚀 Features

* Create and join meeting rooms
* Real-time video and audio communication
* Screen sharing
* Chat between participants
* Virtual background support
* Participant grid layout
* Invite link sharing

---

## 🛠 Tech Stack

### Frontend

* React
* Vite
* WebRTC
* Socket.io

### Backend

* NestJS
* Prisma
* WebSocket (Signaling Server)

### Database

* SQLite (via Prisma)

---

## 📂 Project Structure

```
ozzymeet
│
├ Backend      # NestJS signaling server
│
├ Frontend     # React WebRTC client
│
└ README.md
```

---

## ⚙️ Installation

### 1️⃣ Clone the repository

```
git clone https://github.com/Owes163/ozzymeet.git
```

```
cd ozzymeet
```

---

### 2️⃣ Backend Setup

```
cd Backend
npm install
npx prisma migrate dev
npm run start:dev
```

Backend runs on:

```
http://localhost:3001
```

---

### 3️⃣ Frontend Setup

```
cd Frontend
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

## 📸 Demo

Open the app and create a meeting:

```
http://localhost:5173
```

Share the meeting link with friends to join the call.

---

## 👨‍💻 Author

**Owes Shaikh**

GitHub
https://github.com/Owes163  iss ko accha kar d ebhai 