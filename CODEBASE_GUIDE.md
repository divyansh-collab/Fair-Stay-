# 📖 FairStay Explained in Plain English
### The Zero-Jargon Codebase & Architecture Guide
*Written for anyone — founders, product managers, investors, and curious travelers — to understand the entire FairStay codebase in 10 minutes without any technical programming knowledge.*

---

## 🌟 1. What is FairStay in Plain English?

FairStay is an honest travel and sanctuary reservation platform for India. Think of it like a trustworthy version of Airbnb:
1. **Zero 300% Middleman Markups**: Travelers pay the host's actual nightly rate.
2. **Fair Price Engine**: It explains holiday prices honestly. If Dev Deepawali in Varanasi causes high demand, it shows the authentic +40% local event rate. On normal days, it guarantees 0% surge.
3. **Instant Keyless Passes**: When you reserve a room, it immediately assigns your room number (e.g. `SUITE-GOA-402`) and a 4-digit digital door PIN (e.g. `8492`).
4. **Built-in AI Concierge**: Powered by Google Gemini 1.5 Flash, it helps you plan trips and find authentic stays in natural everyday conversation.

---

## 🏨 2. The Hotel Analogy (How the System Fits Together)

To easily understand how the software works, imagine FairStay as a real-world luxury hotel company:

| Real-World Hotel Role | Where It Lives in the Code | What It Does Every Day |
| :--- | :--- | :--- |
| **The Storefront & Lobby** | `client/` (React 19) | The visual interface you see on your phone, tablet, or laptop. Displays stay photos, discovery buttons, price tags, and the booking form. |
| **The Front Desk & Manager** | `app.js` & `backend/routes/` | Receives orders from the lobby, checks guest identities, confirms dates, and calculates bills. |
| **The Filing Room & Vault** | `backend/models/` & MongoDB | The secure database where all properties, host profiles, guest reviews, and reservations are safely stored. |
| **The Price Calculator** | `backend/utils/festivals.js` | The rulebook that checks local Indian festival dates (Diwali, Sunburn, Snow Season) and explains pricing to guests. |
| **The 24/7 Digital Concierge** | `client/src/components/AiConciergeDrawer.jsx` | The friendly digital assistant that chats with travelers in real-time. |

---

## 🗺️ 3. How Data Flows (A Traveler's Journey)

### Flow A: When You Open the Website
```text
[Your Browser on Phone or PC]
          │
          ▼
   1. Requests Homepage
          │
          ▼
[Front Desk Server: app.js]
          │
          ▼
   2. Queries Database for Stays
          │
          ▼
[Database Vault: MongoDB]
   Returns 166 verified properties across Goa, Manali, Jaipur, Varanasi...
          │
          ▼
[Storefront: client/src/pages/HomePage.jsx]
   Renders the beautiful sunset villa hero banner, category rail, and stay cards!
```

### Flow B: When You Click "Reserve Sanctuary"
```text
[You pick dates & click Reserve in CheckoutModal.jsx]
          │
          ▼
   1. Checks Festival Price Engine:
      Is Dev Deepawali happening on these dates?
      -> Yes: Applies +40% festive rate and explains why.
      -> No: Charges regular direct-host price (0% surge).
          │
          ▼
   2. Creates Confirmed Reservation in Database:
      -> Assigns Suite Number: SUITE-GOA-108
      -> Generates 4-digit Smart Door PIN: 4829
          │
          ▼
[Opens RoomTicketModal.jsx]
   Displays your digital boarding pass with room code, door PIN, and print button!
```

---

## 📂 4. Complete File & Folder Dictionary

Here is the exact map of every important folder and file in the project, explained in everyday words:

### 🏠 Root Directory (The Command Center)
- **`app.js`**: The master backend server engine. It turns on the server, connects to the database vault, sets up security, and listens for requests on port 8080.
- **`package.json`**: The project's recipe card. Lists all libraries and packages needed to run FairStay.
- **`.env`**: The private key safe. Stores database passwords, secret session keys, and the Google Gemini API key.
- **`CODEBASE_GUIDE.md`**: This very guide you are reading right now!
- **`README.md`**: The technical overview and deployment instructions.

---

### 🎨 `client/` (The Frontend Storefront)
*This is what runs inside your web browser. Built with React and Vite for blazing-fast speed.*

#### 📄 `client/src/pages/` (The Different Screens)
- **`HomePage.jsx`**: The main marketplace feed. Shows the panoramic sunset villa hero banner, horizontal category rail, verified stay cards, and the interactive catalog progress bar (*"Showing 12 of 170 stays · 7% explored"*).
- **`ListingDetailPage.jsx`**: The single stay profile page. Contains the responsive 5-photo bento gallery, fullscreen photo lightbox, amenities list, verified host profile, Google location map, guest reviews, and sticky booking card.
- **`MyTripsPage.jsx`**: The traveler's personal trip locker. Lists confirmed and past reservations, lets travelers view digital room passes with keyless door PINs, or cancel with a 100% refund guarantee.
- **`HostStayPage.jsx`**: The property onboarding page. Allows homeowners to list a new villa or cottage with live preview and real-time pricing intelligence.
- **`AdminPage.jsx`**: The administrator dashboard. Displays total revenue, booking counts, guest manifests, and property listings.

#### 🧩 `client/src/components/` (The Reusable Building Blocks)
- **`Navbar.jsx`**: The sticky top bar. Contains the brand logo, interactive search capsule, light/dark theme switch, wishlist shortcut, and mobile slide-down drawer.
- **`Hero.jsx`**: The cinematic hero section with curated destination discovery pills (*🌴 Goa, 🏔️ Manali, 🏰 Jaipur, 🌿 Munnar, 🌊 Udaipur*).
- **`CategoryRail.jsx`**: The horizontal icon rail (*Beachfront, Mountains, Pools, Heritage, Workation, Budget*).
- **`StayCard.jsx`**: The individual stay card showing property photo, star rating, verified neighborhood, direct host price, and FairSafe badge.
- **`CheckoutModal.jsx`**: The payment dialog supporting UPI, Cards, Net Banking, and instant digital suite allocation.
- **`RoomTicketModal.jsx`**: The boarding pass modal with the assigned room number and 4-digit smart-lock PIN.
- **`AiConciergeDrawer.jsx`**: The slide-out AI assistant powered by Gemini 1.5 Flash for natural conversation.
- **`Footer.jsx`**: The clean, minimalist 4-column footer with popular corridors, stay collections, host links, currency/language pill, and theme toggle.
- **`ListingMap.jsx`**: The interactive map showing the exact neighborhood coordinates of the stay.
- **`ReviewSection.jsx`**: The community feedback section where guests rate their stay and read verified reviews.

#### 🧠 `client/src/context/` (The App's Memory)
- **`AuthContext.jsx`**: Remembers who is currently logged in so you don't have to re-enter credentials on every page.
- **`ThemeContext.jsx`**: Remembers whether you prefer Light Mode or Dark Mode.

---

### ⚙️ `backend/` (The Engine & Domain Logic)
*This is the behind-the-scenes brain that calculates prices, verifies security, and talks to the database.*

#### 📋 `backend/models/` (The Database Filing Blueprints)
- **`listing.js`**: The blueprint for a stay (title, description, price, location, bedrooms, photos, reviews).
- **`booking.js`**: The blueprint for a reservation (guest name, check-in date, check-out date, total paid, assigned room suite, keyless PIN, status).
- **`user.js`**: The blueprint for a user account (username, email, password hash, profile photo, admin status).
- **`review.js`**: The blueprint for a guest review (star rating, written feedback, author, date).

#### 🚦 `backend/routes/` (The Traffic Directors)
- **`api.js`**: The primary JSON REST API. Handles live search, stay filtering, checkout calculations, booking cancellations, and host submissions.
- **`ai.js`**: Connects user questions to the Google Gemini 1.5 Flash AI model.
- **`listings.js`**, **`bookings.js`**, **`users.js`**, **`reviews.js`**: Server route handlers.

#### 🧮 `backend/utils/` (The Specialized Helpers)
- **`festivals.js`**: The Fair Price Engine. Contains the master calendar of Indian festivals (Varanasi Dev Deepawali, Goa Sunburn, Jaipur Literature Festival, Manali Winter Carnival) and calculates exact seasonal percentages.
- **`gemini.js`**: The bridge to Google Cloud that formats prompts for Gemini AI.
- **`mailer.js`**: Sends reservation confirmation emails.

#### 🌱 `backend/seeds/` (The Pre-loaded Data)
- **`data.js`**: The master catalog of 166 verified Indian stays with real Google Places photos, coordinates, and market-calibrated direct-host rates.

---

### 🧪 `tests/` (The Quality Assurance Inspector)
- **`test_runner.js`**: The master automated test suite. Runs 82 automated checks across all 6 layers of the system to ensure 100% reliability before any code goes live.

---

## 💡 5. Plain English Glossary (Tech Terms Made Simple)

- **Frontend**: Everything you see and tap on your screen.
- **Backend**: The computer server working in the background that does calculations and keeps secrets safe.
- **Database (MongoDB)**: The digital filing cabinet that never forgets information, even when computers turn off.
- **API (Application Programming Interface)**: Think of an API like a polite waiter in a restaurant. Your browser tells the waiter: *"Please fetch Goa villas under ₹5,000"*. The waiter goes to the kitchen (backend), fetches the matching villas, and serves them on your plate (screen).
- **Responsive Design**: Making a webpage act like water. When poured into a small glass (a smartphone), it fits perfectly. When poured into a wide bowl (a desktop monitor), it expands cleanly with zero broken buttons.

---

## 🚀 6. How to Run FairStay (Beginner's 2-Step Guide)

If you have a computer with Node.js installed, running FairStay takes just two simple steps:

1. **Start the Backend Server**:
   ```bash
   npm start
   ```
   *(The server wakes up on port 8080 and connects to the database vault)*

2. **Open Your Web Browser**:
   Visit `http://localhost:8080` to explore all 166 verified sanctuaries!

To verify that all 82 subsystems and price algorithms are running perfectly:
```bash
npm test
```
*(Runs the automated test runner with 100% pass rate)*

---
*Created with ❤️ by the FairStay engineering team for travelers across India.*
