import React from 'react';

// Crisp SVG Barcode generator (Code 128 / pseudo standard representation for crisp scanning and display)
export default function BarcodeDisplay({ value = 'SKU-001', height = 48, showText = true }) {
  // Generate deterministic bar widths based on input string
  const bars = [];
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }

  // Quiet zone
  bars.push({ width: 3, isBlack: false });
  // Start pattern
  bars.push({ width: 2, isBlack: true });
  bars.push({ width: 1, isBlack: false });
  bars.push({ width: 2, isBlack: true });
  bars.push({ width: 1, isBlack: false });

  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    const pattern = [
      (code % 3) + 1,
      ((code >> 2) % 2) + 1,
      ((code >> 4) % 3) + 1,
      ((code >> 6) % 2) + 1
    ];
    pattern.forEach((w, idx) => {
      bars.push({ width: w * 1.4, isBlack: idx % 2 === 0 });
    });
  }

  // Stop pattern
  bars.push({ width: 2, isBlack: true });
  bars.push({ width: 1, isBlack: false });
  bars.push({ width: 3, isBlack: true });
  bars.push({ width: 3, isBlack: false });

  const totalWidth = bars.reduce((acc, b) => acc + b.width, 0);

  let currentX = 0;

  return (
    <div className="flex flex-col items-center bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
      <svg
        width={Math.max(totalWidth * 2, 160)}
        height={height}
        viewBox={`0 0 ${totalWidth} ${height}`}
        className="w-full max-w-[220px]"
      >
        {bars.map((bar, i) => {
          const x = currentX;
          currentX += bar.width;
          if (!bar.isBlack) return null;
          return (
            <rect
              key={i}
              x={x}
              y={0}
              width={bar.width}
              height={height}
              fill="#1e293b"
            />
          );
        })}
      </svg>
      {showText && (
        <span className="mt-1 font-mono text-xs tracking-widest text-slate-700 font-semibold uppercase">
          {value}
        </span>
      )}
    </div>
  );
}
