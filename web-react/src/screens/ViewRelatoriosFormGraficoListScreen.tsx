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

const GRAFICO_COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'ID'},
    {key: 'nome', label: 'Nome'},
    {key: 'tipoGrafico', label: 'Tipo Gráfico'},
];

interface GraficoFormData {
    entity: {
        id?: number;
        nome?: string;
        tipoGrafico?: string;
    };
    usuarios: ApiItem[];
    unidades: ApiItem[];
    perfis: ApiItem[];
    filtros: any[];
}

export default function ViewRelatoriosFormGraficoListScreen() {
    const [usuarios, setUsuarios] = useState<ApiItem[]>([]);
    const [unidades, setUnidades] = useState<ApiItem[]>([]);
    const [perfis, setPerfis] = useState<ApiItem[]>([]);
    const {data, updateFields} = useWizardData<GraficoFormData>({
        entity: {},
        usuarios: [],
        unidades: [],
        perfis: [],
        filtros: [],
    });

    const {post: saveGrafico} = useApi('/api/relatorios/grafico');

    const handleComplete = async (formData: GraficoFormData) => {
        try {
            await saveGrafico({
                ...formData.entity,
                usuarios: formData.usuarios,
                unidades: formData.unidades,
                perfis: formData.perfis,
                filtros: formData.filtros,
            });
            alert('Gráfico salvo com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar gráfico:', error);
            alert('Erro ao salvar gráfico');
        }
    };

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Form Grafico</h1>
                <div className="div_form">
                    <div className="form-title">Cadastro / Edição de Relatório de Gráfico</div>
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
                                            <DataTable path="/api/relatorios/grafico" columns={GRAFICO_COLUMNS}/>
                                        </div>
                                    ),
                                    validate: async (d) => (d.entity.nome && d.entity.nome.length >= 3) || 'Nome deve ter pelo menos 3 caracteres',
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
                                    content: <p className="master-detail-empty">Filtros do relatório de gráfico.</p>,
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
