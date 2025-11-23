
'use client';

import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SparklineData {
  month: string;
  value: number;
}

interface StatsCardProps {
  title: string;
  titleHi: string;
  value: string;
  icon: LucideIcon;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  sparklineData?: SparklineData[];
}

export function StatsCard({ title, titleHi, value, icon: Icon, color, trend, sparklineData }: StatsCardProps) {
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
        "group relative backdrop-blur-sm bg-card/80 rounded-2xl transition-all duration-500",
        "border border-border/40 hover:border-opacity-100",
        "hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02]",
        "animate-fade-in",
        "overflow-hidden",
        "shadow-lg",
        selectedColor.shadow,
        "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500"
      )}
    >
      {/* Animated Gradient Background */}
      <div 
        className={cn(
          "absolute top-0 right-0 w-48 h-48 opacity-[0.05] rounded-full blur-3xl transition-all duration-500",
          "group-hover:opacity-[0.15] group-hover:scale-110 group-hover:rotate-45",
          selectedColor.bg
        )}
      />
      {/* Shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>
      
      <div className="relative p-6 md:p-7">
        <div className="flex items-start justify-between mb-5">
          {/* Icon Container with 3D Effect */}
          <div 
            className={cn(
              'relative p-4 rounded-2xl bg-gradient-to-br from-white to-white/80 shadow-2xl',
              'transform group-hover:scale-125 group-hover:rotate-12',
              'transition-all duration-500 ease-out',
              'border border-border/30',
              'before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/40 before:to-transparent',
              'after:absolute after:inset-0 after:rounded-2xl after:shadow-inner after:opacity-50'
            )}
            style={{
              transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
              transition: 'transform 0.5s ease-out'
            }}
          >
            <Icon className={cn("w-8 h-8 relative z-10", selectedColor.text)} strokeWidth={2.5} />
            
            {/* Glossy Shine Effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-60" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/20 to-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
          
          {/* Trend Indicator Removed - Cleaner Look */}
        </div>

        {/* Content */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
            {title}
          </h3>
          <p className="text-[10px] font-hindi text-muted-foreground/80 -mt-1">{titleHi}</p>
          <p 
            className={cn(
              "text-4xl md:text-5xl font-headline font-bold tracking-tight",
              "bg-gradient-to-br from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent",
              "transition-all duration-500 group-hover:scale-110",
              "drop-shadow-sm"
            )}
            style={{
              textShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            {value}
          </p>
          
          {/* Sparkline Indicator */}
          {sparklineData && sparklineData.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border/30">
              <div className="flex items-end justify-between gap-1 h-10">
                {sparklineData.map((point, idx) => {
                  const maxValue = Math.max(...sparklineData.map(p => p.value));
                  const height = (point.value / maxValue) * 100;
                  return (
                    <div 
                      key={idx}
                      className={cn(
                        "flex-1 rounded-t transition-all duration-300",
                        "bg-gradient-to-t hover:opacity-100 opacity-70",
                        selectedColor.gradient
                      )}
                      style={{ height: `${Math.max(height, 10)}%` }}
                      title={`${point.month}: ${point.value}`}
                    />
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Last 6 months trend</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom Accent Bar */}
      <div 
        className={cn(
          "absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r transition-all duration-300",
          "group-hover:h-2",
          selectedColor.gradient
        )}
      />
    </div>
  );
}
