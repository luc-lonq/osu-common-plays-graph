import React, { useState, useMemo } from "react";
import ForceGraph3D from "react-force-graph-3d";
import playersData from "./data.json";
import SpriteText from "three-spritetext";

function normalizeMods(mods) {
    if (!mods) return [];
    return mods
        .filter(
            (m) => !["NF", "CL", "HD", "SO"].includes(m)
        )
        .map((m) => (m === "NC" ? "DT" : m))
        .sort();
}

function modsEqual(modsA, modsB) {
    if (modsA.length !== modsB.length) return false;
    return modsA.every((m, i) => m === modsB[i]);
}

function countCommonPlays(a, b) {
    return a.filter((playA) =>
        b.some(
            (playB) =>
                playA.id === playB.id &&
                modsEqual(
                    normalizeMods(playA.mods || []),
                    normalizeMods(playB.mods || [])
                )
        )
    ).length;
}

export default function TopPlaysGraph3D() {
    const [minCommon, setMinCommon] = useState(2);

    const graphData = useMemo(() => {
        const nodes = playersData.map((p) => ({
            id: p.id,
            name: p.username,
        }));

        const links = [];
        for (let i = 0; i < playersData.length; i++) {
            for (let j = i + 1; j < playersData.length; j++) {
                const common = countCommonPlays(
                    playersData[i].topPlays,
                    playersData[j].topPlays
                );
                if (common >= minCommon) {
                    links.push({
                        source: playersData[i].id,
                        target: playersData[j].id,
                        value: common,
                    });
                }
            }
        }

        return { nodes, links };
    }, [minCommon]);

    return (
        <div className="w-full h-screen flex flex-col">
            <div className="p-4 bg-gray-100 shadow-md flex items-center gap-2">
                <label className="font-medium">Min top plays communs :</label>
                <input
                    type="number"
                    value={minCommon}
                    min={1}
                    onChange={(e) => setMinCommon(Number(e.target.value))}
                    className="border px-2 py-1 rounded"
                />
            </div>
            <div className="flex-1">
                <ForceGraph3D
                    graphData={graphData}
                    nodeAutoColorBy="id"
                    nodeThreeObjectExtend={true}
                    nodeThreeObject={node => {
                        const sprite = new SpriteText(node.name);
                        sprite.color = node.color;
                        sprite.textHeight = 8;
                        sprite.center.y = -0.6; // shift above node
                        return sprite;
                    }}
                />
            </div>
        </div>
    );
}
