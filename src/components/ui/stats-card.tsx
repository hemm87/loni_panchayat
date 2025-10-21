
'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  titleHi: string;
  value: string;
  icon: string;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCard({ title, titleHi, value, icon, color, trend }: StatsCardProps) {
    const colorClasses: { [key: string]: { gradient: string, text: string, shadow: string } } = {
        'bg-blue-500': { gradient: 'from-blue-500 to-sky-500', text: 'text-blue-500', shadow: 'shadow-blue-500/30' },
        'bg-green-500': { gradient: 'from-green-500 to-emerald-500', text: 'text-green-500', shadow: 'shadow-green-500/30' },
        'bg-orange-500': { gradient: 'from-orange-500 to-amber-500', text: 'text-orange-500', shadow: 'shadow-orange-500/30' },
        'bg-purple-500': { gradient: 'from-purple-500 to-violet-500', text: 'text-purple-500', shadow: 'shadow-purple-500/30' },
      };

  const selectedColor = colorClasses[color] || { gradient: 'from-gray-500 to-slate-500', text: 'text-gray-500', shadow: 'shadow-gray-500/30' };

  return (
    <div className={cn("group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-border", selectedColor.shadow)}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={cn('p-4 rounded-lg bg-gradient-to-br text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300', selectedColor.gradient)}>
            <span className="text-2xl">{icon}</span>
          </div>
          
          {trend && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
              trend.isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {trend.isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-base font-bold text-muted-foreground">{title} • {titleHi}</h3>
          <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
        </div>
      </div>
      <div className={cn("absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r rounded-b-xl", selectedColor.gradient)}></div>
    </div>
  );
}
