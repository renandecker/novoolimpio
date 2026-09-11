import {useState, useCallback} from 'react';
import {PermissionGate} from '../../../shared/services/permissions';
import {ModuleTabs} from '../../../shared/components/ModuleTabs';
import {DataTable} from '../../../shared/components/DataTable';
import {MasterDetail} from '../../../shared/components/MasterDetail';
import {Tabs} from '../../../shared/components/Tabs';
import {Modal} from '../../../shared/components/Modal';
import {AutoComplete} from '../../../shared/components/AutoComplete';
import {Base64FileUpload} from '../../../shared/components/Base64FileUpload';
import {api} from '../../../shared/services/api';
import type {ApiItem} from '../../../shared/types/types';
import {TURMA_SOURCE, TURMA_COLUMNS, TURMA_SEARCH} from '../../../shared/services/masterDetailSources';
import {API_PATHS} from '../../../shared/services/apiPaths';

interface Contrato {
  id: number;
  pessoa: { pessoaFisica: { nome: string } };
  responsavelString: string;
  unidade: { sucinto: string };
  curriculo: { curso: { nome: string } };
  local: string | null;
  pdf: boolean;
}

interface Turma {
  id: number;
  nomeTurma: () => string;
  unidade: { sucinto: string };
  curriculo: { curso: { nome: string } };
  componenteCurricular: { descricao: string };
  sala: { numero: string };
  status: string;
}

interface Chamada {
  id: number;
  chamadaAssinadaImpressa: {
    id: number;
    sequencia: number;
    ativo: boolean;
    oferecimentoComponenteCurricular: { id: number };
  };
  local: string | null;
  pdf: boolean;
}

interface OcorrenciaPresenca {
  data: string;
  presenca: string;
  presencaDescricao: string;
  componente: string;
}

interface Matricula {
  id: number;
  contrato: { pessoa: { pessoaFisica: { nome: string } } };
}

interface DigitalizacaoChamada {
  id: number;
  local: string | null;
  pdf: boolean;
  chamadaAssinadaImpressa: {
    id: number;
    sequencia: number;
    oferecimentoComponenteCurricular: { id: number };
  };
}

interface DocumentoAluno {
  id: number;
  nomeDocumento: string;
  usuario: { login: string };
  data: string;
  local: string | null;
}

interface Pessoa {
  id: number;
  pessoaFisica: { nome: string; cpf: string };
}

interface AutoCompleteOption {
  id: number;
  label: string;
}

const formatDate = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
  if (!match) return String(value);
  return `${match[3]}/${match[2]}/${match[1]}`;
};

const CONTRATO_COLUMNS = [
  {key: 'id', label: 'ID'},
  {key: 'pessoa.pessoaFisica.nome', label: 'Aluno', render: (item: ApiItem) => {
    const r = item as Record<string, unknown>;
    const p = r.pessoa as Record<string, unknown> | undefined;
    const pf = p?.pessoaFisica as Record<string, unknown> | undefined;
    return String(pf?.nome ?? '');
  }},
  {key: 'responsavelString', label: 'Contratante'},
  {key: 'unidade.sucinto', label: 'Unidade', render: (item: ApiItem) => {
    const r = item as Record<string, unknown>;
    const u = r.unidade as Record<string, unknown> | undefined;
    return String(u?.sucinto ?? '');
  }},
  {key: 'curriculo.curso.nome', label: 'Curso', render: (item: ApiItem) => {
    const r = item as Record<string, unknown>;
    const c = r.curriculo as Record<string, unknown> | undefined;
    const cr = c?.curso as Record<string, unknown> | undefined;
    return String(cr?.nome ?? '');
  }},
];

const PRESENCA_COR: Record<string, string> = {
  p: 'Presente',
  m: 'Meia Presença',
  a: 'Ausente',
  t: 'Atestado',
  c: 'Cancelado',
  v: 'Troca de Turma',
  r: 'Prorrogado',
  n: 'Sem Registro',
  d: 'Atrasado',
  i: 'Irregular',
};

export default function ViewDigitalizacaoDocumentoDigitalizacaoDocumentoListScreen() {
  const [selectedContrato, setSelectedContrato] = useState<Contrato | null>(null);
  const [uploadArquivoOpen, setUploadArquivoOpen] = useState(false);
  const [uploadArquivoFile, setUploadArquivoFile] = useState<string>('');
  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null);
  const [diasAula, setDiasAula] = useState<OcorrenciaPresenca[]>([]);
  const [digitalizacaoChamadas, setDigitalizacaoChamadas] = useState<Chamada[]>([]);
  const [selectedChamada, setSelectedChamada] = useState<DigitalizacaoChamada | null>(null);
  const [inserirChamadaOpen, setInserirChamadaOpen] = useState(false);
  const [inserirChamadaFile, setInserirChamadaFile] = useState<string>('');
  const [confirmInsertOpen, setConfirmInsertOpen] = useState(false);
  const [selectedDocumentoAluno, setSelectedDocumentoAluno] = useState<DocumentoAluno | null>(null);
  const [visualizarDocOpen, setVisualizarDocOpen] = useState(false);
  const [selectedPessoa, setSelectedPessoa] = useState<Pessoa | null>(null);
  const [documentoAlunoNome, setDocumentoAlunoNome] = useState('');
  const [documentoAlunoFile, setDocumentoAlunoFile] = useState<string>('');
  const [documentosAluno, setDocumentosAluno] = useState<DocumentoAluno[]>([]);
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [ocorrenciaComponenteCurriculars, setOcorrenciaComponenteCurriculars] = useState<OcorrenciaPresenca[]>([]);
  const [loadingTurmas, setLoadingTurmas] = useState(false);
  const [loadingChamadas, setLoadingChamadas] = useState(false);
  const [loadingDocumentos, setLoadingDocumentos] = useState(false);
  const [activeTab, setActiveTab] = useState('digitalizacaoDeContratos');

  const carregarTurmas = useCallback(async (query: string): Promise<AutoCompleteOption[]> => {
    setLoadingTurmas(true);
    try {
      const response = await api.get<ApiItem[]>(API_PATHS.view.digitalizacaoDocumento.turmasDisponiveis, {
        params: {query},
      });
      return response.data.map((item) => {
        const record = item as Record<string, unknown>;
        return {
          id: Number(record.id),
          label: String(record.nomeTurma ?? record.nome ?? `#${record.id}`),
        };
      });
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
      return [];
    } finally {
      setLoadingTurmas(false);
    }
  }, []);

  const onTurmaSelect = useCallback(async (option: AutoCompleteOption | null) => {
    if (option) {
      const turma: Turma = {
        id: option.id,
        nomeTurma: () => option.label,
        unidade: {sucinto: ''},
        curriculo: {curso: {nome: ''}},
        componenteCurricular: {descricao: ''},
        sala: {numero: ''},
        status: '',
      };
      setSelectedTurma(turma);
      try {
        const response = await api.post<OcorrenciaPresenca[]>(
          API_PATHS.view.digitalizacaoDocumento.carregarDiasAula,
          {oferecimentoComponenteCurricularId: turma.id}
        );
        setDiasAula(response.data);
        await carregarDigitalizacaoChamadas(turma.id);
      } catch (error) {
        console.error('Erro ao carregar dias de aula:', error);
      }
    } else {
      setSelectedTurma(null);
      setDiasAula([]);
      setDigitalizacaoChamadas([]);
    }
  }, []);

  const carregarDigitalizacaoChamadas = useCallback(async (turmaId: number) => {
    setLoadingChamadas(true);
    try {
      const response = await api.get<ApiItem[]>(
        API_PATHS.view.digitalizacaoDocumento.digitalizacaoChamadas,
        {params: {turmaId}}
      );
      setDigitalizacaoChamadas(response.data.map((item) => {
        const record = item as Record<string, unknown>;
        const cai = record.chamadaAssinadaImpressa as Record<string, unknown> | undefined;
        const occ = cai?.oferecimentoComponenteCurricular as Record<string, unknown> | undefined;
        return {
          id: Number(record.id),
          chamadaAssinadaImpressa: {
            id: Number(cai?.id),
            sequencia: Number(cai?.sequencia),
            ativo: Boolean(cai?.ativo),
            oferecimentoComponenteCurricular: {id: Number(occ?.id)},
          },
          local: record.local as string | null,
          pdf: Boolean(record.pdf),
        } as Chamada;
      }));
    } catch (error) {
      console.error('Erro ao carregar digitalizações de chamada:', error);
    } finally {
      setLoadingChamadas(false);
    }
  }, []);

  const handleUploadArquivo = useCallback(async (file: string) => {
    if (!selectedContrato || !file) return;
    try {
      await api.post(
        API_PATHS.view.digitalizacaoDocumento.inserirArquivo,
        {contratoId: selectedContrato.id, arquivo: file}
      );
      setUploadArquivoOpen(false);
      setUploadArquivoFile('');
      setSelectedContrato(null);
    } catch (error) {
      console.error('Erro ao inserir arquivo:', error);
    }
  }, [selectedContrato]);

  const handleInserirChamada = useCallback(async (file: string) => {
    if (!selectedChamada || !file) return;
    try {
      await api.post(
        API_PATHS.view.digitalizacaoDocumento.inserirChamada,
        {digitalizacaoChamadaId: selectedChamada.id, arquivo: file}
      );
      setInserirChamadaFile('');
      setSelectedChamada(null);
    } catch (error) {
      console.error('Erro ao inserir chamada:', error);
    }
  }, [selectedChamada]);

  const handleSalvarChamada = useCallback(async () => {
    if (!selectedChamada) return;
    try {
      await api.post(
        API_PATHS.view.digitalizacaoDocumento.salvarChamada,
        {digitalizacaoChamadaId: selectedChamada.id}
      );
      setConfirmInsertOpen(false);
      setInserirChamadaOpen(false);
      if (selectedTurma) {
        await carregarDigitalizacaoChamadas(selectedTurma.id);
      }
    } catch (error) {
      console.error('Erro ao salvar chamada:', error);
    }
  }, [selectedChamada, selectedTurma, carregarDigitalizacaoChamadas]);

  const onAlunoSelect = useCallback(async (option: AutoCompleteOption | null) => {
    if (option) {
      const pessoa: Pessoa = {
        id: option.id,
        pessoaFisica: {nome: option.label.split(' (')[0], cpf: option.label.split('(')[1]?.replace(')', '') ?? ''},
      };
      setSelectedPessoa(pessoa);
      try {
        const response = await api.get<ApiItem[]>(
          API_PATHS.view.digitalizacaoDocumento.carregarDocumentosAluno,
          {params: {pessoaId: pessoa.id}}
        );
        setDocumentosAluno(response.data.map((item) => {
          const record = item as Record<string, unknown>;
          const u = record.usuario as Record<string, unknown> | undefined;
          return {
            id: Number(record.id),
            nomeDocumento: String(record.nomeDocumento),
            usuario: {login: String(u?.login ?? '')},
            data: String(record.data ?? ''),
            local: record.local as string | null,
          } as DocumentoAluno;
        }));
      } catch (error) {
        console.error('Erro ao carregar documentos do aluno:', error);
      }
    } else {
      setSelectedPessoa(null);
      setDocumentosAluno([]);
    }
  }, []);

  const handleSalvarDocumentoAluno = useCallback(async () => {
    if (!selectedPessoa || !documentoAlunoFile || !documentoAlunoNome.trim()) return;
    try {
      await api.post(
        API_PATHS.view.digitalizacaoDocumento.salvarDocumentoAluno,
        {pessoaId: selectedPessoa.id, nomeDocumento: documentoAlunoNome, arquivo: documentoAlunoFile}
      );
      setDocumentoAlunoNome('');
      setDocumentoAlunoFile('');
      await onAlunoSelect({id: selectedPessoa.id, label: `${selectedPessoa.pessoaFisica.nome} (${selectedPessoa.pessoaFisica.cpf})`});
    } catch (error) {
      console.error('Erro ao salvar documento do aluno:', error);
    }
  }, [selectedPessoa, documentoAlunoFile, documentoAlunoNome, onAlunoSelect]);

  const handleViewDocument = useCallback((documento: DocumentoAluno) => {
    setSelectedDocumentoAluno(documento);
    setVisualizarDocOpen(true);
  }, []);

  const UploadArquivoModal = () => {
    if (!selectedContrato || !uploadArquivoOpen) return null;
    return (
      <Modal
        title={`Contrato #${selectedContrato.id}`}
        open={uploadArquivoOpen}
        onClose={() => { setUploadArquivoOpen(false); setUploadArquivoFile(''); setSelectedContrato(null); }}
        size="lg"
      >
        <div>
          <p>O arquivo só pode ser no formato PNG com o código do contrato, caso seja mais de uma página será ('contrato'-página)</p>
          <Base64FileUpload
            value={uploadArquivoFile}
            onChange={handleUploadArquivo}
            accept=".pdf,.jpg,.jpeg,.png"
          />
          {selectedContrato.local && (
            <div style={{marginTop: '1rem', textAlign: 'center'}}>
              {selectedContrato.pdf ? (
                <object type="application/pdf" style={{width: '100%', height: '500px'}}
                  data={`/app-resources/chamada/${selectedContrato.local}`}/>
              ) : (
                <img src={`/app-resources/chamada/${selectedContrato.local}`}
                  style={{maxHeight: '500px', maxWidth: '100%'}}/>
              )}
            </div>
          )}
        </div>
      </Modal>
    );
  };

  const InserirChamadaModal = () => {
    if (!selectedChamada || !inserirChamadaOpen) return null;
    return (
      <Modal
        title="Chamada Assinada"
        open={inserirChamadaOpen}
        onClose={() => { setInserirChamadaOpen(false); setInserirChamadaFile(''); setSelectedChamada(null); }}
        size="xl"
      >
        <Tabs tabs={[
          {
            key: 'digitalizacaoDeChamada',
            label: 'Digitalização de Chamada',
            content: (
              <div>
                <p><strong>Padrão validação do arquivo para importar:</strong></p>
                <p>'Código Turma'-'Sequência Chamada Assinada'-'Código Chamada Assinada'</p>
                {!selectedChamada.local && (
                  <>
                    <Base64FileUpload
                      value={inserirChamadaFile}
                      onChange={handleInserirChamada}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    <button
                      type="button"
                      className="btn-primary btnblue"
                      style={{marginTop: '1rem'}}
                      onClick={() => setConfirmInsertOpen(true)}
                    >
                      Salvar
                    </button>
                  </>
                )}
                {selectedChamada.local && (
                  <div style={{marginTop: '1rem', textAlign: 'center'}}>
                    {selectedChamada.pdf ? (
                      <object type="application/pdf" style={{width: '100%', height: '500px'}}
                        data={`/app-resources/chamada/${selectedChamada.local}`}/>
                    ) : (
                      <img src={`/app-resources/chamada/${selectedChamada.local}`}
                        style={{maxHeight: '500px', maxWidth: '100%'}}/>
                    )}
                  </div>
                )}
              </div>
            ),
          },
          {
            key: 'turma',
            label: 'Turma',
            content: (
              <div>
                {ocorrenciaComponenteCurriculars.length > 0 && (
                  <table className="lote-table" style={{width: '100%'}}>
                    <thead>
                      <tr>
                        <th>Matrícula</th>
                        <th>Aluno</th>
                        {ocorrenciaComponenteCurriculars.map((aula) => (
                          <th key={aula.data} style={{textAlign: 'center'}}>
                            {formatDate(aula.data)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {matriculas.map((matricula) => (
                        <tr key={matricula.id}>
                          <td>{matricula.id}</td>
                          <td>{matricula.contrato.pessoa.pessoaFisica.nome}</td>
                          {ocorrenciaComponenteCurriculars.map((aula) => (
                            <td key={aula.data} style={{textAlign: 'center'}}>
                              <span className={aula.presenca}>{PRESENCA_COR[aula.presenca] ?? aula.presenca}</span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {matriculas.length === 0 && <p className="master-detail-empty">Nenhuma matrícula encontrada.</p>}
              </div>
            ),
          },
        ]} initial="digitalizacaoDeChamada"/>
      </Modal>
    );
  };

  const VisualizarDocModal = () => {
    if (!selectedDocumentoAluno || !visualizarDocOpen) return null;
    return (
      <Modal
        title={selectedDocumentoAluno.nomeDocumento}
        open={visualizarDocOpen}
        onClose={() => { setVisualizarDocOpen(false); setSelectedDocumentoAluno(null); }}
        size="lg"
      >
        <div style={{textAlign: 'center'}}>
          {selectedDocumentoAluno.local && (
            <>
              <object type="application/pdf" style={{width: '100%', height: '500px'}}
                data={`/app-resources/contratoAluno/${selectedDocumentoAluno.local}`}/>
              <img src={`/app-resources/documentoAluno/${selectedDocumentoAluno.local}`}
                style={{maxHeight: '500px', maxWidth: '100%'}}/>
            </>
          )}
        </div>
      </Modal>
    );
  };

  const ConfirmInsertModal = () => {
    if (!confirmInsertOpen) return null;
    return (
      <Modal
        title="Atenção!"
        open={confirmInsertOpen}
        onClose={() => setConfirmInsertOpen(false)}
        size="md"
        closeOnOverlayClick={false}
      >
        <p>
          Atenção, é extremamente importante que você verifique as presenças antes de inserir o arquivo,
          por medida de segurança seu usuário está sendo gravado, você confirma que conferiu as presenças
          e que elas estão corretas?
        </p>
        <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem'}}>
          <button type="button" className="btn-primary btnred" onClick={() => setConfirmInsertOpen(false)}>
            Não
          </button>
          <button type="button" className="btn-primary btnblue" onClick={handleSalvarChamada}>
            Sim
          </button>
        </div>
      </Modal>
    );
  };

  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Digitalização de Documento</h1>
        <Tabs
          tabs={[
            {
              key: 'digitalizacaoDeContratos',
              label: 'Digitalização de Contratos',
              content: (
                <DataTable
                  path={API_PATHS.view.digitalizacaoDocumento.digitalizacaoDocumento}
                  columns={CONTRATO_COLUMNS}
                  extraRowActions={[
                    {
                      key: 'digitalizar',
                      title: 'Digitalizar contrato',
                      permission: 'UPDATE',
                      icon: '📄',
                      onClick: (item) => {
                        const record = item as Record<string, unknown>;
                        const p = record.pessoa as Record<string, unknown> | undefined;
                        const pf = p?.pessoaFisica as Record<string, unknown> | undefined;
                        const u = record.unidade as Record<string, unknown> | undefined;
                        const c = record.curriculo as Record<string, unknown> | undefined;
                        const cr = c?.curso as Record<string, unknown> | undefined;
                        setSelectedContrato({
                          id: Number(record.id),
                          pessoa: {pessoaFisica: {nome: String(pf?.nome ?? '')}},
                          responsavelString: String(record.responsavelString ?? ''),
                          unidade: {sucinto: String(u?.sucinto ?? '')},
                          curriculo: {curso: {nome: String(cr?.nome ?? '')}},
                          local: record.local as string | null,
                          pdf: Boolean(record.pdf),
                        });
                        setUploadArquivoOpen(true);
                      },
                    },
                  ]}
                />
              ),
            },
            {
              key: 'chamadaAssinada',
              label: 'Chamada Assinada',
              content: (
                <div>
                  <div style={{marginBottom: '1rem'}}>
                    <AutoComplete
                      id="turma"
                      label="Turma"
                      placeholder="Digite para buscar turma..."
                      value={selectedTurma ? {id: selectedTurma.id, label: selectedTurma.nomeTurma()} : null}
                      onChange={onTurmaSelect}
                      fetchOptions={carregarTurmas}
                      minChars={2}
                    />
                  </div>
                  {selectedTurma && (
                    <div>
                      <div style={{marginBottom: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem'}}>
                        <div><strong>Turma:</strong> {selectedTurma.id}</div>
                        <div><strong>Unidade:</strong> {selectedTurma.unidade.sucinto}</div>
                        <div><strong>Curso:</strong> {selectedTurma.curriculo.curso.nome}</div>
                        <div><strong>Componente:</strong> {selectedTurma.componenteCurricular.descricao}</div>
                        <div><strong>Sala:</strong> {selectedTurma.sala.numero}</div>
                        <div><strong>Status:</strong> {selectedTurma.status}</div>
                      </div>
                      <div style={{marginBottom: '1rem'}}>
                        <Tabs tabs={[
                          {
                            key: 'digitalizacaoDeChamada',
                            label: 'Digitalização de Chamada',
                            content: (
                              <div>
                                <div style={{marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                                  {digitalizacaoChamadas.map((chamada) => (
                                    <button
                                      key={chamada.id}
                                      type="button"
                                      className={`btn-action ${!chamada.local ? 'btnred' : chamada.chamadaAssinadaImpressa.ativo ? 'btnblue' : 'btnorange'}`}
                                      style={{padding: '0.5rem 1rem'}}
                                      title={`${chamada.chamadaAssinadaImpressa.oferecimentoComponenteCurricular.id} - ${chamada.chamadaAssinadaImpressa.sequencia} - ${chamada.chamadaAssinadaImpressa.id}`}
                                      onClick={() => {
                                        setSelectedChamada({
                                          id: chamada.id,
                                          local: chamada.local,
                                          pdf: chamada.pdf,
                                          chamadaAssinadaImpressa: chamada.chamadaAssinadaImpressa,
                                        });
                                        setInserirChamadaOpen(true);
                                      }}
                                      disabled={loadingChamadas}
                                    >
                                      {loadingChamadas ? 'Carregando...' : !chamada.local ? 'Digitalizar' : 'Visualizar'}
                                    </button>
                                  ))}
                                </div>
                                {loadingChamadas && <p>Carregando...</p>}
                                {digitalizacaoChamadas.length === 0 && !loadingChamadas && <p className="master-detail-empty">Nenhuma chamada encontrada.</p>}
                              </div>
                            ),
                          },
                          {
                            key: 'turma',
                            label: 'Turma',
                            content: (
                              <div>
                                {ocorrenciaComponenteCurriculars.length > 0 && (
                                  <table className="lote-table" style={{width: '100%'}}>
                                    <thead>
                                      <tr>
                                        <th>Matrícula</th>
                                        <th>Aluno</th>
                                        {ocorrenciaComponenteCurriculars.map((aula) => (
                                          <th key={aula.data} style={{textAlign: 'center'}}>
                                            {formatDate(aula.data)}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {matriculas.map((matricula) => (
                                        <tr key={matricula.id}>
                                          <td>{matricula.id}</td>
                                          <td>{matricula.contrato.pessoa.pessoaFisica.nome}</td>
                                          {ocorrenciaComponenteCurriculars.map((aula) => (
                                            <td key={aula.data} style={{textAlign: 'center'}}>
                                              <span className={aula.presenca}>{PRESENCA_COR[aula.presenca] ?? aula.presenca}</span>
                                            </td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                )}
                                {matriculas.length === 0 && <p className="master-detail-empty">Nenhuma matrícula encontrada.</p>}
                              </div>
                            ),
                          },
                        ]} initial="digitalizacaoDeChamada"/>
                      </div>
                    </div>
                  )}
                  {!selectedTurma && <p className="master-detail-empty">Selecione uma turma para visualizar as chamadas.</p>}
                </div>
              ),
            },
            {
              key: 'arquivosAluno',
              label: 'Arquivos Aluno',
              content: (
                <div>
                  <div style={{marginBottom: '1rem'}}>
                    <AutoComplete
                      id="aluno"
                      label="Aluno"
                      placeholder="Digite para buscar aluno..."
                      value={selectedPessoa ? {id: selectedPessoa.id, label: `${selectedPessoa.pessoaFisica.nome} (${selectedPessoa.pessoaFisica.cpf})`} : null}
                      onChange={onAlunoSelect}
                      fetchOptions={async (query): Promise<AutoCompleteOption[]> => {
                        const response = await api.get<ApiItem[]>(API_PATHS.view.digitalizacaoDocumento.autoCompleteAluno, {params: {query}});
                        return response.data.map((item) => {
                          const record = item as Record<string, unknown>;
                          const pf = record.pessoaFisica as Record<string, unknown> | undefined;
                          return {id: Number(record.id), label: `${pf?.nome} (${pf?.cpf})`};
                        });
                      }}
                      minChars={2}
                    />
                  </div>
                  {selectedPessoa && (
                    <div>
                      <div style={{marginBottom: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem'}}>
                        <div><strong>ID:</strong> {selectedPessoa.id}</div>
                        <div><strong>Nome:</strong> {selectedPessoa.pessoaFisica.nome}</div>
                      </div>
                      <div style={{marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'end'}}>
                        <div style={{flex: '1', minWidth: '200px'}}>
                          <label>
                            <span>Descrição Documento *</span>
                            <input
                              type="text"
                              className="form-input"
                              value={documentoAlunoNome}
                              onChange={(e) => setDocumentoAlunoNome(e.target.value)}
                              placeholder="Descrição do documento"
                            />
                          </label>
                        </div>
                        <Base64FileUpload
                          value={documentoAlunoFile}
                          onChange={setDocumentoAlunoFile}
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <button
                          type="button"
                          className="btn-primary btnblue"
                          onClick={handleSalvarDocumentoAluno}
                          disabled={!documentoAlunoFile || !documentoAlunoNome.trim()}
                        >
                          Adicionar e salvar Documento
                        </button>
                      </div>
                      <table className="lote-table" style={{width: '100%'}}>
                        <thead>
                          <tr>
                            <th>Código</th>
                            <th>Nome</th>
                            <th>Usuário</th>
                            <th>Data</th>
                            <th>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {documentosAluno.map((doc) => (
                            <tr key={doc.id}>
                              <td>{doc.id}</td>
                              <td>{doc.nomeDocumento}</td>
                              <td>{doc.usuario.login}</td>
                              <td>{formatDate(doc.data)}</td>
                              <td>
                                <button
                                  type="button"
                                  className="btn-action btnyellow"
                                  title="Visualizar"
                                  onClick={() => handleViewDocument(doc)}
                                >
                                  👁
                                </button>
                                <button
                                  type="button"
                                  className="btn-action btnred"
                                  title="Remover"
                                  onClick={() => {
                                    if (confirm('Deseja realmente excluir este documento?')) {
                                      api.delete(`${API_PATHS.view.digitalizacaoDocumento.salvarDocumentoAluno}/${doc.id}`).then(() => onAlunoSelect({id: selectedPessoa!.id, label: `${selectedPessoa!.pessoaFisica.nome} (${selectedPessoa!.pessoaFisica.cpf})`}));
                                    }
                                  }}
                                >
                                  🗑
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {documentosAluno.length === 0 && <p className="master-detail-empty">Nenhum documento encontrado.</p>}
                    </div>
                  )}
                  {!selectedPessoa && <p className="master-detail-empty">Selecione um aluno para visualizar os documentos.</p>}
                </div>
              ),
            },
          ]}
          initial={activeTab}
        />
        <UploadArquivoModal/>
        <InserirChamadaModal/>
        <VisualizarDocModal/>
        <ConfirmInsertModal/>
      </main>
    </PermissionGate>
  );
}