import React, { useState } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { Building2 } from 'lucide-react';
import type { PropertyTypeData } from '../hooks/useDashboardData';

interface PropertyTypeChartProps {
  data: PropertyTypeData[];
}

const DONUT_COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--accent))'];

/**
 * PropertyTypeChart Component
 * Displays property distribution by type as an interactive donut chart
 */
export const PropertyTypeChart: React.FC<PropertyTypeChartProps> = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleMouseEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
  };

  return (
    <div 
      className="backdrop-blur-sm bg-card/80 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 p-6 md:p-7 border border-border/40 hover:border-success/50 animate-slide-up relative overflow-hidden hover:-translate-y-1 hover:scale-[1.01]" 
      style={{ animationDelay: '100ms' }}
    >
      <div className="absolute top-0 right-0 w-40 h-40 bg-success/5 rounded-full blur-3xl" />
      <div className="relative z-10">
      <h3 className="text-lg md:text-xl font-headline font-bold text-foreground mb-6 flex items-center gap-3">
        <div className="p-2 bg-success/10 rounded-lg">
          <Building2 className="w-5 h-5 text-success" />
        </div>
        <span>
          Property Distribution <span className="text-muted-foreground/60">•</span>{' '}\n          <span className="font-hindi text-muted-foreground">संपत्ति वितरण</span>
        </span>
      </h3>
      {data.some(d => d.value > 0) ? (
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);

                  return (
                    <text 
                      x={x} 
                      y={y} 
                      fill="white" 
                      textAnchor={x > cx ? 'start' : 'end'} 
                      dominantBaseline="central"
                      fontFamily="Noto Sans, sans-serif"
                      fontSize="14"
                      fontWeight="bold"
                    >
                      {`${(percent * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
              >
                {data.filter(d => d.value > 0).map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.5}
                    className="transition-opacity duration-200 cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value} properties`, 'Count']}
                contentStyle={{ 
                  fontFamily: 'Noto Sans, sans-serif',
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry) => {
                  const total = data.filter(d => d.value > 0).reduce((sum, d) => sum + d.value, 0);
                  const percent = ((entry.payload.value / total) * 100).toFixed(0);
                  return `${value}: ${entry.payload.value} (${percent}%)`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-2">
            {data.filter(d => d.value > 0).map((item, idx) => {
              const total = data.filter(d => d.value > 0).reduce((sum, d) => sum + d.value, 0);
              const percent = ((item.value / total) * 100).toFixed(0);
              return (
                <div key={idx} className="text-center p-3 bg-gradient-to-br from-muted/40 to-muted/20 rounded-lg hover:from-muted/60 hover:to-muted/40 transition-colors border border-border/40 hover:border-border/60">
                  <div className="text-2xl font-bold text-foreground">{item.value}</div>
                  <div className="text-xs font-medium text-muted-foreground">{item.name}</div>
                  <div className="text-xs text-muted-foreground/60 mt-1">{percent}%</div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="h-80 flex items-center justify-center text-gray-400">
          <p>No property data available</p>
        </div>
      )}
    </div>
  );
};
