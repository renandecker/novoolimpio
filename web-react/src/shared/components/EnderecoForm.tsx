import {useState} from 'react';
import type {FormEvent} from 'react';
import {api} from '../../shared/services/api';
import {AutoComplete} from './AutoComplete';

export interface Endereco {
    id?: number;
    cep: string;
    cidade: string;
    bairro: string;
    logradouro: string;
    numero: string;
    complemento: string;
}

export interface Logradouro {
    id?: number;
    cep: string;
    descricao: string;
    tipo?: string;
    complemento?: string;
    longitude?: string;
    latitude?: string;
    bairroId: number;
    local?: string;
}

export interface Bairro {
    id?: number;
    descricao: string;
    cidadeId: number;
}

export interface Cidade {
    id?: number;
    nome: string;
    estadoId?: number;
    cidadeEstado?: string;
}

export function formatCep(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

interface ViaCepResponse {
    erro?: boolean;
    cep?: string;
    localidade?: string;
    bairro?: string;
    logradouro?: string;
    uf?: string;
}

const fullRowStyle: React.CSSProperties = {gridColumn: 'span 3'};

export async function buscarCep(cep: string): Promise<Partial<Endereco> | null> {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) return null;
    try {
        const response = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
        if (!response.ok) return null;
        const data = (await response.json()) as ViaCepResponse;
        if (data.erro) return null;
        return {
            cep: formatCep(data.cep ?? clean),
            cidade: data.localidade ?? '',
            bairro: data.bairro ?? '',
            logradouro: data.logradouro ?? '',
        };
    } catch {
        return null;
    }
}

export async function buscarEnderecoLogradouro(cep: string): Promise<{logradouro?: Logradouro; cidade?: Cidade; bairro?: Bairro} | null> {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) return null;
    try {
        const {data} = await api.get<any>(`/api/basico/logradouro/buscarEndereco`, {params: {cep: clean}});
        return data;
    } catch {
        return null;
    }
}

export async function salvarLogradouro(logradouro: Logradouro): Promise<Logradouro | null> {
    try {
        if (logradouro.id) {
            const {data} = await api.put(`/api/basico/logradouro/${logradouro.id}`, logradouro);
            return data;
        } else {
            const {data} = await api.post('/api/basico/logradouro', logradouro);
            return data;
        }
    } catch (error) {
        console.error('Erro ao salvar logradouro:', error);
        return null;
    }
}

export async function salvarBairro(bairro: Bairro): Promise<Bairro | null> {
    try {
        if (bairro.id) {
            const {data} = await api.put(`/api/basico/bairro/${bairro.id}`, bairro);
            return data;
        } else {
            const {data} = await api.post('/api/basico/bairro', bairro);
            return data;
        }
    } catch (error) {
        console.error('Erro ao salvar bairro:', error);
        return null;
    }
}

export async function buscarCidadesLog(query: string): Promise<AutoCompleteOption[]> {
    if (!query) return [];
    const {data} = await api.get<any[]>(`/api/basico/cidade/opcoes`, {params: {query}});
    return data.map((e: any) => ({id: e.id, label: e.nome ?? String(e.id)}));
}

export async function buscarBairros(query: string, cidadeId?: number): Promise<AutoCompleteOption[]> {
    const params: any = {query};
    if (cidadeId) params.cidadeId = cidadeId;
    const {data} = await api.get<any[]>(`/api/basico/bairro/opcoes`, {params});
    return data.map((e: any) => ({id: e.id, label: e.descricao ?? String(e.id)}));
}

export async function buscarLogradouros(query: string, bairroId?: number): Promise<AutoCompleteOption[]> {
    const params: any = {query};
    if (bairroId) params.bairroId = bairroId;
    const {data} = await api.get<any[]>(`/api/basico/logradouro/auto-complete-logradouro-troca-opcoes`, {params});
    return data.map((e: any) => ({id: e.id, label: e.descricao ?? String(e.id)}));
}

export interface AutoCompleteOption {
    id: number;
    label: string;
}

interface EnderecoModalProps {
    titulo: string;
    inicial: Partial<Endereco>;
    onSave: (endereco: Endereco) => void;
    onClose: () => void;
}

function EnderecoModal({titulo, inicial, onSave, onClose}: EnderecoModalProps) {
    const [form, setForm] = useState<Partial<Endereco>>({...inicial});
    const [buscando, setBuscando] = useState(false);
    const [aviso, setAviso] = useState('');

    const cepInvalido = (form.cep ?? '').replace(/\D/g, '').length !== 8;

    const handleBuscar = async () => {
        setAviso('');
        setBuscando(true);
        const dados = await buscarCep(form.cep ?? '');
        setBuscando(false);
        if (dados) {
            setForm((prev) => ({...prev, ...dados}));
        } else {
            setAviso('CEP não encontrado.');
        }
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        onSave({
            id: form.id,
            cep: form.cep ?? '',
            cidade: form.cidade ?? '',
            bairro: form.bairro ?? '',
            logradouro: form.logradouro ?? '',
            numero: form.numero ?? '',
            complemento: form.complemento ?? '',
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal form-modal" onClick={(event) => event.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="div_form">
                        <div className="form-title">{titulo}</div>
                        <div className="form-grid">
                            <label className="form-field">
                                <span className="form-label">CEP *</span>
                                <div style={{display: 'flex', gap: '8px'}}>
                                    <input
                                        className="form-input"
                                        style={{width: '120px'}}
                                        placeholder="99999-999"
                                        maxLength={9}
                                        value={form.cep ?? ''}
                                        onChange={(event) => {
                                            setAviso('');
                                            setForm((prev) => ({...prev, cep: formatCep(event.target.value)}));
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="btnyellow"
                                        disabled={buscando || cepInvalido}
                                        onClick={handleBuscar}
                                    >
                                        {buscando ? 'Buscando...' : 'Buscar'}
                                    </button>
                                </div>
                                {aviso && <small style={{color: '#c0392b'}}>{aviso}</small>}
                            </label>
                            <label className="form-field">
                                <span className="form-label">Número</span>
                                <input
                                    className="form-input"
                                    type="number"
                                    placeholder="Número"
                                    value={form.numero ?? ''}
                                    onChange={(event) => setForm((prev) => ({...prev, numero: event.target.value}))}
                                />
                            </label>
                            <label className="form-field">
                                <span className="form-label">Cidade</span>
                                <input
                                    className="form-input"
                                    placeholder="Cidade"
                                    value={form.cidade ?? ''}
                                    onChange={(event) => setForm((prev) => ({...prev, cidade: event.target.value}))}
                                />
                            </label>
                            <label className="form-field">
                                <span className="form-label">Bairro</span>
                                <input
                                    className="form-input"
                                    placeholder="Bairro"
                                    value={form.bairro ?? ''}
                                    onChange={(event) => setForm((prev) => ({...prev, bairro: event.target.value}))}
                                />
                            </label>
                            <label className="form-field">
                                <span className="form-label">Logradouro</span>
                                <input
                                    className="form-input"
                                    style={fullRowStyle}
                                    placeholder="Logradouro"
                                    value={form.logradouro ?? ''}
                                    onChange={(event) => setForm((prev) => ({...prev, logradouro: event.target.value}))}
                                />
                            </label>
                            <label className="form-field">
                                <span className="form-label">Complemento</span>
                                <textarea
                                    className="form-input"
                                    placeholder="Complemento"
                                    rows={3}
                                    style={{minHeight: '80px', ...fullRowStyle}}
                                    value={form.complemento ?? ''}
                                    onChange={(event) =>
                                        setForm((prev) => ({...prev, complemento: event.target.value}))
                                    }
                                />
                            </label>
                        </div>
                        <div className="form-buttons">
                            <button type="submit" className="btnblue" disabled={cepInvalido}>
                                Salvar
                            </button>
                            <button type="button" className="btnyellow" onClick={onClose}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function AjusteLogradouroModal({
    open,
    onClose,
    cep,
    logradouroId,
    onSave,
}: {
    open: boolean;
    onClose: () => void;
    cep: string;
    logradouroId?: number;
    onSave: (logradouro: Logradouro) => void;
}) {
    const [form, setForm] = useState<Partial<Logradouro>>({
        id: logradouroId,
        cep: cep,
        descricao: '',
        tipo: '',
        complemento: '',
        longitude: '',
        latitude: '',
        bairroId: 0,
    });
    const [cidadeOpt, setCidadeOpt] = useState<AutoCompleteOption | null>(null);
    const [bairroOpt, setBairroOpt] = useState<AutoCompleteOption | null>(null);
    const [salvando, setSalvando] = useState(false);
    const [aviso, setAviso] = useState('');
    const [showNovoBairro, setShowNovoBairro] = useState(false);
    const [novoBairroNome, setNovoBairroNome] = useState('');

    if (!open) return null;

    const handleSalvarBairro = async () => {
        if (!novoBairroNome.trim() || !cidadeOpt?.id) return;
        const bairroSalvo = await salvarBairro({descricao: novoBairroNome.trim(), cidadeId: cidadeOpt.id});
        if (bairroSalvo) {
            setBairroOpt({id: bairroSalvo.id!, label: bairroSalvo.descricao});
            setForm(prev => ({...prev, bairroId: bairroSalvo.id!}));
            setShowNovoBairro(false);
            setNovoBairroNome('');
        }
    };

    const handleBuscar = async () => {
        setAviso('');
        const dados = await buscarEnderecoLogradouro(cep);
        if (dados?.logradouro) {
            const l = dados.logradouro;
            setForm((prev) => ({...prev, descricao: l.descricao, cep: formatCep(l.cep ?? cep)}));
            if (dados.bairro) {
                setBairroOpt({id: dados.bairro.id, label: dados.bairro.descricao});
                setForm((prev) => ({...prev, bairroId: dados.bairro!.id}));
            }
            if (dados.cidade) {
                setCidadeOpt({id: dados.cidade.id, label: dados.cidade.cidadeEstado ?? dados.cidade.nome});
            }
        } else {
            setAviso('Logradouro não encontrado para este CEP.');
        }
    };

    const handleSalvar = async () => {
        if (!form.descricao.trim()) {
            setAviso('Informe o nome da rua.');
            return;
        }
        if (!form.bairroId) {
            setAviso('Selecione o bairro.');
            return;
        }
        setSalvando(true);
        try {
            const logradouroSalvo = await salvarLogradouro({
                ...form,
                descricao: form.descricao.trim(),
                cep: form.cep?.replace(/\D/g, '').length === 8 ? form.cep : null,
                bairroId: form.bairroId!,
            } as Logradouro);
            if (logradouroSalvo) {
                onSave(logradouroSalvo);
                onClose();
            } else {
                setAviso('Erro ao salvar logradouro.');
            }
        } catch (error) {
            setAviso('Erro ao salvar logradouro.');
        } finally {
            setSalvando(false);
        }
    };

    return (
        <>
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal form-modal" style={{maxWidth: '600px'}} onClick={(e) => e.stopPropagation()}>
                <div className="div_form">
                    <div className="form-title">Ajuste Logradouro</div>
                    <div className="form-grid">
                        <label className="form-field">
                            <span className="form-label">CEP</span>
                            <div style={{display: 'flex', gap: '8px'}}>
                                <input
                                    className="form-input"
                                    style={{width: '120px'}}
                                    placeholder="99.999-999"
                                    maxLength={9}
                                    value={form.cep ?? ''}
                                    disabled
                                />
                                <button
                                    type="button"
                                    className="btnyellow"
                                    disabled={salvando}
                                    onClick={handleBuscar}
                                >
                                    Buscar
                                </button>
                            </div>
                            {aviso && <small style={{color: '#c0392b'}}>{aviso}</small>}
                        </label>
                        <label className="form-field">
                            <span className="form-label">Cidade *</span>
                            <AutoComplete
                                placeholder="Digite 3 letras..."
                                value={cidadeOpt}
                                onChange={setCidadeOpt}
                                fetchOptions={buscarCidadesLog}
                            />
                        </label>
                        <label className="form-field">
                            <span className="form-label">Bairro *</span>
                            <div style={{display: 'flex', gap: '8px'}}>
                                <AutoComplete
                                    placeholder="Digite 3 letras..."
                                    value={bairroOpt}
                                    onChange={setBairroOpt}
                                    fetchOptions={(q) => buscarBairros(q, cidadeOpt?.id)}
                                    style={{flex: 1}}
                                />
                                <button
                                    type="button"
                                    className="btnblue"
                                    onClick={() => setShowNovoBairro(true)}
                                    disabled={!cidadeOpt?.id}
                                >
                                    +
                                </button>
                            </div>
                        </label>
                        <label className="form-field">
                            <span className="form-label">Logradouro *</span>
                            <input
                                className="form-input"
                                style={fullRowStyle}
                                placeholder="Nome da rua/logradouro"
                                value={form.descricao ?? ''}
                                onChange={(e) => setForm((prev) => ({...prev, descricao: e.target.value}))}
                            />
                        </label>
                        <label className="form-field">
                            <span className="form-label">Tipo</span>
                            <input
                                className="form-input"
                                placeholder="Tipo (Rua, Av, etc.)"
                                value={form.tipo ?? ''}
                                onChange={(e) => setForm((prev) => ({...prev, tipo: e.target.value}))}
                            />
                        </label>
                        <label className="form-field">
                            <span className="form-label">Complemento</span>
                            <input
                                className="form-input"
                                style={fullRowStyle}
                                placeholder="Complemento do logradouro"
                                value={form.complemento ?? ''}
                                onChange={(e) => setForm((prev) => ({...prev, complemento: e.target.value}))}
                            />
                        </label>
                    </div>
                    <div className="form-buttons">
                        <button type="button" className="btnblue" onClick={handleSalvar} disabled={salvando}>
                            {salvando ? 'Salvando...' : 'Salvar'}
                        </button>
                        <button type="button" className="btnyellow" onClick={onClose}>
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
            {showNovoBairro && (
                <div className="modal-overlay" onClick={() => setShowNovoBairro(false)}>
                    <div className="modal form-modal" style={{maxWidth: '400px'}} onClick={(e) => e.stopPropagation()}>
                        <div className="div_form">
                            <div className="form-title">Novo Bairro</div>
                            <div className="form-grid">
                                <label className="form-field">
                                    <span className="form-label">Bairro *</span>
                                    <input
                                        className="form-input"
                                        placeholder="Nome do bairro"
                                        value={novoBairroNome}
                                        onChange={(e) => setNovoBairroNome(e.target.value)}
                                    />
                                </label>
                            </div>
                            <div className="form-buttons">
                                <button type="button" className="btnblue" onClick={handleSalvarBairro} disabled={!novoBairroNome.trim()}>
                                    Salvar
                                </button>
                                <button type="button" className="btnyellow" onClick={() => setShowNovoBairro(false)}>
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export function NovoLogradouroModal({
    open,
    onClose,
    cep,
    onSave,
}: {
    open: boolean;
    onClose: () => void;
    cep: string;
    onSave: (logradouro: Logradouro) => void;
}) {
    const [form, setForm] = useState<Partial<Logradouro>>({
        cep: cep,
        descricao: '',
        tipo: '',
        complemento: '',
        longitude: '',
        latitude: '',
        bairroId: 0,
    });
    const [cidadeOpt, setCidadeOpt] = useState<AutoCompleteOption | null>(null);
    const [bairroOpt, setBairroOpt] = useState<AutoCompleteOption | null>(null);
    const [salvando, setSalvando] = useState(false);
    const [aviso, setAviso] = useState('');
    const [showNovoBairro, setShowNovoBairro] = useState(false);
    const [novoBairroNome, setNovoBairroNome] = useState('');

    if (!open) return null;

    const handleBuscar = async () => {
        setAviso('');
        const dados = await buscarEnderecoLogradouro(cep);
        if (dados?.cidade) {
            setCidadeOpt({id: dados.cidade.id, label: dados.cidade.cidadeEstado ?? dados.cidade.nome});
        }
        if (dados?.bairro) {
            setBairroOpt({id: dados.bairro.id, label: dados.bairro.descricao});
            setForm((prev) => ({...prev, bairroId: dados.bairro!.id}));
        }
        if (dados?.logradouro) {
            setForm((prev) => ({...prev, descricao: dados.logradouro!.descricao, cep: formatCep(dados.logradouro!.cep ?? cep)}));
        }
        if (!dados?.logradouro) {
            setAviso('Nenhum logradouro encontrado. Preencha os dados para criar novo.');
        }
    };

    const handleSalvar = async () => {
        if (!form.descricao.trim()) {
            setAviso('Informe o nome da rua.');
            return;
        }
        if (!form.bairroId) {
            setAviso('Selecione o bairro.');
            return;
        }
        setSalvando(true);
        try {
            const logradouroSalvo = await salvarLogradouro({
                ...form,
                descricao: form.descricao.trim(),
                cep: form.cep?.replace(/\D/g, '').length === 8 ? form.cep : null,
                bairroId: form.bairroId!,
            } as Logradouro);
            if (logradouroSalvo) {
                onSave(logradouroSalvo);
                onClose();
            } else {
                setAviso('Erro ao salvar logradouro.');
            }
        } catch (error) {
            setAviso('Erro ao salvar logradouro.');
        } finally {
            setSalvando(false);
        }
    };

    const handleSalvarBairro = async () => {
        if (!novoBairroNome.trim()) return;
        if (!cidadeOpt?.id) return;
        const bairroSalvo = await salvarBairro({
            descricao: novoBairroNome.trim(),
            cidadeId: cidadeOpt.id,
        });
        if (bairroSalvo) {
            setBairroOpt({id: bairroSalvo.id!, label: bairroSalvo.descricao});
            setForm((prev) => ({...prev, bairroId: bairroSalvo.id!}));
            setShowNovoBairro(false);
            setNovoBairroNome('');
        }
    };

    return (
        <>
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal form-modal" style={{maxWidth: '600px'}} onClick={(e) => e.stopPropagation()}>
                    <div className="div_form">
                        <div className="form-title">Novo Logradouro</div>
                        <div className="form-grid">
                            <label className="form-field">
                                <span className="form-label">CEP</span>
                                <div style={{display: 'flex', gap: '8px'}}>
                                    <input
                                        className="form-input"
                                        style={{width: '120px'}}
                                        placeholder="99.999-999"
                                        maxLength={9}
                                        value={form.cep ?? ''}
                                        disabled
                                    />
                                    <button
                                        type="button"
                                        className="btnyellow"
                                        disabled={salvando}
                                        onClick={handleBuscar}
                                    >
                                        Buscar
                                    </button>
                                </div>
                                {aviso && <small style={{color: '#c0392b'}}>{aviso}</small>}
                            </label>
                            <label className="form-field">
                                <span className="form-label">Cidade *</span>
                                <AutoComplete
                                    placeholder="Digite 3 letras..."
                                    value={cidadeOpt}
                                    onChange={setCidadeOpt}
                                    fetchOptions={buscarCidadesLog}
                                />
                            </label>
                            <label className="form-field">
                                <span className="form-label">Bairro *</span>
                                <div style={{display: 'flex', gap: '8px'}}>
                                    <AutoComplete
                                        placeholder="Digite 3 letras..."
                                        value={bairroOpt}
                                        onChange={setBairroOpt}
                                        fetchOptions={(q) => buscarBairros(q, cidadeOpt?.id)}
                                        style={{flex: 1}}
                                    />
                                    <button
                                        type="button"
                                        className="btnblue"
                                        onClick={() => setShowNovoBairro(true)}
                                        disabled={!cidadeOpt?.id}
                                    >
                                        +
                                    </button>
                                </div>
                            </label>
                            <label className="form-field">
                                <span className="form-label">Logradouro *</span>
                                <input
                                    className="form-input"
                                    style={fullRowStyle}
                                    placeholder="Nome da rua/logradouro"
                                    value={form.descricao ?? ''}
                                    onChange={(e) => setForm((prev) => ({...prev, descricao: e.target.value}))}
                                />
                            </label>
                            <label className="form-field">
                                <span className="form-label">Tipo</span>
                                <input
                                    className="form-input"
                                    placeholder="Tipo (Rua, Av, etc.)"
                                    value={form.tipo ?? ''}
                                    onChange={(e) => setForm((prev) => ({...prev, tipo: e.target.value}))}
                                />
                            </label>
                            <label className="form-field">
                                <span className="form-label">Complemento</span>
                                <input
                                    className="form-input"
                                    style={fullRowStyle}
                                    placeholder="Complemento do logradouro"
                                    value={form.complemento ?? ''}
                                    onChange={(e) => setForm((prev) => ({...prev, complemento: e.target.value}))}
                                />
                            </label>
                        </div>
                        <div className="form-buttons">
                            <button type="button" className="btnblue" onClick={handleSalvar} disabled={salvando}>
                                {salvando ? 'Salvando...' : 'Salvar'}
                            </button>
                            <button type="button" className="btnyellow" onClick={onClose}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {showNovoBairro && (
                <div className="modal-overlay" onClick={() => setShowNovoBairro(false)}>
                    <div className="modal form-modal" style={{maxWidth: '400px'}} onClick={(e) => e.stopPropagation()}>
                        <div className="div_form">
                            <div className="form-title">Novo Bairro</div>
                            <div className="form-grid">
                                <label className="form-field">
                                    <span className="form-label">CEP</span>
                                    <input
                                        className="form-input"
                                        style={{width: '120px'}}
                                        placeholder="99.999-999"
                                        maxLength={9}
                                        value={cep}
                                        disabled
                                    />
                                </label>
                                <label className="form-field">
                                    <span className="form-label">Cidade</span>
                                    <input
                                        className="form-input"
                                        placeholder="Cidade"
                                        value={cidadeOpt?.label ?? ''}
                                        disabled
                                    />
                                </label>
                                <label className="form-field">
                                    <span className="form-label">Bairro *</span>
                                    <input
                                        className="form-input"
                                        placeholder="Nome do bairro"
                                        value={novoBairroNome}
                                        onChange={(e) => setNovoBairroNome(e.target.value)}
                                    />
                                </label>
                            </div>
                            <div className="form-buttons">
                                <button type="button" className="btnblue" onClick={handleSalvarBairro} disabled={!novoBairroNome.trim()}>
                                    Salvar
                                </button>
                                <button type="button" className="btnyellow" onClick={() => setShowNovoBairro(false)}>
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export function EnderecoCampos({
    value,
    onChange,
}: {
    value: Endereco[];
    onChange: (enderecos: Endereco[]) => void;
}) {
    const [endereco, setEndereco] = useState<Partial<Endereco>>(value[0] || {});
    const [buscando, setBuscando] = useState(false);
    const [aviso, setAviso] = useState('');

    const atualizar = (patch: Partial<Endereco>) => {
        setAviso('');
        const novo = {...endereco, ...patch};
        setEndereco(novo);
        onChange([novo as Endereco]);
    };

    const handleBuscar = async () => {
        if ((endereco.cep ?? '').replace(/\D/g, '').length !== 8) {
            setAviso('Informe um CEP com 8 dígitos.');
            return;
        }
        setBuscando(true);
        const dados = await buscarCep(endereco.cep ?? '');
        setBuscando(false);
        if (dados) {
            atualizar(dados);
        } else {
            setAviso('CEP não encontrado.');
        }
    };

    return (
        <>
            <label className="form-field" style={{gridColumn: '1 / -1'}}>
                <span className="form-label">CEP *</span>
                <div style={{display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'nowrap', width: '100%'}}>
                    <input
                        className="form-input"
                        placeholder="99.999-999"
                        style={{width: '120px', flexShrink: 0}}
                        maxLength={9}
                        value={endereco.cep ?? ''}
                        onChange={(event) => atualizar({cep: formatCep(event.target.value)})}
                    />
                    <button type="button" className="btnyellow" disabled={buscando} onClick={handleBuscar}>
                        {buscando ? '...' : 'Busca'}
                    </button>
                </div>
                {aviso && <small style={{color: '#c0392b'}}>{aviso}</small>}
            </label>
            <label className="form-field" style={{gridColumn: '1 / -1'}}>
                <span className="form-label">Cidade *</span>
                <input
                    className="form-input"
                    placeholder="Cidade"
                    value={endereco.cidade ?? ''}
                    onChange={(event) => atualizar({cidade: event.target.value})}
                />
            </label>
            <label className="form-field" style={{gridColumn: '1 / -1'}}>
                <span className="form-label">Bairro *</span>
                <input
                    className="form-input"
                    placeholder="Bairro"
                    value={endereco.bairro ?? ''}
                    onChange={(event) => atualizar({bairro: event.target.value})}
                />
            </label>
            <label className="form-field" style={{gridColumn: '1 / -1'}}>
                <span className="form-label">Logradouro *</span>
                <input
                    className="form-input"
                    placeholder="Logradouro"
                    value={endereco.logradouro ?? ''}
                    onChange={(event) => atualizar({logradouro: event.target.value})}
                />
            </label>
            <label className="form-field" style={{gridColumn: '1 / -1'}}>
                <span className="form-label">Número *</span>
                <input
                    className="form-input"
                    type="number"
                    placeholder="Número"
                    value={endereco.numero ?? ''}
                    onChange={(event) => atualizar({numero: event.target.value})}
                />
            </label>
            <label className="form-field" style={{gridColumn: '1 / -1'}}>
                <span className="form-label">Complemento</span>
                <textarea
                    className="form-input"
                    placeholder="Complemento"
                    rows={3}
                    style={{minHeight: '80px'}}
                    value={endereco.complemento ?? ''}
                    onChange={(event) => atualizar({complemento: event.target.value})}
                />
            </label>
        </>
    );
}