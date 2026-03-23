import { PX } from "../constants";

export default function Icon({ n, s = 18, c = "currentColor", w = 1.7 }) {
  return (
    <svg
      width={s} height={s} viewBox="0 0 24 24"
      fill="none" stroke={c} strokeWidth={w}
      strokeLinecap="round" strokeLinejoin="round"
      style={{ display: "inline-block", flexShrink: 0, verticalAlign: "middle" }}
    >
      <path d={PX[n] || PX.star} />
    </svg>
  );
}

export function ClapIcon({ s = 28 }) {
  return (
    <svg width={s} height={s} viewBox="0 0 32 32" fill="none" style={{ display: "inline-block", flexShrink: 0 }}>
      <circle cx="13" cy="16" r="10" stroke="white" strokeWidth="2" fill="none" />
      <path d="M8 11L18 21M8 21L18 11" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M20 11L24 15" stroke="#00AEEF" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
