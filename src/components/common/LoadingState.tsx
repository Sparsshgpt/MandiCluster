import React from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const LoadingState: React.FC<{ message?: string }> = ({ message }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3 min-h-[220px]">
      <Loader2 className="w-8 h-8 text-forest animate-spin" />
      <p className="text-sm text-slate-500 font-medium">{message || t('common.loading', 'Loading data...')}</p>
    </div>
  );
};
