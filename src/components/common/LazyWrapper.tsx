import React, { Suspense } from 'react';
import { InlineLoader } from './LoadingComponents';

interface LazyWrapperProps {
  children: React.ReactNode;
  loadingText?: string;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({ 
  children, 
  loadingText = "Loading..."
}) => {
  return (
    <Suspense fallback={<InlineLoader size="large" text={loadingText} />}>
      {children}
    </Suspense>
  );
};