import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {PermissionGate} from '../../shared/services/permissions';
import {api} from '../../shared/services/api';
import {AutoComplete} from '../../shared/components/AutoComplete';
import type {AutoCompleteOption} from '../../shared/components/AutoComplete';

const apiErrorMessage = (error: unknown): string =>
    (error as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? (error as Error)?.message
        ?? 'erro desconhecido';

const formatarData = (value: string | null | undefined): string => {
    if (!value) return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    if (!match) return String(value);
    return `${match[3]}/${match[2]}/${match[1]}`;
};

const parseData = (value: string): string | null => {
    if (!value) return null;
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
    if (!match) return null;
    return `${match[3]}-${match[2]}-${match[1]}`;
};

export default function ViewFeriadoFormFeriadoListScreen() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const idEdicao = searchParams.get('id');

    const [carregando, setCarregando] = useState(!!idEdicao);
    const [salvando, setSalvando] = useState(false);
    const [mensagem, setMensagem] = useState('');

    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [tipoFeriao, setTipoFeriao] = useState('');
    const [dataFeriado, setDataFeriado] = useState('');
    const [nacional, setNacional] = useState(false);
    const [todosCursos, setTodosCursos] = useState(false);
    const [feriadoFixo, setFeriadoFixo] = useState(false);

    const [tipoCursos, setTipoCursos] = useState<AutoCompleteOption[]>([]);
    const [unidades, setUnidades] = useState<AutoCompleteOption[]>([]);

    useEffect(() => {
        if (!idEdicao) return;
        let ativo = true;
        (async () => {
            try {
                const ent = (await api.get<Record<string, unknown>>(`/api/basico/feriado/${idEdicao}`)).data;
                if (!ativo) return;
                setNome(String(ent.nome ?? ''));
                setDescricao(String(ent.descricao ?? ''));
                setTipoFeriao(String(ent.tipo_feriao ?? ''));
                setDataFeriado(formatarData(ent.dt_feriado));
                setNacional(Boolean(ent.fl_nacional ?? false));
                setTodosCursos(Boolean(ent.fl_tipo_curso ?? false));
                setFeriadoFixo(Boolean(ent.fl_feriado_fixo ?? false));

                // Carregar tipoCursos e unidades associadas se necessário
                try {
                    const relCursos = await api.get<Array<{ id: number; descricao?: string; sucinto?: string }>>(`/api/basico/feriado/${idEdicao}/tipo-cursos`);
                    if (relCursos.data) {
                        setTipoCursos(relCursos.data.map(item => ({ id: item.id, label: item.descricao || item.sucinto || `#${item.id}` })));
                    }
                } catch {
                    // Ignora caso endpoint não exista
                }
                try {
                    const relUnidades = await api.get<Array<{ id: number; sucinto?: string; nome?: string }>>(`/api/basico/feriado/${idEdicao}/unidades`);
                    if (relUnidades.data) {
                        setUnidades(relUnidades.data.map(item => ({ id: item.id, label: item.sucinto || item.nome || `#${item.id}` })));
                    }
                } catch {
                    // Ignora caso endpoint não exista
                }
            } catch (erro) {
                console.error('Erro ao carregar feriado:', erro);
                alert('Não foi possível carregar o feriado para edição');
            } finally {
                if (ativo) setCarregando(false);
            }
        })();
        return () => {
            ativo = false;
        };
    }, [idEdicao]);

    const buscarTipoCursos = async (query: string): Promise<AutoCompleteOption[]> => {
        const {data} = await api.get<Array<{ id: number; descricao: string }>>(
            '/api/basico/tipo-curso/opcoes', {params: {query}});
        return (data ?? []).map((item) => ({id: item.id, label: item.descricao || `#${item.id}`}));
    };

    const buscarUnidades = async (query: string): Promise<AutoCompleteOption[]> => {
        const {data} = await api.get<Array<{ id: number; sucinto: string }>>(
            '/api/basico/unidade/opcoes', {params: {query}});
        return (data ?? []).map((item) => ({id: item.id, label: item.sucinto || `#${item.id}`}));
    };

    const voltar = () => navigate('/view/feriado/listFeriado');

    const salvar = async (voltarDepois: boolean) => {
        if (!nome.trim()) {
            alert('Informe o nome do feriado.');
            return;
        }
        if (!dataFeriado.trim()) {
            alert('Informe a data do feriado.');
            return;
        }
        setSalvando(true);
        try {
            const body = {
                nome: nome.trim(),
                descricao: descricao.trim() || null,
                tipoFeriao: tipoFeriao || null,
                dataFeriado: parseData(dataFeriado),
                nacional: nacional,
                todosCursos: todosCursos,
                feriadoFixo: feriadoFixo,
            };
            if (idEdicao) {
                await api.put(`/api/basico/feriado/${idEdicao}`, body);
            } else {
                await api.post('/api/basico/feriado', body);
            }
            alert('Registro salvo com sucesso.');
            if (voltarDepois) voltar();
        } catch (error) {
            alert(`Erro ao salvar o feriado: ${apiErrorMessage(error)}`);
        } finally {
            setSalvando(false);
        }
    };

    if (carregando) {
        return (
            <PermissionGate permission="READ">
                <main>
                    <h1>Feriado</h1>
                    <div className="div_form">
                        <p className="master-detail-empty">Carregando...</p>
                    </div>
                </main>
            </PermissionGate>
        );
    }

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>{idEdicao ? `Editar Feriado #${idEdicao}` : 'Feriado'}</h1>
                <div className="div_form">
                    <div className="form-title">{idEdicao ? `Feriado #${idEdicao}` : 'Novo Feriado'}</div>
                    <div className="table_form">
                        <div className="form-grid">
                            <label className="form-field">
                                <span className="form-label">Id</span>
                                <input className="form-input" value={idEdicao ?? ''} disabled/>
                            </label>
                            <label className="form-field">
                                <span className="form-label">Nome *</span>
                                <input className="form-input" value={nome}
                                       onChange={(event) => {
                                           setMensagem('');
                                           setNome(event.target.value);
                                       }}/>
                            </label>
                            <label className="form-field">
                                <span className="form-label">Descrição *</span>
                                <textarea className="form-input" rows={4} value={descricao}
                                          onChange={(event) => setDescricao(event.target.value)}/>
                            </label>
                            <label className="form-field">
                                <span className="form-label">Data Feriado *</span>
                                <input className="form-input" placeholder="dd/mm/yyyy" maxLength={10}
                                       value={dataFeriado}
                                       onChange={(event) => {
                                           setMensagem('');
                                           setDataFeriado(event.target.value);
                                       }}/>
                            </label>
                            <label className="form-field">
                                <span className="form-label">Feriado Fixo</span>
                                <select className="form-input" value={feriadoFixo ? 'true' : 'false'}
                                        onChange={(event) => setFeriadoFixo(event.target.value === 'true')}>
                                    <option value="false">Não</option>
                                    <option value="true">Sim</option>
                                </select>
                            </label>
                            <label className="form-field">
                                <span className="form-label">Nacional (Todas Unidades)</span>
                                <select className="form-input" value={nacional ? 'true' : 'false'}
                                        onChange={(event) => {
                                            setNacional(event.target.value === 'true');
                                            if (event.target.value === 'true') setUnidades([]);
                                        }}>
                                    <option value="false">Não</option>
                                    <option value="true">Sim</option>
                                </select>
                            </label>
                            <label className="form-field">
                                <span className="form-label">Todos Tipos de Curso</span>
                                <select className="form-input" value={todosCursos ? 'true' : 'false'}
                                        onChange={(event) => {
                                            setTodosCursos(event.target.value === 'true');
                                            if (event.target.value === 'true') setTipoCursos([]);
                                        }}>
                                    <option value="false">Não</option>
                                    <option value="true">Sim</option>
                                </select>
                            </label>

                            {!todosCursos && (
                                <>
                                    <label className="form-field">
                                        <span className="form-label">Tipo Cursos</span>
                                        <AutoComplete
                                            placeholder="Digite para buscar (mínimo 3 caracteres)"
                                            value={tipoCursos}
                                            onChange={setTipoCursos}
                                            fetchOptions={buscarTipoCursos}
                                        />
                                    </label>
                                </>
                            )}

                            {!nacional && (
                                <>
                                    <label className="form-field">
                                        <span className="form-label">Unidade</span>
                                        <AutoComplete
                                            placeholder="Digite para buscar (mínimo 3 caracteres)"
                                            value={unidades}
                                            onChange={setUnidades}
                                            fetchOptions={buscarUnidades}
                                        />
                                    </label>
                                </>
                            )}
                        </div>
                        <div className="form-buttons">
                            <button type="button" className="btnblue" title="Salvar registro"
                                    disabled={salvando} onClick={() => void salvar(true)}>
                                Gravar
                            </button>
                            <button type="button" className="btnstop" title="Salvar e continuar editando"
                                    disabled={salvando} onClick={() => void salvar(false)}>
                                Salvar e Continuar
                            </button>
                            <button type="button" className="btnyellow" title="Voltar para a lista"
                                    onClick={voltar} disabled={salvando}>
                                Voltar
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </PermissionGate>
    );
}
