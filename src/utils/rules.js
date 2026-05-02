import { COUNTRY_NAMES } from "../constants/countries";

// A fallback pool of highly recognizable countries
const DEFAULT_TARGETS = [840, 124, 76, 826, 250, 276, 380, 392, 356, 36];

// Pre-computed Border Swaps (Biggest/Most Obvious Neighbor)
// Maps a country ID to the name of its most prominent neighbor.
const BORDER_SWAPS = {
  // North America
  124: "United States", 840: "Canada", 484: "United States", 320: "Mexico",
  // South America
  76: "Argentina", 32: "Chile", 152: "Argentina", 604: "Brazil", 170: "Brazil", 858: "Argentina", 68: "Brazil",
  // Europe
  620: "Spain", 724: "France", 250: "Germany", 276: "Poland", 616: "Germany", 380: "France", 756: "Germany", 40: "Germany", 826: "Ireland", 372: "United Kingdom", 578: "Sweden", 752: "Norway", 246: "Sweden", 804: "Russia", 100: "Romania", 642: "Ukraine", 300: "Bulgaria",
  // Asia
  643: "China", 156: "Russia", 356: "China", 586: "India", 50: "India", 104: "China", 764: "Myanmar", 704: "China", 408: "South Korea", 410: "North Korea", 392: "South Korea", /* Japan maritime */ 368: "Iran", 364: "Iraq", 682: "Yemen", 887: "Saudi Arabia",
  // Africa
  818: "Sudan", 729: "Egypt", 434: "Egypt", 12: "Morocco", 504: "Algeria", 710: "Namibia", 516: "South Africa", 404: "Ethiopia", 231: "Somalia", 566: "Cameroon", 120: "Nigeria", 288: "Ivory Coast",
  // Oceania
  36: "New Zealand", 554: "Australia" // Maritime
};

// Trivia Data for the Capital Offense rule
const CAPITALS = {
  "Afghanistan": "Kabul", "Albania": "Tirana", "Algeria": "Algiers", "Angola": "Luanda", "Argentina": "Buenos Aires", "Armenia": "Yerevan", "Australia": "Canberra", "Austria": "Vienna", "Azerbaijan": "Baku", "Bahamas": "Nassau", "Bangladesh": "Dhaka", "Belarus": "Minsk", "Belgium": "Brussels", "Belize": "Belmopan", "Benin": "Porto-Novo", "Bhutan": "Thimphu", "Bolivia": "Sucre", "Bosnia and Herzegovina": "Sarajevo", "Botswana": "Gaborone", "Brazil": "Brasilia", "Brunei": "Bandar Seri Begawan", "Bulgaria": "Sofia", "Burkina Faso": "Ouagadougou", "Burundi": "Gitega", "Cambodia": "Phnom Penh", "Cameroon": "Yaounde", "Canada": "Ottawa", "Central African Republic": "Bangui", "Chad": "N'Djamena", "Chile": "Santiago", "China": "Beijing", "Colombia": "Bogota", "Congo": "Brazzaville", "Costa Rica": "San Jose", "Croatia": "Zagreb", "Cuba": "Havana", "Cyprus": "Nicosia", "Czechia": "Prague", "Democratic Republic of the Congo": "Kinshasa", "Denmark": "Copenhagen", "Djibouti": "Djibouti", "Dominican Republic": "Santo Domingo", "Ecuador": "Quito", "Egypt": "Cairo", "El Salvador": "San Salvador", "Equatorial Guinea": "Malabo", "Eritrea": "Asmara", "Estonia": "Tallinn", "Eswatini": "Mbabane", "Ethiopia": "Addis Ababa", "Fiji": "Suva", "Finland": "Helsinki", "France": "Paris", "Gabon": "Libreville", "Gambia": "Banjul", "Georgia": "Tbilisi", "Germany": "Berlin", "Ghana": "Accra", "Greece": "Athens", "Greenland": "Nuuk", "Guatemala": "Guatemala City", "Guinea": "Conakry", "Guinea-Bissau": "Bissau", "Guyana": "Georgetown", "Haiti": "Port-au-Prince", "Honduras": "Tegucigalpa", "Hungary": "Budapest", "Iceland": "Reykjavik", "India": "New Delhi", "Indonesia": "Jakarta", "Iran": "Tehran", "Iraq": "Baghdad", "Ireland": "Dublin", "Israel": "Jerusalem", "Italy": "Rome", "Ivory Coast": "Yamoussoukro", "Jamaica": "Kingston", "Japan": "Tokyo", "Jordan": "Amman", "Kazakhstan": "Astana", "Kenya": "Nairobi", "Kuwait": "Kuwait City", "Kyrgyzstan": "Bishkek", "Laos": "Vientiane", "Latvia": "Riga", "Lebanon": "Beirut", "Lesotho": "Maseru", "Liberia": "Monrovia", "Libya": "Tripoli", "Lithuania": "Vilnius", "Luxembourg": "Luxembourg", "Madagascar": "Antananarivo", "Malawi": "Lilongwe", "Malaysia": "Kuala Lumpur", "Mali": "Bamako", "Mauritania": "Nouakchott", "Mexico": "Mexico City", "Moldova": "Chisinau", "Mongolia": "Ulaanbaatar", "Montenegro": "Podgorica", "Morocco": "Rabat", "Mozambique": "Maputo", "Myanmar": "Naypyidaw", "Namibia": "Windhoek", "Nepal": "Kathmandu", "Netherlands": "Amsterdam", "New Zealand": "Wellington", "Nicaragua": "Managua", "Niger": "Niamey", "Nigeria": "Abuja", "North Korea": "Pyongyang", "North Macedonia": "Skopje", "Norway": "Oslo", "Oman": "Muscat", "Pakistan": "Islamabad", "Panama": "Panama City", "Papua New Guinea": "Port Moresby", "Paraguay": "Asuncion", "Peru": "Lima", "Philippines": "Manila", "Poland": "Warsaw", "Portugal": "Lisbon", "Puerto Rico": "San Juan", "Qatar": "Doha", "Romania": "Bucharest", "Russia": "Moscow", "Rwanda": "Kigali", "Saudi Arabia": "Riyadh", "Senegal": "Dakar", "Serbia": "Belgrade", "Sierra Leone": "Freetown", "Slovakia": "Bratislava", "Slovenia": "Ljubljana", "Somalia": "Mogadishu", "South Africa": "Pretoria", "South Korea": "Seoul", "South Sudan": "Juba", "Spain": "Madrid", "Sri Lanka": "Colombo", "Sudan": "Khartoum", "Suriname": "Paramaribo", "Sweden": "Stockholm", "Switzerland": "Bern", "Syria": "Damascus", "Taiwan": "Taipei", "Tajikistan": "Dushanbe", "Tanzania": "Dodoma", "Thailand": "Bangkok", "Togo": "Lome", "Tunisia": "Tunis", "Turkey": "Ankara", "Turkmenistan": "Ashgabat", "Uganda": "Kampala", "Ukraine": "Kyiv", "United Arab Emirates": "Abu Dhabi", "United Kingdom": "London", "United States": "Washington D.C.", "Uruguay": "Montevideo", "Uzbekistan": "Tashkent", "Vanuatu": "Port Vila", "Venezuela": "Caracas", "Vietnam": "Hanoi", "Yemen": "Sanaa", "Zambia": "Lusaka", "Zimbabwe": "Harare"
};

// The Pool of Cipher Algorithms
const RULE_POOL = [
  {
    id: "border_dispute",
    targetPool: [620, 124, 410, 372, 152, 484], // Portugal, Canada, S.Korea, Ireland, Chile, Mexico
    generate: (entries) => {
      const map = {};
      // Use the hardcoded borders. If not found, fallback to themselves to avoid breaking.
      entries.forEach(c => map[c.id] = BORDER_SWAPS[c.id] || c.name);
      return map;
    },
    answer: "Border Dispute — Countries have stolen the label of their largest or most notable geographical neighbor."
  },
  {
    id: "capitals",
    targetPool: [604, 404, 348, 554, 170, 858, 504], // Peru, Kenya, Hungary, NZ, Colombia, Uruguay, Morocco
    generate: (entries) => {
      const map = {};
      entries.forEach(c => map[c.id] = CAPITALS[c.name] || c.name); 
      return map;
    },
    answer: "Capital Offense — The country's name has been completely replaced by its capital city."
  },
  {
    id: "first_letter_match",
    targetPool: DEFAULT_TARGETS, 
    generate: (entries) => {
      const map = {};
      // Group countries by their first letter
      const groups = {};
      entries.forEach(c => {
        const letter = c.name[0].toUpperCase();
        if (!groups[letter]) groups[letter] = [];
        groups[letter].push(c);
      });
      // Shift each country to the next one in its letter group
      Object.values(groups).forEach(group => {
        group.forEach((c, i) => map[c.id] = group[(i + 1) % group.length].name);
      });
      return map;
    },
    answer: "The Alliteration Shift — Every country is disguised as another country that starts with the exact same first letter."
  },
  {
    id: "same_length",
    targetPool: DEFAULT_TARGETS,
    generate: (entries) => {
      const map = {};
      // Group countries by how many letters are in their name
      const groups = {};
      entries.forEach(c => {
        const len = c.name.length;
        if (!groups[len]) groups[len] = [];
        groups[len].push(c);
      });
      // Shift each country to the next one in its length group
      Object.values(groups).forEach(group => {
        group.forEach((c, i) => map[c.id] = group[(i + 1) % group.length].name);
      });
      return map;
    },
    answer: "Character Count — Each country shows the name of a completely different country that has the exact same number of letters."
  },
  {
    id: "vowel_void",
    targetPool: DEFAULT_TARGETS,
    generate: (entries) => {
      const map = {};
      entries.forEach(c => map[c.id] = c.name.replace(/[aeiouAEIOU]/g, ''));
      return map;
    },
    answer: "Vowel Void — All vowels have been entirely stripped from the country names."
  }
];

// Helper to grab a random element from an array
const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper to shuffle an array
const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

export function getRandomRounds(roundCount = 3) {
  const entries = Object.entries(COUNTRY_NAMES).map(([id, name]) => ({ id: +id, name }));
  
  // Shuffle the pool and pick the requested number of rules
  const selectedRules = shuffle(RULE_POOL).slice(0, roundCount);

  // Map them into the final Round objects
  return selectedRules.map((rule, index) => {
    const generatedMap = rule.generate(entries);
    
    // Pick a random target specifically tailored for this rule
    const quarantineId = sample(rule.targetPool || DEFAULT_TARGETS);

    return {
      title: ["I", "II", "III"][index] || (index + 1).toString(),
      map: generatedMap,
      quarantineId: quarantineId,
      answer: rule.answer
    };
  });
}