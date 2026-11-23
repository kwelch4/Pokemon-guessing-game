import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import DexGame from "./pages/DexGame";
import LetterGame from "./pages/LetterGame";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dex" element={<DexGame />} />
      <Route path="/letter" element={<LetterGame />} />
    </Routes>
  );
}