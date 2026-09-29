import React from 'react';
import {AuthProvider, useAuth} from './src/auth';
import {SweetAlertProvider} from './src/shared/components/SweetAlert';
import LoginScreen from './src/LoginScreen';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import DefaultListScreen from './src/screens/DefaultListScreen';
import HomeScreen, {ParamList} from './src/HomeScreen';
import ViewAcaoFormAcaoListScreen from './src/screens/ViewAcaoFormAcaoListScreen';
import ViewAcaoListAcaoListScreen from './src/screens/ViewAcaoListAcaoListScreen';
import ViewAgendaCalendarioAgendaListScreen from './src/screens/ViewAgendaCalendarioAgendaListScreen';
import ViewAgendaFormAgendaListScreen from './src/screens/ViewAgendaFormAgendaListScreen';
import ViewAgendaListAgendaListScreen from './src/screens/ViewAgendaListAgendaListScreen';
import ViewAlterarSenhaAlterarSenhaListScreen from './src/screens/ViewAlterarSenhaAlterarSenhaListScreen';
import ViewApresentacaoListApresentacaoListScreen from './src/screens/ViewApresentacaoListApresentacaoListScreen';
import AuditoriaScreen from './src/screens/AuditoriaScreen';
import ViewArquivoProconListArquivoProconListScreen from './src/screens/ViewArquivoProconListArquivoProconListScreen';
import ViewAtividadeComplementarFormAtividadeComplementarListScreen
    from './src/screens/ViewAtividadeComplementarFormAtividadeComplementarListScreen';
import ViewAtividadeComplementarListAtividadeComplementarListScreen
    from './src/screens/ViewAtividadeComplementarListAtividadeComplementarListScreen';
import ViewAuditoriaFormAuditoriaHistoricoListScreen from './src/screens/ViewAuditoriaFormAuditoriaHistoricoListScreen';
import ViewAuditoriaListAuditoriaListScreen from './src/screens/ViewAuditoriaListAuditoriaListScreen';
import ViewAuditoriaListAuditoriaHistoricoListScreen from './src/screens/ViewAuditoriaListAuditoriaHistoricoListScreen';
import ViewBairroFormBairroListScreen from './src/screens/ViewBairroFormBairroListScreen';
import ViewBairroListBairroListScreen from './src/screens/ViewBairroListBairroListScreen';
import ViewBandeiraFormBandeiraListScreen from './src/screens/ViewBandeiraFormBandeiraListScreen';
import ViewBandeiraListBandeiraListScreen from './src/screens/ViewBandeiraListBandeiraListScreen';
import ViewBaseTecnologicaFormBaseTecnologicaListScreen
    from './src/screens/ViewBaseTecnologicaFormBaseTecnologicaListScreen';
import ViewBaseTecnologicaListBaseTecnologicaListScreen
    from './src/screens/ViewBaseTecnologicaListBaseTecnologicaListScreen';
import ViewCaixaFormCaixaListScreen from './src/screens/ViewCaixaFormCaixaListScreen';
import ViewCaixaListCaixaListScreen from './src/screens/ViewCaixaListCaixaListScreen';
import ViewCampanhaFormCampanhaListScreen from './src/features/marketing/ViewCampanhaFormCampanhaListScreen';
import ViewCampanhaFormDirecionamentoListScreen from './src/features/marketing/ViewCampanhaFormDirecionamentoListScreen';
import ViewCampanhaFormGerarPacotesListScreen from './src/features/marketing/ViewCampanhaFormGerarPacotesListScreen';
import ViewCampanhaListCampanhaListScreen from './src/screens/ViewCampanhaListCampanhaListScreen';
import ViewCampanhaNegociacaoFormCampanhaNegociacaoListScreen
    from './src/features/financeiro/ViewCampanhaNegociacaoFormCampanhaNegociacaoListScreen';
import ViewCampanhaNegociacaoListCampanhaNegociacaoListScreen from './src/features/financeiro/ViewCampanhaNegociacaoListCampanhaNegociacaoListScreen';
import ViewCampoFormCampoListScreen from './src/screens/ViewCampoFormCampoListScreen';
import ViewCampoListCampoListScreen from './src/screens/ViewCampoListCampoListScreen';
import ViewCargaFormCargaListScreen from './src/screens/ViewCargaFormCargaListScreen';
import ViewCargaListCargaListScreen from './src/screens/ViewCargaListCargaListScreen';
import ViewCategoriaFormCategoriaListScreen from './src/screens/ViewCategoriaFormCategoriaListScreen';
import ViewCategoriaListCategoriaListScreen from './src/screens/ViewCategoriaListCategoriaListScreen';
import ViewCategoriaCampoFormCategoriaCampoListScreen
    from './src/screens/ViewCategoriaCampoFormCategoriaCampoListScreen';
import ViewCategoriaCampoListCategoriaCampoListScreen
    from './src/screens/ViewCategoriaCampoListCategoriaCampoListScreen';
import ViewChamadaAssinadaListChamadaAssinadaListScreen
    from './src/screens/ViewChamadaAssinadaListChamadaAssinadaListScreen';
import ViewCidadeFormCidadeListScreen from './src/screens/ViewCidadeFormCidadeListScreen';
import ViewCidadeListCidadeListScreen from './src/screens/ViewCidadeListCidadeListScreen';
import ViewCobrancaFormLigacaoCobrancaListScreen from './src/screens/ViewCobrancaFormLigacaoCobrancaListScreen';
import ViewCobrancaListGerirCobrancaListScreen from './src/screens/ViewCobrancaListGerirCobrancaListScreen';
import ViewCobrancaListLigacaoCobrancaListScreen from './src/screens/ViewCobrancaListLigacaoCobrancaListScreen';
import ViewCobrancaListLoteListScreen from './src/screens/ViewCobrancaListLoteListScreen';
import ViewComponenteCurricularFormComponenteCurricularListScreen
    from './src/screens/ViewComponenteCurricularFormComponenteCurricularListScreen';
import ViewComponenteCurricularListComponenteCurricularListScreen
    from './src/screens/ViewComponenteCurricularListComponenteCurricularListScreen';
import ViewCompromissoAbasMatriculaListScreen from './src/screens/ViewCompromissoAbasMatriculaListScreen';
import ViewCompromissoFinalizarCompromissoListScreen from './src/screens/ViewCompromissoFinalizarCompromissoListScreen';
import ViewCompromissoFormCompromissoListScreen from './src/screens/ViewCompromissoFormCompromissoListScreen';
import ViewCompromissoFormTipoCompromissoListScreen from './src/screens/ViewCompromissoFormTipoCompromissoListScreen';
import ViewCompromissoListCompromissoListScreen from './src/screens/ViewCompromissoListCompromissoListScreen';
import ViewCompromissoListTipoCompromissoListScreen from './src/screens/ViewCompromissoListTipoCompromissoListScreen';
import ViewComunicacaoFormComunicacaoListScreen from './src/screens/ViewComunicacaoFormComunicacaoListScreen';
import ViewComunicacaoFormComunicacaoMensagemListScreen
    from './src/screens/ViewComunicacaoFormComunicacaoMensagemListScreen';
import ViewComunicacaoListComunicacaoListScreen from './src/screens/ViewComunicacaoListComunicacaoListScreen';
import ViewComunicacaoListComunicacaoMensagemListScreen
    from './src/screens/ViewComunicacaoListComunicacaoMensagemListScreen';
import ViewConfiguracaoFormConfiguracaoListScreen from './src/screens/ViewConfiguracaoFormConfiguracaoListScreen';
import ViewConfiguracaoFormConfiguracaoCaixaListScreen
    from './src/screens/ViewConfiguracaoFormConfiguracaoCaixaListScreen';
import ViewConfiguracaoFormConfiguracaoEmailListScreen
    from './src/screens/ViewConfiguracaoFormConfiguracaoEmailListScreen';
import ViewConfiguracaoFormConfiguracaoEstoqueListScreen
    from './src/screens/ViewConfiguracaoFormConfiguracaoEstoqueListScreen';
import ViewConfiguracaoFormConfiguracaoParcelaListScreen
    from './src/screens/ViewConfiguracaoFormConfiguracaoParcelaListScreen';
import ViewConfiguracaoFormLayoutListScreen from './src/screens/ViewConfiguracaoFormLayoutListScreen';
import ViewConfiguracaoListConfiguracaoListScreen from './src/screens/ViewConfiguracaoListConfiguracaoListScreen';
import ViewConfiguracaoListConfiguracaoCaixaListScreen
    from './src/screens/ViewConfiguracaoListConfiguracaoCaixaListScreen';
import ViewConfiguracaoListConfiguracaoEmailListScreen
    from './src/screens/ViewConfiguracaoListConfiguracaoEmailListScreen';
import ViewConfiguracaoListConfiguracaoEstoqueListScreen
    from './src/screens/ViewConfiguracaoListConfiguracaoEstoqueListScreen';
import ViewConfiguracaoListConfiguracaoMarketingListScreen
    from './src/screens/ViewConfiguracaoListConfiguracaoMarketingListScreen';
import ViewConfiguracaoListConfiguracaoParcelaListScreen
    from './src/screens/ViewConfiguracaoListConfiguracaoParcelaListScreen';
import ViewConfiguracaoListLayoutListScreen from './src/screens/ViewConfiguracaoListLayoutListScreen';
import ConfiguracaoNotificacoesScreen from './src/features/notificacoes/ConfiguracaoNotificacoesScreen';
import NotificacoesUsuarioScreen from './src/features/notificacoes/NotificacoesUsuarioScreen';
import NotificacoesAlunoScreen from './src/features/notificacoes/NotificacoesAlunoScreen';
import NotificacoesProfessorScreen from './src/features/notificacoes/NotificacoesProfessorScreen';
import ViewConsultorConsultorListScreen from './src/screens/ViewConsultorConsultorListScreen';
import ViewConsultorFormConsultorListScreen from './src/screens/ViewConsultorFormConsultorListScreen';

import ViewContaControlePagamentoListScreen from './src/screens/ViewContaControlePagamentoListScreen';
import ViewContaGestaoContaListScreen from './src/screens/ViewContaGestaoContaListScreen';
import ViewContaCorrenteFormContaCorrenteListScreen from './src/screens/ViewContaCorrenteFormContaCorrenteListScreen';
import ViewContaCorrenteListContaCorrenteListScreen from './src/screens/ViewContaCorrenteListContaCorrenteListScreen';
import ViewContratoFormContratoListScreen from './src/screens/ViewContratoFormContratoListScreen';
import ViewContratoListContratoListScreen from './src/screens/ViewContratoListContratoListScreen';
import ViewContratoSituacaoFormContratoSituacaoListScreen
    from './src/screens/ViewContratoSituacaoFormContratoSituacaoListScreen';
import ViewContratoSituacaoListContratoSituacaoListScreen
    from './src/screens/ViewContratoSituacaoListContratoSituacaoListScreen';
import ViewCoordenadorListCoordenadorListScreen from './src/screens/ViewCoordenadorListCoordenadorListScreen';
import ViewCorFormCoresListScreen from './src/screens/ViewCorFormCoresListScreen';
import ViewCorListCoresListScreen from './src/screens/ViewCorListCoresListScreen';
import ViewCpfalunosFormCpfalunosListScreen from './src/screens/ViewCpfalunosFormCpfalunosListScreen';
import ViewCpfalunosListCpfalunosListScreen from './src/screens/ViewCpfalunosListCpfalunosListScreen';
import ViewCriterioListCriterioListScreen from './src/screens/ViewCriterioListCriterioListScreen';
import ViewCronogramaComponenteCurricularFormCronogramaComponenteCurricularListScreen
    from './src/screens/ViewCronogramaComponenteCurricularFormCronogramaComponenteCurricularListScreen';
import ViewCronogramaComponenteCurricularListCronogramaComponenteCurricularListScreen
    from './src/screens/ViewCronogramaComponenteCurricularListCronogramaComponenteCurricularListScreen';
import ViewCurriculoFormCurriculoListScreen from './src/screens/ViewCurriculoFormCurriculoListScreen';
import ViewCurriculoListCurriculoListScreen from './src/screens/ViewCurriculoListCurriculoListScreen';
import ViewCursoFormCursoListScreen from './src/screens/ViewCursoFormCursoListScreen';
import ViewCursoListCursoListScreen from './src/screens/ViewCursoListCursoListScreen';
import ViewCustoServicoFormCustoServicoListScreen from './src/screens/ViewCustoServicoFormCustoServicoListScreen';
import ViewCustoServicoListCustoServicoListScreen from './src/screens/ViewCustoServicoListCustoServicoListScreen';
import ViewDesistenteFormDesistenteListScreen from './src/screens/ViewDesistenteFormDesistenteListScreen';
import ViewDesistenteListDesistenteListScreen from './src/screens/ViewDesistenteListDesistenteListScreen';
import ViewDiaPagamentoFormDiaPagamentoListScreen from './src/screens/ViewDiaPagamentoFormDiaPagamentoListScreen';
import ViewDiaPagamentoListDiaPagamentoListScreen from './src/screens/ViewDiaPagamentoListDiaPagamentoListScreen';
import ViewDigitalizacaoDocumentoDigitalizacaoDocumentoListScreen
    from './src/screens/ViewDigitalizacaoDocumentoDigitalizacaoDocumentoListScreen';
import ViewDisponibilidadeProfessorListDisponibilidadeProfessorListScreen
    from './src/screens/ViewDisponibilidadeProfessorListDisponibilidadeProfessorListScreen';
import ViewDisponibilidadeSalaListDisponibilidadeSalaListScreen
    from './src/screens/ViewDisponibilidadeSalaListDisponibilidadeSalaListScreen';
import ViewEntregaFormEntregaListScreen from './src/screens/ViewEntregaFormEntregaListScreen';
import ViewEntregaListEntregaListScreen from './src/screens/ViewEntregaListEntregaListScreen';
import ViewEscolaridadeFormEscolaridadeListScreen from './src/screens/ViewEscolaridadeFormEscolaridadeListScreen';
import ViewEscolaridadeListEscolaridadeListScreen from './src/screens/ViewEscolaridadeListEscolaridadeListScreen';
import ViewEstadoFormEstadoListScreen from './src/screens/ViewEstadoFormEstadoListScreen';
import ViewEstadoListEstadoListScreen from './src/screens/ViewEstadoListEstadoListScreen';
import ViewEstadoCivilFormEstadoCivilListScreen from './src/screens/ViewEstadoCivilFormEstadoCivilListScreen';
import ViewEstadoCivilListEstadoCivilListScreen from './src/screens/ViewEstadoCivilListEstadoCivilListScreen';
import ViewEstoqueControleestoqueListScreen from './src/screens/ViewEstoqueControleestoqueListScreen';
import ViewEstoqueEstoqueprodutoListScreen from './src/screens/ViewEstoqueEstoqueprodutoListScreen';
import ViewEstrategiaFormEstrategiaListScreen from './src/screens/ViewEstrategiaFormEstrategiaListScreen';
import ViewEstrategiaListEstrategiaListScreen from './src/screens/ViewEstrategiaListEstrategiaListScreen';
import ViewEstruturaFormEstruturaListScreen from './src/screens/ViewEstruturaFormEstruturaListScreen';
import ViewEstruturaListEstruturaListScreen from './src/screens/ViewEstruturaListEstruturaListScreen';
import ViewEtapasCobrancaFormEtapasCobrancaListScreen
    from './src/screens/ViewEtapasCobrancaFormEtapasCobrancaListScreen';
import ViewEtapasCobrancaListEtapasCobrancaListScreen
    from './src/screens/ViewEtapasCobrancaListEtapasCobrancaListScreen';
import ViewEtapasNapFormEtapasNapListScreen from './src/screens/ViewEtapasNapFormEtapasNapListScreen';
import ViewEtapasNapListEtapasNapListScreen from './src/screens/ViewEtapasNapListEtapasNapListScreen';
import ViewEtniaFormEtniaListScreen from './src/screens/ViewEtniaFormEtniaListScreen';
import ViewEtniaListEtniaListScreen from './src/screens/ViewEtniaListEtniaListScreen';
import ViewFavoritoPerfilFormFavoritoPerfilListScreen
    from './src/screens/ViewFavoritoPerfilFormFavoritoPerfilListScreen';
import ViewFavoritoPerfilListFavoritoPerfilListScreen
    from './src/screens/ViewFavoritoPerfilListFavoritoPerfilListScreen';
import ViewFavoritoUsuarioFormFavoritoUsuarioListScreen
    from './src/screens/ViewFavoritoUsuarioFormFavoritoUsuarioListScreen';
import ViewFavoritoUsuarioListFavoritoUsuarioListScreen
    from './src/screens/ViewFavoritoUsuarioListFavoritoUsuarioListScreen';
import ViewFeriadoFormFeriadoListScreen from './src/screens/ViewFeriadoFormFeriadoListScreen';
import ViewFeriadoListFeriadoListScreen from './src/screens/ViewFeriadoListFeriadoListScreen';
import ViewFiltrosFormFiltrosListScreen from './src/screens/ViewFiltrosFormFiltrosListScreen';
import ViewFiltrosListFiltrosListScreen from './src/screens/ViewFiltrosListFiltrosListScreen';
import ViewFornecedorFormFornecedorListScreen from './src/screens/ViewFornecedorFormFornecedorListScreen';
import ViewFornecedorListFornecedorListScreen from './src/screens/ViewFornecedorListFornecedorListScreen';
import ViewFuncaoFormFuncaoListScreen from './src/screens/ViewFuncaoFormFuncaoListScreen';
import ViewFuncaoListFuncaoListScreen from './src/screens/ViewFuncaoListFuncaoListScreen';
import ViewGestaoAlunoGestaoAlunoListScreen from './src/screens/ViewGestaoAlunoGestaoAlunoListScreen';
import ViewGestaoAlunoListHistoricoAlunoListScreen from './src/screens/ViewGestaoAlunoListHistoricoAlunoListScreen';
import ViewGestaoProfessorGestaoProfessorListScreen from './src/screens/ViewGestaoProfessorGestaoProfessorListScreen';
import ViewGrauFormGrauListScreen from './src/screens/ViewGrauFormGrauListScreen';
import ViewGrauListGrauListScreen from './src/screens/ViewGrauListGrauListScreen';
import ViewGrupoFormGrupoListScreen from './src/screens/ViewGrupoFormGrupoListScreen';
import ViewGrupoListGrupoListScreen from './src/screens/ViewGrupoListGrupoListScreen';
import ViewGrupoComponenteCurricularFormGrupoComponenteCurricularListScreen
    from './src/screens/ViewGrupoComponenteCurricularFormGrupoComponenteCurricularListScreen';
import ViewGrupoComponenteCurricularListGrupoComponenteCurricularListScreen
    from './src/screens/ViewGrupoComponenteCurricularListGrupoComponenteCurricularListScreen';
import ViewHorarioFormHorarioListScreen from './src/screens/ViewHorarioFormHorarioListScreen';
import ViewHorarioListHorarioListScreen from './src/screens/ViewHorarioListHorarioListScreen';
import ViewHorarioPeriodoFormHorarioPeriodoListScreen
    from './src/screens/ViewHorarioPeriodoFormHorarioPeriodoListScreen';
import ViewHorarioPeriodoListHorarioPeriodoListScreen
    from './src/screens/ViewHorarioPeriodoListHorarioPeriodoListScreen';
import ViewImpressoraFormImpressoraListScreen from './src/screens/ViewImpressoraFormImpressoraListScreen';
import ViewImpressoraListImpressoraListScreen from './src/screens/ViewImpressoraListImpressoraListScreen';
import ViewIndicadorFormIndicadorListScreen from './src/features/configuracoes/indicador/ViewIndicadorFormIndicadorListScreen';
import ViewIndicadorListIndicadorListScreen from './src/features/configuracoes/indicador/ViewIndicadorListIndicadorListScreen';
import ViewLigacaoLigacaoListScreen from './src/screens/ViewLigacaoLigacaoListScreen';
import ViewLoginLoginListScreen from './src/screens/ViewLoginLoginListScreen';
import ViewLogradouroFormLogradouroListScreen from './src/screens/ViewLogradouroFormLogradouroListScreen';
import ViewLogradouroListLogradouroListScreen from './src/screens/ViewLogradouroListLogradouroListScreen';
import ViewMatriculaAbasMatriculaListScreen from './src/screens/ViewMatriculaAbasMatriculaListScreen';
import ViewMatriculaFormMatriculaListScreen from './src/screens/ViewMatriculaFormMatriculaListScreen';
import ViewMatriculaFormRematriculaListScreen from './src/screens/ViewMatriculaFormRematriculaListScreen';
import ViewMatriculaListMatriculaListScreen from './src/screens/ViewMatriculaListMatriculaListScreen';
import ViewMatriculaListRematriculaListScreen from './src/screens/ViewMatriculaListRematriculaListScreen';
import ViewMatriculaMatriculaListScreen from './src/screens/ViewMatriculaMatriculaListScreen';
import ViewMatriculaRematriculaListScreen from './src/screens/ViewMatriculaRematriculaListScreen';
import ViewMensagemFormMensagemListScreen from './src/screens/ViewMensagemFormMensagemListScreen';
import ViewMensagemListMensagemListScreen from './src/screens/ViewMensagemListMensagemListScreen';
import ViewMensagemCobrancaFormMensagemCobrancaListScreen
    from './src/screens/ViewMensagemCobrancaFormMensagemCobrancaListScreen';
import ViewMensagemCobrancaListMensagemCobrancaListScreen
    from './src/screens/ViewMensagemCobrancaListMensagemCobrancaListScreen';
import ViewMensagemNapFormMensagemNapListScreen from './src/screens/ViewMensagemNapFormMensagemNapListScreen';
import ViewMensagemNapListMensagemNapListScreen from './src/screens/ViewMensagemNapListMensagemNapListScreen';
import ViewMenuListMapaMenuListScreen from './src/screens/ViewMenuListMapaMenuListScreen';
import ViewMetaFormMetaListScreen from './src/screens/ViewMetaFormMetaListScreen';
import ViewMetaFormMetaDinamicaListScreen from './src/features/configuracoes/meta/ViewMetaFormMetaDinamicaListScreen';
import ViewMetaListMetaListScreen from './src/screens/ViewMetaListMetaListScreen';
import ViewMetaListMetaDinamicaListScreen from './src/features/configuracoes/meta/ViewMetaListMetaDinamicaListScreen';
import ViewModuloFormModuloListScreen from './src/screens/ViewModuloFormModuloListScreen';
import ViewModuloListModuloListScreen from './src/screens/ViewModuloListModuloListScreen';
import ViewModuloListOrdemModuloListScreen from './src/screens/ViewModuloListOrdemModuloListScreen';
import ViewMotivoFormMotivoListScreen from './src/screens/ViewMotivoFormMotivoListScreen';
import ViewMotivoListMotivoListScreen from './src/screens/ViewMotivoListMotivoListScreen';
import ViewMovimentacaoFormMovimentacaoEstoqueListScreen
    from './src/screens/ViewMovimentacaoFormMovimentacaoEstoqueListScreen';
import ViewMovimentacaoListMovimentacaoEstoqueListScreen
    from './src/screens/ViewMovimentacaoListMovimentacaoEstoqueListScreen';
import ViewMovimentoFormMovimentoListScreen from './src/screens/ViewMovimentoFormMovimentoListScreen';
import ViewMovimentoListMovimentoListScreen from './src/screens/ViewMovimentoListMovimentoListScreen';
import ViewNapAbasinfoListScreen from './src/screens/ViewNapAbasinfoListScreen';
import ViewNapFormLigacaoNapListScreen from './src/screens/ViewNapFormLigacaoNapListScreen';
import ViewNapListGerirNapListScreen from './src/screens/ViewNapListGerirNapListScreen';
import ViewNapListLigacaoNapListScreen from './src/screens/ViewNapListLigacaoNapListScreen';
import ViewNapListLoteListScreen from './src/screens/ViewNapListLoteListScreen';
import ViewOferecimentoComponenteCurricularDisponibilidadeOferecimentoListScreen
    from './src/screens/ViewOferecimentoComponenteCurricularDisponibilidadeOferecimentoListScreen';
import ViewOferecimentoComponenteCurricularFormOferecimentoComponenteCurricularListScreen
    from './src/screens/ViewOferecimentoComponenteCurricularFormOferecimentoComponenteCurricularListScreen';
import ViewOferecimentoComponenteCurricularFormOferecimentoCursoListScreen
    from './src/screens/ViewOferecimentoComponenteCurricularFormOferecimentoCursoListScreen';
import ViewOferecimentoComponenteCurricularListOferecimentoComponenteCurricularListScreen
    from './src/screens/ViewOferecimentoComponenteCurricularListOferecimentoComponenteCurricularListScreen';
import ViewOferecimentoComponenteCurricularListOferecimentoCursoListScreen
    from './src/screens/ViewOferecimentoComponenteCurricularListOferecimentoCursoListScreen';
import ViewOperacionalFormOperacionalListScreen from './src/screens/ViewOperacionalFormOperacionalListScreen';
import ViewOperacionalListOperacionalListScreen from './src/screens/ViewOperacionalListOperacionalListScreen';
import ViewPacoteListPacoteListScreen from './src/screens/ViewPacoteListPacoteListScreen';
import ViewPacoteFormPacoteListScreen from './src/features/configuracoes/ViewPacoteFormPacoteListScreen';
import ViewPagamentoAberturacaixaListScreen from './src/screens/ViewPagamentoAberturacaixaListScreen';
import ViewPagamentoCaixaentradaListScreen from './src/screens/ViewPagamentoCaixaentradaListScreen';
import ViewPagamentoCaixasaidaListScreen from './src/screens/ViewPagamentoCaixasaidaListScreen';
import ViewPagamentoCodigoVerificadorListScreen from './src/screens/ViewPagamentoCodigoVerificadorListScreen';
import ViewPagamentoFechamentoCaixaListScreen from './src/screens/ViewPagamentoFechamentoCaixaListScreen';
import ViewPagamentoMovimentocaixaListScreen from './src/screens/ViewPagamentoMovimentocaixaListScreen';
import ViewPagamentoProdutoListScreen from './src/screens/ViewPagamentoProdutoListScreen';
import ViewPaisFormPaisListScreen from './src/screens/ViewPaisFormPaisListScreen';
import ViewPaisListPaisListScreen from './src/screens/ViewPaisListPaisListScreen';
import ViewPerfilFormPerfilListScreen from './src/screens/ViewPerfilFormPerfilListScreen';
import ViewPerfilListPerfilListScreen from './src/screens/ViewPerfilListPerfilListScreen';
import ViewPeriodoFormPeriodoListScreen from './src/screens/ViewPeriodoFormPeriodoListScreen';
import ViewPeriodoListPeriodoListScreen from './src/screens/ViewPeriodoListPeriodoListScreen';
import ViewPessoaFormPessoaFisicaListScreen from './src/screens/ViewPessoaFormPessoaFisicaListScreen';
import ViewPessoaFormPessoaJuridicaListScreen from './src/screens/ViewPessoaFormPessoaJuridicaListScreen';
import ViewPessoaFormPessoaPessoaFisicaListScreen from './src/screens/ViewPessoaFormPessoaPessoaFisicaListScreen';
import ViewPessoaFormPessoaPessoaJuridicaListScreen from './src/screens/ViewPessoaFormPessoaPessoaJuridicaListScreen';
import ViewPessoaFormPessoaPessoaUsuarioListScreen from './src/screens/ViewPessoaFormPessoaPessoaUsuarioListScreen';
import ViewPessoaListDisponibilidadePessoaListScreen from './src/screens/ViewPessoaListDisponibilidadePessoaListScreen';

import ViewPessoaListPessoaFisicaListScreen from './src/screens/ViewPessoaListPessoaFisicaListScreen';
import ViewPessoaListPessoaJuridicaListScreen from './src/screens/ViewPessoaListPessoaJuridicaListScreen';
import ViewPessoaPessoaDocumentoListScreen from './src/screens/ViewPessoaPessoaDocumentoListScreen';

import ViewProdutoFormProdutoListScreen from './src/screens/ViewProdutoFormProdutoListScreen';
import ViewProdutoListConfiguracaoProdutoListScreen from './src/screens/ViewProdutoListConfiguracaoProdutoListScreen';
import ViewProdutoListProdutoListScreen from './src/screens/ViewProdutoListProdutoListScreen';

import ViewProfessorFormProfessorListScreen from './src/features/professor/ViewProfessorFormProfessorListScreen';
import ViewProfessorListProfessorListScreen from './src/features/professor/ViewProfessorListProfessorListScreen';
import ViewProspectoCadastroProspectoListScreen from './src/screens/ViewProspectoCadastroProspectoListScreen';
import ViewProspectoControleProspectoListScreen from './src/screens/ViewProspectoControleProspectoListScreen';
import ViewProspectoEditProspectoListScreen from './src/screens/ViewProspectoEditProspectoListScreen';
import ViewProspectoListProspectoListScreen from './src/screens/ViewProspectoListProspectoListScreen';
import ViewProspectoProspectoRadarListScreen from './src/screens/ViewProspectoProspectoRadarListScreen';

import ViewReferenciaBibliograficaFormReferenciaBibliograficaListScreen
    from './src/screens/ViewReferenciaBibliograficaFormReferenciaBibliograficaListScreen';
import ViewReferenciaBibliograficaListReferenciaBibliograficaListScreen
    from './src/screens/ViewReferenciaBibliograficaListReferenciaBibliograficaListScreen';
import ViewRegiaoFormRegiaoListScreen from './src/screens/ViewRegiaoFormRegiaoListScreen';
import ViewRegiaoListRegiaoListScreen from './src/screens/ViewRegiaoListRegiaoListScreen';

import ViewRelatoriosExtratorListScreen from './src/features/relatorios/ViewRelatoriosExtratorListScreen';
import ViewRelatoriosFormDashboardListScreen from './src/features/relatorios/ViewRelatoriosFormDashboardListScreen';
import DashboardMontagemScreen from './src/features/relatorios/DashboardMontagemScreen';
import ViewRelatoriosFormGraficoListScreen from './src/features/relatorios/ViewRelatoriosFormGraficoListScreen';
import ViewRelatoriosFormMapaListScreen from './src/features/relatorios/ViewRelatoriosFormMapaListScreen';
import ViewRelatoriosFormOrganogramaListScreen from './src/features/relatorios/ViewRelatoriosFormOrganogramaListScreen';
import ViewRelatoriosFormTabelaListScreen from './src/features/relatorios/ViewRelatoriosFormTabelaListScreen';
import ViewRelatoriosFormIndicadorGaugeListScreen from './src/features/relatorios/ViewRelatoriosFormIndicadorGaugeListScreen';
import ViewRelatoriosListDashboardListScreen from './src/features/relatorios/ViewRelatoriosListDashboardListScreen';
import ViewRelatoriosListGraficoListScreen from './src/features/relatorios/ViewRelatoriosListGraficoListScreen';
import ViewRelatoriosListMapaListScreen from './src/features/relatorios/ViewRelatoriosListMapaListScreen';
import ViewRelatoriosListOrganogramaListScreen from './src/features/relatorios/ViewRelatoriosListOrganogramaListScreen';
import ViewRelatoriosListTabelaListScreen from './src/features/relatorios/ViewRelatoriosListTabelaListScreen';
import ViewRelatoriosListIndicadorGaugeListScreen from './src/features/relatorios/ViewRelatoriosListIndicadorGaugeListScreen';
import ViewRelatoriosViewDashboardListScreen from './src/features/relatorios/ViewRelatoriosViewDashboardListScreen';
import ViewRelatoriosViewGraficoBarrasHorizontalListScreen
    from './src/features/relatorios/ViewRelatoriosViewGraficoBarrasHorizontalListScreen';
import ViewRelatoriosViewGraficoBarrasVerticalListScreen
    from './src/features/relatorios/ViewRelatoriosViewGraficoBarrasVerticalListScreen';
import ViewRelatoriosViewGraficoCircularListScreen from './src/features/relatorios/ViewRelatoriosViewGraficoCircularListScreen';
import ViewRelatoriosViewGraficoCombinadoListScreen from './src/features/relatorios/ViewRelatoriosViewGraficoCombinadoListScreen';
import ViewRelatoriosViewGraficoLinhasListScreen from './src/features/relatorios/ViewRelatoriosViewGraficoLinhasListScreen';
import ViewRelatoriosViewGraficoPizzaListScreen from './src/features/relatorios/ViewRelatoriosViewGraficoPizzaListScreen';
import ViewRelatoriosViewMapaListScreen from './src/features/relatorios/ViewRelatoriosViewMapaListScreen';
import ViewRelatoriosViewMapaScreen from './src/features/relatorios/ViewRelatoriosViewMapaScreen';
import ViewRelatoriosViewOrganogramaListScreen from './src/features/relatorios/ViewRelatoriosViewOrganogramaListScreen';
import ViewRelatoriosViewTabelaListScreen from './src/features/relatorios/ViewRelatoriosViewTabelaListScreen';
import ViewRelatoriosViewIndicadorGaugeScreen from './src/features/relatorios/ViewRelatoriosViewIndicadorGaugeScreen';

import ViewResultadoFormResultadoListScreen from './src/screens/ViewResultadoFormResultadoListScreen';
import ViewResultadoListResultadoListScreen from './src/screens/ViewResultadoListResultadoListScreen';

import ViewResultadoCobrancaFormResultadoCobrancaListScreen
    from './src/screens/ViewResultadoCobrancaFormResultadoCobrancaListScreen';
import ViewResultadoCobrancaListResultadoCobrancaListScreen
    from './src/screens/ViewResultadoCobrancaListResultadoCobrancaListScreen';
import ViewResultadoContatoFormResultadoContatoListScreen
    from './src/screens/ViewResultadoContatoFormResultadoContatoListScreen';
import ViewResultadoContatoListResultadoContatoListScreen
    from './src/screens/ViewResultadoContatoListResultadoContatoListScreen';
import ViewResultadoLigacaoNapFormResultadoLigacaoNapListScreen
    from './src/screens/ViewResultadoLigacaoNapFormResultadoLigacaoNapListScreen';
import ViewResultadoLigacaoNapListResultadoLigacaoNapListScreen
    from './src/screens/ViewResultadoLigacaoNapListResultadoLigacaoNapListScreen';
import ViewSalaFormSalaListScreen from './src/screens/ViewSalaFormSalaListScreen';
import ViewSalaListSalaListScreen from './src/screens/ViewSalaListSalaListScreen';

import ViewStatusCompromissoFormStatusCompromissoListScreen
    from './src/screens/ViewStatusCompromissoFormStatusCompromissoListScreen';
import ViewStatusCompromissoListStatusCompromissoListScreen
    from './src/screens/ViewStatusCompromissoListStatusCompromissoListScreen';
import ViewSubCategoriaFormSubCategoriaListScreen from './src/features/configuracoes/ViewSubCategoriaFormSubCategoriaListScreen';
import ViewSubCategoriaListSubCategoriaListScreen from './src/features/configuracoes/ViewSubCategoriaListSubCategoriaListScreen';


import ViewTelefoneFormTelefoneListScreen from './src/screens/ViewTelefoneFormTelefoneListScreen';
import ViewTelefoneListTelefoneListScreen from './src/screens/ViewTelefoneListTelefoneListScreen';
import ViewTempoAulaFormTempoAulaListScreen from './src/screens/ViewTempoAulaFormTempoAulaListScreen';
import ViewTempoAulaListTempoAulaListScreen from './src/screens/ViewTempoAulaListTempoAulaListScreen';
import ViewTipoAcaoFormTipoAcaoListScreen from './src/screens/ViewTipoAcaoFormTipoAcaoListScreen';
import ViewTipoAcaoListTipoAcaoListScreen from './src/screens/ViewTipoAcaoListTipoAcaoListScreen';
import ViewTipoAgendaFormTipoAgendaListScreen from './src/screens/ViewTipoAgendaFormTipoAgendaListScreen';
import ViewTipoAgendaListTipoAgendaListScreen from './src/screens/ViewTipoAgendaListTipoAgendaListScreen';
import ViewTipoAtividadeFormTipoAtividadeListScreen from './src/screens/ViewTipoAtividadeFormTipoAtividadeListScreen';
import ViewTipoAtividadeListTipoAtividadeListScreen from './src/screens/ViewTipoAtividadeListTipoAtividadeListScreen';
import ViewTipoCanalFormTipoCanalListScreen from './src/screens/ViewTipoCanalFormTipoCanalListScreen';
import ViewTipoCanalListTipoCanalListScreen from './src/screens/ViewTipoCanalListTipoCanalListScreen';
import ViewTipoContratoFormTipoContratoListScreen from './src/screens/ViewTipoContratoFormTipoContratoListScreen';
import ViewTipoContratoListTipoContratoListScreen from './src/screens/ViewTipoContratoListTipoContratoListScreen';

import ViewTipoCursoFormTipoCursoListScreen from './src/screens/ViewTipoCursoFormTipoCursoListScreen';
import ViewTipoCursoListTipoCursoListScreen from './src/screens/ViewTipoCursoListTipoCursoListScreen';
import ViewTipoHistoricoFormTipoHistoricoListScreen from './src/screens/ViewTipoHistoricoFormTipoHistoricoListScreen';
import ViewTipoHistoricoListTipoHistoricoListScreen from './src/screens/ViewTipoHistoricoListTipoHistoricoListScreen';
import ViewTipoMatrizCurricularFormTipoMatrizCurricularListScreen
    from './src/screens/ViewTipoMatrizCurricularFormTipoMatrizCurricularListScreen';
import ViewTipoMatrizCurricularListTipoMatrizCurricularListScreen
    from './src/screens/ViewTipoMatrizCurricularListTipoMatrizCurricularListScreen';
import ViewTipoPausaFormTipoPausaListScreen from './src/screens/ViewTipoPausaFormTipoPausaListScreen';
import ViewTipoPausaListTipoPausaListScreen from './src/screens/ViewTipoPausaListTipoPausaListScreen';
import ViewTipoSalaFormTipoSalaListScreen from './src/screens/ViewTipoSalaFormTipoSalaListScreen';
import ViewTipoSalaListTipoSalaListScreen from './src/screens/ViewTipoSalaListTipoSalaListScreen';
import ViewTipoTelefoneFormTipoTelefoneListScreen from './src/screens/ViewTipoTelefoneFormTipoTelefoneListScreen';
import ViewTipoTelefoneListTipoTelefoneListScreen from './src/screens/ViewTipoTelefoneListTipoTelefoneListScreen';
import ViewTipoUnidadeFormTipoUnidadeListScreen from './src/screens/ViewTipoUnidadeFormTipoUnidadeListScreen';
import ViewTipoUnidadeListTipoUnidadeListScreen from './src/screens/ViewTipoUnidadeListTipoUnidadeListScreen';

import ViewTurmaFormAjusteCalendarioListScreen from './src/features/professor/ViewTurmaFormAjusteCalendarioListScreen';
import ViewTurmaListTurmaListScreen from './src/features/professor/ViewTurmaListTurmaListScreen';
import ViewTurmaListTurmaFinalizandoListScreen from './src/features/professor/ViewTurmaListTurmaFinalizandoListScreen';
import ViewTurmaRecriarCalendarioAcademicoListScreen from './src/features/professor/ViewTurmaRecriarCalendarioAcademicoListScreen';

import ViewTurnoFormTurnoListScreen from './src/screens/ViewTurnoFormTurnoListScreen';
import ViewTurnoListTurnoListScreen from './src/screens/ViewTurnoListTurnoListScreen';

import ViewTurnoEducacaoFormTurnoEducacaoListScreen from './src/screens/ViewTurnoEducacaoFormTurnoEducacaoListScreen';
import ViewTurnoEducacaoListTurnoEducacaoListScreen from './src/screens/ViewTurnoEducacaoListTurnoEducacaoListScreen';
import ViewTurnoFuncionarioFormTurnoFuncionarioListScreen
    from './src/screens/ViewTurnoFuncionarioFormTurnoFuncionarioListScreen';
import ViewTurnoFuncionarioListTurnoFuncionarioListScreen
    from './src/screens/ViewTurnoFuncionarioListTurnoFuncionarioListScreen';

import ViewTurnoTrabalhoFormTurnoTrabalhoListScreen from './src/screens/ViewTurnoTrabalhoFormTurnoTrabalhoListScreen';
import ViewTurnoTrabalhoListTurnoTrabalhoListScreen from './src/screens/ViewTurnoTrabalhoListTurnoTrabalhoListScreen';
import ViewTurnoUsuarioListTurnoUsuarioListScreen from './src/screens/ViewTurnoUsuarioListTurnoUsuarioListScreen';

import ViewUnidadeFormRedeListScreen from './src/screens/ViewUnidadeFormRedeListScreen';
import ViewUnidadeFormUnidadeListScreen from './src/screens/ViewUnidadeFormUnidadeListScreen';
import ViewUnidadeListRedeListScreen from './src/screens/ViewUnidadeListRedeListScreen';
import ViewUnidadeListUnidadeListScreen from './src/screens/ViewUnidadeListUnidadeListScreen';
import ViewUsuarioCamposUsuarioTabViewListScreen from './src/screens/ViewUsuarioCamposUsuarioTabViewListScreen';

import ViewUsuarioFormUsuarioListScreen from './src/screens/ViewUsuarioFormUsuarioListScreen';
import ViewUsuarioFormUsuarioRapidoListScreen from './src/screens/ViewUsuarioFormUsuarioRapidoListScreen';
import ViewUsuarioListUsuarioListScreen from './src/screens/ViewUsuarioListUsuarioListScreen';
import CadastroUsuarioMobileScreen from './src/screens/CadastroUsuarioMobileScreen';

import ViewValorCursoFormValorCursoListScreen from './src/screens/ViewValorCursoFormValorCursoListScreen';
import ViewValorCursoListValorCursoListScreen from './src/screens/ViewValorCursoListValorCursoListScreen';
import ViewValorProdutoFormValorProdutoListScreen from './src/screens/ViewValorProdutoFormValorProdutoListScreen';
import ViewValorProdutoListValorProdutoListScreen from './src/screens/ViewValorProdutoListValorProdutoListScreen';
import ViewTemaListTemasListScreen from './src/screens/ViewTemaListTemasListScreen';
import AlunoDashboardScreen from './src/features/aluno/AlunoDashboardScreen';
import AlunoBoletimScreen from './src/features/aluno/AlunoBoletimScreen';
import AlunoFrequenciaScreen from './src/features/aluno/AlunoFrequenciaScreen';
import AlunoAulasScreen from './src/features/aluno/AlunoAulasScreen';
import AlunoAulasTurmaScreen from './src/features/aluno/AlunoAulasTurmaScreen';
import AlunoAulaScreen from './src/features/aluno/AlunoAulaScreen';
import AlunoFinanceiroScreen from './src/features/aluno/AlunoFinanceiroScreen';
import AlunoBibliotecaFisicaScreen from './src/features/aluno/AlunoBibliotecaFisicaScreen';
import AlunoBibliotecaVirtualScreen from './src/features/aluno/AlunoBibliotecaVirtualScreen';
import ViewCurriculoAttachmentScreen from './src/features/aluno/ViewCurriculoAttachmentScreen';

import MeusDadosScreen from './src/screens/MeusDadosScreen';
import ViewNotificacaoListNotificacaoListScreen from './src/screens/ViewNotificacaoListNotificacaoListScreen';
import ViewCategoriaEstoqueListCategoriaListScreen from './src/screens/ViewCategoriaEstoqueListCategoriaListScreen';
import ViewGeneroListGeneroListScreen from './src/screens/ViewGeneroListGeneroListScreen';
import ViewMarcaListMarcaListScreen from './src/screens/ViewMarcaListMarcaListScreen';
import ViewMensagemMetaListMensagemMetaListScreen from './src/screens/ViewMensagemMetaListMensagemMetaListScreen';
import ViewSubcategoriaEstoqueListSubCategoriaListScreen
    from './src/screens/ViewSubcategoriaEstoqueListSubCategoriaListScreen';

const Stack = createNativeStackNavigator<ParamList>();
const q = new QueryClient();

function AppRoutes() {
    return <QueryClientProvider client={q}><NavigationContainer><Stack.Navigator initialRouteName='home'><Stack.Screen
        name='home' component={HomeScreen} options={{headerShown: false}}/>
        <Stack.Screen name='default' component={DefaultListScreen}/>
        <Stack.Screen name='aluno/portalAluno' component={AlunoDashboardScreen} options={{title: 'Portal Aluno'}}/>
        <Stack.Screen name='aluno/boletim' component={AlunoBoletimScreen} options={{title: 'Boletim'}}/>
        <Stack.Screen name='aluno/frequencia' component={AlunoFrequenciaScreen} options={{title: 'Frequência'}}/>
        <Stack.Screen name='aluno/aulas' component={AlunoAulasScreen} options={{title: 'Aulas'}}/>
        <Stack.Screen name='aluno/aulas/turma' component={AlunoAulasTurmaScreen} options={{title: 'Aulas da Turma'}}/>
        <Stack.Screen name='aluno/aulas/aula' component={AlunoAulaScreen} options={{title: 'Detalhe da Aula'}}/>
        <Stack.Screen name='aluno/financeiro' component={AlunoFinanceiroScreen} options={{title: 'Financeiro'}}/>
        <Stack.Screen name='aluno/biblioteca-fisica' component={AlunoBibliotecaFisicaScreen} options={{title: 'Biblioteca Física'}}/>
        <Stack.Screen name='aluno/biblioteca-virtual' component={AlunoBibliotecaVirtualScreen} options={{title: 'Biblioteca Virtual'}}/>
        <Stack.Screen name='aluno/curriculo-anexo' component={ViewCurriculoAttachmentScreen} options={{title: 'Anexar Currículo'}}/>
        <Stack.Screen name='meus-dados' component={MeusDadosScreen} options={{title: 'Meus dados'}}/>
        <Stack.Screen name='view/notificacao/listNotificacao' component={ViewNotificacaoListNotificacaoListScreen}
                      options={{title: 'Notificações'}}/>
        <Stack.Screen name='view/categoriaEstoque/listCategoria'
                      component={ViewCategoriaEstoqueListCategoriaListScreen}/>
        <Stack.Screen name='view/genero/listGenero' component={ViewGeneroListGeneroListScreen}/>
        <Stack.Screen name='view/marca/listMarca' component={ViewMarcaListMarcaListScreen}/>
        <Stack.Screen name='view/mensagemMeta/listMensagemMeta' component={ViewMensagemMetaListMensagemMetaListScreen}/>
        <Stack.Screen name='view/subcategoriaEstoque/listSubCategoria'
                      component={ViewSubcategoriaEstoqueListSubCategoriaListScreen}/>
        <Stack.Screen name='view/acao/formAcao' component={ViewAcaoFormAcaoListScreen}/>
        <Stack.Screen name='view/acao/listAcao' component={ViewAcaoListAcaoListScreen}/>
        <Stack.Screen name='view/agenda/calendarioAgenda' component={ViewAgendaCalendarioAgendaListScreen}/>
        <Stack.Screen name='view/agenda/formAgenda' component={ViewAgendaFormAgendaListScreen}/>
        <Stack.Screen name='view/agenda/listAgenda' component={ViewAgendaListAgendaListScreen}/>
        <Stack.Screen name='view/alterarSenha/alterarSenha' component={ViewAlterarSenhaAlterarSenhaListScreen}/>
        <Stack.Screen name='view/apresentacao/listApresentacao' component={ViewApresentacaoListApresentacaoListScreen}/>
        <Stack.Screen name='auditoria' component={AuditoriaScreen}/>
        <Stack.Screen name='view/arquivoProcon/listArquivoProcon'
                      component={ViewArquivoProconListArquivoProconListScreen}/>
        <Stack.Screen name='view/atividadeComplementar/formAtividadeComplementar'
                      component={ViewAtividadeComplementarFormAtividadeComplementarListScreen}/>
        <Stack.Screen name='view/atividadeComplementar/listAtividadeComplementar'
                      component={ViewAtividadeComplementarListAtividadeComplementarListScreen}/>
        <Stack.Screen name='view/auditoria/formAuditoriaHistorico'
                      component={ViewAuditoriaFormAuditoriaHistoricoListScreen}/>
        <Stack.Screen name='view/auditoria/listAuditoria' component={ViewAuditoriaListAuditoriaListScreen}/>
        <Stack.Screen name='view/auditoria/listAuditoriaHistorico'
                      component={ViewAuditoriaListAuditoriaHistoricoListScreen}/>
        <Stack.Screen name='view/bairro/formBairro' component={ViewBairroFormBairroListScreen}/>
        <Stack.Screen name='view/bairro/listBairro' component={ViewBairroListBairroListScreen}/>
        <Stack.Screen name='view/bandeira/formBandeira' component={ViewBandeiraFormBandeiraListScreen}/>
        <Stack.Screen name='view/bandeira/listBandeira' component={ViewBandeiraListBandeiraListScreen}/>
        <Stack.Screen name='view/baseTecnologica/formBaseTecnologica'
                      component={ViewBaseTecnologicaFormBaseTecnologicaListScreen}/>
        <Stack.Screen name='view/baseTecnologica/listBaseTecnologica'
                      component={ViewBaseTecnologicaListBaseTecnologicaListScreen}/>
        <Stack.Screen name='view/caixa/formCaixa' component={ViewCaixaFormCaixaListScreen}/>
        <Stack.Screen name='view/caixa/listCaixa' component={ViewCaixaListCaixaListScreen}/>
        <Stack.Screen name='view/campanha/formCampanha' component={ViewCampanhaFormCampanhaListScreen}/>
        <Stack.Screen name='view/campanha/formDirecionamento' component={ViewCampanhaFormDirecionamentoListScreen}/>
        <Stack.Screen name='view/campanha/formGerarPacotes' component={ViewCampanhaFormGerarPacotesListScreen}/>
        <Stack.Screen name='view/campanha/listCampanha' component={ViewCampanhaListCampanhaListScreen}/>
        <Stack.Screen name='view/campanhaNegociacao/formCampanhaNegociacao'
                      component={ViewCampanhaNegociacaoFormCampanhaNegociacaoListScreen}/>
        <Stack.Screen name='view/campanhaNegociacao/listCampanhaNegociacao'
                      component={ViewCampanhaNegociacaoListCampanhaNegociacaoListScreen}/>
        <Stack.Screen name='view/campo/formCampo' component={ViewCampoFormCampoListScreen}/>
        <Stack.Screen name='view/campo/listCampo' component={ViewCampoListCampoListScreen}/>
        <Stack.Screen name='view/carga/formCarga' component={ViewCargaFormCargaListScreen}/>
        <Stack.Screen name='view/carga/listCarga' component={ViewCargaListCargaListScreen}/>
        <Stack.Screen name='view/categoria/formCategoria' component={ViewCategoriaFormCategoriaListScreen}/>
        <Stack.Screen name='view/categoria/listCategoria' component={ViewCategoriaListCategoriaListScreen}/>
        <Stack.Screen name='view/categoriaCampo/formCategoriaCampo'
                      component={ViewCategoriaCampoFormCategoriaCampoListScreen}/>
        <Stack.Screen name='view/categoriaCampo/listCategoriaCampo'
                      component={ViewCategoriaCampoListCategoriaCampoListScreen}/>
        <Stack.Screen name='view/chamadaAssinada/listChamadaAssinada'
                      component={ViewChamadaAssinadaListChamadaAssinadaListScreen}/>
        <Stack.Screen name='view/cidade/formCidade' component={ViewCidadeFormCidadeListScreen}/>
        <Stack.Screen name='view/cidade/listCidade' component={ViewCidadeListCidadeListScreen}/>
        <Stack.Screen name='view/cobranca/formLigacaoCobranca' component={ViewCobrancaFormLigacaoCobrancaListScreen}/>
        <Stack.Screen name='view/cobranca/listGerirCobranca' component={ViewCobrancaListGerirCobrancaListScreen}/>
        <Stack.Screen name='view/cobranca/listLigacaoCobranca' component={ViewCobrancaListLigacaoCobrancaListScreen}/>
        <Stack.Screen name='view/cobranca/listLote' component={ViewCobrancaListLoteListScreen}/>
        <Stack.Screen name='view/componenteCurricular/formComponenteCurricular'
                      component={ViewComponenteCurricularFormComponenteCurricularListScreen}/>
        <Stack.Screen name='view/componenteCurricular/listComponenteCurricular'
                      component={ViewComponenteCurricularListComponenteCurricularListScreen}/>
        <Stack.Screen name='view/compromisso/abasMatricula' component={ViewCompromissoAbasMatriculaListScreen}/>
        <Stack.Screen name='view/compromisso/finalizarCompromisso'
                      component={ViewCompromissoFinalizarCompromissoListScreen}/>
        <Stack.Screen name='view/compromisso/formCompromisso' component={ViewCompromissoFormCompromissoListScreen}/>
        <Stack.Screen name='view/compromisso/formTipoCompromisso'
                      component={ViewCompromissoFormTipoCompromissoListScreen}/>
        <Stack.Screen name='view/compromisso/listCompromisso' component={ViewCompromissoListCompromissoListScreen}/>
        <Stack.Screen name='view/compromisso/listTipoCompromisso'
                      component={ViewCompromissoListTipoCompromissoListScreen}/>
        <Stack.Screen name='view/comunicacao/formComunicacao' component={ViewComunicacaoFormComunicacaoListScreen}/>
        <Stack.Screen name='view/comunicacao/formComunicacaoMensagem'
                      component={ViewComunicacaoFormComunicacaoMensagemListScreen}/>
        <Stack.Screen name='view/comunicacao/listComunicacao' component={ViewComunicacaoListComunicacaoListScreen}/>
        <Stack.Screen name='view/comunicacao/listComunicacaoMensagem'
                      component={ViewComunicacaoListComunicacaoMensagemListScreen}/>
        <Stack.Screen name='view/configuracao/formConfiguracao' component={ViewConfiguracaoFormConfiguracaoListScreen}/>
        <Stack.Screen name='view/configuracao/formConfiguracaoCaixa'
                      component={ViewConfiguracaoFormConfiguracaoCaixaListScreen}/>
        <Stack.Screen name='view/configuracao/formConfiguracaoEmail'
                      component={ViewConfiguracaoFormConfiguracaoEmailListScreen}/>
        <Stack.Screen name='view/configuracao/formConfiguracaoEstoque'
                      component={ViewConfiguracaoFormConfiguracaoEstoqueListScreen}/>
        <Stack.Screen name='view/configuracao/formConfiguracaoParcela'
                      component={ViewConfiguracaoFormConfiguracaoParcelaListScreen}/>
        <Stack.Screen name='view/configuracao/formLayout' component={ViewConfiguracaoFormLayoutListScreen}/>
        <Stack.Screen name='view/configuracao/listConfiguracao' component={ViewConfiguracaoListConfiguracaoListScreen}/>
        <Stack.Screen name='view/configuracao/listConfiguracaoCaixa'
                      component={ViewConfiguracaoListConfiguracaoCaixaListScreen}/>
        <Stack.Screen name='view/configuracao/listConfiguracaoEmail'
                      component={ViewConfiguracaoListConfiguracaoEmailListScreen}/>
        <Stack.Screen name='view/configuracao/listConfiguracaoEstoque'
                      component={ViewConfiguracaoListConfiguracaoEstoqueListScreen}/>
        <Stack.Screen name='view/configuracao/listConfiguracaoMarketing'
                      component={ViewConfiguracaoListConfiguracaoMarketingListScreen}/>
        <Stack.Screen name='view/configuracao/listConfiguracaoParcela'
                      component={ViewConfiguracaoListConfiguracaoParcelaListScreen}/>
        <Stack.Screen name='view/configuracao/listLayout' component={ViewConfiguracaoListLayoutListScreen}/>
        <Stack.Screen name='config/notificacoes' component={ConfiguracaoNotificacoesScreen} options={{title: 'Configuração de Notificações'}}/>
        <Stack.Screen name='view/configuracao/notificacoes' component={ConfiguracaoNotificacoesScreen} options={{title: 'Configuração de Notificações'}}/>
        <Stack.Screen name='view/configuracao/notificacoes-usuario' component={NotificacoesUsuarioScreen} options={{title: 'Notificações do Usuário'}}/>
        <Stack.Screen name='view/configuracao/notificacoes-aluno' component={NotificacoesAlunoScreen} options={{title: 'Notificações do Aluno'}}/>
        <Stack.Screen name='view/configuracao/notificacoes-professor' component={NotificacoesProfessorScreen} options={{title: 'Notificações do Professor'}}/>
        <Stack.Screen name='view/consultor/consultor' component={ViewConsultorConsultorListScreen}/>
        <Stack.Screen name='view/consultor/formConsultor' component={ViewConsultorFormConsultorListScreen}/>

        <Stack.Screen name='view/conta/controlePagamento' component={ViewContaControlePagamentoListScreen}/>
        <Stack.Screen name='view/conta/gestaoConta' component={ViewContaGestaoContaListScreen}/>
        <Stack.Screen name='view/contaCorrente/formContaCorrente'
                      component={ViewContaCorrenteFormContaCorrenteListScreen}/>
        <Stack.Screen name='view/contaCorrente/listContaCorrente'
                      component={ViewContaCorrenteListContaCorrenteListScreen}/>
        <Stack.Screen name='view/contrato/formContrato' component={ViewContratoFormContratoListScreen}/>
        <Stack.Screen name='view/contrato/listContrato' component={ViewContratoListContratoListScreen}/>
        <Stack.Screen name='view/contratoSituacao/formContratoSituacao'
                      component={ViewContratoSituacaoFormContratoSituacaoListScreen}/>
        <Stack.Screen name='view/contratoSituacao/listContratoSituacao'
                      component={ViewContratoSituacaoListContratoSituacaoListScreen}/>
        <Stack.Screen name='view/coordenador/listCoordenador' component={ViewCoordenadorListCoordenadorListScreen}/>
        <Stack.Screen name='view/cor/formCores' component={ViewCorFormCoresListScreen}/>
        <Stack.Screen name='view/cor/listCores' component={ViewCorListCoresListScreen}/>
        <Stack.Screen name='view/cpfalunos/formCpfalunos' component={ViewCpfalunosFormCpfalunosListScreen}/>
        <Stack.Screen name='view/cpfalunos/listCpfalunos' component={ViewCpfalunosListCpfalunosListScreen}/>
        <Stack.Screen name='view/criterio/listCriterio' component={ViewCriterioListCriterioListScreen}/>
        <Stack.Screen name='view/cronogramaComponenteCurricular/formCronogramaComponenteCurricular'
                      component={ViewCronogramaComponenteCurricularFormCronogramaComponenteCurricularListScreen}/>
        <Stack.Screen name='view/cronogramaComponenteCurricular/listCronogramaComponenteCurricular'
                      component={ViewCronogramaComponenteCurricularListCronogramaComponenteCurricularListScreen}/>
        <Stack.Screen name='view/curriculo/formCurriculo' component={ViewCurriculoFormCurriculoListScreen}/>
        <Stack.Screen name='view/curriculo/listCurriculo' component={ViewCurriculoListCurriculoListScreen}/>
        <Stack.Screen name='view/curso/formCurso' component={ViewCursoFormCursoListScreen}/>
        <Stack.Screen name='view/curso/listCurso' component={ViewCursoListCursoListScreen}/>
        <Stack.Screen name='view/custoServico/formCustoServico' component={ViewCustoServicoFormCustoServicoListScreen}/>
        <Stack.Screen name='view/custoServico/listCustoServico' component={ViewCustoServicoListCustoServicoListScreen}/>
        <Stack.Screen name='view/desistente/formDesistente' component={ViewDesistenteFormDesistenteListScreen}/>
        <Stack.Screen name='view/desistente/listDesistente' component={ViewDesistenteListDesistenteListScreen}/>
        <Stack.Screen name='view/diaPagamento/formDiaPagamento' component={ViewDiaPagamentoFormDiaPagamentoListScreen}/>
        <Stack.Screen name='view/diaPagamento/listDiaPagamento' component={ViewDiaPagamentoListDiaPagamentoListScreen}/>
        <Stack.Screen name='view/digitalizacaoDocumento/digitalizacaoDocumento'
                      component={ViewDigitalizacaoDocumentoDigitalizacaoDocumentoListScreen}/>
        <Stack.Screen name='view/disponibilidadeProfessor/listDisponibilidadeProfessor'
                      component={ViewDisponibilidadeProfessorListDisponibilidadeProfessorListScreen}/>
        <Stack.Screen name='view/disponibilidadeSala/listDisponibilidadeSala'
                      component={ViewDisponibilidadeSalaListDisponibilidadeSalaListScreen}/>
        <Stack.Screen name='view/entrega/formEntrega' component={ViewEntregaFormEntregaListScreen}/>
        <Stack.Screen name='view/entrega/listEntrega' component={ViewEntregaListEntregaListScreen}/>
        <Stack.Screen name='view/escolaridade/formEscolaridade' component={ViewEscolaridadeFormEscolaridadeListScreen}/>
        <Stack.Screen name='view/escolaridade/listEscolaridade' component={ViewEscolaridadeListEscolaridadeListScreen}/>
        <Stack.Screen name='view/estado/formEstado' component={ViewEstadoFormEstadoListScreen}/>
        <Stack.Screen name='view/estado/listEstado' component={ViewEstadoListEstadoListScreen}/>
        <Stack.Screen name='view/estadoCivil/formEstadoCivil' component={ViewEstadoCivilFormEstadoCivilListScreen}/>
        <Stack.Screen name='view/estadoCivil/listEstadoCivil' component={ViewEstadoCivilListEstadoCivilListScreen}/>
        <Stack.Screen name='view/estoque/controleestoque' component={ViewEstoqueControleestoqueListScreen}/>
        <Stack.Screen name='view/estoque/estoqueproduto' component={ViewEstoqueEstoqueprodutoListScreen}/>
        <Stack.Screen name='view/estrategia/formEstrategia' component={ViewEstrategiaFormEstrategiaListScreen}/>
        <Stack.Screen name='view/estrategia/listEstrategia' component={ViewEstrategiaListEstrategiaListScreen}/>
        <Stack.Screen name='view/estrutura/formEstrutura' component={ViewEstruturaFormEstruturaListScreen}/>
        <Stack.Screen name='view/estrutura/listEstrutura' component={ViewEstruturaListEstruturaListScreen}/>
        <Stack.Screen name='view/etapasCobranca/formEtapasCobranca'
                      component={ViewEtapasCobrancaFormEtapasCobrancaListScreen}/>
        <Stack.Screen name='view/etapasCobranca/listEtapasCobranca'
                      component={ViewEtapasCobrancaListEtapasCobrancaListScreen}/>
        <Stack.Screen name='view/etapasNap/formEtapasNap' component={ViewEtapasNapFormEtapasNapListScreen}/>
        <Stack.Screen name='view/etapasNap/listEtapasNap' component={ViewEtapasNapListEtapasNapListScreen}/>
        <Stack.Screen name='view/etnia/formEtnia' component={ViewEtniaFormEtniaListScreen}/>
        <Stack.Screen name='view/etnia/listEtnia' component={ViewEtniaListEtniaListScreen}/>
        <Stack.Screen name='view/favoritoPerfil/formFavoritoPerfil'
                      component={ViewFavoritoPerfilFormFavoritoPerfilListScreen}/>
        <Stack.Screen name='view/favoritoPerfil/listFavoritoPerfil'
                      component={ViewFavoritoPerfilListFavoritoPerfilListScreen}/>
        <Stack.Screen name='view/favoritoUsuario/formFavoritoUsuario'
                      component={ViewFavoritoUsuarioFormFavoritoUsuarioListScreen}/>
        <Stack.Screen name='view/favoritoUsuario/listFavoritoUsuario'
                      component={ViewFavoritoUsuarioListFavoritoUsuarioListScreen}/>
        <Stack.Screen name='view/feriado/formFeriado' component={ViewFeriadoFormFeriadoListScreen}/>
        <Stack.Screen name='view/feriado/listFeriado' component={ViewFeriadoListFeriadoListScreen}/>
        <Stack.Screen name='view/filtros/formFiltros' component={ViewFiltrosFormFiltrosListScreen}/>
        <Stack.Screen name='view/filtros/listFiltros' component={ViewFiltrosListFiltrosListScreen}/>
        <Stack.Screen name='view/fornecedor/formFornecedor' component={ViewFornecedorFormFornecedorListScreen}/>
        <Stack.Screen name='view/fornecedor/listFornecedor' component={ViewFornecedorListFornecedorListScreen}/>
        <Stack.Screen name='view/funcao/formFuncao' component={ViewFuncaoFormFuncaoListScreen}/>
        <Stack.Screen name='view/funcao/listFuncao' component={ViewFuncaoListFuncaoListScreen}/>
        <Stack.Screen name='view/gestaoAluno/gestaoAluno' component={ViewGestaoAlunoGestaoAlunoListScreen}/>
        <Stack.Screen name='view/gestaoAluno/listHistoricoAluno'
                      component={ViewGestaoAlunoListHistoricoAlunoListScreen}/>
        <Stack.Screen name='view/gestaoProfessor/gestaoProfessor'
                      component={ViewGestaoProfessorGestaoProfessorListScreen}/>
        <Stack.Screen name='view/grau/formGrau' component={ViewGrauFormGrauListScreen}/>
        <Stack.Screen name='view/grau/listGrau' component={ViewGrauListGrauListScreen}/>
        <Stack.Screen name='view/grupo/formGrupo' component={ViewGrupoFormGrupoListScreen}/>
        <Stack.Screen name='view/grupo/listGrupo' component={ViewGrupoListGrupoListScreen}/>
        <Stack.Screen name='view/grupoComponenteCurricular/formGrupoComponenteCurricular'
                      component={ViewGrupoComponenteCurricularFormGrupoComponenteCurricularListScreen}/>
        <Stack.Screen name='view/grupoComponenteCurricular/listGrupoComponenteCurricular'
                      component={ViewGrupoComponenteCurricularListGrupoComponenteCurricularListScreen}/>
        <Stack.Screen name='view/horario/formHorario' component={ViewHorarioFormHorarioListScreen}/>
        <Stack.Screen name='view/horario/listHorario' component={ViewHorarioListHorarioListScreen}/>
        <Stack.Screen name='view/horarioPeriodo/formHorarioPeriodo'
                      component={ViewHorarioPeriodoFormHorarioPeriodoListScreen}/>
        <Stack.Screen name='view/horarioPeriodo/listHorarioPeriodo'
                      component={ViewHorarioPeriodoListHorarioPeriodoListScreen}/>
        <Stack.Screen name='view/impressora/formImpressora' component={ViewImpressoraFormImpressoraListScreen}/>
        <Stack.Screen name='view/impressora/listImpressora' component={ViewImpressoraListImpressoraListScreen}/>
        <Stack.Screen name='view/indicador/formIndicador' component={ViewIndicadorFormIndicadorListScreen}/>
        <Stack.Screen name='view/indicador/listIndicador' component={ViewIndicadorListIndicadorListScreen}/>
        <Stack.Screen name='view/indicador/formIndicadorGauge' component={ViewRelatoriosFormIndicadorGaugeListScreen}/>
        <Stack.Screen name='view/indicador/formIndicadorGauge/:id' component={ViewRelatoriosFormIndicadorGaugeListScreen}/>
        <Stack.Screen name='view/indicador/listIndicadorGauge' component={ViewRelatoriosListIndicadorGaugeListScreen}/>
        <Stack.Screen name='view/indicador/viewIndicadorGauge/:id' component={ViewRelatoriosViewIndicadorGaugeScreen}/>
        <Stack.Screen name='view/ligacao/ligacao' component={ViewLigacaoLigacaoListScreen}/>
        <Stack.Screen name='view/login/login' component={ViewLoginLoginListScreen}/>
        <Stack.Screen name='view/logradouro/formLogradouro' component={ViewLogradouroFormLogradouroListScreen}/>
        <Stack.Screen name='view/logradouro/listLogradouro' component={ViewLogradouroListLogradouroListScreen}/>
        <Stack.Screen name='view/matricula/abasMatricula' component={ViewMatriculaAbasMatriculaListScreen}/>
        <Stack.Screen name='view/matricula/formMatricula' component={ViewMatriculaFormMatriculaListScreen}/>
        <Stack.Screen name='view/matricula/formRematricula' component={ViewMatriculaFormRematriculaListScreen}/>
        <Stack.Screen name='view/matricula/listMatricula' component={ViewMatriculaListMatriculaListScreen}/>
        <Stack.Screen name='view/matricula/listRematricula' component={ViewMatriculaListRematriculaListScreen}/>
        <Stack.Screen name='view/matricula/matricula' component={ViewMatriculaMatriculaListScreen}/>
        <Stack.Screen name='view/matricula/rematricula' component={ViewMatriculaRematriculaListScreen}/>
        <Stack.Screen name='view/mensagem/formMensagem' component={ViewMensagemFormMensagemListScreen}/>
        <Stack.Screen name='view/mensagem/listMensagem' component={ViewMensagemListMensagemListScreen}/>
        <Stack.Screen name='view/mensagemCobranca/formMensagemCobranca'
                      component={ViewMensagemCobrancaFormMensagemCobrancaListScreen}/>
        <Stack.Screen name='view/mensagemCobranca/listMensagemCobranca'
                      component={ViewMensagemCobrancaListMensagemCobrancaListScreen}/>
        <Stack.Screen name='view/mensagemNap/formMensagemNap' component={ViewMensagemNapFormMensagemNapListScreen}/>
        <Stack.Screen name='view/mensagemNap/listMensagemNap' component={ViewMensagemNapListMensagemNapListScreen}/>
        <Stack.Screen name='view/menu/listMapaMenu' component={ViewMenuListMapaMenuListScreen}/>
        <Stack.Screen name='view/meta/formMeta' component={ViewMetaFormMetaListScreen}/>
        <Stack.Screen name='view/meta/formMetaDinamica' component={ViewMetaFormMetaDinamicaListScreen}/>
        <Stack.Screen name='view/meta/listMeta' component={ViewMetaListMetaListScreen}/>
        <Stack.Screen name='view/meta/listMetaDinamica' component={ViewMetaListMetaDinamicaListScreen}/>
        <Stack.Screen name='view/modulo/formModulo' component={ViewModuloFormModuloListScreen}/>
        <Stack.Screen name='view/modulo/listModulo' component={ViewModuloListModuloListScreen}/>
        <Stack.Screen name='view/modulo/listOrdemModulo' component={ViewModuloListOrdemModuloListScreen}/>
        <Stack.Screen name='view/motivo/formMotivo' component={ViewMotivoFormMotivoListScreen}/>
        <Stack.Screen name='view/motivo/listMotivo' component={ViewMotivoListMotivoListScreen}/>
        <Stack.Screen name='view/movimentacao/formMovimentacaoEstoque'
                      component={ViewMovimentacaoFormMovimentacaoEstoqueListScreen}/>
        <Stack.Screen name='view/movimentacao/listMovimentacaoEstoque'
                      component={ViewMovimentacaoListMovimentacaoEstoqueListScreen}/>
        <Stack.Screen name='view/movimento/formMovimento' component={ViewMovimentoFormMovimentoListScreen}/>
        <Stack.Screen name='view/movimento/listMovimento' component={ViewMovimentoListMovimentoListScreen}/>
        <Stack.Screen name='view/nap/abasinfo' component={ViewNapAbasinfoListScreen}/>
        <Stack.Screen name='view/nap/formLigacaoNap' component={ViewNapFormLigacaoNapListScreen}/>
        <Stack.Screen name='view/nap/listGerirNap' component={ViewNapListGerirNapListScreen}/>
        <Stack.Screen name='view/nap/listLigacaoNap' component={ViewNapListLigacaoNapListScreen}/>
        <Stack.Screen name='view/nap/listLote' component={ViewNapListLoteListScreen}/>
        <Stack.Screen name='view/oferecimentoComponenteCurricular/disponibilidadeOferecimento'
                      component={ViewOferecimentoComponenteCurricularDisponibilidadeOferecimentoListScreen}/>
        <Stack.Screen name='view/oferecimentoComponenteCurricular/formOferecimentoComponenteCurricular'
                      component={ViewOferecimentoComponenteCurricularFormOferecimentoComponenteCurricularListScreen}/>
        <Stack.Screen name='view/oferecimentoComponenteCurricular/formOferecimentoCurso'
                      component={ViewOferecimentoComponenteCurricularFormOferecimentoCursoListScreen}/>
        <Stack.Screen name='view/oferecimentoComponenteCurricular/listOferecimentoComponenteCurricular'
                      component={ViewOferecimentoComponenteCurricularListOferecimentoComponenteCurricularListScreen}/>
        <Stack.Screen name='view/oferecimentoComponenteCurricular/listOferecimentoCurso'
                      component={ViewOferecimentoComponenteCurricularListOferecimentoCursoListScreen}/>
        <Stack.Screen name='view/operacional/formOperacional' component={ViewOperacionalFormOperacionalListScreen}/>
        <Stack.Screen name='view/operacional/listOperacional' component={ViewOperacionalListOperacionalListScreen}/>
        <Stack.Screen name='view/pacote/listPacote' component={ViewPacoteListPacoteListScreen}/>
        <Stack.Screen name='view/pacote/formPacote' component={ViewPacoteFormPacoteListScreen}/>
        <Stack.Screen name='view/pagamento/aberturacaixa' component={ViewPagamentoAberturacaixaListScreen}/>
        <Stack.Screen name='view/pagamento/caixaentrada' component={ViewPagamentoCaixaentradaListScreen}/>
        <Stack.Screen name='view/pagamento/caixasaida' component={ViewPagamentoCaixasaidaListScreen}/>
        <Stack.Screen name='view/pagamento/codigoVerificador' component={ViewPagamentoCodigoVerificadorListScreen}/>
        <Stack.Screen name='view/pagamento/fechamentoCaixa' component={ViewPagamentoFechamentoCaixaListScreen}/>
        <Stack.Screen name='view/pagamento/movimentocaixa' component={ViewPagamentoMovimentocaixaListScreen}/>
        <Stack.Screen name='view/pagamento/produto' component={ViewPagamentoProdutoListScreen}/>
        <Stack.Screen name='view/pais/formPais' component={ViewPaisFormPaisListScreen}/>
        <Stack.Screen name='view/pais/listPais' component={ViewPaisListPaisListScreen}/>
        <Stack.Screen name='view/perfil/formPerfil' component={ViewPerfilFormPerfilListScreen}/>
        <Stack.Screen name='view/perfil/listPerfil' component={ViewPerfilListPerfilListScreen}/>
        <Stack.Screen name='view/periodo/formPeriodo' component={ViewPeriodoFormPeriodoListScreen}/>
        <Stack.Screen name='view/periodo/listPeriodo' component={ViewPeriodoListPeriodoListScreen}/>
        <Stack.Screen name='view/pessoa/formPessoaFisica' component={ViewPessoaFormPessoaFisicaListScreen}/>
        <Stack.Screen name='view/pessoa/formPessoaJuridica' component={ViewPessoaFormPessoaJuridicaListScreen}/>
        <Stack.Screen name='view/pessoa/formPessoaPessoaFisica' component={ViewPessoaFormPessoaPessoaFisicaListScreen}/>
        <Stack.Screen name='view/pessoa/formPessoaPessoaJuridica'
                      component={ViewPessoaFormPessoaPessoaJuridicaListScreen}/>
        <Stack.Screen name='view/pessoa/formPessoaPessoaUsuario'
                      component={ViewPessoaFormPessoaPessoaUsuarioListScreen}/>
        <Stack.Screen name='view/pessoa/listDisponibilidadePessoa'
                      component={ViewPessoaListDisponibilidadePessoaListScreen}/>

        <Stack.Screen name='view/pessoa/listPessoaFisica' component={ViewPessoaListPessoaFisicaListScreen}/>
        <Stack.Screen name='view/pessoa/listPessoaJuridica' component={ViewPessoaListPessoaJuridicaListScreen}/>
        <Stack.Screen name='view/pessoa/pessoaDocumento' component={ViewPessoaPessoaDocumentoListScreen}/>

        <Stack.Screen name='view/produto/formProduto' component={ViewProdutoFormProdutoListScreen}/>
        <Stack.Screen name='view/produto/listConfiguracaoProduto'
                      component={ViewProdutoListConfiguracaoProdutoListScreen}/>
        <Stack.Screen name='view/produto/listProduto' component={ViewProdutoListProdutoListScreen}/>

        <Stack.Screen name='view/professor/formProfessor' component={ViewProfessorFormProfessorListScreen}/>
        <Stack.Screen name='view/professor/listProfessor' component={ViewProfessorListProfessorListScreen}/>
        <Stack.Screen name='view/prospecto/cadastroProspecto' component={ViewProspectoCadastroProspectoListScreen}/>
        <Stack.Screen name='view/prospecto/controleProspecto' component={ViewProspectoControleProspectoListScreen}/>
        <Stack.Screen name='view/prospecto/editProspecto' component={ViewProspectoEditProspectoListScreen}/>
        <Stack.Screen name='view/prospecto/listProspecto' component={ViewProspectoListProspectoListScreen}/>
        <Stack.Screen name='view/prospecto/prospectoRadar' component={ViewProspectoProspectoRadarListScreen}/>

        <Stack.Screen name='view/referenciaBibliografica/formReferenciaBibliografica'
                      component={ViewReferenciaBibliograficaFormReferenciaBibliograficaListScreen}/>
        <Stack.Screen name='view/referenciaBibliografica/listReferenciaBibliografica'
                      component={ViewReferenciaBibliograficaListReferenciaBibliograficaListScreen}/>
        <Stack.Screen name='view/regiao/formRegiao' component={ViewRegiaoFormRegiaoListScreen}/>
        <Stack.Screen name='view/regiao/listRegiao' component={ViewRegiaoListRegiaoListScreen}/>

        <Stack.Screen name='view/relatorios/extrator' component={ViewRelatoriosExtratorListScreen}/>
        <Stack.Screen name='view/relatorios/formDashboard' component={ViewRelatoriosFormDashboardListScreen}/>
        <Stack.Screen name='view/relatorios/dashboardMontagem' component={DashboardMontagemScreen}/>
        <Stack.Screen name='view/relatorios/formGrafico' component={ViewRelatoriosFormGraficoListScreen}/>
        <Stack.Screen name='view/relatorios/formMapa' component={ViewRelatoriosFormMapaListScreen}/>
        <Stack.Screen name='view/relatorios/formOrganograma' component={ViewRelatoriosFormOrganogramaListScreen}/>
        <Stack.Screen name='view/relatorios/formTabela' component={ViewRelatoriosFormTabelaListScreen}/>
        <Stack.Screen name='view/relatorios/formIndicadorGauge' component={ViewRelatoriosFormIndicadorGaugeListScreen}/>
        <Stack.Screen name='view/relatorios/listDashboard' component={ViewRelatoriosListDashboardListScreen}/>
        <Stack.Screen name='view/relatorios/listGrafico' component={ViewRelatoriosListGraficoListScreen}/>
        <Stack.Screen name='view/relatorios/listMapa' component={ViewRelatoriosListMapaListScreen}/>
        <Stack.Screen name='view/relatorios/listOrganograma' component={ViewRelatoriosListOrganogramaListScreen}/>
        <Stack.Screen name='view/relatorios/listTabela' component={ViewRelatoriosListTabelaListScreen}/>
        <Stack.Screen name='view/relatorios/listIndicadorGauge' component={ViewRelatoriosListIndicadorGaugeListScreen}/>
        <Stack.Screen name='view/relatorios/viewDashboard' component={ViewRelatoriosViewDashboardListScreen}/>
        <Stack.Screen name='view/relatorios/viewGraficoBarrasHorizontal' component={ViewRelatoriosViewGraficoBarrasHorizontalListScreen}/>
        <Stack.Screen name='view/relatorios/viewGraficoBarrasVertical' component={ViewRelatoriosViewGraficoBarrasVerticalListScreen}/>
        <Stack.Screen name='view/relatorios/viewGraficoCircular' component={ViewRelatoriosViewGraficoCircularListScreen}/>
        <Stack.Screen name='view/relatorios/viewGraficoCombinado' component={ViewRelatoriosViewGraficoCombinadoListScreen}/>
        <Stack.Screen name='view/relatorios/viewGraficoLinhas' component={ViewRelatoriosViewGraficoLinhasListScreen}/>
        <Stack.Screen name='view/relatorios/viewGraficoPizza' component={ViewRelatoriosViewGraficoPizzaListScreen}/>
        <Stack.Screen name='view/relatorios/viewMapa' component={ViewRelatoriosViewMapaScreen}/>
        <Stack.Screen name='view/relatorios/viewOrganograma' component={ViewRelatoriosViewOrganogramaListScreen}/>
        <Stack.Screen name='view/relatorios/viewTabela' component={ViewRelatoriosViewTabelaListScreen}/>
        <Stack.Screen name='view/relatorios/viewIndicadorGauge/:id' component={ViewRelatoriosViewIndicadorGaugeScreen}/>

        <Stack.Screen name='view/resultado/formResultado' component={ViewResultadoFormResultadoListScreen}/>
        <Stack.Screen name='view/resultado/listResultado' component={ViewResultadoListResultadoListScreen}/>

        <Stack.Screen name='view/resultadoCobranca/formResultadoCobranca'
                      component={ViewResultadoCobrancaFormResultadoCobrancaListScreen}/>
        <Stack.Screen name='view/resultadoCobranca/listResultadoCobranca'
                      component={ViewResultadoCobrancaListResultadoCobrancaListScreen}/>
        <Stack.Screen name='view/resultadoContato/formResultadoContato'
                      component={ViewResultadoContatoFormResultadoContatoListScreen}/>
        <Stack.Screen name='view/resultadoContato/listResultadoContato'
                      component={ViewResultadoContatoListResultadoContatoListScreen}/>
        <Stack.Screen name='view/resultadoLigacaoNap/formResultadoLigacaoNap'
                      component={ViewResultadoLigacaoNapFormResultadoLigacaoNapListScreen}/>
        <Stack.Screen name='view/resultadoLigacaoNap/listResultadoLigacaoNap'
                      component={ViewResultadoLigacaoNapListResultadoLigacaoNapListScreen}/>
        <Stack.Screen name='view/sala/formSala' component={ViewSalaFormSalaListScreen}/>
        <Stack.Screen name='view/sala/listSala' component={ViewSalaListSalaListScreen}/>

        <Stack.Screen name='view/statusCompromisso/formStatusCompromisso'
                      component={ViewStatusCompromissoFormStatusCompromissoListScreen}/>
        <Stack.Screen name='view/statusCompromisso/listStatusCompromisso'
                      component={ViewStatusCompromissoListStatusCompromissoListScreen}/>
        <Stack.Screen name='view/subCategoria/formSubCategoria' component={ViewSubCategoriaFormSubCategoriaListScreen}/>
        <Stack.Screen name='view/subCategoria/listSubCategoria' component={ViewSubCategoriaListSubCategoriaListScreen}/>

        <Stack.Screen name='view/telefone/formTelefone' component={ViewTelefoneFormTelefoneListScreen}/>
        <Stack.Screen name='view/telefone/listTelefone' component={ViewTelefoneListTelefoneListScreen}/>
        <Stack.Screen name='view/tempoAula/formTempoAula' component={ViewTempoAulaFormTempoAulaListScreen}/>
        <Stack.Screen name='view/tempoAula/listTempoAula' component={ViewTempoAulaListTempoAulaListScreen}/>
        <Stack.Screen name='view/tipoAcao/formTipoAcao' component={ViewTipoAcaoFormTipoAcaoListScreen}/>
        <Stack.Screen name='view/tipoAcao/listTipoAcao' component={ViewTipoAcaoListTipoAcaoListScreen}/>
        <Stack.Screen name='view/tipoAgenda/formTipoAgenda' component={ViewTipoAgendaFormTipoAgendaListScreen}/>
        <Stack.Screen name='view/tipoAgenda/listTipoAgenda' component={ViewTipoAgendaListTipoAgendaListScreen}/>
        <Stack.Screen name='view/tipoAtividade/formTipoAtividade'
                      component={ViewTipoAtividadeFormTipoAtividadeListScreen}/>
        <Stack.Screen name='view/tipoAtividade/listTipoAtividade'
                      component={ViewTipoAtividadeListTipoAtividadeListScreen}/>
        <Stack.Screen name='view/tipoCanal/formTipoCanal' component={ViewTipoCanalFormTipoCanalListScreen}/>
        <Stack.Screen name='view/tipoCanal/listTipoCanal' component={ViewTipoCanalListTipoCanalListScreen}/>
        <Stack.Screen name='view/tipoContrato/formTipoContrato' component={ViewTipoContratoFormTipoContratoListScreen}/>
        <Stack.Screen name='view/tipoContrato/listTipoContrato' component={ViewTipoContratoListTipoContratoListScreen}/>

        <Stack.Screen name='view/tipoCurso/formTipoCurso' component={ViewTipoCursoFormTipoCursoListScreen}/>
        <Stack.Screen name='view/tipoCurso/listTipoCurso' component={ViewTipoCursoListTipoCursoListScreen}/>
        <Stack.Screen name='view/tipoHistorico/formTipoHistorico'
                      component={ViewTipoHistoricoFormTipoHistoricoListScreen}/>
        <Stack.Screen name='view/tipoHistorico/listTipoHistorico'
                      component={ViewTipoHistoricoListTipoHistoricoListScreen}/>
        <Stack.Screen name='view/tipoMatrizCurricular/formTipoMatrizCurricular'
                      component={ViewTipoMatrizCurricularFormTipoMatrizCurricularListScreen}/>
        <Stack.Screen name='view/tipoMatrizCurricular/listTipoMatrizCurricular'
                      component={ViewTipoMatrizCurricularListTipoMatrizCurricularListScreen}/>
        <Stack.Screen name='view/tipoPausa/formTipoPausa' component={ViewTipoPausaFormTipoPausaListScreen}/>
        <Stack.Screen name='view/tipoPausa/listTipoPausa' component={ViewTipoPausaListTipoPausaListScreen}/>
        <Stack.Screen name='view/tipoSala/formTipoSala' component={ViewTipoSalaFormTipoSalaListScreen}/>
        <Stack.Screen name='view/tipoSala/listTipoSala' component={ViewTipoSalaListTipoSalaListScreen}/>
        <Stack.Screen name='view/tipoTelefone/formTipoTelefone' component={ViewTipoTelefoneFormTipoTelefoneListScreen}/>
        <Stack.Screen name='view/tipoTelefone/listTipoTelefone' component={ViewTipoTelefoneListTipoTelefoneListScreen}/>
        <Stack.Screen name='view/tipoUnidade/formTipoUnidade' component={ViewTipoUnidadeFormTipoUnidadeListScreen}/>
        <Stack.Screen name='view/tipoUnidade/listTipoUnidade' component={ViewTipoUnidadeListTipoUnidadeListScreen}/>

        <Stack.Screen name='view/turma/formAjusteCalendario' component={ViewTurmaFormAjusteCalendarioListScreen}/>
        <Stack.Screen name='view/turma/listTurma' component={ViewTurmaListTurmaListScreen}/>
        <Stack.Screen name='view/turma/listTurmaFinalizando' component={ViewTurmaListTurmaFinalizandoListScreen}/>
        <Stack.Screen name='view/turma/recriarCalendarioAcademico' component={ViewTurmaRecriarCalendarioAcademicoListScreen}/>
        <Stack.Screen name='view/turno/formTurno' component={ViewTurnoFormTurnoListScreen}/>
        <Stack.Screen name='view/turno/listTurno' component={ViewTurnoListTurnoListScreen}/>

        <Stack.Screen name='view/turnoEducacao/formTurnoEducacao'
                      component={ViewTurnoEducacaoFormTurnoEducacaoListScreen}/>
        <Stack.Screen name='view/turnoEducacao/listTurnoEducacao'
                      component={ViewTurnoEducacaoListTurnoEducacaoListScreen}/>
        <Stack.Screen name='view/turnoFuncionario/formTurnoFuncionario'
                      component={ViewTurnoFuncionarioFormTurnoFuncionarioListScreen}/>
        <Stack.Screen name='view/turnoFuncionario/listTurnoFuncionario'
                      component={ViewTurnoFuncionarioListTurnoFuncionarioListScreen}/>

        <Stack.Screen name='view/turnoTrabalho/formTurnoTrabalho'
                      component={ViewTurnoTrabalhoFormTurnoTrabalhoListScreen}/>
        <Stack.Screen name='view/turnoTrabalho/listTurnoTrabalho'
                      component={ViewTurnoTrabalhoListTurnoTrabalhoListScreen}/>
        <Stack.Screen name='view/turnoUsuario/listTurnoUsuario' component={ViewTurnoUsuarioListTurnoUsuarioListScreen}/>

        <Stack.Screen name='view/unidade/formRede' component={ViewUnidadeFormRedeListScreen}/>
        <Stack.Screen name='view/unidade/formUnidade' component={ViewUnidadeFormUnidadeListScreen}/>
        <Stack.Screen name='view/unidade/listRede' component={ViewUnidadeListRedeListScreen}/>
        <Stack.Screen name='view/unidade/listUnidade' component={ViewUnidadeListUnidadeListScreen}/>
        <Stack.Screen name='view/usuario/camposUsuarioTabView' component={ViewUsuarioCamposUsuarioTabViewListScreen}/>

        <Stack.Screen name='view/usuario/formUsuario' component={ViewUsuarioFormUsuarioListScreen}/>
        <Stack.Screen name='view/usuario/formUsuarioRapido' component={ViewUsuarioFormUsuarioRapidoListScreen}/>
        <Stack.Screen name='view/usuario/listUsuario' component={ViewUsuarioListUsuarioListScreen}/>
        <Stack.Screen name='view/usuario/cadastro' component={CadastroUsuarioMobileScreen} options={{title: 'Cadastro de Usuário'}}/>

        <Stack.Screen name='view/valorCurso/formValorCurso' component={ViewValorCursoFormValorCursoListScreen}/>
        <Stack.Screen name='view/valorCurso/listValorCurso' component={ViewValorCursoListValorCursoListScreen}/>
        <Stack.Screen name='view/valorProduto/formValorProduto' component={ViewValorProdutoFormValorProdutoListScreen}/>
        <Stack.Screen name='view/valorProduto/listValorProduto' component={ViewValorProdutoListValorProdutoListScreen}/><Stack.Screen
            name='view/tema/listTemas' component={ViewTemaListTemasListScreen}/></Stack.Navigator></NavigationContainer></QueryClientProvider>
}

export default function App() {
    return <SweetAlertProvider><AuthProvider><AuthenticatedApp/></AuthProvider></SweetAlertProvider>
}

function AuthenticatedApp() {
    const {session, ready} = useAuth();
    if (!ready) return null;
    return session ? <AppRoutes/> : <LoginScreen/>
}
