import { useRef, useEffect, useState } from 'react';
import './Card.css';

/**
 * Card – a single memory card with 3D flip animation.
 *
 * Props:
 *   card      – { uid, id, emoji, flipped, matched }
 *   disabled  – prevent clicking
 *   onFlip    – callback when card is clicked
 */
export default function Card({ card, disabled, onFlip, onRemove }) {
  const cardRef = useRef(null);
  const [removing, setRemoving] = useState(false);
  const isFlipped = card.flipped || card.matched;

  /* Add "shake" class on mismatch (card flips back) */
  const prevFlipped = useRef(card.flipped);
  useEffect(() => {
    if (prevFlipped.current && !card.flipped && !card.matched) {
      const el = cardRef.current;
      el?.classList.add('card-shake');
      const t = setTimeout(() => el?.classList.remove('card-shake'), 500);
      return () => clearTimeout(t);
    }
    prevFlipped.current = card.flipped;
  }, [card.flipped, card.matched]);

  /* Trigger removal animation after a brief matched pause */
  useEffect(() => {
    if (card.matched) {
      // Short delay so player sees the match, then fade out
      const t = setTimeout(() => setRemoving(true), 400);
      return () => clearTimeout(t);
    }
  }, [card.matched]);

  const handleClick = () => {
    if (disabled || isFlipped) return;
    onFlip(card.uid);
  };

  const handleAnimationEnd = (e) => {
    if (e.animationName === 'matchPopRemove' && onRemove) {
      onRemove(card.uid);
    }
  };

  /* If card has been removed, render an invisible placeholder to keep grid intact */
  if (card.removed) {
    return (
      <div
        className="card-wrapper card-placeholder"
        id={`card-${card.uid}`}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className={`card-wrapper ${isFlipped ? 'is-flipped' : ''} ${card.matched ? 'is-matched' : ''} ${removing ? 'is-removing' : ''}`}
      onClick={handleClick}
      ref={cardRef}
      id={`card-${card.uid}`}
      role="button"
      aria-label={isFlipped ? card.emoji : 'Hidden card'}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className="card-inner">
        {/* Front face (hidden side – shows pattern) */}
        <div className="card-face card-front">
          <span className="card-pattern">❓</span>
        </div>
        {/* Back face (revealed side – shows emoji) */}
        <div className="card-face card-back">
          <span className="card-emoji">{card.emoji}</span>
        </div>
      </div>

      {/* Confetti particles – burst out on removal */}
      {removing && (
        <div className="confetti-container" aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} className={`confetti-particle p${i}`} />
          ))}
        </div>
      )}
    </div>
  );
}
