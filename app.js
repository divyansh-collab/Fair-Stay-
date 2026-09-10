if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const dns = require('dns');
// Use reliable public DNS resolvers to ensure MongoDB Atlas SRV lookups succeed on all Windows ISPs
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./backend/models/user');
const ExpressError = require('./backend/utils/ExpressError');

// Route imports
const listingRouter = require('./backend/routes/listings');
const reviewRouter = require('./backend/routes/reviews');
const bookingRouter = require('./backend/routes/bookings');
const userRouter = require('./backend/routes/users');
const aiRouter = require('./backend/routes/ai');
const apiRouter = require('./backend/routes/api');

// Security
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const dbUrl = process.env.ATLAS_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/fairstay';

// Connect to MongoDB with automatic fallback
main();

async function main() {
  if (dbUrl.startsWith('mongodb+srv://') || dbUrl.includes('@')) {
    try {
      await mongoose.connect(dbUrl, { serverSelectionTimeoutMS: 8000 });
      console.log('✅ Connected to MongoDB Atlas Cloud successfully.');
      return;
    } catch (err) {
      console.warn('⚠️ MongoDB Atlas connection error. Falling back to local MongoDB:', err.message);
    }
  }

  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/fairstay');
    console.log('✅ Connected to local MongoDB database.');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
  }
}

// View engine setup
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'frontend', 'views'));

// Middlewares
app.use(helmet({
  contentSecurityPolicy: false,  // disabled so inline scripts and CDN scripts work
  crossOriginEmbedderPolicy: false,
}));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(express.json({ limit: '5mb' }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'frontend', 'public')));
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// Rate limiting — 150 requests per 15 min per IP on API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please try again after 15 minutes.' },
});

// Mongo Session Store using the primary database
const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 3600,
});

store.on('error', (err) => {
  console.log('❌ Mongo Session Store Error:', err);
});

const sessionConfig = {
  store,
  name: 'fairstay.sid',
  secret: process.env.SESSION_SECRET || 'fairstay_sacred_secret_key_2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days rolling
    sameSite: 'lax',
  },
};

app.use(session(sessionConfig));
app.use(flash());

// Passport Authentication Configuration
app.use(passport.initialize());
app.use(passport.session());

// Dual identifier login: Custom LocalStrategy finds user by username or authentic Gmail / system email
const GMAIL_LOGIN_REGEX = /^[a-z0-9](\.?[a-z0-9]){2,29}@(gmail\.com|googlemail\.com)$/i;

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const query = (username || '').trim();
      if (!query) {
        return done(null, false, { message: 'Username or Gmail address is required.' });
      }

      // If user provided an email (contains '@')
      if (query.includes('@')) {
        const cleanEmail = query.toLowerCase();
        const isGmail = GMAIL_LOGIN_REGEX.test(cleanEmail);
        const isSystemEmail = cleanEmail.endsWith('@fairstay.com');
        if (!isGmail && !isSystemEmail) {
          return done(null, false, {
            message: 'Please log in using an authentic Gmail address (@gmail.com) or username.',
          });
        }
      }

      // Case-insensitive username match or exact lowercase email match
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const user = await User.findOne({
        $or: [
          { username: new RegExp('^' + escapedQuery + '$', 'i') },
          { email: query.toLowerCase() },
        ],
      });
      if (!user) {
        return done(null, false, { message: 'Incorrect username or email.' });
      }
      return user.authenticate(password, done);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Global locals for templates
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.info = req.flash('info');
  res.locals.warning = req.flash('warning');
  res.locals.currUser = req.user || null;
  res.locals.currentPath = req.path;
  next();
});

// Serve FairStay React (MERN) Client SPA for all main routes
const clientDistPath = path.join(__dirname, 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  const spaRoutes = [
    '/',
    '/listings',
    '/listings/:id',
    '/stay/:id',
    '/listing/:id',
    '/trips',
    '/host',
    '/ticket/:id',
    '/admin',
    '/app',
    '/app/*'
  ];
  app.get(spaRoutes, (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // Fallback to server-rendered listings if client is not built
  app.get('/', (req, res) => {
    res.redirect('/listings');
  });
}

// Route pipelines
app.use('/listings', listingRouter);
app.use('/listings/:id/reviews', reviewRouter);
app.use('/', bookingRouter);
app.use('/', userRouter);
app.use('/ai', aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 30 }), aiRouter);
app.use('/api', apiLimiter, apiRouter);

// GET /api/me — Return session user for React SPA auth awareness
app.get('/api/me', (req, res) => {
  if (req.isAuthenticated() && req.user) {
    const { _id, username, email, phone, profilePhoto, isAdmin, createdAt } = req.user;
    return res.json({ success: true, user: { _id, username, email, phone, profilePhoto, isAdmin, createdAt } });
  }
  return res.json({ success: true, user: null });
});

// 404 Handler
app.all('*', (req, res, next) => {
  next(new ExpressError(404, 'The vacation stay or page you are looking for does not exist.'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  const { statusCode = 500, message = 'An unexpected error occurred. Our concierge team has been notified.' } = err;
  res.locals.currUser = res.locals.currUser || req.user || null;
  res.locals.success = res.locals.success || [];
  res.locals.error = res.locals.error || [];
  if (!res.headersSent) {
    res.status(statusCode).render('error.ejs', { err, statusCode, message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✨ FairStay server listening on port ${PORT}`);
  console.log(`🌐 Application URL: http://localhost:${PORT}`);
});
