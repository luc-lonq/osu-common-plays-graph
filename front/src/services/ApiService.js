export async function updateData() {
    const res = await fetch("http://localhost:3000/api/updateData", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    return res.json();
}

export async function getPlayers() {
    const res = await fetch("http://localhost:3000/api/players", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    return res.json();
}

export async function getPlays() {
    const res = await fetch("http://localhost:3000/api/plays", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    return res.json();
}


