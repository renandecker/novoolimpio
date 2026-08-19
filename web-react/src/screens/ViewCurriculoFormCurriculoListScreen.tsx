import { useState } from 'react';
import { PermissionGate } from '../permissions';
import { DataTable, type DataTableColumn } from '../DataTable';
import { MasterDetail } from '../MasterDetail';
import { Wizard, useWizardData } from '../Wizard';
import {
  UNIDADE_SOURCE,
  UNIDADE_COLUMNS,
  UNIDADE_SEARCH,
  COMPONENTE_SOURCE,
  COMPONENTE_COLUMNS,
  COMPONENTE_SEARCH,
} from '../masterDetailSources';
import type { ApiItem } from '../types';
import { useApi } from '../api';

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

interface CurriculoData {
  entity: {
    id?: number;
    cursoId?: number;
    sucinto?: string;
    tipoCursoId?: number;
    descricao?: string;
    grauId?: number;
    descricaoDiploma?: string;
    sigla?: string;
    numeroParecer?: string;
    dataCancelamento?: string;
    possuiRematricula?: boolean;
    escolaridadeId?: number;
    licenca?: string;
    reconhecimento?: string;
    qtdMaximaAlunos?: number;
    idadeMinima?: number;
    idadeMaxima?: number;
    qtdeIniciando?: number;
    qtdeFinalizando?: number;
    tipoModeloContrato?: number;
    tipoModeloPromissoria?: number;
    tipoModeloCertificado?: number;
    tipoModeloBoletim?: number;
  };
  matrizCurricular: ApiItem[];
  requisitos: any[];
  unidades: ApiItem[];
  materialEscolar: any[];
}

export default function ViewCurriculoFormCurriculoListScreen() {
  const { data, updateFields, updateField } = useWizardData<CurriculoData>({
    entity: {},
    matrizCurricular: [],
    requisitos: [],
    unidades: [],
    materialEscolar: [],
  });

  const { post: saveCurriculo } = useApi('/api/educacao/curriculo');

  const validateStep1 = async (currentData: CurriculoData) => {
    if (!currentData.entity.cursoId) return 'Selecione o curso';
    if (!currentData.entity.tipoCursoId) return 'Selecione o tipo de curso';
    if (!currentData.entity.grauId) return 'Selecione o requisito de aprovação (grau)';
    if (currentData.entity.idadeMaxima && currentData.entity.idadeMinima && 
        currentData.entity.idadeMaxima < currentData.entity.idadeMinima) {
      return 'A idade mínima não pode ser maior que a idade máxima';
    }
    if (currentData.entity.idadeMaxima && currentData.entity.idadeMaxima <= 0) {
      return 'A idade máxima deve ser maior que zero';
    }
    if (currentData.entity.idadeMinima && currentData.entity.idadeMinima <= 0) {
      return 'A idade mínima deve ser maior que zero';
    }
    if (currentData.entity.qtdMaximaAlunos && currentData.entity.qtdMaximaAlunos <= 0) {
      return 'A quantidade máxima de alunos deve ser maior que zero';
    }
    return true;
  };

  const validateStep3 = async (currentData: CurriculoData) => {
    if (!currentData.matrizCurricular || currentData.matrizCurricular.length === 0) {
      return 'Adicione pelo menos um componente curricular à matriz';
    }
    return true;
  };

  const validateStep5 = async (currentData: CurriculoData) => {
    if (!currentData.unidades || currentData.unidades.length === 0) {
      return 'Selecione pelo menos uma unidade para o currículo';
    }
    return true;
  };

  const handleComplete = async (formData: CurriculoData) => {
    try {
      await saveCurriculo({
        ...formData.entity,
        matrizCurricular: formData.matrizCurricular,
        requisitos: formData.requisitos,
        unidades: formData.unidades,
        materialEscolar: formData.materialEscolar,
      });
      alert('Currículo salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar currículo');
    }
  };

  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Form Curriculo</h1>
        <div className="div_form">
          <div className="form-title">Currículo de Curso</div>
          <div className="table_form">
            <Wizard
              initialData={data}
              onDataChange={updateFields}
              steps={[
                {
                  key: 'curriculo',
                  label: 'Curso',
                  content: (
                    <div>
                      <DataTable path="/api/educacao/curriculo" columns={CURSO_COLUMNS} />
                    </div>
                  ),
                  validate: validateStep1,
                },
                { 
                  key: 'licenca', 
                  label: 'Licença', 
                  content: <p className="master-detail-empty">Informações de licença do curso.</p> 
                },
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
                      items={data.matrizCurricular}
                      onChange={updateField('matrizCurricular')}
                    />
                  ),
                  validate: validateStep3,
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
                      items={data.unidades}
                      onChange={updateField('unidades')}
                    />
                  ),
                  validate: validateStep5,
                },
                { 
                  key: 'materialescolar', 
                  label: 'Material', 
                  content: <DataTable path="/api/educacao/material-escolar-curso" columns={MATERIAL_ESCOLAR_COLUMNS} /> 
                },
                {
                  key: 'contrato',
                  label: 'Documentos',
                  nextLabel: 'Salvar',
                  content: <p className="master-detail-empty">Contratos, promissórias, certificados e boletins.</p>,
                },
              ]}
              onComplete={handleComplete}
            />
          </div>
        </div>
      </main>
    </PermissionGate>
  );
}