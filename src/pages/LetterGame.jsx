import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { allPokemon } from "../data";
import {
  LETTERS, TYPES, pick, randInt, inGen, startsWith, normalize,
} from "../utils";
import PokeTile from "../components/PokeTile";
import TypeBadge from "../components/TypeBadge";
import Field from "../components/Field";
import StatsBar from "../components/StatsBar";

const GAME_TYPES = [
  { value: 1, label: "Guess by Type" },
  { value: 2, label: "Guess by Gen" },
  { value: 3, label: "Guess A–Z by Type" },
  { value: 4, label: "Guess by Type and Gen" },
  { value: 5, label: "Guess all with that first letter" },
];

/* ---------- pure helpers ---------- */

// Returns { letter, type, gen, pool, azIndex } or null if nothing is possible.
function buildRound(gameType, azType, azIndex = 0) {
  if (gameType === 3) {
    for (let i = azIndex; i < LETTERS.length; i++) {
      const pool = allPokemon.filter(
        (p) => startsWith(p, LETTERS[i]) && p.types.includes(azType)
      );
      if (pool.length) return { letter: LETTERS[i], type: azType, gen: null, pool, azIndex: i };
    }
    return null;
  }

  const useType = gameType === 1 || gameType === 4;
  const useGen = gameType === 2 || gameType === 4;

  for (let tries = 0; tries < 500; tries++) {
    const letter = pick(LETTERS);
    const type = pick(TYPES);
    const gen = randInt(1, 9);

    let pool = allPokemon.filter((p) => startsWith(p, letter));
    if (useType) pool = pool.filter((p) => p.types.includes(type));
    if (useGen) pool = pool.filter((p) => inGen(p, gen));

    if (pool.length) {
      return {
        letter,
        type: useType ? type : null,
        gen: useGen ? gen : null,
        pool,
        azIndex: 0,
      };
    }
  }
  return null;
}

// What the grid shows right now. Pool is already in dex order.
function buildTiles(pool, guessed, dexOrder, revealed) {
  const guessedNames = new Set(guessed.map((g) => g.name));
  const unguessed = pool.filter((p) => !guessedNames.has(p.name));

  if (dexOrder) {
    // Each Pokémon owns a fixed slot.
    return pool.map((p) => {
      if (guessedNames.has(p.name)) return { p, state: "found" };
      if (revealed) return { p, state: "missed" };
      return { p: null, state: "hidden" };
    });
  }

  // Slots fill left-to-right in guess order; leftovers are revealed at the end.
  return pool.map((_, i) => {
    if (i < guessed.length) return { p: guessed[i], state: "found" };
    if (revealed) return { p: unguessed[i - guessed.length], state: "missed" };
    return { p: null, state: "hidden" };
  });
}

/* ---------- component ---------- */

export default function LetterGame() {
  const [settings, setSettings] = useState({ gameType: 1, mode: 1, dexOrder: 1 });
  const [config, setConfig] = useState(null);     // settings locked in at game start
  const [round, setRound] = useState(null);
  const [azType, setAzType] = useState(null);
  const [guessed, setGuessed] = useState([]);     // Pokémon objects, in guess order
  const [message, setMessage] = useState("");
  const [hint, setHint] = useState("");
  const [roundOver, setRoundOver] = useState(false);
  const [finished, setFinished] = useState(false); // A–Z complete
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [input, setInput] = useState("");
  const inputRef = useRef(null);

  const playing = config !== null;
  const set = (key) => (value) => setSettings((s) => ({ ...s, [key]: value }));
  const gameType = settings.gameType;
  // "Guess all" can't be played in one-guess mode (same rule as your original).
  const effectiveMode = gameType === 5 ? 2 : settings.mode;

  useEffect(() => {
    if (playing && !finished) inputRef.current?.focus();
  }, [playing, round, roundOver, finished]);

  const loadRound = (r) => {
    setRound(r);
    setGuessed([]);
    setMessage("");
    setHint("");
    setInput("");
    setRoundOver(false);
  };

  const startGame = () => {
    const cfg = { gameType, mode: effectiveMode, dexOrder: settings.dexOrder === 1 };
    const type = gameType === 3 ? pick(TYPES) : null;
    setConfig(cfg);
    setAzType(type);
    setStats({ correct: 0, total: 0 });
    setFinished(false);
    loadRound(buildRound(cfg.gameType, type, 0));
  };

  const endGame = () => {
    setConfig(null);
    setRound(null);
    setGuessed([]);
    setMessage("");
    setHint("");
    setFinished(false);
  };

  const nextRound = () => {
    if (config.gameType === 3) {
      const r = buildRound(3, azType, round.azIndex + 1);
      if (!r) {
        setFinished(true);
        setMessage("A–Z Challenge Finished!");
        return;
      }
      return loadRound(r);
    }
    loadRound(buildRound(config.gameType, null, 0));
  };

  const unguessed = round
    ? round.pool.filter((p) => !guessed.some((g) => g.name === p.name))
    : [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (roundOver) return finished ? null : nextRound();

    const guess = normalize(input);
    if (!guess) return setMessage("Please enter a guess");

    if (guessed.some((g) => g.name.toUpperCase() === guess)) {
      setInput("");
      return setMessage("You already guessed that!");
    }

    setHint("");
    setInput("");
    const match = round.pool.find((p) => p.name.toUpperCase() === guess);
    setStats((s) => ({ correct: s.correct + (match ? 1 : 0), total: s.total + 1 }));

    if (!match) {
      if (config.mode === 1) {
        setMessage("Incorrect! Game over for this round.");
        return setRoundOver(true);
      }
      return setMessage("Incorrect.");
    }

    const nextGuessed = [...guessed, match];
    setGuessed(nextGuessed);

    if (config.mode === 1) {
      setMessage(`Correct! A correct Pokémon was ${match.name}.`);
      return setRoundOver(true);
    }
    const remaining = round.pool.length - nextGuessed.length;
    if (remaining === 0) {
      setMessage("You guessed all Pokémon!");
      return setRoundOver(true);
    }
    setMessage(`Correct! Remaining targets: ${remaining}`);
  };

  const giveUp = () => {
    // Every unguessed Pokémon counts as a miss, like the original.
    setStats((s) => ({ ...s, total: s.total + unguessed.length }));
    setMessage("Skipped — here's what you missed.");
    setRoundOver(true);
  };

  const showHint = () => {
    if (unguessed.length === 0) return setHint("No hidden choices remaining!");
    const target = pick(unguessed);
    setHint(`Hint: a correct Pokémon has typing ${target.types.join(" / ")}`);
  };

  const tiles = round
    ? buildTiles(round.pool, guessed, config.dexOrder, roundOver)
    : [];

  return (
    <main className="page">
      <Link to="/" className="back-link">← Home</Link>
      <h1 className="title">Guess by First Letter</h1>

      {!playing ? (
        <section className="card">
          <Field
            label="Game type" value={gameType} options={GAME_TYPES}
            onChange={(v) => setSettings((s) => ({ ...s, gameType: v }))}
          />
          <Field
            label="Game mode"
            value={effectiveMode}
            onChange={set("mode")}
            disabled={gameType === 5}
            options={
              gameType === 5
                ? [{ value: 2, label: "Guess all" }]
                : [
                    { value: 1, label: "One guess" },
                    { value: 2, label: "Keep guessing (guess all)" },
                  ]
            }
          />
          <Field
            label="Show results in dex order?" value={settings.dexOrder} onChange={set("dexOrder")}
            options={[{ value: 1, label: "Yes" }, { value: 2, label: "No" }]}
          />
          <button className="btn btn--primary" onClick={startGame}>Start Game</button>
        </section>
      ) : !round ? (
        <section className="card">
          <p className="message">No valid rounds found for these settings.</p>
          <button className="btn" onClick={endGame}>Back to setup</button>
        </section>
      ) : (
        <>
          <StatsBar stats={stats} />

          <section className="card card--prompt">
            <div className="chips">
              <span className="chip chip--letter">{round.letter}</span>
              {round.type && <TypeBadge type={round.type} />}
              {round.gen && <span className="chip">Gen {round.gen}</span>}
            </div>
            <p className="message">{message}</p>
            {hint && <p className="hint">{hint}</p>}

            <form onSubmit={handleSubmit} className="guess-form">
              {!finished && (
                <>
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={roundOver ? "Press Enter for next round…" : "Guess a Pokémon"}
                    readOnly={roundOver}
                    autoComplete="off"
                  />
                  <button className="btn btn--primary" type="submit">
                    {roundOver ? "Next →" : "Submit"}
                  </button>
                  {!roundOver && (
                    <button type="button" className="btn" onClick={showHint}>Hint</button>
                  )}
                  {!roundOver && config.mode === 2 && (
                    <button type="button" className="btn" onClick={giveUp}>I don't know</button>
                  )}
                </>
              )}
              <button type="button" className="btn btn--danger" onClick={endGame}>End game</button>
            </form>
          </section>

          <div className="grid">
            {tiles.map((t, i) => (
              <PokeTile
                key={i}
                pokemon={t.p}
                showName={t.state !== "hidden"}
                faded={t.state === "missed"}
              />
            ))}
          </div>
        </>
      )}
    </main>
  );
}