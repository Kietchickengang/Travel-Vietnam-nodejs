
require('dotenv').config();

const databaseConfig = {
    user: process.env.USER,
    port: process.env.DB_PORT,
    server: process.env.DB_SERVER,
    database: process.env.DATABASE,
    pool: {
        max: 77,
        min: 0,
        idleTimeoutMillis: 30000
  },
    options: {
        trustedConnection: true,
        trustServerCertificate: true
    },
    driver: process.env.DB_DRIVER
};

module.exports = databaseConfig;