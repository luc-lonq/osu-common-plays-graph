import fs from "fs";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

async function getToken() {
    const res = await fetch("https://osu.ppy.sh/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: "client_credentials",
            scope: "public",
        }),
    });
    return res.json();
}

async function getTopPlays(user_id, token) {
    const res = await fetch(
        `https://osu.ppy.sh/api/v2/users/${user_id}/scores/best?mode=osu&limit=200`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.json();
}

async function getRanking(page, token) {
    let cursor = null
    let ranking = [];
    for (let i = 1; i <= page; i++) {
        const res = await fetch(
            `https://osu.ppy.sh/api/v2/rankings/osu/performance?mode=osu&country=FR&page=${i}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        ranking = ranking.concat(data.ranking);
    }
    return ranking
}

async function main() {
    try {
        const tokenData = await getToken();
        const token = tokenData.access_token;

        const ranking = await getRanking(2, token);
        const topPlayers = ranking.slice(0, 100).map((p) => ({id: p.user.id, username: p.user.username}));
        const playerData = [];
        for (const user of topPlayers) {
            const plays = await getTopPlays(user.id, token);
            playerData.push({
                id: user.id,
                username: user.username,
                topPlays: plays.map((p) => ({
                    id: p.beatmap.id,
                    title: p.beatmapset.title,
                    version: p.beatmap.version,
                    pp: p.pp,
                    mods: p.mods,
                }))
            });
        }


        fs.writeFileSync("data.json", JSON.stringify(playerData, null, 2));
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

main().catch(console.error);