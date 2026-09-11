import { useEffect, useState } from 'react';

import { useNavigate, useSearchParams } from 'react-router-dom';

import { PermissionGate } from '../../../shared/services/permissions';

import { api } from '../../../shared/services/api';



/**

 * Tela /view/tipoPausa/formTipoPausa

 * Replica po:panelGrid do extracted_aceso/src/main/webapp/view/tipoPausa/formTipoPausa.xhtml

 * Layout: p:panelGrid columns=1 div_form width 26%, header vazio, table_form 2 colunas

 *   - Id: po:inputInteiro disabled true, style inputTiny

 *   - Descrição *: po:inputTexto required true, f:validateLength 3-255, style inputLarge

 *   - Tempo pausa (segundos) *: p:inputText required true, requiredMessage "Insira o tempo intervalo", p:keyFilter mask=int

 *   - Footer: po:formButtons

 */



type TipoPausaRow = {

    id: number;

    descricao: string;

    qtde_tempo?: number;

    tempo?: number;

};



export default function ViewTipoPausaFormTipoPausaListScreen() {

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const idParam = searchParams.get('id');

    const editingId = idParam ? Number(idParam) : null;



    const [descricao, setDescricao] = useState('');

    const [tempo, setTempo] = useState('');

    const [loading, setLoading] = useState(false);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState('');

    const [success, setSuccess] = useState('');



    const isEdit = editingId !== null && !Number.isNaN(editingId);



    useEffect(() => {

        if (!isEdit) return;

        setLoading(true);

        setError('');

        api.get<TipoPausaRow>(`/api/view/tipoPausa/listTipoPausa/${editingId}`)

            .then((res) => {

                const row: any = res.data ?? {};

                setDescricao(String(row.descricao ?? ''));

                const t = row.qtde_tempo ?? row.tempo ?? row.qtdeTempo ?? '';

                setTempo(t === null || t === undefined ? '' : String(t));

            })

            .catch((e: any) => {

                const msg = e?.response?.data?.error ?? e?.message ?? 'Erro ao carregar Tipo Pausa.';

                setError(msg);

            })

            .finally(() => setLoading(false));

    }, [editingId, isEdit]);



    const validate = (): string | null => {

        const d = descricao.trim();

        if (!d) return 'Descrição é obrigatória.';

        if (d.length < 3) return 'Descrição deve ter no mínimo 3 caracteres.';

        if (d.length > 255) return 'Descrição deve ter no máximo 255 caracteres.';

        const t = tempo.trim();

        if (!t) return 'Insira o tempo intervalo';

        if (!/^-?\d+$/.test(t)) return 'Tempo pausa deve ser um inteiro';

        if (Number(t) < 0) return 'Tempo pausa deve ser positivo';

        return null;

    };



    const handleSave = async () => {

        const msg = validate();

        if (msg) {

            setError(msg);

            return;

        }

        setSaving(true);

        setError('');

        setSuccess('');

        const body: Record<string, unknown> = {

            descricao: descricao.trim(),

            qtde_tempo: Number(tempo.trim()),

            // também envia alias "tempo" para compatibilidade com /api/central/tipo-pausa

            tempo: Number(tempo.trim()),

        };

        try {

            if (isEdit) {

                await api.put(`/api/view/tipoPausa/listTipoPausa/${editingId}`, body);

                setSuccess('Tipo Pausa atualizado com sucesso.');

            } else {

                await api.post('/api/view/tipoPausa/listTipoPausa', body);

                setSuccess('Tipo Pausa criado com sucesso.');

            }

            setTimeout(() => navigate('/view/tipoPausa/listTipoPausa'), 800);

        } catch (e: any) {

            const srv = e?.response?.data?.error ?? e?.response?.data?.message ?? e?.message;

            setError(srv ?? 'Erro ao salvar.');

        } finally {

            setSaving(false);

        }

    };



    const handleTempoChange = (v: string) => {

        // p:keyFilter mask="int" — permite apenas dígitos e sinal negativo

        const filtered = v.replace(/[^\d-]/g, '');

        // mantém apenas um '-' no início

        const normalized = filtered.replace(/(?!^)-/g, '');

        setTempo(normalized);

    };



    return (

        <PermissionGate permission="READ">

            <main>

                {/* po:cabecalho controller="#{tipoPausaController}" */}

                <div className="page-header">

                    <h1>{isEdit ? `Editar Tipo Pausa #${editingId}` : 'Novo Tipo Pausa'}</h1>

                    <button type="button" className="btnblue" onClick={() => navigate('/view/tipoPausa/listTipoPausa')}>

                        Voltar

                    </button>

                </div>



                <div className="p-separator" style={{ width: '99%', height: 1, background: '#ddd', margin: '8px 0' }} />



                {/* p:growl */}

                {error && <div className="form-erro" style={{ background: '#FDE8E8', border: '1px solid #F5C2C2', color: '#8A1F1F', padding: 10, borderRadius: 6, marginBottom: 12 }}>{error}</div>}

                {success && <div style={{ background: '#E6F4EA', border: '1px solid #B7E1C6', color: '#1E4620', padding: 10, borderRadius: 6, marginBottom: 12 }}>{success}</div>}

                {loading && <p>Carregando...</p>}



                {/* p:panelGrid columns=1 div_form width 26% + table_form 2 cols */}

                <div className="div_form" style={{ width: '26%', minWidth: 360, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>

                    <div className="form-grid">

                        <label className="form-field">
                            <span className="form-label">Id</span>
                            <input id="inputId:id" className="form-input inputTiny" value={isEdit ? String(editingId) : ''} disabled placeholder="(novo)" style={{ width: 90, background: '#f3f4f6' }} />
                        </label>

                        <label className="form-field">
                            <span className="form-label">Tempo pausa (segundos) <span style={{ color: '#C90000' }}>*</span></span>
                            <input id="qtdeRetorno" className="form-input" value={tempo} onChange={(e) => handleTempoChange(e.target.value)} inputMode="numeric" placeholder="Ex.: 900" required />
                        </label>

                        <label className="form-field">
                            <span className="form-label">Descrição <span style={{ color: '#C90000' }}>*</span></span>
                            <input id="inputDescricao:descricao" className="form-input inputLarge" value={descricao} onChange={(e) => setDescricao(e.target.value)} maxLength={255} placeholder="Ex.: Almoço, Café, Banheiro…" required style={{ gridColumn: 'span 3' }} />
                        </label>

                    </div>



                    {/* hints de validação (f:validateLength / requiredMessage) */}

                    <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>

                        Descrição: 3 a 255 caracteres. Tempo: inteiro em segundos (obrigatório).

                    </div>



                    {/* po:formButtons */}

                    <div className="form-footer" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20, paddingTop: 12, borderTop: '1px solid #e5e7eb' }}>

                        <button type="button" className="btn-form-back" onClick={() => navigate('/view/tipoPausa/listTipoPausa')} disabled={saving}>

                            Cancelar

                        </button>

                        <button type="button" className="btn-form-save" onClick={handleSave} disabled={saving || loading}>

                            {saving ? 'Salvando...' : 'Salvar'}

                        </button>

                    </div>

                </div>

            </main>

        </PermissionGate>

    );

}

