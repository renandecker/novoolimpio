import React from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

if (typeof window !== 'undefined') {
    const handleCorruption = async () => {
        console.warn('Database corruption detected (block checksum mismatch), clearing all IndexedDB databases...');
        try {
            const dbs = await indexedDB.databases?.();
            if (dbs) {
                await Promise.all(dbs.map(db => db.name ? new Promise<void>((resolve) => {
                    const req = indexedDB.deleteDatabase(db.name!);
                    req.onsuccess = req.onerror = () => resolve();
                }) : Promise.resolve()));
            }
            localStorage.clear();
            sessionStorage.clear();
        } catch (e) {
            console.error('Failed to clear storage:', e);
        }
        setTimeout(() => window.location.reload(), 100);
    };

    window.addEventListener('error', (event) => {
        const msg = event.error?.message || String(event.error || '');
        if (msg.includes('Corruption: block checksum mismatch') || msg.includes('block checksum mismatch')) {
            handleCorruption();
        }
    });

    window.addEventListener('unhandledrejection', (event) => {
        const msg = event.reason?.message || String(event.reason || '');
        if (msg.includes('Corruption: block checksum mismatch') || msg.includes('block checksum mismatch')) {
            handleCorruption();
            event.preventDefault();
        }
    });

    (async () => {
        try {
            const dbs = await indexedDB.databases?.();
            if (dbs?.length) {
                console.debug('IndexedDB databases found:', dbs.map(d => d.name).filter(Boolean).join(', '));
            }
        } catch {
        }
    })();
}

import {
    AuthProvider,
    ThemeProvider,
    AlertDialogProvider,
    LoginScreen,
    ProtectedRoute,
    PermissionBridge,
    ReportViewScreen,
    ViewAcaoFormAcaoListScreen,
    ViewAcaoListAcaoListScreen,
    ViewRegraNotificacaoListRegraListScreen,
    ViewAgendaCalendarioAgendaListScreen,
    ViewAgendaFormAgendaListScreen,
    ViewAgendaListAgendaListScreen,
    ViewAgendaCompromissosScreen,
    ViewAlterarSenhaAlterarSenhaListScreen,
    ViewApresentacaoListApresentacaoListScreen,
    ViewArquivoProconListArquivoProconListScreen,
    ViewAtividadeComplementarFormAtividadeComplementarListScreen,
    ViewAtividadeComplementarListAtividadeComplementarListScreen,
    ViewAuditoriaFormAuditoriaHistoricoListScreen,
    ViewAuditoriaListAuditoriaListScreen,
    ViewBairroFormBairroListScreen,
    ViewBairroListBairroListScreen,
    ViewBandeiraFormBandeiraListScreen,
    ViewBandeiraListBandeiraListScreen,
    ViewBaseTecnologicaFormBaseTecnologicaListScreen,
    ViewBaseTecnologicaListBaseTecnologicaListScreen,
    ViewCaixaFormCaixaListScreen,
    ViewCaixaListCaixaListScreen,
    ViewCampanhaNegociacaoFormCampanhaNegociacaoListScreen,
    ViewCampanhaNegociacaoListCampanhaNegociacaoListScreen,
    ViewCampanhaFormCampanhaListScreen,
    ViewCampanhaFormDirecionamentoListScreen,
    ViewCampanhaFormGerarPacotesListScreen,
    ViewCampanhaListCampanhaListScreen,
    ViewCampoFormCampoListScreen,
    ViewCampoListCampoListScreen,
    ViewCargaFormCargaListScreen,
    ViewCargaListCargaListScreen,
    ViewCategoriaFormCategoriaListScreen,
    ViewCategoriaListCategoriaListScreen,
    ViewCategoriaCampoFormCategoriaCampoListScreen,
    ViewCategoriaCampoListCategoriaCampoListScreen,
    ViewCategoriaEstoqueListCategoriaListScreen,
    ViewChamadaAssinadaListChamadaAssinadaListScreen,
    ViewCidadeFormCidadeListScreen,
    ViewCidadeListCidadeListScreen,
    ViewCobrancaFormLigacaoCobrancaListScreen,
    ViewCobrancaListGerirCobrancaListScreen,
    ViewCobrancaListLigacaoCobrancaListScreen,
    ViewCobrancaListLoteListScreen,
    ViewComponenteCurricularFormComponenteCurricularListScreen,
    ViewComponenteCurricularListComponenteCurricularListScreen,
    ViewCompromissoAbasMatriculaListScreen,
    ViewCompromissoFinalizarCompromissoListScreen,
    ViewCompromissoFormCompromissoListScreen,
    ViewCompromissoFormTipoCompromissoListScreen,
    ViewCompromissoListCompromissoListScreen,
    ViewCompromissoListTipoCompromissoListScreen,
    ViewComunicacaoFormComunicacaoListScreen,
    ViewComunicacaoFormComunicacaoMensagemListScreen,
ViewComunicacaoListComunicacaoListScreen,
    ViewComunicacaoListComunicacaoMensagemListScreen,
    ViewConfiguracaoFormConfiguracaoListScreen,
    ViewConfiguracaoFormConfiguracaoCaixaListScreen,
    ViewConfiguracaoFormConfiguracaoEmailListScreen,
    ViewConfiguracaoFormConfiguracaoEstoqueListScreen,
    ViewConfiguracaoFormConfiguracaoParcelaListScreen,
    ViewConfiguracaoFormLayoutListScreen,
    ViewConfiguracaoListConfiguracaoListScreen,
    ViewConfiguracaoListConfiguracaoCaixaListScreen,
    ViewConfiguracaoListConfiguracaoEmailListScreen,
    ViewConfiguracaoListConfiguracaoEstoqueListScreen,
    ViewConfiguracaoListConfiguracaoMarketingListScreen,
    ViewConfiguracaoListConfiguracaoParcelaListScreen,
    ViewConfiguracaoListLayoutListScreen,
    ViewConfiguracaoDocumentosListScreen,
    ViewConsultorConsultorListScreen,
    ViewConsultorFormConsultorListScreen,

    ViewContaControlePagamentoListScreen,
    ViewContaGestaoContaListScreen,
    ViewContaCorrenteFormContaCorrenteListScreen,
    ViewContaCorrenteListContaCorrenteListScreen,
    ViewContratoFormContratoListScreen,
    ViewContratoListContratoListScreen,
    ViewCoordenadorListCoordenadorListScreen,
    ViewCorFormCoresListScreen,
    ViewCorListCoresListScreen,
    ViewCpfalunosFormCpfalunosListScreen,
    ViewCpfalunosListCpfalunosListScreen,
    ViewCriterioListCriterioFormScreen,
    ViewCriterioListCriterioListScreen,
    ViewCurriculoFormCurriculoListScreen,
    ViewCurriculoListCurriculoListScreen,
    ViewCursoFormCursoListScreen,
    ViewCursoListCursoListScreen,
    ViewCustoServicoFormCustoServicoListScreen,
    ViewCustoServicoListCustoServicoListScreen,
    ViewDesistenteFormDesistenteListScreen,
    ViewDesistenteListDesistenteListScreen,
    ViewDiaPagamentoFormDiaPagamentoListScreen,
    ViewDiaPagamentoListDiaPagamentoListScreen,
    ViewDigitalizacaoDocumentoDigitalizacaoDocumentoListScreen,
    ViewDisponibilidadeProfessorListDisponibilidadeProfessorListScreen,
    ViewDisponibilidadeSalaListDisponibilidadeSalaListScreen,
    ViewEntregaFormEntregaListScreen,
    ViewEntregaListEntregaListScreen,
    ViewEscolaridadeFormEscolaridadeListScreen,
    ViewEscolaridadeListEscolaridadeListScreen,
    ViewEstadoFormEstadoListScreen,
    ViewEstadoListEstadoListScreen,
    ViewEstadoCivilFormEstadoCivilListScreen,
    ViewEstadoCivilListEstadoCivilListScreen,
    ViewEstoqueControleestoqueListScreen,
    ViewEstoqueEstoqueprodutoListScreen,
    ViewEstrategiaFormEstrategiaListScreen,
    ViewEstrategiaListEstrategiaListScreen,
    ViewEstruturaFormEstruturaListScreen,
    ViewEstruturaListEstruturaListScreen,
    ViewEtapasCobrancaFormEtapasCobrancaListScreen,
    ViewEtapasCobrancaListEtapasCobrancaListScreen,
    ViewEtapasNapFormEtapasNapListScreen,
    ViewEtapasNapListEtapasNapListScreen,
    ViewEtniaFormEtniaListScreen,
    ViewEtniaListEtniaListScreen,
    ViewFavoritoPerfilFormFavoritoPerfilListScreen,
    ViewFavoritoPerfilListFavoritoPerfilListScreen,
    ViewFavoritoUsuarioFormFavoritoUsuarioListScreen,
    ViewFavoritoUsuarioListFavoritoUsuarioListScreen,
    ViewFeriadoFormFeriadoListScreen,
    ViewFeriadoListFeriadoListScreen,
    ViewFiltrosFormFiltrosListScreen,
    ViewFiltrosListFiltrosListScreen,
    ViewFornecedorFormFornecedorListScreen,
    ViewFornecedorListFornecedorListScreen,
    ViewFuncaoFormFuncaoListScreen,
    ViewFuncaoListFuncaoListScreen,
    ViewGeneroListGeneroListScreen,
    ViewGestaoAlunoGestaoAlunoListScreen,
    ViewGestaoAlunoListHistoricoAlunoListScreen,
    ViewGestaoProfessorGestaoProfessorListScreen,
    ViewCriarPerguntaScreen,
    ViewGrauFormGrauListScreen,
    ViewGrauListGrauListScreen,
    ViewGrupoFormGrupoListScreen,
    ViewGrupoListGrupoListScreen,
    ViewHorarioFormHorarioListScreen,
    ViewHorarioListHorarioListScreen,
    ViewHorarioPeriodoFormHorarioPeriodoListScreen,
    ViewHorarioPeriodoListHorarioPeriodoListScreen,
    ViewImpressoraFormImpressoraListScreen,
    ViewImpressoraListImpressoraListScreen,
    ViewIndicadorFormIndicadorListScreen,
    ViewIndicadorListIndicadorListScreen,
    ViewLigacaoLigacaoListScreen,
    ViewLoginLoginListScreen,
    ViewLogradouroFormLogradouroListScreen,
    ViewLogradouroListLogradouroListScreen,
    ViewMarcaListMarcaListScreen,
    ViewMatriculaAbasMatriculaListScreen,
    ViewMatriculaFormMatriculaListScreen,
    ViewMatriculaFormRematriculaListScreen,
    ViewMatriculaWizardScreen,
    ViewMatriculaListMatriculaListScreen,
    ViewMatriculaListRematriculaListScreen,
    ViewMatriculaMatriculaListScreen,
    ViewMatriculaRematriculaListScreen,
    ViewMensagemFormMensagemListScreen,
    ViewMensagemListMensagemListScreen,
    ViewMensagemMetaListMensagemMetaListScreen,
    ViewMensagemCobrancaFormMensagemCobrancaListScreen,
    ViewMensagemCobrancaListMensagemCobrancaListScreen,
    ViewMensagemNapFormMensagemNapListScreen,
    ViewMensagemNapListMensagemNapListScreen,
    ViewMenuListMapaMenuListScreen,
    ViewMetaFormMetaListScreen,
    ViewMetaIndicadorMetaDinamicaListScreen,
    ViewMetaListMetaListScreen,
    ViewMetaListMetaDinamicaListScreen,
    ViewModuloFormModuloListScreen,
    ViewModuloListModuloListScreen,
    ViewModuloListOrdemModuloListScreen,
    ViewMotivoFormMotivoListScreen,
    ViewMotivoListMotivoListScreen,
    ViewMovimentacaoFormMovimentacaoEstoqueListScreen,
    ViewMovimentacaoListMovimentacaoEstoqueListScreen,
    ViewMovimentoFormMovimentoListScreen,
    ViewMovimentoListMovimentoListScreen,
    ViewNotificacaoListNotificacaoListScreen,
    ViewNapAbasinfoListScreen,
    ViewNapFormLigacaoNapListScreen,
    ViewNapListGerirNapListScreen,
    ViewNapListLigacaoNapListScreen,
    ViewNapListLoteListScreen,
    ViewOferecimentoComponenteCurricularDisponibilidadeOferecimentoListScreen,
    ViewOferecimentoComponenteCurricularFormOferecimentoComponenteCurricularListScreen,
    ViewOferecimentoComponenteCurricularFormOferecimentoCursoListScreen,
    ViewOferecimentoComponenteCurricularListOferecimentoComponenteCurricularListScreen,
    ViewOferecimentoComponenteCurricularListOferecimentoCursoListScreen,
    ViewOperacionalFormOperacionalListScreen,
    ViewOperacionalListOperacionalListScreen,
    ViewPacoteListPacoteListScreen,
    ViewPacoteFormPacoteListScreen,
    ViewPagamentoAberturacaixaListScreen,
    ViewPagamentoCaixaentradaListScreen,
    ViewPagamentoCaixasaidaListScreen,
    ViewPagamentoCodigoVerificadorListScreen,
    ViewPagamentoFechamentoCaixaWizardScreen,
    ViewPagamentoMovimentocaixaListScreen,
    ViewPagamentoProdutoListScreen,
    ViewPaisFormPaisListScreen,
    ViewPaisListPaisListScreen,
    ViewPerfilFormPerfilListScreen,
    ViewPerfilListPerfilListScreen,
    ViewPeriodoFormPeriodoListScreen,
    ViewPeriodoListPeriodoListScreen,
    ViewPessoaFormPessoaFisicaListScreen,
    ViewPessoaFormPessoaJuridicaListScreen,
    ViewPessoaFormPessoaPessoaFisicaListScreen,
    ViewPessoaFormPessoaPessoaJuridicaListScreen,
    ViewPessoaFormPessoaPessoaUsuarioListScreen,
    ViewPessoaListDisponibilidadePessoaListScreen,

    ViewPessoaListPessoaFisicaListScreen,
    ViewPessoaListPessoaJuridicaListScreen,
    ViewPessoaPessoaDocumentoListScreen,

    ViewProdutoFormProdutoListScreen,
    ViewProdutoListConfiguracaoProdutoListScreen,
    ViewProdutoListProdutoListScreen,

    ViewProfessorFormProfessorListScreen,
    ViewProfessorListProfessorListScreen,
    ViewProspectoCadastroProspectoListScreen,
    ViewProspectoControleProspectoListScreen,
    ViewProspectoEditProspectoListScreen,
    ViewProspectoListProspectoListScreen,
    ViewProspectoProspectoRadarListScreen,

    ViewReferenciaBibliograficaFormReferenciaBibliograficaListScreen,
    ViewReferenciaBibliograficaListReferenciaBibliograficaListScreen,
    ViewRegiaoFormRegiaoListScreen,
    ViewRegiaoListRegiaoListScreen,

    ViewRelatoriosDocumentosListScreen,
    ViewRelatoriosExtratorListScreen,
    ViewRelatoriosFormDashboardListScreen,
    ViewRelatoriosFormGraficoListScreen,
    ViewRelatoriosFormMapaListScreen,
    ViewRelatoriosFormOrganogramaListScreen,
    ViewRelatoriosFormTabelaListScreen,
    ViewRelatoriosListDashboardListScreen,
    ListGraficoScreen,
    ListMapaScreen,
    ListTabelaScreen,
    ViewRelatoriosListOrganogramaListScreen,
    ViewRelatoriosViewDashboardListScreen,
    ViewRelatoriosViewGraficoBarrasHorizontalListScreen,
    ViewRelatoriosViewGraficoBarrasVerticalListScreen,
    ViewRelatoriosViewGraficoCircularListScreen,
    ViewRelatoriosViewGraficoCombinadoListScreen,
    ViewRelatoriosViewGraficoLinhasListScreen,
    ViewRelatoriosViewGraficoPizzaListScreen,
    ViewRelatoriosViewMapaListScreen,
    ViewRelatoriosViewOrganogramaListScreen,
    ViewRelatoriosViewTabelaListScreen,

    ViewResultadoFormResultadoListScreen,
    ViewResultadoListResultadoListScreen,

    ViewResultadoCobrancaFormResultadoCobrancaListScreen,
    ViewResultadoCobrancaListResultadoCobrancaListScreen,
    ViewResultadoContatoFormResultadoContatoListScreen,
    ViewResultadoContatoListResultadoContatoListScreen,
    ViewResultadoLigacaoNapFormResultadoLigacaoNapListScreen,
    ViewResultadoLigacaoNapListResultadoLigacaoNapListScreen,
    ViewSalaFormSalaListScreen,
    ViewSalaListSalaListScreen,

    ViewStatusCompromissoFormStatusCompromissoListScreen,
    ViewStatusCompromissoListStatusCompromissoListScreen,
    ViewSubcategoriaEstoqueListSubCategoriaListScreen,
    ViewSubCategoriaFormSubCategoriaListScreen,
    ViewSubCategoriaListSubCategoriaListScreen,

    ViewTelefoneFormTelefoneListScreen,
    ViewTelefoneListTelefoneListScreen,
    ViewTempoAulaListTempoAulaListScreen,
    ViewTipoAcaoFormTipoAcaoListScreen,
    ViewTipoAcaoListTipoAcaoListScreen,
    ViewTipoAgendaListTipoAgendaListScreen,
    ViewTipoAtividadeFormTipoAtividadeListScreen,
    ViewTipoAtividadeListTipoAtividadeListScreen,
    ViewTipoCanalFormTipoCanalListScreen,
    ViewTipoCanalListTipoCanalListScreen,
    ViewTipoContratoFormTipoContratoListScreen,
    ViewTipoContratoListTipoContratoListScreen,

    ViewTipoCursoFormTipoCursoListScreen,
    ViewTipoCursoListTipoCursoListScreen,
    ViewTipoHistoricoFormTipoHistoricoListScreen,
    ViewTipoHistoricoListTipoHistoricoListScreen,
    ViewTipoPausaFormTipoPausaListScreen,
    ViewTipoPausaListTipoPausaListScreen,
    ViewTipoSalaFormTipoSalaListScreen,
    ViewTipoSalaListTipoSalaListScreen,
    ViewTipoTelefoneFormTipoTelefoneListScreen,
    ViewTipoTelefoneListTipoTelefoneListScreen,
    ViewTipoUnidadeFormTipoUnidadeListScreen,
    ViewTipoUnidadeListTipoUnidadeListScreen,

    ViewTurmaListTurmaListScreen,
    ViewTurmaListTurmaFinalizandoListScreen,
    ViewTurnoFormTurnoListScreen,
    ViewTurnoListTurnoListScreen,

    ViewTurnoEducacaoFormTurnoEducacaoListScreen,
    ViewTurnoEducacaoListTurnoEducacaoListScreen,
    ViewTurnoFuncionarioFormTurnoFuncionarioListScreen,
    ViewTurnoFuncionarioListTurnoFuncionarioListScreen,

    ViewTurnoTrabalhoFormTurnoTrabalhoListScreen,
    ViewTurnoTrabalhoListTurnoTrabalhoListScreen,
    ViewTurnoUsuarioListTurnoUsuarioListScreen,

    ViewUnidadeFormRedeListScreen,
    ViewUnidadeFormUnidadeListScreen,
    ViewUnidadeListRedeListScreen,
    ViewUnidadeListUnidadeListScreen,
    ViewUsuarioCamposUsuarioTabViewListScreen,

    ViewUsuarioFormUsuarioListScreen,
    ViewUsuarioFormUsuarioRapidoListScreen,
    ViewUsuarioListUsuarioListScreen,
    CadastroUsuarioScreen,

    ViewValorCursoFormValorCursoListScreen,
    ViewValorCursoListValorCursoListScreen,
    ViewValorProdutoFormValorProdutoListScreen,
    ViewValorProdutoListValorProdutoListScreen,
    ViewTemaListTemasListScreen,
    CurriculumAttachmentModal,
    AlunoDashboardScreen,
    AlunoBoletimScreen,
    AlunoFrequenciaScreen,
    AlunoFinanceiroScreen,
    AlunoAulasScreen,
    AlunoAulasTurmaScreen,
    AlunoAvaliacoesScreen,
    AlunoAvaliacaoResponderScreen,
    AulaAlunoScreen,
    MeusDadosScreen,
    IconesListScreen,
    AsaasCobrancasListScreen,
    AsaasClientesListScreen,
    AsaasParcelasListScreen,
    CurriculoVagaListScreen,
    CurriculoEmpresaListScreen,
    CurriculoEmpresaUnidadeListScreen,
    CurriculoEntrevistaListScreen,
    CurriculoTrabalhoListScreen,
    CurriculoCampoListScreen,
    CurriculoConfiguracaoListScreen,
    AuditoriaScreen,
    ViewConfiguracaoFinanceiraListConfiguracaoFinanceiraListScreen,
    ViewConfiguracaoFinanceiraFormConfiguracaoFinanceiraListScreen,
} from './screens';

import './shared/styles/colors.css';

const q = new QueryClient();
createRoot(document.getElementById('root')!).render(<QueryClientProvider
    client={q}><AuthProvider><ThemeProvider><AlertDialogProvider><PermissionBridge><BrowserRouter><Routes><Route path="/login"
                                                                             element={<LoginScreen/>}/><Route
    element={<ProtectedRoute/>}><Route path="/auditoria" element={<AuditoriaScreen/>}/><Route path="/view/tema/listTemas"
                                                                                         element={
                                                                                             <ViewTemaListTemasListScreen/>}/>
    <Route path="/aluno/portalAluno" element={<AlunoDashboardScreen/>}/>
    <Route path="/aluno/boletim" element={<AlunoBoletimScreen/>}/>
    <Route path="/aluno/frequencia" element={<AlunoFrequenciaScreen/>}/>
    <Route path="/aluno/financeiro" element={<AlunoFinanceiroScreen/>}/>
<Route path="/aluno/aulas" element={<AlunoAulasScreen/>}/>
    <Route path="/aluno/aulas/turma/:oferecimentoId" element={<AlunoAulasTurmaScreen/>}/>
    <Route path="/aluno/aulas/aula/:aulaId" element={<AulaAlunoScreen/>}/>
    <Route path="/aluno/avaliacoes" element={<AlunoAvaliacoesScreen/>}/>
    <Route path="/aluno/avaliacao/:id" element={<AlunoAvaliacaoResponderScreen/>}/>
    <Route path="/aluno/curriculo-anexo" element={<AlunoDashboardScreen/>}/>
    <Route path="/meus-dados" element={<MeusDadosScreen/>}/>
    <Route path="/view/acao/formAcao" element={<ViewAcaoFormAcaoListScreen/>}/>
    <Route path="/view/acao/listAcao" element={<ViewAcaoListAcaoListScreen/>}/>
    <Route path="/regras/notificacao/list" element={<ViewRegraNotificacaoListRegraListScreen/>}/>
    <Route path="/view/agenda/calendarioAgenda" element={<ViewAgendaCompromissosScreen/>}/>
    <Route path="/view/agenda/formAgenda" element={<ViewAgendaFormAgendaListScreen/>}/>
    <Route path="/view/agenda/listAgenda" element={<ViewAgendaListAgendaListScreen/>}/>
    <Route path="/view/agenda/compromissos" element={<ViewAgendaCompromissosScreen/>}/>
    <Route path="/view/alterarSenha/alterarSenha" element={<ViewAlterarSenhaAlterarSenhaListScreen/>}/>
    <Route path="/view/apresentacao/listApresentacao" element={<ViewApresentacaoListApresentacaoListScreen/>}/>
    <Route path="/view/arquivoProcon/listArquivoProcon" element={<ViewArquivoProconListArquivoProconListScreen/>}/>
    <Route path="/view/atividadeComplementar/formAtividadeComplementar"
           element={<ViewAtividadeComplementarFormAtividadeComplementarListScreen/>}/>
    <Route path="/view/atividadeComplementar/listAtividadeComplementar"
           element={<ViewAtividadeComplementarListAtividadeComplementarListScreen/>}/>
    <Route path="/view/auditoria/formAuditoriaHistorico" element={<ViewAuditoriaFormAuditoriaHistoricoListScreen/>}/>
    <Route path="/view/auditoria/listAuditoria" element={<ViewAuditoriaListAuditoriaListScreen/>}/>
    
    <Route path="/view/bairro/formBairro" element={<ViewBairroFormBairroListScreen/>}/>
    <Route path="/view/bairro/listBairro" element={<ViewBairroListBairroListScreen/>}/>
    <Route path="/view/bandeira/formBandeira" element={<ViewBandeiraFormBandeiraListScreen/>}/>
    <Route path="/view/bandeira/listBandeira" element={<ViewBandeiraListBandeiraListScreen/>}/>
    <Route path="/view/baseTecnologica/formBaseTecnologica"
           element={<ViewBaseTecnologicaFormBaseTecnologicaListScreen/>}/>
    <Route path="/view/baseTecnologica/listBaseTecnologica"
           element={<ViewBaseTecnologicaListBaseTecnologicaListScreen/>}/>
    <Route path="/view/caixa/formCaixa" element={<ViewCaixaFormCaixaListScreen/>}/>
    <Route path="/view/caixa/listCaixa" element={<ViewCaixaListCaixaListScreen/>}/>
    <Route path="/view/campanha/formCampanha" element={<ViewCampanhaFormCampanhaListScreen/>}/>
    <Route path="/view/campanha/formDirecionamento" element={<ViewCampanhaFormDirecionamentoListScreen/>}/>
    <Route path="/view/campanha/formGerarPacotes" element={<ViewCampanhaFormGerarPacotesListScreen/>}/>
    <Route path="/view/campanha/listCampanha" element={<ViewCampanhaListCampanhaListScreen/>}/>
    <Route path="/view/campanhaNegociacao/formCampanhaNegociacao"
           element={<ViewCampanhaNegociacaoFormCampanhaNegociacaoListScreen/>}/>
    <Route path="/view/campanhaNegociacao/listCampanhaNegociacao"
           element={<ViewCampanhaNegociacaoListCampanhaNegociacaoListScreen/>}/>
    <Route path="/view/campo/formCampo" element={<ViewCampoFormCampoListScreen/>}/>
    <Route path="/view/campo/listCampo" element={<ViewCampoListCampoListScreen/>}/>
    <Route path="/view/carga/formCarga" element={<ViewCargaFormCargaListScreen/>}/>
    <Route path="/view/carga/listCarga" element={<ViewCargaListCargaListScreen/>}/>
    <Route path="/view/categoria/formCategoria" element={<ViewCategoriaFormCategoriaListScreen/>}/>
    <Route path="/view/categoria/listCategoria" element={<ViewCategoriaListCategoriaListScreen/>}/>
    <Route path="/view/categoriaEstoque/listCategoria" element={<ViewCategoriaEstoqueListCategoriaListScreen/>}/>
    <Route path="/view/categoriaCampo/formCategoriaCampo" element={<ViewCategoriaCampoFormCategoriaCampoListScreen/>}/>
    <Route path="/view/categoriaCampo/listCategoriaCampo" element={<ViewCategoriaCampoListCategoriaCampoListScreen/>}/>
    <Route path="/view/chamadaAssinada/listChamadaAssinada"
           element={<ViewChamadaAssinadaListChamadaAssinadaListScreen/>}/>
    <Route path="/view/cidade/formCidade" element={<ViewCidadeFormCidadeListScreen/>}/>
    <Route path="/view/cidade/listCidade" element={<ViewCidadeListCidadeListScreen/>}/>
    <Route path="/view/cobranca/formLigacaoCobranca" element={<ViewCobrancaFormLigacaoCobrancaListScreen/>}/>
    <Route path="/view/cobranca/listGerirCobranca" element={<ViewCobrancaListGerirCobrancaListScreen/>}/>
    <Route path="/view/cobranca/listLigacaoCobranca" element={<ViewCobrancaListLigacaoCobrancaListScreen/>}/>
    <Route path="/view/cobranca/listLote" element={<ViewCobrancaListLoteListScreen/>}/>
    <Route path="/view/componenteCurricular/formComponenteCurricular"
           element={<ViewComponenteCurricularFormComponenteCurricularListScreen/>}/>
    <Route path="/view/componenteCurricular/listComponenteCurricular"
           element={<ViewComponenteCurricularListComponenteCurricularListScreen/>}/>
    <Route path="/view/compromisso/abasMatricula" element={<ViewCompromissoAbasMatriculaListScreen/>}/>
    <Route path="/view/compromisso/finalizarCompromisso" element={<ViewCompromissoFinalizarCompromissoListScreen/>}/>
    <Route path="/view/compromisso/formCompromisso" element={<ViewCompromissoFormCompromissoListScreen/>}/>
    <Route path="/view/compromisso/formTipoCompromisso" element={<ViewCompromissoFormTipoCompromissoListScreen/>}/>
    <Route path="/view/compromisso/listCompromisso" element={<ViewCompromissoListCompromissoListScreen/>}/>
    <Route path="/view/compromisso/listTipoCompromisso" element={<ViewCompromissoListTipoCompromissoListScreen/>}/>
    <Route path="/view/comunicacao/formComunicacao" element={<ViewComunicacaoFormComunicacaoListScreen/>}/>
    <Route path="/view/comunicacao/formComunicacaoMensagem"
           element={<ViewComunicacaoFormComunicacaoMensagemListScreen/>}/>
    <Route path="/view/comunicacao/listComunicacao" element={<ViewComunicacaoListComunicacaoListScreen/>}/>
    <Route path="/view/comunicacao/listComunicacaoMensagem"
           element={<ViewComunicacaoListComunicacaoMensagemListScreen/>}/>
    <Route path="/view/configuracao/formConfiguracao" element={<ViewConfiguracaoFormConfiguracaoListScreen/>}/>
    <Route path="/view/configuracao/formConfiguracaoCaixa"
           element={<ViewConfiguracaoFormConfiguracaoCaixaListScreen/>}/>
    <Route path="/view/configuracao/formConfiguracaoEmail"
           element={<ViewConfiguracaoFormConfiguracaoEmailListScreen/>}/>
    <Route path="/view/configuracao/formConfiguracaoEstoque"
           element={<ViewConfiguracaoFormConfiguracaoEstoqueListScreen/>}/>
    <Route path="/view/configuracao/formConfiguracaoParcela"
           element={<ViewConfiguracaoFormConfiguracaoParcelaListScreen/>}/>
    <Route path="/view/configuracao/formLayout" element={<ViewConfiguracaoFormLayoutListScreen/>}/>
    <Route path="/view/configuracao/listConfiguracao" element={<ViewConfiguracaoListConfiguracaoListScreen/>}/>
    <Route path="/view/configuracao/listConfiguracaoCaixa"
           element={<ViewConfiguracaoListConfiguracaoCaixaListScreen/>}/>
    <Route path="/view/configuracao/listConfiguracaoEmail"
           element={<ViewConfiguracaoListConfiguracaoEmailListScreen/>}/>
    <Route path="/view/configuracao/listConfiguracaoEstoque"
           element={<ViewConfiguracaoListConfiguracaoEstoqueListScreen/>}/>
    <Route path="/view/configuracao/listConfiguracaoMarketing"
           element={<ViewConfiguracaoListConfiguracaoMarketingListScreen/>}/>
    <Route path="/view/configuracao/listConfiguracaoParcela"
           element={<ViewConfiguracaoListConfiguracaoParcelaListScreen/>}/>
    <Route path="/view/configuracao/listLayout" element={<ViewConfiguracaoListLayoutListScreen/>}/>
    <Route path="/view/configuracao/listDocumentos" element={<ViewConfiguracaoDocumentosListScreen/>}/>
    <Route path="/view/consultor/consultor" element={<ViewConsultorConsultorListScreen/>}/>
    <Route path="/view/consultor/formConsultor" element={<ViewConsultorFormConsultorListScreen/>}/>

    <Route path="/view/conta/controlePagamento" element={<ViewContaControlePagamentoListScreen/>}/>
    <Route path="/view/conta/gestaoConta" element={<ViewContaGestaoContaListScreen/>}/>
    <Route path="/view/contaCorrente/formContaCorrente" element={<ViewContaCorrenteFormContaCorrenteListScreen/>}/>
    <Route path="/view/contaCorrente/listContaCorrente" element={<ViewContaCorrenteListContaCorrenteListScreen/>}/>
    <Route path="/view/contrato/formContrato" element={<ViewContratoFormContratoListScreen/>}/>
    <Route path="/view/contrato/listContrato" element={<ViewContratoListContratoListScreen/>}/>
    <Route path="/view/coordenador/listCoordenador" element={<ViewCoordenadorListCoordenadorListScreen/>}/>
    <Route path="/view/cor/formCores" element={<ViewCorFormCoresListScreen/>}/>
    <Route path="/view/cor/listCores" element={<ViewCorListCoresListScreen/>}/>
    <Route path="/view/cpfalunos/formCpfalunos" element={<ViewCpfalunosFormCpfalunosListScreen/>}/>
    <Route path="/view/cpfalunos/listCpfalunos" element={<ViewCpfalunosListCpfalunosListScreen/>}/>
    <Route path="/view/criterio/listCriterio" element={<ViewCriterioListCriterioListScreen/>}/>
    <Route path="/view/criterio/formCriterio" element={<ViewCriterioListCriterioFormScreen/>}/>
    <Route path="/view/curriculo/formCurriculo" element={<ViewCurriculoFormCurriculoListScreen/>}/>
    <Route path="/view/curriculo/listCurriculo" element={<ViewCurriculoListCurriculoListScreen/>}/>
    <Route path="/view/curso/formCurso" element={<ViewCursoFormCursoListScreen/>}/>
    <Route path="/view/curso/listCurso" element={<ViewCursoListCursoListScreen/>}/>
    <Route path="/view/custoServico/formCustoServico" element={<ViewCustoServicoFormCustoServicoListScreen/>}/>
    <Route path="/view/custoServico/listCustoServico" element={<ViewCustoServicoListCustoServicoListScreen/>}/>
    <Route path="/view/desistente/formDesistente" element={<ViewDesistenteFormDesistenteListScreen/>}/>
    <Route path="/view/desistente/listDesistente" element={<ViewDesistenteListDesistenteListScreen/>}/>
    <Route path="/view/diaPagamento/formDiaPagamento" element={<ViewDiaPagamentoFormDiaPagamentoListScreen/>}/>
    <Route path="/view/diaPagamento/listDiaPagamento" element={<ViewDiaPagamentoListDiaPagamentoListScreen/>}/>
    <Route path="/view/digitalizacaoDocumento/digitalizacaoDocumento"
           element={<ViewDigitalizacaoDocumentoDigitalizacaoDocumentoListScreen/>}/>
    <Route path="/view/disponibilidadeProfessor/listDisponibilidadeProfessor"
           element={<ViewDisponibilidadeProfessorListDisponibilidadeProfessorListScreen/>}/>
    <Route path="/view/disponibilidadeSala/listDisponibilidadeSala"
           element={<ViewDisponibilidadeSalaListDisponibilidadeSalaListScreen/>}/>
    <Route path="/view/entrega/formEntrega" element={<ViewEntregaFormEntregaListScreen/>}/>
    <Route path="/view/entrega/listEntrega" element={<ViewEntregaListEntregaListScreen/>}/>
    <Route path="/view/escolaridade/formEscolaridade" element={<ViewEscolaridadeFormEscolaridadeListScreen/>}/>
    <Route path="/view/escolaridade/listEscolaridade" element={<ViewEscolaridadeListEscolaridadeListScreen/>}/>
    <Route path="/view/estado/formEstado" element={<ViewEstadoFormEstadoListScreen/>}/>
    <Route path="/view/estado/listEstado" element={<ViewEstadoListEstadoListScreen/>}/>
    <Route path="/view/estadoCivil/formEstadoCivil" element={<ViewEstadoCivilFormEstadoCivilListScreen/>}/>
    <Route path="/view/estadoCivil/listEstadoCivil" element={<ViewEstadoCivilListEstadoCivilListScreen/>}/>
    <Route path="/view/estoque/controleestoque" element={<ViewEstoqueControleestoqueListScreen/>}/>
    <Route path="/view/estoque/estoqueproduto" element={<ViewEstoqueEstoqueprodutoListScreen/>}/>
    <Route path="/view/estrategia/formEstrategia" element={<ViewEstrategiaFormEstrategiaListScreen/>}/>
    <Route path="/view/estrategia/listEstrategia" element={<ViewEstrategiaListEstrategiaListScreen/>}/>
    <Route path="/view/estrutura/formEstrutura" element={<ViewEstruturaFormEstruturaListScreen/>}/>
    <Route path="/view/estrutura/listEstrutura" element={<ViewEstruturaListEstruturaListScreen/>}/>
    <Route path="/view/etapasCobranca/formEtapasCobranca" element={<ViewEtapasCobrancaFormEtapasCobrancaListScreen/>}/>
    <Route path="/view/etapasCobranca/listEtapasCobranca" element={<ViewEtapasCobrancaListEtapasCobrancaListScreen/>}/>
    <Route path="/view/etapasNap/formEtapasNap" element={<ViewEtapasNapFormEtapasNapListScreen/>}/>
    <Route path="/view/etapasNap/listEtapasNap" element={<ViewEtapasNapListEtapasNapListScreen/>}/>
    <Route path="/view/etnia/formEtnia" element={<ViewEtniaFormEtniaListScreen/>}/>
    <Route path="/view/etnia/listEtnia" element={<ViewEtniaListEtniaListScreen/>}/>
    <Route path="/view/favoritoPerfil/formFavoritoPerfil" element={<ViewFavoritoPerfilFormFavoritoPerfilListScreen/>}/>
    <Route path="/view/favoritoPerfil/listFavoritoPerfil" element={<ViewFavoritoPerfilListFavoritoPerfilListScreen/>}/>
    <Route path="/view/favoritoUsuario/formFavoritoUsuario"
           element={<ViewFavoritoUsuarioFormFavoritoUsuarioListScreen/>}/>
    <Route path="/view/favoritoUsuario/listFavoritoUsuario"
           element={<ViewFavoritoUsuarioListFavoritoUsuarioListScreen/>}/>
    <Route path="/view/feriado/formFeriado" element={<ViewFeriadoFormFeriadoListScreen/>}/>
    <Route path="/view/feriado/listFeriado" element={<ViewFeriadoListFeriadoListScreen/>}/>
    <Route path="/view/filtros/formFiltros" element={<ViewFiltrosFormFiltrosListScreen/>}/>
    <Route path="/view/filtros/listFiltros" element={<ViewFiltrosListFiltrosListScreen/>}/>
    <Route path="/view/fornecedor/formFornecedor" element={<ViewFornecedorFormFornecedorListScreen/>}/>
    <Route path="/view/fornecedor/listFornecedor" element={<ViewFornecedorListFornecedorListScreen/>}/>
    <Route path="/view/funcao/formFuncao" element={<ViewFuncaoFormFuncaoListScreen/>}/>
    <Route path="/view/funcao/listFuncao" element={<ViewFuncaoListFuncaoListScreen/>}/>
    <Route path="/view/gestaoAluno/gestaoAluno" element={<ViewGestaoAlunoGestaoAlunoListScreen/>}/>
    <Route path="/view/gestaoAluno/listHistoricoAluno" element={<ViewGestaoAlunoListHistoricoAlunoListScreen/>}/>
    <Route path="/view/gestaoProfessor/gestaoProfessor" element={<ViewGestaoProfessorGestaoProfessorListScreen/>}/>
    <Route path="/view/avaliacao/criar" element={<ViewCriarPerguntaScreen/>}/>
    <Route path="/view/genero/listGenero" element={<ViewGeneroListGeneroListScreen/>}/>
    <Route path="/view/grau/formGrau" element={<ViewGrauFormGrauListScreen/>}/>
    <Route path="/view/grau/listGrau" element={<ViewGrauListGrauListScreen/>}/>
    <Route path="/view/grupo/formGrupo" element={<ViewGrupoFormGrupoListScreen/>}/>
    <Route path="/view/grupo/listGrupo" element={<ViewGrupoListGrupoListScreen/>}/>
    <Route path="/view/horario/formHorario" element={<ViewHorarioFormHorarioListScreen/>}/>
    <Route path="/view/horario/listHorario" element={<ViewHorarioListHorarioListScreen/>}/>
    <Route path="/view/horarioPeriodo/formHorarioPeriodo" element={<ViewHorarioPeriodoFormHorarioPeriodoListScreen/>}/>
    <Route path="/view/horarioPeriodo/listHorarioPeriodo" element={<ViewHorarioPeriodoListHorarioPeriodoListScreen/>}/>
    <Route path="/view/impressora/formImpressora" element={<ViewImpressoraFormImpressoraListScreen/>}/>
    <Route path="/view/impressora/listImpressora" element={<ViewImpressoraListImpressoraListScreen/>}/>
    <Route path="/view/indicador/formIndicador" element={<ViewIndicadorFormIndicadorListScreen/>}/>
    <Route path="/view/indicador/listIndicador" element={<ViewIndicadorListIndicadorListScreen/>}/>
    <Route path="/view/ligacao/ligacao" element={<ViewLigacaoLigacaoListScreen/>}/>
    <Route path="/view/login/login" element={<ViewLoginLoginListScreen/>}/>
    <Route path="/view/logradouro/formLogradouro" element={<ViewLogradouroFormLogradouroListScreen/>}/>
    <Route path="/view/logradouro/listLogradouro" element={<ViewLogradouroListLogradouroListScreen/>}/>
    <Route path="/view/marca/listMarca" element={<ViewMarcaListMarcaListScreen/>}/>
    <Route path="/view/matricula/abasMatricula" element={<ViewMatriculaAbasMatriculaListScreen/>}/>
    <Route path="/view/matricula/formMatricula" element={<ViewMatriculaFormMatriculaListScreen/>}/>
    <Route path="/view/matricula/formRematricula" element={<ViewMatriculaFormRematriculaListScreen/>}/>
    <Route path="/view/matricula/wizard" element={<ViewMatriculaWizardScreen/>}/>
    <Route path="/view/matricula/wizard/:id" element={<ViewMatriculaWizardScreen/>}/>
    <Route path="/view/matricula/listMatricula" element={<ViewMatriculaListMatriculaListScreen/>}/>
    <Route path="/view/matricula/listRematricula" element={<ViewMatriculaListRematriculaListScreen/>}/>
    <Route path="/view/matricula/matricula" element={<ViewMatriculaMatriculaListScreen/>}/>
    <Route path="/view/matricula/rematricula" element={<ViewMatriculaRematriculaListScreen/>}/>
    <Route path="/view/mensagem/formMensagem" element={<ViewMensagemFormMensagemListScreen/>}/>
    <Route path="/view/mensagem/listMensagem" element={<ViewMensagemListMensagemListScreen/>}/>
    <Route path="/view/mensagemCobranca/formMensagemCobranca"
           element={<ViewMensagemCobrancaFormMensagemCobrancaListScreen/>}/>
    <Route path="/view/mensagemCobranca/listMensagemCobranca"
           element={<ViewMensagemCobrancaListMensagemCobrancaListScreen/>}/>
    <Route path="/view/mensagemMeta/listMensagemMeta" element={<ViewMensagemMetaListMensagemMetaListScreen/>}/>
    <Route path="/view/mensagemNap/formMensagemNap" element={<ViewMensagemNapFormMensagemNapListScreen/>}/>
    <Route path="/view/mensagemNap/listMensagemNap" element={<ViewMensagemNapListMensagemNapListScreen/>}/>
    <Route path="/view/menu/listMapaMenu" element={<ViewMenuListMapaMenuListScreen/>}/>
    <Route path="/view/icones/listIcones" element={<IconesListScreen/>}/>
    <Route path="/view/meta/formMeta" element={<ViewMetaFormMetaListScreen/>}/>
    <Route path="/view/meta/indicadorMetaDinamica" element={<ViewMetaIndicadorMetaDinamicaListScreen/>}/>
    <Route path="/view/meta/listMeta" element={<ViewMetaListMetaListScreen/>}/>
    <Route path="/view/meta/listMetaDinamica" element={<ViewMetaListMetaDinamicaListScreen/>}/>
    <Route path="/view/modulo/formModulo" element={<ViewModuloFormModuloListScreen/>}/>
    <Route path="/view/modulo/listModulo" element={<ViewModuloListModuloListScreen/>}/>
    <Route path="/view/modulo/listOrdemModulo" element={<ViewModuloListOrdemModuloListScreen/>}/>
    <Route path="/view/motivo/formMotivo" element={<ViewMotivoFormMotivoListScreen/>}/>
    <Route path="/view/motivo/listMotivo" element={<ViewMotivoListMotivoListScreen/>}/>
    <Route path="/view/movimentacao/formMovimentacaoEstoque"
           element={<ViewMovimentacaoFormMovimentacaoEstoqueListScreen/>}/>
    <Route path="/view/movimentacao/listMovimentacaoEstoque"
           element={<ViewMovimentacaoListMovimentacaoEstoqueListScreen/>}/>
    <Route path="/view/movimento/formMovimento" element={<ViewMovimentoFormMovimentoListScreen/>}/>
    <Route path="/view/movimento/listMovimento" element={<ViewMovimentoListMovimentoListScreen/>}/>
    <Route path="/view/notificacao/listNotificacao" element={<ViewNotificacaoListNotificacaoListScreen/>}/>
    <Route path="/view/nap/abasinfo" element={<ViewNapAbasinfoListScreen/>}/>
    <Route path="/view/nap/formLigacaoNap" element={<ViewNapFormLigacaoNapListScreen/>}/>
    <Route path="/view/nap/listGerirNap" element={<ViewNapListGerirNapListScreen/>}/>
    <Route path="/view/nap/listLigacaoNap" element={<ViewNapListLigacaoNapListScreen/>}/>
    <Route path="/view/nap/listLote" element={<ViewNapListLoteListScreen/>}/>
    <Route path="/view/oferecimentoComponenteCurricular/disponibilidadeOferecimento"
           element={<ViewOferecimentoComponenteCurricularDisponibilidadeOferecimentoListScreen/>}/>
    <Route path="/view/oferecimentoComponenteCurricular/formOferecimentoComponenteCurricular"
           element={<ViewOferecimentoComponenteCurricularFormOferecimentoComponenteCurricularListScreen/>}/>
    <Route path="/view/oferecimentoComponenteCurricular/formOferecimentoCurso"
           element={<ViewOferecimentoComponenteCurricularFormOferecimentoCursoListScreen/>}/>
    <Route path="/view/oferecimentoComponenteCurricular/listOferecimentoComponenteCurricular"
           element={<ViewOferecimentoComponenteCurricularListOferecimentoComponenteCurricularListScreen/>}/>
    <Route path="/view/oferecimentoComponenteCurricular/listOferecimentoCurso"
           element={<ViewOferecimentoComponenteCurricularListOferecimentoCursoListScreen/>}/>
    <Route path="/view/operacional/formOperacional" element={<ViewOperacionalFormOperacionalListScreen/>}/>
    <Route path="/view/operacional/listOperacional" element={<ViewOperacionalListOperacionalListScreen/>}/>
    <Route path="/view/pacote/listPacote" element={<ViewPacoteListPacoteListScreen/>}/>
    <Route path="/view/pacote/formPacote" element={<ViewPacoteFormPacoteListScreen/>}/>
    <Route path="/view/pagamento/aberturacaixa" element={<ViewPagamentoAberturacaixaListScreen/>}/>
    <Route path="/view/pagamento/caixaentrada" element={<ViewPagamentoCaixaentradaListScreen/>}/>
    <Route path="/view/pagamento/caixasaida" element={<ViewPagamentoCaixasaidaListScreen/>}/>
    <Route path="/view/pagamento/codigoVerificador" element={<ViewPagamentoCodigoVerificadorListScreen/>}/>
    <Route path="/view/pagamento/fechamentoCaixa" element={<ViewPagamentoFechamentoCaixaWizardScreen/>}/>
    <Route path="/view/pagamento/movimentocaixa" element={<ViewPagamentoMovimentocaixaListScreen/>}/>
    <Route path="/view/pagamento/produto" element={<ViewPagamentoProdutoListScreen/>}/>
    <Route path="/view/pais/formPais" element={<ViewPaisFormPaisListScreen/>}/>
    <Route path="/view/pais/listPais" element={<ViewPaisListPaisListScreen/>}/>
    <Route path="/view/perfil/formPerfil" element={<ViewPerfilFormPerfilListScreen/>}/>
    <Route path="/view/perfil/listPerfil" element={<ViewPerfilListPerfilListScreen/>}/>
    <Route path="/view/periodo/formPeriodo" element={<ViewPeriodoFormPeriodoListScreen/>}/>
    <Route path="/view/periodo/listPeriodo" element={<ViewPeriodoListPeriodoListScreen/>}/>
    <Route path="/view/pessoa/formPessoaFisica" element={<ViewPessoaFormPessoaFisicaListScreen/>}/>
    <Route path="/view/pessoa/formPessoaJuridica" element={<ViewPessoaFormPessoaJuridicaListScreen/>}/>
    <Route path="/view/pessoa/formPessoaPessoaFisica" element={<ViewPessoaFormPessoaPessoaFisicaListScreen/>}/>
    <Route path="/view/pessoa/formPessoaPessoaJuridica" element={<ViewPessoaFormPessoaPessoaJuridicaListScreen/>}/>
    <Route path="/view/pessoa/formPessoaPessoaUsuario" element={<ViewPessoaFormPessoaPessoaUsuarioListScreen/>}/>
    <Route path="/view/pessoa/listDisponibilidadePessoa" element={<ViewPessoaListDisponibilidadePessoaListScreen/>}/>

    <Route path="/view/pessoa/listPessoaFisica" element={<ViewPessoaListPessoaFisicaListScreen/>}/>
    <Route path="/view/pessoa/listPessoaJuridica" element={<ViewPessoaListPessoaJuridicaListScreen/>}/>
    <Route path="/view/pessoa/pessoaDocumento" element={<ViewPessoaPessoaDocumentoListScreen/>}/>

    <Route path="/view/produto/formProduto" element={<ViewProdutoFormProdutoListScreen/>}/>
    <Route path="/view/produto/listConfiguracaoProduto" element={<ViewProdutoListConfiguracaoProdutoListScreen/>}/>
    <Route path="/view/produto/listProduto" element={<ViewProdutoListProdutoListScreen/>}/>

    <Route path="/view/professor/formProfessor" element={<ViewProfessorFormProfessorListScreen/>}/>
    <Route path="/view/professor/listProfessor" element={<ViewProfessorListProfessorListScreen/>}/>
    <Route path="/view/prospecto/cadastroProspecto" element={<ViewProspectoCadastroProspectoListScreen/>}/>
    <Route path="/view/prospecto/controleProspecto" element={<ViewProspectoControleProspectoListScreen/>}/>
    <Route path="/view/prospecto/editProspecto" element={<ViewProspectoEditProspectoListScreen/>}/>
    <Route path="/view/prospecto/listProspecto" element={<ViewProspectoListProspectoListScreen/>}/>
    <Route path="/view/prospecto/prospectoRadar" element={<ViewProspectoProspectoRadarListScreen/>}/>

    <Route path="/view/referenciaBibliografica/formReferenciaBibliografica"
           element={<ViewReferenciaBibliograficaFormReferenciaBibliograficaListScreen/>}/>
    <Route path="/view/referenciaBibliografica/listReferenciaBibliografica"
           element={<ViewReferenciaBibliograficaListReferenciaBibliograficaListScreen/>}/>
    <Route path="/view/regiao/formRegiao" element={<ViewRegiaoFormRegiaoListScreen/>}/>
    <Route path="/view/regiao/listRegiao" element={<ViewRegiaoListRegiaoListScreen/>}/>

    <Route path="/view/relatorios/documentos" element={<ViewRelatoriosDocumentosListScreen/>}/>
    <Route path="/view/relatorios/extrator" element={<ViewRelatoriosExtratorListScreen/>}/>
    <Route path="/view/relatorios/formDashboard" element={<ViewRelatoriosFormDashboardListScreen/>}/>
    <Route path="/view/relatorios/formGrafico" element={<ViewRelatoriosFormGraficoListScreen/>}/>
    <Route path="/view/relatorios/formMapa" element={<ViewRelatoriosFormMapaListScreen/>}/>
    <Route path="/view/relatorios/formOrganograma" element={<ViewRelatoriosFormOrganogramaListScreen/>}/>
    <Route path="/view/relatorios/formTabela" element={<ViewRelatoriosFormTabelaListScreen/>}/>
    <Route path="/view/relatorios/listDashboard" element={<ViewRelatoriosListDashboardListScreen/>}/>
<Route path="/view/relatorios/listGrafico" element={<ListGraficoScreen/>}/>
<Route path="/view/relatorios/listMapa" element={<ListMapaScreen/>}/>
<Route path="/view/relatorios/listOrganograma" element={<ViewRelatoriosListOrganogramaListScreen/>}/>
<Route path="/view/relatorios/listTabela" element={<ListTabelaScreen/>}/>
    <Route path="/view/relatorios/viewDashboard" element={<ReportViewScreen/>}/>
    <Route path="/view/relatorios/viewGraficoBarrasHorizontal"
           element={<ReportViewScreen/>}/>
    <Route path="/view/relatorios/viewGraficoBarrasVertical"
           element={<ReportViewScreen/>}/>
    <Route path="/view/relatorios/viewGraficoCircular" element={<ReportViewScreen/>}/>
    <Route path="/view/relatorios/viewGraficoCombinado" element={<ReportViewScreen/>}/>
    <Route path="/view/relatorios/viewGraficoLinhas" element={<ReportViewScreen/>}/>
    <Route path="/view/relatorios/viewGraficoPizza" element={<ReportViewScreen/>}/>
    <Route path="/view/relatorios/viewMapa" element={<ReportViewScreen/>}/>
    <Route path="/view/relatorios/viewOrganograma" element={<ReportViewScreen/>}/>
    <Route path="/view/relatorios/viewTabela/:id" element={<ViewRelatoriosViewTabelaListScreen/>}/>

    <Route path="/view/resultado/formResultado" element={<ViewResultadoFormResultadoListScreen/>}/>
    <Route path="/view/resultado/listResultado" element={<ViewResultadoListResultadoListScreen/>}/>

    <Route path="/view/resultadoCobranca/formResultadoCobranca"
           element={<ViewResultadoCobrancaFormResultadoCobrancaListScreen/>}/>
    <Route path="/view/resultadoCobranca/listResultadoCobranca"
           element={<ViewResultadoCobrancaListResultadoCobrancaListScreen/>}/>
    <Route path="/view/resultadoContato/formResultadoContato"
           element={<ViewResultadoContatoFormResultadoContatoListScreen/>}/>
    <Route path="/view/resultadoContato/listResultadoContato"
           element={<ViewResultadoContatoListResultadoContatoListScreen/>}/>
    <Route path="/view/resultadoLigacaoNap/formResultadoLigacaoNap"
           element={<ViewResultadoLigacaoNapFormResultadoLigacaoNapListScreen/>}/>
    <Route path="/view/resultadoLigacaoNap/listResultadoLigacaoNap"
           element={<ViewResultadoLigacaoNapListResultadoLigacaoNapListScreen/>}/>
    <Route path="/view/sala/formSala" element={<ViewSalaFormSalaListScreen/>}/>
    <Route path="/view/sala/listSala" element={<ViewSalaListSalaListScreen/>}/>

<Route path="/view/statusCompromisso/formStatusCompromisso"
            element={<ViewStatusCompromissoFormStatusCompromissoListScreen/>}/>
    <Route path="/view/statusCompromisso/listStatusCompromisso"
            element={<ViewStatusCompromissoListStatusCompromissoListScreen/>}/>
    <Route path="/view/subCategoria/formSubCategoria" element={<ViewSubCategoriaFormSubCategoriaListScreen/>}/>
    <Route path="/view/subCategoria/listSubCategoria" element={<ViewSubCategoriaListSubCategoriaListScreen/>}/>
    <Route path="/view/subcategoriaEstoque/listSubCategoria"
           element={<ViewSubcategoriaEstoqueListSubCategoriaListScreen/>}/>

    <Route path="/view/telefone/formTelefone" element={<ViewTelefoneFormTelefoneListScreen/>}/>
    <Route path="/view/telefone/listTelefone" element={<ViewTelefoneListTelefoneListScreen/>}/>
    
    <Route path="/view/tempoAula/listTempoAula" element={<ViewTempoAulaListTempoAulaListScreen/>}/>
    <Route path="/view/tipoAcao/formTipoAcao" element={<ViewTipoAcaoFormTipoAcaoListScreen/>}/>
    <Route path="/view/tipoAcao/listTipoAcao" element={<ViewTipoAcaoListTipoAcaoListScreen/>}/>
    
    <Route path="/view/tipoAgenda/listTipoAgenda" element={<ViewTipoAgendaListTipoAgendaListScreen/>}/>
    <Route path="/view/tipoAtividade/formTipoAtividade" element={<ViewTipoAtividadeFormTipoAtividadeListScreen/>}/>
    <Route path="/view/tipoAtividade/listTipoAtividade" element={<ViewTipoAtividadeListTipoAtividadeListScreen/>}/>
    <Route path="/view/tipoCanal/formTipoCanal" element={<ViewTipoCanalFormTipoCanalListScreen/>}/>
    <Route path="/view/tipoCanal/listTipoCanal" element={<ViewTipoCanalListTipoCanalListScreen/>}/>
    <Route path="/view/tipoContrato/formTipoContrato" element={<ViewTipoContratoFormTipoContratoListScreen/>}/>
    <Route path="/view/tipoContrato/listTipoContrato" element={<ViewTipoContratoListTipoContratoListScreen/>}/>

    <Route path="/view/tipoCurso/formTipoCurso" element={<ViewTipoCursoFormTipoCursoListScreen/>}/>
    <Route path="/view/tipoCurso/listTipoCurso" element={<ViewTipoCursoListTipoCursoListScreen/>}/>
    <Route path="/view/tipoHistorico/formTipoHistorico" element={<ViewTipoHistoricoFormTipoHistoricoListScreen/>}/>
    <Route path="/view/tipoHistorico/listTipoHistorico" element={<ViewTipoHistoricoListTipoHistoricoListScreen/>}/>
    <Route path="/view/tipoPausa/formTipoPausa" element={<ViewTipoPausaFormTipoPausaListScreen/>}/>
    <Route path="/view/tipoPausa/listTipoPausa" element={<ViewTipoPausaListTipoPausaListScreen/>}/>
    <Route path="/view/tipoSala/formTipoSala" element={<ViewTipoSalaFormTipoSalaListScreen/>}/>
    <Route path="/view/tipoSala/listTipoSala" element={<ViewTipoSalaListTipoSalaListScreen/>}/>
    <Route path="/view/tipoTelefone/formTipoTelefone" element={<ViewTipoTelefoneFormTipoTelefoneListScreen/>}/>
    <Route path="/view/tipoTelefone/listTipoTelefone" element={<ViewTipoTelefoneListTipoTelefoneListScreen/>}/>
    <Route path="/view/tipoUnidade/formTipoUnidade" element={<ViewTipoUnidadeFormTipoUnidadeListScreen/>}/>
    <Route path="/view/tipoUnidade/listTipoUnidade" element={<ViewTipoUnidadeListTipoUnidadeListScreen/>}/>

    
    <Route path="/view/turma/listTurma" element={<ViewTurmaListTurmaListScreen/>}/>
    <Route path="/view/turma/listTurmaFinalizando" element={<ViewTurmaListTurmaFinalizandoListScreen/>}/>
    <Route path="/view/turno/formTurno" element={<ViewTurnoFormTurnoListScreen/>}/>
    <Route path="/view/turno/listTurno" element={<ViewTurnoListTurnoListScreen/>}/>

    <Route path="/view/turnoEducacao/formTurnoEducacao" element={<ViewTurnoEducacaoFormTurnoEducacaoListScreen/>}/>
    <Route path="/view/turnoEducacao/listTurnoEducacao" element={<ViewTurnoEducacaoListTurnoEducacaoListScreen/>}/>
    <Route path="/view/turnoFuncionario/formTurnoFuncionario"
           element={<ViewTurnoFuncionarioFormTurnoFuncionarioListScreen/>}/>
    <Route path="/view/turnoFuncionario/listTurnoFuncionario"
           element={<ViewTurnoFuncionarioListTurnoFuncionarioListScreen/>}/>

    <Route path="/view/turnoTrabalho/formTurnoTrabalho" element={<ViewTurnoTrabalhoFormTurnoTrabalhoListScreen/>}/>
    <Route path="/view/turnoTrabalho/listTurnoTrabalho" element={<ViewTurnoTrabalhoListTurnoTrabalhoListScreen/>}/>
    <Route path="/view/turnoUsuario/listTurnoUsuario" element={<ViewTurnoUsuarioListTurnoUsuarioListScreen/>}/>

    <Route path="/view/unidade/formRede" element={<ViewUnidadeFormRedeListScreen/>}/>
    <Route path="/view/unidade/formUnidade" element={<ViewUnidadeFormUnidadeListScreen/>}/>
    <Route path="/view/unidade/listRede" element={<ViewUnidadeListRedeListScreen/>}/>
    <Route path="/view/unidade/listUnidade" element={<ViewUnidadeListUnidadeListScreen/>}/>
    <Route path="/view/usuario/camposUsuarioTabView" element={<ViewUsuarioCamposUsuarioTabViewListScreen/>}/>

    <Route path="/view/usuario/formUsuario" element={<ViewUsuarioFormUsuarioListScreen/>}/>
    <Route path="/view/usuario/formUsuarioRapido" element={<ViewUsuarioFormUsuarioRapidoListScreen/>}/>
    <Route path="/view/usuario/cadastro" element={<CadastroUsuarioScreen/>}/>
    <Route path="/view/usuario/listUsuario" element={<ViewUsuarioListUsuarioListScreen/>}/>

    <Route path="/view/valorCurso/formValorCurso" element={<ViewValorCursoFormValorCursoListScreen/>}/>
    <Route path="/view/valorCurso/listValorCurso" element={<ViewValorCursoListValorCursoListScreen/>}/>
    <Route path="/view/valorProduto/formValorProduto" element={<ViewValorProdutoFormValorProdutoListScreen/>}/>
    <Route path="/view/valorProduto/listValorProduto" element={<ViewValorProdutoListValorProdutoListScreen/>}/>
    <Route path="/asaas/cobrancas" element={<AsaasCobrancasListScreen/>}/>
    <Route path="/asaas/clientes" element={<AsaasClientesListScreen/>}/>
    <Route path="/asaas/parcelas" element={<AsaasParcelasListScreen/>}/>
    <Route path="/curriculo/vaga" element={<CurriculoVagaListScreen/>}/>
    <Route path="/curriculo/vagas" element={<CurriculoVagaListScreen/>}/>
    <Route path="/curriculo/empresa" element={<CurriculoEmpresaListScreen/>}/>
    <Route path="/curriculo/empresa-unidade" element={<CurriculoEmpresaUnidadeListScreen/>}/>
    <Route path="/curriculo/entrevista" element={<CurriculoEntrevistaListScreen/>}/>
    <Route path="/curriculo/curriculo-trabalho" element={<CurriculoTrabalhoListScreen/>}/>
    <Route path="/curriculo/curriculo-campo" element={<CurriculoCampoListScreen/>}/>
    <Route path="/curriculo/configuracao" element={
        <CurriculoConfiguracaoListScreen/>}/>
    <Route path="/view/configuracaoFinanceira/listConfiguracaoFinanceira" element={<ViewConfiguracaoFinanceiraListConfiguracaoFinanceiraListScreen/>}/>
    <Route path="/view/configuracaoFinanceira/formConfiguracaoFinanceira" element={<ViewConfiguracaoFinanceiraFormConfiguracaoFinanceiraListScreen/>}/>
    <Route path='*' element={<p>Selecione uma tela.</p>}/></Route><Route path="/login" element={<LoginScreen/>}/></Routes></BrowserRouter></PermissionBridge></AlertDialogProvider></ThemeProvider></AuthProvider></QueryClientProvider>);