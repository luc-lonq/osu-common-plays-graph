import React, {useState, useMemo, useCallback, useRef} from "react";
import ForceGraph3D from "react-force-graph-3d";
import playersData from "./data.json";
import SpriteText from "three-spritetext";


function countCommonPlays(a, b) {
    const setA = new Set(a.map((play) => play.id));
    return b.filter((play) => setA.has(play.id)).length;
}

export default function TopPlaysGraph3D() {
    const [minCommon, setMinCommon] = useState(50);
    const [hoveredNode, setHoveredNode] = useState(null);
    const [highlightedNodes, setHighlightedNodes] = useState(new Set());
    const [highlightedLinks, setHighlightedLinks] = useState(new Set());

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

        const gData = { nodes, links };

        const nodeById = Object.fromEntries(nodes.map((n) => [n.id, n]));

        gData.links.forEach((link) => {
            const a = nodeById[link.source];
            const b = nodeById[link.target];
            if (!a || !b) return; // sécurité

            !a.neighbors && (a.neighbors = []);
            !b.neighbors && (b.neighbors = []);
            a.neighbors.push(b);
            b.neighbors.push(a);

            !a.links && (a.links = []);
            !b.links && (b.links = []);
            a.links.push(link);
            b.links.push(link);
        });

        console.log(gData);

        return gData;
    }, [minCommon]);

    const fgRef = useRef();

    const handleClick = useCallback(node => {
        if (node) {
            setHoveredNode(node);

            if (node.neighbors) {
                const newNodes = new Set([...node.neighbors]);
                const newLinks = new Set(node.links);
                setHighlightedNodes(newNodes);
                setHighlightedLinks(newLinks);
            }
            else {
                setHighlightedNodes(new Set());
                setHighlightedLinks(new Set());
            }
        }

        const distance = 200;
        const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

        fgRef.current.cameraPosition(
            { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
            node,
            3000
        );
    }, [fgRef]);

    const focusOnNodeWithName = useCallback((name) => {
        const node = graphData.nodes.find(n => n.name === name);
        if (node) {
            handleClick(node);
        }
    });

    return (
        <div className="w-full h-screen flex flex-col">
            <div className="p-2 bg-gray-100 shadow-md flex items-center gap-2">
                <label className="font-medium">Min top plays communs :</label>
                <input
                    type="number"
                    value={minCommon}
                    min={1}
                    onChange={(e) => setMinCommon(Number(e.target.value))}
                    className="border px-2 py-1 rounded"
                />
            </div>
            <div className="p-2 bg-gray-100 shadow-md flex items-center gap-2">
                <label className="font-medium">Focus on player :</label>
                <input
                    type="text"
                    placeholder="Nom du joueur"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            focusOnNodeWithName(e.target.value);
                            e.target.value = '';
                        }
                    }}
                    className="border px-2 py-1 rounded flex-1"
                />
            </div>
            <div className="flex-1">
                <ForceGraph3D
                    ref={fgRef}
                    graphData={graphData}
                    nodeColor={node => hoveredNode === node ? "#5f5" : highlightedNodes.has(node) ? "#f55" : "#fff"}
                    nodeThreeObjectExtend={true}
                    nodeThreeObject={node => {
                        const sprite = new SpriteText(node.name);
                        sprite.color = hoveredNode === node ? "#5f5" : highlightedNodes.has(node) ? "#f55" : "#fff";
                        sprite.textHeight = 8;
                        sprite.center.y = -0.6; // shift above node
                        return sprite;
                    }}
                    linkWidth={link => highlightedLinks.has(link) ? 5 : 1}
                    linkColor={link => highlightedLinks.has(link) ? "#f00" : "#888"}
                    onNodeClick={handleClick}
                    linkThreeObjectExtend={true}
                    linkThreeObject={link => {
                        const sprite = new SpriteText(`${highlightedLinks.has(link) ? link.value : ""}`);
                        sprite.color = 'lightgrey';
                        sprite.textHeight = 5;
                        return sprite;
                    }}
                    linkPositionUpdate={(sprite, { start, end }) => {
                        const middlePos = Object.assign(...['x', 'y', 'z'].map(c => ({
                            [c]: start[c] + (end[c] - start[c]) / 2
                        })));

                        Object.assign(sprite.position, middlePos);
                    }}
                />
            </div>
        </div>
    );
}
