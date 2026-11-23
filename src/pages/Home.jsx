import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="page page--center">
      <h1 className="title">Pokémon Guessing Game</h1>
      <p className="subtitle">Pick a challenge</p>
      <div className="menu">
        <Link to="/dex" className="menu-card">
         
          <h2>Guess by Dex Number</h2>
          <p>Name the Pokémon from its Pokédex number.</p>
        </Link>
        <Link to="/letter" className="menu-card">
       
          <h2>Guess by First Letter</h2>
          <p>Find every Pokémon matching a letter, type, or generation.</p>
        </Link>
      </div>
    </main>
  );
}