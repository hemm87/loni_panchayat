
'use client';

import { Button } from '@/components/ui/button';
import { FileSearch, FolderOpen, PlusCircle, BarChart3, Search } from 'lucide-react';

interface NoPropertiesStateProps {
  onAddNew: () => void;
}

export function NoPropertiesState({ onAddNew }: NoPropertiesStateProps) {
  return (
    <div className="text-center py-20 bg-white rounded-xl shadow-md border-2 border-dashed">
      <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
      <h3 className="text-2xl font-bold text-gray-800 mb-2">No Properties Found</h3>
      <p className="text-gray-500 mb-6">Get started by registering your first property to see it here.</p>
      <Button onClick={onAddNew} size="lg" className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <PlusCircle className="mr-2 h-5 w-5" />
        Register New Property
      </Button>
    </div>
  );
}

export function NoReportsState() {
  return (
    <div className="text-center py-20 bg-white rounded-xl shadow-md text-gray-400 border-2 border-dashed">
        <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <h3 className="text-2xl font-bold text-gray-800 mb-2">No Reports Available Yet</h3>
        <p className="text-gray-500">Generate a report using the filters above to see the data here.</p>
        <p className="mt-4 text-sm">Connect Firebase to generate reports from database</p>
      </div>
  );
}

interface SearchEmptyStateProps {
    onClear: () => void;
}

export function SearchEmptyState({ onClear }: SearchEmptyStateProps) {
    return (
        <div className="text-center py-10">
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Results Found</h3>
            <p className="text-gray-500 mb-6">Your search returned no results. Try a different filter.</p>
            <Button variant="outline" onClick={onClear}>
                Clear Search
            </Button>
        </div>
    );
}

    