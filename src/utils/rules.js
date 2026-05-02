import { COUNTRY_NAMES } from "../constants/countries";

export function buildRules() {
  const entries = Object.entries(COUNTRY_NAMES).map(([id,name])=>({id:+id,name}));
  const alpha = [...entries].sort((a,b)=>a.name.localeCompare(b.name));
  const n = alpha.length;

  const r1={};
  alpha.forEach((c,i)=>{r1[c.id]=alpha[(i+3)%n].name;});

  const popOrder=[156,356,840,360,586,76,566,50,643,231,800,484,608,818,704,364,276,792,764,250,826,710,170,12,32,368,804,124,504,682,604,862,288,887,524,408,120,24,642,152,144,528,218,320,716,116,68,332,192,56,752,620,434,578,554,191,372,208,246,756,40,300,348,410,392,404,616,4,8,36,724,380,858];
  const pop=[...new Set(popOrder)].filter(id=>COUNTRY_NAMES[id]);
  entries.forEach(c=>{if(!pop.includes(c.id))pop.push(c.id);});
  const r2={};
  for(let i=0;i<pop.length-1;i+=2){
    const [a,b]=[pop[i],pop[i+1]];
    if(COUNTRY_NAMES[a]&&COUNTRY_NAMES[b]){r2[a]=COUNTRY_NAMES[b];r2[b]=COUNTRY_NAMES[a];}
  }
  entries.forEach(c=>{if(!r2[c.id])r2[c.id]=c.name;});

  const r3={};
  alpha.forEach((c,i)=>{r3[c.id]=alpha[n-1-i].name;});

  return [
    {
      title:"I", map:r1, quarantineId: 250, // France
      answer:"Alphabetical shift +3 — each country shows whatever name comes 3 places after it in the alphabetical list."
    },
    {
      title:"II", map:r2, quarantineId: 124, // Canada
      answer:"Population pair swap — countries ranked by population size. The 1st and 2nd most populous swap labels, the 3rd and 4th swap, and so on."
    },
    {
      title:"III", map:r3, quarantineId: 392, // Japan
      answer:"Reverse alphabetical — the full list is flipped. The first alphabetical country shows the last, and vice versa."
    }
  ];
}

export const ROUNDS = buildRules();