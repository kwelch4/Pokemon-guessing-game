import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { allPokemon } from "../data";
import { GEN_STARTS, pick, normalize } from "../utils";
import PokeTile from "../components/PokeTile";
import TypeBadge from "../components/TypeBadge";
import Field from "../components/Field";
import StatsBar from "../components/StatsBar";

const GEN_OPTIONS = Array.from({ length: 9 }, (_, i) => ({
  value: i + 1,
  label: `Gen ${i + 1}`,
}));

export default function DexGame() {
  const [settings, setSettings] = useState({
    startGen: 1, endGen: 9, difficulty: 1, mode: 1,
  });
  const [playing, setPlaying] = useState(false);
  const [pool, setPool] = useState([]);
  const [target, setTarget] = useState(null);
  const [tiles, setTiles] = useState([]);       // newest first
  const [message, setMessage] = useState("");
  const [roundOver, setRoundOver] = useState(false);
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const set = (key) => (value) => setSettings((s) => ({ ...s, [key]: value }));

  useEffect(() => {
    if (playing) inputRef.current?.focus();
  }, [playing, target, roundOver]);

  const newRound = (fromPool = pool) => {
    setTarget(pick(fromPool));
    setTiles([]);
    setMessage("Make a guess");
    setRoundOver(false);
    setInput("");
  };

  const startGame = () => {
    if (settings.endGen < settings.startGen) {
      setError("End gen can't be before the starting gen!");
      return;
    }
    setError("");
    const newPool = allPokemon.filter(
      (p) => p.dex >= GEN_STARTS[settings.startGen] &&
             p.dex < GEN_STARTS[settings.endGen + 1]
    );
    setPool(newPool);
    setStats({ correct: 0, total: 0 });
    setPlaying(true);
    newRound(newPool);
  };

  const endGame = () => {
    setPlaying(false);
    setTarget(null);
    setTiles([]);
    setMessage("");
  };

  const recordGuess = (isCorrect) =>
    setStats((s) => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (roundOver) return newRound();

    const guess = normalize(input);
    if (!guess) return setMessage("Please enter a guess");

    const guessed = allPokemon.find((p) => p.name.toUpperCase() === guess);
    const isCorrect = guess === target.name.toUpperCase();
    recordGuess(isCorrect);
    setInput("");

    if (isCorrect) {
      setMessage("Correct!");
      setTiles((t) => [{ p: target, badge: { text: "Correct!", kind: "match" } }, ...t]);
      return setRoundOver(true);
    }

    // Mode 1: one guess only
    if (settings.mode === 1) {
      setMessage(`Incorrect! The answer was ${target.name}`);
      setTiles([
        { p: target, badge: { text: "Correct Pokémon", kind: "match" } },
        ...(guessed ? [{ p: guessed, badge: { text: "Wrong", kind: "wrong" } }] : []),
      ]);
      return setRoundOver(true);
    }

    // Mode 2: keep guessing, with a higher/lower hint
    if (!guessed) return setMessage("Incorrect and not a valid Pokémon name");
    const higher = guessed.dex > target.dex;
    setMessage(higher ? "Too high!" : "Too low!");
    setTiles((t) => [
      { p: guessed, badge: { text: higher ? "Too high in dex" : "Too low in dex", kind: "wrong" } },
      ...t,
    ]);
  };

  const giveUp = () => {
    setMessage(`The correct answer was ${target.name}`);
    setTiles((t) => [{ p: target, badge: { text: "Target", kind: "match" } }, ...t]);
    setStats((s) => ({ ...s, total: s.total + 1 }));
    setRoundOver(true);
  };

  return (
    <main className="page">
      <Link to="/" className="back-link">← Home</Link>
      <h1 className="title">Guess by Dex Number</h1>

      {!playing ? (
        <section className="card">
          <Field label="Start with gen" value={settings.startGen} onChange={set("startGen")} options={GEN_OPTIONS} />
          <Field label="End with gen" value={settings.endGen} onChange={set("endGen")} options={GEN_OPTIONS} />
          <Field
            label="Difficulty" value={settings.difficulty} onChange={set("difficulty")}
            options={[
              { value: 1, label: "Easy (dex number + types)" },
              { value: 2, label: "Hard (dex number only)" },
            ]}
          />
          <Field
            label="Mode" value={settings.mode} onChange={set("mode")}
            options={[
              { value: 1, label: "One guess per Pokémon" },
              { value: 2, label: "Guess until correct" },
            ]}
          />
          {error && <p className="error">{error}</p>}
          <button className="btn btn--primary" onClick={startGame}>Start Game</button>
        </section>
      ) : (
        <>
          <StatsBar stats={stats} />

          <section className="card card--prompt">
            <div className="prompt-dex">#{target.dex}</div>
            {settings.difficulty === 1 && (
              <div className="prompt-types">
                {target.types.map((t) => <TypeBadge key={t} type={t} />)}
              </div>
            )}
            <p className="message">{message}</p>

            <form onSubmit={handleSubmit} className="guess-form">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={roundOver ? "Press Enter for next round…" : "Enter your guess"}
                readOnly={roundOver}
                autoComplete="off"
              />
              <button className="btn btn--primary" type="submit">
                {roundOver ? "Next →" : "Submit"}
              </button>
              {settings.mode === 2 && !roundOver && (
                <button type="button" className="btn" onClick={giveUp}>I don't know</button>
              )}
              <button type="button" className="btn btn--danger" onClick={endGame}>End game</button>
            </form>
          </section>

          {tiles.length > 0 && (
            <>
              <h3 className="section-title">Guessed Pokémon</h3>
              <div className="grid grid--labeled">
                {tiles.map((t, i) => (
                  <PokeTile key={`${t.p.name}-${i}`} pokemon={t.p} showName badge={t.badge} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </main>
  );
}