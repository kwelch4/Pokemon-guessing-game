import { spriteUrl } from "../utils";

// pokemon = null renders a hidden "?" tile.
// badge = { text, kind } where kind is match or wrong
export default function PokeTile({ pokemon, showName = false, badge, faded = false }) {
  if (!pokemon) {
    return <div className="tile tile--hidden">?</div>;
  }
  return (
    <div className={`tile tile--shown ${faded ? "tile--faded" : ""}`} title={pokemon.name}>
      <img src={spriteUrl(pokemon.dex)} alt={pokemon.name} loading="lazy" />
      {showName && <span className="tile__name">{pokemon.name}</span>}
      {badge && <span className={`tile__badge badge--${badge.kind}`}>{badge.text}</span>}
    </div>
  );
}