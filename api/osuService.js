import dotenv from "dotenv";
import {createPlayer, createPlayers, createPlays, getPlayerById, getPlaysByPlayerId} from "./db.js";

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


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function getTopPlays(user_id, token) {
    let plays = [];
    for (let i = 0; i < 2; i++) {
        const res = await fetch(
            `https://osu.ppy.sh/api/v2/users/${user_id}/scores/best?mode=osu&limit=100&offset=${i * 100}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        plays = plays.concat(data);

        await sleep(100);
    }
    return plays;
}


async function getRanking(page, token) {
    let ranking = [];
    for (let i = 1; i <= page; i++) {
        const res = await fetch(
            `https://osu.ppy.sh/api/v2/rankings/osu/performance?mode=osu&country=FR&page=${i}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        ranking = ranking.concat(data.ranking);

        await sleep(100);
    }
    return ranking;
}


async function getPlayer(user_id, token) {
    const res = await fetch(
        `https://osu.ppy.sh/api/v2/users/${user_id}/osu`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();

    await sleep(100);

    return {
        id: data.id,
        username: data.username,
        country: data.country_code,
        rank: data.statistics.global_rank,
    };

}

async function updateData() {
    try {
        const tokenData = await getToken();
        const token = tokenData.access_token;

        const players = await getRanking(2, token);
        await createPlayers(players.map((p) => ({
            id: p.user.id,
            username: p.user.username,
            country: p.user.country_code,
            rank: p.global_rank
        }))).catch(console.error);

        for (const player of players) {
            const plays = await getTopPlays(player.user.id, token)
            await createPlays(plays.map((p) => ({
                id: p.id,
                beatmap_id: p.beatmap.id,
                version: p.beatmap.version,
                title: p.beatmapset.title,
                mods: p.mods,
                pp: p.pp,
                player_id: player.user.id
            }))).catch(console.error);
        }
    } catch (error) {
        console.error("Error: ", error);
    }
}


async function addPlayerData(user_id) {
    try {
        const tokenData = await getToken();
        const token = tokenData.access_token;

        const player = await getPlayer(user_id, token);
        await createPlayer(player).catch(console.error);

        const plays = await getTopPlays(user_id, token);
        await createPlays(plays.map((p) => ({
            id: p.id,
            beatmap_id: p.beatmap.id,
            version: p.beatmap.version,
            title: p.beatmapset.title,
            mods: p.mods,
            pp: p.pp,
            player_id: user_id
        }))).catch(console.error);
        const playerData = await getPlayerById(user_id);
        const playsData = await getPlaysByPlayerId(user_id);

        return { player: playerData, plays: playsData };
    } catch (error) {
        console.error("Error: ", error);
    }
}

export { getToken, getTopPlays, getRanking, updateData, addPlayerData };