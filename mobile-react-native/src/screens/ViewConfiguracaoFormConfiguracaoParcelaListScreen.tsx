import React from 'react';
import { ModuleTabs } from '../ModuleTabs';

export default function ViewConfiguracaoFormConfiguracaoParcelaListScreen() {
  return (
    <ModuleTabs
      tabs={[
        { key: 'geral', label: 'Geral', empty: 'Unidade do contrato.' },
        { key: 'parcelamento', label: 'Parcelamento', empty: 'Regras de parcelamento.' },
        { key: 'reparcelamento', label: 'Reparcelamento', empty: 'Regras de reparcelamento.' },
        { key: 'cancelamento', label: 'Cancelamento', empty: 'Regras de cancelamento.' },
      ]}
    />
  );
}
