import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, phone, password, location, farmSize, crops, preferredLanguage } = req.body;
    const exists = await User.findOne({ phone });
    if (exists) return res.status(400).json({ message: 'Phone number already registered' });

    const user = await User.create({ name, phone, password, location, farmSize, crops, preferredLanguage });
    const token = signToken(user._id);
    res.status(201).json({ token, user: { id: user._id, name: user.name, phone: user.phone, location: user.location } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid phone or password' });
    }
    const token = signToken(user._id);
    res.json({ token, user: { id: user._id, name: user.name, phone: user.phone, location: user.location, preferredLanguage: user.preferredLanguage } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user });
});

export default router;
