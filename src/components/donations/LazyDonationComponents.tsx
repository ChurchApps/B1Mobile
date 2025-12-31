import React, { lazy } from 'react';
import { LazyWrapper } from '@/components/common/LazyWrapper';
import { useTranslation } from 'react-i18next';

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
export const EnhancedDonationForm: React.FC<any> = (props) => {
  const { t } = useTranslation();
  return (
    <LazyWrapper loadingText={t("donations.loadingDonationForm")}>
      <LazyEnhancedDonationForm {...props} />
    </LazyWrapper>
  );
};

export const EnhancedGivingHistory: React.FC<any> = (props) => {
  const { t } = useTranslation();
  return (
    <LazyWrapper loadingText={t("donations.loadingGivingHistory")}>
      <LazyEnhancedGivingHistory {...props} />
    </LazyWrapper>
  );
};

export const PaymentMethods: React.FC<any> = (props) => {
  const { t } = useTranslation();
  return (
    <LazyWrapper loadingText={t("donations.loadingPaymentMethods")}>
      <LazyPaymentMethods {...props} />
    </LazyWrapper>
  );
};