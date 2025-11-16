import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';
import type { MonthlyRevenueData } from '../hooks/useDashboardData';

interface RevenueChartProps {
  data: MonthlyRevenueData[];
}

/**
 * RevenueChart Component
 * Displays monthly revenue as a bar chart
 */
export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  return (
    <div className="bg-card rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 md:p-7 border border-border hover:border-primary/30 animate-slide-up">
      <h3 className="text-lg md:text-xl font-headline font-bold text-foreground mb-6 flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <BarChart3 className="w-5 h-5 text-primary" />
        </div>
        <span>
          Monthly Revenue <span className="text-muted-foreground/60">•</span>{' '}
          <span className="font-hindi text-muted-foreground">मासिक राजस्व</span>
        </span>
      </h3>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
            <Tooltip 
              formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']} 
            />
            <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-400">
          <p>No revenue data available to display chart.</p>
        </div>
      )}
    </div>
  );
};
