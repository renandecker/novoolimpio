package br.com.sol7.olimpio.basico.feriado.service;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;
import java.util.Date;
import br.com.sol7.olimpio.basico.feriado.dto.FeriadoRequest;
import br.com.sol7.olimpio.basico.feriado.dto.FeriadoResponse;
import br.com.sol7.olimpio.basico.feriado.entity.Feriado;
import br.com.sol7.olimpio.basico.feriado.repository.FeriadoRepository;

@ApplicationScoped
@WithTransaction
public class FeriadoService {

    @Inject FeriadoRepository repository;
    @Inject FeriadoAjusteService feriadoAjusteService;

    public Uni<List<FeriadoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<FeriadoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<FeriadoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Feriado not found"))
                .map(this::toResponse);
    }

    public Uni<FeriadoResponse> create(FeriadoRequest r) {
        var e = new Feriado();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<FeriadoResponse> update(Long id, FeriadoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Feriado not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Feriado not found")));
    }

    private void apply(Feriado e, FeriadoRequest r) { e.nome = r.nome(); e.descricao = r.descricao(); e.tipoFeriao = r.tipoFeriao(); e.dataFeriado = r.dataFeriado(); e.dataCriacao = r.dataCriacao(); e.nacional = r.nacional(); e.todosCursos = r.todosCursos(); e.feriadoFixo = r.feriadoFixo(); }

    private FeriadoResponse toResponse(Feriado e) {
        return new FeriadoResponse(e.id, e.nome, e.descricao, e.tipoFeriao, e.dataFeriado, e.dataCriacao, e.nacional, e.todosCursos, e.feriadoFixo);
    }


    // Migrado de FeriadoController.atualizarOferecimento (src/main/java/br/com/sol7/olimpio/control/controllers/basico/FeriadoController.java:350, camada controller)
    // Logica original (adaptar):
    // public String atualizarOferecimento() {
    //         try {
    //             temoferecimento = true;
    //             manteroferecimento = false;
    //             ajustar = false;
    //             naoajustar = false;
    //             MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.SAVE, "global.sucess", "validation", "Ajustados oferecimentos com sucesso");
    //             return saveOrUpdate(saving);
    //         } catch (Exception e) {
    //             e.printStackTrace();
    //             MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.INFO, "global.error", "validation", "Ocorreu um erro ao ajustar oferecimentos");
    //         }
    // // ... (truncado, ver fonte original)
    public Uni<String> atualizarOferecimento() {
        return feriadoAjusteService.executarAjusteGeral();
    }


    // Migrado de FeriadoController.atualizarOferecimentoNaoAjustado (src/main/java/br/com/sol7/olimpio/control/controllers/basico/FeriadoController.java:365, camada controller)
    // Logica original (adaptar):
    // public String atualizarOferecimentoNaoAjustado() {
    //         try {
    //             temoferecimento = true;
    //             manteroferecimento = false;
    //             ajustar = false;
    //             naoajustar = true;
    //             MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.SAVE, "global.sucess", "validation", "Criado ajuste ocorrencias não ajusteveis com sucesso");
    //             return saveOrUpdate(saving);
    //         } catch (Exception e) {
    //             e.printStackTrace();
    //             MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.INFO, "global.error", "validation", "Ocorreu um erro ao criar ajuste ocorrencias não ajusteveis");
    //         }
    // // ... (truncado, ver fonte original)
    public Uni<String> atualizarOferecimentoNaoAjustado() {
        return feriadoAjusteService.executarAjusteNaoSelecionados();
    }


    // Migrado de FeriadoController.atualizarOferecimentoAjustados (src/main/java/br/com/sol7/olimpio/control/controllers/basico/FeriadoController.java:381, camada controller)
    // Logica original (adaptar):
    // public String atualizarOferecimentoAjustados() {
    //         try {
    //             temoferecimento = true;
    //             manteroferecimento = false;
    //             ajustar = true;
    //             naoajustar = false;
    //             MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.SAVE, "global.sucess", "validation", "Criado ajuste ocorrencias ajusteveis com sucesso");
    //             return saveOrUpdate(saving);
    //         } catch (Exception e) {
    //             e.printStackTrace();
    //             MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.INFO, "global.error", "validation", "Ocorreu um erro ao criar ajuste ocorrencias ajusteveis");
    //         }
    // // ... (truncado, ver fonte original)
    public Uni<String> atualizarOferecimentoAjustados() {
        return feriadoAjusteService.executarAjusteSelecionados();
    }


    // Migrado de FeriadoController.buscarFeriadoApi (src/main/java/br/com/sol7/olimpio/control/controllers/basico/FeriadoController.java:570, camada controller)
    // Logica original (adaptar):
    // public void buscarFeriadoApi() {
    // 
    //     }
    public Uni<Void> buscarFeriadoApi() {
        // Obs: metodo vazio no legado (sem logica de dados portaavel)
        return Uni.createFrom().voidItem();
    }


    // Migrado de FeriadoController.gerarNovasDatas (src/main/java/br/com/sol7/olimpio/control/controllers/basico/FeriadoController.java:585, camada controller)
    // Logica original (adaptar):
    // public void gerarNovasDatas() {
    //         Calendar calendario = Calendar.getInstance();
    //         try {
    //             List<Feriado> lista = feriadoService.buscarFeriadoFixo();
    // 
    //             for (Feriado f : lista) {
    //                 Feriado feriadoNovo = new Feriado();
    //                 calendario.setTime(f.getDataFeriado());
    //                 int valor = anoNovo - calendario.get(Calendar.YEAR);
    //                 calendario.add(Calendar.YEAR, valor);
    //                 List<Unidade> listaTemp = new ArrayList<>();
    //                 for (Unidade uu : f.getUnidade()) {
    // // ... (truncado, ver fonte original)
    public Uni<Void> gerarNovasDatas() {
        // Obs: depende do ano alvo (campo de tela do controller JSF) e das relacoes
        // unidade/tipoCurso do Feriado (nao mapeadas localmente, outros microservicos)
        return Uni.createFrom().voidItem();
    }


    // Migrado de FeriadoService.buscarFeriadoUnidade (src/main/java/br/com/sol7/olimpio/service/services/basico/FeriadoService.java:54, camada service)
    // Observacao: parametro unidadeId: era Unidade (referencia por id); parametro tipoCursoId: era TipoCurso (referencia por id)
    // JPQL original: Select f from Feriado f left join f.unidade u left join f.tipoCurso t where  ((u IN (?1)) or f.nacional = true )  and f.dataFeriado = ?2 and (t IN (?3) or f.todosCursos = true)
    // Logica original (adaptar):
    // public List<Feriado> buscarFeriadoUnidade(Date data, Unidade unidade, TipoCurso tipoCurso) {
    //         return getFeriadoRepository().buscarFeriadoUnidade(unidade, data, tipoCurso);
    //     }
    public Uni<List<Long>> buscarFeriadoUnidade(Date data, Long unidadeId, Long tipoCursoId) {
                return repository.buscarFeriadoUnidade(unidadeId, data, tipoCursoId).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de FeriadoService.buscarFeriadoFixo (src/main/java/br/com/sol7/olimpio/service/services/basico/FeriadoService.java:58, camada service)
    // JPQL original: Select f from Feriado f left join fetch f.unidade u where f.feriadoFixo = true
    // Logica original (adaptar):
    // public List<Feriado> buscarFeriadoFixo() {
    //         return getFeriadoRepository().buscarFeriadoFixo();
    //     }
    public Uni<List<Long>> buscarFeriadoFixo() {
                return repository.buscarFeriadoFixo().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de FeriadoService.verificarFeriadoExistente (src/main/java/br/com/sol7/olimpio/service/services/basico/FeriadoService.java:62, camada service)
    // Logica original (adaptar):
    // public Boolean verificarFeriadoExistente(Date data) {
    //         return !ObjectUtil.nullOrEmpty(getFeriadoRepository().verificarFeriadoExistente(data));
    //     }
    public Uni<Boolean> verificarFeriadoExistente(Date data) {
                return repository.verificarFeriadoExistente(data).map(list -> !list.isEmpty());
    }


    // Migrado de FeriadoService.buscarFeriadoDaUnidade (src/main/java/br/com/sol7/olimpio/service/services/basico/FeriadoService.java:70, camada service)
    // Observacao: parametro unidadeId: era Unidade (referencia por id)
    // JPQL original: Select distinct  f from Feriado f left join fetch f.unidade u where (u IN (?1) or f.nacional = true) and f.dataFeriado between ?2 and ?3
    // Logica original (adaptar):
    // public List<Feriado> buscarFeriadoDaUnidade(Unidade unidade, Date inicio, Date fim) {
    //         return getFeriadoRepository().buscarFeriadoDaUnidade(unidade, inicio, fim);
    //     }
    public Uni<List<Long>> buscarFeriadoDaUnidade(Long unidadeId, Date inicio, Date fim) {
                return repository.buscarFeriadoDaUnidade(unidadeId, inicio, fim).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de FeriadoService.buscarFeriadoDaUnidadeList (src/main/java/br/com/sol7/olimpio/service/services/basico/FeriadoService.java:74, camada service)
    // JPQL original: Select distinct  f from Feriado f left join fetch f.unidade u where (u IN (?1) or f.nacional = true) and f.dataFeriado between ?2 and ?3
    // Logica original (adaptar):
    // public List<Feriado> buscarFeriadoDaUnidadeList(List<Unidade> unidade, Date inicio, Date fim) {
    //         return getFeriadoRepository().buscarFeriadoDaUnidadeList(unidade, inicio, fim);
    //     }
    public Uni<List<Long>> buscarFeriadoDaUnidadeList(List<Long> unidade, Date inicio, Date fim) {
                return repository.buscarFeriadoDaUnidadeList(unidade, inicio, fim).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de FeriadoService.buscarFeriadoDaUnidadetipoCurso (src/main/java/br/com/sol7/olimpio/service/services/basico/FeriadoService.java:78, camada service)
    // JPQL original: Select distinct  f from Feriado f left join f.unidade u where  f.dataFeriado between ?1 and ?2
    // Logica original (adaptar):
    // public List<Feriado> buscarFeriadoDaUnidadetipoCurso(Date inicio, Date fim) {
    //         return getFeriadoRepository().buscarFeriadoDaUnidadetipoCurso(inicio, fim);
    //     }
    public Uni<List<Long>> buscarFeriadoDaUnidadetipoCurso(Date inicio, Date fim) {
                return repository.buscarFeriadoDaUnidadetipoCurso(inicio, fim).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de FeriadoService.buscarFeriadoComUnidades (src/main/java/br/com/sol7/olimpio/service/services/basico/FeriadoService.java:82, camada service)
    // Observacao: retorno: era Feriado (referencia por id); parametro entityId: era Feriado (referencia por id)
    // JPQL original: Select f from Feriado f left join fetch f.unidade u where  f = ?1
    // Logica original (adaptar):
    // public Feriado buscarFeriadoComUnidades(Feriado entity) {
    //         return getFeriadoRepository().buscarFeriadoComUnidades(entity);
    //     }
    public Uni<Long> buscarFeriadoComUnidades(Long entityId) {
                return repository.buscarFeriadoComUnidades(entityId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    // Migrado de FeriadoService.buscarFeriadosComUnidadeData (src/main/java/br/com/sol7/olimpio/service/services/basico/FeriadoService.java:86, camada service)
    // Observacao: parametro unidadeId: era Unidade (referencia por id)
    // JPQL original: Select f from Feriado f left join f.unidade u left join f.tipoCurso tc where (u = (?1) or f.nacional = true) and f.dataFeriado = ?2 and tc is null
    // Logica original (adaptar):
    // public List<Feriado> buscarFeriadosComUnidadeData(Unidade unidade, Date data) {
    //         return getFeriadoRepository().buscarFeriadosComUnidadeData(unidade, data);
    //     }
    public Uni<List<Long>> buscarFeriadosComUnidadeData(Long unidadeId, Date data) {
                return repository.buscarFeriadosComUnidadeData(unidadeId, data).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de FeriadoService.buscarFeriadoComTipoCurso (src/main/java/br/com/sol7/olimpio/service/services/basico/FeriadoService.java:90, camada service)
    // Observacao: retorno: era Feriado (referencia por id); parametro entityId: era Feriado (referencia por id)
    // JPQL original: Select f from Feriado f left join fetch f.tipoCurso where f = ?1
    // Logica original (adaptar):
    // public Feriado buscarFeriadoComTipoCurso(Feriado entity) {
    //         return getFeriadoRepository().buscarFeriadoComTipoCurso(entity);
    //     }
    public Uni<Long> buscarFeriadoComTipoCurso(Long entityId) {
                return repository.buscarFeriadoComTipoCurso(entityId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    // Migrado de FeriadoService.atualizarOferecimento (src/main/java/br/com/sol7/olimpio/service/services/basico/FeriadoService.java:94, camada service)
    // Logica original (adaptar):
    // public void atualizarOferecimento(List<OcorrenciaComponenteCurricular> ocorrenciaComponenteCurriculars) {
    //         try {
    //             for (OcorrenciaComponenteCurricular oco : ocorrenciaComponenteCurriculars) {
    //                 List<CadernoComponenteCurricular> cadernoComponenteCurriculars = cadernoComponenteCurricularService.buscarCadernoChamadaOcorrencias(Arrays.asList(oco));
    //                 if (ObjectUtil.nullOrEmpty(cadernoComponenteCurriculars)) {
    //                     ocorrenciaComponenteCurricularService.delete(oco);
    //                 } else {
    //                     hibernateService.executeUpdateSQL("UPDATE  edc_caderno_componente_curricular SET presenca = 'r' " +
    //                             "  ...
    // // ... (truncado, ver fonte original)
    public Uni<Void> atualizarOferecimento2(List<Long> ocorrenciaComponenteCurriculars) {
        // Obs: depende do microservico educacao (OcorrenciaComponenteCurricular,
        // CadernoComponenteCurricular e tabelas edc_*)
        return Uni.createFrom().voidItem();
    }

}
