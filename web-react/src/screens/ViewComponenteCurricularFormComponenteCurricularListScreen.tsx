import { useState } from 'react';
import { PermissionGate } from '../permissions';
import { DataTable, type DataTableColumn } from '../DataTable';
import { MasterDetail } from '../MasterDetail';
import { Wizard, useWizardData } from '../Wizard';
import {
  TIPO_SALA_SOURCE,
  TIPO_SALA_COLUMNS,
  TIPO_SALA_SEARCH,
  BASE_TECNOLOGICA_SOURCE,
  BASE_TECNOLOGICA_COLUMNS,
  BASE_TECNOLOGICA_SEARCH,
  REFERENCIA_BIBLIOGRAFICA_SOURCE,
  REFERENCIA_BIBLIOGRAFICA_COLUMNS,
  REFERENCIA_BIBLIOGRAFICA_SEARCH,
} from '../masterDetailSources';
import type { ApiItem } from '../types';
import { useApi } from '../api';

const COMPONENTE_COLUMNS: DataTableColumn[] = [
  { key: 'id', label: 'ID' },
  { key: 'descricao', label: 'Nome' },
  { key: 'sucinto', label: 'Sucinto' },
  { key: 'ementa', label: 'Ementa' },
  { key: 'qtdeCoringa', label: 'Aulas Coringa' },
  { key: 'creditos', label: 'Créditos' },
  { key: 'cargaHoraria', label: 'Carga Horária' },
  { key: 'tipoSalaId', label: 'Tipo Sala' },
];

const HABILIDADE_COLUMNS: DataTableColumn[] = [
  { key: 'id', label: 'ID' },
  { key: 'componenteCurricularId', label: 'Componente' },
  { key: 'habilidadeCompetencia', label: 'Habilidade/Competência' },
];

const BASE_TEC_COLUMNS: DataTableColumn[] = [
  { key: 'id', label: 'ID' },
  { key: 'nome', label: 'Nome' },
  { key: 'descricao', label: 'Descrição' },
];

const CRONOGRAMA_COLUMNS: DataTableColumn[] = [
  { key: 'id', label: 'ID' },
  { key: 'numeroAula', label: 'Nº Aula' },
  { key: 'assunto', label: 'Assunto' },
  { key: 'descricao', label: 'Descrição' },
  { key: 'ordem', label: 'Ordem' },
];

const REF_BIBLIO_COLUMNS: DataTableColumn[] = [
  { key: 'id', label: 'ID' },
  { key: 'autor', label: 'Autor' },
  { key: 'titulo', label: 'Título' },
  { key: 'volume', label: 'Volume' },
];

interface ComponenteCurricularData {
  entity: {
    id?: number;
    descricao?: string;
    sucinto?: string;
    ementa?: string;
    qtdeCoringa?: number;
    creditos?: number;
    cargaHoraria?: number;
    tipoSalaId?: number;
    habilidadeCompetencia?: string;
    baseTecnologica?: string;
  };
  baseTecnologicas: ApiItem[];
  cronogramas: any[];
  referenciasBibliograficas: ApiItem[];
}

export default function ViewComponenteCurricularFormComponenteCurricularListScreen() {
  const [baseTecnologicas, setBaseTecnologicas] = useState<ApiItem[]>([]);
  const [cronogramas, setCronogramas] = useState<any[]>([]);
  const [referenciasBibliograficas, setReferenciasBibliograficas] = useState<ApiItem[]>([]);
  const { data, updateFields } = useWizardData<ComponenteCurricularData>({
    entity: {},
    baseTecnologicas: [],
    cronogramas: [],
    referenciasBibliograficas: [],
  });

  const { post: saveComponente } = useApi('/api/educacao/componente-curricular');

  const validateStep1 = async (currentData: ComponenteCurricularData) => {
    if (!currentData.entity.descricao || currentData.entity.descricao.length < 3) {
      return 'Nome deve ter pelo menos 3 caracteres';
    }
    if (!currentData.entity.sucinto || currentData.entity.sucinto.length < 3) {
      return 'Sucinto deve ter pelo menos 3 caracteres';
    }
    if (!currentData.entity.ementa || currentData.entity.ementa.length < 3) {
      return 'Ementa deve ter pelo menos 3 caracteres';
    }
    if (!currentData.entity.qtdeCoringa || currentData.entity.qtdeCoringa < 0) {
      return 'Quantidade de aulas coringa deve ser zero ou maior';
    }
    if (!currentData.entity.cargaHoraria || currentData.entity.cargaHoraria <= 0) {
      return 'Carga horária deve ser maior que zero';
    }
    return true;
  };

  const validateStep4 = async (currentData: ComponenteCurricularData) => {
    if (!currentData.cronogramas || currentData.cronogramas.length === 0) {
      return 'Adicione pelo menos um item ao cronograma/plano de aula';
    }
    return true;
  };

  const handleComplete = async (formData: ComponenteCurricularData) => {
    try {
      await saveComponente({
        ...formData.entity,
        baseTecnologicas: formData.baseTecnologicas,
        cronogramas: formData.cronogramas,
        referenciasBibliograficas: formData.referenciasBibliograficas,
      });
      alert('Componente Curricular salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar componente curricular');
    }
  };

  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Form Componente Curricular</h1>
        <div className="div_form">
          <div className="form-title">Componente Curricular</div>
          <div className="table_form">
            <Wizard
              initialData={data}
              onDataChange={updateFields}
              steps={[
                {
                  key: 'componenteCurricular',
                  label: 'Componente Curricular',
                  content: (
                    <div>
                      <DataTable path="/api/educacao/componente-curricular" columns={COMPONENTE_COLUMNS} />
                    </div>
                  ),
                  validate: validateStep1,
                },
                {
                  key: 'habilidadeCompetencia',
                  label: 'Habilidade/Competência',
                  content: (
                    <div>
                      <DataTable path="/api/educacao/habilidade-competencia" columns={HABILIDADE_COLUMNS} />
                    </div>
                  ),
                },
                {
                  key: 'baseTecnologica',
                  label: 'Base Tecnológica',
                  content: (
                    <MasterDetail
                      label="Base Tecnológica"
                      source={BASE_TECNOLOGICA_SOURCE}
                      valueKey="id"
                      searchKeys={BASE_TECNOLOGICA_SEARCH}
                      columns={BASE_TECNOLOGICA_COLUMNS}
                      items={baseTecnologicas}
                      onChange={setBaseTecnologicas}
                    />
                  ),
                },
                {
                  key: 'cronograma',
                  label: 'Plano de Aula',
                  content: (
                    <div>
                      <DataTable path="/api/educacao/cronograma-componente-curricular" columns={CRONOGRAMA_COLUMNS} />
                    </div>
                  ),
                  validate: validateStep4,
                },
                {
                  key: 'referenciaBibliografica',
                  label: 'Referência Bibliográfica',
                  nextLabel: 'Salvar',
                  content: (
                    <MasterDetail
                      label="Referência Bibliográfica"
                      source={REFERENCIA_BIBLIOGRAFICA_SOURCE}
                      valueKey="id"
                      searchKeys={REFERENCIA_BIBLIOGRAFICA_SEARCH}
                      columns={REFERENCIA_BIBLIOGRAFICA_COLUMNS}
                      items={referenciasBibliograficas}
                      onChange={setReferenciasBibliograficas}
                    />
                  ),
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