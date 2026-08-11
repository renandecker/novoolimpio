import { useState } from 'react';
import { PermissionGate } from '../permissions';
import { DataTable, type DataTableColumn } from '../DataTable';
import { MasterDetail } from '../MasterDetail';
import { Wizard } from '../Wizard';
import {
  UNIDADE_SOURCE,
  UNIDADE_COLUMNS,
  UNIDADE_SEARCH,
  COMPONENTE_SOURCE,
  COMPONENTE_COLUMNS,
  COMPONENTE_SEARCH,
} from '../masterDetailSources';
import type { ApiItem } from '../types';

const CURSO_COLUMNS: DataTableColumn[] = [
  { key: 'descricao', label: 'Descrição' },
  { key: 'sucinto', label: 'Sucinto' },
  { key: 'sigla', label: 'Sigla' },
  { key: 'tipoCursoId', label: 'Tipo Curso' },
  { key: 'cargaHoraria', label: 'Carga Horária' },
];

const REQUISITO_COLUMNS: DataTableColumn[] = [
  { key: 'nome', label: 'Nome' },
];

const MATERIAL_ESCOLAR_COLUMNS: DataTableColumn[] = [
  { key: 'produtoId', label: 'Produto' },
  { key: 'curriculoId', label: 'Currículo' },
  { key: 'quantidade', label: 'Quantidade' },
];

export default function ViewCurriculoFormCurriculoListScreen() {
  const [matriz, setMatriz] = useState<ApiItem[]>([]);
  const [unidades, setUnidades] = useState<ApiItem[]>([]);

  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Form Curriculo</h1>
        <div className="div_form">
          <div className="form-title">Currículo de Curso</div>
          <div className="table_form">
            <Wizard
              steps={[
                {
                  key: 'curriculo',
                  label: 'Curso',
                  content: <DataTable path="/api/educacao/curriculo" columns={CURSO_COLUMNS} />,
                },
                { key: 'licenca', label: 'Licença', content: <p className="master-detail-empty">Informações de licença do curso.</p> },
                {
                  key: 'matrizCurricular',
                  label: 'Matriz Curricular',
                  content: (
                    <MasterDetail
                      label="Componente Curricular"
                      source={COMPONENTE_SOURCE}
                      valueKey="id"
                      searchKeys={COMPONENTE_SEARCH}
                      columns={COMPONENTE_COLUMNS}
                      items={matriz}
                      onChange={setMatriz}
                    />
                  ),
                },
                {
                  key: 'requisitosMatrizCurricular',
                  label: 'Requisitos',
                  content: <DataTable path="/api/educacao/detail-requisito" columns={REQUISITO_COLUMNS} />,
                },
                {
                  key: 'unidade',
                  label: 'Unidade',
                  content: (
                    <MasterDetail
                      label="Unidade"
                      source={UNIDADE_SOURCE}
                      valueKey="id"
                      searchKeys={UNIDADE_SEARCH}
                      columns={UNIDADE_COLUMNS}
                      items={unidades}
                      onChange={setUnidades}
                    />
                  ),
                },
                { key: 'materialescolar', label: 'Material', content: <DataTable path="/api/educacao/material-escolar-curso" columns={MATERIAL_ESCOLAR_COLUMNS} /> },
                {
                  key: 'contrato',
                  label: 'Documentos',
                  nextLabel: 'Salvar',
                  content: <p className="master-detail-empty">Contratos, promissórias, certificados e boletins.</p>,
                },
              ]}
            />
          </div>
        </div>
      </main>
    </PermissionGate>
  );
}
