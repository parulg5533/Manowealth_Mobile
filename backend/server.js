const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import your services
const mailService = require('../mailService');
const otpService = require('../otpService');

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/manowealth', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Call database connection
connectDB();

// Middleware for parsing JSON
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// =============== AUTHENTICATION ROUTES ===============

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 */
router.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    
    // Check if user exists (you'll need to import your User model)
    // const existingUser = await User.findOne({ email });
    // if (existingUser) {
    //   return res.status(400).json({ message: 'User already exists' });
    // }

    // Create new user
    // const user = await User.create({ email, password, name, role });

    // Send welcome email
    // await mailService.sendWelcomeEmail(email, name);

    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully',
      // user: { id: user._id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 */
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    // const user = await User.findOne({ email }).select('+password');
    // if (!user) {
    //   return res.status(401).json({ message: 'Invalid credentials' });
    // }

    // Check password
    // const isMatch = await user.comparePassword(password);
    // if (!isMatch) {
    //   return res.status(401).json({ message: 'Invalid credentials' });
    // }

    // Create token (you'll need jsonwebtoken package)
    // const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    //   expiresIn: '30d'
    // });

    res.json({ 
      success: true, 
      message: 'Login successful',
      // token,
      // user: { id: user._id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =============== OTP ROUTES ===============

/**
 * @route   POST /api/otp/send
 * @desc    Send OTP to email
 */
router.post('/otp/send', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Generate OTP
    const otp = otpService.generateOTP();
    
    // Store OTP (in database or cache)
    // await OTPModel.create({ email, otp, expiresAt: Date.now() + 10 * 60 * 1000 });
    
    // Send OTP email
    await mailService.sendOTP(email, otp);

    res.json({ 
      success: true, 
      message: 'OTP sent successfully',
      // In production, don't send OTP back!
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    console.error('OTP send error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

/**
 * @route   POST /api/otp/verify
 * @desc    Verify OTP
 */
router.post('/otp/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    // Verify OTP
    const isValid = otpService.verifyOTP(otp);
    
    // Check OTP from database
    // const storedOTP = await OTPModel.findOne({ email, otp });
    // if (!storedOTP || storedOTP.expiresAt < Date.now()) {
    //   return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    // }

    if (isValid) {
      // Delete OTP after verification
      // await OTPModel.deleteOne({ email, otp });
      
      res.json({ success: true, message: 'OTP verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
  } catch (error) {
    console.error('OTP verify error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify OTP' });
  }
});

// =============== USER ROUTES ===============

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 */
router.get('/users/profile', async (req, res) => {
  try {
    // Get user from database (you'll need auth middleware)
    // const user = await User.findById(req.user.id).select('-password');
    
    res.json({ 
      success: true,
      // user 
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 */
router.put('/users/profile', async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    
    // Update user in database
    // const user = await User.findByIdAndUpdate(
    //   req.user.id,
    //   { name, phone, address },
    //   { new: true, runValidators: true }
    // ).select('-password');

    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      // user 
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =============== ADMIN ROUTES ===============

/**
 * @route   GET /api/admin/users
 * @desc    Get all users (admin only)
 */
router.get('/admin/users', async (req, res) => {
  try {
    // Fetch all users
    // const users = await User.find().select('-password');
    
    res.json({ 
      success: true,
      // users 
    });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user (admin only)
 */
router.delete('/admin/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete user
    // await User.findByIdAndDelete(id);
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('User delete error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =============== FILE UPLOAD ROUTES ===============

/**
 * @route   POST /api/upload
 * @desc    Upload file
 */
router.post('/upload', async (req, res) => {
  try {
    // Handle file upload (you'll need multer)
    // const file = req.file;
    
    res.json({ 
      success: true, 
      message: 'File uploaded successfully',
      // fileUrl: `/uploads/${file.filename}`
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload file' });
  }
});

// =============== HEALTH CHECK ===============

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

module.exports = router;