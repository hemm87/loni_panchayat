import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { MonthlyRevenueData } from '../hooks/useDashboardData';

interface RevenueChartProps {
  data: MonthlyRevenueData[];
}

/**
 * RevenueChart Component
 * Displays monthly revenue as a smooth gradient area chart
 */
export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const chartData = data.length > 0 ? data : [];
  
  return (
    <div className="backdrop-blur-sm bg-card/80 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 p-6 md:p-7 border border-border/40 hover:border-primary/50 animate-slide-up relative overflow-hidden hover:-translate-y-1 hover:scale-[1.01]">
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
      <div className="relative z-10">
      <h3 className="text-lg md:text-xl font-headline font-bold text-foreground mb-6 flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <span>
          Revenue Trend <span className="text-muted-foreground/60">•</span>{' '}
          <span className="font-hindi text-muted-foreground">राजस्व प्रवृत्ति</span>
        </span>
      </h3>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis 
              dataKey="month" 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontFamily: 'Noto Sans, sans-serif', fontSize: 12 }}
              tickLine={false}
            />
            <YAxis 
              tickFormatter={(value) => `Rs. ${(Number(value) / 1000).toFixed(0)}K`}
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontFamily: 'Noto Sans, sans-serif', fontSize: 12 }}
              tickLine={false}
            />
            <Tooltip 
              formatter={(value: number) => [`Rs. ${value.toLocaleString('en-IN')}`, 'Revenue']}
              labelFormatter={(label) => `Month: ${label}`}
              contentStyle={{ 
                fontFamily: 'Noto Sans, sans-serif',
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                padding: '8px 12px'
              }}
              cursor={{ strokeDasharray: '3 3', stroke: 'hsl(var(--primary))' }}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2.5}
              fillOpacity={1} 
              fill="url(#colorRevenue)"
              dot={false}
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-80 flex items-center justify-center text-gray-400">
          <p>No revenue data available</p>
        </div>
      )}
      </div>
    </div>
  );
};
