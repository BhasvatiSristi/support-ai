# 🤖 IntelliSupport – AI Customer Support Platform

IntelliSupport is a full-stack AI-powered customer support platform that enables businesses to create and deploy intelligent chatbots on their websites with minimal setup. Businesses can customize the chatbot with their own knowledge base, generate context-aware responses, and integrate the chatbot into any website using a single JavaScript script.

It also generates private AI Insights for the business owner after customer conversations, summarizing issues, sentiment, priority, and resolution status inside the admin dashboard only.

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
- 📊 Admin-only AI Insights for conversation summaries and support analytics
- 🌐 One-click chatbot embedding using a JavaScript `<script>` tag
- 📱 Responsive and modern UI
- 🎨 Smooth animations with Framer Motion
- ☁️ Production deployment on Vercel

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
IntelliSupport/
│
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── model/
│   └── types.d.ts
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

MONGODB_URL=your_mongodb_connection_string

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

IntelliSupport generates a unique JavaScript snippet.

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

### 7. AI Insights Generation

After a customer chat is handled, the conversation is sent to Gemini for structured analysis.

The system stores:

- Issue title
- Summary
- Issue category
- Sentiment
- Priority
- Resolution status

These insights are shown only in the admin dashboard at `/dashboard/insights`.

---

## 📌 Key Functionalities

- AI-powered customer support
- Business-specific chatbot configuration
- Website chatbot embedding
- Admin-only AI insights and conversation summaries
- Authentication and authorization
- Dashboard for chatbot management
- Searchable insights dashboard with filters and conversation view
- Responsive design
- Smooth UI animations
- Production deployment

---

## 🎯 Future Improvements

- Conversation history
- Multi-language support
- Live human agent handoff
- File upload support
- Knowledge base management
- Role-based access control
- Chatbot themes
- AI response feedback
- RAG (Retrieval-Augmented Generation)
- Voice support
- Streaming AI responses
- Conversation analytics exports

---

## 🌍 Live Demo

🔗 https://support-ai-bice.vercel.app

---


## ⭐ If you found this project useful, consider giving it a star!