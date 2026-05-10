// server.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const routes = require('./routes/routes');
const stroutes = require('./routes/stroutes'); 
const adroutes = require('./routes/adroutes');
const fundroutes= require('./routes/fundroutes');

const app = express();
const port = process.env.PORT || 3001;

const allowedOrigins = [
  'http://localhost:4200',
  'https://fyp-frontend-tawny-five.vercel.app'
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  credentials: true,
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(cookieParser());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded files statically

app.use('/api', routes);
app.use('/stapi', stroutes);
app.use('/adapi',adroutes);
app.use('/fundrequestapi',fundroutes);

const url = process.env.MONGODB_URI;

async function connect() {
  try {
    await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error(error);
  }
}

connect();

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

module.exports = app;
