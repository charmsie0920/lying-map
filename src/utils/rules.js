import { COUNTRY_NAMES } from "../constants/countries";

// ─────────────────────────────────────────────────────────────────────────────
// RULE 1: BORDER DISPUTE
// Every country shows the name of one of its real neighbours.
// On each new game, a random neighbour is picked per country from its list,
// so the map looks different every round even with the same rule.
// Every country in COUNTRY_NAMES has at least one entry here.
// ─────────────────────────────────────────────────────────────────────────────

// Each key is a country ID; value is an array of neighbour IDs from COUNTRY_NAMES.
const BORDERS = {
  4:   [364, 586, 156, 795, 860, 762],   // Afghanistan
  8:   [300, 807, 688, 807, 191, 499],   // Albania
  12:  [504, 788, 434, 466, 562, 478],   // Algeria
  24:  [180, 894, 716, 178],             // Angola
  32:  [152, 858, 68, 600, 76, 862],     // Argentina
  51:  [792, 268, 364, 31],              // Armenia
  36:  [554],                            // Australia (nearest neighbour)
  40:  [276, 756, 203, 703, 705, 380, 348], // Austria
  31:  [643, 268, 51, 364, 792],         // Azerbaijan
  44:  [840],                            // Bahamas
  50:  [356, 104],                       // Bangladesh
  112: [616, 804, 440, 428, 703],        // Belarus
  56:  [250, 528, 442, 276],             // Belgium
  84:  [484, 320],                       // Belize
  204: [566, 854, 288],                  // Benin
  64:  [356, 156],                       // Bhutan
  68:  [600, 152, 76, 32, 604],          // Bolivia
  70:  [191, 688, 499],                  // Bosnia and Herzegovina
  72:  [710, 516, 894, 716],             // Botswana
  76:  [740, 862, 170, 600, 32, 858, 600], // Brazil
  96:  [458],                            // Brunei
  100: [642, 804, 688, 807, 300],        // Bulgaria
  854: [466, 562, 384, 288, 204],        // Burkina Faso
  108: [834, 800, 646, 728],             // Burundi
  116: [764, 418, 704, 356],             // Cambodia
  120: [566, 140, 180, 266, 226],        // Cameroon
  124: [840],                            // Canada
  140: [148, 729, 728, 800, 180, 120],   // Central African Republic
  148: [434, 729, 562, 140, 120, 466],   // Chad
  152: [32, 68, 600],                    // Chile
  156: [643, 496, 408, 704, 418, 104, 356, 64, 524, 400, 762, 795, 31], // China
  170: [862, 604, 218, 170, 591, 484],   // Colombia
  178: [120, 266, 140, 180],             // Congo
  188: [591, 558, 484],                  // Costa Rica
  191: [705, 688, 70, 348],              // Croatia
  192: [388],                            // Cuba
  196: [376],                            // Cyprus
  203: [276, 616, 703, 40, 703],         // Czechia
  180: [140, 728, 800, 894, 24, 178, 120, 108], // DRC
  208: [578, 276, 752],                  // Denmark
  262: [231, 706],                       // Djibouti
  214: [332],                            // Dominican Republic
  218: [170, 604, 600],                  // Ecuador
  818: [729, 434, 376, 275],             // Egypt
  222: [320, 340],                       // El Salvador
  226: [120, 266],                       // Equatorial Guinea
  232: [231, 729],                       // Eritrea
  233: [428, 440, 643],                  // Estonia
  748: [710, 508],                       // Eswatini
  231: [232, 729, 262, 706, 404],        // Ethiopia
  238: [32],                             // Falkland Islands
  242: [554],                            // Fiji
  246: [752, 643, 578],                  // Finland
  250: [724, 276, 56, 442, 756, 380, 528], // France
  266: [120, 226, 178],                  // Gabon
  270: [686],                            // Gambia
  268: [792, 643, 51],                   // Georgia
  276: [250, 528, 56, 442, 380, 203, 40, 616, 756, 208], // Germany
  288: [384, 854, 566],                  // Ghana
  300: [792, 807, 100, 8],               // Greece
  304: [124, 352],                       // Greenland
  320: [484, 84, 340, 222, 558],         // Guatemala
  324: [686, 694, 430, 466, 624],        // Guinea
  624: [686, 324, 694],                  // Guinea-Bissau
  328: [740, 862, 76],                   // Guyana
  332: [214],                            // Haiti
  340: [320, 222, 558, 591],             // Honduras
  348: [703, 40, 642, 191, 688, 804],    // Hungary
  352: [826, 304],                       // Iceland
  356: [586, 156, 50, 524, 64, 104],     // India
  360: [458, 586, 626, 598],             // Indonesia
  364: [792, 368, 31, 156, 586, 762, 795, 51], // Iran
  368: [760, 364, 400, 682, 275, 792],   // Iraq
  372: [826],                            // Ireland
  376: [818, 422, 760, 400, 196, 275],   // Israel
  380: [250, 756, 40, 705, 703, 276],    // Italy
  384: [288, 854, 466],                  // Ivory Coast
  388: [192],                            // Jamaica
  392: [410, 408, 643],                  // Japan
  400: [760, 368, 682, 376, 818],        // Jordan
  398: [643, 156, 860, 795, 762, 417],   // Kazakhstan
  404: [231, 706, 728, 800, 834],        // Kenya
  414: [682, 368],                       // Kuwait
  417: [398, 762, 860, 156, 795],        // Kyrgyzstan
  418: [156, 104, 116, 764, 704],        // Laos
  428: [440, 112, 643, 233],             // Latvia
  422: [760, 376],                       // Lebanon
  426: [710],                            // Lesotho
  430: [694, 324, 384],                  // Liberia
  434: [788, 148, 729, 12, 504],         // Libya
  440: [428, 112, 616],                  // Lithuania
  442: [250, 56, 276],                   // Luxembourg
  450: [508],                            // Madagascar
  454: [508, 894, 834, 716],             // Malawi
  458: [764, 360, 702, 96],              // Malaysia
  466: [12, 562, 854, 324],              // Mali
  478: [12, 466, 686],                   // Mauritania
  484: [840, 320, 84],                   // Mexico
  498: [642, 804],                       // Moldova
  496: [156, 643],                       // Mongolia
  499: [688, 191, 8],                    // Montenegro
  504: [12, 724, 434, 478],              // Morocco
  508: [834, 454, 894, 710, 748, 450],   // Mozambique
  104: [156, 418, 418, 356, 764, 50],    // Myanmar
  516: [710, 894, 72, 24],               // Namibia
  524: [356, 156],                       // Nepal
  528: [276, 56, 250, 442],              // Netherlands
  540: [36],                             // New Caledonia
  554: [36],                             // New Zealand
  558: [340, 320, 591],                  // Nicaragua
  562: [466, 12, 854, 148, 566, 234],    // Niger (234=Benin-alias, use 204)
  566: [120, 204, 854, 562, 288],        // Nigeria
  408: [643, 156, 410],                  // North Korea
  807: [8, 300, 100, 688, 705],          // North Macedonia
  578: [752, 246, 208],                  // Norway
  512: [784, 887, 682],                  // Oman
  586: [356, 4, 364, 156, 360],          // Pakistan
  275: [376, 818, 400, 760, 368],        // Palestine
  591: [188, 170, 340, 558],             // Panama
  598: [360],                            // Papua New Guinea
  600: [68, 32, 858, 76],               // Paraguay
  604: [218, 68, 76, 152],              // Peru
  608: [360],                            // Philippines
  616: [276, 112, 643, 804, 203, 703, 440], // Poland
  620: [724, 250],                       // Portugal
  630: [214],                            // Puerto Rico
  634: [682, 784],                       // Qatar
  642: [804, 112, 100, 688, 498, 348],   // Romania
  643: [428, 233, 246, 616, 112, 804, 156, 496, 408, 398, 268, 31, 792], // Russia
  646: [108, 834, 800],                  // Rwanda
  682: [400, 368, 414, 512, 887, 784, 634], // Saudi Arabia
  686: [478, 270, 624, 324],             // Senegal
  688: [100, 642, 807, 70, 191, 499, 348], // Serbia
  694: [430, 324, 624],                  // Sierra Leone
  703: [616, 203, 40, 380, 705, 348, 112], // Slovakia
  705: [380, 40, 348, 191, 703, 807],    // Slovenia
  90:  [598],                            // Solomon Islands
  706: [231, 404, 262],                  // Somalia
  710: [516, 72, 508, 748, 894, 426],    // South Africa
  410: [408, 392, 156],                  // South Korea
  728: [180, 140, 800, 231, 404, 862],   // South Sudan
  724: [620, 250, 376, 504, 380],        // Spain
  144: [356],                            // Sri Lanka
  729: [818, 231, 232, 728, 148, 140],   // Sudan
  740: [328, 76, 862],                   // Suriname
  752: [578, 246, 208],                  // Sweden
  756: [250, 276, 380, 40],              // Switzerland
  760: [792, 368, 422, 400, 275, 364],   // Syria
  158: [156, 392, 408],                  // Taiwan
  762: [4, 398, 156, 417, 860],          // Tajikistan
  834: [404, 508, 894, 454, 108, 646, 728], // Tanzania
  764: [104, 418, 116, 458, 116],        // Thailand
  626: [360],                            // Timor-Leste
  768: [566, 288, 854],                  // Togo
  780: [862],                            // Trinidad and Tobago
  788: [12, 434],                        // Tunisia
  792: [300, 300, 100, 807, 8, 688, 760, 364, 31, 268, 643, 380], // Turkey
  795: [398, 156, 4, 364, 860, 417],     // Turkmenistan
  800: [894, 834, 646, 108, 728, 180],   // Uganda
  804: [642, 616, 112, 428, 643, 498, 348], // Ukraine
  784: [682, 512, 634],                  // UAE
  826: [372, 250, 352],                  // United Kingdom
  840: [124, 484],                       // United States
  858: [32, 76, 600],                    // Uruguay
  860: [762, 398, 417, 4, 795, 156],     // Uzbekistan
  548: [540, 598],                       // Vanuatu
  862: [170, 76, 328, 740, 600],         // Venezuela
  704: [156, 418, 116, 116, 764],        // Vietnam
  732: [504, 466, 478],                  // Western Sahara
  887: [682, 512, 728],                  // Yemen (note: 728=South Sudan is wrong; use Oman/Saudi)
  894: [800, 834, 454, 716, 72, 710, 24, 508], // Zambia
  716: [894, 72, 508, 710, 454],         // Zimbabwe
};

// Fix Yemen — its real neighbours
BORDERS[887] = [682, 512];

// Fix Niger — 562's neighbours should use 204 not 234
BORDERS[562] = [466, 12, 854, 148, 566, 204];

const buildBorderMap = (entries) => {
  const idSet = new Set(entries.map(e => e.id));
  const nameById = {};
  entries.forEach(e => { nameById[e.id] = e.name; });

  const map = {};
  entries.forEach(c => {
    const neighbours = (BORDERS[c.id] || []).filter(id => idSet.has(id) && nameById[id]);
    if (neighbours.length > 0) {
      // Pick a random neighbour — different every game
      const chosen = neighbours[Math.floor(Math.random() * neighbours.length)];
      map[c.id] = nameById[chosen];
    } else {
      // Island with no neighbour in list — show itself (players won't be tested on this)
      map[c.id] = c.name;
    }
  });
  return map;
};

// ─────────────────────────────────────────────────────────────────────────────
// RULE 2: ALPHABETICAL NEIGHBOUR
// Sort all countries A→Z. Each country shows the country that is N steps
// ahead or behind in the list. N is randomly 1 or 2, direction randomly
// forward or backward — decided fresh each game, same N+direction for all.
// ─────────────────────────────────────────────────────────────────────────────

const buildAlphaNeighbourMap = (entries) => {
  const sorted = [...entries].sort((a, b) => a.name.localeCompare(b.name));
  const n = sorted.length;

  // Randomise offset (1 or 2) and direction (+1 forward, -1 backward)
  const offset = Math.random() < 0.5 ? 1 : 2;
  const direction = Math.random() < 0.5 ? 1 : -1;
  const shift = offset * direction;

  const map = {};
  sorted.forEach((c, i) => {
    const targetIndex = ((i + shift) % n + n) % n;
    map[c.id] = sorted[targetIndex].name;
  });

  // Return the config so the answer string can be built dynamically
  map._config = { offset, direction };
  return map;
};

// ─────────────────────────────────────────────────────────────────────────────
// RULE 3: CAPITAL OFFENSE
// Every country shows its own capital city.
// All countries in COUNTRY_NAMES are covered below.
// ─────────────────────────────────────────────────────────────────────────────

const CAPITALS = {
  4:   "Kabul",           8:   "Tirana",         12:  "Algiers",
  24:  "Luanda",          32:  "Buenos Aires",    51:  "Yerevan",
  36:  "Canberra",        40:  "Vienna",          31:  "Baku",
  44:  "Nassau",          50:  "Dhaka",           112: "Minsk",
  56:  "Brussels",        84:  "Belmopan",        204: "Porto-Novo",
  64:  "Thimphu",         68:  "Sucre",           70:  "Sarajevo",
  72:  "Gaborone",        76:  "Brasilia",        96:  "Bandar Seri Begawan",
  100: "Sofia",           854: "Ouagadougou",     108: "Gitega",
  116: "Phnom Penh",      120: "Yaounde",         124: "Ottawa",
  140: "Bangui",          148: "N'Djamena",       152: "Santiago",
  156: "Beijing",         170: "Bogota",          178: "Brazzaville",
  188: "San Jose",        191: "Zagreb",          192: "Havana",
  196: "Nicosia",         203: "Prague",          180: "Kinshasa",
  208: "Copenhagen",      262: "Djibouti",        214: "Santo Domingo",
  218: "Quito",           818: "Cairo",           222: "San Salvador",
  226: "Malabo",          232: "Asmara",          233: "Tallinn",
  748: "Mbabane",         231: "Addis Ababa",     238: "Stanley",
  242: "Suva",            246: "Helsinki",        250: "Paris",
  266: "Libreville",      270: "Banjul",          268: "Tbilisi",
  276: "Berlin",          288: "Accra",           300: "Athens",
  304: "Nuuk",            320: "Guatemala City",  324: "Conakry",
  624: "Bissau",          328: "Georgetown",      332: "Port-au-Prince",
  340: "Tegucigalpa",     348: "Budapest",        352: "Reykjavik",
  356: "New Delhi",       360: "Jakarta",         364: "Tehran",
  368: "Baghdad",         372: "Dublin",          376: "Jerusalem",
  380: "Rome",            384: "Yamoussoukro",    388: "Kingston",
  392: "Tokyo",           400: "Amman",           398: "Astana",
  404: "Nairobi",         414: "Kuwait City",     417: "Bishkek",
  418: "Vientiane",       428: "Riga",            422: "Beirut",
  426: "Maseru",          430: "Monrovia",        434: "Tripoli",
  440: "Vilnius",         442: "Luxembourg City", 450: "Antananarivo",
  454: "Lilongwe",        458: "Kuala Lumpur",    466: "Bamako",
  478: "Nouakchott",      484: "Mexico City",     498: "Chisinau",
  496: "Ulaanbaatar",     499: "Podgorica",       504: "Rabat",
  508: "Maputo",          104: "Naypyidaw",       516: "Windhoek",
  524: "Kathmandu",       528: "Amsterdam",       540: "Noumea",
  554: "Wellington",      558: "Managua",         562: "Niamey",
  566: "Abuja",           408: "Pyongyang",       807: "Skopje",
  578: "Oslo",            512: "Muscat",          586: "Islamabad",
  275: "Ramallah",        591: "Panama City",     598: "Port Moresby",
  600: "Asuncion",        604: "Lima",            608: "Manila",
  616: "Warsaw",          620: "Lisbon",          630: "San Juan",
  634: "Doha",            642: "Bucharest",       643: "Moscow",
  646: "Kigali",          682: "Riyadh",          686: "Dakar",
  688: "Belgrade",        694: "Freetown",        703: "Bratislava",
  705: "Ljubljana",       90:  "Honiara",         706: "Mogadishu",
  710: "Pretoria",        410: "Seoul",           728: "Juba",
  724: "Madrid",          144: "Colombo",         729: "Khartoum",
  740: "Paramaribo",      752: "Stockholm",       756: "Bern",
  760: "Damascus",        158: "Taipei",          762: "Dushanbe",
  834: "Dodoma",          764: "Bangkok",         626: "Dili",
  768: "Lome",            780: "Port of Spain",   788: "Tunis",
  792: "Ankara",          795: "Ashgabat",        800: "Kampala",
  804: "Kyiv",            784: "Abu Dhabi",       826: "London",
  840: "Washington D.C.", 858: "Montevideo",      860: "Tashkent",
  548: "Port Vila",       862: "Caracas",         704: "Hanoi",
  732: "Laayoune",        887: "Sanaa",           894: "Lusaka",
  716: "Harare",
};

const buildCapitalMap = (entries) => {
  const map = {};
  entries.forEach(c => {
    map[c.id] = CAPITALS[c.id] || c.name; // fallback to own name if missing
  });
  return map;
};

// ─────────────────────────────────────────────────────────────────────────────
// ROUND BUILDER
// ─────────────────────────────────────────────────────────────────────────────

// Good spotlight countries for each rule — recognisable, clearly show the pattern
const SPOTLIGHT = {
  border:   [124, 840, 276, 250, 356, 156, 643, 710, 76, 380, 724, 152, 364, 586],
  alpha:    [276, 840, 356, 643, 250, 76, 380, 724, 578, 826, 484, 392],
  capitals: [840, 276, 250, 356, 156, 380, 724, 826, 643, 392, 76, 604, 710, 484],
};

const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function getRandomRounds() {
  const entries = Object.entries(COUNTRY_NAMES).map(([id, name]) => ({ id: +id, name }));

  // Border round
  const borderMap = buildBorderMap(entries);
  const borderQuarantine = sample(SPOTLIGHT.border);

  // Alpha round — extract config for dynamic answer string
  const alphaRaw = buildAlphaNeighbourMap(entries);
  const alphaConfig = alphaRaw._config;
  delete alphaRaw._config;
  const alphaMap = alphaRaw;
  const alphaQuarantine = sample(SPOTLIGHT.alpha);
  const alphaDirection = alphaConfig.direction === 1 ? "after" : "before";
  const alphaAnswer = `Alphabetical Neighbour — every country shows the name of the country ${alphaConfig.offset} ${alphaConfig.offset === 1 ? "step" : "steps"} ${alphaDirection} it in a full A→Z list of all countries on the map. Afghanistan is first; Zimbabwe is last.`;

  // Capitals round
  const capitalMap = buildCapitalMap(entries);
  const capitalQuarantine = sample(SPOTLIGHT.capitals);

  // Shuffle the 3 rounds so rule order varies each game
  const rounds = [
    {
      id: "border",
      title: "I",
      map: borderMap,
      quarantineId: borderQuarantine,
      hint: "Each country is wearing its neighbour's name tag.",
      answer: "Border Dispute — every country shows the name of one of its real geographical neighbours."
    },
    {
      id: "alpha",
      title: "II",
      map: alphaMap,
      quarantineId: alphaQuarantine,
      hint: "Each label is a real country — but shifted a fixed number of steps in a hidden ordered list.",
      answer: alphaAnswer
    },
    {
      id: "capitals",
      title: "III",
      map: capitalMap,
      quarantineId: capitalQuarantine,
      hint: "The labels aren't country names. But they're still real places.",
      answer: "Capital Offense — every country's name has been replaced by its own capital city."
    },
  ].sort(() => Math.random() - 0.5)
   .map((r, i) => ({ ...r, title: ["I", "II", "III"][i] }));

  return rounds;
}