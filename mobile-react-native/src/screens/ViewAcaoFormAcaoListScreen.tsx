import React from 'react';
import { ModuleTabs } from '../ModuleTabs';

const CAMPO_COLUMNS = [
  { key: 'rotulo', label: 'Rótulo' },
  { key: 'nome', label: 'Nome' },
  { key: 'tipo', label: 'Tipo de Campo' },
  { key: 'categoria', label: 'Categoria de Campo' },
  { key: 'obrigatorio', label: 'Obrigatório' },
  { key: 'permitirHistorico', label: 'Permitir Histórico' },
  { key: 'ordem', label: 'Ordem' },
];

const UNIDADE_COLUMNS = [
  { key: 'id', label: 'Id' },
  { key: 'sucinto', label: 'Sucinto' },
  { key: 'razaoSocial', label: 'Razão Social' },
  { key: 'nomeFantasia', label: 'Nome Fantasia' },
  { key: 'CNPJ', label: 'CNPJ' },
  { key: 'ativo', label: 'Ativo' },
];

export default function ViewAcaoFormAcaoListScreen() {
  return (
    <ModuleTabs
      tabs={[
        { key: 'acao', label: 'Ação', path: '/api/view/acao/formAcao' },
        {
          key: 'campos',
          label: 'Campos',
          masterDetail: {
            label: 'Campo',
            source: '/api/view/campo/listCampo',
            valueKey: 'id',
            searchKeys: ['rotulo', 'nome', 'tipo'],
            columns: CAMPO_COLUMNS,
          },
        },
        {
          key: 'unidade',
          label: 'Unidade',
          masterDetail: {
            label: 'Unidade',
            source: '/api/view/unidade/listUnidade',
            valueKey: 'id',
            searchKeys: ['sucinto', 'razaoSocial', 'nomeFantasia'],
            columns: UNIDADE_COLUMNS,
          },
        },
      ]}
    />
  );
}
