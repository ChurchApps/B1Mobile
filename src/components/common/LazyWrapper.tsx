import React, { Suspense } from 'react';
import { 
  SkeletonCard, 
  SkeletonDonationForm, 
  SkeletonGivingHistory, 
  SkeletonPlanItem,
  SkeletonSermonCard,
  SkeletonList 
} from './SkeletonLoader';

interface LazyWrapperProps {
  children: React.ReactNode;
  skeletonType?: 'card' | 'donation' | 'giving' | 'plan' | 'sermon' | 'list';
  skeletonCount?: number;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({ 
  children, 
  skeletonType = 'card',
  skeletonCount = 3
}) => {
  const getSkeletonFallback = () => {
    switch (skeletonType) {
      case 'donation':
        return <SkeletonDonationForm />;
      case 'giving':
        return <SkeletonGivingHistory />;
      case 'plan':
        return <SkeletonPlanItem />;
      case 'sermon':
        return <SkeletonSermonCard />;
      case 'list':
        return <SkeletonList count={skeletonCount} />;
      default:
        return <SkeletonCard />;
    }
  };

  return (
    <Suspense fallback={getSkeletonFallback()}>
      {children}
    </Suspense>
  );
};