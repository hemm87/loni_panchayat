import { getProperties } from '@/lib/data';
import { PropertiesTable } from '@/components/properties/properties-table';
import type { Property } from '@/lib/types';

export default async function PropertiesPage() {
  const properties: Property[] = await getProperties();
  
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
          Property Records
        </h1>
        <p className="text-muted-foreground">
          View and manage all properties in the system.
        </p>
      </div>
      <PropertiesTable data={properties} />
    </div>
  );
}
