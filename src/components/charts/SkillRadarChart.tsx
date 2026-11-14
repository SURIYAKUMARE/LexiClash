import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

export interface SkillRadarItem {
  category: string;
  current: number;
  benchmark: number;
  fullMark: number;
}

interface SkillRadarChartProps {
  data: SkillRadarItem[];
}

export const SkillRadarChart: React.FC<SkillRadarChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-charcoal-subtle text-sm">
        No skill evaluation data recorded yet.
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }}
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <Tooltip
            formatter={(value: any, name: any) => [
              `${value}%`,
              name === 'current' ? 'Your Competency' : 'Target Benchmark'
            ]}
            contentStyle={{
              backgroundColor: '#ffffff',
              borderColor: '#e2e8f0',
              borderRadius: '8px',
              fontSize: '12px',
              boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.08)'
            }}
          />
          <Radar
            name="Target Benchmark"
            dataKey="benchmark"
            stroke="#94a3b8"
            fill="#94a3b8"
            fillOpacity={0.15}
          />
          <Radar
            name="Your Competency"
            dataKey="current"
            stroke="#0F5C7A"
            fill="#0F5C7A"
            fillOpacity={0.35}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
