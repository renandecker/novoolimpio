import {useState} from 'react';
import {PermissionGate} from '../permissions';
import {DataTable, type DataTableColumn} from '../DataTable';
import {MasterDetail} from '../MasterDetail';
import {Wizard, useWizardData} from '../Wizard';
import {
    USUARIO_SOURCE,
    USUARIO_COLUMNS,
    USUARIO_SEARCH,
    UNIDADE_SOURCE,
    UNIDADE_COLUMNS,
    UNIDADE_SEARCH,
    PERFIL_SOURCE,
    PERFIL_COLUMNS,
    PERFIL_SEARCH,
} from '../masterDetailSources';
import type {ApiItem} from '../types';
import {useApi} from '../api';

const MAPA_COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'ID do Mapa'},
    {key: 'nome', label: 'Nome'},
    {key: 'estruturaId', label: 'Estrutura'},
    {key: 'dimensaoId', label: 'Dimensão'},
    {key: 'medidaId', label: 'Medida'},
    {key: 'georeferenciaId', label: 'Coordenada'},
    {key: 'coordenada', label: 'Área'},
    {key: 'zoom', label: 'Zoom'},
    {key: 'markerTamanho', label: 'Tamanho Marker'},
    {key: 'altura', label: 'Altura'},
];

const REGRA_COLUMNS: DataTableColumn[] = [
    {key: 'cor', label: 'Cor'},
    {key: 'tipo', label: 'Tipo'},
    {key: 'medidaId', label: 'Medida'},
    {key: 'condicao', label: 'Condição'},
    {key: 'meta', label: 'Valor/Meta'},
    {key: 'descricao', label: 'Descrição'},
];

const FILTRO_COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'ID do Filtro'},
    {key: 'nome', label: 'Nome'},
    {key: 'estruturaId', label: 'Estrutura'},
    {key: 'dimensaoId', label: 'Dimensão'},
];

interface MapaData {
    entity: {
        id?: number;
        nome?: string;
        estruturaId?: number;
        dimensaoId?: number;
        medidaId?: number;
        georeferenciaId?: number;
        coordenada?: string;
        zoom?: number;
        markerTamanho?: number;
        altura?: number;
    };
    usuarios: ApiItem[];
    unidades: ApiItem[];
    perfis: ApiItem[];
    regras: any[];
    filtros: any[];
}

export default function ViewRelatoriosFormMapaListScreen() {
    const [usuarios, setUsuarios] = useState<ApiItem[]>([]);
    const [unidades, setUnidades] = useState<ApiItem[]>([]);
    const [perfis, setPerfis] = useState<ApiItem[]>([]);
    const {data, updateFields} = useWizardData<MapaData>({
        entity: {},
        usuarios: [],
        unidades: [],
        perfis: [],
        regras: [],
        filtros: [],
    });

    const {post: saveMapa} = useApi('/api/relatorios/mapa');

    const validateStep1 = async (currentData: MapaData) => {
        if (!currentData.entity.nome || currentData.entity.nome.length < 3) {
            return 'Nome deve ter pelo menos 3 caracteres';
        }
        if (!currentData.entity.coordenada) return 'Informe a coordenada/área';
        if (!currentData.entity.zoom || currentData.entity.zoom <= 0) return 'Zoom deve ser maior que zero';
        if (!currentData.entity.markerTamanho || currentData.entity.markerTamanho <= 0) {
            return 'Tamanho do marker deve ser maior que zero';
        }
        if (!currentData.entity.altura || currentData.entity.altura <= 0) {
            return 'Altura deve ser maior que zero';
        }
        return true;
    };

    const validateStep3 = async (currentData: MapaData) => {
        if (!currentData.regras || currentData.regras.length === 0) {
            return 'Adicione pelo menos uma regra';
        }
        return true;
    };

    const handleComplete = async (formData: MapaData) => {
        try {
            await saveMapa({
                ...formData.entity,
                usuarios: formData.usuarios,
                unidades: formData.unidades,
                perfis: formData.perfis,
                regras: formData.regras,
                filtros: formData.filtros,
            });
            alert('Mapa salvo com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar mapa:', error);
            alert('Erro ao salvar mapa');
        }
    };

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Form Mapa</h1>
                <div className="div_form">
                    <div className="form-title">Mapa / Relatório Geográfico</div>
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
                                            <DataTable path="/api/relatorios/mapa" columns={MAPA_COLUMNS}/>
                                        </div>
                                    ),
                                    validate: validateStep1,
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
                                    key: 'regras',
                                    label: 'Regras',
                                    content: (
                                        <div>
                                            <DataTable path="/api/relatorios/mapa-regra" columns={REGRA_COLUMNS}/>
                                        </div>
                                    ),
                                    validate: validateStep3,
                                },
                                {
                                    key: 'filtros',
                                    label: 'Filtros',
                                    nextLabel: 'Salvar',
                                    content: (
                                        <div>
                                            <DataTable path="/api/relatorios/filtro" columns={FILTRO_COLUMNS}/>
                                        </div>
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