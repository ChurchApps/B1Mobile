import React, { createContext, useContext, ReactNode } from 'react';
import { 
  SkeletonList, 
  SkeletonCard, 
  SkeletonDonationForm, 
  SkeletonGivingHistory,
  SkeletonPlanItem,
  SkeletonSermonCard,
  SkeletonProfileHeader 
} from './SkeletonLoader';

interface SkeletonContextType {
  renderSkeleton: (type: string, count?: number) => ReactNode;
}

const SkeletonContext = createContext<SkeletonContextType | undefined>(undefined);

export const useSkeletonContext = () => {
  const context = useContext(SkeletonContext);
  if (!context) {
    throw new Error('useSkeletonContext must be used within a SkeletonProvider');
  }
  return context;
};

interface SkeletonProviderProps {
  children: ReactNode;
}

export const SkeletonProvider: React.FC<SkeletonProviderProps> = ({ children }) => {
  const renderSkeleton = (type: string, count: number = 3): ReactNode => {
    switch (type) {
      case 'list':
        return <SkeletonList count={count} />;
      case 'donation-form':
        return <SkeletonDonationForm />;
      case 'giving-history':
        return <SkeletonGivingHistory />;
      case 'plan':
        return <SkeletonPlanItem />;
      case 'sermon':
        return <SkeletonSermonCard />;
      case 'profile':
        return <SkeletonProfileHeader />;
      case 'card':
      default:
        return <SkeletonCard />;
    }
  };

  return (
    <SkeletonContext.Provider value={{ renderSkeleton }}>
      {children}
    </SkeletonContext.Provider>
  );
};

// HOC to wrap components with skeleton loading
export function withSkeleton<P extends object>(
  Component: React.ComponentType<P>,
  skeletonType: string,
  skeletonCount?: number
) {
  return (props: P & { isLoading?: boolean; hasData?: boolean }) => {
    const { renderSkeleton } = useSkeletonContext();
    const { isLoading, hasData, ...componentProps } = props;

    if (isLoading && !hasData) {
      return <>{renderSkeleton(skeletonType, skeletonCount)}</>;
    }

    return <Component {...(componentProps as P)} />;
  };
}