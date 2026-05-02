import { useState, useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";

const W = 700, H = 380;

const COUNTRY_NAMES = {
  4:"Afghanistan",8:"Albania",12:"Algeria",24:"Angola",32:"Argentina",36:"Australia",40:"Austria",
  50:"Bangladesh",56:"Belgium",68:"Bolivia",76:"Brazil",100:"Bulgaria",116:"Cambodia",
  120:"Cameroon",124:"Canada",152:"Chile",156:"China",170:"Colombia",191:"Croatia",192:"Cuba",
  208:"Denmark",218:"Ecuador",818:"Egypt",231:"Ethiopia",246:"Finland",250:"France",
  276:"Germany",288:"Ghana",300:"Greece",320:"Guatemala",332:"Haiti",348:"Hungary",
  356:"India",360:"Indonesia",364:"Iran",368:"Iraq",372:"Ireland",380:"Italy",
  392:"Japan",404:"Kenya",408:"North Korea",410:"South Korea",434:"Libya",
  484:"Mexico",504:"Morocco",524:"Nepal",528:"Netherlands",554:"New Zealand",
  566:"Nigeria",578:"Norway",586:"Pakistan",604:"Peru",608:"Philippines",
  616:"Poland",620:"Portugal",642:"Romania",643:"Russia",682:"Saudi Arabia",
  710:"South Africa",724:"Spain",752:"Sweden",756:"Switzerland",764:"Thailand",
  792:"Turkey",804:"Ukraine",826:"United Kingdom",840:"United States",
  858:"Uruguay",704:"Vietnam",887:"Yemen",716:"Zimbabwe",800:"Uganda",862:"Venezuela",144:"Sri Lanka"
};

function buildRules() {
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
      title:"I", map:r1, correct:1,
      options:[
        "Each country shows a random country from the same continent",
        "Each country's label is 3 places ahead in alphabetical order",
        "Countries are ranked by area and labels shift forward by 3",
        "Labels are assigned by the capital city's first letter"
      ],
      answer:"Alphabetical shift +3 — each country shows whatever name comes 3 places after it in the alphabetical list. Afghanistan shows Angola, Albania shows Argentina, and so on."
    },
    {
      title:"II", map:r2, correct:2,
      options:[
        "Countries swap labels with their nearest geographic neighbour",
        "Countries are ranked by land area — adjacent pairs have swapped labels",
        "Countries ranked by population — adjacent pairs (1st & 2nd, 3rd & 4th…) have swapped labels",
        "Labels are shuffled completely at random"
      ],
      answer:"Population pair swap — countries ranked by population size. The 1st and 2nd most populous swap labels, the 3rd and 4th swap, and so on down the list."
    },
    {
      title:"III", map:r3, correct:1,
      options:[
        "Countries are labelled from south to north in alphabetical order",
        "The alphabetical list is entirely reversed — first becomes last, last becomes first",
        "Each country shows a name from the opposite hemisphere",
        "Countries are sorted by year of independence in reverse"
      ],
      answer:"Reverse alphabetical — the full list is flipped. Afghanistan shows Zimbabwe's label, Albania shows Yemen's, Algeria shows Vietnam's, and so on."
    }
  ];
}

const ROUNDS = buildRules();

export default function LyingMap() {
  const [features, setFeatures] = useState([]);
  const [ready, setReady] = useState(false);
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState("playing");
  const [clues, setClues] = useState([]);
  const [tooltip, setTooltip] = useState(null);
  const [hoverId, setHoverId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [scores, setScores] = useState([]);
  const svgRef = useRef(null);

  useEffect(()=>{
    const load = ()=>{
      fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
        .then(r=>r.json())
        .then(data=>{
          setFeatures(window.topojson.feature(data, data.objects.countries).features);
          setReady(true);
        });
    };
    if(window.topojson){load();return;}
    const s=document.createElement("script");
    s.src="https://unpkg.com/topojson-client@3/dist/topojson-client.min.js";
    s.onload=load;
    document.head.appendChild(s);
  },[]);

  const pathGen = useMemo(()=>{
    const proj = d3.geoNaturalEarth1().scale(W/6.5).translate([W/2,H/2]);
    return d3.geoPath().projection(proj);
  },[]);

  const graticule = useMemo(()=>pathGen(d3.geoGraticule()()),[pathGen]);

  const cur = ROUNDS[round];
  const clickedIds = useMemo(()=>new Set(clues.map(c=>c.id)),[clues]);
  const totalScore = scores.reduce((s,r)=>s+r.pts,0);

  const getColor = (id)=>{
    if(!COUNTRY_NAMES[id]) return "#101a10";
    if(clickedIds.has(id)) return "#5c4010";
    if(id===hoverId) return "#2e5c2e";
    return "#1a3a1a";
  };

  const handleMouseMove = (e,f)=>{
    const id=parseInt(f.id);
    if(!COUNTRY_NAMES[id]){setHoverId(null);setTooltip(null);return;}
    setHoverId(id);
    const rect=svgRef.current.getBoundingClientRect();
    const sx=(e.clientX-rect.left)/rect.width*W;
    const sy=(e.clientY-rect.top)/rect.height*H;
    setTooltip({x:Math.min(sx,W-160),y:Math.max(sy,30),fake:cur.map[id]||COUNTRY_NAMES[id]});
  };

  const handleClick = (f)=>{
    const id=parseInt(f.id);
    if(!COUNTRY_NAMES[id]||clickedIds.has(id)) return;
    setClues(prev=>[...prev,{id,real:COUNTRY_NAMES[id],fake:cur.map[id]||COUNTRY_NAMES[id]}]);
  };

  const handleGuess = ()=>{
    if(selected===null) return;
    const correct=selected===cur.correct;
    const pts=correct?Math.max(4-clues.length,1):0;
    setScores(prev=>[...prev,{correct,pts,clues:clues.length}]);
    setPhase("result");
  };

  const nextRound = ()=>{
    if(round+1>=ROUNDS.length){setPhase("done");return;}
    setRound(r=>r+1);
    setClues([]);setPhase("playing");setSelected(null);setTooltip(null);setHoverId(null);
  };

  const reset = ()=>{setRound(0);setScores([]);setClues([]);setPhase("playing");setSelected(null);setTooltip(null);setHoverId(null);};

  const S = {
    wrap:{fontFamily:"Georgia,serif",color:"#d4c89a",background:"#060e06",minHeight:520},
    hdr:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 20px 10px",borderBottom:"1px solid #162016"},
    label:{fontSize:9,letterSpacing:"0.25em",color:"#4a7a4a",textTransform:"uppercase",marginBottom:3},
    sub:{fontSize:12,color:"#6a7a6a"},
    scoreVal:{fontSize:22,color:"#c9a84c",lineHeight:1},
    hint:{padding:"6px 20px 8px",fontSize:10,letterSpacing:"0.06em",color:"#4a7a4a",borderBottom:"1px solid #0e180e"},
    body:{display:"flex"},
    mapWrap:{flex:1,position:"relative"},
    clueBox:{margin:"0 20px 12px",padding:"10px 14px",background:"#030a03",border:"1px solid #162016"},
    clueTitle:{fontSize:9,letterSpacing:"0.2em",color:"#4a7a4a",textTransform:"uppercase",marginBottom:8},
    clueGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 12px"},
    clueItem:{fontSize:11,display:"flex",gap:5,alignItems:"center"},
    btnPrimary:{padding:"8px 20px",background:"transparent",border:"1px solid #c9a84c",color:"#c9a84c",cursor:"pointer",fontFamily:"Georgia,serif",fontSize:12,letterSpacing:"0.08em"},
    panel:{width:240,borderLeft:"1px solid #162016",padding:"16px",background:"#030a03",flexShrink:0},
    panelTitle:{fontSize:9,letterSpacing:"0.2em",color:"#4a7a4a",textTransform:"uppercase",marginBottom:14},
    optBase:{padding:"9px 11px",marginBottom:8,fontSize:12,lineHeight:1.5,transition:"border-color 0.1s"},
  };

  if(phase==="done") return (
    <div style={{...S.wrap,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:0,padding:"48px 24px",textAlign:"center"}}>
      <div style={S.label}>Expedition Complete</div>
      <div style={{fontSize:11,color:"#c9a84c",letterSpacing:"0.1em",marginBottom:4}}>Final Score</div>
      <div style={{fontSize:56,color:"#d4c89a",marginBottom:4}}>{totalScore}</div>
      <div style={{fontSize:11,color:"#4a7a4a",marginBottom:28}}>out of {ROUNDS.length * 3} possible points</div>
      {scores.map((s,i)=>(
        <div key={i} style={{fontSize:12,marginBottom:6,color:s.correct?"#6ab86a":"#b86a6a"}}>
          Chapter {ROUNDS[i].title} — {s.correct?`Correct · +${s.pts} pt${s.pts!==1?"s":""}· ${s.clues} clue${s.clues!==1?"s":""} used`:"Incorrect · 0 pts"}
        </div>
      ))}
      <button onClick={reset} style={{...S.btnPrimary,marginTop:28}}>Play Again</button>
    </div>
  );

  return (
    <div style={S.wrap}>
      <div style={S.hdr}>
        <div>
          <div style={S.label}>The Lying Map · Chapter {cur.title}</div>
          <div style={S.sub}>Round {round+1} of {ROUNDS.length}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={S.label}>Score</div>
          <div style={S.scoreVal}>{totalScore}</div>
        </div>
      </div>

      <div style={S.hint}>
        {phase==="playing"
          ? `Hover to reveal a country's false label · Click to log it as a clue · ${clues.length} clue${clues.length!==1?"s":""} gathered${clues.length>=2?" · ready to theorise":""}`
          : "Review your evidence — then pick the rule and submit your verdict"}
      </div>

      <div style={S.body}>
        <div style={S.mapWrap}>
          {!ready && (
            <div style={{height:H,display:"flex",alignItems:"center",justifyContent:"center",color:"#4a7a4a",fontSize:12,letterSpacing:"0.1em"}}>
              Loading the world...
            </div>
          )}
          {ready && (
            <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{width:"100%",display:"block"}}
              onMouseLeave={()=>{setHoverId(null);setTooltip(null);}}>
              <rect width={W} height={H} fill="#07100d"/>
              <path d={graticule} fill="none" stroke="#0d1d17" strokeWidth={0.5}/>
              {features.map(f=>(
                <path key={f.id}
                  d={pathGen(f)??""}
                  fill={getColor(parseInt(f.id))}
                  stroke="#0c180c"
                  strokeWidth={0.4}
                  style={{cursor:COUNTRY_NAMES[parseInt(f.id)]?"crosshair":"default"}}
                  onMouseMove={e=>handleMouseMove(e,f)}
                  onMouseEnter={e=>handleMouseMove(e,f)}
                  onClick={()=>handleClick(f)}
                />
              ))}
              {tooltip&&(
                <g pointerEvents="none">
                  <rect x={tooltip.x+10} y={tooltip.y-24} width={tooltip.fake.length*7+18} height={22} fill="#050d05" stroke="#c9a84c" strokeWidth={0.5} rx={2}/>
                  <text x={tooltip.x+19} y={tooltip.y-9} fill="#c9a84c" fontSize={11} fontFamily="Georgia,serif">{tooltip.fake}</text>
                </g>
              )}
            </svg>
          )}

          {clues.length>0&&(
            <div style={S.clueBox}>
              <div style={S.clueTitle}>Evidence Log</div>
              <div style={S.clueGrid}>
                {clues.map((c,i)=>(
                  <div key={i} style={S.clueItem}>
                    <span style={{color:"#c9a84c",minWidth:80}}>{c.fake}</span>
                    <span style={{color:"#1e3a1e",fontSize:9}}>▸</span>
                    <span style={{color:"#6a7a6a"}}>{c.real}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {phase==="playing"&&clues.length>=2&&(
            <div style={{padding:"0 20px 16px"}}>
              <button style={S.btnPrimary} onClick={()=>setPhase("guessing")}>
                I have a theory →
              </button>
            </div>
          )}
        </div>

        {(phase==="guessing"||phase==="result")&&(
          <div style={S.panel}>
            <div style={S.panelTitle}>The Rule Is…</div>
            {cur.options.map((opt,i)=>{
              let bg="transparent",border="1px solid #162016",col="#6a7a6a";
              if(phase==="result"){
                if(i===cur.correct){bg="#021802";border="1px solid #3a7a3a";col="#6ac96a";}
                else if(i===selected&&i!==cur.correct){bg="#180202";border="1px solid #7a3a3a";col="#c97a7a";}
              } else if(selected===i){border="1px solid #c9a84c";col="#d4c89a";}
              return (
                <div key={i} onClick={()=>phase==="guessing"&&setSelected(i)}
                  style={{...S.optBase,border,background:bg,color:col,cursor:phase==="guessing"?"pointer":"default"}}>
                  {opt}
                </div>
              );
            })}

            {phase==="guessing"&&(
              <button onClick={handleGuess} disabled={selected===null}
                style={{width:"100%",marginTop:6,padding:"9px",background:selected!==null?"#0d1f0d":"transparent",border:"1px solid #2a4a2a",color:selected!==null?"#c9a84c":"#2a4a2a",cursor:selected!==null?"pointer":"not-allowed",fontFamily:"Georgia,serif",fontSize:12,letterSpacing:"0.08em"}}>
                Submit Verdict
              </button>
            )}

            {phase==="result"&&(
              <div style={{marginTop:10}}>
                <div style={{fontSize:13,color:scores[scores.length-1]?.correct?"#6ac96a":"#c97a7a",marginBottom:10}}>
                  {scores[scores.length-1]?.correct?`Correct — +${scores[scores.length-1]?.pts} pt${scores[scores.length-1]?.pts!==1?"s":""}`:"Incorrect."}
                </div>
                <div style={{fontSize:11,color:"#4a7a4a",lineHeight:1.8,marginBottom:16}}>{cur.answer}</div>
                <button onClick={nextRound} style={{...S.btnPrimary,width:"100%",boxSizing:"border-box"}}>
                  {round+1<ROUNDS.length?"Next Chapter →":"See Final Score →"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
