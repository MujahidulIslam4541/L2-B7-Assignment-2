// connect pool pg

import { Pool } from "pg";
import config from "../config";

export const pool = new Pool({
  connectionString: config.databaseUrl,
});

export const connectDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'contributor' CHECK (role IN ('maintainer', 'contributor')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log("✅  Database connected successful");
  } catch (error: any) {
    console.error("❌ Full error:", error);
  }
};
