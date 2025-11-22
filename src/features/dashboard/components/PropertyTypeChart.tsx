import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { Building } from 'lucide-react';
import type { PropertyTypeData } from '../hooks/useDashboardData';

interface PropertyTypeChartProps {
  data: PropertyTypeData[];
}

const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

/**
 * PropertyTypeChart Component
 * Displays property distribution by type as a pie chart
 */
export const PropertyTypeChart: React.FC<PropertyTypeChartProps> = ({ data }) => {
  return (
    <div 
      className="bg-card rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 md:p-7 border border-border hover:border-primary/30 animate-slide-up" 
      style={{ animationDelay: '100ms' }}
    >
      <h3 className="text-lg md:text-xl font-headline font-bold text-foreground mb-6 flex items-center gap-3">
        <div className="p-2 bg-success/10 rounded-lg">
          <Building className="w-5 h-5 text-success" />
        </div>
        <span>
          Property Distribution <span className="text-muted-foreground/60">•</span>{' '}
          <span className="font-hindi text-muted-foreground">संपत्ति वितरण</span>
        </span>
      </h3>
      {data.some(d => d.value > 0) ? (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
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
                    fontFamily="Noto Sans, Segoe UI, Arial Unicode MS, sans-serif"
                  >
                    {`${(percent * 100).toFixed(0)}%`}
                  </text>
                );
              }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ fontFamily: 'Noto Sans, Segoe UI, Arial Unicode MS, sans-serif' }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-400">
          <p>No property data to display distribution.</p>
        </div>
      )}
    </div>
  );
};
