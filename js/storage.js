// ---------------------------------------------------------------------
// Loyihalarni saqlash (localStorage)
// ---------------------------------------------------------------------

const STORAGE_KEY = 'zodpro_heating_v1';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw);
    if (!state || !state.projects || !state.activeId) return null;
    return state;
  } catch {
    return null;
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage mavjud emas yoki to'lib qolgan — sukut bo'yicha e'tiborsiz qoldiramiz
  }
}

function createDefaultProject(name) {
  return {
    name,
    settings: { ...DEFAULT_SETTINGS },
    rooms: [defaultRoom(1), defaultRoom(2)],
  };
}

function createInitialState() {
  const id = `p_${Date.now()}`;
  return {
    activeId: id,
    projects: { [id]: createDefaultProject('Loyiha 1') },
  };
}
