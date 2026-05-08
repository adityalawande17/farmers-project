# 🌾 FarmSense AI — Smart Farming Companion

A full-stack MERN application with AI integration for Indian farmers. Built with MongoDB, Express, React, Node.js, and Claude AI.

---

## ✨ Features

| Feature             | Description                                 | AI               |
| ------------------- | ------------------------------------------- | ---------------- |
| 🤖 AI Chatbot       | Ask anything in Hindi, Marathi, or English  | ✅ Claude        |
| 🌿 Disease Detector | Upload leaf photo for instant diagnosis     | ✅ Claude Vision |
| 📈 Mandi Prices     | Live crop prices + sell timing advice       | ✅ Claude        |
| 🌦 Weather Advisor  | 7-day forecast with farming recommendations | ✅ Claude        |
| 📊 Farm Dashboard   | Crop tracking, yield charts, profit/loss    | —                |
| 🌱 Crop Management  | Add crops, log expenses, track growth       | —                |

---

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, React Router
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT
- **AI**: Anthropic Claude API (chat + vision)
- **Weather**: OpenWeatherMap API
- **File Upload**: Multer

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Anthropic API key → https://console.anthropic.com
- OpenWeatherMap API key → https://openweathermap.org/api (free tier works)

---

### 1. Clone & Setup

```bash
git clone <your-repo-url>
cd ai-farmsense
```

### 2. Backend Setup

```bash
cd server
npm install

# Create .env file
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ai-farmsense
JWT_SECRET=your_super_secret_key_here
ANTHROPIC_API_KEY=sk-ant-your-key-here
OPENWEATHER_API_KEY=your-openweather-key-here
CLIENT_URL=http://localhost:5173
```

```bash
npm run dev
```

Server runs on http://localhost:5000

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

Frontend runs on http://localhost:5173

---

## 📁 Project Structure

```
ai-farmsense/
├── client/                        # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx          # Auth - login
│   │   │   ├── Register.jsx       # Auth - 3-step registration
│   │   │   ├── Dashboard.jsx      # Main dashboard with charts
│   │   │   ├── Chatbot.jsx        # AI chat assistant
│   │   │   ├── DiseaseDetector.jsx # Image upload + AI diagnosis
│   │   │   ├── MandiPrices.jsx    # Live prices + AI sell advice
│   │   │   ├── WeatherAdvisor.jsx # Forecast + AI farming tips
│   │   │   └── AddCrop.jsx        # Add crop with expenses
│   │   ├── components/
│   │   │   └── Layout.jsx         # Sidebar navigation
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Global auth state
│   │   └── App.jsx                # Routes
│   └── package.json
│
└── server/                        # Express backend
    ├── index.js                   # Entry point
    ├── models/
    │   ├── User.js                # Farmer model
    │   └── Crop.js                # Crop + expense model
    ├── routes/
    │   ├── auth.js                # Register, login, /me
    │   ├── ai.js                  # Claude chatbot + advisors
    │   ├── disease.js             # Image upload + AI detection
    │   ├── farm.js                # Crop CRUD + dashboard
    │   └── prices.js              # Mandi prices + weather
    ├── middleware/
    │   └── auth.js                # JWT middleware
    └── .env.example
```

---

## 🔌 API Endpoints

### Auth

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| POST   | `/api/auth/register` | Register new farmer |
| POST   | `/api/auth/login`    | Login               |
| GET    | `/api/auth/me`       | Get current user    |

### AI

| Method | Endpoint              | Description          |
| ------ | --------------------- | -------------------- |
| POST   | `/api/ai/chat`        | AI chatbot (Claude)  |
| POST   | `/api/ai/crop-advice` | Specific crop advice |
| POST   | `/api/ai/sell-advice` | Mandi sell timing    |

### Farm

| Method | Endpoint                      | Description       |
| ------ | ----------------------------- | ----------------- |
| GET    | `/api/farm/crops`             | List user's crops |
| POST   | `/api/farm/crops`             | Add new crop      |
| PUT    | `/api/farm/crops/:id`         | Update crop       |
| POST   | `/api/farm/crops/:id/expense` | Add expense       |
| GET    | `/api/farm/dashboard`         | Dashboard stats   |

### Other

| Method | Endpoint                        | Description                         |
| ------ | ------------------------------- | ----------------------------------- |
| POST   | `/api/disease/detect`           | Upload image + AI disease detection |
| GET    | `/api/prices`                   | All mandi prices                    |
| GET    | `/api/prices/weather?lat=&lon=` | Weather forecast                    |

---

## 🌍 Deployment

### Backend → Render

1. Push to GitHub
2. New Web Service on Render → connect repo → set `/server` as root
3. Add all environment variables
4. Deploy

### Frontend → Vercel

1. New project → connect repo → set `/client` as root
2. Add `VITE_API_URL=https://your-render-backend.onrender.com/api`
3. Deploy

---

## 🔮 Future Enhancements

- [ ] SMS alerts via Twilio (for farmers without smartphones)
- [ ] Government scheme eligibility checker
- [ ] Equipment rental marketplace
- [ ] Offline PWA support
- [ ] Voice input in regional languages
- [ ] Crop calendar with push notifications

---

## 📝 License

MIT — free to use and modify.
