console.log("Jogo iniciou!")
import './components/index.js';
import './systems/index.js';
import { world } from "./game.js";

// === tilesets ====
const tilesetImg = new Image();
tilesetImg.src = 'resources\\ForestAventure.png';
tilesetImg.onload = () => {
    world.setResource('ForestAdventure', tilesetImg);
    requestAnimationFrame(gameLoop); // só inicia depois de carregar
};

const tilesetImg2 = new Image();
tilesetImg2.src = 'resources\\DarkDungeon.png';
tilesetImg2.onload = () => {
    world.setResource('DarkDungeon', tilesetImg2);
    requestAnimationFrame(gameLoop); // só inicia depois de carregar
};

const tilesetImg3 = new Image();
tilesetImg3.src = 'resources\\weapons\\weapon_rusty_sword.png';
tilesetImg3.onload = () => {
    world.setResource('rusty sword', tilesetImg3);
    requestAnimationFrame(gameLoop); // só inicia depois de carregar
};

const tilesetImg4 = new Image();
tilesetImg4.src = 'resources\\weapons\\weapon_duel_sword.png';
tilesetImg4.onload = () => {
    world.setResource('weapon duel sword', tilesetImg4);
    requestAnimationFrame(gameLoop); // só inicia depois de carregar
};

const tilesetImg5 = new Image();
tilesetImg5.src = 'resources\\weapons\\weapon_lavish_sword.png';
tilesetImg5.onload = () => {
    world.setResource('weapon lavish sword', tilesetImg5);
    requestAnimationFrame(gameLoop); // só inicia depois de carregar
};

// === canvas ===
const canvas = document.getElementById("canva")
const ctx = canvas.getContext("2d")

world.setResource('ctx', ctx);
world.setResource('canvas', canvas);

canvas.width = 800
canvas.height = 640


// === input ====
const keys = {}

window.addEventListener("keydown", e => {
    keys[e.key.toLowerCase()] = true
})

window.addEventListener("keyup", e => {
    keys[e.key.toLowerCase()] = false
})

world.setResource('keys', keys) 

// === gameloop ===
let lastTime = performance.now()

function gameLoop(currentTime) {

    const deltaTime =
        (currentTime - lastTime) / 1000

    lastTime = currentTime

    world.update(deltaTime)

    requestAnimationFrame(gameLoop)
}

requestAnimationFrame(gameLoop)