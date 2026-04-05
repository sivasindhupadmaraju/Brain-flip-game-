import { useState } from 'react';
import { LEVELS } from '../data/cardData';
import { getProgress } from '../utils/storage';
import './LevelSelector.css';

/**
 * LevelSelector – handles difficulty selection and then stage selection map.
 *
 * Props:
 *   onSelect – callback(levelKey, specificStage)
 *   initialTrack - preloads a specific maps difficulty
 *   onClearReturn - callback to clear App return tracker
 */
export default function LevelSelector({ onSelect, initialTrack, onClearReturn }) {
  const [selectedTrack, setSelectedTrack] = useState(initialTrack || null);
  const progress = getProgress();

  const handleBack = () => {
    setSelectedTrack(null);
    if (onClearReturn) onClearReturn();
  };

  // ----- PHASE 2: Stage Selection Map -----
  if (selectedTrack) {
    const trackData = progress[selectedTrack] || { highestUnlocked: 1, stages: {} };
    const levelConfig = LEVELS[selectedTrack];
    
    // We render in brackets of 100 levels. If they pass 100, it expands to 200, etc.
    const TOTAL_LEVELS = Math.max(100, Math.ceil(trackData.highestUnlocked / 100) * 100);
    const allStages = Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1);

    /** Format seconds → mm:ss for the tooltip */
    const fmt = (s) => {
      if (!s) return '00:00';
      const m = Math.floor(s / 60).toString().padStart(2, '0');
      const sec = (s % 60).toString().padStart(2, '0');
      return `${m}:${sec}`;
    };

    return (
      <div className="level-selector fade-in" id="stage-selector">
        <div className="level-hero">
          <button 
            className="btn btn-secondary btn-icon" 
            style={{ position: 'absolute', top: 0, left: 0 }}
            onClick={handleBack}
            title="Back to Difficulty Select"
          >
            ←
          </button>
          <span className="level-hero-icon">{levelConfig.icon}</span>
          <h1 className="level-hero-title">{levelConfig.label} Map</h1>
          <p className="level-hero-subtitle">Select a stage to play.</p>
        </div>

        <div className="stage-grid">
          {allStages.map(stageNum => {
            const isUnlocked = stageNum <= trackData.highestUnlocked;
            const stats = trackData.stages[stageNum];
            
            return (
              <div key={stageNum} className="stage-btn-container">
                <button
                  className={`stage-btn glass ${!isUnlocked ? 'stage-btn--locked' : ''}`}
                  onClick={() => isUnlocked && onSelect(selectedTrack, stageNum)}
                  disabled={!isUnlocked}
                  title={!isUnlocked ? `Complete Level ${stageNum - 1} to unlock` : `Play Level ${stageNum}`}
                >
                  {isUnlocked ? stageNum : '🔒'}
                  
                  {isUnlocked && stats && (
                    <div className="stage-tooltip glass">
                      <div className="tooltip-title">Stage {stageNum} Cleared</div>
                      <div className="tooltip-stat">⭐ Score: {stats.score}</div>
                      <div className="tooltip-stat">👆 Moves: {stats.moves}</div>
                      <div className="tooltip-stat">⏱️ Time: {fmt(stats.time)}</div>
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ----- PHASE 1: Difficulty Selection -----
  const levelEntries = Object.entries(LEVELS);

  return (
    <div className="level-selector fade-in" id="level-selector">
      <div className="level-hero">
        <span className="level-hero-icon">🧠</span>
        <h1 className="level-hero-title">BrainFlip</h1>
        <p className="level-hero-subtitle">
          Match all the pairs. Test your memory!
        </p>
      </div>

      <div className="level-cards">
        {levelEntries.map(([key, level]) => {
          const trackData = progress[key] || { highestUnlocked: 1 };
          
          return (
            <button
              key={key}
              className="level-card glass"
              onClick={() => setSelectedTrack(key)}
              id={`level-${key}`}
            >
              <span className="level-card-icon">{level.icon}</span>
              <h2 className="level-card-title">{level.label}</h2>
              <p className="level-card-grid">
                {level.rows}×{level.cols} &nbsp;·&nbsp; {level.pairs} pairs
              </p>
              
              <div className="level-card-best" style={{ background: 'var(--surface-border)' }}>
                <span>🔓 Level {trackData.highestUnlocked} Unlocked</span>
              </div>
            </button>
          );
        })}
      </div>

      <p className="level-footer-tip">
        💡 Tip: Keep playing to unlock endless levels!
      </p>
    </div>
  );
}
