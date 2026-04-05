/**
 * Card image data – high-quality emoji icons grouped by category.
 * Each entry has an id and an emoji character used as the card face.
 * We have enough unique items to cover the hardest level (32 pairs).
 */

const CARD_ICONS = [
  // Animals
  { id: 1,  emoji: '🦊' },
  { id: 2,  emoji: '🐼' },
  { id: 3,  emoji: '🦁' },
  { id: 4,  emoji: '🐸' },
  { id: 5,  emoji: '🦋' },
  { id: 6,  emoji: '🐙' },
  { id: 7,  emoji: '🦄' },
  { id: 8,  emoji: '🐧' },
  // Fruits
  { id: 9,  emoji: '🍎' },
  { id: 10, emoji: '🍇' },
  { id: 11, emoji: '🍒' },
  { id: 12, emoji: '🥝' },
  { id: 13, emoji: '🍑' },
  { id: 14, emoji: '🫐' },
  { id: 15, emoji: '🍉' },
  { id: 16, emoji: '🥭' },
  // Tech / Space
  { id: 17, emoji: '🚀' },
  { id: 18, emoji: '🤖' },
  { id: 19, emoji: '👾' },
  { id: 20, emoji: '🎮' },
  { id: 21, emoji: '💎' },
  { id: 22, emoji: '⚡' },
  { id: 23, emoji: '🔮' },
  { id: 24, emoji: '🛸' },
  // Nature / Misc
  { id: 25, emoji: '🌸' },
  { id: 26, emoji: '🌈' },
  { id: 27, emoji: '🔥' },
  { id: 28, emoji: '❄️' },
  { id: 29, emoji: '🌙' },
  { id: 30, emoji: '🎵' },
  { id: 31, emoji: '🍄' },
  { id: 32, emoji: '🎯' },
];

/**
 * Difficulty level configuration.
 */
export const LEVELS = {
  easy:   { label: 'Easy',   pairs: 8,  cols: 4, rows: 4, icon: '🌱' },
  medium: { label: 'Medium', pairs: 18, cols: 6, rows: 6, icon: '🔥' },
  hard:   { label: 'Hard',   pairs: 32, cols: 8, rows: 8, icon: '💀' },
};

/**
 * Fisher-Yates shuffle.
 */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Generate a shuffled deck for a given level.
 * Each card object: { uid, id, emoji, flipped, matched }
 */
export function generateDeck(levelKey) {
  // Graceful fallback if old levelKey is passed
  const key = LEVELS[levelKey] ? levelKey : 'easy';
  const level = LEVELS[key];
  const selected = CARD_ICONS.slice(0, level.pairs);
  
  // Use a salt to ensure unique UIDs per game so React completely remounts cards on restart
  const salt = Math.random().toString(36).substring(2, 8);
  
  // Duplicate each card to create pairs
  const pairs = selected.flatMap((card) => [
    { ...card, uid: `${card.id}-a-${salt}`, flipped: false, matched: false },
    { ...card, uid: `${card.id}-b-${salt}`, flipped: false, matched: false },
  ]);
  return shuffle(pairs);
}

export default CARD_ICONS;
