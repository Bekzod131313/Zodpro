// ---------------------------------------------------------------------
// Reference data (Uzbekiston sharoiti uchun taxminiy qiymatlar)
// ---------------------------------------------------------------------

const REGIONS = {
  toshkent: { name: "Toshkent", temp: -15 },
  andijon: { name: "Andijon", temp: -15 },
  fargona: { name: "Farg'ona", temp: -14 },
  namangan: { name: "Namangan", temp: -15 },
  samarqand: { name: "Samarqand", temp: -12 },
  buxoro: { name: "Buxoro", temp: -12 },
  navoiy: { name: "Navoiy", temp: -13 },
  jizzax: { name: "Jizzax", temp: -14 },
  sirdaryo: { name: "Sirdaryo", temp: -13 },
  qashqadaryo: { name: "Qashqadaryo", temp: -10 },
  surxondaryo: { name: "Surxondaryo", temp: -7 },
  xorazm: { name: "Xorazm", temp: -15 },
  qoraqalpogiston: { name: "Qoraqalpog'iston", temp: -19 },
  boshqa: { name: "Boshqa (qo'lda kiritish)", temp: -15 },
};

const WALL_TYPES = {
  gazoblok: { name: "Gazoblok + issiqlik izolyatsiya (U≈0.35)", u: 0.35 },
  gisht2: { name: "Pishiq g'isht, 2 qatlam ~50sm (U≈0.55)", u: 0.55 },
  gisht1: { name: "Pishiq g'isht, 1 qatlam ~25sm (U≈1.0)", u: 1.0 },
  panel: { name: "Yengil panel/shifer, izolyatsiyasiz (U≈1.4)", u: 1.4 },
};

const WINDOW_TYPES = {
  uch_qavat: { name: "3 qavatli plastik (U≈1.4)", u: 1.4 },
  ikki_qavat: { name: "2 qavatli plastik (U≈2.2)", u: 2.2 },
  bitta_qavat: { name: "Oddiy bitta qavat (U≈5.0)", u: 5.0 },
};

const ROOF_TYPES = {
  izolyatsiyali: { name: "Issiqlik izolyatsiyali (U≈0.3)", u: 0.3 },
  izolyatsiyasiz: { name: "Izolyatsiyasiz (U≈1.2)", u: 1.2 },
};

const FLOOR_TYPES = {
  izolyatsiyali: { name: "Issiqlik izolyatsiyali (U≈0.4)", u: 0.4 },
  izolyatsiyasiz: { name: "Izolyatsiyasiz (U≈1.0)", u: 1.0 },
};

const RADIATOR_TYPES = {
  aluminiy: { name: "Alyuminiy (≈180 Vt/seksiya)", power: 180 },
  bimetall: { name: "Bimetall (≈185 Vt/seksiya)", power: 185 },
  chuyan: { name: "Chuyan (≈145 Vt/seksiya)", power: 145 },
};

const ROOM_TYPES = {
  yashash: { name: "Yashash xonasi / Mehmonxona (22°C)", temp: 22 },
  yotoqxona: { name: "Yotoqxona (20°C)", temp: 20 },
  oshxona: { name: "Oshxona (19°C)", temp: 19 },
  hammom: { name: "Hammom / Vannaxona (24°C)", temp: 24 },
  dahliz: { name: "Dahliz / Koridor (18°C)", temp: 18 },
  ombor: { name: "Ombor / Yordamchi xona (14°C)", temp: 14 },
  boshqa: { name: "Boshqa (20°C)", temp: 20 },
};

const ORIENTATIONS = {
  aralash: { name: "Aralash / nomalum", factor: 0 },
  janubiy: { name: "Janubiy (quyosh tomon)", factor: -0.05 },
  shimoliy: { name: "Shimoliy (soya tomon)", factor: 0.05 },
  sharqiy: { name: "Sharqiy", factor: 0.03 },
  gharbiy: { name: "G'arbiy", factor: 0.03 },
};

const FLOOR_POSITIONS = {
  ground: "Yer qavat (poli tashqariga)",
  middle: "Oraliq qavat",
  top: "Tom osti qavat",
  ground_top: "Bir qavatli (pol va tom ham tashqi)",
};

const HEATING_TYPES = {
  radiator: "Radiator",
  floor: "Issiq pol",
  both: "Radiator + Issiq pol",
  none: "Isitilmaydi",
};

const SYSTEM_DELTA_T = {
  70: "Yuqori harorat (70/55, ΔT≈70)",
  60: "O'rtacha (60/45, ΔT≈60)",
  50: "Past harorat (50/40, ΔT≈50)",
  40: "Issiq pol rejimi (ΔT≈40)",
};

const DHW_TYPES = {
  yoq: "Kerak emas",
  boyler: "Boyler (akkumulyatsion suv isitgich)",
  kombi: "Kombi qozon (ikki konturli)",
};

const DOOR_U = 2.0; // tashqi eshik uchun taxminiy issiqlik o'tkazuvchanlik
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

const DEFAULT_SETTINGS = {
  region: 'toshkent',
  outdoorTemp: -15,
  wallType: 'gisht2',
  windowType: 'ikki_qavat',
  roofType: 'izolyatsiyali',
  floorType: 'izolyatsiyali',
  systemDeltaT: 70,
  radiatorType: 'aluminiy',
  sectionPower: 180,
  pipeStep: 20,
  manifoldDistance: 5,
  dhwType: 'boyler',
  residents: 4,
  gasCalorific: 9.3,
  boilerEfficiency: 90,
  heatingDays: 120,
  loadFactor: 0.5,
};

function defaultRoom(index) {
  return {
    name: `Xona ${index}`,
    roomType: 'yotoqxona',
    length: 4,
    width: 3,
    height: 2.8,
    extWallLength: 4,
    windowArea: 1.5,
    doorArea: 0,
    floorPosition: 'middle',
    orientation: 'aralash',
    heatingType: 'radiator',
  };
}
