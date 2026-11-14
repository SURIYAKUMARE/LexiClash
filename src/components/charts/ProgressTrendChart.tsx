import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface ProgressTrendChartProps {
  data: { week: string; readiness: number; completedTasks: number }[];
}

export const ProgressTrendChart: React.FC<ProgressTrendChartProps> = ({ data }) => {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="week"
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            formatter={(value: any, name: any) => [
              name === 'readiness' ? `${value}%` : `${value} tasks`,
              name === 'readiness' ? 'Readiness Score' : 'Completed Tasks'
            ]}
            contentStyle={{
              backgroundColor: '#ffffff',
              borderColor: '#e2e8f0',
              borderRadius: '8px',
              fontSize: '12px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}
          />
          <Area
            type="monotone"
            dataKey="readiness"
            stroke="#0F5C7A"
            strokeWidth={2}
            fillOpacity={0.12}
            fill="#0F5C7A"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
