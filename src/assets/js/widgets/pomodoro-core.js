const defaultConfig = { focus: 25 * 60, break: 5 * 60, off: 0, cycles: 4 };

const formatDuration = (seconds) => {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, '0');
  const remainder = String(safeSeconds % 60).padStart(2, '0');
  return `${minutes}:${remainder}`;
};

const capFor = (mode, config = defaultConfig) => (mode === 'break' ? config.break : config.focus);

export { defaultConfig, formatDuration, capFor };
