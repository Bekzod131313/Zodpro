// ---------------------------------------------------------------------
// Holat (state) va saqlash
// ---------------------------------------------------------------------

let state = loadState() || createInitialState();
let lastResults = null;
let saveTimer = null;
let currentTab = 'settings';
let mainButtonHandler = null;

function byId(id) {
  return document.getElementById(id);
}

function currentProject() {
  return state.projects[state.activeId];
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

function fmt(value, decimals = 1) {
  return value.toLocaleString('ru-RU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function populateSelect(select, optionsObj) {
  select.innerHTML = '';
  Object.entries(optionsObj).forEach(([key, val]) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = typeof val === 'string' ? val : val.name;
    select.appendChild(opt);
  });
}

// ---------------------------------------------------------------------
// Sozlamalar formasi
// ---------------------------------------------------------------------

function loadSettingsForm(settings) {
  byId('region').value = settings.region;
  byId('outdoorTemp').value = settings.outdoorTemp;
  byId('wallType').value = settings.wallType;
  byId('windowType').value = settings.windowType;
  byId('roofType').value = settings.roofType;
  byId('floorType').value = settings.floorType;
  byId('systemDeltaT').value = settings.systemDeltaT;
  byId('radiatorType').value = settings.radiatorType;
  byId('sectionPower').value = settings.sectionPower;
  byId('pipeStep').value = settings.pipeStep;
  byId('manifoldDistance').value = settings.manifoldDistance;
  byId('dhwType').value = settings.dhwType;
  byId('residents').value = settings.residents;
  byId('gasCalorific').value = settings.gasCalorific;
  byId('boilerEfficiency').value = settings.boilerEfficiency;
  byId('heatingDays').value = settings.heatingDays;
  byId('loadFactor').value = settings.loadFactor;
}

function readSettingsForm() {
  return {
    region: byId('region').value,
    outdoorTemp: parseFloat(byId('outdoorTemp').value) || 0,
    wallType: byId('wallType').value,
    windowType: byId('windowType').value,
    roofType: byId('roofType').value,
    floorType: byId('floorType').value,
    systemDeltaT: parseFloat(byId('systemDeltaT').value) || 70,
    radiatorType: byId('radiatorType').value,
    sectionPower: parseFloat(byId('sectionPower').value) || 180,
    pipeStep: parseFloat(byId('pipeStep').value) || 20,
    manifoldDistance: parseFloat(byId('manifoldDistance').value) || 0,
    dhwType: byId('dhwType').value,
    residents: parseInt(byId('residents').value, 10) || 1,
    gasCalorific: parseFloat(byId('gasCalorific').value) || 9.3,
    boilerEfficiency: parseFloat(byId('boilerEfficiency').value) || 90,
    heatingDays: parseInt(byId('heatingDays').value, 10) || 120,
    loadFactor: parseFloat(byId('loadFactor').value) || 0.5,
  };
}

// ---------------------------------------------------------------------
// Xona kartalari
// ---------------------------------------------------------------------

function createRoomCard(room) {
  const card = document.createElement('div');
  card.className = 'room-card';
  card.innerHTML = `
    <div class="room-header">
      <input type="text" class="room-name">
      <button type="button" class="btn-remove" title="O'chirish">✕</button>
    </div>
    <div class="grid">
      <label>Xona turi (ichki harorat)
        <select class="room-type"></select>
      </label>
      <label>Uzunligi (m)
        <input type="number" class="room-length" step="0.1" min="0">
      </label>
      <label>Kengligi (m)
        <input type="number" class="room-width" step="0.1" min="0">
      </label>
      <label>Balandligi (m)
        <input type="number" class="room-height" step="0.1" min="0">
      </label>
      <label>Tashqi devor uzunligi (m)
        <input type="number" class="room-extwall" step="0.1" min="0">
      </label>
      <label>Deraza maydoni (m²)
        <input type="number" class="room-window" step="0.1" min="0">
      </label>
      <label>Tashqi eshik maydoni (m²)
        <input type="number" class="room-door" step="0.1" min="0">
      </label>
      <label>Qavat joylashuvi
        <select class="room-floorpos"></select>
      </label>
      <label>Devor yo'nalishi
        <select class="room-orientation"></select>
      </label>
      <label>Isitish turi
        <select class="room-heating"></select>
      </label>
    </div>
  `;

  populateSelect(card.querySelector('.room-type'), ROOM_TYPES);
  populateSelect(card.querySelector('.room-floorpos'), FLOOR_POSITIONS);
  populateSelect(card.querySelector('.room-orientation'), ORIENTATIONS);
  populateSelect(card.querySelector('.room-heating'), HEATING_TYPES);

  card.querySelector('.room-name').value = room.name;
  card.querySelector('.room-type').value = room.roomType;
  card.querySelector('.room-length').value = room.length;
  card.querySelector('.room-width').value = room.width;
  card.querySelector('.room-height').value = room.height;
  card.querySelector('.room-extwall').value = room.extWallLength;
  card.querySelector('.room-window').value = room.windowArea;
  card.querySelector('.room-door').value = room.doorArea;
  card.querySelector('.room-floorpos').value = room.floorPosition;
  card.querySelector('.room-orientation').value = room.orientation;
  card.querySelector('.room-heating').value = room.heatingType;

  card.querySelector('.btn-remove').addEventListener('click', () => {
    card.remove();
    scheduleSave();
  });

  card.addEventListener('input', scheduleSave);
  card.addEventListener('change', scheduleSave);

  return card;
}

function renderRooms(rooms) {
  const roomList = byId('roomList');
  roomList.innerHTML = '';
  rooms.forEach((room) => roomList.appendChild(createRoomCard(room)));
}

function readRooms() {
  return Array.from(document.querySelectorAll('.room-card')).map((card) => ({
    name: card.querySelector('.room-name').value || 'Xona',
    roomType: card.querySelector('.room-type').value,
    length: parseFloat(card.querySelector('.room-length').value) || 0,
    width: parseFloat(card.querySelector('.room-width').value) || 0,
    height: parseFloat(card.querySelector('.room-height').value) || 0,
    extWallLength: parseFloat(card.querySelector('.room-extwall').value) || 0,
    windowArea: parseFloat(card.querySelector('.room-window').value) || 0,
    doorArea: parseFloat(card.querySelector('.room-door').value) || 0,
    floorPosition: card.querySelector('.room-floorpos').value,
    orientation: card.querySelector('.room-orientation').value,
    heatingType: card.querySelector('.room-heating').value,
  }));
}

function addRoom() {
  const rooms = readRooms();
  byId('roomList').appendChild(createRoomCard(defaultRoom(rooms.length + 1)));
  scheduleSave();
}

// ---------------------------------------------------------------------
// Natijalarni chiqarish
// ---------------------------------------------------------------------

function renderRoomResults(roomResults) {
  const tbody = document.querySelector('#roomResults tbody');
  tbody.innerHTML = '';

  roomResults.forEach((r) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(r.name)}</td>
      <td>${fmt(r.area, 1)}</td>
      <td>${fmt(r.q, 0)}</td>
      <td>${r.sections > 0 ? r.sections : '—'}</td>
      <td>${r.pipeLength > 0 ? fmt(r.pipeLength, 1) : '—'}</td>
      <td class="${r.note ? 'cell-warn' : ''}">${r.note || '—'}</td>
    `;
    tbody.appendChild(tr);
  });
}

function summaryItem(label, value, desc) {
  const div = document.createElement('div');
  div.className = 'summary-item';
  div.innerHTML = `
    <div class="label">${label}</div>
    <div class="value">${value}</div>
    ${desc ? `<div class="desc">${desc}</div>` : ''}
  `;
  return div;
}

function renderSummary(summary, settings) {
  const grid = byId('summaryGrid');
  grid.innerHTML = '';

  grid.appendChild(summaryItem("Umumiy issiqlik yo'qotish", `${fmt(summary.totalQ / 1000, 2)} kVt`));
  grid.appendChild(
    summaryItem(
      'Tavsiya etilgan qozon quvvati',
      `${fmt(summary.boilerKW, 1)} kVt`,
      'Zahira va issiq suv ehtiyojini hisobga olgan holda'
    )
  );
  grid.appendChild(summaryItem('Qozon turi', summary.boilerType));

  if (summary.boylerVolume) {
    grid.appendChild(
      summaryItem('Boyler (suv isitgich) hajmi', `${summary.boylerVolume} litr`, `${settings.residents} kishi uchun`)
    );
  }

  grid.appendChild(
    summaryItem(
      'Kengayish bagi (rasshirbak)',
      `${summary.expansionTank} litr`,
      `Tizimdagi taxminiy suv hajmi ≈ ${fmt(summary.systemVolume, 1)} litr`
    )
  );

  grid.appendChild(summaryItem('Jami radiator seksiyalari', `${summary.totalSections} ta`));

  if (summary.totalFloorPipe > 0) {
    grid.appendChild(summaryItem('Jami issiq pol quvuri', `${fmt(summary.totalFloorPipe, 1)} m`));
  }

  grid.appendChild(summaryItem("Gaz sarfi (to'liq quvvatda)", `${fmt(summary.gasPerHour, 2)} m³/soat`));
  grid.appendChild(
    summaryItem('Taxminiy oylik gaz sarfi', `${fmt(summary.gasPerMonth, 0)} m³/oy`, `Yuklanish koeffitsienti ${settings.loadFactor}`)
  );
  grid.appendChild(
    summaryItem(
      'Taxminiy mavsumiy gaz sarfi',
      `${fmt(summary.gasPerSeason, 0)} m³/mavsum`,
      `${settings.heatingDays} kunlik isitish mavsumi uchun`
    )
  );
}

function clearResults() {
  lastResults = null;
  document.querySelector('#roomResults tbody').innerHTML = '';
  byId('summaryGrid').innerHTML = '';
  byId('emptyResultsHint').hidden = false;
}

function calculate() {
  const settings = readSettingsForm();
  const rooms = readRooms();
  const roomResults = rooms.map((room) => processRoom(room, settings));
  const summary = calculateSummary(roomResults, settings);

  lastResults = { settings, rooms: roomResults, summary, projectName: currentProject().name };

  renderRoomResults(roomResults);
  renderSummary(summary, settings);
  byId('emptyResultsHint').hidden = true;

  persistCurrentFormState();
  saveState(state);
}

// ---------------------------------------------------------------------
// Hisobotni chop etish / PDF
// ---------------------------------------------------------------------

function printReport() {
  if (!lastResults) {
    calculate();
  }

  const { settings, rooms, summary, projectName } = lastResults;
  const date = new Date().toLocaleDateString('uz-UZ');

  const rows = rooms
    .map(
      (r) => `
      <tr>
        <td>${escapeHtml(r.name)}</td>
        <td>${fmt(r.area, 1)}</td>
        <td>${fmt(r.q, 0)}</td>
        <td>${r.sections > 0 ? r.sections : '—'}</td>
        <td>${r.pipeLength > 0 ? fmt(r.pipeLength, 1) : '—'}</td>
      </tr>`
    )
    .join('');

  const summaryRows = [
    ["Umumiy issiqlik yo'qotish", `${fmt(summary.totalQ / 1000, 2)} kVt`],
    ['Tavsiya etilgan qozon quvvati', `${fmt(summary.boilerKW, 1)} kVt`],
    ['Qozon turi', summary.boilerType],
    summary.boylerVolume
      ? ['Boyler (suv isitgich) hajmi', `${summary.boylerVolume} litr (${settings.residents} kishi uchun)`]
      : null,
    ['Kengayish bagi (rasshirbak)', `${summary.expansionTank} litr`],
    ['Jami radiator seksiyalari', `${summary.totalSections} ta`],
    summary.totalFloorPipe > 0 ? ['Jami issiq pol quvuri', `${fmt(summary.totalFloorPipe, 1)} m`] : null,
    ["Gaz sarfi (to'liq quvvatda)", `${fmt(summary.gasPerHour, 2)} m³/soat`],
    ['Taxminiy oylik gaz sarfi', `${fmt(summary.gasPerMonth, 0)} m³/oy`],
    ['Taxminiy mavsumiy gaz sarfi', `${fmt(summary.gasPerSeason, 0)} m³/mavsum`],
  ]
    .filter(Boolean)
    .map(([label, value]) => `<tr><td>${label}</td><td>${value}</td></tr>`)
    .join('');

  byId('printReport').innerHTML = `
    <h1>Isitish tizimini hisoblash — Hisobot</h1>
    <p><strong>Loyiha:</strong> ${escapeHtml(projectName)} &nbsp; <strong>Sana:</strong> ${date}</p>
    <p><strong>Hudud:</strong> ${escapeHtml(REGIONS[settings.region]?.name ?? '')} &nbsp; <strong>Tashqi hisoblash harorati:</strong> ${settings.outdoorTemp}°C</p>

    <h2>Xonalar bo'yicha</h2>
    <table>
      <thead>
        <tr><th>Xona</th><th>Maydon (m²)</th><th>Issiqlik yo'qotish (Vt)</th><th>Radiator (seksiya)</th><th>Issiq pol (m)</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <h2>Umumiy natija</h2>
    <table>
      <tbody>${summaryRows}</tbody>
    </table>
  `;

  window.print();
}

// ---------------------------------------------------------------------
// Modal oynalar (prompt / confirm / alert o'rnida)
// ---------------------------------------------------------------------

function showModal({ title, input = false, defaultValue = '', okText = 'OK', cancelText = 'Bekor qilish', showCancel = true }) {
  return new Promise((resolve) => {
    const overlay = byId('modalOverlay');
    const titleEl = byId('modalTitle');
    const inputEl = byId('modalInput');
    const okBtn = byId('modalOk');
    const cancelBtn = byId('modalCancel');

    titleEl.textContent = title;
    inputEl.style.display = input ? 'block' : 'none';
    inputEl.value = defaultValue;
    okBtn.textContent = okText;
    cancelBtn.style.display = showCancel ? 'inline-block' : 'none';
    cancelBtn.textContent = cancelText;

    overlay.classList.remove('hidden');
    if (input) {
      inputEl.focus();
      inputEl.select();
    }

    function cleanup(result) {
      overlay.classList.add('hidden');
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
      inputEl.removeEventListener('keydown', onKeydown);
      resolve(result);
    }

    function onOk() {
      cleanup(input ? inputEl.value.trim() : true);
    }
    function onCancel() {
      cleanup(input ? null : false);
    }
    function onKeydown(e) {
      if (e.key === 'Enter') onOk();
      if (e.key === 'Escape') onCancel();
    }

    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
    inputEl.addEventListener('keydown', onKeydown);
  });
}

function showPrompt(title, defaultValue = '') {
  return showModal({ title, input: true, defaultValue });
}
function showConfirm(title) {
  return showModal({ title, input: false, okText: 'Ha', cancelText: "Yo'q" });
}
function showAlert(title) {
  return showModal({ title, input: false, okText: 'OK', showCancel: false });
}

// ---------------------------------------------------------------------
// Loyihalarni boshqarish
// ---------------------------------------------------------------------

function renderProjectSelect() {
  const select = byId('projectSelect');
  select.innerHTML = '';
  Object.entries(state.projects).forEach(([id, project]) => {
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = project.name;
    select.appendChild(opt);
  });
  select.value = state.activeId;
}

function persistCurrentFormState() {
  const project = currentProject();
  if (!project) return;
  project.settings = readSettingsForm();
  project.rooms = readRooms();
}

function loadProjectIntoForm() {
  const project = currentProject();
  loadSettingsForm(project.settings);
  renderRooms(project.rooms);
  renderProjectSelect();
  clearResults();
}

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    persistCurrentFormState();
    saveState(state);
  }, 500);
}

async function switchProject(id) {
  if (id === state.activeId) return;
  persistCurrentFormState();
  state.activeId = id;
  loadProjectIntoForm();
  saveState(state);
}

async function newProject() {
  const count = Object.keys(state.projects).length + 1;
  const name = await showPrompt('Yangi loyiha nomi', `Loyiha ${count}`);
  if (!name) return;

  persistCurrentFormState();
  const id = `p_${Date.now()}`;
  state.projects[id] = createDefaultProject(name);
  state.activeId = id;
  loadProjectIntoForm();
  saveState(state);
}

async function renameProject() {
  const project = currentProject();
  const name = await showPrompt('Loyiha nomi', project.name);
  if (!name) return;

  project.name = name;
  renderProjectSelect();
  saveState(state);
}

async function deleteProject() {
  const ids = Object.keys(state.projects);
  if (ids.length <= 1) {
    await showAlert("Kamida bitta loyiha bo'lishi kerak.");
    return;
  }

  const confirmed = await showConfirm(`"${currentProject().name}" loyihasini o'chirishni tasdiqlaysizmi?`);
  if (!confirmed) return;

  delete state.projects[state.activeId];
  state.activeId = Object.keys(state.projects)[0];
  loadProjectIntoForm();
  saveState(state);
}

// ---------------------------------------------------------------------
// Tablar va asosiy tugma
// ---------------------------------------------------------------------

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  document.querySelectorAll('.tab-pane').forEach((pane) => {
    pane.classList.toggle('active', pane.id === `tab-${tab}`);
  });
  updateMainAction();
}

function updateMainAction() {
  const btn = byId('mainAction');
  let text;
  let handler;

  if (currentTab === 'results') {
    text = "🖨️ Hisobotni chop etish / PDF";
    handler = () => printReport();
  } else {
    text = 'Hisoblash';
    handler = () => {
      calculate();
      switchTab('results');
    };
  }

  btn.textContent = text;
  btn.onclick = () => {
    hapticTap();
    handler();
  };

  if (tg && tg.MainButton) {
    if (mainButtonHandler) tg.MainButton.offClick(mainButtonHandler);
    mainButtonHandler = () => {
      hapticTap();
      handler();
    };
    tg.MainButton.setText(text);
    tg.MainButton.onClick(mainButtonHandler);
    tg.MainButton.show();
  }
}

// ---------------------------------------------------------------------
// Ishga tushirish
// ---------------------------------------------------------------------

function init() {
  populateSelect(byId('region'), REGIONS);
  populateSelect(byId('wallType'), WALL_TYPES);
  populateSelect(byId('windowType'), WINDOW_TYPES);
  populateSelect(byId('roofType'), ROOF_TYPES);
  populateSelect(byId('floorType'), FLOOR_TYPES);
  populateSelect(byId('systemDeltaT'), SYSTEM_DELTA_T);
  populateSelect(byId('radiatorType'), RADIATOR_TYPES);
  populateSelect(byId('dhwType'), DHW_TYPES);

  renderProjectSelect();
  loadProjectIntoForm();

  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  byId('addRoom').addEventListener('click', addRoom);
  byId('printBtn').addEventListener('click', printReport);

  byId('projectSelect').addEventListener('change', (e) => switchProject(e.target.value));
  byId('newProjectBtn').addEventListener('click', newProject);
  byId('renameProjectBtn').addEventListener('click', renameProject);
  byId('deleteProjectBtn').addEventListener('click', deleteProject);

  byId('region').addEventListener('change', (e) => {
    const region = REGIONS[e.target.value];
    if (region) byId('outdoorTemp').value = region.temp;
  });

  byId('radiatorType').addEventListener('change', (e) => {
    const radiator = RADIATOR_TYPES[e.target.value];
    if (radiator) byId('sectionPower').value = radiator.power;
  });

  document.querySelectorAll('#tab-settings input, #tab-settings select').forEach((el) => {
    el.addEventListener('input', scheduleSave);
    el.addEventListener('change', scheduleSave);
  });

  initTelegram();
  if (tg) document.body.classList.add('in-telegram');

  updateMainAction();
}

document.addEventListener('DOMContentLoaded', init);
