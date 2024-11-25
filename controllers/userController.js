const bcrypt = require("bcryptjs");
const db = require("../config/database");
const jwt = require("jsonwebtoken");
const User = db.users;

// Register User
const register = async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user data
    const data = {
      userName,
      email,
      password: hashedPassword,
    };

    const user = await User.create(data);

    // Send response if registration succeeds
    return res.status(201).json({
      error: false,
      message: "Registrasi Pengguna Berhasil. Tolong login untuk melanjutkan.",
      user: {
        id: user.id,
        userName: user.userName,
        email: user.email,
        password: user.password,
      },
    });
  } catch (error) {
    console.error("Error during registration:", error);

    // Handle unique constraint or validation errors
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        error: true,
        message: "Email sudah ada. Tolong gunakan email lain.",
      });
    }

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        error: true,
        message: "Validation error.",
        details: error.errors.map((err) => err.message),
      });
    }

    // Handle general errors
    return res.status(500).json({
      error: true,
      message: "Error during registration.",
      details: error.message || "Unknown error occurred.",
    });
  }
};

// Login Authentication
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        error: true,
        message: "Login gagal. Pengguna tidak ditemukan.",
      });
    }

    // Check for valid JWT in cookies
    const token = req.cookies.jwt;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.id === user.id) {
          return res.status(400).json({
            error: true,
            message: "Kamu sudah login.",
          });
        }
      } catch (err) {
        console.log("Token tidak valid, lanjutkan ke login.");
      }
    }

    // Compare hashed password
    const isSame = await bcrypt.compare(password, user.password);

    if (isSame) {
      // Generate token upon successful login
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: 1 * 24 * 60 * 60, // 1 day in seconds
      });

      // Set cookie jwt
      res.cookie("jwt", token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true });

      return res.status(200).json({
        error: false,
        message: "Login berhasil.",
        user: {
          id: user.id,
          userName: user.userName,
          email: user.email,
          password: user.password, // hashed password
          token: token, // JWT token
        },
      });
    } else {
      return res.status(401).json({
        error: true,
        message: "Gagal Login. Password yang dimasukkan salah, silahkan masukkan password yang benar.",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: true,
      message: "Error during login.",
      details: error.message,
    });
  }
};

// Logout Authentication
const logout = async (req, res) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(400).json({
        error: true,
        message: "Kamu belum login.",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        error: true,
        message: "Invalid token. Please login again.",
      });
    }

    const user = await User.findOne({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(401).json({
        error: true,
        message: "Autentikasi gagal. Pengguna tidak ditemukan.",
      });
    }

    res.clearCookie("jwt");

    return res.status(200).json({
      error: false,
      message: `Logout berhasil, ${user.userName}.`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: true,
      message: "Error during logout.",
      details: error.message,
    });
  }
};

// Check if email is available
const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email exists in the database
    const emailCount = await User.count({
      where: { email },
    });

    if (emailCount === 0) {
      return res.status(200).json({
        error: false,
        message: "Email tersedia.",
        available: true,
      });
    } else {
      return res.status(200).json({
        error: false,
        message: "Email sudah terdaftar.",
        available: false,
      });
    }
  } catch (error) {
    console.error("Error during email check:", error);
    return res.status(500).json({
      error: true,
      message: "Error during email check.",
      details: error.message,
    });
  }
};

module.exports = { register, login, logout, checkEmail };