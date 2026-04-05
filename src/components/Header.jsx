import { useState, useEffect, useRef } from 'react';
import './Header.css';

/**
 * Header – displays score, moves, timer, and control buttons.
 */
export default function Header({
  score,
  moves,
  stage,
  levelLabel,
  timerRunning,
  onRestart,
  onChangeLevel,
  onHome,
  soundOn,
  onToggleSound,
  theme,
  onToggleTheme,
}) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  // Timer logic
  useEffect(() => {
    if (timerRunning) {
      if (!startTimeRef.current) startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 250);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [timerRunning]);

  // Reset timer on restart
  useEffect(() => {
    if (!timerRunning && moves === 0) {
      startTimeRef.current = null;
      setElapsed(0);
    }
  }, [timerRunning, moves]);

  /** Format seconds → mm:ss */
  const fmt = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  // Expose elapsed for parent (victory modal uses it)
  useEffect(() => {
    window.__brainflipElapsed = elapsed;
  }, [elapsed]);

  return (
    <header className="game-header glass fade-in" id="game-header">
      {/* Logo */}
      <div className="header-brand">
        <span className="header-logo">🧠</span>
        <h1 className="header-title">{levelLabel} - Lvl {stage}</h1>
      </div>

      {/* Stats */}
      <div className="header-stats">
        <div className="stat-pill" id="stat-score">
          <span className="stat-icon">⭐</span>
          <div className="stat-content">
            <span className="stat-label">Score</span>
            <span className="stat-value">{score}</span>
          </div>
        </div>
        <div className="stat-pill" id="stat-moves">
          <span className="stat-icon">👆</span>
          <div className="stat-content">
            <span className="stat-label">Moves</span>
            <span className="stat-value">{moves}</span>
          </div>
        </div>
        <div className="stat-pill" id="stat-timer">
          <span className="stat-icon">⏱️</span>
          <div className="stat-content">
            <span className="stat-label">Time</span>
            <span className="stat-value">{fmt(elapsed)}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="header-controls">
        <button
          className="btn btn-icon btn-secondary"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          id="btn-theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button
          className="btn btn-icon btn-secondary"
          onClick={onToggleSound}
          title={soundOn ? 'Mute' : 'Unmute'}
          id="btn-sound"
        >
          {soundOn ? '🔊' : '🔇'}
        </button>
        <button className="btn btn-secondary" onClick={onHome} id="btn-home" title="Home (Difficulty Select)">
          🏠 Home
        </button>
        <button className="btn btn-secondary" onClick={onChangeLevel} id="btn-level" title="Stage Map">
          🗺️ Map
        </button>
        <button className="btn btn-primary" onClick={onRestart} id="btn-restart">
          🔄 Restart
        </button>
      </div>
    </header>
  );
}
