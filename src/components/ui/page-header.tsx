
'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  titleHi: string;
  description?: string;
  descriptionHi?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  action?: {
    label: string;
    labelHi: string;
    onClick: () => void;
    icon?: React.ReactNode;
    variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'link' | 'destructive' | null;
  };
  breadcrumbs?: Array<{
    label: string;
    onClick?: () => void;
  }>;
}

export function PageHeader({
  title,
  titleHi,
  description,
  descriptionHi,
  showBackButton,
  onBack,
  action,
  breadcrumbs,
}: PageHeaderProps) {
  return (
    <div className="space-y-5 animate-fade-in">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="flex items-center text-sm text-muted-foreground animate-slide-down">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              <button
                onClick={crumb.onClick}
                className={cn('hover:text-primary hover:underline transition-colors font-medium', !crumb.onClick && 'pointer-events-none')}
                disabled={!crumb.onClick}
              >
                {crumb.label}
              </button>
              {index < breadcrumbs.length - 1 && <span className="mx-2 text-border">/</span>}
            </React.Fragment>
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex items-center gap-4 animate-slide-up">
          {showBackButton && (
            <Button variant="outline" size="icon" onClick={onBack} className="shrink-0 hover:-translate-x-1 transition-transform">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
          )}
          <div>
            <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight" style={{ background: 'linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {title}
            </h1>
            <p className="text-base text-muted-foreground mt-1.5 font-hindi">{titleHi}</p>
            {description && (
              <p className="mt-3 text-sm text-muted-foreground max-w-2xl">
                {description} <span className="text-muted-foreground/60">•</span> <span className="font-hindi">{descriptionHi}</span>
              </p>
            )}
          </div>
        </div>
        {action && (
          <Button
            onClick={action.onClick}
            variant={action.variant || 'default'}
            size="lg"
            className="shrink-0 animate-slide-up hover:-translate-y-0.5 shadow-md hover:shadow-lg"
            style={{ animationDelay: '100ms' }}
          >
            {action.icon}
            <div className="flex flex-col text-left -space-y-0.5">
                <span className="font-semibold">{action.label}</span>
                <span className="text-xs opacity-80 font-hindi">{action.labelHi}</span>
            </div>
          </Button>
        )}
      </div>
    </div>
  );
}
