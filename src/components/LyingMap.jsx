import { useState, useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";

// Architecture imports
import { W, H } from "../constants/config";
import { COUNTRY_NAMES } from "../constants/countries";
import { ROUNDS } from "../utils/rules";
import { S } from "../styles/lyingMapStyles";

export default function LyingMap() {
  const [features, setFeatures] = useState([]);
  const [ready, setReady] = useState(false);
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState("playing");
  const [clues, setClues] = useState([]);
  const [tooltip, setTooltip] = useState(null);
  const [hoverId, setHoverId] = useState(null);
  const [inputValue, setInputValue] = useState("");
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
    if(id === cur.quarantineId) return hoverId === id ? "#7a3a3a" : "#4a1c1c"; 
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
    
    let fakeLabel = cur.map[id] || COUNTRY_NAMES[id];
    if (id === cur.quarantineId) fakeLabel = "[ DECRYPT THIS LABEL ]";
    setTooltip({x:Math.min(sx,W-160),y:Math.max(sy,30),fake:fakeLabel});
  };

  const handleClick = (f)=>{
    const id=parseInt(f.id);
    if(!COUNTRY_NAMES[id]) return;
    if(id === cur.quarantineId) {
        setPhase("guessing");
        return;
    }
    if(clickedIds.has(id)) return;
    setClues(prev=>[...prev,{id,real:COUNTRY_NAMES[id],fake:cur.map[id]||COUNTRY_NAMES[id]}]);
  };

  const handleGuess = ()=>{
    if(!inputValue.trim()) return;
    const expected = cur.map[cur.quarantineId];
    const correct = inputValue.trim().toLowerCase() === expected.toLowerCase();
    const pts = correct ? Math.max(4 - clues.length, 1) : 0;
    setScores(prev=>[...prev,{correct,pts,clues:clues.length}]);
    setPhase("result");
  };

  const nextRound = ()=>{
    if(round+1>=ROUNDS.length){setPhase("done");return;}
    setRound(r=>r+1);
    setClues([]);setPhase("playing");setInputValue("");setTooltip(null);setHoverId(null);
  };

  const reset = ()=>{
    setRound(0);setScores([]);setClues([]);setPhase("playing");setInputValue("");setTooltip(null);setHoverId(null);
  };

  if(phase==="done") return (
    <div style={{...S.wrap,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:0,padding:"48px 24px",textAlign:"center"}}>
      <div style={S.label}>Expedition Complete</div>
      <div style={{fontSize:11,color:"#c9a84c",letterSpacing:"0.1em",marginBottom:4}}>Final Score</div>
      <div style={{fontSize:56,color:"#d4c89a",marginBottom:4}}>{totalScore}</div>
      <div style={{fontSize:11,color:"#4a7a4a",marginBottom:28}}>out of {ROUNDS.length * 4} possible points</div>
      {scores.map((s,i)=>(
        <div key={i} style={{fontSize:12,marginBottom:6,color:s.correct?"#6ab86a":"#b86a6a"}}>
          Chapter {ROUNDS[i].title} — {s.correct?`Correct · +${s.pts} pt${s.pts!==1?"s":""} · ${s.clues} clue${s.clues!==1?"s":""} used`:"Incorrect · 0 pts"}
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
          ? `Hover to reveal labels · Click to log clues · Click the REDACTED anomaly on the map when ready to theorise`
          : "Terminal Open — deduce the underlying rule to resolve the anomaly"}
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
                  stroke={parseInt(f.id) === cur.quarantineId ? "#c97a7a" : "#0c180c"}
                  strokeWidth={parseInt(f.id) === cur.quarantineId ? 1 : 0.4}
                  style={{cursor:COUNTRY_NAMES[parseInt(f.id)]?"crosshair":"default"}}
                  onMouseMove={e=>handleMouseMove(e,f)}
                  onMouseEnter={e=>handleMouseMove(e,f)}
                  onClick={()=>handleClick(f)}
                />
              ))}
              {tooltip&&(
                <g pointerEvents="none">
                  <rect 
                    x={tooltip.x + 5} 
                    y={tooltip.y - 10} 
                    width={tooltip.fake.length * 4 + 10} 
                    height={12} 
                    fill="#050d05" 
                    stroke={hoverId === cur.quarantineId ? "#c97a7a" : "#c9a84c"} 
                    strokeWidth={0.5} 
                    rx={1.5}
                  />
                  <text 
                    x={tooltip.x + 5 + (tooltip.fake.length * 4 + 10) / 2} 
                    y={tooltip.y - 4} 
                    fill={hoverId === cur.quarantineId ? "#c97a7a" : "#c9a84c"} 
                    fontSize={7} 
                    fontFamily="Georgia,serif" 
                    textAnchor="middle" 
                    dominantBaseline="central"
                  >
                    {tooltip.fake}
                  </text>
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
                Identify the Anomaly →
              </button>
            </div>
          )}
        </div>

        {(phase==="guessing"||phase==="result")&&(
          <div style={S.panel}>
            <div style={S.panelTitle}>Quarantine Terminal</div>
            
            {phase==="guessing"&&(
              <>
                <div style={{fontSize: 11, color: "#6a7a6a", marginBottom: 12, lineHeight: 1.5}}>
                  Target Territory: <strong style={{color:"#c9a84c"}}>{COUNTRY_NAMES[cur.quarantineId]}</strong><br/><br/>
                  Enter the expected false label for this territory to prove the map's algorithm.
                </div>
                <input
                  type="text"
                  autoFocus
                  style={S.inputBase}
                  placeholder="> _"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => { if(e.key === "Enter") handleGuess() }}
                />
                <button onClick={handleGuess} disabled={!inputValue.trim()}
                  style={{width:"100%",marginTop:6,padding:"9px",background:inputValue.trim()?"#0d1f0d":"transparent",border:"1px solid #2a4a2a",color:inputValue.trim()?"#c9a84c":"#2a4a2a",cursor:inputValue.trim()?"pointer":"not-allowed",fontFamily:"Georgia,serif",fontSize:12,letterSpacing:"0.08em"}}>
                  Submit Verdict
                </button>
              </>
            )}

            {phase==="result"&&(
              <div>
                <div style={{fontSize:13,color:scores[scores.length-1]?.correct?"#6ac96a":"#c97a7a",marginBottom:10}}>
                  {scores[scores.length-1]?.correct?`Correct — +${scores[scores.length-1]?.pts} pt${scores[scores.length-1]?.pts!==1?"s":""}`:"Anomaly Purge Failed."}
                </div>
                <div style={{fontSize:12, color: "#6a7a6a", marginBottom: 12}}>
                  Expected output: <span style={{color:"#c9a84c"}}>{cur.map[cur.quarantineId]}</span>
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