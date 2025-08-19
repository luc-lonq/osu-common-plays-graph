import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

let connection;

async function connectDB() {
    if (!connection) {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
        });
    }

    return connection;
}

async function createPlayers(players) {
    const conn = await connectDB();
    const query = `
        INSERT INTO players (id, username, country, \`rank\`)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            username = VALUES(username),
            country = VALUES(country),
            \`rank\` = VALUES(\`rank\`);
    `;

    for (const player of players) {
        await conn.execute(query, [
            player.id,
            player.username,
            player.country,
            player.rank
        ]);
    }

    await conn.query(query);
}

async function createPlays(plays) {
    const conn = await connectDB();
    const query = `
        INSERT INTO plays (id, beatmap_id, version, title, mods, pp, player_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
             beatmap_id = VALUES(beatmap_id),
             version = VALUES(version),
             title = VALUES(title),
             mods = VALUES(mods),
             pp = VALUES(pp);
    `;

    for (const play of plays) {
        await conn.execute(query, [
            play.id,
            play.beatmap_id,
            play.version,
            play.title,
            play.mods,
            play.pp,
            play.player_id
        ]);
    }
}

async function getPlayers() {
    const conn = await connectDB();
    const [rows] = await conn.query("SELECT * FROM players");
    return rows;
}

async function getPlays() {
    const conn = await connectDB();
    const [rows] = await conn.query("SELECT * FROM plays");
    const payload = rows.map(r => ({
        ...r,
        mods: (() => { try { return JSON.parse(r.mods ?? "[]"); } catch { return []; } })()
    }));
    return payload;
}

export { connectDB, createPlayers, createPlays, getPlayers, getPlays };
