import { useEffect, useState } from 'react';
import './GameOverModal.css';

const VICTORY_WORDS = [
  'Fantastic!', 
  'Marvelous!', 
  'Brilliant!', 
  'Masterful!', 
  'Outstanding!', 
  'Incredible!', 
  'Spectacular!'
];

/**
 * GameOverModal – victory modal with stats, best-score badge, and actions.
 *
 * Props:
 *   score       – final score
 *   moves       – total moves
 *   time        – elapsed seconds
 *   isNewBest   – whether this is a new best score
 *   level       – level label string
 *   stage       – current integer stage
 *   onRestart   – replay same level
 *   onNext      – proceed to following stage
 *   onLevels    – go back to level select
 */
export default function GameOverModal({
  score,
  moves,
  time,
  isNewBest,
  level,
  stage,
  onRestart,
  onNext,
  onLevels,
  onHome,
}) {
  const [victoryWord] = useState(() => VICTORY_WORDS[Math.floor(Math.random() * VICTORY_WORDS.length)]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  /** Format seconds → mm:ss */
  const fmt = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  return (
    <div className="modal-overlay" id="game-over-modal">
      <div className="modal-content glass scale-in">
        {/* Confetti-like decorative emojis */}
        <div className="modal-confetti" aria-hidden="true">
          <span className="confetti-item">🎉</span>
          <span className="confetti-item">✨</span>
          <span className="confetti-item">🎊</span>
          <span className="confetti-item">⭐</span>
          <span className="confetti-item">💜</span>
        </div>

        <h2 className="modal-title">🏆 {victoryWord}</h2>
        <p className="modal-subtitle">{level} - Lvl {stage} Cleared!</p>

        {isNewBest && (
          <div className="modal-badge">
            🔓 Unlocked Next Level!
          </div>
        )}

        <div className="modal-stats">
          <div className="modal-stat">
            <span className="modal-stat-icon">⭐</span>
            <span className="modal-stat-value">{score}</span>
            <span className="modal-stat-label">Score</span>
          </div>
          <div className="modal-stat">
            <span className="modal-stat-icon">👆</span>
            <span className="modal-stat-value">{moves}</span>
            <span className="modal-stat-label">Moves</span>
          </div>
          <div className="modal-stat">
            <span className="modal-stat-icon">⏱️</span>
            <span className="modal-stat-value">{fmt(time)}</span>
            <span className="modal-stat-label">Time</span>
          </div>
        </div>

        <div className="modal-actions" style={{ flexDirection: 'column', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={onNext} id="btn-next-level">
            ➡️ Next Level
          </button>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={onHome} id="btn-home" style={{ flex: 1 }} title="Main Menu">
              🏠 Home
            </button>
            <button className="btn btn-secondary" onClick={onLevels} id="btn-back-levels" style={{ flex: 1 }} title="Stage Map">
              🗺️ Map
            </button>
            <button className="btn btn-secondary" onClick={onRestart} id="btn-play-again" style={{ flex: 1 }} title="Replay">
              🔄 Replay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
