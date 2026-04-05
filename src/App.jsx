import { useState, useEffect, useRef, useCallback } from 'react';
import LevelSelector from './components/LevelSelector';
import Header from './components/Header';
import GameBoard from './components/GameBoard';
import GameOverModal from './components/GameOverModal';
import { generateDeck, LEVELS } from './data/cardData';
import { saveProgress, getProgress, getTheme, saveTheme } from './utils/storage';
import { playFlip, playMatch, playMismatch, playWin } from './utils/sounds';

/**
 * App – Root component managing game state, screens, and core logic.
 *
 * Screens:
 *   'select' → LevelSelector
 *   'play'   → Header + GameBoard (+ optional GameOverModal)
 */
export default function App() {
  /* ---- Theme ---- */
  const [theme, setTheme] = useState(getTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveTheme(theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  /* ---- Sound ---- */
  const [soundOn, setSoundOn] = useState(true);
  const sound = useRef(true);
  useEffect(() => { sound.current = soundOn; }, [soundOn]);

  /* ---- Screen ---- */
  const [screen, setScreen] = useState('select'); // 'select' | 'play'
  const [returnTrack, setReturnTrack] = useState(null);

  /* ---- Game state ---- */
  const [level, setLevel] = useState('easy');
  const [stage, setStage] = useState(1);
  const [cards, setCards] = useState([]);
  const [flippedIds, setFlippedIds] = useState([]);   // currently flipped (max 2)
  const [matchedIds, setMatchedIds] = useState([]);   // matched card IDs (content id, not uid)
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [lockBoard, setLockBoard] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isNewBest, setIsNewBest] = useState(false);
  const [floatingText, setFloatingText] = useState(null);
  const [consecutiveMistakes, setConsecutiveMistakes] = useState(0);

  /* ---- Derived ---- */
  const currentLevelConfig = LEVELS[level] || LEVELS['easy'];
  const totalPairs = currentLevelConfig.pairs;

  /* ---- Initialise / restart a game ---- */
  const startGame = useCallback((lvl, specificStage = null) => {
    const deckLevel = lvl || level;
    const currentLevelProg = getProgress()[deckLevel];
    const targetStage = specificStage || (currentLevelProg ? currentLevelProg.highestUnlocked : 1);
    
    setLevel(deckLevel);
    setStage(targetStage);
    setCards(generateDeck(deckLevel));
    setFlippedIds([]);
    setMatchedIds([]);
    setScore(0);
    setMoves(0);
    setTimerRunning(false);
    setLockBoard(false);
    setGameOver(false);
    setIsNewBest(false);
    setFloatingText(null);
    setConsecutiveMistakes(0);
    setScreen('play');
    setReturnTrack(null);
  }, [level]);

  /* ---- Card flip handler ---- */
  const handleFlip = useCallback((uid) => {
    if (lockBoard) return;

    // Find the card
    const card = cards.find((c) => c.uid === uid);
    if (!card || card.flipped || card.matched) return;

    // Start timer on first ever flip
    if (moves === 0 && flippedIds.length === 0) {
      setTimerRunning(true);
    }

    // Play flip sound
    if (sound.current) playFlip();

    // Flip the card
    setCards((prev) =>
      prev.map((c) => (c.uid === uid ? { ...c, flipped: true } : c))
    );

    const newFlipped = [...flippedIds, uid];
    setFlippedIds(newFlipped);

    // If this is the second card
    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      setLockBoard(true); // prevent further clicks

      const first = cards.find((c) => c.uid === newFlipped[0]);
      const second = card; // the card just clicked

      if (first.id === second.id) {
        // ✅ Match!
        if (sound.current) setTimeout(() => playMatch(), 200);

        setMatchedIds((prev) => [...prev, first.id]);
        setScore((s) => s + 10);

        // Mark both cards as matched immediately for animations
        setCards((prev) =>
          prev.map((c) =>
            c.id === first.id ? { ...c, flipped: true, matched: true } : c
          )
        );

        setFlippedIds([]);
        setLockBoard(false);
        setConsecutiveMistakes(0);
        
        const MATCH_WORDS = [
          "Perfect! ✨",
          "Great memory! 🧠",
          "Spot on! 🎯",
          "Nice match! ✅",
          "Awesome! 🌟",
          "Brilliant! 💡",
          "Keen eye! 👀",
          "Fantastic! 🎉"
        ];
        setFloatingText(MATCH_WORDS[Math.floor(Math.random() * MATCH_WORDS.length)]);
        setTimeout(() => setFloatingText(null), 1000);

      } else {
        // ❌ Mismatch — flip back after delay
        if (sound.current) setTimeout(() => playMismatch(), 400);
        setScore((s) => Math.max(0, s - 2));

        const newMistakes = consecutiveMistakes + 1;
        setConsecutiveMistakes(newMistakes);

        if (newMistakes >= 3) {
          const MISMATCH_WORDS = [
            "Take your time! 🐢",
            "Don't rush! ⏳",
            "Look closely! 🔍",
            "Almost had it! 🤏",
            "Stay sharp! ⚔️",
            "Focus! 🧘",
            "Keep trying! 💪",
            "You got this! 🌟"
          ];
          setFloatingText(MISMATCH_WORDS[Math.floor(Math.random() * MISMATCH_WORDS.length)]);
        }

        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              newFlipped.includes(c.uid) && !c.matched
                ? { ...c, flipped: false }
                : c
            )
          );
          setFlippedIds([]);
          setLockBoard(false);
          if (newMistakes >= 3) setFloatingText(null);
        }, 1000);
      }
    }
  }, [cards, flippedIds, lockBoard, moves, consecutiveMistakes]);

  /* ---- Mark card as removed (keeps grid slot as placeholder) ---- */
  const handleRemoveCard = useCallback((uid) => {
    setCards((prev) =>
      prev.map((c) => (c.uid === uid ? { ...c, removed: true } : c))
    );
  }, []);

  /* ---- Check for victory ---- */
  useEffect(() => {
    if (matchedIds.length === totalPairs && totalPairs > 0 && !gameOver) {
      setTimerRunning(false);
      const elapsed = window.__brainflipElapsed || 0;

      // Small delay so last match animation plays
      setTimeout(() => {
        if (sound.current) playWin();
        const unlockedNew = saveProgress(level, stage, score, moves, elapsed);
        setIsNewBest(unlockedNew); // Reuse this state as "Unlocked Next Stage"
        setGameOver(true);
      }, 600);
    }
  }, [matchedIds, totalPairs, gameOver, level, score, moves]);

  /* ---- Render ---- */
  return (
    <>
      {/* Animated background orbs */}
      <div className="bg-orbs" aria-hidden="true">
        <div className="orb" />
        <div className="orb" />
        <div className="orb" />
      </div>

      <div className="app-container">
        {screen === 'select' && (
          <LevelSelector 
            onSelect={(lvl, stage) => startGame(lvl, stage)} 
            initialTrack={returnTrack} 
            onClearReturn={() => setReturnTrack(null)}
          />
        )}

        {screen === 'play' && (
          <>
            <Header
              score={score}
              moves={moves}
              stage={stage}
              levelLabel={currentLevelConfig.label}
              timerRunning={timerRunning}
              onRestart={() => startGame(level, stage)}
              onChangeLevel={() => {
                setReturnTrack(level);
                setScreen('select');
              }}
              onHome={() => {
                setReturnTrack(null);
                setScreen('select');
              }}
              soundOn={soundOn}
              onToggleSound={() => setSoundOn((s) => !s)}
              theme={theme}
              onToggleTheme={toggleTheme}
            />

            <GameBoard
              cards={cards}
              level={level}
              disabled={lockBoard}
              onFlip={handleFlip}
              onRemove={handleRemoveCard}
            />

            {floatingText && (
              <div className="floating-text-overlay fade-up glass">
                {floatingText}
              </div>
            )}

            {gameOver && (
              <GameOverModal
                score={score}
                moves={moves}
                time={window.__brainflipElapsed || 0}
                isNewBest={isNewBest}
                level={currentLevelConfig.label}
                stage={stage}
                onRestart={() => startGame(level, stage)}
                onNext={() => startGame(level, stage + 1)}
                onLevels={() => {
                  setReturnTrack(level);
                  setScreen('select');
                }}
                onHome={() => {
                  setReturnTrack(null);
                  setScreen('select');
                }}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
