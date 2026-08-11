import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { PermissionGate } from '../permissions';
import { Tabs } from '../Tabs';
import { LoteEmailModal, LoteLigacaoModal, SITUACOES_NAP } from '../LoteModals';

interface EtapaNap {
  id: number;
  descricao: string;
}

const BASE_PATH = '/api/educacao/nap/lote';

export default function ViewNapListLoteListScreen() {
  const etapasQuery = useQuery({
    queryKey: ['etapas-nap'],
    queryFn: async () => (await api.get<EtapaNap[]>('/api/educacao/etapas-nap')).data,
  });
  const etapas = etapasQuery.data ?? [];
  const [emailEtapa, setEmailEtapa] = useState<EtapaNap | null>(null);
  const [ligacaoEtapa, setLigacaoEtapa] = useState<EtapaNap | null>(null);

  return (
    <PermissionGate permission="READ">
      <main>
        <h1>NAP em lote</h1>
        {etapasQuery.isLoading && etapas.length === 0 ? (
          <p>Carregando etapas...</p>
        ) : (
          <Tabs
            tabs={etapas.map((etapa) => ({
              key: String(etapa.id),
              label: etapa.descricao || `Etapa ${etapa.id}`,
              content: (
                <div>
                  <div className="data-table-toolbar">
                    <button className="btn-primary btnstop" onClick={() => setEmailEtapa(etapa)}>
                      @ E-mail
                    </button>
                    <button className="btnblue" onClick={() => setLigacaoEtapa(etapa)}>
                      Ligação
                    </button>
                  </div>
                </div>
              ),
            }))}
          />
        )}
        {etapasQuery.isError && <p>Erro ao carregar as etapas.</p>}

        {emailEtapa && (
          <LoteEmailModal
            basePath={BASE_PATH}
            etapaKey="etapasNapId"
            etapaId={emailEtapa.id}
            situacoes={SITUACOES_NAP}
            onClose={() => setEmailEtapa(null)}
          />
        )}
        {ligacaoEtapa && (
          <LoteLigacaoModal
            basePath={BASE_PATH}
            etapaKey="etapasNapId"
            etapaId={ligacaoEtapa.id}
            situacoes={SITUACOES_NAP}
            onClose={() => setLigacaoEtapa(null)}
          />
        )}
      </main>
    </PermissionGate>
  );
}
