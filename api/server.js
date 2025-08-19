import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getPlayers, getPlays } from "./db.js";
import { updateData } from "./osuService.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/updateData", async (req, res) => {
    try {
        console.log("Updating data...");
        await updateData()
        console.log("Data updated successfully.");
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/players", async (req, res) => {
    try {
        console.log("Get players...");
        const players = await getPlayers();
        res.json(players);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/plays", async (req, res) => {
    try {
        console.log("Get plays...");
        const plays = await getPlays();
        res.json(plays);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
