import type { CSSProperties } from "react";
import {
  FIREFLIES,
  FOREST_FAR,
  FOREST_MID,
  FOREST_NEAR,
  H,
  MOUNTAINS_FAR,
  MOUNTAINS_MID,
  STARS,
  W,
} from "./geometry";
import ParallaxDriver from "./ParallaxDriver";
import s from "./scene.module.css";

const depth = (d: number) => ({ "--depth": d }) as CSSProperties;

const CLOUDS = [
  { x: 180, y: 150, s: 1.1, dur: 120, delay: -20 },
  { x: 760, y: 90, s: 0.8, dur: 150, delay: -90 },
  { x: 1300, y: 230, s: 0.95, dur: 135, delay: -40 },
];

function Cloud({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="0" rx="90" ry="22" />
      <ellipse cx="-34" cy="-14" rx="40" ry="26" />
      <ellipse cx="20" cy="-22" rx="48" ry="32" />
      <ellipse cx="62" cy="-6" rx="34" ry="20" />
    </g>
  );
}

/** Full-viewport landscape behind the page: day forest or moonlit night. */
export default function NatureScene() {
  return (
    <div className={s.scene} aria-hidden="true">
      <svg className={s.svg} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" focusable="false">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" className={s.skyTop} />
            <stop offset="0.55" className={s.skyMid} />
            <stop offset="1" className={s.skyBottom} />
          </linearGradient>
          <radialGradient id="sunGlow">
            <stop offset="0" className={s.glowIn} />
            <stop offset="1" className={s.glowOut} />
          </radialGradient>
          <linearGradient id="fog" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopOpacity="0" className={s.fogStop} />
            <stop offset="0.5" className={s.fogStop} />
            <stop offset="1" stopOpacity="0" className={s.fogStop} />
          </linearGradient>
        </defs>

        <rect width={W} height={H} fill="url(#sky)" />

        {/* stars */}
        <g className={s.stars}>
          {STARS.map((d, i) => (
            <circle
              key={i}
              cx={d.x}
              cy={d.y}
              r={d.r}
              className={s.star}
              style={{ animationDelay: `${d.delay}s`, animationDuration: `${d.dur}s` }}
            />
          ))}
          <path className={s.shootingStar} d="M0 0l-120 40" />
        </g>

        {/* sun / moon */}
        <g className={s.layer} style={depth(0.1)}>
          <circle cx="1210" cy="190" r="210" fill="url(#sunGlow)" className={s.glow} />
          <circle cx="1210" cy="190" r="58" className={s.sun} />
          <g className={s.craters}>
            <circle cx="1192" cy="176" r="9" />
            <circle cx="1228" cy="204" r="6" />
            <circle cx="1220" cy="166" r="4" />
          </g>
        </g>

        {/* clouds */}
        <g className={s.clouds}>
          {CLOUDS.map((c, i) => (
            <g key={i} className={s.cloudDrift} style={{ animationDuration: `${c.dur}s`, animationDelay: `${c.delay}s` }}>
              <Cloud x={c.x} y={c.y} scale={c.s} />
            </g>
          ))}
        </g>

        {/* birds */}
        <g className={s.birds}>
          {[0, 1, 2].map((i) => (
            <g key={i} className={s.bird} style={{ animationDelay: `${i * -0.8 - 6}s`, transform: `translateY(${i * 14}px)` }}>
              <path
                className={s.wing}
                style={{ animationDelay: `${i * 0.15}s` }}
                transform={`translate(${i * 26} ${(i % 2) * 10})`}
                d="M0 0q7-8 14 0q7-8 14 0"
              />
            </g>
          ))}
        </g>

        <g className={s.layer} style={depth(0.2)}>
          <path d={MOUNTAINS_FAR.d} className={s.mtnFar} />
          <path d={MOUNTAINS_FAR.snow} className={s.snow} />
        </g>

        <g className={s.fogBand} style={{ animationDuration: "60s" }}>
          <rect x="-200" y="470" width="2000" height="160" fill="url(#fog)" />
        </g>

        <g className={s.layer} style={depth(0.35)}>
          <path d={MOUNTAINS_MID.d} className={s.mtnMid} />
        </g>

        <g className={s.layer} style={depth(0.5)}>
          <path d={FOREST_FAR} className={s.forestFar} />
        </g>

        <g className={s.fogBand} style={{ animationDuration: "45s", animationDirection: "alternate-reverse" }}>
          <rect x="-200" y="620" width="2000" height="140" fill="url(#fog)" />
        </g>

        <g className={s.layer} style={depth(0.7)}>
          <path d={FOREST_MID} className={s.forestMid} />
        </g>

        {/* fireflies */}
        <g className={s.fireflies}>
          {FIREFLIES.map((d, i) => (
            <circle
              key={i}
              cx={d.x}
              cy={d.y}
              r={d.r}
              className={s.firefly}
              style={{ animationDelay: `${-d.delay}s, ${-d.delay * 0.7}s`, animationDuration: `${d.dur + 6}s, ${d.dur * 0.6}s` }}
            />
          ))}
        </g>

        <g className={s.layer} style={depth(1)}>
          <path d={FOREST_NEAR} className={s.forestNear} />
        </g>
      </svg>
      <ParallaxDriver />
    </div>
  );
}
