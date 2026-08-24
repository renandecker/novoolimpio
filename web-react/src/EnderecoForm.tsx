import {useState} from 'react';
import type {FormEvent} from 'react';

export interface Endereco {
    id?: number;
    cep: string;
    cidade: string;
    bairro: string;
    logradouro: string;
    numero: string;
    complemento: string;
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
}

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

function EnderecoModal({
    titulo,
    inicial,
    onSave,
    onClose,
}: {
    titulo: string;
    inicial: Partial<Endereco>;
    onSave: (endereco: Endereco) => void;
    onClose: () => void;
}) {
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
                                <span className="form-label">Cidade</span>
                                <input
                                    className="form-input"
                                    placeholder="Cidade"
                                    style={{gridColumn: 'span 3'}}
                                    value={form.cidade ?? ''}
                                    onChange={(event) => setForm((prev) => ({...prev, cidade: event.target.value}))}
                                />
                            </label>
                            <label className="form-field">
                                <span className="form-label">Bairro</span>
                                <input
                                    className="form-input"
                                    placeholder="Bairro"
                                    style={{gridColumn: 'span 3'}}
                                    value={form.bairro ?? ''}
                                    onChange={(event) => setForm((prev) => ({...prev, bairro: event.target.value}))}
                                />
                            </label>
                            <label className="form-field">
                                <span className="form-label">Logradouro</span>
                                <input
                                    className="form-input"
                                    placeholder="Logradouro"
                                    style={{gridColumn: 'span 3'}}
                                    value={form.logradouro ?? ''}
                                    onChange={(event) => setForm((prev) => ({...prev, logradouro: event.target.value}))}
                                />
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
                                <span className="form-label">Complemento</span>
                                <textarea
                                    className="form-input"
                                    placeholder="Complemento"
                                    rows={3}
                                    style={{gridColumn: 'span 3', minHeight: '80px'}}
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

export function EnderecoCampos({
    value,
    onChange,
}: {
    value: Endereco[];
    onChange: (enderecos: Endereco[]) => void;
}) {
    const [indiceSelecionado, setIndiceSelecionado] = useState<number | null>(null);
    const [rascunho, setRascunho] = useState<Partial<Endereco>>({});
    const [buscando, setBuscando] = useState(false);
    const [aviso, setAviso] = useState('');
    const [modal, setModal] = useState<'novo' | 'ajuste' | null>(null);

    const selecionado = indiceSelecionado !== null ? value[indiceSelecionado] : undefined;
    const atual: Partial<Endereco> = selecionado ?? rascunho;

    const atualizar = (patch: Partial<Endereco>) => {
        setAviso('');
        if (indiceSelecionado !== null) {
            onChange(value.map((item, i) => (i === indiceSelecionado ? {...item, ...patch} : item)));
        } else {
            setRascunho((prev) => ({...prev, ...patch}));
        }
    };

    const handleBuscar = async () => {
        if ((atual.cep ?? '').replace(/\D/g, '').length !== 8) {
            setAviso('Informe um CEP com 8 dígitos.');
            return;
        }
        setBuscando(true);
        const dados = await buscarCep(atual.cep ?? '');
        setBuscando(false);
        if (dados) {
            atualizar(dados);
        } else {
            setAviso('CEP não encontrado.');
        }
    };

    const salvarModal = (dados: Endereco) => {
        setModal(null);
        if (modal === 'novo') {
            onChange([...value, {...dados, id: Date.now()}]);
            setIndiceSelecionado(value.length);
            setRascunho({});
        } else if (indiceSelecionado !== null) {
            onChange(value.map((item, i) => (i === indiceSelecionado ? {...item, ...dados} : item)));
        } else {
            setRascunho((prev) => ({...prev, ...dados}));
        }
    };

    const selecionarLinha = (index: number) => {
        setIndiceSelecionado(index);
        setRascunho({});
        setAviso('');
    };

    const removerLinha = (index: number) => {
        onChange(value.filter((_, i) => i !== index));
        if (indiceSelecionado === index) {
            setIndiceSelecionado(null);
            setRascunho({});
        } else if (indiceSelecionado !== null && indiceSelecionado > index) {
            setIndiceSelecionado(indiceSelecionado - 1);
        }
    };

    return (
        <>
            <label className="form-field">
                <span className="form-label">CEP</span>
                <div style={{display: 'flex', gap: '8px', width: '100%'}}>
                    <input
                        className="form-input"
                        placeholder="99.999-999"
                        style={{width: '120px'}}
                        maxLength={9}
                        value={atual.cep ?? ''}
                        onChange={(event) => atualizar({cep: formatCep(event.target.value)})}
                    />
                    <button type="button" className="btnyellow" disabled={buscando} onClick={handleBuscar}>
                        {buscando ? '...' : 'Busca'}
                    </button>
                    <button type="button" className="btngreen" onClick={() => setModal('ajuste')}>
                        Ajuste
                    </button>
                    <button type="button" className="btnstop" onClick={() => setModal('novo')}>
                        Novo
                    </button>
                </div>
                {aviso && <small style={{color: '#c0392b'}}>{aviso}</small>}
            </label>
            <label className="form-field">
                <span className="form-label">Cidade</span>
                <input
                    className="form-input"
                    placeholder="Cidade"
                    style={{gridColumn: 'span 3'}}
                    value={atual.cidade ?? ''}
                    onChange={(event) => atualizar({cidade: event.target.value})}
                />
            </label>
            <label className="form-field">
                <span className="form-label">Bairro</span>
                <input
                    className="form-input"
                    placeholder="Bairro"
                    style={{gridColumn: 'span 3'}}
                    value={atual.bairro ?? ''}
                    onChange={(event) => atualizar({bairro: event.target.value})}
                />
            </label>
            <label className="form-field">
                <span className="form-label">Logradouro</span>
                <input
                    className="form-input"
                    placeholder="Logradouro"
                    style={{gridColumn: 'span 3'}}
                    value={atual.logradouro ?? ''}
                    onChange={(event) => atualizar({logradouro: event.target.value})}
                />
            </label>
            <label className="form-field">
                <span className="form-label">Número</span>
                <input
                    className="form-input"
                    type="number"
                    placeholder="Número"
                    value={atual.numero ?? ''}
                    onChange={(event) => atualizar({numero: event.target.value})}
                />
            </label>
            <label className="form-field">
                <span className="form-label">Complemento</span>
                <textarea
                    className="form-input"
                    placeholder="Complemento"
                    rows={3}
                    style={{gridColumn: 'span 3', minHeight: '80px'}}
                    value={atual.complemento ?? ''}
                    onChange={(event) => atualizar({complemento: event.target.value})}
                />
            </label>
            {value.length > 0 && (
                <div className="master-detail-table" style={{gridColumn: '1 / -1', marginTop: '16px'}}>
                    <table>
                        <thead>
                            <tr>
                                <th>CEP</th>
                                <th>Logradouro</th>
                                <th>Número</th>
                                <th>Bairro</th>
                                <th>Cidade</th>
                                <th>Complemento</th>
                                <th className="col-actions">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {value.map((endereco, index) => (
                                <tr
                                    key={endereco.id ?? index}
                                    style={
                                        indiceSelecionado === index
                                            ? {backgroundColor: 'rgba(59, 130, 246, 0.12)'}
                                            : undefined
                                    }
                                >
                                    <td>{endereco.cep}</td>
                                    <td>{endereco.logradouro}</td>
                                    <td>{endereco.numero}</td>
                                    <td>{endereco.bairro}</td>
                                    <td>{endereco.cidade}</td>
                                    <td>{endereco.complemento}</td>
                                    <td className="col-actions">
                                        <button
                                            type="button"
                                            className="btn-action btnyellow"
                                            title="Editar"
                                            onClick={() => selecionarLinha(index)}
                                        >
                                            ✏
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-action btn-danger"
                                            title="Remover"
                                            onClick={() => removerLinha(index)}
                                        >
                                            ×
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {modal !== null && (
                <EnderecoModal
                    titulo={modal === 'novo' ? 'Novo Endereço' : 'Ajustar Endereço'}
                    inicial={modal === 'novo' ? {...atual, id: undefined} : {...atual}}
                    onSave={salvarModal}
                    onClose={() => setModal(null)}
                />
            )}
        </>
    );
}
