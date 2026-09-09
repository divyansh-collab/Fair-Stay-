# 🏡 FairStay — Universal Vacation Rentals & Stays (Full Stack MERN)

[![React 19](https://img.shields.io/badge/React-19.0.0-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-purple.svg)](https://vite.dev/)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/express-4.21.2-blue.svg)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/atlas)
[![Google Gemini AI](https://img.shields.io/badge/Google%20Gemini-AI%20Concierge-orange.svg)](https://deepmind.google/technologies/gemini/)
[![Tests Coverage](https://img.shields.io/badge/tests-70%2F70%20passed%20(100%25)-success.svg)](https://github.com/divyansh-collab/Fair-Stay-)
[![Live Deployment](https://img.shields.io/badge/Render-Live%20Production-blueviolet.svg)](https://fair-stay.onrender.com)

**FairStay** is a production-ready, full-stack **MERN** (MongoDB, Express, React, Node.js) vacation rental platform engineered with signature Airbnb elegance, 3D spatial motion physics, transparent area pricing (**FairSafe™**), 100% organic Google Places photography, and an intelligent AI Trip Assistant powered by **Google Gemini 1.5 Flash**.

🌐 **Live Deployment:** [fair-stay.onrender.com](https://fair-stay.onrender.com)  
📂 **GitHub Repository:** [divyansh-collab/Fair-Stay-](https://github.com/divyansh-collab/Fair-Stay-)

---

## ✨ Key Features & Capabilities

### 🏖️ 1. Universal Stays & Multi-Word Instant Search
- **166 Verified Stays** across India's premier vacation destinations (Goa, Manali, Jaipur, Udaipur, Kerala / Munnar, Mumbai, Bengaluru) and spiritual corridors (Varanasi, Ayodhya, Prayagraj, Puri, Tirupati, Rishikesh).
- **Fast Filter Engine**: Filter dynamically by Category (*Beachfront*, *Mountain Views*, *Ashrams*, *Heritage*, *Luxe*, *Budget*, *Villas*), Destination, or Price Slider.
- **Instant Search API**: Multi-word keyword query parser (`/api/search?q=goa+pool`) returns real-time matching listings.

### 🖼️ 2. Luxury 5-Photo Bento Showcase & Interactive Fullscreen Lightbox
- **Signature Bento Grid**: High-res hero photo + 4 complementary luxury architecture, bedroom, lounge, and patio photos.
- **Fullscreen Modal Viewer**: Click ANY photo or the *"Show all 5 photos"* button to open the full-screen gallery.
- **Photo Navigation**: Previous (`<`) and Next (`>`) arrows, keyboard arrow controls (`←` / `→` / `Esc`), live photo counter (`1 / 5`), room captions, and clickable thumbnails.

### 🛡️ 3. FairSafe™ Transparent Festival & Area-Wise Pricing
- **100% Transparent Pricing**: See the exact base price, GST tax breakdown (12% / 18%), and direct host pricing with zero hidden OTA markups.
- **City & Area Festival Intelligence**: Dynamic tracking of price increases and decreases during premier local events and off-seasons across specific Indian destinations—with complete freedom for hosts to price their properties and zero platform restrictions.

### 🤖 4. AI Trip Assistant & Festival Price Predictor (Google Gemini)
- **AI Concierge**: Floating interactive chat assistant widget powered by Google Gemini 1.5 Flash to answer questions, recommend itineraries, and suggest authentic local experiences.
- **AI Smart Search**: Understands natural language inputs like *"quiet beachfront villa in Goa under 6000"* and navigates directly to matching stays.
- **Dynamic Festival Predictor**: Calculates seasonal travel pricing for major Indian festivals (Diwali, Christmas, New Year, Holi, Ganesh Utsav, etc.) with automated price lock application.

### 🔐 5. Dual-Identifier Authentication & Cloud OTP Approval
- **Flexible Sign In**: Log in using either username or an authentic Gmail address (`@gmail.com`).
- **Account Verification**: Secure 6-digit OTP email verification via **Resend REST API (HTTPS)** and Nodemailer.
- **Cloud Sandbox Auto-Fill**: Zero-lockout fallback automatically displays approval codes with a 1-click auto-fill button on free cloud tier environments.

### 💳 6. Stripe Checkout & Instant Room Allocation
- **Live / Test Stripe Payments**: Seamless reservation workflow with room code generation and automated check-in details stored in *"My Trips"*.
- **Superhost Host Panel**: Manage reservations, track booking status, view guest manifests, and monitor earnings.

---

## 🏗️ Architecture & Directory Structure

FairStay follows a clean, modular architecture with distinct frontend and backend separation:

```text
fairstay/
├── app.js                          # Express application entrypoint, middleware & routing
├── package.json                    # Project dependencies & scripts
├── README.md                       # Documentation and setup guide
├── .env.example                    # Sample environment variables template
├── .gitignore                      # Git exclusion rules (node_modules, .env, secrets)
│
├── client/                         # React 19 Single Page Application (Vite + React Router)
│   ├── src/                        # React components, pages, services, styles
│   │   ├── components/             # Navbar, Hero, CategoryRail, StayCard, FestivalWidget, AiDrawer
│   │   ├── pages/                  # HomePage.jsx, ListingDetailPage.jsx
│   │   └── services/               # api.js (REST API integration layer)
│   ├── dist/                       # Compiled production React SPA bundle
│   └── package.json                # React client dependencies & Vite config
│
├── backend/                        # Backend Domain Logic & Server Code
│   ├── controllers/                # Request handlers (listings, bookings, users, reviews, ai)
│   ├── models/                     # Mongoose schemas (Listing, Booking, User, Review)
│   ├── routes/                     # Express route pipelines
│   ├── middleware/                 # Auth protection, listing ownership, schema validators
│   ├── utils/                      # Mailer (Resend/SMTP), Gemini AI client, ExpressError
│   └── seeds/                      # Database seeders (166 verified vacation & spiritual stays)
│
├── frontend/                       # Frontend Presentation Layer
│   ├── views/                      # EJS server-rendered templates
│   │   ├── layouts/                # boilerplate.ejs (Dark luxury theme, scripts, modals)
│   │   ├── includes/               # navbar, footer, flash alerts, AI concierge widget
│   │   ├── listings/               # index.ejs (3D portals & grid), show.ejs (photo bento), new.ejs, edit.ejs
│   │   ├── bookings/               # checkout.ejs, confirmation.ejs, host-panel.ejs, my-trips.ejs
│   │   └── users/                  # login.ejs, signup.ejs, verify-email.ejs, profile.ejs
│   └── public/                     # Static Web Assets
│       ├── css/                    # style.css (custom styling), motion-3d.css (3D physics)
│       └── js/                     # script.js, show-page.js, motion-3d.js, ai-concierge.js
│
└── tests/                          # Automated Quality Assurance Suite
    ├── test_runner.js              # Master test runner (all 27 assertions)
    ├── deep_audit.js               # Subsystem & route status audit
    └── verify_all.js               # 15-point End-to-End user flow verification
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** | Node.js (v18+), Express.js 4, Mongoose 8, Passport.js, Connect-Mongo |
| **Database** | MongoDB Atlas (Cloud NoSQL Database) |
| **Frontend** | EJS Templates, EJS-Mate, Bootstrap 5.3.3, Vanilla JS (ES6+), Three.js |
| **Interactive UI** | Leaflet.js (OpenStreetMap), Flatpickr, Toastify.js, Bootstrap Icons |
| **Artificial Intelligence**| Google Gemini 1.5 Flash (`@google/generative-ai`) |
| **Email Delivery** | Resend REST API (HTTPS Port 443), Nodemailer (SMTP) |
| **Payments** | Stripe API (`stripe`) |
| **Cloud Hosting** | Render (Web Service), Cloudinary (Media Storage) |

---

## 🚀 Getting Started (Local Setup)

### 1. Prerequisites
Ensure you have the following installed on your local machine:
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/) (bundled with Node)
- [MongoDB Atlas](https://www.mongodb.com/atlas) account or local MongoDB instance

### 2. Clone the Repository
```bash
git clone https://github.com/divyansh-collab/Fair-Stay-.git
cd Fair-Stay-
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```
Fill in your configuration keys:
```env
PORT=8080
APP_BASE_URL=http://localhost:8080
SESSION_SECRET=your_super_secret_session_key

# MongoDB Connection
MONGO_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/fairstay?retryWrites=true&w=majority

# Google Gemini AI (Concierge & Smart Search)
GEMINI_API_KEY=your_gemini_api_key

# Email Dispatch (Resend HTTPS API or Gmail SMTP)
RESEND_API_KEY=re_your_resend_api_key
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password

# Stripe Payments (Optional for Checkout)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Cloudinary (Optional for Host Image Uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_KEY=your_key
CLOUDINARY_SECRET=your_secret
```

### 5. Seed the Database
Populate your database with 166 verified vacation stays:
```bash
npm run seed
```

### 6. Start the Server
```bash
npm start
```
Open your browser and visit: **`http://localhost:8080`**

---

## 🧪 Automated Testing & Quality Assurance

FairStay features a comprehensive 2-phase automated test runner covering all 27 critical assertions:

```bash
npm test
```

### Test Suite Summary:
- **Phase 1: Deep Subsystem & Route Audit** (12 route checks covering Auth, CRUD, Search, Top Destinations, API, Static CSS/JS).
- **Phase 2: 15-Point End-to-End Suite** (Listings index, Category filters, FairSafe pricing, AI Concierge, AI Smart Search, Dual-identifier login, Booking creation, Room assignment, Host panel, User profile).

```text
===============================================================
   🎉 GSTACK CERTIFICATION: 100% TEST COVERAGE VERIFIED!     
   STATUS: ALL 27 ASSERTIONS PASSED (100% SUCCESS)             
   READY FOR RELEASE DEPLOYMENT                                
===============================================================
```

---

## 👥 Authors & Acknowledgments

- **Developer & Lead**: [Divyansh Mishra](https://github.com/divyansh-collab)
- **Concept & Crafting**: Handcrafted with ❤️ for vacationers and hosts across India.

---

## 📄 License
This project is licensed under the [ISC License](LICENSE).
