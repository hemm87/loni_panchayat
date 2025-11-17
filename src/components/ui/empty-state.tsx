
'use client';

import { Button } from '@/components/ui/button';
import { FileSearch, FolderOpen, PlusCircle, BarChart3, Search } from 'lucide-react';

interface NoPropertiesStateProps {
  onAddNew: () => void;
}

export function NoPropertiesState({ onAddNew }: NoPropertiesStateProps) {
  return (
    <div className="text-center py-24 bg-card rounded-2xl shadow-sm border-2 border-dashed border-border/60 hover:border-primary/30 transition-all">
      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted/50 flex items-center justify-center">
        <FolderOpen className="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 className="text-2xl font-bold text-foreground mb-2">No Properties Found</h3>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">Get started by registering your first property to see it here.</p>
      <Button onClick={onAddNew} size="lg" variant="success" className="shadow-lg hover:shadow-xl">
        <PlusCircle className="mr-2 h-5 w-5" />
        Register New Property
      </Button>
    </div>
  );
}

export function NoReportsState() {
  return (
    <div className="text-center py-24 bg-card rounded-2xl shadow-sm border-2 border-dashed border-border/60 hover:border-info/30 transition-all">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted/50 flex items-center justify-center">
          <BarChart3 className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">No Reports Available Yet</h3>
        <p className="text-muted-foreground max-w-md mx-auto">Generate a report using the filters above to see the data here.</p>
        <p className="mt-4 text-sm text-muted-foreground/70">Connect Firebase to generate reports from database</p>
      </div>
  );
}

interface SearchEmptyStateProps {
    onClear: () => void;
}

export function SearchEmptyState({ onClear }: SearchEmptyStateProps) {
    return (
        <div className="text-center py-16 px-6">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-muted/50 flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No Results Found</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">Your search returned no results. Try a different filter or search term.</p>
            <Button variant="outline" onClick={onClear} size="lg">
                Clear Search
            </Button>
        </div>
    );
}

    