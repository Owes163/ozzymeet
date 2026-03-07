OzzyMeet – WebRTC Video Meeting App 🎥

OzzyMeet is a real-time video conferencing application inspired by Google Meet.
It allows users to create and join meeting rooms where they can communicate through video, audio, and chat using WebRTC technology.

The project demonstrates a full-stack real-time communication system using React, NestJS, WebRTC, and Socket.io.

🚀 Features

Create and join meeting rooms

Real-time video and audio communication

Screen sharing

Chat between participants

Virtual background support

Responsive participant grid layout

Invite link sharing

Meeting link based room access

🛠 Tech Stack
Frontend

React

Vite

WebRTC

Socket.io-client

CSS

Backend

NestJS

Socket.io (WebSocket signaling)

Prisma ORM

Database

SQLite (via Prisma)

📂 Project Structure
ozzymeet
│
├── Backend        # NestJS signaling server
│   ├── src
│   ├── prisma
│   └── package.json
│
├── Frontend       # React WebRTC client
│   ├── src
│   └── package.json
│
└── README.md
⚙️ Installation & Setup
1️⃣ Clone the repository
git clone https://github.com/Owes163/ozzymeet.git
cd ozzymeet
2️⃣ Backend Setup
cd Backend
npm install
npx prisma migrate dev
npm run start:dev

Backend runs on:

http://localhost:3001
3️⃣ Frontend Setup
cd Frontend
npm install
npm run dev

Frontend runs on:

http://localhost:5173

👨‍💻 Author

Owes Shaikh

GitHub
https://github.com/Owes163