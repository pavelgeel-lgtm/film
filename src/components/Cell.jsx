import Icon from "./Icon";

export default function Cell({ wh, cell }) {
  return (
    <span className="cellc">
      <Icon n="grid" s={11} c="#00AEEF" />
      {wh} · {cell}
    </span>
  );
}
