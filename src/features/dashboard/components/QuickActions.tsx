import React from 'react';
import { UserPlus, FileText, BarChart3, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickActionsProps {
  onRegisterClick: () => void;
  onBillClick: () => void;
  onReportsClick: () => void;
}

/**
 * QuickActions Component
 * Displays quick action buttons for common dashboard tasks
 */
export const QuickActions: React.FC<QuickActionsProps> = ({
  onRegisterClick,
  onBillClick,
  onReportsClick,
}) => {
  return (
    <div 
      className="bg-card rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 md:p-8 border border-border animate-slide-up" 
      style={{ animationDelay: '200ms' }}
    >
      <h3 className="text-xl md:text-2xl font-headline font-bold text-foreground mb-8 flex items-center gap-3">
        <div className="p-2 bg-accent/10 rounded-lg">
          <Plus className="w-6 h-6 text-accent" />
        </div>
        <span>
          Quick Actions <span className="text-muted-foreground/60">•</span>{' '}
          <span className="font-hindi text-muted-foreground">त्वरित कार्य</span>
        </span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <button
          onClick={onRegisterClick}
          className={cn(
            "group relative overflow-hidden",
            "bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5",
            "border-2 border-primary/30 hover:border-primary hover:border-primary/80",
            "hover:shadow-2xl hover:shadow-primary/30",
            "transition-all duration-500 p-6 md:p-7 rounded-2xl text-center",
            "hover:-translate-y-2 hover:scale-105 active:scale-95",
            "backdrop-blur-sm",
            "before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500"
          )}
        >
          <div className="relative z-10">
            <div 
              className="rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-2xl" 
              style={{ 
                background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.8) 100%)',
                transform: 'perspective(1000px) rotateX(0deg)'
              }}
            >
              <UserPlus className="w-8 h-8 text-white drop-shadow-lg" strokeWidth={2.5} />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/30 to-transparent" />
            </div>
            <p className="font-bold text-base md:text-lg text-foreground mb-2 group-hover:text-primary transition-colors duration-300">Register New User</p>
            <p className="text-sm text-muted-foreground font-hindi">नया उपयोगकर्ता</p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </button>

        <button
          onClick={onBillClick}
          className={cn(
            "group relative overflow-hidden",
            "bg-gradient-to-br from-success/5 via-success/10 to-success/5",
            "backdrop-blur-sm",
            "border-2 border-success/20 hover:border-success",
            "hover:shadow-xl hover:shadow-success/20",
            "transition-all duration-300 p-6 md:p-7 rounded-2xl text-center",
            "hover-lift active:scale-95"
          )}
        >
          <div className="relative z-10">
            <div className="rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg" style={{ background: 'linear-gradient(135deg, hsl(var(--success)) 0%, hsl(var(--success-hover)) 100%)' }}>
              <FileText className="w-8 h-8 text-white" />
            </div>
            <p className="font-bold text-base md:text-lg text-foreground mb-2">Generate Bill</p>
            <p className="text-sm text-muted-foreground font-hindi">रसीद बनाएँ</p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-success/0 to-success/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>

        <button
          onClick={onReportsClick}
          className={cn(
            "group relative overflow-hidden",
            "bg-gradient-to-br from-purple-500/5 via-purple-500/10 to-purple-500/5",
            "border-2 border-purple-500/20 hover:border-purple-500",
            "hover:shadow-xl hover:shadow-purple-500/20",
            "transition-all duration-300 p-6 md:p-7 rounded-2xl text-center",
            "hover-lift active:scale-95",
            "sm:col-span-2 lg:col-span-1"
          )}
        >
          <div className="relative z-10">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <p className="font-bold text-base md:text-lg text-foreground mb-2">View Reports</p>
            <p className="text-sm text-muted-foreground font-hindi">रिपोर्ट देखें</p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      </div>
    </div>
  );
};
