import {PermissionGate} from '../../shared/services/permissions';
import {FormLayout, FormTabConfig} from '../../shared/components/FormLayout';
import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {api} from '../../shared/services/api';
import {MasterDetail} from '../../shared/components/MasterDetail';
import type {MasterDetailColumn} from '../../shared/components/MasterDetail';
import type {ApiItem} from '../../features/auth/types';

const toDateInput = (v: unknown): string => {
    if (!v) return '';
    const d = new Date(v as string);
    if (isNaN(d.getTime())) return String(v).slice(0, 10);
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
};

const str = (v: unknown): string => (v === null || v === undefined ? '' : String(v));
const num = (v: string): number | null => (v !== '' && !isNaN(Number(v)) ? Number(v) : null);
const bool = (v: unknown): boolean => v === true || v === 'true';

const HIERARQUIA_OPTIONS = [
    {value: 'ADMIN', label: 'Administrador'},
    {value: 'GERENTE', label: 'Gerente'},
    {value: 'SUPERVISOR', label: 'Supervisor'},
    {value: 'OPERADOR', label: 'Operador'},
];

const PERFIL_MODULO_COLUMNS: MasterDetailColumn[] = [
    {key: 'modulo_rotulo', label: 'Módulo'},
    {key: 'novo', label: 'Novo', render: (item) => item.novo ? 'Sim' : 'Não'},
    {key: 'editar', label: 'Editar', render: (item) => item.editar ? 'Sim' : 'Não'},
    {key: 'remover', label: 'Remover', render: (item) => item.remover ? 'Sim' : 'Não'},
    {key: 'relatorio', label: 'Relatório', render: (item) => item.relatorio ? 'Sim' : 'Não'},
];

const FAVORITO_COLUMNS: MasterDetailColumn[] = [
    {key: 'icon', label: 'Ícone'},
    {key: 'nome', label: 'Nome'},
    {key: 'modulo_descricao', label: 'Módulo'},
];

export default function ViewPerfilFormPerfilListScreen() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const idParam = searchParams.get('id');

    const [perfilId, setPerfilId] = useState<number | undefined>();
    const [perfilOriginal, setPerfilOriginal] = useState<Record<string, unknown> | null>(null);
    const [salvando, setSalvando] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const [perfisModulos, setPerfisModulos] = useState<ApiItem[]>([]);
    const [favoritos, setFavoritos] = useState<ApiItem[]>([]);
    const [moduloSelecionado, setModuloSelecionado] = useState<Record<string, unknown>>({novo: true, editar: true, remover: true, relatorio: true});

    const tabs: FormTabConfig[] = [
        {
            key: 'config',
            label: 'Configurações Gerais',
            fields: [
                {name: 'id', label: 'ID', type: 'text', readOnly: true, span: 1},
                {name: 'descricao', label: 'Descrição *', required: true, span: 3},
                {name: 'hierarquia', label: 'Hierarquia *', type: 'select', options: HIERARQUIA_OPTIONS, required: true, span: 2},
                {name: 'modulo', label: 'Minha Página Inicial', type: 'select', options: [], span: 3},
                {name: 'comunicar', label: 'Comunicar', type: 'select', options: [{value: 'true', label: 'Sim'}, {value: 'false', label: 'Não'}], span: 1},
            ],
            content: (
                <div>
                    <div className="form-grid" style={{marginBottom: '16px'}}>
                        <label className="form-field" style={{gridColumn: 'span 2'}}>
                            <span className="form-label">Módulo</span>
                            <select className="form-input form-select" value={str(moduloSelecionado.modulo)} onChange={e => setModuloSelecionado({...moduloSelecionado, modulo: e.target.value})}>
                                <option value="">-- Selecione --</option>
                            </select>
                        </label>
                        <label className="form-field">
                            <span className="form-label">Novo</span>
                            <select className="form-input form-select" value={str(moduloSelecionado.novo)} onChange={e => setModuloSelecionado({...moduloSelecionado, novo: e.target.value === 'true'})}>
                                <option value="true">Sim</option>
                                <option value="false">Não</option>
                            </select>
                        </label>
                        <label className="form-field">
                            <span className="form-label">Editar</span>
                            <select className="form-input form-select" value={str(moduloSelecionado.editar)} onChange={e => setModuloSelecionado({...moduloSelecionado, editar: e.target.value === 'true'})}>
                                <option value="true">Sim</option>
                                <option value="false">Não</option>
                            </select>
                        </label>
                        <label className="form-field">
                            <span className="form-label">Remover</span>
                            <select className="form-input form-select" value={str(moduloSelecionado.remover)} onChange={e => setModuloSelecionado({...moduloSelecionado, remover: e.target.value === 'true'})}>
                                <option value="true">Sim</option>
                                <option value="false">Não</option>
                            </select>
                        </label>
                        <label className="form-field">
                            <span className="form-label">Relatório</span>
                            <select className="form-input form-select" value={str(moduloSelecionado.relatorio)} onChange={e => setModuloSelecionado({...moduloSelecionado, relatorio: e.target.value === 'true'})}>
                                <option value="true">Sim</option>
                                <option value="false">Não</option>
                            </select>
                        </label>
                        <label className="form-field" style={{gridColumn: 'span 1', display: 'flex', alignItems: 'flex-end'}}>
                            <button type="button" className="btn-form-save" onClick={() => {
                                const novo = {...moduloSelecionado, id: Date.now()};
                                setPerfisModulos([...perfisModulos, novo]);
                                setModuloSelecionado({novo: true, editar: true, remover: true, relatorio: true, modulo: ''});
                            }}>Adicionar</button>
                        </label>
                    </div>
                    <MasterDetail
                        label="Módulos do Perfil"
                        source="/api/basico/perfil"
                        valueKey="id"
                        searchKeys={['modulo_rotulo']}
                        columns={PERFIL_MODULO_COLUMNS}
                        items={perfisModulos}
                        onChange={setPerfisModulos}
                    />
                </div>
            ),
        },
        {
            key: 'favoritos',
            label: 'Favoritos',
            fields: [
                {name: 'favorito_nome', label: 'Nome *', required: true, span: 3},
                {name: 'favorito_modulo', label: 'Módulo', type: 'select', options: [], span: 3},
                {name: 'favorito_icone', label: 'Ícone', type: 'text', span: 2},
            ],
            content: (
                <MasterDetail
                    label="Favoritos"
                    source="/api/basico/perfil"
                    valueKey="id"
                    searchKeys={['nome', 'modulo_descricao']}
                    columns={FAVORITO_COLUMNS}
                    items={favoritos}
                    onChange={setFavoritos}
                />
            ),
        },
    ];

    useEffect(() => {
        if (!idParam) return;
        let ativo = true;
        (async () => {
            try {
                const perfil = (await api.get<Record<string, unknown>>(`/api/basico/perfil/${idParam}`)).data;
                if (!ativo) return;
                setPerfilId(perfil.id as number);
                setPerfilOriginal(perfil);
                setPerfisModulos((perfil.perfisModulos as ApiItem[]) ?? []);
                setFavoritos((perfil.favoritoPerfils as ApiItem[]) ?? []);
                setInitialValues({
                    id: str(perfil.id),
                    descricao: str(perfil.descricao),
                    hierarquia: str(perfil.hierarquia),
                    modulo: str(perfil.modulo?.id ?? perfil.modulo),
                    comunicar: bool(perfil.comunicar),
                    favorito_nome: '',
                    favorito_modulo: '',
                    favorito_icone: '',
                });
            } catch (erro) {
                console.error('Erro ao carregar perfil:', erro);
                alert('Erro ao carregar registro.');
            }
        })();
        return () => { ativo = false; };
    }, [idParam]);

    const [initialValues, setInitialValues] = useState<Record<string, unknown>>({});

    const voltar = () => navigate('/view/perfil/listPerfil');

    const salvar = async (voltarDepois: boolean) => {
        const vals = initialValues;
        if (!vals.descricao || !vals.hierarquia) {
            setError('Informe Descrição e Hierarquia.');
            return;
        }
        setSalvando(true);
        setError(undefined);
        try {
            const perfilBody: Record<string, unknown> = {
                ...perfilOriginal,
                descricao: vals.descricao,
                hierarquia: vals.hierarquia,
                moduloId: num(vals.modulo as string),
                comunicar: vals.comunicar === 'true' || vals.comunicar === true,
                perfisModulos: perfisModulos.map(p => ({id: p.id, moduloId: num(str(p.modulo)), novo: p.novo === true || p.novo === 'true', editar: p.editar === true || p.editar === 'true', remover: p.remover === true || p.remover === 'true', relatorio: p.relatorio === true || p.relatorio === 'true'})),
                favoritoPerfils: favoritos.map(f => ({id: f.id, nome: str(f.nome), moduloId: num(str(f.modulo)), icon: str(f.icon)})),
            };
            const resposta = perfilId
                ? await api.put(`/api/basico/perfil/${perfilId}`, perfilBody)
                : await api.post('/api/basico/perfil', perfilBody);
            const novoId = (resposta.data as Record<string, unknown>)?.id ?? perfilId;
            if (voltarDepois) {
                voltar();
            } else {
                alert('Registro salvo com sucesso.');
                navigate(`/view/perfil/formPerfil?id=${novoId}`);
            }
        } catch (erro) {
            console.error('Erro ao salvar:', erro);
            setError('Erro ao salvar registro.');
        } finally {
            setSalvando(false);
        }
    };

    return (
        <PermissionGate permission="READ">
            <main>
                <FormLayout
                    title="Perfil"
                    tabs={tabs}
                    initialValues={initialValues}
                    onSubmit={(vals) => {
                        setInitialValues(vals);
                        salvar(false);
                    }}
                    onCancel={voltar}
                    submitLabel="Salvar"
                    cancelLabel="Voltar"
                    saving={salvando}
                    error={error}
                />
            </main>
        </PermissionGate>
    );
}
