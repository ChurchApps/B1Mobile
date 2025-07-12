import React, { lazy } from 'react';
import { LazyWrapper } from '@/components/common/LazyWrapper';

// Lazy load heavy donation components
const LazyEnhancedDonationForm = lazy(() => 
  import('./EnhancedDonationForm').then(module => ({ 
    default: module.EnhancedDonationForm 
  }))
);

const LazyEnhancedGivingHistory = lazy(() => 
  import('./EnhancedGivingHistory').then(module => ({ 
    default: module.EnhancedGivingHistory 
  }))
);

const LazyPaymentMethods = lazy(() => 
  import('./PaymentMethods').then(module => ({ 
    default: module.PaymentMethods 
  }))
);

// Wrapper components with lazy loading
export const EnhancedDonationForm: React.FC<any> = (props) => (
  <LazyWrapper skeletonType="donation">
    <LazyEnhancedDonationForm {...props} />
  </LazyWrapper>
);

export const EnhancedGivingHistory: React.FC<any> = (props) => (
  <LazyWrapper skeletonType="giving">
    <LazyEnhancedGivingHistory {...props} />
  </LazyWrapper>
);

export const PaymentMethods: React.FC<any> = (props) => (
  <LazyWrapper skeletonType="list" skeletonCount={2}>
    <LazyPaymentMethods {...props} />
  </LazyWrapper>
);