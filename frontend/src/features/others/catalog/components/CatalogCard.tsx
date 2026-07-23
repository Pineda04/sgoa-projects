import type { ReactNode } from 'react';

interface CatalogCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export const CatalogCard = ({ icon, title, description }: CatalogCardProps) => {
  return (
    <div className="bg-muted/30 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-border/50 hover:border-primary/20 transition-colors duration-200 cursor-pointer">
      <div className='flex items-center'>
        <div className="gap-2 sm:gap-3">
          <div className="size-8 sm:size-10 bg-primary/10 rounded-lg flex items-center justify-center">
            {icon}
          </div>
        </div>
        <div className="pl-2 sm:pl-4">
          <span className="text-xs sm:text-sm font-medium text-foreground">{title}</span>
          <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
};
