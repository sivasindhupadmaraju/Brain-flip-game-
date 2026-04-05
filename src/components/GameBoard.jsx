import Card from './Card';
import { LEVELS } from '../data/cardData';
import './GameBoard.css';

/**
 * GameBoard – renders the card grid for the current level.
 *
 * Props:
 *   cards     – array of card objects
 *   level     – current level key ('easy' | 'medium' | 'hard')
 *   disabled  – if true, clicks are blocked (e.g. during flip animation)
 *   onFlip    – callback when a card is clicked
 */
export default function GameBoard({ cards, level, disabled, onFlip, onRemove }) {
  const currentLevelConfig = LEVELS[level] || LEVELS['easy'];
  const { cols } = currentLevelConfig;

  return (
    <div className="gameboard-container fade-in" id="gameboard">
      <div
        className="gameboard-grid"
        style={{
          gridTemplateColumns: `repeat(${cols}, var(--card-size))`,
          /* Dynamically set card size for hard level on small screens */
          ...(level.includes('hard') ? { '--card-size': 'clamp(48px, 10vw, 75px)' } : {}),
          ...(level.includes('medium') ? { '--card-size': 'clamp(55px, 12vw, 85px)' } : {}),
        }}
      >
        {cards.map((card) => (
          <Card
            key={card.uid}
            card={card}
            disabled={disabled}
            onFlip={onFlip}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}
