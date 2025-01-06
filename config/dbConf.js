const { Sequelize } = require("sequelize");
const config = require("./../config/config").development;
require("dotenv").config(); // Ensure the environment variables are loaded

// Initialize sequelize with environment variables
const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: 'postgres',
  logging: false, // Disabling Sequelize logging
});

//const sequelize = new Sequelize('postgres://bgckrxlt:OQ2TG25MyY8LMSy-NXsSaY4pLGNxXmTy@salt.db.elephantsql.com/bgckrxlt') // Example for postgres


// Test the connection (optional but recommended for debugging)
sequelize.authenticate()
  .then(() => console.log('Database connected successfully.'))
  .catch((err) => console.error('Database connection failed:', err));

module.exports = sequelize;


