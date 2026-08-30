import {useEffect, useState} from 'react';
import {alunoApi, ContratoFinanceiro, Financeiro, formatarData, formatarMoeda, Parcela} from '../../features/aluno/aluno';
import {PixQrCodeModal} from '../../features/professor/GestaoAlunoModais';
import '../../features/aluno/alunoPortal.css';

function ParcelasTabela({parcelas, titulo, pessoaId}: { parcelas: Parcela[]; titulo: string; pessoaId: number }) {
    if (parcelas.length === 0) return null;
    const [pixModalOpen, setPixModalOpen] = useState(false);
    const [selectedParcela, setSelectedParcela] = useState<Parcela | null>(null);

    const handlePixClick = (parcela: Parcela) => {
        if (parcela.dataPagamento) return;
        setSelectedParcela(parcela);
        setPixModalOpen(true);
    };

    const closePixModal = () => {
        setPixModalOpen(false);
        setSelectedParcela(null);
    };

    return (
        <>
            <section className="aluno-portal-item">
                <h2>{titulo}</h2>
                <table className="aluno-portal-tabela">
                    <thead>
                    <tr>
                        <th>DescriÃ§Ã£o</th>
                        <th>Parcela</th>
                        <th>Vencimento</th>
                        <th>Valor</th>
                        <th>Valor pago</th>
                        <th>SituaÃ§Ã£o</th>
                        <th>AÃ§Ãµes</th>
                    </tr>
                    </thead>
                    <tbody>
                    {parcelas.map(p => (
                        <tr key={`${p.contratoId ?? ''}-${p.id ?? p.parcelaSequencia ?? ''}`}>
                            <td>
                                <span style={{color: p.descricaoCor, fontWeight: 'bold'}}>{p.descricao}</span>
                            </td>
                            <td>{p.parcelaSequencia ?? p.parcela ?? '-'}</td>
                            <td>{formatarData(p.dataVencimento)}</td>
                            <td>{formatarMoeda(p.valor)}</td>
                            <td>{formatarMoeda(p.valorPago)}</td>
                            <td>
                    <span className="aluno-portal-status" style={{backgroundColor: p.situacaoCor}}>
                      {p.situacao}
                    </span>
                            </td>
                            <td>
                                {!p.dataPagamento && p.situacao !== 'Cancelado' && (
                                    <button
                                        type="button"
                                        className={p.idParcelaPix ? 'btnyellow' : 'btnblue'}
                                        style={{padding: '0.25rem 0.5rem', fontSize: '0.8rem'}}
                                        onClick={() => handlePixClick(p)}
                                        title={p.idParcelaPix ? 'Ver PIX gerado / Enviar por e-mail' : 'Gerar QR Code PIX'}
                                    >
                                        {p.idParcelaPix ? 'ðŸ“± PIX' : 'ðŸ“± Gerar PIX'}
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </section>
            <PixQrCodeModal
                isOpen={pixModalOpen}
                onClose={closePixModal}
                parcela={selectedParcela ? {...selectedParcela, pessoaId} : null}
            />
        </>
    );
}

export default function AlunoFinanceiroScreen() {
    const [financeiro, setFinanceiro] = useState<Financeiro | null>(null);
    const [pessoaId, setPessoaId] = useState<number | null>(null);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(true);

    useEffect(() => {
        let active = true;
        // Fetch pessoaId from perfil
        alunoApi.perfil()
            .then(perfil => {
                if (active) setPessoaId(Number(perfil.id ?? 0));
            })
            .catch(() => {
                // ignore
            });
        alunoApi
            .financeiro()
            .then(data => {
                if (active) setFinanceiro(data);
            })
            .catch((e: any) => {
                if (active) setError(e.response?.data?.error || e.response?.data?.message || 'NÃ£o foi possÃ­vel carregar o financeiro.');
            })
            .finally(() => {
                if (active) setBusy(false);
            });
        return () => {
            active = false;
        };
    }, []);

    if (busy) return <main><h1>Financeiro</h1><p className="aluno-portal-msg">Carregando...</p></main>;
    if (error) return <main><h1>Financeiro</h1>
        <div className="aluno-portal-error" role="alert">{error}</div>
    </main>;

    const resumo = financeiro?.resumo;

    return (
        <main className="aluno-portal">
            <h1>Financeiro</h1>

            {resumo && (
                <div className="aluno-portal-cards">
                    <div className="aluno-portal-card">
            <span className="aluno-portal-card-valor">
              <span
                  className="aluno-portal-status"
                  style={{backgroundColor: resumo.situacao === 'Atraso' ? '#FF0000' : '#1e7e45'}}
              >
                {resumo.situacao}
              </span>
            </span>
                        <span className="aluno-portal-card-rotulo">
              {resumo.situacao === 'Atraso' && resumo.diasAtraso ? `com ${resumo.diasAtraso} dia(s) de atraso` : 'SituaÃ§Ã£o do contrato'}
            </span>
                    </div>
                    <div className="aluno-portal-card">
                        <span className="aluno-portal-card-valor">{resumo.qtdParcelasAtrasadas ?? 0}</span>
                        <span className="aluno-portal-card-rotulo">Parcelas atrasadas</span>
                    </div>
                    <div className="aluno-portal-card">
                        <span className="aluno-portal-card-valor">{resumo.qtdParcelasRestantes ?? 0}</span>
                        <span className="aluno-portal-card-rotulo">Parcelas restantes</span>
                    </div>
                    <div className="aluno-portal-card">
                        <span className="aluno-portal-card-valor">{formatarMoeda(resumo.valorPendente)}</span>
                        <span className="aluno-portal-card-rotulo">Valor pendente</span>
                    </div>
                </div>
            )}

            {(financeiro?.contratos?.length ?? 0) > 0 && (
                <section className="aluno-portal-item">
                    <h2>Contratos</h2>
                    <table className="aluno-portal-tabela">
                        <thead>
                        <tr>
                            <th>Contrato</th>
                            <th>Curso</th>
                            <th>Unidade</th>
                            <th>Unidade responsÃ¡vel</th>
                            <th>Status</th>
                            <th>Qtd reparcelamento</th>
                            <th>PrÃ³xima parcela</th>
                            <th>Ãšltima parcela</th>
                        </tr>
                        </thead>
                        <tbody>
                        {financeiro!.contratos.map((c: ContratoFinanceiro) => (
                            <tr key={c.id ?? 0}>
                                <td>{c.id}</td>
                                <td>{c.curso}</td>
                                <td>{c.unidade}</td>
                                <td>{c.unidadeResponsavel}</td>
                                <td>{c.status}</td>
                                <td>{c.qtdeReparcelamento ?? 0}</td>
                                <td>
                                    {c.proximaParcelaSequencia != null
                                        ? `${c.proximaParcelaSequencia}Âª Â· ${formatarData(c.proximaParcelaData)} Â· ${formatarMoeda(c.proximaParcelaValor)}`
                                        : '-'}
                                </td>
                                <td>
                                    {c.ultimaParcelaSequencia != null
                                        ? `${c.ultimaParcelaSequencia}Âª Â· ${formatarData(c.ultimaParcelaData)} Â· ${formatarMoeda(c.ultimaParcelaValor)}`
                                        : '-'}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </section>
            )}

            {financeiro && pessoaId && (
                <>
                    <ParcelasTabela titulo="Parcelas deste mÃªs / em atraso" parcelas={financeiro.parcelasMes} pessoaId={pessoaId}/>
                    <ParcelasTabela titulo="MatrÃ­cula" parcelas={financeiro.parcelasMatricula} pessoaId={pessoaId}/>
                    <ParcelasTabela titulo="Produtos" parcelas={financeiro.parcelasProdutos} pessoaId={pessoaId}/>
                    <ParcelasTabela titulo="Canceladas" parcelas={financeiro.parcelasCanceladas} pessoaId={pessoaId}/>
                </>
            )}

            {financeiro && !financeiro.parcelasMes.length && !financeiro.parcelasMatricula.length &&
            !financeiro.parcelasProdutos.length && !financeiro.parcelasCanceladas.length && (
                <p className="aluno-portal-msg">Nenhuma parcela encontrada.</p>
            )}
        </main>
    );
}
