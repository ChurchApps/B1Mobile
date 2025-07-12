import React, { lazy } from 'react';
import { LazyWrapper } from '@/components/common/LazyWrapper';

// Lazy load heavy plan components
const LazyBlockoutDates = lazy(() => 
  import('./BlockoutDates').then(module => ({ 
    default: module.BlockoutDates 
  }))
);

const LazyServingTimes = lazy(() => 
  import('./ServingTimes').then(module => ({ 
    default: module.ServingTimes 
  }))
);

const LazyUpcomingDates = lazy(() => 
  import('./UpcomingDates').then(module => ({ 
    default: module.UpcomingDates 
  }))
);

// Wrapper components with lazy loading
export const BlockoutDates: React.FC<any> = (props) => (
  <LazyWrapper loadingText="Loading blockout dates...">
    <LazyBlockoutDates {...props} />
  </LazyWrapper>
);

export const ServingTimes: React.FC<any> = (props) => (
  <LazyWrapper loadingText="Loading serving times...">
    <LazyServingTimes {...props} />
  </LazyWrapper>
);

export const UpcomingDates: React.FC<any> = (props) => (
  <LazyWrapper loadingText="Loading upcoming dates...">
    <LazyUpcomingDates {...props} />
  </LazyWrapper>
);