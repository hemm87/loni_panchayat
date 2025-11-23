import React from 'react';
import { Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  propertyId: string;
  ownerName: string;
  action: 'paid' | 'pending';
  amount: number;
  date: string;
  taxYear: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

/**
 * RecentActivity Component
 * Displays recent payment activities and updates
 */
export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div 
      className="bg-card rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 md:p-7 border border-border hover:border-primary/30 animate-slide-up"
      style={{ animationDelay: '200ms' }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg md:text-xl font-headline font-bold text-foreground flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <span>
            Recent Activity <span className="text-muted-foreground/60">•</span>{' '}
            <span className="font-hindi text-muted-foreground">हाल की गतिविधि</span>
          </span>
        </h3>
      </div>

      <div className="space-y-3">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div
              key={activity.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg transition-all duration-200",
                "hover:bg-muted/50 border border-transparent hover:border-border/50",
                "group cursor-pointer"
              )}
            >
              <div className={cn(
                "mt-1 p-2 rounded-lg",
                activity.action === 'paid' 
                  ? 'bg-success/10 text-success' 
                  : 'bg-orange-500/10 text-orange-600'
              )}>
                {activity.action === 'paid' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground truncate">
                      {activity.ownerName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Property: {activity.propertyId} • FY {activity.taxYear}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={cn(
                      "text-sm font-bold",
                      activity.action === 'paid' ? 'text-success' : 'text-orange-600'
                    )}>
                      ₹{activity.amount.toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />
                      {formatDate(activity.date)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Clock className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
};
