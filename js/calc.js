// ---------------------------------------------------------------------
// Hisoblash mexanizmi (yiriklashtirilgan muhandislik usuli asosida)
// ---------------------------------------------------------------------

function calcHeatLoss(room, settings) {
  const area = room.length * room.width;
  const indoorTemp = ROOM_TYPES[room.roomType]?.temp ?? 20;
  const dT = Math.max(0, indoorTemp - settings.outdoorTemp);

  const extWallGross = room.extWallLength * room.height;
  const extWallNet = Math.max(0, extWallGross - room.windowArea - room.doorArea);

  let q = WALL_TYPES[settings.wallType].u * extWallNet * dT;
  q += WINDOW_TYPES[settings.windowType].u * room.windowArea * dT;
  q += DOOR_U * room.doorArea * dT;

  if (room.floorPosition === 'ground' || room.floorPosition === 'ground_top') {
    q += FLOOR_TYPES[settings.floorType].u * area * dT;
  }
  if (room.floorPosition === 'top' || room.floorPosition === 'ground_top') {
    q += ROOF_TYPES[settings.roofType].u * area * dT;
  }

  const orientationFactor = ORIENTATIONS[room.orientation]?.factor ?? 0;
  q *= 1 + INFILTRATION_FACTOR + orientationFactor;

  return { area, q };
}

function calcRadiatorSections(heatLoadW, settings) {
  if (heatLoadW <= 0) return 0;
  const deltaTFactor = Math.pow(settings.systemDeltaT / 70, 1.3);
  const sectionOutput = settings.sectionPower * deltaTFactor;
  return Math.ceil((heatLoadW * HEAT_LOSS_MARGIN) / sectionOutput);
}

function calcFloorHeating(area, settings) {
  const step = settings.pipeStep / 100; // sm -> m
  const pipeLength = area / step + settings.manifoldDistance * 2;
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

    let remainingLoad = 0;
    if (room.heatingType === 'both') {
      remainingLoad = Math.max(0, q - floor.maxOutput);
    } else if (q > floor.maxOutput) {
      note = `Issiq pol yetarli emas (max ≈${Math.round(floor.maxOutput)} Vt)`;
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

  const gasPerHour = boilerKW / (settings.gasCalorific * (settings.boilerEfficiency / 100));
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
