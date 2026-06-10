const { Sequelize } = require('sequelize');
const path = require('path');

let sequelize;

let dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING;

if (dbUrl && dbUrl.startsWith('postgresql://')) {
  dbUrl = dbUrl.replace('postgresql://', 'postgres://');
}

if (dbUrl) {
  sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else if (process.env.VERCEL) {
  // If running on Vercel but both DATABASE_URL and POSTGRES_URL are missing, we fallback to SQLite in the writable /tmp directory
  console.warn('WARNING: Neither DATABASE_URL nor POSTGRES_URL environment variables are configured in Vercel. Falling back to SQLite in /tmp.');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: '/tmp/database.sqlite',
    logging: false
  });
} else if (process.env.DB_HOST && process.env.DB_HOST !== 'localhost') {
  // If explicitly configured to a custom host (other than localhost), use PostgreSQL parameters
  sequelize = new Sequelize(
    process.env.DB_NAME || 'eventease',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASS || 'postgres',
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
} else {
  // Otherwise, automatically fall back to SQLite for effortless local development
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'database.sqlite'),
    logging: false
  });
}

module.exports = sequelize;
