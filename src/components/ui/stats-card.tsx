'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

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
  const colorClasses: Record<string, string> = {
    'bg-blue-500': 'from-blue-400 to-blue-600',
    'bg-green-500': 'from-green-400 to-green-600',
    'bg-orange-500': 'from-orange-400 to-orange-600',
    'bg-purple-500': 'from-purple-400 to-purple-600',
  };

  const gradientClass = colorClasses[color] || 'from-gray-400 to-gray-600';

  return (
    <div className="group relative overflow-hidden bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg bg-gradient-to-br ${gradientClass} text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
            <span className="text-3xl">{icon}</span>
          </div>
          
          {trend && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-bold ${
              trend.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {trend.isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className={`text-3xl font-bold bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent`}>
            {value}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-600">{titleHi}</p>
          </div>
        </div>

        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradientClass} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
      </div>
    </div>
  );
}
