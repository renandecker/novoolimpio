import React from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import DefaultListScreen from './screens/DefaultListScreen';
import {AuthProvider} from './auth';
import {ThemeProvider} from './ThemeContext';
import LoginScreen from './LoginScreen';
import ProtectedRoute from './ProtectedRoute';
import PermissionBridge from './PermissionBridge';
import './colors.css';
import ViewAcaoColunasAcaoListScreen from './screens/ViewAcaoColunasAcaoListScreen';
import ViewAcaoColunasAcaoCampoListScreen from './screens/ViewAcaoColunasAcaoCampoListScreen';
import ViewAcaoFormAcaoListScreen from './screens/ViewAcaoFormAcaoListScreen';
import ViewAcaoListAcaoListScreen from './screens/ViewAcaoListAcaoListScreen';
import ViewRegraNotificacaoListRegraListScreen from './screens/ViewRegraNotificacaoListRegraListScreen';
import ViewAgendaCalendarioAgendaListScreen from './screens/ViewAgendaCalendarioAgendaListScreen';
import ViewAgendaColunasListScreen from './screens/ViewAgendaColunasListScreen';
import ViewAgendaColunasUsuarioAgendaListScreen from './screens/ViewAgendaColunasUsuarioAgendaListScreen';
import ViewAgendaFormAgendaListScreen from './screens/ViewAgendaFormAgendaListScreen';
import ViewAgendaListAgendaListScreen from './screens/ViewAgendaListAgendaListScreen';
import ViewAgendaCompromissosScreen from './screens/ViewAgendaCompromissosScreen';
import ViewAlterarSenhaAlterarSenhaListScreen from './screens/ViewAlterarSenhaAlterarSenhaListScreen';
import ViewApresentacaoListApresentacaoListScreen from './screens/ViewApresentacaoListApresentacaoListScreen';
import ViewArquivoProconListArquivoProconListScreen from './screens/ViewArquivoProconListArquivoProconListScreen';
import ViewAtividadeComplementarFormAtividadeComplementarListScreen
    from './screens/ViewAtividadeComplementarFormAtividadeComplementarListScreen';
import ViewAtividadeComplementarListAtividadeComplementarListScreen
    from './screens/ViewAtividadeComplementarListAtividadeComplementarListScreen';
import ViewAuditoriaFormAuditoriaHistoricoListScreen from './screens/ViewAuditoriaFormAuditoriaHistoricoListScreen';
import ViewAuditoriaListAuditoriaListScreen from './screens/ViewAuditoriaListAuditoriaListScreen';
import ViewAuditoriaListAuditoriaHistoricoListScreen from './screens/ViewAuditoriaListAuditoriaHistoricoListScreen';
import ViewBairroFormBairroListScreen from './screens/ViewBairroFormBairroListScreen';
import ViewBairroListBairroListScreen from './screens/ViewBairroListBairroListScreen';
import ViewBandeiraFormBandeiraListScreen from './screens/ViewBandeiraFormBandeiraListScreen';
import ViewBandeiraListBandeiraListScreen from './screens/ViewBandeiraListBandeiraListScreen';
import ViewBaseTecnologicaColunasBaseTecnologicaListScreen
    from './screens/ViewBaseTecnologicaColunasBaseTecnologicaListScreen';
import ViewBaseTecnologicaFormBaseTecnologicaListScreen
    from './screens/ViewBaseTecnologicaFormBaseTecnologicaListScreen';
import ViewBaseTecnologicaListBaseTecnologicaListScreen
    from './screens/ViewBaseTecnologicaListBaseTecnologicaListScreen';
import ViewCaixaFormCaixaListScreen from './screens/ViewCaixaFormCaixaListScreen';
import ViewCaixaListCaixaListScreen from './screens/ViewCaixaListCaixaListScreen';
import ViewCampanhaColunasAcaoDeCampanhaListScreen from './screens/ViewCampanhaColunasAcaoDeCampanhaListScreen';
import ViewCampanhaColunasFiltroListScreen from './screens/ViewCampanhaColunasFiltroListScreen';
import ViewCampanhaFormCampanhaListScreen from './screens/ViewCampanhaFormCampanhaListScreen';
import ViewCampanhaFormDirecionamentoListScreen from './screens/ViewCampanhaFormDirecionamentoListScreen';
import ViewCampanhaFormGerarPacotesListScreen from './screens/ViewCampanhaFormGerarPacotesListScreen';
import ViewCampanhaListCampanhaListScreen from './screens/ViewCampanhaListCampanhaListScreen';
import ViewCampanhaNegociacaoFormCampanhaNegociacaoListScreen
    from './screens/ViewCampanhaNegociacaoFormCampanhaNegociacaoListScreen';
import ViewCampanhaNegociacaoListCampanhaNegociacaoListScreen
    from './screens/ViewCampanhaNegociacaoListCampanhaNegociacaoListScreen';
import ViewCampoColunasCampoListScreen from './screens/ViewCampoColunasCampoListScreen';
import ViewCampoFormCampoListScreen from './screens/ViewCampoFormCampoListScreen';
import ViewCampoListCampoListScreen from './screens/ViewCampoListCampoListScreen';
import ViewCancelamentoColunasPreCancelamentoListScreen
    from './screens/ViewCancelamentoColunasPreCancelamentoListScreen';
import ViewCargaFormCargaListScreen from './screens/ViewCargaFormCargaListScreen';
import ViewCargaListCargaListScreen from './screens/ViewCargaListCargaListScreen';
import ViewCategoriaFormCategoriaListScreen from './screens/ViewCategoriaFormCategoriaListScreen';
import ViewCategoriaListCategoriaListScreen from './screens/ViewCategoriaListCategoriaListScreen';
import ViewCategoriaCampoFormCategoriaCampoListScreen from './screens/ViewCategoriaCampoFormCategoriaCampoListScreen';
import ViewCategoriaCampoListCategoriaCampoListScreen from './screens/ViewCategoriaCampoListCategoriaCampoListScreen';
import ViewCategoriaEstoqueListCategoriaListScreen from './screens/ViewCategoriaEstoqueListCategoriaListScreen';
import ViewChamadaAssinadaListChamadaAssinadaListScreen
    from './screens/ViewChamadaAssinadaListChamadaAssinadaListScreen';
import ViewCidadeFormCidadeListScreen from './screens/ViewCidadeFormCidadeListScreen';
import ViewCidadeListCidadeListScreen from './screens/ViewCidadeListCidadeListScreen';
import ViewCobrancaColunasCompromissoListScreen from './screens/ViewCobrancaColunasCompromissoListScreen';
import ViewCobrancaColunasEmailListScreen from './screens/ViewCobrancaColunasEmailListScreen';
import ViewCobrancaColunasLigacaoListScreen from './screens/ViewCobrancaColunasLigacaoListScreen';
import ViewCobrancaColunasParcelasListScreen from './screens/ViewCobrancaColunasParcelasListScreen';
import ViewCobrancaColunasPrioritarioListScreen from './screens/ViewCobrancaColunasPrioritarioListScreen';
import ViewCobrancaFormLigacaoCobrancaListScreen from './screens/ViewCobrancaFormLigacaoCobrancaListScreen';
import ViewCobrancaListGerirCobrancaListScreen from './screens/ViewCobrancaListGerirCobrancaListScreen';
import ViewCobrancaListLigacaoCobrancaListScreen from './screens/ViewCobrancaListLigacaoCobrancaListScreen';
import ViewCobrancaListLoteListScreen from './screens/ViewCobrancaListLoteListScreen';
import ViewComponenteCurricularColunasComponenteCurricularListScreen
    from './screens/ViewComponenteCurricularColunasComponenteCurricularListScreen';
import ViewComponenteCurricularFormComponenteCurricularListScreen
    from './screens/ViewComponenteCurricularFormComponenteCurricularListScreen';
import ViewComponenteCurricularListComponenteCurricularListScreen
    from './screens/ViewComponenteCurricularListComponenteCurricularListScreen';
import ViewCompromissoAbasMatriculaListScreen from './screens/ViewCompromissoAbasMatriculaListScreen';
import ViewCompromissoColunasCompromissoListScreen from './screens/ViewCompromissoColunasCompromissoListScreen';
import ViewCompromissoFinalizarCompromissoListScreen from './screens/ViewCompromissoFinalizarCompromissoListScreen';
import ViewCompromissoFormCompromissoListScreen from './screens/ViewCompromissoFormCompromissoListScreen';
import ViewCompromissoFormTipoCompromissoListScreen from './screens/ViewCompromissoFormTipoCompromissoListScreen';
import ViewCompromissoListCompromissoListScreen from './screens/ViewCompromissoListCompromissoListScreen';
import ViewCompromissoListTipoCompromissoListScreen from './screens/ViewCompromissoListTipoCompromissoListScreen';
import ViewComunicacaoColunasComunicacaoListScreen from './screens/ViewComunicacaoColunasComunicacaoListScreen';
import ViewComunicacaoColunasComunicacaoMensagemListScreen
    from './screens/ViewComunicacaoColunasComunicacaoMensagemListScreen';
import ViewComunicacaoFormComunicacaoListScreen from './screens/ViewComunicacaoFormComunicacaoListScreen';
import ViewComunicacaoFormComunicacaoMensagemListScreen
    from './screens/ViewComunicacaoFormComunicacaoMensagemListScreen';
import ViewComunicacaoListComunicacaoListScreen from './screens/ViewComunicacaoListComunicacaoListScreen';
import ViewComunicacaoListComunicacaoMensagemListScreen
    from './screens/ViewComunicacaoListComunicacaoMensagemListScreen';
import ViewConfiguracaoColunasMarketingCampoListScreen from './screens/ViewConfiguracaoColunasMarketingCampoListScreen';
import ViewConfiguracaoFormConfiguracaoListScreen from './screens/ViewConfiguracaoFormConfiguracaoListScreen';
import ViewConfiguracaoFormConfiguracaoCaixaListScreen from './screens/ViewConfiguracaoFormConfiguracaoCaixaListScreen';
import ViewConfiguracaoFormConfiguracaoEmailListScreen from './screens/ViewConfiguracaoFormConfiguracaoEmailListScreen';
import ViewConfiguracaoFormConfiguracaoEstoqueListScreen
    from './screens/ViewConfiguracaoFormConfiguracaoEstoqueListScreen';
import ViewConfiguracaoFormConfiguracaoParcelaListScreen
    from './screens/ViewConfiguracaoFormConfiguracaoParcelaListScreen';
import ViewConfiguracaoFormLayoutListScreen from './screens/ViewConfiguracaoFormLayoutListScreen';
import ViewConfiguracaoListConfiguracaoListScreen from './screens/ViewConfiguracaoListConfiguracaoListScreen';
import ViewConfiguracaoListConfiguracaoCaixaListScreen from './screens/ViewConfiguracaoListConfiguracaoCaixaListScreen';
import ViewConfiguracaoListConfiguracaoEmailListScreen from './screens/ViewConfiguracaoListConfiguracaoEmailListScreen';
import ViewConfiguracaoListConfiguracaoEstoqueListScreen
    from './screens/ViewConfiguracaoListConfiguracaoEstoqueListScreen';
import ViewConfiguracaoListConfiguracaoMarketingListScreen
    from './screens/ViewConfiguracaoListConfiguracaoMarketingListScreen';
import ViewConfiguracaoListConfiguracaoParcelaListScreen
    from './screens/ViewConfiguracaoListConfiguracaoParcelaListScreen';
import ViewConfiguracaoListLayoutListScreen from './screens/ViewConfiguracaoListLayoutListScreen';
import ViewConsultorConsultorListScreen from './screens/ViewConsultorConsultorListScreen';
import ViewConsultorFormConsultorListScreen from './screens/ViewConsultorFormConsultorListScreen';
import ViewConsultorListConsultorListScreen from './screens/ViewConsultorListConsultorListScreen';
import ViewContaControlePagamentoListScreen from './screens/ViewContaControlePagamentoListScreen';
import ViewContaGestaoContaListScreen from './screens/ViewContaGestaoContaListScreen';
import ViewContaCorrenteFormContaCorrenteListScreen from './screens/ViewContaCorrenteFormContaCorrenteListScreen';
import ViewContaCorrenteListContaCorrenteListScreen from './screens/ViewContaCorrenteListContaCorrenteListScreen';
import ViewContratoColunasContratoListScreen from './screens/ViewContratoColunasContratoListScreen';
import ViewContratoFormContratoListScreen from './screens/ViewContratoFormContratoListScreen';
import ViewContratoListContratoListScreen from './screens/ViewContratoListContratoListScreen';
import ViewCoordenadorColunasAdminListScreen from './screens/ViewCoordenadorColunasAdminListScreen';
import ViewCoordenadorColunasOperadorListScreen from './screens/ViewCoordenadorColunasOperadorListScreen';
import ViewCoordenadorListCoordenadorListScreen from './screens/ViewCoordenadorListCoordenadorListScreen';
import ViewCorFormCoresListScreen from './screens/ViewCorFormCoresListScreen';
import ViewCorListCoresListScreen from './screens/ViewCorListCoresListScreen';
import ViewCpfalunosFormCpfalunosListScreen from './screens/ViewCpfalunosFormCpfalunosListScreen';
import ViewCpfalunosListCpfalunosListScreen from './screens/ViewCpfalunosListCpfalunosListScreen';
import ViewCriterioListCriterioFormScreen from './screens/ViewCriterioListCriterioFormScreen';
import ViewCriterioListCriterioListScreen from './screens/ViewCriterioListCriterioListScreen';
import ViewCurriculoColunasListScreen from './screens/ViewCurriculoColunasListScreen';
import ViewCurriculoColunasMatrizCurricularListScreen from './screens/ViewCurriculoColunasMatrizCurricularListScreen';
import ViewCurriculoColunasRequisitoMatrizListScreen from './screens/ViewCurriculoColunasRequisitoMatrizListScreen';
import ViewCurriculoFormCurriculoListScreen from './screens/ViewCurriculoFormCurriculoListScreen';
import ViewCurriculoListCurriculoListScreen from './screens/ViewCurriculoListCurriculoListScreen';
import ViewCursoFormCursoListScreen from './screens/ViewCursoFormCursoListScreen';
import ViewCursoListCursoListScreen from './screens/ViewCursoListCursoListScreen';
import ViewCustoServicoFormCustoServicoListScreen from './screens/ViewCustoServicoFormCustoServicoListScreen';
import ViewCustoServicoListCustoServicoListScreen from './screens/ViewCustoServicoListCustoServicoListScreen';
import ViewDesistenteFormDesistenteListScreen from './screens/ViewDesistenteFormDesistenteListScreen';
import ViewDesistenteListDesistenteListScreen from './screens/ViewDesistenteListDesistenteListScreen';
import ViewDiaPagamentoFormDiaPagamentoListScreen from './screens/ViewDiaPagamentoFormDiaPagamentoListScreen';
import ViewDiaPagamentoListDiaPagamentoListScreen from './screens/ViewDiaPagamentoListDiaPagamentoListScreen';
import ViewDiaSemanaColunasDiaSemanaListScreen from './screens/ViewDiaSemanaColunasDiaSemanaListScreen';
import ViewDigitalizacaoDocumentoDigitalizacaoDocumentoListScreen
    from './screens/ViewDigitalizacaoDocumentoDigitalizacaoDocumentoListScreen';
import ViewDisponibilidadeProfessorListDisponibilidadeProfessorListScreen
    from './screens/ViewDisponibilidadeProfessorListDisponibilidadeProfessorListScreen';
import ViewDisponibilidadeSalaListDisponibilidadeSalaListScreen
    from './screens/ViewDisponibilidadeSalaListDisponibilidadeSalaListScreen';
import ViewEntregaFormEntregaListScreen from './screens/ViewEntregaFormEntregaListScreen';
import ViewEntregaListEntregaListScreen from './screens/ViewEntregaListEntregaListScreen';
import ViewEscolaridadeFormEscolaridadeListScreen from './screens/ViewEscolaridadeFormEscolaridadeListScreen';
import ViewEscolaridadeListEscolaridadeListScreen from './screens/ViewEscolaridadeListEscolaridadeListScreen';
import ViewEstadoFormEstadoListScreen from './screens/ViewEstadoFormEstadoListScreen';
import ViewEstadoListEstadoListScreen from './screens/ViewEstadoListEstadoListScreen';
import ViewEstadoCivilFormEstadoCivilListScreen from './screens/ViewEstadoCivilFormEstadoCivilListScreen';
import ViewEstadoCivilListEstadoCivilListScreen from './screens/ViewEstadoCivilListEstadoCivilListScreen';
import ViewEstoqueControleestoqueListScreen from './screens/ViewEstoqueControleestoqueListScreen';
import ViewEstoqueEstoqueprodutoListScreen from './screens/ViewEstoqueEstoqueprodutoListScreen';
import ViewEstrategiaFormEstrategiaListScreen from './screens/ViewEstrategiaFormEstrategiaListScreen';
import ViewEstrategiaListEstrategiaListScreen from './screens/ViewEstrategiaListEstrategiaListScreen';
import ViewEstruturaFormEstruturaListScreen from './screens/ViewEstruturaFormEstruturaListScreen';
import ViewEstruturaListEstruturaListScreen from './screens/ViewEstruturaListEstruturaListScreen';
import ViewEtapasCobrancaColunasEtapasCobrancaListScreen
    from './screens/ViewEtapasCobrancaColunasEtapasCobrancaListScreen';
import ViewEtapasCobrancaFormEtapasCobrancaListScreen from './screens/ViewEtapasCobrancaFormEtapasCobrancaListScreen';
import ViewEtapasCobrancaListEtapasCobrancaListScreen from './screens/ViewEtapasCobrancaListEtapasCobrancaListScreen';
import ViewEtapasNapColunasEtapasNapListScreen from './screens/ViewEtapasNapColunasEtapasNapListScreen';
import ViewEtapasNapFormEtapasNapListScreen from './screens/ViewEtapasNapFormEtapasNapListScreen';
import ViewEtapasNapListEtapasNapListScreen from './screens/ViewEtapasNapListEtapasNapListScreen';
import ViewEtniaFormEtniaListScreen from './screens/ViewEtniaFormEtniaListScreen';
import ViewEtniaListEtniaListScreen from './screens/ViewEtniaListEtniaListScreen';
import ViewFavoritoPerfilColunasFavoritoPerfilListScreen
    from './screens/ViewFavoritoPerfilColunasFavoritoPerfilListScreen';
import ViewFavoritoPerfilFormFavoritoPerfilListScreen from './screens/ViewFavoritoPerfilFormFavoritoPerfilListScreen';
import ViewFavoritoPerfilListFavoritoPerfilListScreen from './screens/ViewFavoritoPerfilListFavoritoPerfilListScreen';
import ViewFavoritoUsuarioFormFavoritoUsuarioListScreen
    from './screens/ViewFavoritoUsuarioFormFavoritoUsuarioListScreen';
import ViewFavoritoUsuarioListFavoritoUsuarioListScreen
    from './screens/ViewFavoritoUsuarioListFavoritoUsuarioListScreen';
import ViewFeriadoFormFeriadoListScreen from './screens/ViewFeriadoFormFeriadoListScreen';
import ViewFeriadoListFeriadoListScreen from './screens/ViewFeriadoListFeriadoListScreen';
import ViewFiltrosColunasListScreen from './screens/ViewFiltrosColunasListScreen';
import ViewFiltrosFormFiltrosListScreen from './screens/ViewFiltrosFormFiltrosListScreen';
import ViewFiltrosListFiltrosListScreen from './screens/ViewFiltrosListFiltrosListScreen';
import ViewFornecedorColunasFornecedoresListScreen from './screens/ViewFornecedorColunasFornecedoresListScreen';
import ViewFornecedorFormFornecedorListScreen from './screens/ViewFornecedorFormFornecedorListScreen';
import ViewFornecedorListFornecedorListScreen from './screens/ViewFornecedorListFornecedorListScreen';
import ViewFuncaoFormFuncaoListScreen from './screens/ViewFuncaoFormFuncaoListScreen';
import ViewFuncaoListFuncaoListScreen from './screens/ViewFuncaoListFuncaoListScreen';
import ViewGeneroListGeneroListScreen from './screens/ViewGeneroListGeneroListScreen';
import ViewGestaoAlunoColunasHistoricoAlunoListScreen from './screens/ViewGestaoAlunoColunasHistoricoAlunoListScreen';
import ViewGestaoAlunoColunasParcelaListScreen from './screens/ViewGestaoAlunoColunasParcelaListScreen';
import ViewGestaoAlunoColunasParcelaAlterarListScreen from './screens/ViewGestaoAlunoColunasParcelaAlterarListScreen';
import ViewGestaoAlunoGestaoAlunoListScreen from './screens/ViewGestaoAlunoGestaoAlunoListScreen';
import ViewGestaoAlunoListHistoricoAlunoListScreen from './screens/ViewGestaoAlunoListHistoricoAlunoListScreen';
import ViewGestaoProfessorGestaoProfessorListScreen from './screens/ViewGestaoProfessorGestaoProfessorListScreen';
import ViewCriarPerguntaScreen from './screens/ViewCriarPerguntaScreen';
import ViewGrauFormGrauListScreen from './screens/ViewGrauFormGrauListScreen';
import ViewGrauListGrauListScreen from './screens/ViewGrauListGrauListScreen';
import ViewGrupoColunasListScreen from './screens/ViewGrupoColunasListScreen';
import ViewGrupoFormGrupoListScreen from './screens/ViewGrupoFormGrupoListScreen';
import ViewGrupoListGrupoListScreen from './screens/ViewGrupoListGrupoListScreen';
import ViewHorarioFormHorarioListScreen from './screens/ViewHorarioFormHorarioListScreen';
import ViewHorarioListHorarioListScreen from './screens/ViewHorarioListHorarioListScreen';
import ViewHorarioPeriodoFormHorarioPeriodoListScreen from './screens/ViewHorarioPeriodoFormHorarioPeriodoListScreen';
import ViewHorarioPeriodoListHorarioPeriodoListScreen from './screens/ViewHorarioPeriodoListHorarioPeriodoListScreen';
import ViewImpressoraFormImpressoraListScreen from './screens/ViewImpressoraFormImpressoraListScreen';
import ViewImpressoraListImpressoraListScreen from './screens/ViewImpressoraListImpressoraListScreen';
import ViewIndicadorFormIndicadorListScreen from './screens/ViewIndicadorFormIndicadorListScreen';
import ViewIndicadorListIndicadorListScreen from './screens/ViewIndicadorListIndicadorListScreen';
import ViewLigacaoColunasLigacaoListScreen from './screens/ViewLigacaoColunasLigacaoListScreen';
import ViewLigacaoLigacaoListScreen from './screens/ViewLigacaoLigacaoListScreen';
import ViewLoginLoginListScreen from './screens/ViewLoginLoginListScreen';
import ViewLogradouroFormLogradouroListScreen from './screens/ViewLogradouroFormLogradouroListScreen';
import ViewLogradouroListLogradouroListScreen from './screens/ViewLogradouroListLogradouroListScreen';
import ViewMarcaListMarcaListScreen from './screens/ViewMarcaListMarcaListScreen';
import ViewMatriculaAbasMatriculaListScreen from './screens/ViewMatriculaAbasMatriculaListScreen';
import ViewMatriculaColunasCentraisListScreen from './screens/ViewMatriculaColunasCentraisListScreen';
import ViewMatriculaColunasContratoListScreen from './screens/ViewMatriculaColunasContratoListScreen';
import ViewMatriculaColunasPessoaListScreen from './screens/ViewMatriculaColunasPessoaListScreen';
import ViewMatriculaFormMatriculaListScreen from './screens/ViewMatriculaFormMatriculaListScreen';
import ViewMatriculaFormRematriculaListScreen from './screens/ViewMatriculaFormRematriculaListScreen';
import ViewMatriculaWizardScreen from './screens/ViewMatriculaWizardScreen';
import ViewMatriculaListMatriculaListScreen from './screens/ViewMatriculaListMatriculaListScreen';
import ViewMatriculaListRematriculaListScreen from './screens/ViewMatriculaListRematriculaListScreen';
import ViewMatriculaMatriculaListScreen from './screens/ViewMatriculaMatriculaListScreen';
import ViewMatriculaRematriculaListScreen from './screens/ViewMatriculaRematriculaListScreen';
import ViewMensagemFormMensagemListScreen from './screens/ViewMensagemFormMensagemListScreen';
import ViewMensagemListMensagemListScreen from './screens/ViewMensagemListMensagemListScreen';
import ViewMensagemMetaListMensagemMetaListScreen from './screens/ViewMensagemMetaListMensagemMetaListScreen';
import ViewMensagemCobrancaFormMensagemCobrancaListScreen
    from './screens/ViewMensagemCobrancaFormMensagemCobrancaListScreen';
import ViewMensagemCobrancaListMensagemCobrancaListScreen
    from './screens/ViewMensagemCobrancaListMensagemCobrancaListScreen';
import ViewMensagemNapFormMensagemNapListScreen from './screens/ViewMensagemNapFormMensagemNapListScreen';
import ViewMensagemNapListMensagemNapListScreen from './screens/ViewMensagemNapListMensagemNapListScreen';
import ViewMenuListMapaMenuListScreen from './screens/ViewMenuListMapaMenuListScreen';
import ViewMetaFormMetaListScreen from './screens/ViewMetaFormMetaListScreen';
import ViewMetaIndicadorMetaDinamicaListScreen from './screens/ViewMetaIndicadorMetaDinamicaListScreen';
import ViewMetaListMetaListScreen from './screens/ViewMetaListMetaListScreen';
import ViewMetaListMetaDinamicaListScreen from './screens/ViewMetaListMetaDinamicaListScreen';
import ViewModuloColunasModuloListScreen from './screens/ViewModuloColunasModuloListScreen';
import ViewModuloFormModuloListScreen from './screens/ViewModuloFormModuloListScreen';
import ViewModuloListModuloListScreen from './screens/ViewModuloListModuloListScreen';
import ViewModuloListOrdemModuloListScreen from './screens/ViewModuloListOrdemModuloListScreen';
import ViewMotivoFormMotivoListScreen from './screens/ViewMotivoFormMotivoListScreen';
import ViewMotivoListMotivoListScreen from './screens/ViewMotivoListMotivoListScreen';
import ViewMovimentacaoFormMovimentacaoEstoqueListScreen
    from './screens/ViewMovimentacaoFormMovimentacaoEstoqueListScreen';
import ViewMovimentacaoListMovimentacaoEstoqueListScreen
    from './screens/ViewMovimentacaoListMovimentacaoEstoqueListScreen';
import ViewMovimentoFormMovimentoListScreen from './screens/ViewMovimentoFormMovimentoListScreen';
import ViewMovimentoListMovimentoListScreen from './screens/ViewMovimentoListMovimentoListScreen';
import ViewNotificacaoListNotificacaoListScreen from './screens/ViewNotificacaoListNotificacaoListScreen';
import ViewNapAbasinfoListScreen from './screens/ViewNapAbasinfoListScreen';
import ViewNapColunasCadernoListScreen from './screens/ViewNapColunasCadernoListScreen';
import ViewNapColunasCadernoPrioritariaListScreen from './screens/ViewNapColunasCadernoPrioritariaListScreen';
import ViewNapColunasCompromissoListScreen from './screens/ViewNapColunasCompromissoListScreen';
import ViewNapColunasEmailListScreen from './screens/ViewNapColunasEmailListScreen';
import ViewNapColunasLigacaoListScreen from './screens/ViewNapColunasLigacaoListScreen';
import ViewNapColunasPrioritarioListScreen from './screens/ViewNapColunasPrioritarioListScreen';
import ViewNapFormLigacaoNapListScreen from './screens/ViewNapFormLigacaoNapListScreen';
import ViewNapListGerirNapListScreen from './screens/ViewNapListGerirNapListScreen';
import ViewNapListLigacaoNapListScreen from './screens/ViewNapListLigacaoNapListScreen';
import ViewNapListLoteListScreen from './screens/ViewNapListLoteListScreen';
import ViewOferecimentoComponenteCurricularColunasDiaAulaListScreen
    from './screens/ViewOferecimentoComponenteCurricularColunasDiaAulaListScreen';
import ViewOferecimentoComponenteCurricularColunasInfoOcorrenciaListScreen
    from './screens/ViewOferecimentoComponenteCurricularColunasInfoOcorrenciaListScreen';
import ViewOferecimentoComponenteCurricularColunasOferecimentoListScreen
    from './screens/ViewOferecimentoComponenteCurricularColunasOferecimentoListScreen';
import ViewOferecimentoComponenteCurricularDisponibilidadeOferecimentoListScreen
    from './screens/ViewOferecimentoComponenteCurricularDisponibilidadeOferecimentoListScreen';
import ViewOferecimentoComponenteCurricularFormOferecimentoComponenteCurricularListScreen
    from './screens/ViewOferecimentoComponenteCurricularFormOferecimentoComponenteCurricularListScreen';
import ViewOferecimentoComponenteCurricularFormOferecimentoCursoListScreen
    from './screens/ViewOferecimentoComponenteCurricularFormOferecimentoCursoListScreen';
import ViewOferecimentoComponenteCurricularListOferecimentoComponenteCurricularListScreen
    from './screens/ViewOferecimentoComponenteCurricularListOferecimentoComponenteCurricularListScreen';
import ViewOferecimentoComponenteCurricularListOferecimentoCursoListScreen
    from './screens/ViewOferecimentoComponenteCurricularListOferecimentoCursoListScreen';
import ViewOperacionalFormOperacionalListScreen from './screens/ViewOperacionalFormOperacionalListScreen';
import ViewOperacionalListOperacionalListScreen from './screens/ViewOperacionalListOperacionalListScreen';
import ViewPacoteListPacoteListScreen from './screens/ViewPacoteListPacoteListScreen';
import ViewPagamentoAberturacaixaListScreen from './screens/ViewPagamentoAberturacaixaListScreen';
import ViewPagamentoCaixaentradaListScreen from './screens/ViewPagamentoCaixaentradaListScreen';
import ViewPagamentoCaixasaidaListScreen from './screens/ViewPagamentoCaixasaidaListScreen';
import ViewPagamentoCodigoVerificadorListScreen from './screens/ViewPagamentoCodigoVerificadorListScreen';
import ViewPagamentoEfetuarPagamentoListScreen from './screens/ViewPagamentoEfetuarPagamentoListScreen';
import ViewPagamentoFechamentoCaixaWizardScreen from './screens/ViewPagamentoFechamentoCaixaWizardScreen';
import ViewPagamentoMovimentocaixaListScreen from './screens/ViewPagamentoMovimentocaixaListScreen';
import ViewPagamentoProdutoListScreen from './screens/ViewPagamentoProdutoListScreen';
import ViewPaisFormPaisListScreen from './screens/ViewPaisFormPaisListScreen';
import ViewPaisListPaisListScreen from './screens/ViewPaisListPaisListScreen';
import ViewPerfilColunasPerfilListScreen from './screens/ViewPerfilColunasPerfilListScreen';
import ViewPerfilColunasPerfilModuloListScreen from './screens/ViewPerfilColunasPerfilModuloListScreen';
import ViewPerfilFormPerfilListScreen from './screens/ViewPerfilFormPerfilListScreen';
import ViewPerfilListPerfilListScreen from './screens/ViewPerfilListPerfilListScreen';
import ViewPeriodoFormPeriodoListScreen from './screens/ViewPeriodoFormPeriodoListScreen';
import ViewPeriodoListPeriodoListScreen from './screens/ViewPeriodoListPeriodoListScreen';
import ViewPessoaColunasListScreen from './screens/ViewPessoaColunasListScreen';
import ViewPessoaColunasExibirPessoaFisicaListScreen from './screens/ViewPessoaColunasExibirPessoaFisicaListScreen';
import ViewPessoaColunasExibirPessoaJuridicaListScreen from './screens/ViewPessoaColunasExibirPessoaJuridicaListScreen';
import ViewPessoaColunasPessoaFisicaListScreen from './screens/ViewPessoaColunasPessoaFisicaListScreen';
import ViewPessoaColunasPessoaJuridicaListScreen from './screens/ViewPessoaColunasPessoaJuridicaListScreen';
import ViewPessoaFormPessoaFisicaListScreen from './screens/ViewPessoaFormPessoaFisicaListScreen';
import ViewPessoaFormPessoaJuridicaListScreen from './screens/ViewPessoaFormPessoaJuridicaListScreen';
import ViewPessoaFormPessoaPessoaFisicaListScreen from './screens/ViewPessoaFormPessoaPessoaFisicaListScreen';
import ViewPessoaFormPessoaPessoaJuridicaListScreen from './screens/ViewPessoaFormPessoaPessoaJuridicaListScreen';
import ViewPessoaFormPessoaPessoaUsuarioListScreen from './screens/ViewPessoaFormPessoaPessoaUsuarioListScreen';
import ViewPessoaListDisponibilidadePessoaListScreen from './screens/ViewPessoaListDisponibilidadePessoaListScreen';
import ViewPessoaListPessoaListScreen from './screens/ViewPessoaListPessoaListScreen';
import ViewPessoaListPessoaFisicaListScreen from './screens/ViewPessoaListPessoaFisicaListScreen';
import ViewPessoaListPessoaJuridicaListScreen from './screens/ViewPessoaListPessoaJuridicaListScreen';
import ViewPessoaPessoaDocumentoListScreen from './screens/ViewPessoaPessoaDocumentoListScreen';
import ViewProdutoColunasListScreen from './screens/ViewProdutoColunasListScreen';
import ViewProdutoColunasProdutoCampoListScreen from './screens/ViewProdutoColunasProdutoCampoListScreen';
import ViewProdutoFormProdutoListScreen from './screens/ViewProdutoFormProdutoListScreen';
import ViewProdutoListConfiguracaoProdutoListScreen from './screens/ViewProdutoListConfiguracaoProdutoListScreen';
import ViewProdutoListProdutoListScreen from './screens/ViewProdutoListProdutoListScreen';
import ViewProfessorColunasListScreen from './screens/ViewProfessorColunasListScreen';
import ViewProfessorColunasDisponibilidadeProfessorListScreen
    from './screens/ViewProfessorColunasDisponibilidadeProfessorListScreen';
import ViewProfessorFormProfessorListScreen from './screens/ViewProfessorFormProfessorListScreen';
import ViewProfessorListProfessorListScreen from './screens/ViewProfessorListProfessorListScreen';
import ViewProspectoCadastroProspectoListScreen from './screens/ViewProspectoCadastroProspectoListScreen';
import ViewProspectoControleProspectoListScreen from './screens/ViewProspectoControleProspectoListScreen';
import ViewProspectoEditProspectoListScreen from './screens/ViewProspectoEditProspectoListScreen';
import ViewProspectoListProspectoListScreen from './screens/ViewProspectoListProspectoListScreen';
import ViewProspectoProspectoRadarListScreen from './screens/ViewProspectoProspectoRadarListScreen';
import ViewReferenciaBibliograficaColunasReferenciaBibliograficaListScreen
    from './screens/ViewReferenciaBibliograficaColunasReferenciaBibliograficaListScreen';
import ViewReferenciaBibliograficaFormReferenciaBibliograficaListScreen
    from './screens/ViewReferenciaBibliograficaFormReferenciaBibliograficaListScreen';
import ViewReferenciaBibliograficaListReferenciaBibliograficaListScreen
    from './screens/ViewReferenciaBibliograficaListReferenciaBibliograficaListScreen';
import ViewRegiaoFormRegiaoListScreen from './screens/ViewRegiaoFormRegiaoListScreen';
import ViewRegiaoListRegiaoListScreen from './screens/ViewRegiaoListRegiaoListScreen';
import ViewRelatoriosColunasDashboardListScreen from './screens/ViewRelatoriosColunasDashboardListScreen';
import ViewRelatoriosColunasGraficoListScreen from './screens/ViewRelatoriosColunasGraficoListScreen';
import ViewRelatoriosColunasMapaListScreen from './screens/ViewRelatoriosColunasMapaListScreen';
import ViewRelatoriosColunasOrganogramaListScreen from './screens/ViewRelatoriosColunasOrganogramaListScreen';
import ViewRelatoriosColunasTabelaListScreen from './screens/ViewRelatoriosColunasTabelaListScreen';
import ViewRelatoriosDocumentosListScreen from './screens/ViewRelatoriosDocumentosListScreen';
import ViewRelatoriosExtratorListScreen from './screens/ViewRelatoriosExtratorListScreen';
import ViewRelatoriosFormDashboardListScreen from './screens/ViewRelatoriosFormDashboardListScreen';
import ViewRelatoriosFormGraficoListScreen from './screens/ViewRelatoriosFormGraficoListScreen';
import ViewRelatoriosFormMapaListScreen from './screens/ViewRelatoriosFormMapaListScreen';
import ViewRelatoriosFormOrganogramaListScreen from './screens/ViewRelatoriosFormOrganogramaListScreen';
import ViewRelatoriosFormTabelaListScreen from './screens/ViewRelatoriosFormTabelaListScreen';
import ViewRelatoriosListDashboardListScreen from './screens/ViewRelatoriosListDashboardListScreen';
import ViewRelatoriosListGraficoListScreen from './screens/ViewRelatoriosListGraficoListScreen';
import ViewRelatoriosListMapaListScreen from './screens/ViewRelatoriosListMapaListScreen';
import ViewRelatoriosListOrganogramaListScreen from './screens/ViewRelatoriosListOrganogramaListScreen';
import ViewRelatoriosListTabelaListScreen from './screens/ViewRelatoriosListTabelaListScreen';
import ViewRelatoriosViewDashboardListScreen from './screens/ViewRelatoriosViewDashboardListScreen';
import ViewRelatoriosViewGraficoBarrasHorizontalListScreen
    from './screens/ViewRelatoriosViewGraficoBarrasHorizontalListScreen';
import ViewRelatoriosViewGraficoBarrasVerticalListScreen
    from './screens/ViewRelatoriosViewGraficoBarrasVerticalListScreen';
import ViewRelatoriosViewGraficoCircularListScreen from './screens/ViewRelatoriosViewGraficoCircularListScreen';
import ViewRelatoriosViewGraficoCombinadoListScreen from './screens/ViewRelatoriosViewGraficoCombinadoListScreen';
import ViewRelatoriosViewGraficoLinhasListScreen from './screens/ViewRelatoriosViewGraficoLinhasListScreen';
import ViewRelatoriosViewGraficoPizzaListScreen from './screens/ViewRelatoriosViewGraficoPizzaListScreen';
import ViewRelatoriosViewMapaListScreen from './screens/ViewRelatoriosViewMapaListScreen';
import ViewRelatoriosViewOrganogramaListScreen from './screens/ViewRelatoriosViewOrganogramaListScreen';
import ViewRelatoriosViewTabelaListScreen from './screens/ViewRelatoriosViewTabelaListScreen';
import ViewResultadoColunasResultadoListScreen from './screens/ViewResultadoColunasResultadoListScreen';
import ViewResultadoFormResultadoListScreen from './screens/ViewResultadoFormResultadoListScreen';
import ViewResultadoListResultadoListScreen from './screens/ViewResultadoListResultadoListScreen';
import ViewResultadoCobrancaColunasListScreen from './screens/ViewResultadoCobrancaColunasListScreen';
import ViewResultadoCobrancaFormResultadoCobrancaListScreen
    from './screens/ViewResultadoCobrancaFormResultadoCobrancaListScreen';
import ViewResultadoCobrancaListResultadoCobrancaListScreen
    from './screens/ViewResultadoCobrancaListResultadoCobrancaListScreen';
import ViewResultadoContatoFormResultadoContatoListScreen
    from './screens/ViewResultadoContatoFormResultadoContatoListScreen';
import ViewResultadoContatoListResultadoContatoListScreen
    from './screens/ViewResultadoContatoListResultadoContatoListScreen';
import ViewResultadoLigacaoNapColunasListScreen from './screens/ViewResultadoLigacaoNapColunasListScreen';
import ViewResultadoLigacaoNapFormResultadoLigacaoNapListScreen
    from './screens/ViewResultadoLigacaoNapFormResultadoLigacaoNapListScreen';
import ViewResultadoLigacaoNapListResultadoLigacaoNapListScreen
    from './screens/ViewResultadoLigacaoNapListResultadoLigacaoNapListScreen';
import ViewSalaFormSalaListScreen from './screens/ViewSalaFormSalaListScreen';
import ViewSalaListSalaListScreen from './screens/ViewSalaListSalaListScreen';
import ViewStatusCompromissoColunasStatusCompromissoListScreen
    from './screens/ViewStatusCompromissoColunasStatusCompromissoListScreen';
import ViewStatusCompromissoColunasStatusModulosListScreen
    from './screens/ViewStatusCompromissoColunasStatusModulosListScreen';
import ViewStatusCompromissoFormStatusCompromissoListScreen
    from './screens/ViewStatusCompromissoFormStatusCompromissoListScreen';
import ViewStatusCompromissoListStatusCompromissoListScreen
    from './screens/ViewStatusCompromissoListStatusCompromissoListScreen';
import ViewSubCategoriaFormSubCategoriaListScreen from './screens/ViewSubCategoriaFormSubCategoriaListScreen';
import ViewSubCategoriaListSubCategoriaListScreen from './screens/ViewSubCategoriaListSubCategoriaListScreen';
import ViewSubcategoriaEstoqueListSubCategoriaListScreen
    from './screens/ViewSubcategoriaEstoqueListSubCategoriaListScreen';
import ViewTelefoneColunasTelefoneListScreen from './screens/ViewTelefoneColunasTelefoneListScreen';
import ViewTelefoneFormTelefoneListScreen from './screens/ViewTelefoneFormTelefoneListScreen';
import ViewTelefoneListTelefoneListScreen from './screens/ViewTelefoneListTelefoneListScreen';
import ViewTempoAulaFormTempoAulaListScreen from './screens/ViewTempoAulaFormTempoAulaListScreen';
import ViewTempoAulaListTempoAulaListScreen from './screens/ViewTempoAulaListTempoAulaListScreen';
import ViewTipoAcaoFormTipoAcaoListScreen from './screens/ViewTipoAcaoFormTipoAcaoListScreen';
import ViewTipoAcaoListTipoAcaoListScreen from './screens/ViewTipoAcaoListTipoAcaoListScreen';
import ViewTipoAgendaFormTipoAgendaListScreen from './screens/ViewTipoAgendaFormTipoAgendaListScreen';
import ViewTipoAgendaListTipoAgendaListScreen from './screens/ViewTipoAgendaListTipoAgendaListScreen';
import ViewTipoAtividadeFormTipoAtividadeListScreen from './screens/ViewTipoAtividadeFormTipoAtividadeListScreen';
import ViewTipoAtividadeListTipoAtividadeListScreen from './screens/ViewTipoAtividadeListTipoAtividadeListScreen';
import ViewTipoCanalFormTipoCanalListScreen from './screens/ViewTipoCanalFormTipoCanalListScreen';
import ViewTipoCanalListTipoCanalListScreen from './screens/ViewTipoCanalListTipoCanalListScreen';
import ViewTipoContratoFormTipoContratoListScreen from './screens/ViewTipoContratoFormTipoContratoListScreen';
import ViewTipoContratoListTipoContratoListScreen from './screens/ViewTipoContratoListTipoContratoListScreen';
import ViewTipoCursoColunasListScreen from './screens/ViewTipoCursoColunasListScreen';
import ViewTipoCursoFormTipoCursoListScreen from './screens/ViewTipoCursoFormTipoCursoListScreen';
import ViewTipoCursoListTipoCursoListScreen from './screens/ViewTipoCursoListTipoCursoListScreen';
import ViewTipoHistoricoFormTipoHistoricoListScreen from './screens/ViewTipoHistoricoFormTipoHistoricoListScreen';
import ViewTipoHistoricoListTipoHistoricoListScreen from './screens/ViewTipoHistoricoListTipoHistoricoListScreen';
import ViewTipoPagamentoColunasTipoPagamentoListScreen from './screens/ViewTipoPagamentoColunasTipoPagamentoListScreen';
import ViewTipoPagamentoFormTipoPagamentoListScreen from './screens/ViewTipoPagamentoFormTipoPagamentoListScreen';
import ViewTipoPagamentoListTipoPagamentoListScreen from './screens/ViewTipoPagamentoListTipoPagamentoListScreen';
import ViewTipoPausaFormTipoPausaListScreen from './screens/ViewTipoPausaFormTipoPausaListScreen';
import ViewTipoPausaListTipoPausaListScreen from './screens/ViewTipoPausaListTipoPausaListScreen';
import ViewTipoSalaFormTipoSalaListScreen from './screens/ViewTipoSalaFormTipoSalaListScreen';
import ViewTipoSalaListTipoSalaListScreen from './screens/ViewTipoSalaListTipoSalaListScreen';
import ViewTipoTelefoneFormTipoTelefoneListScreen from './screens/ViewTipoTelefoneFormTipoTelefoneListScreen';
import ViewTipoTelefoneListTipoTelefoneListScreen from './screens/ViewTipoTelefoneListTipoTelefoneListScreen';
import ViewTipoUnidadeFormTipoUnidadeListScreen from './screens/ViewTipoUnidadeFormTipoUnidadeListScreen';
import ViewTipoUnidadeListTipoUnidadeListScreen from './screens/ViewTipoUnidadeListTipoUnidadeListScreen';
import ViewTurmaColunasTurmaListScreen from './screens/ViewTurmaColunasTurmaListScreen';
import ViewTurmaFormAjusteCalendarioListScreen from './screens/ViewTurmaFormAjusteCalendarioListScreen';
import ViewTurmaListTurmaListScreen from './screens/ViewTurmaListTurmaListScreen';
import ViewTurmaListTurmaFinalizandoListScreen from './screens/ViewTurmaListTurmaFinalizandoListScreen';
import ViewTurmaRecriarCalendarioAcademicoListScreen from './screens/ViewTurmaRecriarCalendarioAcademicoListScreen';
import ViewTurnoFormTurnoListScreen from './screens/ViewTurnoFormTurnoListScreen';
import ViewTurnoListTurnoListScreen from './screens/ViewTurnoListTurnoListScreen';
import ViewTurnoEducacaoColunasTurnoEducacaoListScreen from './screens/ViewTurnoEducacaoColunasTurnoEducacaoListScreen';
import ViewTurnoEducacaoFormTurnoEducacaoListScreen from './screens/ViewTurnoEducacaoFormTurnoEducacaoListScreen';
import ViewTurnoEducacaoListTurnoEducacaoListScreen from './screens/ViewTurnoEducacaoListTurnoEducacaoListScreen';
import ViewTurnoFuncionarioFormTurnoFuncionarioListScreen
    from './screens/ViewTurnoFuncionarioFormTurnoFuncionarioListScreen';
import ViewTurnoFuncionarioListTurnoFuncionarioListScreen
    from './screens/ViewTurnoFuncionarioListTurnoFuncionarioListScreen';
import ViewTurnoTrabalhoColunasTurnoTrabalhoListScreen from './screens/ViewTurnoTrabalhoColunasTurnoTrabalhoListScreen';
import ViewTurnoTrabalhoFormTurnoTrabalhoListScreen from './screens/ViewTurnoTrabalhoFormTurnoTrabalhoListScreen';
import ViewTurnoTrabalhoListTurnoTrabalhoListScreen from './screens/ViewTurnoTrabalhoListTurnoTrabalhoListScreen';
import ViewTurnoUsuarioListTurnoUsuarioListScreen from './screens/ViewTurnoUsuarioListTurnoUsuarioListScreen';
import ViewUnidadeColunasListScreen from './screens/ViewUnidadeColunasListScreen';
import ViewUnidadeColunasRedeListScreen from './screens/ViewUnidadeColunasRedeListScreen';
import ViewUnidadeFormRedeListScreen from './screens/ViewUnidadeFormRedeListScreen';
import ViewUnidadeFormUnidadeListScreen from './screens/ViewUnidadeFormUnidadeListScreen';
import ViewUnidadeListRedeListScreen from './screens/ViewUnidadeListRedeListScreen';
import ViewUnidadeListUnidadeListScreen from './screens/ViewUnidadeListUnidadeListScreen';
import ViewUsuarioCamposUsuarioTabViewListScreen from './screens/ViewUsuarioCamposUsuarioTabViewListScreen';
import ViewUsuarioColunasUsuarioListScreen from './screens/ViewUsuarioColunasUsuarioListScreen';
import ViewUsuarioFormUsuarioListScreen from './screens/ViewUsuarioFormUsuarioListScreen';
import ViewUsuarioFormUsuarioRapidoListScreen from './screens/ViewUsuarioFormUsuarioRapidoListScreen';
import ViewUsuarioListUsuarioListScreen from './screens/ViewUsuarioListUsuarioListScreen';
import ViewValorCursoColunasDescontoListScreen from './screens/ViewValorCursoColunasDescontoListScreen';
import ViewValorCursoColunasRetencoesListScreen from './screens/ViewValorCursoColunasRetencoesListScreen';
import ViewValorCursoColunasTaxaListScreen from './screens/ViewValorCursoColunasTaxaListScreen';
import ViewValorCursoFormValorCursoListScreen from './screens/ViewValorCursoFormValorCursoListScreen';
import ViewValorCursoListValorCursoListScreen from './screens/ViewValorCursoListValorCursoListScreen';
import ViewValorProdutoFormValorProdutoListScreen from './screens/ViewValorProdutoFormValorProdutoListScreen';
import ViewValorProdutoListValorProdutoListScreen from './screens/ViewValorProdutoListValorProdutoListScreen';
import ViewTemaListTemasListScreen from './screens/ViewTemaListTemasListScreen';
import AlunoDashboardScreen from './screens/AlunoDashboardScreen';
import AlunoBoletimScreen from './screens/AlunoBoletimScreen';
import AlunoFrequenciaScreen from './screens/AlunoFrequenciaScreen';
import AlunoFinanceiroScreen from './screens/AlunoFinanceiroScreen';
import AlunoAulasScreen from './screens/AlunoAulasScreen';
import AlunoAvaliacoesScreen from './screens/AlunoAvaliacoesScreen';
import AlunoAvaliacaoResponderScreen from './screens/AlunoAvaliacaoResponderScreen';
import AulaContratoScreen from './screens/AulaContratoScreen';
import AulaOferecimentoScreen from './screens/AulaOferecimentoScreen';
import AulaOcorrenciaScreen from './screens/AulaOcorrenciaScreen';
import AulaAulaScreen from './screens/AulaAulaScreen';
import AulaAlunoScreen from './screens/AulaAlunoScreen';
import MeusDadosScreen from './screens/MeusDadosScreen';
import IconesListScreen from './screens/IconesListScreen';
import AsaasCobrancasListScreen from './screens/AsaasCobrancasListScreen';
import AsaasClientesListScreen from './screens/AsaasClientesListScreen';
import AsaasParcelasListScreen from './screens/AsaasParcelasListScreen';
import CurriculoVagaListScreen from './screens/CurriculoVagaListScreen';
import CurriculoEmpresaListScreen from './screens/CurriculoEmpresaListScreen';
import CurriculoEmpresaUnidadeListScreen from './screens/CurriculoEmpresaUnidadeListScreen';
import CurriculoEntrevistaListScreen from './screens/CurriculoEntrevistaListScreen';
import CurriculoTrabalhoListScreen from './screens/CurriculoTrabalhoListScreen';
import CurriculoCampoListScreen from './screens/CurriculoCampoListScreen';
import CurriculoConfiguracaoListScreen from './screens/CurriculoConfiguracaoListScreen';
import AuditoriaScreen from './screens/AuditoriaScreen';
import ViewConfiguracaoFinanceiraListConfiguracaoFinanceiraListScreen from './screens/ViewConfiguracaoFinanceiraListConfiguracaoFinanceiraListScreen';
import ViewConfiguracaoFinanceiraFormConfiguracaoFinanceiraListScreen from './screens/ViewConfiguracaoFinanceiraFormConfiguracaoFinanceiraListScreen';

const q = new QueryClient();
createRoot(document.getElementById('root')!).render(<QueryClientProvider
    client={q}><AuthProvider><ThemeProvider><PermissionBridge><BrowserRouter><Routes><Route path="/login"
                                                                             element={<LoginScreen/>}/><Route
    element={<ProtectedRoute/>}><Route path="/default" element={
    <DefaultListScreen/>}/><Route path="/auditoria" element={<AuditoriaScreen/>}/><Route path="/view/tema/listTemas"
                                                                                         element={
                                                                                             <ViewTemaListTemasListScreen/>}/>
    <Route path="/view/acao/colunasAcao" element={<ViewAcaoColunasAcaoListScreen/>}/>
    <Route path="/aluno/dashboard" element={<AlunoDashboardScreen/>}/>
    <Route path="/aluno/boletim" element={<AlunoBoletimScreen/>}/>
    <Route path="/aluno/frequencia" element={<AlunoFrequenciaScreen/>}/>
    <Route path="/aluno/financeiro" element={<AlunoFinanceiroScreen/>}/>
    <Route path="/aluno/aulas" element={<AlunoAulasScreen/>}/>
    <Route path="/aluno/avaliacoes" element={<AlunoAvaliacoesScreen/>}/>
    <Route path="/aluno/avaliacao/:id" element={<AlunoAvaliacaoResponderScreen/>}/>
    <Route path="/aluno/aula" element={<AulaContratoScreen/>}/>
    <Route path="/aluno/aula/oferecimentos/:contratoId" element={<AulaOferecimentoScreen/>}/>
    <Route path="/aluno/aula/ocorrencias/:oferecimentoId" element={<AulaOcorrenciaScreen/>}/>
    <Route path="/aluno/aula/aulas/:ocorrenciaId" element={<AulaAulaScreen/>}/>
    <Route path="/aluno/aula/aula/:aulaId" element={<AulaAlunoScreen/>}/>
    <Route path="/meus-dados" element={<MeusDadosScreen/>}/>
    <Route path="/view/acao/colunasAcaoCampo" element={<ViewAcaoColunasAcaoCampoListScreen/>}/>
    <Route path="/view/acao/formAcao" element={<ViewAcaoFormAcaoListScreen/>}/>
    <Route path="/view/acao/listAcao" element={<ViewAcaoListAcaoListScreen/>}/>
    <Route path="/regras/notificacao/list" element={<ViewRegraNotificacaoListRegraListScreen/>}/>
    <Route path="/view/agenda/calendarioAgenda" element={<ViewAgendaCompromissosScreen/>}/>
    <Route path="/view/agenda/colunas" element={<ViewAgendaColunasListScreen/>}/>
    <Route path="/view/agenda/colunasUsuarioAgenda" element={<ViewAgendaColunasUsuarioAgendaListScreen/>}/>
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
    <Route path="/view/auditoria/listAuditoriaHistorico" element={<ViewAuditoriaListAuditoriaHistoricoListScreen/>}/>
    <Route path="/view/bairro/formBairro" element={<ViewBairroFormBairroListScreen/>}/>
    <Route path="/view/bairro/listBairro" element={<ViewBairroListBairroListScreen/>}/>
    <Route path="/view/bandeira/formBandeira" element={<ViewBandeiraFormBandeiraListScreen/>}/>
    <Route path="/view/bandeira/listBandeira" element={<ViewBandeiraListBandeiraListScreen/>}/>
    <Route path="/view/baseTecnologica/colunasBaseTecnologica"
           element={<ViewBaseTecnologicaColunasBaseTecnologicaListScreen/>}/>
    <Route path="/view/baseTecnologica/formBaseTecnologica"
           element={<ViewBaseTecnologicaFormBaseTecnologicaListScreen/>}/>
    <Route path="/view/baseTecnologica/listBaseTecnologica"
           element={<ViewBaseTecnologicaListBaseTecnologicaListScreen/>}/>
    <Route path="/view/caixa/formCaixa" element={<ViewCaixaFormCaixaListScreen/>}/>
    <Route path="/view/caixa/listCaixa" element={<ViewCaixaListCaixaListScreen/>}/>
    <Route path="/view/campanha/colunasAcaoDeCampanha" element={<ViewCampanhaColunasAcaoDeCampanhaListScreen/>}/>
    <Route path="/view/campanha/colunasFiltro" element={<ViewCampanhaColunasFiltroListScreen/>}/>
    <Route path="/view/campanha/formCampanha" element={<ViewCampanhaFormCampanhaListScreen/>}/>
    <Route path="/view/campanha/formDirecionamento" element={<ViewCampanhaFormDirecionamentoListScreen/>}/>
    <Route path="/view/campanha/formGerarPacotes" element={<ViewCampanhaFormGerarPacotesListScreen/>}/>
    <Route path="/view/campanha/listCampanha" element={<ViewCampanhaListCampanhaListScreen/>}/>
    <Route path="/view/campanhaNegociacao/formCampanhaNegociacao"
           element={<ViewCampanhaNegociacaoFormCampanhaNegociacaoListScreen/>}/>
    <Route path="/view/campanhaNegociacao/listCampanhaNegociacao"
           element={<ViewCampanhaNegociacaoListCampanhaNegociacaoListScreen/>}/>
    <Route path="/view/campo/colunasCampo" element={<ViewCampoColunasCampoListScreen/>}/>
    <Route path="/view/campo/formCampo" element={<ViewCampoFormCampoListScreen/>}/>
    <Route path="/view/campo/listCampo" element={<ViewCampoListCampoListScreen/>}/>
    <Route path="/view/cancelamento/colunasPreCancelamento"
           element={<ViewCancelamentoColunasPreCancelamentoListScreen/>}/>
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
    <Route path="/view/cobranca/colunasCompromisso" element={<ViewCobrancaColunasCompromissoListScreen/>}/>
    <Route path="/view/cobranca/colunasEmail" element={<ViewCobrancaColunasEmailListScreen/>}/>
    <Route path="/view/cobranca/colunasLigacao" element={<ViewCobrancaColunasLigacaoListScreen/>}/>
    <Route path="/view/cobranca/colunasParcelas" element={<ViewCobrancaColunasParcelasListScreen/>}/>
    <Route path="/view/cobranca/colunasPrioritario" element={<ViewCobrancaColunasPrioritarioListScreen/>}/>
    <Route path="/view/cobranca/formLigacaoCobranca" element={<ViewCobrancaFormLigacaoCobrancaListScreen/>}/>
    <Route path="/view/cobranca/listGerirCobranca" element={<ViewCobrancaListGerirCobrancaListScreen/>}/>
    <Route path="/view/cobranca/listLigacaoCobranca" element={<ViewCobrancaListLigacaoCobrancaListScreen/>}/>
    <Route path="/view/cobranca/listLote" element={<ViewCobrancaListLoteListScreen/>}/>
    <Route path="/view/componenteCurricular/colunasComponenteCurricular"
           element={<ViewComponenteCurricularColunasComponenteCurricularListScreen/>}/>
    <Route path="/view/componenteCurricular/formComponenteCurricular"
           element={<ViewComponenteCurricularFormComponenteCurricularListScreen/>}/>
    <Route path="/view/componenteCurricular/listComponenteCurricular"
           element={<ViewComponenteCurricularListComponenteCurricularListScreen/>}/>
    <Route path="/view/compromisso/abasMatricula" element={<ViewCompromissoAbasMatriculaListScreen/>}/>
    <Route path="/view/compromisso/colunasCompromisso" element={<ViewCompromissoColunasCompromissoListScreen/>}/>
    <Route path="/view/compromisso/finalizarCompromisso" element={<ViewCompromissoFinalizarCompromissoListScreen/>}/>
    <Route path="/view/compromisso/formCompromisso" element={<ViewCompromissoFormCompromissoListScreen/>}/>
    <Route path="/view/compromisso/formTipoCompromisso" element={<ViewCompromissoFormTipoCompromissoListScreen/>}/>
    <Route path="/view/compromisso/listCompromisso" element={<ViewCompromissoListCompromissoListScreen/>}/>
    <Route path="/view/compromisso/listTipoCompromisso" element={<ViewCompromissoListTipoCompromissoListScreen/>}/>
    <Route path="/view/comunicacao/colunasComunicacao" element={<ViewComunicacaoColunasComunicacaoListScreen/>}/>
    <Route path="/view/comunicacao/colunasComunicacaoMensagem"
           element={<ViewComunicacaoColunasComunicacaoMensagemListScreen/>}/>
    <Route path="/view/comunicacao/formComunicacao" element={<ViewComunicacaoFormComunicacaoListScreen/>}/>
    <Route path="/view/comunicacao/formComunicacaoMensagem"
           element={<ViewComunicacaoFormComunicacaoMensagemListScreen/>}/>
    <Route path="/view/comunicacao/listComunicacao" element={<ViewComunicacaoListComunicacaoListScreen/>}/>
    <Route path="/view/comunicacao/listComunicacaoMensagem"
           element={<ViewComunicacaoListComunicacaoMensagemListScreen/>}/>
    <Route path="/view/configuracao/colunasMarketingCampo"
           element={<ViewConfiguracaoColunasMarketingCampoListScreen/>}/>
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
    <Route path="/view/consultor/consultor" element={<ViewConsultorConsultorListScreen/>}/>
    <Route path="/view/consultor/formConsultor" element={<ViewConsultorFormConsultorListScreen/>}/>
    <Route path="/view/consultor/listConsultor" element={<ViewConsultorListConsultorListScreen/>}/>
    <Route path="/view/conta/controlePagamento" element={<ViewContaControlePagamentoListScreen/>}/>
    <Route path="/view/conta/gestaoConta" element={<ViewContaGestaoContaListScreen/>}/>
    <Route path="/view/contaCorrente/formContaCorrente" element={<ViewContaCorrenteFormContaCorrenteListScreen/>}/>
    <Route path="/view/contaCorrente/listContaCorrente" element={<ViewContaCorrenteListContaCorrenteListScreen/>}/>
    <Route path="/view/contrato/colunasContrato" element={<ViewContratoColunasContratoListScreen/>}/>
    <Route path="/view/contrato/formContrato" element={<ViewContratoFormContratoListScreen/>}/>
    <Route path="/view/contrato/listContrato" element={<ViewContratoListContratoListScreen/>}/>
    <Route path="/view/coordenador/colunasAdmin" element={<ViewCoordenadorColunasAdminListScreen/>}/>
    <Route path="/view/coordenador/colunasOperador" element={<ViewCoordenadorColunasOperadorListScreen/>}/>
    <Route path="/view/coordenador/listCoordenador" element={<ViewCoordenadorListCoordenadorListScreen/>}/>
    <Route path="/view/cor/formCores" element={<ViewCorFormCoresListScreen/>}/>
    <Route path="/view/cor/listCores" element={<ViewCorListCoresListScreen/>}/>
    <Route path="/view/cpfalunos/formCpfalunos" element={<ViewCpfalunosFormCpfalunosListScreen/>}/>
    <Route path="/view/cpfalunos/listCpfalunos" element={<ViewCpfalunosListCpfalunosListScreen/>}/>
    <Route path="/view/criterio/listCriterio" element={<ViewCriterioListCriterioListScreen/>}/>
    <Route path="/view/criterio/formCriterio" element={<ViewCriterioListCriterioFormScreen/>}/>
    <Route path="/view/curriculo/colunas" element={<ViewCurriculoColunasListScreen/>}/>
    <Route path="/view/curriculo/colunasMatrizCurricular" element={<ViewCurriculoColunasMatrizCurricularListScreen/>}/>
    <Route path="/view/curriculo/colunasRequisitoMatriz" element={<ViewCurriculoColunasRequisitoMatrizListScreen/>}/>
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
    <Route path="/view/diaSemana/colunasDiaSemana" element={<ViewDiaSemanaColunasDiaSemanaListScreen/>}/>
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
    <Route path="/view/etapasCobranca/colunasEtapasCobranca"
           element={<ViewEtapasCobrancaColunasEtapasCobrancaListScreen/>}/>
    <Route path="/view/etapasCobranca/formEtapasCobranca" element={<ViewEtapasCobrancaFormEtapasCobrancaListScreen/>}/>
    <Route path="/view/etapasCobranca/listEtapasCobranca" element={<ViewEtapasCobrancaListEtapasCobrancaListScreen/>}/>
    <Route path="/view/etapasNap/colunasEtapasNap" element={<ViewEtapasNapColunasEtapasNapListScreen/>}/>
    <Route path="/view/etapasNap/formEtapasNap" element={<ViewEtapasNapFormEtapasNapListScreen/>}/>
    <Route path="/view/etapasNap/listEtapasNap" element={<ViewEtapasNapListEtapasNapListScreen/>}/>
    <Route path="/view/etnia/formEtnia" element={<ViewEtniaFormEtniaListScreen/>}/>
    <Route path="/view/etnia/listEtnia" element={<ViewEtniaListEtniaListScreen/>}/>
    <Route path="/view/favoritoPerfil/colunasFavoritoPerfil"
           element={<ViewFavoritoPerfilColunasFavoritoPerfilListScreen/>}/>
    <Route path="/view/favoritoPerfil/formFavoritoPerfil" element={<ViewFavoritoPerfilFormFavoritoPerfilListScreen/>}/>
    <Route path="/view/favoritoPerfil/listFavoritoPerfil" element={<ViewFavoritoPerfilListFavoritoPerfilListScreen/>}/>
    <Route path="/view/favoritoUsuario/formFavoritoUsuario"
           element={<ViewFavoritoUsuarioFormFavoritoUsuarioListScreen/>}/>
    <Route path="/view/favoritoUsuario/listFavoritoUsuario"
           element={<ViewFavoritoUsuarioListFavoritoUsuarioListScreen/>}/>
    <Route path="/view/feriado/formFeriado" element={<ViewFeriadoFormFeriadoListScreen/>}/>
    <Route path="/view/feriado/listFeriado" element={<ViewFeriadoListFeriadoListScreen/>}/>
    <Route path="/view/filtros/colunas" element={<ViewFiltrosColunasListScreen/>}/>
    <Route path="/view/filtros/formFiltros" element={<ViewFiltrosFormFiltrosListScreen/>}/>
    <Route path="/view/filtros/listFiltros" element={<ViewFiltrosListFiltrosListScreen/>}/>
    <Route path="/view/fornecedor/colunasFornecedores" element={<ViewFornecedorColunasFornecedoresListScreen/>}/>
    <Route path="/view/fornecedor/formFornecedor" element={<ViewFornecedorFormFornecedorListScreen/>}/>
    <Route path="/view/fornecedor/listFornecedor" element={<ViewFornecedorListFornecedorListScreen/>}/>
    <Route path="/view/funcao/formFuncao" element={<ViewFuncaoFormFuncaoListScreen/>}/>
    <Route path="/view/funcao/listFuncao" element={<ViewFuncaoListFuncaoListScreen/>}/>
    <Route path="/view/gestaoAluno/colunasHistoricoAluno" element={<ViewGestaoAlunoColunasHistoricoAlunoListScreen/>}/>
    <Route path="/view/gestaoAluno/colunasParcela" element={<ViewGestaoAlunoColunasParcelaListScreen/>}/>
    <Route path="/view/gestaoAluno/colunasParcelaAlterar" element={<ViewGestaoAlunoColunasParcelaAlterarListScreen/>}/>
    <Route path="/view/gestaoAluno/gestaoAluno" element={<ViewGestaoAlunoGestaoAlunoListScreen/>}/>
    <Route path="/view/gestaoAluno/listHistoricoAluno" element={<ViewGestaoAlunoListHistoricoAlunoListScreen/>}/>
    <Route path="/view/gestaoProfessor/gestaoProfessor" element={<ViewGestaoProfessorGestaoProfessorListScreen/>}/>
    <Route path="/view/avaliacao/criar" element={<ViewCriarPerguntaScreen/>}/>
    <Route path="/view/genero/listGenero" element={<ViewGeneroListGeneroListScreen/>}/>
    <Route path="/view/grau/formGrau" element={<ViewGrauFormGrauListScreen/>}/>
    <Route path="/view/grau/listGrau" element={<ViewGrauListGrauListScreen/>}/>
    <Route path="/view/grupo/colunas" element={<ViewGrupoColunasListScreen/>}/>
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
    <Route path="/view/ligacao/colunasLigacao" element={<ViewLigacaoColunasLigacaoListScreen/>}/>
    <Route path="/view/ligacao/ligacao" element={<ViewLigacaoLigacaoListScreen/>}/>
    <Route path="/view/login/login" element={<ViewLoginLoginListScreen/>}/>
    <Route path="/view/logradouro/formLogradouro" element={<ViewLogradouroFormLogradouroListScreen/>}/>
    <Route path="/view/logradouro/listLogradouro" element={<ViewLogradouroListLogradouroListScreen/>}/>
    <Route path="/view/marca/listMarca" element={<ViewMarcaListMarcaListScreen/>}/>
    <Route path="/view/matricula/abasMatricula" element={<ViewMatriculaAbasMatriculaListScreen/>}/>
    <Route path="/view/matricula/colunasCentrais" element={<ViewMatriculaColunasCentraisListScreen/>}/>
    <Route path="/view/matricula/colunasContrato" element={<ViewMatriculaColunasContratoListScreen/>}/>
    <Route path="/view/matricula/colunasPessoa" element={<ViewMatriculaColunasPessoaListScreen/>}/>
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
    <Route path="/view/modulo/colunasModulo" element={<ViewModuloColunasModuloListScreen/>}/>
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
    <Route path="/view/nap/colunasCaderno" element={<ViewNapColunasCadernoListScreen/>}/>
    <Route path="/view/nap/colunasCadernoPrioritaria" element={<ViewNapColunasCadernoPrioritariaListScreen/>}/>
    <Route path="/view/nap/colunasCompromisso" element={<ViewNapColunasCompromissoListScreen/>}/>
    <Route path="/view/nap/colunasEmail" element={<ViewNapColunasEmailListScreen/>}/>
    <Route path="/view/nap/colunasLigacao" element={<ViewNapColunasLigacaoListScreen/>}/>
    <Route path="/view/nap/colunasPrioritario" element={<ViewNapColunasPrioritarioListScreen/>}/>
    <Route path="/view/nap/formLigacaoNap" element={<ViewNapFormLigacaoNapListScreen/>}/>
    <Route path="/view/nap/listGerirNap" element={<ViewNapListGerirNapListScreen/>}/>
    <Route path="/view/nap/listLigacaoNap" element={<ViewNapListLigacaoNapListScreen/>}/>
    <Route path="/view/nap/listLote" element={<ViewNapListLoteListScreen/>}/>
    <Route path="/view/oferecimentoComponenteCurricular/colunasDiaAula"
           element={<ViewOferecimentoComponenteCurricularColunasDiaAulaListScreen/>}/>
    <Route path="/view/oferecimentoComponenteCurricular/colunasInfoOcorrencia"
           element={<ViewOferecimentoComponenteCurricularColunasInfoOcorrenciaListScreen/>}/>
    <Route path="/view/oferecimentoComponenteCurricular/colunasOferecimento"
           element={<ViewOferecimentoComponenteCurricularColunasOferecimentoListScreen/>}/>
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
    <Route path="/view/pagamento/aberturacaixa" element={<ViewPagamentoAberturacaixaListScreen/>}/>
    <Route path="/view/pagamento/caixaentrada" element={<ViewPagamentoCaixaentradaListScreen/>}/>
    <Route path="/view/pagamento/caixasaida" element={<ViewPagamentoCaixasaidaListScreen/>}/>
    <Route path="/view/pagamento/codigoVerificador" element={<ViewPagamentoCodigoVerificadorListScreen/>}/>
    <Route path="/view/pagamento/efetuarPagamento" element={<ViewPagamentoEfetuarPagamentoListScreen/>}/>
    <Route path="/view/pagamento/fechamentoCaixa" element={<ViewPagamentoFechamentoCaixaWizardScreen/>}/>
    <Route path="/view/pagamento/movimentocaixa" element={<ViewPagamentoMovimentocaixaListScreen/>}/>
    <Route path="/view/pagamento/produto" element={<ViewPagamentoProdutoListScreen/>}/>
    <Route path="/view/pais/formPais" element={<ViewPaisFormPaisListScreen/>}/>
    <Route path="/view/pais/listPais" element={<ViewPaisListPaisListScreen/>}/>
    <Route path="/view/perfil/colunasPerfil" element={<ViewPerfilColunasPerfilListScreen/>}/>
    <Route path="/view/perfil/colunasPerfilModulo" element={<ViewPerfilColunasPerfilModuloListScreen/>}/>
    <Route path="/view/perfil/formPerfil" element={<ViewPerfilFormPerfilListScreen/>}/>
    <Route path="/view/perfil/listPerfil" element={<ViewPerfilListPerfilListScreen/>}/>
    <Route path="/view/periodo/formPeriodo" element={<ViewPeriodoFormPeriodoListScreen/>}/>
    <Route path="/view/periodo/listPeriodo" element={<ViewPeriodoListPeriodoListScreen/>}/>
    <Route path="/view/pessoa/colunas" element={<ViewPessoaColunasListScreen/>}/>
    <Route path="/view/pessoa/colunasExibirPessoaFisica" element={<ViewPessoaColunasExibirPessoaFisicaListScreen/>}/>
    <Route path="/view/pessoa/colunasExibirPessoaJuridica"
           element={<ViewPessoaColunasExibirPessoaJuridicaListScreen/>}/>
    <Route path="/view/pessoa/colunasPessoaFisica" element={<ViewPessoaColunasPessoaFisicaListScreen/>}/>
    <Route path="/view/pessoa/colunasPessoaJuridica" element={<ViewPessoaColunasPessoaJuridicaListScreen/>}/>
    <Route path="/view/pessoa/formPessoaFisica" element={<ViewPessoaFormPessoaFisicaListScreen/>}/>
    <Route path="/view/pessoa/formPessoaJuridica" element={<ViewPessoaFormPessoaJuridicaListScreen/>}/>
    <Route path="/view/pessoa/formPessoaPessoaFisica" element={<ViewPessoaFormPessoaPessoaFisicaListScreen/>}/>
    <Route path="/view/pessoa/formPessoaPessoaJuridica" element={<ViewPessoaFormPessoaPessoaJuridicaListScreen/>}/>
    <Route path="/view/pessoa/formPessoaPessoaUsuario" element={<ViewPessoaFormPessoaPessoaUsuarioListScreen/>}/>
    <Route path="/view/pessoa/listDisponibilidadePessoa" element={<ViewPessoaListDisponibilidadePessoaListScreen/>}/>
    <Route path="/view/pessoa/listPessoa" element={<ViewPessoaListPessoaListScreen/>}/>
    <Route path="/view/pessoa/listPessoaFisica" element={<ViewPessoaListPessoaFisicaListScreen/>}/>
    <Route path="/view/pessoa/listPessoaJuridica" element={<ViewPessoaListPessoaJuridicaListScreen/>}/>
    <Route path="/view/pessoa/pessoaDocumento" element={<ViewPessoaPessoaDocumentoListScreen/>}/>
    <Route path="/view/produto/colunas" element={<ViewProdutoColunasListScreen/>}/>
    <Route path="/view/produto/colunasProdutoCampo" element={<ViewProdutoColunasProdutoCampoListScreen/>}/>
    <Route path="/view/produto/formProduto" element={<ViewProdutoFormProdutoListScreen/>}/>
    <Route path="/view/produto/listConfiguracaoProduto" element={<ViewProdutoListConfiguracaoProdutoListScreen/>}/>
    <Route path="/view/produto/listProduto" element={<ViewProdutoListProdutoListScreen/>}/>
    <Route path="/view/professor/colunas" element={<ViewProfessorColunasListScreen/>}/>
    <Route path="/view/professor/colunasDisponibilidadeProfessor"
           element={<ViewProfessorColunasDisponibilidadeProfessorListScreen/>}/>
    <Route path="/view/professor/formProfessor" element={<ViewProfessorFormProfessorListScreen/>}/>
    <Route path="/view/professor/listProfessor" element={<ViewProfessorListProfessorListScreen/>}/>
    <Route path="/view/prospecto/cadastroProspecto" element={<ViewProspectoCadastroProspectoListScreen/>}/>
    <Route path="/view/prospecto/controleProspecto" element={<ViewProspectoControleProspectoListScreen/>}/>
    <Route path="/view/prospecto/editProspecto" element={<ViewProspectoEditProspectoListScreen/>}/>
    <Route path="/view/prospecto/listProspecto" element={<ViewProspectoListProspectoListScreen/>}/>
    <Route path="/view/prospecto/prospectoRadar" element={<ViewProspectoProspectoRadarListScreen/>}/>
    <Route path="/view/referenciaBibliografica/colunasReferenciaBibliografica"
           element={<ViewReferenciaBibliograficaColunasReferenciaBibliograficaListScreen/>}/>
    <Route path="/view/referenciaBibliografica/formReferenciaBibliografica"
           element={<ViewReferenciaBibliograficaFormReferenciaBibliograficaListScreen/>}/>
    <Route path="/view/referenciaBibliografica/listReferenciaBibliografica"
           element={<ViewReferenciaBibliograficaListReferenciaBibliograficaListScreen/>}/>
    <Route path="/view/regiao/formRegiao" element={<ViewRegiaoFormRegiaoListScreen/>}/>
    <Route path="/view/regiao/listRegiao" element={<ViewRegiaoListRegiaoListScreen/>}/>
    <Route path="/view/relatorios/colunasDashboard" element={<ViewRelatoriosColunasDashboardListScreen/>}/>
    <Route path="/view/relatorios/colunasGrafico" element={<ViewRelatoriosColunasGraficoListScreen/>}/>
    <Route path="/view/relatorios/colunasMapa" element={<ViewRelatoriosColunasMapaListScreen/>}/>
    <Route path="/view/relatorios/colunasOrganograma" element={<ViewRelatoriosColunasOrganogramaListScreen/>}/>
    <Route path="/view/relatorios/colunasTabela" element={<ViewRelatoriosColunasTabelaListScreen/>}/>
    <Route path="/view/relatorios/documentos" element={<ViewRelatoriosDocumentosListScreen/>}/>
    <Route path="/view/relatorios/extrator" element={<ViewRelatoriosExtratorListScreen/>}/>
    <Route path="/view/relatorios/formDashboard" element={<ViewRelatoriosFormDashboardListScreen/>}/>
    <Route path="/view/relatorios/formGrafico" element={<ViewRelatoriosFormGraficoListScreen/>}/>
    <Route path="/view/relatorios/formMapa" element={<ViewRelatoriosFormMapaListScreen/>}/>
    <Route path="/view/relatorios/formOrganograma" element={<ViewRelatoriosFormOrganogramaListScreen/>}/>
    <Route path="/view/relatorios/formTabela" element={<ViewRelatoriosFormTabelaListScreen/>}/>
    <Route path="/view/relatorios/listDashboard" element={<ViewRelatoriosListDashboardListScreen/>}/>
    <Route path="/view/relatorios/listGrafico" element={<ViewRelatoriosListGraficoListScreen/>}/>
    <Route path="/view/relatorios/listMapa" element={<ViewRelatoriosListMapaListScreen/>}/>
    <Route path="/view/relatorios/listOrganograma" element={<ViewRelatoriosListOrganogramaListScreen/>}/>
    <Route path="/view/relatorios/listTabela" element={<ViewRelatoriosListTabelaListScreen/>}/>
    <Route path="/view/relatorios/viewDashboard" element={<ViewRelatoriosViewDashboardListScreen/>}/>
    <Route path="/view/relatorios/viewGraficoBarrasHorizontal"
           element={<ViewRelatoriosViewGraficoBarrasHorizontalListScreen/>}/>
    <Route path="/view/relatorios/viewGraficoBarrasVertical"
           element={<ViewRelatoriosViewGraficoBarrasVerticalListScreen/>}/>
    <Route path="/view/relatorios/viewGraficoCircular" element={<ViewRelatoriosViewGraficoCircularListScreen/>}/>
    <Route path="/view/relatorios/viewGraficoCombinado" element={<ViewRelatoriosViewGraficoCombinadoListScreen/>}/>
    <Route path="/view/relatorios/viewGraficoLinhas" element={<ViewRelatoriosViewGraficoLinhasListScreen/>}/>
    <Route path="/view/relatorios/viewGraficoPizza" element={<ViewRelatoriosViewGraficoPizzaListScreen/>}/>
    <Route path="/view/relatorios/viewMapa" element={<ViewRelatoriosViewMapaListScreen/>}/>
    <Route path="/view/relatorios/viewOrganograma" element={<ViewRelatoriosViewOrganogramaListScreen/>}/>
    <Route path="/view/relatorios/viewTabela" element={<ViewRelatoriosViewTabelaListScreen/>}/>
    <Route path="/view/resultado/colunasResultado" element={<ViewResultadoColunasResultadoListScreen/>}/>
    <Route path="/view/resultado/formResultado" element={<ViewResultadoFormResultadoListScreen/>}/>
    <Route path="/view/resultado/listResultado" element={<ViewResultadoListResultadoListScreen/>}/>
    <Route path="/view/resultadoCobranca/colunas" element={<ViewResultadoCobrancaColunasListScreen/>}/>
    <Route path="/view/resultadoCobranca/formResultadoCobranca"
           element={<ViewResultadoCobrancaFormResultadoCobrancaListScreen/>}/>
    <Route path="/view/resultadoCobranca/listResultadoCobranca"
           element={<ViewResultadoCobrancaListResultadoCobrancaListScreen/>}/>
    <Route path="/view/resultadoContato/formResultadoContato"
           element={<ViewResultadoContatoFormResultadoContatoListScreen/>}/>
    <Route path="/view/resultadoContato/listResultadoContato"
           element={<ViewResultadoContatoListResultadoContatoListScreen/>}/>
    <Route path="/view/resultadoLigacaoNap/colunas" element={<ViewResultadoLigacaoNapColunasListScreen/>}/>
    <Route path="/view/resultadoLigacaoNap/formResultadoLigacaoNap"
           element={<ViewResultadoLigacaoNapFormResultadoLigacaoNapListScreen/>}/>
    <Route path="/view/resultadoLigacaoNap/listResultadoLigacaoNap"
           element={<ViewResultadoLigacaoNapListResultadoLigacaoNapListScreen/>}/>
    <Route path="/view/sala/formSala" element={<ViewSalaFormSalaListScreen/>}/>
    <Route path="/view/sala/listSala" element={<ViewSalaListSalaListScreen/>}/>
    <Route path="/view/statusCompromisso/colunasStatusCompromisso"
           element={<ViewStatusCompromissoColunasStatusCompromissoListScreen/>}/>
    <Route path="/view/statusCompromisso/colunasStatusModulos"
           element={<ViewStatusCompromissoColunasStatusModulosListScreen/>}/>
    <Route path="/view/statusCompromisso/formStatusCompromisso"
           element={<ViewStatusCompromissoFormStatusCompromissoListScreen/>}/>
    <Route path="/view/statusCompromisso/listStatusCompromisso"
           element={<ViewStatusCompromissoListStatusCompromissoListScreen/>}/>
    <Route path="/view/subCategoria/formSubCategoria" element={<ViewSubCategoriaFormSubCategoriaListScreen/>}/>
    <Route path="/view/subCategoria/listSubCategoria" element={<ViewSubCategoriaListSubCategoriaListScreen/>}/>
    <Route path="/view/subcategoriaEstoque/listSubCategoria"
           element={<ViewSubcategoriaEstoqueListSubCategoriaListScreen/>}/>
    <Route path="/view/telefone/colunasTelefone" element={<ViewTelefoneColunasTelefoneListScreen/>}/>
    <Route path="/view/telefone/formTelefone" element={<ViewTelefoneFormTelefoneListScreen/>}/>
    <Route path="/view/telefone/listTelefone" element={<ViewTelefoneListTelefoneListScreen/>}/>
    <Route path="/view/tempoAula/formTempoAula" element={<ViewTempoAulaFormTempoAulaListScreen/>}/>
    <Route path="/view/tempoAula/listTempoAula" element={<ViewTempoAulaListTempoAulaListScreen/>}/>
    <Route path="/view/tipoAcao/formTipoAcao" element={<ViewTipoAcaoFormTipoAcaoListScreen/>}/>
    <Route path="/view/tipoAcao/listTipoAcao" element={<ViewTipoAcaoListTipoAcaoListScreen/>}/>
    <Route path="/view/tipoAgenda/formTipoAgenda" element={<ViewTipoAgendaFormTipoAgendaListScreen/>}/>
    <Route path="/view/tipoAgenda/listTipoAgenda" element={<ViewTipoAgendaListTipoAgendaListScreen/>}/>
    <Route path="/view/tipoAtividade/formTipoAtividade" element={<ViewTipoAtividadeFormTipoAtividadeListScreen/>}/>
    <Route path="/view/tipoAtividade/listTipoAtividade" element={<ViewTipoAtividadeListTipoAtividadeListScreen/>}/>
    <Route path="/view/tipoCanal/formTipoCanal" element={<ViewTipoCanalFormTipoCanalListScreen/>}/>
    <Route path="/view/tipoCanal/listTipoCanal" element={<ViewTipoCanalListTipoCanalListScreen/>}/>
    <Route path="/view/tipoContrato/formTipoContrato" element={<ViewTipoContratoFormTipoContratoListScreen/>}/>
    <Route path="/view/tipoContrato/listTipoContrato" element={<ViewTipoContratoListTipoContratoListScreen/>}/>
    <Route path="/view/tipoCurso/colunas" element={<ViewTipoCursoColunasListScreen/>}/>
    <Route path="/view/tipoCurso/formTipoCurso" element={<ViewTipoCursoFormTipoCursoListScreen/>}/>
    <Route path="/view/tipoCurso/listTipoCurso" element={<ViewTipoCursoListTipoCursoListScreen/>}/>
    <Route path="/view/tipoHistorico/formTipoHistorico" element={<ViewTipoHistoricoFormTipoHistoricoListScreen/>}/>
    <Route path="/view/tipoHistorico/listTipoHistorico" element={<ViewTipoHistoricoListTipoHistoricoListScreen/>}/>
    <Route path="/view/tipoPagamento/colunasTipoPagamento"
           element={<ViewTipoPagamentoColunasTipoPagamentoListScreen/>}/>
    <Route path="/view/tipoPagamento/formTipoPagamento" element={<ViewTipoPagamentoFormTipoPagamentoListScreen/>}/>
    <Route path="/view/tipoPagamento/listTipoPagamento" element={<ViewTipoPagamentoListTipoPagamentoListScreen/>}/>
    <Route path="/view/tipoPausa/formTipoPausa" element={<ViewTipoPausaFormTipoPausaListScreen/>}/>
    <Route path="/view/tipoPausa/listTipoPausa" element={<ViewTipoPausaListTipoPausaListScreen/>}/>
    <Route path="/view/tipoSala/formTipoSala" element={<ViewTipoSalaFormTipoSalaListScreen/>}/>
    <Route path="/view/tipoSala/listTipoSala" element={<ViewTipoSalaListTipoSalaListScreen/>}/>
    <Route path="/view/tipoTelefone/formTipoTelefone" element={<ViewTipoTelefoneFormTipoTelefoneListScreen/>}/>
    <Route path="/view/tipoTelefone/listTipoTelefone" element={<ViewTipoTelefoneListTipoTelefoneListScreen/>}/>
    <Route path="/view/tipoUnidade/formTipoUnidade" element={<ViewTipoUnidadeFormTipoUnidadeListScreen/>}/>
    <Route path="/view/tipoUnidade/listTipoUnidade" element={<ViewTipoUnidadeListTipoUnidadeListScreen/>}/>
    <Route path="/view/turma/colunasTurma" element={<ViewTurmaColunasTurmaListScreen/>}/>
    <Route path="/view/turma/formAjusteCalendario" element={<ViewTurmaFormAjusteCalendarioListScreen/>}/>
    <Route path="/view/turma/listTurma" element={<ViewTurmaListTurmaListScreen/>}/>
    <Route path="/view/turma/listTurmaFinalizando" element={<ViewTurmaListTurmaFinalizandoListScreen/>}/>
    <Route path="/view/turma/recriarCalendarioAcademico" element={<ViewTurmaRecriarCalendarioAcademicoListScreen/>}/>
    <Route path="/view/turno/formTurno" element={<ViewTurnoFormTurnoListScreen/>}/>
    <Route path="/view/turno/listTurno" element={<ViewTurnoListTurnoListScreen/>}/>
    <Route path="/view/turnoEducacao/colunasTurnoEducacao"
           element={<ViewTurnoEducacaoColunasTurnoEducacaoListScreen/>}/>
    <Route path="/view/turnoEducacao/formTurnoEducacao" element={<ViewTurnoEducacaoFormTurnoEducacaoListScreen/>}/>
    <Route path="/view/turnoEducacao/listTurnoEducacao" element={<ViewTurnoEducacaoListTurnoEducacaoListScreen/>}/>
    <Route path="/view/turnoFuncionario/formTurnoFuncionario"
           element={<ViewTurnoFuncionarioFormTurnoFuncionarioListScreen/>}/>
    <Route path="/view/turnoFuncionario/listTurnoFuncionario"
           element={<ViewTurnoFuncionarioListTurnoFuncionarioListScreen/>}/>
    <Route path="/view/turnoTrabalho/colunasTurnoTrabalho"
           element={<ViewTurnoTrabalhoColunasTurnoTrabalhoListScreen/>}/>
    <Route path="/view/turnoTrabalho/formTurnoTrabalho" element={<ViewTurnoTrabalhoFormTurnoTrabalhoListScreen/>}/>
    <Route path="/view/turnoTrabalho/listTurnoTrabalho" element={<ViewTurnoTrabalhoListTurnoTrabalhoListScreen/>}/>
    <Route path="/view/turnoUsuario/listTurnoUsuario" element={<ViewTurnoUsuarioListTurnoUsuarioListScreen/>}/>
    <Route path="/view/unidade/colunas" element={<ViewUnidadeColunasListScreen/>}/>
    <Route path="/view/unidade/colunasRede" element={<ViewUnidadeColunasRedeListScreen/>}/>
    <Route path="/view/unidade/formRede" element={<ViewUnidadeFormRedeListScreen/>}/>
    <Route path="/view/unidade/formUnidade" element={<ViewUnidadeFormUnidadeListScreen/>}/>
    <Route path="/view/unidade/listRede" element={<ViewUnidadeListRedeListScreen/>}/>
    <Route path="/view/unidade/listUnidade" element={<ViewUnidadeListUnidadeListScreen/>}/>
    <Route path="/view/usuario/camposUsuarioTabView" element={<ViewUsuarioCamposUsuarioTabViewListScreen/>}/>
    <Route path="/view/usuario/colunasUsuario" element={<ViewUsuarioColunasUsuarioListScreen/>}/>
    <Route path="/view/usuario/formUsuario" element={<ViewUsuarioFormUsuarioListScreen/>}/>
    <Route path="/view/usuario/formUsuarioRapido" element={<ViewUsuarioFormUsuarioRapidoListScreen/>}/>
    <Route path="/view/usuario/listUsuario" element={<ViewUsuarioListUsuarioListScreen/>}/>
    <Route path="/view/valorCurso/colunasDesconto" element={<ViewValorCursoColunasDescontoListScreen/>}/>
    <Route path="/view/valorCurso/colunasRetencoes" element={<ViewValorCursoColunasRetencoesListScreen/>}/>
    <Route path="/view/valorCurso/colunasTaxa" element={<ViewValorCursoColunasTaxaListScreen/>}/>
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
    <Route path='*' element={<p>Selecione uma tela.</p>}/></Route><Route path="/login" element={<LoginScreen/>}/></Routes></BrowserRouter></PermissionBridge></ThemeProvider></AuthProvider></QueryClientProvider>);