/**
 * localStorage helpers for persisting best scores per level.
 */

const PROGRESS_KEY = 'brainflip_progression_v2'; // changed key to reset cleanly

/**
 * Get current progression state
 */
export function getProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // fallback down below
  }
  
  // Default structure
  return {
    easy: { highestUnlocked: 1, stages: {} },
    medium: { highestUnlocked: 1, stages: {} },
    hard: { highestUnlocked: 1, stages: {} }
  };
}

/**
 * Save completion of a stage and its stats. 
 * Advances the highestUnlocked if they beat the latest one.
 */
export function saveProgress(levelKey, completedStage, score, moves, time) {
  const prog = getProgress();
  
  // Ensure the level key exists in case of corruption
  if (!prog[levelKey]) {
    prog[levelKey] = { highestUnlocked: 1, stages: {} };
  }
  
  const currentLevelObj = prog[levelKey];
  
  // Save or update stats for this specific stage. 
  // We only overwrite if score is higher, or if no stats exist yet.
  const prevStats = currentLevelObj.stages[completedStage];
  if (!prevStats || score > prevStats.score) {
    currentLevelObj.stages[completedStage] = { score, moves, time };
  }

  // Advance progression if they beat their highest unlocked stage
  let unlockedNew = false;
  if (completedStage >= currentLevelObj.highestUnlocked) {
    currentLevelObj.highestUnlocked = completedStage + 1;
    unlockedNew = true;
  }
  
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(prog));
  return unlockedNew;
}

/**
 * Get the theme preference.
 */
export function getTheme() {
  try {
    return localStorage.getItem('brainflip_theme') || 'dark';
  } catch {
    return 'dark';
  }
}

/**
 * Save theme preference.
 */
export function saveTheme(theme) {
  try {
    localStorage.setItem('brainflip_theme', theme);
  } catch { /* silent */ }
}
