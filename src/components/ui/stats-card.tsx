
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
  const colorClasses: { [key: string]: { gradient: string, text: string, shadow: string, bg: string, border: string } } = {
    'bg-blue-500': { 
      gradient: 'from-primary via-primary/90 to-primary/80', 
      text: 'text-primary', 
      shadow: 'shadow-primary/10 hover:shadow-primary/20',
      bg: 'bg-primary/5',
      border: 'border-primary/20'
    },
    'bg-green-500': { 
      gradient: 'from-success via-success/90 to-success/80', 
      text: 'text-success', 
      shadow: 'shadow-success/10 hover:shadow-success/20',
      bg: 'bg-success/5',
      border: 'border-success/20'
    },
    'bg-orange-500': { 
      gradient: 'from-accent via-accent/90 to-accent/80', 
      text: 'text-accent', 
      shadow: 'shadow-accent/10 hover:shadow-accent/20',
      bg: 'bg-accent/5',
      border: 'border-accent/20'
    },
    'bg-purple-500': { 
      gradient: 'from-purple-500 via-purple-600 to-violet-600', 
      text: 'text-purple-600', 
      shadow: 'shadow-purple-500/10 hover:shadow-purple-500/20',
      bg: 'bg-purple-50',
      border: 'border-purple-200'
    },
  };

  const selectedColor = colorClasses[color] || { 
    gradient: 'from-muted via-muted/90 to-muted/80', 
    text: 'text-muted-foreground', 
    shadow: 'shadow-muted/10 hover:shadow-muted/20',
    bg: 'bg-muted/20',
    border: 'border-border'
  };

  return (
    <div 
      className={cn(
        "group relative bg-card rounded-2xl transition-all duration-300",
        "border-2 hover:border-opacity-60",
        "hover-lift hover:shadow-xl",
        "animate-fade-in",
        "overflow-hidden",
        selectedColor.shadow,
        selectedColor.border
      )}
    >
      {/* Gradient Background Accent */}
      <div 
        className={cn(
          "absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full blur-3xl transition-opacity duration-300 group-hover:opacity-10",
          selectedColor.bg
        )}
      />
      
      <div className="relative p-6 md:p-7">
        <div className="flex items-start justify-between mb-5">
          {/* Icon Container with Premium Gradient */}
          <div 
            className={cn(
              'relative p-4 rounded-xl bg-gradient-to-br text-white shadow-lg',
              'transform group-hover:scale-110 group-hover:rotate-3',
              'transition-all duration-300',
              selectedColor.gradient
            )}
          >
            <span className="text-2xl" role="img" aria-label={title}>
              {icon}
            </span>
            
            {/* Shine Effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          
          {/* Trend Indicator */}
          {trend && (
            <div 
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold",
                "shadow-sm transition-all duration-200",
                "animate-scale-in",
                trend.isPositive 
                  ? 'bg-success/10 text-success border border-success/20' 
                  : 'bg-destructive/10 text-destructive border border-destructive/20'
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground tracking-wide">
            {title} <span className="text-muted-foreground/60">•</span> <span className="font-hindi">{titleHi}</span>
          </h3>
          <p 
            className={cn(
              "text-4xl font-headline font-bold tracking-tight",
              "bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text",
              "transition-all duration-300 group-hover:scale-105"
            )}
          >
            {value}
          </p>
        </div>
      </div>
      
      {/* Bottom Accent Bar */}
      <div 
        className={cn(
          "absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r transition-all duration-300",
          "group-hover:h-1.5",
          selectedColor.gradient
        )}
      />
    </div>
  );
}
