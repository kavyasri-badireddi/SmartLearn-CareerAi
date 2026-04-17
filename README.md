

# 🚀 SmartLearn & Career AI-Intelligent Study and Resume Assistant 

A full-stack AI-driven web application built with **Next.js**, designed to help users manage notes, analyze career paths, and leverage AI-powered insights.



## 📌 Features

* 🔐 **Authentication System**

  * Email/password signup & login
  * OAuth (Google & GitHub)
  * Password reset & email verification

* 🧠 **AI Career Analysis**

  * Analyze user skills and suggest career paths
  * Intelligent recommendations using AI

* 📝 **Notes Management**

  * Create, update, delete notes
  * AI-powered note processing & extraction

* 📄 **Content Extraction**

  * Extract useful information from input text/files

* 📊 **Dashboard**

  * Personalized user dashboard
  * Organized access to notes and insights

* 🔒 **Secure Backend**

  * Prisma ORM with database integration
  * Token-based authentication & authorization



## 🛠️ Tech Stack

* **Frontend:** Next.js (App Router), TypeScript, CSS
* **Backend:** Next.js API Routes
* **Database:** Prisma ORM
* **Authentication:** Custom + OAuth (Google, GitHub)
* **AI Integration:** Custom AI logic (via `src/lib/ai.ts`)
* **Email Services:** Node mail utilities



## 📁 Project Structure

```
ai-main/
│── prisma/                 # Database schema
│── public/                 # Static assets
│── src/
│   ├── app/                # App router pages & API routes
│   │   ├── api/            # Backend endpoints
│   │   ├── login/          # Auth pages
│   │   ├── dashboard/      # User dashboard
│   │   └── career/         # Career analysis UI
│   ├── lib/                # Core logic (AI, auth, prisma, etc.)
│── package.json
│── next.config.ts
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Setup environment variables

Create a `.env` file in the root:

```env
DATABASE_URL=your_database_url
NEXTAUTH_SECRET=your_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_secret

EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

---

### 4️⃣ Setup database

```bash
npx prisma generate
npx prisma migrate dev
```

---

### 5️⃣ Run the development server

```bash
npm run dev
```

Visit:
👉 [http://localhost:3000](http://localhost:3000)

---

## 🔑 API Routes Overview

### Auth

* `/api/auth/signup`
* `/api/auth/login`
* `/api/auth/google`
* `/api/auth/github`
* `/api/auth/reset-password`

### Notes

* `/api/notes`
* `/api/notes/[id]`
* `/api/notes/process`

### AI & Career

* `/api/career/analyze`
* `/api/extract`

---

## 🧪 Testing Files

* `test-crypto.js` – cryptographic testing
* `test_cases_analysis.md` – test case documentation

---

## 👥 Team

* Chandini
* Kavya
* Mrudula
* Subrahmanyam

(Images available in `/public/images/team`)



## 🚀 Future Improvements

* 📱 Mobile responsiveness enhancements
* 🤖 Advanced AI models integration
* 📊 Analytics dashboard
* 🧩 Plugin-based architecture


## 📜 License

This project is licensed under the **MIT License**.

## 💡 Contribution

Contributions are welcome!

```bash
# Fork the repo
# Create your feature branch
git checkout -b feature/your-feature

# Commit changes
git commit -m "Add your feature"

# Push
git push origin feature/your-feature
```

