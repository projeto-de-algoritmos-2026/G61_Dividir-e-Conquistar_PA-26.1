// luckMeterSystem.js

import { world } from "../game.js"

world.registerSystem("luckMeterSystem", (deltaTime) => {
    const players = world.query("player");
    if (players.length === 0) return;

    const playerId   = players[0];
    const playerData = world.getComponent(playerId, "player");
    const luckLevel  = playerData?.luck ?? 0;
    const luckMax    = playerData?.luckMax ?? 100;

    const fill  = document.getElementById("luck-bar-fill");
    const label = document.getElementById("luck-value");
    if (!fill || !label) return;

    const pct = Math.max(0, Math.min(1, luckLevel / luckMax));
    fill.style.width = `${pct * 100}%`;
    label.textContent = `${luckLevel}/${luckMax}`;
});