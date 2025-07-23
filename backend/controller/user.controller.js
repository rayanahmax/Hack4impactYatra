const User = require("../models/User");
const bcrytp = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  const { email, password, name, country } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (!email || !name || !country || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const hashPassword = await bcrytp.hash(password, 10);
    if (!hashPassword) {
      return res.status(500).json({ message: "Error hashing password" });
    }

    const newUser = new User({
      email,
      name,
      country,
      password: hashPassword,
    });

    const savedUser = await newUser.save();
    const token = jwt.sign(
      { id: newUser._id, name: newUser.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User created successfully",
      user: savedUser,
      token: token,
    });
    console.log(token);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrytp.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user._id, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        country: user.country,
      },
      token: token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getUser = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.json({ message: "Id is required" });
    }

    const finduser = await User.findById(id).select('-password')

    if (!finduser) {
      return res.status(404).json({ message: "User Not found" });
    }

    res.status(200).json(finduser);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get current user info from token
exports.getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }
    res.status(200).json(req.user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
