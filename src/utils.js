export const TYPES = [
  "normal", "fire", "water", "grass", "electric", "ice", "fighting",
  "poison", "ground", "flying", "psychic", "bug", "rock", "ghost",
  "dragon", "dark", "steel", "fairy",
];

export const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");


export const GEN_STARTS = [0, 1, 152, 252, 387, 494, 650, 722, 810, 906, 1026];

export const TYPE_COLORS = {
  normal: "#d2d2d2", fire: "#ee8130", water: "#6390f0", grass: "#00ae5a",
  electric: "#f7d02c", ice: "#96d9d6", fighting: "#c22e28", poison: "#a33ea1",
  ground: "#e2bf65", flying: "#a98ff3", psychic: "#f95587", bug: "#a6b91a",
  rock: "#b6a136", ghost: "#735797", dragon: "#6f35fc", dark: "#2f1c34",
  steel: "#8b8bb2", fairy: "#d685ad",
};

export const randInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const spriteUrl = (dex) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${dex}.png`;

export const inGen = (p, gen) =>
  p.dex >= GEN_STARTS[gen] && p.dex < GEN_STARTS[gen + 1];

export const startsWith = (p, letter) => p.name[0].toUpperCase() === letter;

export const accuracy = ({ correct, total }) =>
  total === 0 ? "0.0" : ((correct / total) * 100).toFixed(1);

export const normalize = (s) => s.trim().toUpperCase();