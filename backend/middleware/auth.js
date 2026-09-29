import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { isSupabaseConfigured } from '../config/supabase.js';
import * as supabaseDb from '../services/supabaseDb.js';

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'mediconnect_secret_key', {
    expiresIn: '30d'
  });
};

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mediconnect_secret_key');

      if (isSupabaseConfigured()) {
        req.user = await supabaseDb.findUserById(decoded.id);
      } else {
        req.user = await User.findById(decoded.id).select('-password');
      }

      if (!req.user) {
        return res.status(401).json({ message: 'User not found with this token' });
      }
      return next();
    } catch (error) {
      console.error('JWT auth error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};
