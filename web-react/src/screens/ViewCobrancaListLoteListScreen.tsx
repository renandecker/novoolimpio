import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {api} from '../api';
import {PermissionGate} from '../permissions';
import {Tabs} from '../Tabs';
import {LoteEmailModal, LoteLigacaoModal, SITUACOES_COBRANCA} from '../LoteModals';

interface EtapaCobranca {
    id: number;
    descricao: string;
}

const BASE_PATH = '/api/financeiro/cobranca/lote';

export default function ViewCobrancaListLoteListScreen() {
    const etapasQuery = useQuery({
        queryKey: ['etapas-cobranca'],
        queryFn: async () => (await api.get<EtapaCobranca[]>('/api/financeiro/etapas-cobranca')).data,
    });
    const etapas = etapasQuery.data ? ? [];
    const [emailEtapa, setEmailEtapa] = useState<EtapaCobranca | null>(null);
    const [ligacaoEtapa, setLigacaoEtapa] = useState<EtapaCobranca | null>(null);

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Cobrança em lote</h1>
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
                        etapaKey="etapasCobrancaId"
                        etapaId={emailEtapa.id}
                        situacoes={SITUACOES_COBRANCA}
                        onClose={() => setEmailEtapa(null)}
                    />
                )}
                {ligacaoEtapa && (
                    <LoteLigacaoModal
                        basePath={BASE_PATH}
                        etapaKey="etapasCobrancaId"
                        etapaId={ligacaoEtapa.id}
                        situacoes={SITUACOES_COBRANCA}
                        onClose={() => setLigacaoEtapa(null)}
                    />
                )}
            </main>
        </PermissionGate>
    );
}
