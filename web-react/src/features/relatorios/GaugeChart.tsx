import React from 'react';

export type TipoExibicaoGauge = 'valor' | 'percentual' | 'ambos';

export interface GaugeConfig {
  nrOfLevels: number;
  colors: string[];
  arcWidth: number;
  percent: number;
  textColor: string;
  needleColor: string;
  needleBaseColor: string;
  animate: boolean;
  tipoExibicao?: TipoExibicaoGauge;
}

export interface GaugeChartProps {
  config: GaugeConfig;
  value: number;
  minValue: number;
  maxValue: number;
  label?: string;
  width?: number;
  height?: number;
}

const GAUGE_COLORS = [
  '#22c55e', '#16a34a', '#15803d', '#166534',
  '#84cc16', '#65a30d', '#4d7c0f', '#3f6212',
  '#eab308', '#ca8a04', '#a16207', '#854d0e',
  '#f59e0b', '#d97706', '#b45309', '#92400e',
  '#ef4444', '#dc2626', '#b91c1c', '#991b1b',
  '#f43f5e', '#e11d48', '#be123c', '#9f1239',
  '#ec4899', '#db2777', '#be185d', '#9d174d',
  '#a855f7', '#9333ea', '#7e22ce', '#6b21a8',
  '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6',
  '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af',
  '#06b6d4', '#0891b2', '#0e7490', '#155e75',
  '#14b8a6', '#0d9488', '#0f766e', '#115e59',
  '#f97316', '#ea580c', '#c2410c', '#9a3412',
];

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(' ');
}

function getLevelConfig(config: GaugeConfig, totalAngle: number) {
  const levels = config.nrOfLevels;
  const anglePerLevel = totalAngle / levels;
  return config.colors.map((color, i) => ({
    color,
    startAngle: -90 + (i * anglePerLevel),
    endAngle: -90 + ((i + 1) * anglePerLevel),
  }));
}

function getNeedleAngle(config: GaugeConfig, percent: number, totalAngle: number) {
  const clampedPercent = Math.max(0, Math.min(1, percent));
  return -90 + (clampedPercent * totalAngle);
}

export function GaugeChart({ config, value, minValue, maxValue, label, width = 300, height = 200 }: GaugeChartProps) {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 20;
  const arcRadius = radius;
  const innerRadius = radius * (1 - config.arcWidth);
  const totalAngle = 180;
  
  const computedPercent = minValue < maxValue ? (value - minValue) / (maxValue - minValue) : null;
  const percent = computedPercent !== null
    ? Math.max(0, Math.min(1, computedPercent))
    : (config.percent ?? 0);
  const needleAngle = getNeedleAngle(config, percent, totalAngle);
  const needleLength = radius * 0.9;
  const needleBaseRadius = radius * 0.15;
  
  const levels = getLevelConfig(config, totalAngle);
  
  const needleTip = polarToCartesian(centerX, centerY, needleLength, needleAngle);
  const needleBase1 = polarToCartesian(centerX, centerY, needleBaseRadius, needleAngle - 90);
  const needleBase2 = polarToCartesian(centerX, centerY, needleBaseRadius, needleAngle + 90);
  
  const displayValue = minValue + (maxValue - minValue) * percent;
  const formattedValue = displayValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formattedPercent = `${(percent * 100).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
  const tipo = config.tipoExibicao ?? 'valor';
  const valorCentral = tipo === 'percentual' ? formattedPercent : formattedValue;
  const valorInferior = tipo === 'ambos' ? formattedPercent : tipo === 'valor' ? label : undefined;

  return (
    <div style={{ width, height, position: 'relative' }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          {config.animate && (
            <style>{`
              .gauge-arc { animation: drawArc 1s ease-out forwards; }
              .gauge-needle { animation: rotateNeedle 1s ease-out forwards; transform-origin: ${centerX}px ${centerY}px; }
              @keyframes drawArc { from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; } }
              @keyframes rotateNeedle { from { transform: rotate(-90deg); } to { transform: rotate(${needleAngle}deg); } }
            `}</style>
          )}
        </defs>
        
        {levels.map((level, i) => (
          <path
            key={i}
            d={describeArc(centerX, centerY, arcRadius, level.startAngle, level.endAngle)}
            stroke={level.color}
            strokeWidth={config.arcWidth * radius * 2}
            fill="none"
            strokeLinecap="round"
            className={config.animate ? 'gauge-arc' : ''}
            style={{ 
              strokeDasharray: `${(level.endAngle - level.startAngle) / totalAngle * 2 * Math.PI * arcRadius} ${2 * Math.PI * arcRadius}`,
              strokeDashoffset: config.animate ? `${2 * Math.PI * arcRadius}` : '0',
              transition: 'stroke-dashoffset 1s ease-out'
            }}
          />
        ))}
        
        <circle
          cx={centerX}
          cy={centerY}
          r={needleBaseRadius}
          fill={config.needleBaseColor}
        />
        
        <path
          d={`M ${needleBase1.x} ${needleBase1.y} L ${needleTip.x} ${needleTip.y} L ${needleBase2.x} ${needleBase2.y} Z`}
          fill={config.needleColor}
          className={config.animate ? 'gauge-needle' : ''}
          style={{ transformOrigin: `${centerX}px ${centerY}px` }}
        />
        
        <text
          x={centerX}
          y={centerY + radius * 0.1}
          textAnchor="middle"
          fill={config.textColor}
          fontSize={Math.max(14, radius * 0.2)}
          fontWeight="bold"
          fontFamily="system-ui, sans-serif"
        >
          {valorCentral}
        </text>
        
        {valorInferior && (
          <text
            x={centerX}
            y={centerY + radius * 0.5}
            textAnchor="middle"
            fill={config.textColor}
            fontSize={Math.max(10, radius * 0.12)}
            fontFamily="system-ui, sans-serif"
          >
            {valorInferior}
          </text>
        )}
      </svg>
    </div>
  );
}

export { GAUGE_COLORS };
export type { GaugeConfig, GaugeChartProps };