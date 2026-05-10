// stroutes.js

const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const stuser = require('../models/stuser');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

const router = Router();

///////////////////////////////////////////////////////////////////////////

router.post('/sregister', upload.single('transcriptFile'), async (req, res) => {
  try {
    const { name, email, password, gender, cgpa } = req.body;

    const existingUser = await stuser.findOne({ email: email });
    if (existingUser) {
      return res.status(400).send({ message: "Email is already registered" });
    }

    if (!req.file) {
      return res.status(400).send({ message: 'No transcript file uploaded' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newStudent = new stuser({
      name,
      email,
      password: hashedPassword,
      gender,
      cgpa,
      transcriptFile: req.file.filename,
      transcriptFileName: req.file.originalname,
      transcriptMimeType: req.file.mimetype,
    });

    const savedStudent = await newStudent.save();

    const token = jwt.sign({ _id: savedStudent._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.send({ message: "Registration successful" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

/////////////////////////////////////////////////////////////////////

router.post('/login', async (req, res) => {
  const user = await stuser.findOne({ email: req.body.email });
  if (!user) {
    return res.status(401).send({ message: "Invalid email or password" });
  }

  if (!(await bcrypt.compare(req.body.password, user.password))) {
    return res.status(401).send({ message: "Invalid email or password" });
  }

  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 24 * 60 * 60 * 1000
  });

  res.send({ message: "success" });
});

//////////////////////////////////////////////////

router.get('/user', async (req, res) => {
  try {
    const cookie = req.cookies['jwt'];
    const claims = jwt.verify(cookie, process.env.JWT_SECRET);

    if (!claims) {
      return res.status(401).send({ message: "unauthenticated" });
    }

    const user = await stuser.findOne({ _id: claims._id });
    const { password, transcriptFile, ...data } = await user.toJSON();
    res.send(data);

  } catch (err) {
    return res.status(401).send({ message: 'unauthenticate' });
  }
});

////////////////////////////////

router.post('/logout', (req, res) => {
  res.cookie("jwt", "", { maxAge: 0, secure: true, sameSite: 'none' });
  res.send({ message: "logout success" });
});

module.exports = router;
