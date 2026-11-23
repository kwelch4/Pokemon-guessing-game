import { allPokemon as raw } from "./pokemon";

// turn data into array
export const allPokemon = raw.map((p) => ({
  name: p.name,
  dex: p.dex,
  types: p.type.split("/").map((t) => t.trim().toLowerCase()),
}));