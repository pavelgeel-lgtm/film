import { useRef, useState, useCallback, useEffect } from "react";
import Icon from "./Icon";

export default function SignaturePad({ onSave, onClear: onClearExt }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [isEmpty, setIsEmpty] = useState(true);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * (canvas.width / rect.width),
      y: (src.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const start = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    drawing.current = true;
    setIsEmpty(false);
  }, []);

  const move = useCallback((e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  }, []);

  const end = useCallback(() => { drawing.current = false; }, []);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onSave(null);
    onClearExt?.();
  }, [onSave, onClearExt]);

  const save = useCallback(() => {
    if (isEmpty) return;
    onSave(canvasRef.current.toDataURL("image/png"));
  }, [isEmpty, onSave]);

  // auto-save on draw end
  useEffect(() => {
    const canvas = canvasRef.current;
    const handler = () => { if (!isEmpty) save(); };
    canvas.addEventListener("mouseup", handler);
    canvas.addEventListener("touchend", handler);
    return () => {
      canvas.removeEventListener("mouseup", handler);
      canvas.removeEventListener("touchend", handler);
    };
  }, [isEmpty, save]);

  return (
    <div>
      <div style={{ border: "1.5px solid #cbd5e1", borderRadius: 10, background: "#f8fafc", overflow: "hidden", touchAction: "none" }}>
        <canvas
          ref={canvasRef} width={480} height={140}
          style={{ width: "100%", display: "block", cursor: "crosshair" }}
          onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
          onTouchStart={start} onTouchMove={move} onTouchEnd={end}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>Подпишите пальцем или мышью</span>
        <button className="btn bg sm" style={{ fontSize: 11 }} onClick={clear}>
          <Icon n="trash" s={12} />Очистить
        </button>
      </div>
    </div>
  );
}
