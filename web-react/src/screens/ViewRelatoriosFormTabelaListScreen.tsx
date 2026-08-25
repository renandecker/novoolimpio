import {useState} from 'react';
import {PermissionGate} from '../permissions';
import {MasterDetail} from '../MasterDetail';
import {Tabs} from '../Tabs';
import {Wizard, useWizardData} from '../Wizard';
import {DataTable, type DataTableColumn} from '../DataTable';
import {
    PERFIL_SOURCE,
    PERFIL_COLUMNS,
    PERFIL_SEARCH,
    UNIDADE_SOURCE,
    UNIDADE_COLUMNS,
    UNIDADE_SEARCH,
    USUARIO_SOURCE,
    USUARIO_COLUMNS,
    USUARIO_SEARCH
} from '../masterDetailSources';
import type {ApiItem} from '../types';
import {useApi} from '../api';

const TABELA_COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'ID'},
    {key: 'nome', label: 'Nome'},
    {key: 'estruturaId', label: 'Estrutura'},
];

interface TabelaFormData {
    entity: {
        id?: number;
        nome?: string;
        estruturaId?: number;
    };
    dimensaoDescritiva: any[];
    dimensaoTempo: any[];
    medidas: any[];
    usuarios: ApiItem[];
    unidades: ApiItem[];
    perfis: ApiItem[];
    filtros: any[];
}

export default function ViewRelatoriosFormTabelaListScreen() {
    const [usuarios, setUsuarios] = useState<ApiItem[]>([]);
    const [unidades, setUnidades] = useState<ApiItem[]>([]);
    const [perfis, setPerfis] = useState<ApiItem[]>([]);
    const {data, updateFields} = useWizardData<TabelaFormData>({
        entity: {},
        dimensaoDescritiva: [],
        dimensaoTempo: [],
        medidas: [],
        usuarios: [],
        unidades: [],
        perfis: [],
        filtros: [],
    });

    const {post: saveTabela} = useApi('/api/relatorios/tabela');

    const handleComplete = async (formData: TabelaFormData) => {
        try {
            await saveTabela({
                ...formData.entity,
                usuarios: formData.usuarios,
                unidades: formData.unidades,
                perfis: formData.perfis,
                dimensaoDescritiva: formData.dimensaoDescritiva,
                dimensaoTempo: formData.dimensaoTempo,
                medidas: formData.medidas,
                filtros: formData.filtros,
            });
            alert('Tabela salva com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar tabela:', error);
            alert('Erro ao salvar tabela');
        }
    };

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Form Tabela</h1>
                <div className="div_form">
                    <div className="form-title">Cadastro / Edição de Relatório de Tabela</div>
                    <div className="table_form">
                        <Wizard
                            initialData={data}
                            onDataChange={updateFields}
                            steps={[
                                {
                                    key: 'definicao',
                                    label: 'Definição',
                                    content: (
                                        <div>
                                            <DataTable path="/api/relatorios/tabela" columns={TABELA_COLUMNS}/>
                                        </div>
                                    ),
                                    validate: async (d) => (d.entity.nome && d.entity.nome.length >= 3) || 'Nome deve ter pelo menos 3 caracteres',
                                },
                                {
                                    key: 'dimensoes',
                                    label: 'Dimensões & Medidas',
                                    content: (
                                        <Tabs
                                            tabs={[
                                                {key: 'descritiva', label: 'Dimensão descritiva', content: <p className="master-detail-empty">Nenhuma dimensão descritiva selecionada.</p>},
                                                {key: 'tempo', label: 'Dimensão tempo', content: <p className="master-detail-empty">Nenhuma dimensão tempo selecionada.</p>},
                                                {key: 'medidas', label: 'Medidas', content: <p className="master-detail-empty">Nenhuma medida selecionada.</p>},
                                            ]}
                                        />
                                    ),
                                },
                                {
                                    key: 'permissao',
                                    label: 'Permissão',
                                    content: (
                                        <div>
                                            <div style={{marginBottom: '20px'}}>
                                                <h3>Usuários</h3>
                                                <MasterDetail
                                                    label="Usuário"
                                                    source={USUARIO_SOURCE}
                                                    valueKey="id"
                                                    searchKeys={USUARIO_SEARCH}
                                                    columns={USUARIO_COLUMNS}
                                                    items={usuarios}
                                                    onChange={setUsuarios}
                                                />
                                            </div>
                                            <div style={{marginBottom: '20px'}}>
                                                <h3>Unidades</h3>
                                                <MasterDetail
                                                    label="Unidade"
                                                    source={UNIDADE_SOURCE}
                                                    valueKey="id"
                                                    searchKeys={UNIDADE_SEARCH}
                                                    columns={UNIDADE_COLUMNS}
                                                    items={unidades}
                                                    onChange={setUnidades}
                                                />
                                            </div>
                                            <div style={{marginBottom: '20px'}}>
                                                <h3>Perfis</h3>
                                                <MasterDetail
                                                    label="Perfil"
                                                    source={PERFIL_SOURCE}
                                                    valueKey="id"
                                                    searchKeys={PERFIL_SEARCH}
                                                    columns={PERFIL_COLUMNS}
                                                    items={perfis}
                                                    onChange={setPerfis}
                                                />
                                            </div>
                                        </div>
                                    ),
                                },
                                {
                                    key: 'filtros',
                                    label: 'Filtros',
                                    content: <p className="master-detail-empty">Filtros do relatório de tabela.</p>,
                                    nextLabel: 'Concluir',
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
