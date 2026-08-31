import React, {useState, useEffect} from 'react';
import {PermissionGate} from '../../shared/services/permissions';
import {api} from '../../shared/services/api';

const TIPOS_SERVICO = [
    {label: 'Por Contato', value: 0},
    {label: 'Por Minuto', value: 1},
    {label: 'Por Dia', value: 2},
    {label: 'Por Semana', value: 3},
    {label: 'Por Mês', value: 4},
    {label: 'Por Ano', value: 5},
];

export default function ViewCustoServicoFormCustoServicoListScreen() {
    const [valorEmail, setValorEmail] = useState('');
    const [tipoEmail, setTipoEmail] = useState(0);
    const [valorSms, setValorSms] = useState('');
    const [tipoSms, setTipoSms] = useState(0);
    const [valorLigacao, setValorLigacao] = useState('');
    const [tipoLigacao, setTipoLigacao] = useState(0);
    const [unidadeSelecionada, setUnidadeSelecionada] = useState('');
    const [unidades, setUnidades] = useState<Array<{id: number; sucinto?: string; razaoSocial?: string; nomeFantasia?: string}>>([]);
    const [listaUnidades, setListaUnidades] = useState<Array<{id: number; sucinto?: string; razaoSocial?: string; nomeFantasia?: string}>>([]);
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        api.get('/api/basico/unidade').then(res => {
            if (Array.isArray(res.data)) {
                setListaUnidades(res.data);
            }
        }).catch(() => {});
    }, []);

    const handleAddUnidade = () => {
        if (!unidadeSelecionada) return;
        const encontrada = listaUnidades.find(u => String(u.id) === String(unidadeSelecionada));
        if (encontrada && !unidades.some(u => u.id === encontrada.id)) {
            setUnidades([...unidades, encontrada]);
            setUnidadeSelecionada('');
        }
    };

    const handleRemoveUnidade = (id: number) => {
        setUnidades(unidades.filter(u => u.id !== id));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (unidades.length === 0) {
            setErrorMsg('Selecione ao menos 1 unidade.');
            return;
        }
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        const payload = {
            valorEmail: Number(valorEmail || 0),
            tipoEmail: Number(tipoEmail),
            valorSms: Number(valorSms || 0),
            tipoSms: Number(tipoSms),
            valorLigacao: Number(valorLigacao || 0),
            tipoLigacao: Number(tipoLigacao),
            dataAlteracao: new Date().toISOString()
        };

        api.post('/api/financeiro/custo-servico', payload).then(() => {
            setSuccessMsg('Custo de serviço salvo com sucesso!');
            setLoading(false);
        }).catch(err => {
            setErrorMsg(err.response?.data?.message || 'Erro ao salvar custo de serviço.');
            setLoading(false);
        });
    };

    return (
        <PermissionGate permission="READ">
            <main style={{padding: '20px', maxWidth: '800px', margin: '0 auto'}}>
                <h1>Cadastro de Custo por Serviço</h1>
                <hr style={{margin: '15px 0'}}/>

                {successMsg && <div style={{padding: '10px', background: '#d4edda', color: '#155724', marginBottom: '15px', borderRadius: '4px'}}>{successMsg}</div>}
                {errorMsg && <div style={{padding: '10px', background: '#f8d7da', color: '#721c24', marginBottom: '15px', borderRadius: '4px'}}>{errorMsg}</div>}

                <form onSubmit={handleSave} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                    
                    <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
                        <label style={{flex: 1}}>
                            <strong>Valor Email *</strong>
                            <input
                                type="number"
                                step="0.01"
                                value={valorEmail}
                                onChange={e => setValorEmail(e.target.value)}
                                required
                                style={{width: '100%', padding: '8px', marginTop: '5px'}}
                                placeholder="0,00"
                            />
                        </label>
                        <label style={{flex: 2}}>
                            <strong>Tipo Serviço Email</strong>
                            <select
                                value={tipoEmail}
                                onChange={e => setTipoEmail(Number(e.target.value))}
                                style={{width: '100%', padding: '8px', marginTop: '5px'}}
                            >
                                {TIPOS_SERVICO.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </label>
                    </div>

                    <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
                        <label style={{flex: 1}}>
                            <strong>Valor SMS *</strong>
                            <input
                                type="number"
                                step="0.01"
                                value={valorSms}
                                onChange={e => setValorSms(e.target.value)}
                                required
                                style={{width: '100%', padding: '8px', marginTop: '5px'}}
                                placeholder="0,00"
                            />
                        </label>
                        <label style={{flex: 2}}>
                            <strong>Tipo Serviço SMS</strong>
                            <select
                                value={tipoSms}
                                onChange={e => setTipoSms(Number(e.target.value))}
                                style={{width: '100%', padding: '8px', marginTop: '5px'}}
                            >
                                {TIPOS_SERVICO.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </label>
                    </div>

                    <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
                        <label style={{flex: 1}}>
                            <strong>Valor Ligação *</strong>
                            <input
                                type="number"
                                step="0.01"
                                value={valorLigacao}
                                onChange={e => setValorLigacao(e.target.value)}
                                required
                                style={{width: '100%', padding: '8px', marginTop: '5px'}}
                                placeholder="0,00"
                            />
                        </label>
                        <label style={{flex: 2}}>
                            <strong>Tipo Serviço Ligação</strong>
                            <select
                                value={tipoLigacao}
                                onChange={e => setTipoLigacao(Number(e.target.value))}
                                style={{width: '100%', padding: '8px', marginTop: '5px'}}
                            >
                                {TIPOS_SERVICO.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </label>
                    </div>

                    <div style={{marginTop: '15px', border: '1px solid #ddd', padding: '15px', borderRadius: '4px'}}>
                        <h3>Unidades</h3>
                        <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                            <select
                                value={unidadeSelecionada}
                                onChange={e => setUnidadeSelecionada(e.target.value)}
                                style={{flex: 1, padding: '8px'}}
                            >
                                <option value="">-- Selecione a Unidade --</option>
                                {listaUnidades.map(u => (
                                    <option key={u.id} value={u.id}>{u.sucinto} - {u.razaoSocial || u.nomeFantasia}</option>
                                ))}
                            </select>
                            <button type="button" onClick={handleAddUnidade} style={{padding: '8px 15px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
                                Adicionar
                            </button>
                        </div>

                        <table style={{width: '100%', marginTop: '15px', borderCollapse: 'collapse'}}>
                            <thead>
                                <tr style={{background: '#f1f1f1', textAlign: 'left'}}>
                                    <th style={{padding: '8px', borderBottom: '1px solid #ddd'}}>Sucinto</th>
                                    <th style={{padding: '8px', borderBottom: '1px solid #ddd'}}>Razão Social / Nome</th>
                                    <th style={{padding: '8px', borderBottom: '1px solid #ddd', width: '80px'}}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {unidades.map(u => (
                                    <tr key={u.id}>
                                        <td style={{padding: '8px', borderBottom: '1px solid #ddd'}}>{u.sucinto}</td>
                                        <td style={{padding: '8px', borderBottom: '1px solid #ddd'}}>{u.razaoSocial || u.nomeFantasia}</td>
                                        <td style={{padding: '8px', borderBottom: '1px solid #ddd'}}>
                                            <button type="button" onClick={() => handleRemoveUnidade(u.id)} style={{background: '#dc3545', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer'}}>
                                                Remover
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {unidades.length === 0 && (
                                    <tr>
                                        <td colSpan={3} style={{padding: '15px', textAlign: 'center', color: '#666'}}>Nenhuma unidade selecionada.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div style={{marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
                        <button type="submit" disabled={loading} style={{padding: '10px 20px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'}}>
                            {loading ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>

                </form>
            </main>
        </PermissionGate>
    );
}
