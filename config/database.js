const { Sequelize, DataTypes } = require('sequelize');
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    port: process.env.DB_PORT,
    logging: false,
  }
);

sequelize.authenticate()
  .then(() => {
    console.log('Database connected to discover');
  })
  .catch((err) => {
    console.error(err);
  });

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require('../models/userModel')(sequelize, DataTypes);

module.exports = db;