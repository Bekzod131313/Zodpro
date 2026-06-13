// ---------------------------------------------------------------------
// Reference coefficients (yiriklashtirilgan muhandislik usuli asosida)
// ---------------------------------------------------------------------

const WALL_U = {
  yaxshi: 0.35,
  ortacha: 0.6,
  yomon: 1.2,
};

const WINDOW_U = {
  uch_qavat: 1.4,
  ikki_qavat: 2.2,
  bitta_qavat: 5.0,
};

const ROOF_U = {
  izolyatsiyali: 0.3,
  izolyatsiyasiz: 1.2,
};

const FLOOR_U = {
  izolyatsiyali: 0.4,
  izolyatsiyasiz: 1.0,
};

const DOOR_U = 2.0; // tashqi eshik uchun taxminiy issiqlik o'tkazuvchanlik

const ROOM_TEMP = {
  yashash: 22,
  yotoqxona: 20,
  oshxona: 19,
  hammom: 24,
  dahliz: 18,
  boshqa: 20,
};

const INFILTRATION_FACTOR = 0.1; // shamollatish/teshiklar uchun qo'shimcha zahira
const HEAT_LOSS_MARGIN = 1.1; // radiator tanlashda zahira
const BOILER_MARGIN = 1.15; // qozon quvvatini tanlashda zahira
const FLOOR_HEATING_MAX_OUTPUT = 100; // W/m2, issiq polning amaliy maksimal quvvati

const BOYLER_SIZES = [50, 80, 100, 120, 150, 200, 300]; // litr
const EXPANSION_TANK_SIZES = [5, 8, 12, 18, 24, 35, 50, 80, 100, 150, 200]; // litr

const RADIATOR_SECTION_VOLUME = 0.3; // litr, har bir seksiya uchun taxminiy suv hajmi
const PIPEWORK_PER_SECTION = 1.0; // litr, radiator quvurlari uchun taxminiy zahira
const FLOOR_PIPE_VOLUME_PER_METER = 0.11; // litr/metr (16-20mm quvur)
const BOILER_WATER_VOLUME = 3; // litr, qozon ichidagi suv hajmi

// ---------------------------------------------------------------------
// Room cards
// ---------------------------------------------------------------------

let roomCounter = 0;

function createRoomCard() {
  roomCounter += 1;
  const id = roomCounter;

  const card = document.createElement('div');
  card.className = 'room-card';
  card.dataset.id = String(id);

  card.innerHTML = `
    <div class="room-header">
      <h4>Xona ${id}</h4>
      <button type="button" class="btn-remove">O'chirish</button>
    </div>
    <div class="grid">
      <label>Xona nomi
        <input type="text" class="room-name" value="Xona ${id}">
      </label>
      <label>Xona turi (ichki harorat)
        <select class="room-type">
          <option value="yashash">Yashash xonasi / Mehmonxona (22°C)</option>
          <option value="yotoqxona" selected>Yotoqxona (20°C)</option>
          <option value="oshxona">Oshxona (19°C)</option>
          <option value="hammom">Hammom / Vannaxona (24°C)</option>
          <option value="dahliz">Dahliz / Koridor (18°C)</option>
          <option value="boshqa">Boshqa (20°C)</option>
        </select>
      </label>
      <label>Uzunligi (m)
        <input type="number" class="room-length" value="4" step="0.1" min="0">
      </label>
      <label>Kengligi (m)
        <input type="number" class="room-width" value="3" step="0.1" min="0">
      </label>
      <label>Balandligi (m)
        <input type="number" class="room-height" value="2.8" step="0.1" min="0">
      </label>
      <label>Tashqi devor uzunligi (m)
        <input type="number" class="room-extwall" value="4" step="0.1" min="0">
      </label>
      <label>Deraza maydoni (m²)
        <input type="number" class="room-window" value="1.5" step="0.1" min="0">
      </label>
      <label>Tashqi eshik maydoni (m²)
        <input type="number" class="room-door" value="0" step="0.1" min="0">
      </label>
      <label>Qavat joylashuvi
        <select class="room-floorpos">
          <option value="ground">Yer qavat (poli tashqariga)</option>
          <option value="middle" selected>Oraliq qavat</option>
          <option value="top">Tom osti qavat</option>
          <option value="ground_top">Bir qavatli (pol va tom ham tashqi)</option>
        </select>
      </label>
      <label>Isitish turi
        <select class="room-heating">
          <option value="radiator" selected>Radiator</option>
          <option value="floor">Issiq pol</option>
          <option value="both">Radiator + Issiq pol</option>
        </select>
      </label>
    </div>
  `;

  card.querySelector('.btn-remove').addEventListener('click', () => card.remove());

  return card;
}

function addRoom() {
  const roomList = document.getElementById('roomList');
  roomList.appendChild(createRoomCard());
}

// ---------------------------------------------------------------------
// Reading inputs
// ---------------------------------------------------------------------

function byId(id) {
  return document.getElementById(id);
}

function readSettings() {
  return {
    outdoorTemp: parseFloat(byId('outdoorTemp').value) || 0,
    wallType: byId('wallType').value,
    windowType: byId('windowType').value,
    roofType: byId('roofType').value,
    floorType: byId('floorType').value,
    systemDeltaT: parseFloat(byId('systemDeltaT').value) || 70,
    sectionPower: parseFloat(byId('sectionPower').value) || 180,
    pipeStep: (parseFloat(byId('pipeStep').value) || 20) / 100, // sm -> m
    manifoldDistance: parseFloat(byId('manifoldDistance').value) || 0,
    dhwType: byId('dhwType').value,
    residents: parseInt(byId('residents').value, 10) || 1,
    gasCalorific: parseFloat(byId('gasCalorific').value) || 9.3,
    boilerEfficiency: (parseFloat(byId('boilerEfficiency').value) || 90) / 100,
    heatingDays: parseInt(byId('heatingDays').value, 10) || 120,
    loadFactor: parseFloat(byId('loadFactor').value) || 0.5,
  };
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
    heatingType: card.querySelector('.room-heating').value,
  }));
}

// ---------------------------------------------------------------------
// Calculations
// ---------------------------------------------------------------------

function calcHeatLoss(room, settings) {
  const area = room.length * room.width;
  const indoorTemp = ROOM_TEMP[room.roomType] ?? 20;
  const dT = Math.max(0, indoorTemp - settings.outdoorTemp);

  const extWallGross = room.extWallLength * room.height;
  const extWallNet = Math.max(0, extWallGross - room.windowArea - room.doorArea);

  let q = WALL_U[settings.wallType] * extWallNet * dT;
  q += WINDOW_U[settings.windowType] * room.windowArea * dT;
  q += DOOR_U * room.doorArea * dT;

  if (room.floorPosition === 'ground' || room.floorPosition === 'ground_top') {
    q += FLOOR_U[settings.floorType] * area * dT;
  }
  if (room.floorPosition === 'top' || room.floorPosition === 'ground_top') {
    q += ROOF_U[settings.roofType] * area * dT;
  }

  q *= 1 + INFILTRATION_FACTOR;

  return { area, q };
}

function calcRadiatorSections(heatLoadW, settings) {
  if (heatLoadW <= 0) return 0;
  const deltaTFactor = Math.pow(settings.systemDeltaT / 70, 1.3);
  const sectionOutput = settings.sectionPower * deltaTFactor;
  return Math.ceil((heatLoadW * HEAT_LOSS_MARGIN) / sectionOutput);
}

function calcFloorHeating(area, settings) {
  const pipeLength = area / settings.pipeStep + settings.manifoldDistance * 2;
  const maxOutput = area * FLOOR_HEATING_MAX_OUTPUT;
  return { pipeLength, maxOutput };
}

function processRoom(room, settings) {
  const { area, q } = calcHeatLoss(room, settings);

  let sections = 0;
  let pipeLength = 0;
  let note = '';

  const wantsFloor = room.heatingType === 'floor' || room.heatingType === 'both';
  const wantsRadiator = room.heatingType === 'radiator' || room.heatingType === 'both';

  if (wantsFloor && area > 0) {
    const floor = calcFloorHeating(area, settings);
    pipeLength = floor.pipeLength;

    let remainingLoad = q;
    if (room.heatingType === 'both') {
      remainingLoad = Math.max(0, q - floor.maxOutput);
    } else if (q > floor.maxOutput) {
      note = `Issiq pol yetarli emas (max ${Math.round(floor.maxOutput)} Vt), radiator qo'shing`;
      remainingLoad = 0;
    } else {
      remainingLoad = 0;
    }

    if (wantsRadiator) {
      sections = calcRadiatorSections(remainingLoad, settings);
    }
  } else if (wantsRadiator) {
    sections = calcRadiatorSections(q, settings);
  }

  return { ...room, area, q, sections, pipeLength, note };
}

function roundUpToStandard(value, sizes) {
  for (const size of sizes) {
    if (value <= size) return size;
  }
  return sizes[sizes.length - 1];
}

function recommendBoiler(boilerKW, dhwType) {
  let base;
  if (boilerKW <= 24) {
    base = "Devorga osma turdagi gazli qozon (≈24 kVt gacha)";
  } else if (boilerKW <= 35) {
    base = "Devorga osma (yuqori quvvatli) yoki kichik yerga o'rnatiladigan gazli qozon";
  } else if (boilerKW <= 60) {
    base = "Yerga o'rnatiladigan po'lat/chuyan gazli qozon";
  } else {
    base = "Sanoat turdagi qozon yoki bir nechta qozon kaskadi (kaskad tizimi)";
  }

  if (dhwType === 'kombi') {
    base += " — ikki konturli (kombi) qozon tanlang";
  } else if (dhwType === 'boyler') {
    base += " — bir konturli qozon + alohida boyler (akkumulyatsion suv isitgich)";
  }

  return base;
}

function calculateSummary(roomResults, settings) {
  const totalQ = roomResults.reduce((sum, r) => sum + r.q, 0);
  const totalSections = roomResults.reduce((sum, r) => sum + r.sections, 0);
  const totalFloorPipe = roomResults.reduce((sum, r) => sum + r.pipeLength, 0);

  let boilerW = totalQ * BOILER_MARGIN;
  if (settings.dhwType === 'boyler') {
    boilerW *= 1.15;
  } else if (settings.dhwType === 'kombi') {
    boilerW *= 1.4;
  }
  const boilerKW = boilerW / 1000;

  let boylerVolume = null;
  if (settings.dhwType === 'boyler') {
    boylerVolume = roundUpToStandard(settings.residents * 40, BOYLER_SIZES);
  }

  const systemVolume =
    totalSections * RADIATOR_SECTION_VOLUME +
    totalSections * PIPEWORK_PER_SECTION +
    totalFloorPipe * FLOOR_PIPE_VOLUME_PER_METER +
    BOILER_WATER_VOLUME;

  const expansionTank = roundUpToStandard(systemVolume * 0.08, EXPANSION_TANK_SIZES);

  const gasPerHour = boilerKW / (settings.gasCalorific * settings.boilerEfficiency);
  const gasPerMonth = gasPerHour * 24 * settings.loadFactor * 30;
  const gasPerSeason = gasPerHour * 24 * settings.loadFactor * settings.heatingDays;

  return {
    totalQ,
    totalSections,
    totalFloorPipe,
    boilerKW,
    boilerType: recommendBoiler(boilerKW, settings.dhwType),
    boylerVolume,
    systemVolume,
    expansionTank,
    gasPerHour,
    gasPerMonth,
    gasPerSeason,
  };
}

// ---------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------

function fmt(value, decimals = 1) {
  return value.toLocaleString('ru-RU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function renderRoomResults(roomResults) {
  const tbody = document.querySelector('#roomResults tbody');
  tbody.innerHTML = '';

  roomResults.forEach((r) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.name}</td>
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

function renderSummary(summary) {
  const grid = document.getElementById('summaryGrid');
  grid.innerHTML = '';

  grid.appendChild(
    summaryItem('Umumiy issiqlik yo\'qotish', `${fmt(summary.totalQ / 1000, 2)} kVt`)
  );
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
      summaryItem(
        'Boyler (suv isitgich) hajmi',
        `${summary.boylerVolume} litr`,
        `${byId('residents').value} kishi uchun`
      )
    );
  }

  grid.appendChild(
    summaryItem(
      "Kengayish bagi (rasshirbak)",
      `${summary.expansionTank} litr`,
      `Tizimdagi taxminiy suv hajmi ≈ ${fmt(summary.systemVolume, 1)} litr`
    )
  );

  grid.appendChild(
    summaryItem('Jami radiator seksiyalari', `${summary.totalSections} ta`)
  );

  if (summary.totalFloorPipe > 0) {
    grid.appendChild(
      summaryItem("Jami issiq pol quvuri", `${fmt(summary.totalFloorPipe, 1)} m`)
    );
  }

  grid.appendChild(
    summaryItem(
      'Gaz sarfi (to\'liq quvvatda)',
      `${fmt(summary.gasPerHour, 2)} m³/soat`
    )
  );
  grid.appendChild(
    summaryItem(
      'Taxminiy oylik gaz sarfi',
      `${fmt(summary.gasPerMonth, 0)} m³/oy`,
      `Yuklanish koeffitsienti ${byId('loadFactor').value}`
    )
  );
  grid.appendChild(
    summaryItem(
      'Taxminiy mavsumiy gaz sarfi',
      `${fmt(summary.gasPerSeason, 0)} m³/mavsum`,
      `${byId('heatingDays').value} kunlik isitish mavsumi uchun`
    )
  );
}

// ---------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------

function calculate() {
  const settings = readSettings();
  const rooms = readRooms();

  const roomResults = rooms.map((room) => processRoom(room, settings));
  const summary = calculateSummary(roomResults, settings);

  renderRoomResults(roomResults);
  renderSummary(summary);

  byId('resultsSection').hidden = false;
  byId('resultsSection').scrollIntoView({ behavior: 'smooth' });
}

document.getElementById('addRoom').addEventListener('click', addRoom);
document.getElementById('calculate').addEventListener('click', calculate);

// Boshlang'ich holatda bir nechta xona qo'shamiz
addRoom();
addRoom();
