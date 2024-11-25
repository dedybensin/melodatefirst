const express = require("express");
const db = require("../config/database");
const User = db.users;

const saveUser = async (req, res, next) => {
  try {
    // Check if username exists
    const userName = await User.findOne({
      where: {
        userName: req.body.userName,
      },
    });

    if (userName) {
      return res.status(409).json({
        error: true,
        message: "Username sudah ada. Tolong gunakan username lain.",
      });
    }

    // Check if email exists
    const emailCheck = await User.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (emailCheck) {
      return res.status(409).json({
        error: true,
        message: "Email sudah ada. Tolong gunakan email lain.",
      });
    }

    // If no issues, proceed to the next middleware
    next();
  } catch (error) {
    console.error("Error in saveUser middleware:", error);

    // Return 500 if any unexpected error occurs
    return res.status(500).json({
      error: true,
      message: "Internal server error.",
      details: error.message,
    });
  }
};

// Exporting module
module.exports = { saveUser };