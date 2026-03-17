interface Props {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

export default function Sparkline({ data, color = 'blue', width = 120, height = 30 }: Props) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  const colorMap: Record<string, string> = {
    blue: '#3b82f6',
    green: '#22c55e',
    yellow: '#eab308',
    red: '#ef4444',
    purple: '#a855f7',
  };

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={colorMap[color] || colorMap.blue}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
