const express = require('express');
const sequelize = require('sequelize');
const dotenv = require('dotenv').config();
const cookieParser = require('cookie-parser');
const db = require('./config/database');
const userRoutes = require ('./routes/userRoutes');

const PORT = process.env.PORT || 3000;
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Synchronizing the database and forcing it to false so we dont lose data
db.sequelize.sync().then(() => {
    console.log("Database telah berhasil disinkronisasi");
});

// Routes for the user API
app.use('/api/users', userRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});