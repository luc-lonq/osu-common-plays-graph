import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function initDB() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    });

    // Création de la base
    await connection.query(`
    CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;
  `);

    await connection.query(`USE osu;`);

    // Table players
    await connection.query(`
    CREATE TABLE IF NOT EXISTS players (
      id BIGINT PRIMARY KEY,
      username VARCHAR(255) NOT NULL,
      country VARCHAR(2), 
      \`rank\` INTEGER
    );
  `);

    await connection.query(`
    CREATE TABLE IF NOT EXISTS plays (
      id BIGINT PRIMARY KEY,
      beatmap_id BIGINT NOT NULL,
      version VARCHAR(255),
      title VARCHAR(255),
      mods VARCHAR(50),
      pp FLOAT,
      player_id BIGINT NOT NULL,
      FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
    );
  `);

    console.log("Tables created");
    await connection.end();
}

initDB().catch(err => {
    console.error("Error: ", err);
});