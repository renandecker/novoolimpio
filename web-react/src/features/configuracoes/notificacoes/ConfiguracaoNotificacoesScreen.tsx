import React, { useEffect, useState } from 'react';
import { api } from '../../../shared/services/api';
import { API_PATHS } from '../../../shared/services/apiPaths';
import { BooleanField } from '../../../shared/components/BooleanField';
import type { PreferenciaNotificacaoCategoria, PreferenciaNotificacaoCanal } from '../../../shared/types/types';
import './ConfiguracaoNotificacoesScreen.css';

interface ConfiguracaoNotificacoesScreenProps {
  username?: string;
}

export default function ConfiguracaoNotificacoesScreen({ username: propUsername }: ConfiguracaoNotificacoesScreenProps) {
  const [categorias, setCategorias] = useState<PreferenciaNotificacaoCategoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const username = propUsername || 'admin';

  const fetchPreferencias = async () => {
    try {
      const response = await api.get<PreferenciaNotificacaoCategoria[]>(
        `${API_PATHS.notificacoes.preferencias}/minhas/agrupadas`,
        { params: { username } }
      );
      setCategorias(response.data);
    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar configurações de notificação' });
    } finally {
      setLoading(false);
    }
  };

  const handleCanalChange = async (categoria: string, tipo: string, canal: string, ativo: boolean) => {
    setCategorias(prev =>
      prev.map(cat =>
        cat.categoria === categoria
          ? {
              ...cat,
              tipos: cat.tipos.map(t =>
                t.tipo === tipo
                  ? {
                      ...t,
                      canais: t.canais.map(c =>
                        c.canal === canal ? { ...c, ativo } : c
                      ),
                    }
                  : t
              ),
            }
          : cat
      )
    );
  };

  const saveAll = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const requests = categorias.flatMap(cat =>
        cat.tipos.flatMap(tipo =>
          tipo.canais.map(canal => ({
            username,
            categoria: cat.categoria,
            tipo: tipo.tipo,
            canal: canal.canal,
            ativo: canal.ativo,
          }))
        )
      );

      await Promise.all(
        requests.map(req =>
          api.post(API_PATHS.notificacoes.preferencias, req)
        )
      );

      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
      setMessage({ type: 'error', text: 'Erro ao salvar configurações' });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchPreferencias();
  }, [username]);

  const renderCanalBadge = (canal: PreferenciaNotificacaoCanal) => {
    const canalColors: Record<string, string> = {
      PUSH: '#2a5a88',
      TELEGRAM: '#0088cc',
      WHATSAPP: '#25D366',
      EMAIL: '#ea4335',
      SMS: '#34a853',
    };
    return (
      <span
        className="canal-badge"
        style={{
          backgroundColor: canal.ativo ? canalColors[canal.canal] : '#e0e0e0',
          color: canal.ativo ? '#fff' : '#999',
        }}
      >
        {canal.canalLabel}
      </span>
    );
  };

  if (loading) {
    return <div className="config-notificacoes-loading">Carregando configurações...</div>;
  }

  return (
    <div className="config-notificacoes-container">
      <div className="config-notificacoes-header">
        <h1 className="config-notificacoes-title">Configuração de Notificações</h1>
        <p className="config-notificacoes-subtitle">
          Gerencie como deseja receber notificações para cada tipo de evento.
        </p>
      </div>

      {message && (
        <div className={`config-notificacoes-message config-notificacoes-message--${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="config-notificacoes-content">
        {categorias.map((categoria) => (
          <section key={categoria.categoria} className="config-notificacoes-categoria">
            <header className="config-notificacoes-categoria-header">
              <h2 className="config-notificacoes-categoria-title">{categoria.categoriaLabel}</h2>
              <p className="config-notificacoes-categoria-desc">{categoria.descricao}</p>
            </header>

            <div className="config-notificacoes-tipos">
              {categoria.tipos.map((tipo) => (
                <article key={tipo.tipo} className="config-notificacoes-tipo">
                  <div className="config-notificacoes-tipo-header">
                    <h3 className="config-notificacoes-tipo-title">{tipo.tipoLabel}</h3>
                    <p className="config-notificacoes-tipo-desc">{tipo.descricao}</p>
                  </div>

                  <div className="config-notificacoes-canais">
                    {tipo.canais.map((canal) => (
                      <label key={canal.canal} className="config-notificacoes-canal-item">
                        <span className="config-notificacoes-canal-label">
                          {renderCanalBadge(canal)}
                        </span>
                        <BooleanField
                          value={canal.ativo}
                          onChange={(ativo) => handleCanalChange(categoria.categoria, tipo.tipo, canal.canal, ativo)}
                          onText="Ativo"
                          offText="Inativo"
                        />
                      </label>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="config-notificacoes-footer">
        <button
          type="button"
          className="btn-form-save btnstop"
          onClick={saveAll}
          disabled={saving}
        >
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </div>
    </div>
  );
}