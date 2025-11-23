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
          <div className="p-2.5 bg-gradient-to-br from-success/20 to-success/10 rounded-xl shadow-md">
            <Building2 className="w-5 h-5 text-success" />
          </div>
          <span>
            Property Distribution <span className="text-muted-foreground/60">•</span>{' '}
            <span className="font-hindi text-muted-foreground">संपत्ति वितरण</span>
          </span>
        </h3>
        {data.filter(d => d.value > 0).length > 0 ? (
          <div className="space-y-5">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <defs>
                  <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.15"/>
                  </filter>
                </defs>
                <Pie
                  data={data.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  paddingAngle={2}
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
                        fontSize="15"
                        fontWeight="700"
                        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
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
                      opacity={activeIndex === null || activeIndex === index ? 1 : 0.4}
                      className="transition-all duration-300 cursor-pointer"
                      style={{ 
                        filter: activeIndex === index ? 'url(#shadow)' : 'none',
                        transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)',
                        transformOrigin: 'center'
                      }}
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
          <div className="grid grid-cols-3 gap-3">
            {data.filter(d => d.value > 0).map((item, idx) => {
              const total = data.filter(d => d.value > 0).reduce((sum, d) => sum + d.value, 0);
              const percent = ((item.value / total) * 100).toFixed(0);
              return (
                <div 
                  key={idx} 
                  className="group text-center p-4 bg-gradient-to-br from-card via-card/95 to-card/90 rounded-xl hover:from-muted/60 hover:via-muted/50 hover:to-muted/40 transition-all duration-300 border-2 border-border/40 hover:border-border shadow-md hover:shadow-xl hover:-translate-y-1 cursor-pointer relative overflow-hidden"
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <div className="relative z-10">
                    <div 
                      className="w-3 h-3 rounded-full mx-auto mb-2 shadow-lg" 
                      style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }}
                    />
                    <div className="text-3xl font-bold text-foreground mb-1 group-hover:scale-110 transition-transform duration-300">{item.value}</div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{item.name}</div>
                    <div className="text-xs font-bold mt-1.5 px-2 py-0.5 bg-muted/50 rounded-full inline-block" style={{ color: DONUT_COLORS[idx % DONUT_COLORS.length] }}>{percent}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        ) : (
          <div className="h-80 flex flex-col items-center justify-center text-muted-foreground">
            <Building2 className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-sm font-medium">No property data available</p>
          </div>
        )}
      </div>
    </div>
  );
};
