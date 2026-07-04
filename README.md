# 🤖 SupportAI – AI Customer Support Platform

SupportAI is a full-stack AI-powered customer support platform that enables businesses to create and deploy intelligent chatbots on their websites with minimal setup. Businesses can customize the chatbot with their own knowledge base, generate context-aware responses, and integrate the chatbot into any website using a single JavaScript script.

> 🚀 Built with Next.js, TypeScript, MongoDB, Tailwind CSS, ScaleKit Authentication, and deployed on Vercel.

---

## ✨ Features

- 🔐 Secure authentication using **ScaleKit**
  - Google OAuth
  - Email OTP Authentication
- 🏢 Business profile management
- 🧠 Custom AI knowledge base for business-specific responses
- 💬 AI-powered customer support chatbot
- 📋 Admin dashboard for chatbot configuration
- 🌐 One-click chatbot embedding using a JavaScript `<script>` tag
- 📱 Responsive and modern UI
- 🎨 Smooth animations with Framer Motion
- ☁️ Production deployment on Vercel

---

## 📸 Screenshots

> Add screenshots here after uploading them.

### Home Page

![Home Page](./screenshots/home.png)

### Dashboard

![Dashboard](./screenshots/dashboard.png)

### Chatbot

![Chatbot](./screenshots/chatbot.png)

---

## 🛠️ Tech Stack

### Frontend

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Framer Motion

### Backend

- Next.js API Routes
- REST APIs

### Database

- MongoDB

### Authentication

- ScaleKit
- Google OAuth
- Email OTP

### Deployment

- Vercel

---

## 📂 Project Structure

```
SupportAI/
│
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── models/
│   ├── actions/
│   └── utils/
│
├── public/
├── package.json
└── README.md
```

---

## ⚙️ Installation

Clone the repository

```bash
git clone https://github.com/yourusername/support-ai.git
```

Navigate into the project

```bash
cd support-ai
```

Install dependencies

```bash
npm install
```

Start the development server

```bash
npm run dev
```

Open

```
http://localhost:3000
```

---

## 🔑 Environment Variables

Create a `.env.local` file in the project root.

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

MONGODB_URI=your_mongodb_connection_string

SCALEKIT_ENV_URL=your_scalekit_environment_url
SCALEKIT_CLIENT_ID=your_client_id
SCALEKIT_CLIENT_SECRET=your_client_secret

GEMINI_API_KEY=your_api_key
```

---

## 🚀 How It Works

### 1. User Authentication

Users can securely sign in using:

- Google OAuth
- Email OTP

Authentication and session management are handled by **ScaleKit**.

---

### 2. Business Registration

After logging in, users can configure:

- Business Name
- Support Email
- AI Knowledge Base

The chatbot uses this information to generate personalized customer support responses.

---

### 3. Save Configuration

The business configuration is stored in **MongoDB**.

---

### 4. Generate Embed Script

SupportAI generates a unique JavaScript snippet.

Example:

```html
<script src="https://your-domain.com/embed.js"></script>
```

---

### 5. Embed on Any Website

Simply paste the generated script before the closing `</body>` tag.

```html
<body>

...

<script src="https://your-domain.com/embed.js"></script>

</body>
```

The chatbot automatically appears on the website.

---

### 6. Customer Interaction

Visitors can:

- Ask questions
- Get instant AI-generated responses
- Receive business-specific information

---

## 📌 Key Functionalities

- AI-powered customer support
- Business-specific chatbot configuration
- Website chatbot embedding
- Authentication and authorization
- Dashboard for chatbot management
- Responsive design
- Smooth UI animations
- Production deployment

---

## 🎯 Future Improvements

- Conversation history
- Multi-language support
- Live human agent handoff
- Analytics dashboard
- File upload support
- Knowledge base management
- Role-based access control
- Chatbot themes
- AI response feedback
- RAG (Retrieval-Augmented Generation)
- Voice support
- Streaming AI responses

---

## 🌍 Live Demo

🔗 https://support-ai-bice.vercel.app

---


## ⭐ If you found this project useful, consider giving it a star!