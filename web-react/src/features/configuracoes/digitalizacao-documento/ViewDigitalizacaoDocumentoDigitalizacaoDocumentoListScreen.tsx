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

interface TurmaOption {
  id: number;
  sequencia: number;
  componente: string;
  unidade: string;
  curso: string;
  dataInicio: string;
  dataFim: string;
}

interface OcorrenciaItem {
  id: number;
  data: string;
  diaAulaId: number;
}

interface ChamadaItem {
  id: number;
  local: string | null;
  pdf: boolean;
  chamadaAssinadaImpressaId: number;
  sequencia: number;
  inicio: string;
  fim: string;
  ativo: boolean;
}

interface MatriculaItem {
  id: number;
  pessoaId: number;
  alunoNome: string;
}

interface CarregarDiasAulaResponse {
  ocorrencias: OcorrenciaItem[];
  chamadas: ChamadaItem[];
  matriculas: MatriculaItem[];
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

interface AlunoOptionResponse {
  id: number;
  nome: string;
  cpf: string;
  cnpj: string;
}

interface OcorrenciaGridItem {
  id: number;
  data: string;
}

interface CadernoItem {
  id: number;
  matriculaId: number;
  ocorrenciaId: number;
  presenca: string;
}

interface CarregarOcorrenciaResponse {
  ocorrencias: OcorrenciaGridItem[];
  cadernos: CadernoItem[];
}

interface DocumentoAlunoItem {
  id: number;
  nomeDocumento: string;
  data: string;
  local: string | null;
  usuarioLogin: string;
}

const formatDate = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
  if (!match) return String(value);
  return `${match[3]}/${match[2]}/${match[1]}`;
};

const CONTRATO_COLUMNS = [
  {key: 'id', label: 'ID'},
  {key: 'aluno_nome', label: 'Aluno'},
  {key: 'responsavel_string', label: 'Contratante'},
  {key: 'unidade_sucinto', label: 'Unidade'},
  {key: 'curso_nome', label: 'Curso'},
  {key: 'local', label: 'Arquivo'},
  {key: 'pdf', label: 'PDF'},
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
  const [selectedTurma, setSelectedTurma] = useState<TurmaOption | null>(null);
  const [diasAula, setDiasAula] = useState<OcorrenciaItem[]>([]);
  const [digitalizacaoChamadas, setDigitalizacaoChamadas] = useState<ChamadaItem[]>([]);
  const [selectedChamada, setSelectedChamada] = useState<ChamadaItem | null>(null);
  const [inserirChamadaOpen, setInserirChamadaOpen] = useState(false);
  const [inserirChamadaFile, setInserirChamadaFile] = useState<string>('');
  const [confirmInsertOpen, setConfirmInsertOpen] = useState(false);
  const [selectedDocumentoAluno, setSelectedDocumentoAluno] = useState<DocumentoAlunoItem | null>(null);
  const [visualizarDocOpen, setVisualizarDocOpen] = useState(false);
  const [selectedPessoa, setSelectedPessoa] = useState<Pessoa | null>(null);
  const [documentoAlunoNome, setDocumentoAlunoNome] = useState('');
  const [documentoAlunoFile, setDocumentoAlunoFile] = useState<string>('');
  const [documentosAluno, setDocumentosAluno] = useState<DocumentoAlunoItem[]>([]);
  const [matriculas, setMatriculas] = useState<MatriculaItem[]>([]);
  const [ocorrenciaComponenteCurriculars, setOcorrenciaComponenteCurriculars] = useState<OcorrenciaGridItem[]>([]);
  const [loadingTurmas, setLoadingTurmas] = useState(false);
  const [loadingChamadas, setLoadingChamadas] = useState(false);
  const [loadingDocumentos, setLoadingDocumentos] = useState(false);
  const [activeTab, setActiveTab] = useState('digitalizacaoDeContratos');

  const carregarTurmas = useCallback(async (query: string): Promise<AutoCompleteOption[]> => {
    setLoadingTurmas(true);
    try {
      const response = await api.get<TurmaOption[]>(API_PATHS.view.digitalizacaoDocumento.turmasDisponiveis, {
        params: {query},
      });
      return response.data.map((item) => ({
        id: item.id,
        label: `${item.componente} - ${item.unidade} - ${item.curso} (Seq: ${item.sequencia})`,
      }));
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
      return [];
    } finally {
      setLoadingTurmas(false);
    }
  }, []);

  const onTurmaSelect = useCallback(async (option: AutoCompleteOption | null) => {
    if (option) {
      const turma = { id: option.id, label: option.label } as TurmaOption;
      setSelectedTurma(turma);
      try {
        const response = await api.post<CarregarDiasAulaResponse>(
          API_PATHS.view.digitalizacaoDocumento.carregarDiasAula,
          {oferecimentoComponenteCurricularId: turma.id}
        );
        setDiasAula(response.data.ocorrencias);
        setMatriculas(response.data.matriculas);
        setDigitalizacaoChamadas(response.data.chamadas);
      } catch (error) {
        console.error('Erro ao carregar dias de aula:', error);
      }
    } else {
      setSelectedTurma(null);
      setDiasAula([]);
      setDigitalizacaoChamadas([]);
      setMatriculas([]);
    }
  }, []);

  const carregarDigitalizacaoChamadas = useCallback(async (turmaId: number) => {
    setLoadingChamadas(true);
    try {
      const response = await api.get<ChamadaItem[]>(
        API_PATHS.view.digitalizacaoDocumento.digitalizacaoChamadas,
        {params: {turmaId}}
      );
      setDigitalizacaoChamadas(response.data);
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
        const response = await api.get<DocumentoAlunoItem[]>(
          API_PATHS.view.digitalizacaoDocumento.carregarDocumentosAluno,
          {params: {pessoaId: pessoa.id}}
        );
        setDocumentosAluno(response.data);
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

  const handleViewDocument = useCallback((documento: DocumentoAlunoItem) => {
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
                        setSelectedContrato({
                          id: Number(record.id),
                          pessoa: {pessoaFisica: {nome: String(record.aluno_nome ?? '')}},
                          responsavelString: String(record.responsavel_string ?? ''),
                          unidade: {sucinto: String(record.unidade_sucinto ?? '')},
                          curriculo: {curso: {nome: String(record.curso_nome ?? '')}},
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
                      value={selectedTurma ? {id: selectedTurma.id, label: `${selectedTurma.componente} - ${selectedTurma.unidade} - ${selectedTurma.curso}`} : null}
                      onChange={onTurmaSelect}
                      fetchOptions={carregarTurmas}
                      minChars={2}
                    />
                  </div>
                  {selectedTurma && (
                    <div>
                      <div style={{marginBottom: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem'}}>
                        <div><strong>Turma:</strong> {selectedTurma.id}</div>
                        <div><strong>Unidade:</strong> {selectedTurma.unidade}</div>
                        <div><strong>Curso:</strong> {selectedTurma.curso}</div>
                        <div><strong>Componente:</strong> {selectedTurma.componente}</div>
                        <div><strong>Início:</strong> {formatDate(selectedTurma.dataInicio)}</div>
                        <div><strong>Fim:</strong> {formatDate(selectedTurma.dataFim)}</div>
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
                                      className={`btn-action ${!chamada.local ? 'btnred' : chamada.ativo ? 'btnblue' : 'btnorange'}`}
                                      style={{padding: '0.5rem 1rem'}}
                                      title={`${chamada.chamadaAssinadaImpressaId} - ${chamada.sequencia}`}
                                      onClick={() => {
                                        setSelectedChamada(chamada);
                                        setInserirChamadaOpen(true);
                                        // Load ocorrencia/presenca grid for this chamada
                                        api.post<CarregarOcorrenciaResponse>(
                                          API_PATHS.view.digitalizacaoDocumento.carregarOcorrencia,
                                          {digitalizacaoChamadaId: chamada.id}
                                        ).then(response => {
                                          setOcorrenciaComponenteCurriculars(response.data.ocorrencias);
                                        }).catch(console.error);
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
                                          <th key={aula.id} style={{textAlign: 'center'}}>
                                            {formatDate(aula.data)}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {matriculas.map((matricula) => (
                                        <tr key={matricula.id}>
                                          <td>{matricula.id}</td>
                                          <td>{matricula.alunoNome}</td>
                                          {ocorrenciaComponenteCurriculars.map((aula) => (
                                            <td key={aula.id} style={{textAlign: 'center'}}>
                                              <span>-</span>
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
                        const response = await api.get<AlunoOptionResponse[]>(API_PATHS.view.digitalizacaoDocumento.autoCompleteAluno, {params: {query}});
                        return response.data.map((item) => ({
                          id: item.id,
                          label: `${item.nome} (${item.cpf || item.cnpj})`,
                        }));
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
                            <th>Informações</th>
                            <th>Excluir</th>
                          </tr>
                        </thead>
                        <tbody>
                          {documentosAluno.map((doc) => (
                            <tr key={doc.id}>
                              <td>{doc.id}</td>
                              <td>{doc.nomeDocumento}</td>
                              <td>{doc.usuarioLogin}</td>
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
                               </td>
                               <td>
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