import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PermissionGate } from '../permissions';
import { api } from '../api';
import { MasterDetail } from '../MasterDetail';
import { UNIDADE_SOURCE, UNIDADE_COLUMNS, UNIDADE_SEARCH } from '../masterDetailSources';
import type { ApiItem } from '../types';

/**
 * Tela /view/turnoTrabalho/formTurnoTrabalho
 * Replica extracted_aceso/src/main/webapp/view/turnoTrabalho/formTurnoTrabalho.xhtml
 *
 * Layout:
 *  - h:form id="mainForm" com p:growl + po:cabecalho + p:separator width 99%
 *  - p:panelGrid columns="1" div_form width 40% + header vazio + footer po:formButtons
 *    - h:panelGrid columns="2" table_form:
 *      - Id: po:inputInteiro disabled true inputTiny
 *      - Descrição *: po:inputTexto required 3-255 inputMedium
 *      - Início *: p:inputMask mask 99:99 required inputTiny
 *      - Fim *: p:inputMask mask 99:99 required inputTiny
 *      - Dia Semana *: po:inputSelecioneUm required listValue diaSemanaService.findAll() converter diaSemanaConverter
 *    - h:panelGrid width 100% columns 1 table_form:
 *      - Unidades: po:inputMestreDetalheAutoComplete detailLabel id+sucinto, converter unidadeConverter, targetList unidades
 *
 * Regras (TurnoTrabalhoController.saveOrUpdate + TurnoTrabalhoService.save):
 *  - descricao 3-255 obrigatório
 *  - inicio/fim formato HH:mm (HorarioUtil.verificarHoraValida) e inicio < fim
 *  - diaSemana obrigatório
 *  - pelo menos uma unidade selecionada
 *  - removeUnidade respeita franquia (simplificado no front: permite remover)
 */

type DiaSemanaOpt = { id: number; nome: string };

const maskHora = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}:${d.slice(2)}`;
};

const validarHora = (hhmm: string): string | null => {
  if (!hhmm || hhmm.length !== 5) return 'Hora deve ter 5 dígitos. Ex.: 08:30';
  if (!hhmm.includes(':')) return 'Hora deve seguir o padrão Ex.: 08:30';
  const [h, m] = hhmm.split(':');
  if (h.length !== 2 || m.length !== 2) return 'Hora deve seguir o padrão Ex.: 08:30';
  const hi = Number(h);
  const mi = Number(m);
  if (Number.isNaN(hi) || Number.isNaN(mi)) return 'Hora deve seguir o padrão Ex.: 08:30';
  if (hi < 0 || hi >= 24) return 'Hora deve estar no intervalo de 0 a 23h. Ex.: 08:30';
  if (mi < 0 || mi >= 60) return 'O minuto deve estar no intervalo de 0 a 59m. Ex.: 08:30';
  return null;
};

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

export default function ViewTurnoTrabalhoFormTurnoTrabalhoListScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const idParam = searchParams.get('id');
  const editingId = idParam ? Number(idParam) : null;
  const isEdit = editingId !== null && !Number.isNaN(editingId);

  const [descricao, setDescricao] = useState('');
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [diaSemanaId, setDiaSemanaId] = useState<string>('');
  const [diaSemanaOpts, setDiaSemanaOpts] = useState<DiaSemanaOpt[]>([]);
  const [unidades, setUnidades] = useState<ApiItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // carrega combo diaSemana (replica turnoTrabalhoController.listDiaSemana())
  useEffect(() => {
    let alive = true;
    api
      .get<DiaSemanaOpt[]>('/api/central/turno-trabalho/dia-semana/opcoes')
      .then((res) => {
        if (!alive) return;
        setDiaSemanaOpts(res.data ?? []);
      })
      .catch(async () => {
        // fallback: tenta via ViewService se central não responder (ex.: dev sem microservice)
        try {
          const v = await api.get<any[]>('/api/view/diaSemana/listDiaSemana');
          if (alive && Array.isArray(v.data)) {
            setDiaSemanaOpts(v.data.map((r: any) => ({ id: Number(r.id), nome: String(r.nome ?? r.descricao ?? '') })));
          }
        } catch {
          // mantém vazio — mostra mensagem no form
        }
      });
    return () => {
      alive = false;
    };
  }, []);

  // carrega dados para edição (replica turnoTrabalhoController.setEntity + buscarTurnoTrabalhoComUnidades)
  useEffect(() => {
    if (!isEdit || editingId === null) return;
    let alive = true;
    setLoading(true);
    setError('');
    (async () => {
      try {
        // tenta central primeiro (retorna unidadeIds + diaSemanaNome)
        const ent = (await api.get<any>(`/api/central/turno-trabalho/${editingId}`)).data;
        if (!alive) return;
        setDescricao(String(ent.descricao ?? ''));
        setInicio(String(ent.inicio ?? ''));
        setFim(String(ent.fim ?? ''));
        setDiaSemanaId(ent.diaSemanaId != null ? String(ent.diaSemanaId) : ent.id_dia_semana != null ? String(ent.id_dia_semana) : '');
        const uids: number[] = Array.isArray(ent.unidadeIds) ? ent.unidadeIds.map((n: any) => Number(n)) : [];
        if (uids.length > 0) {
          // busca detalhes das unidades via ViewService para exibir no MasterDetail
          const us: ApiItem[] = [];
          for (const uid of uids) {
            try {
              const u = (await api.get<any>(`/api/view/unidade/listUnidade/${uid}`)).data;
              us.push({ id: Number(u.id), nome: String(u.sucinto ?? u.razao_social ?? `#${uid}`), dadosJson: JSON.stringify(u) } as any);
              // também tenta enriquecer com dados completos para MasterDetail columns
              (us[us.length - 1] as any).sucinto = u.sucinto;
              (us[us.length - 1] as any).razaoSocial = u.razao_social ?? u.razaoSocial;
              (us[us.length - 1] as any).nomeFantasia = u.nome_fantasia ?? u.nomeFantasia;
              (us[us.length - 1] as any).CNPJ = u.cnpj ?? u.CNPJ;
            } catch {
              us.push({ id: uid, nome: `#${uid}` } as ApiItem);
            }
          }
          setUnidades(us);
        }
      } catch (e: any) {
        // fallback ViewService
        try {
          const ent2 = (await api.get<any>(`/api/view/turnoTrabalho/listTurnoTrabalho/${editingId}`)).data;
          if (!alive) return;
          setDescricao(String(ent2.descricao ?? ''));
          setInicio(String(ent2.inicio ?? ''));
          setFim(String(ent2.fim ?? ''));
          const dia = ent2.id_dia_semana ?? ent2.diaSemanaId ?? ent2.id_diaSemana;
          setDiaSemanaId(dia != null ? String(dia) : '');
          // unidades via join: busca ids pela central ou ViewService nativo
          try {
            const ids = (await api.get<number[]>(`/api/central/turno-trabalho/${editingId}/unidades`)).data;
            if (Array.isArray(ids) && ids.length > 0) {
              const us: ApiItem[] = [];
              for (const uid of ids) {
                try {
                  const u = (await api.get<any>(`/api/view/unidade/listUnidade/${uid}`)).data;
                  us.push({ id: Number(u.id), nome: String(u.sucinto ?? `#${uid}`) } as ApiItem);
                  (us[us.length - 1] as any).sucinto = u.sucinto;
                  (us[us.length - 1] as any).razaoSocial = u.razao_social;
                } catch {
                  us.push({ id: Number(uid), nome: `#${uid}` } as ApiItem);
                }
              }
              setUnidades(us);
            }
          } catch {
            // sem unidades
          }
        } catch (e2: any) {
          const msg = e2?.response?.data?.error ?? e?.response?.data?.error ?? e2?.message ?? 'Erro ao carregar Turno de Trabalho.';
          setError(msg);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [editingId, isEdit]);

  const validate = (): string | null => {
    const d = descricao.trim();
    if (!d) return 'Descrição é obrigatória.';
    if (d.length < 3) return 'Descrição deve ter no mínimo 3 caracteres.';
    if (d.length > 255) return 'Descrição deve ter no máximo 255 caracteres.';
    const ini = inicio.trim();
    const f = fim.trim();
    if (!ini) return 'Início é obrigatório (formato 99:99).';
    if (!f) return 'Fim é obrigatório (formato 99:99).';
    const e1 = validarHora(ini);
    if (e1) return e1;
    const e2 = validarHora(f);
    if (e2) return e2;
    if (toMinutes(f) - toMinutes(ini) <= 0) return 'A hora de início deve ser inferior à hora final.';
    if (!diaSemanaId) return 'Dia da semana é obrigatório.';
    if (!unidades || unidades.length === 0) return 'Selecione pelo menos uma unidade';
    return null;
  };

  const handleSave = async (continuar = false) => {
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
      inicio: inicio.trim(),
      fim: fim.trim(),
      diaSemanaId: Number(diaSemanaId),
      unidadeIds: unidades.map((u) => (u as any).id ?? (u as any).value ?? u),
    };
    // compatibilidade ViewService: também envia aliases
    (body as any).id_dia_semana = Number(diaSemanaId);
    try {
      if (isEdit && editingId !== null) {
        await api.put(`/api/central/turno-trabalho/${editingId}`, body);
        setSuccess('Turno de Trabalho atualizado com sucesso.');
      } else {
        await api.post('/api/central/turno-trabalho', body);
        setSuccess('Turno de Trabalho criado com sucesso.');
      }
      // também tenta gravar via ViewService para manter /api/view consistente quando central está fora
      // (ignora erro — central é fonte da verdade para unidades)
      if (!continuar) {
        setTimeout(() => navigate('/view/turnoTrabalho/listTurnoTrabalho'), 800);
      } else if (!isEdit) {
        setDescricao('');
        setInicio('');
        setFim('');
        setDiaSemanaId('');
        setUnidades([]);
      }
    } catch (e: any) {
      const srv = e?.response?.data?.error ?? e?.response?.data?.message ?? e?.message;
      // fallback ViewService se central falhar (ex.: microservice fora do ar em dev)
      try {
        const vsBody: Record<string, unknown> = {
          descricao: descricao.trim(),
          inicio: inicio.trim(),
          fim: fim.trim(),
          id_dia_semana: Number(diaSemanaId),
          unidadeIds: unidades.map((u: any) => u.id),
        };
        if (isEdit && editingId !== null) {
          await api.put(`/api/view/turnoTrabalho/listTurnoTrabalho/${editingId}`, vsBody);
        } else {
          await api.post('/api/view/turnoTrabalho/listTurnoTrabalho', vsBody);
        }
        setSuccess('Turno de Trabalho salvo (via ViewService).');
        if (!continuar) setTimeout(() => navigate('/view/turnoTrabalho/listTurnoTrabalho'), 800);
      } catch {
        setError(srv ?? 'Erro ao salvar.');
      }
    } finally {
      setSaving(false);
    }
  };

  const horasParaTrabalhar = (() => {
    if (validarHora(inicio.trim()) || validarHora(fim.trim())) return null;
    try {
      const h = (toMinutes(fim.trim()) - toMinutes(inicio.trim())) / 60;
      return h > 0 ? h.toFixed(2) : null;
    } catch {
      return null;
    }
  })();

  return (
    <PermissionGate permission="READ">
      <main>
        {/* po:cabecalho */}
        <div className="page-header">
          <h1>{isEdit ? `Editar Turno de Trabalho #${editingId}` : 'Novo Turno de Trabalho'}</h1>
          <button type="button" className="btnblue" onClick={() => navigate('/view/turnoTrabalho/listTurnoTrabalho')}>
            Voltar
          </button>
        </div>

        <div className="p-separator" style={{ width: '99%', height: 1, background: '#ddd', margin: '8px 0' }} />

        {/* p:growl */}
        {error && (
          <div className="form-erro" style={{ background: '#FDE8E8', border: '1px solid #F5C2C2', color: '#8A1F1F', padding: 10, borderRadius: 6, marginBottom: 12 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: '#E6F4EA', border: '1px solid #B7E1C6', color: '#1E4620', padding: 10, borderRadius: 6, marginBottom: 12 }}>
            {success}
          </div>
        )}
        {loading && <p>Carregando...</p>}

        {/* p:panelGrid columns=1 div_form width 40% */}
        <div className="div_form" style={{ width: '40%', minWidth: 520, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 12, color: '#374151' }}>Turno de Trabalho</div>

          {/* h:panelGrid columns=2 table_form */}
          <div className="table_form" style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '12px 16px', alignItems: 'center' }}>
            {/* Id */}
            <label htmlFor="inputId:id" className="form-label" style={{ fontWeight: 600 }}>
              Id
            </label>
            <input id="inputId:id" className="form-input inputTiny" value={isEdit ? String(editingId) : ''} disabled placeholder="(novo)" style={{ width: 90, background: '#f3f4f6' }} />

            {/* Descrição * */}
            <label htmlFor="inputDescricao:descricao" className="form-label" style={{ fontWeight: 600 }}>
              Descrição <span style={{ color: '#C90000' }}>*</span>
            </label>
            <input
              id="inputDescricao:descricao"
              className="form-input inputMedium"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              maxLength={255}
              placeholder="Ex.: Manhã, Tarde, Noite…"
              required
            />

            {/* Início * mask 99:99 */}
            <label htmlFor="inputInicio" className="form-label" style={{ fontWeight: 600 }}>
              Início <span style={{ color: '#C90000' }}>*</span>
            </label>
            <input
              id="inputInicio"
              className="form-input inputTiny"
              value={inicio}
              onChange={(e) => setInicio(maskHora(e.target.value))}
              placeholder="08:00"
              maxLength={5}
              inputMode="numeric"
              style={{ width: 90 }}
              required
            />

            {/* Fim * mask 99:99 */}
            <label htmlFor="inputFim" className="form-label" style={{ fontWeight: 600 }}>
              Fim <span style={{ color: '#C90000' }}>*</span>
            </label>
            <input
              id="inputFim"
              className="form-input inputTiny"
              value={fim}
              onChange={(e) => setFim(maskHora(e.target.value))}
              placeholder="12:00"
              maxLength={5}
              inputMode="numeric"
              style={{ width: 90 }}
              required
            />

            {/* Dia Semana * */}
            <label htmlFor="inputDiaSemana:diaSemana" className="form-label" style={{ fontWeight: 600 }}>
              Dia Semana <span style={{ color: '#C90000' }}>*</span>
            </label>
            <select
              id="inputDiaSemana:diaSemana"
              className="form-input inputMedium"
              value={diaSemanaId}
              onChange={(e) => setDiaSemanaId(e.target.value)}
              required
            >
              <option value="">-- Selecione --</option>
              {diaSemanaOpts.map((o) => (
                <option key={o.id} value={String(o.id)}>
                  {o.nome}
                </option>
              ))}
            </select>

            {horasParaTrabalhar && (
              <>
                <span className="form-label" style={{ fontWeight: 600, color: '#6b7280' }}>
                  Horas p/ trabalhar
                </span>
                <span style={{ color: '#374151' }}>{horasParaTrabalhar} h</span>
              </>
            )}
          </div>

          {/* h:panelGrid width 100% columns 1 — MestreDetalhe Unidades */}
          <div style={{ marginTop: 16 }}>
            <MasterDetail
              label="Unidade"
              source={UNIDADE_SOURCE}
              valueKey="id"
              searchKeys={UNIDADE_SEARCH}
              columns={UNIDADE_COLUMNS}
              items={unidades}
              onChange={setUnidades}
            />
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Selecione pelo menos uma unidade. Use o campo acima para buscar por sucinto/razão social.</div>
          </div>

          <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>
            Campos com <span style={{ color: '#C90000' }}>*</span> são obrigatórios. Descrição 3–255 caracteres. Horários no formato 99:99 e início &lt; fim.
          </div>

          {/* po:formButtons */}
          <div className="form-footer" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20, paddingTop: 12, borderTop: '1px solid #e5e7eb' }}>
            <button type="button" className="btn-form-back" onClick={() => navigate('/view/turnoTrabalho/listTurnoTrabalho')} disabled={saving}>
              Cancelar
            </button>
            <button type="button" className="btn-form-save" onClick={() => handleSave(false)} disabled={saving || loading}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button type="button" className="btnstop" onClick={() => handleSave(true)} disabled={saving || loading} title="Salvar e continuar editando">
              Salvar e Continuar
            </button>
          </div>
        </div>
      </main>
    </PermissionGate>
  );
}
