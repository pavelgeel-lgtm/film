import { sc } from "../constants";

export default function Pill({ s }) {
  const c = sc(s);
  return (
    <span className="pill" style={{ background: c.bg, color: c.tx }}>
      <span className="dot" style={{ background: c.d }} />
      {s}
    </span>
  );
}
