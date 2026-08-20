package br.com.sol7.olimpio.comercial.campo;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class CampoService {

    @Inject
    CampoRepository repository;

    public Uni<List<CampoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<CampoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<CampoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Campo not found"))
                .map(this::toResponse);
    }

    public Uni<CampoResponse> create(CampoRequest r) {
        var e = new Campo();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<CampoResponse> update(Long id, CampoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Campo not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Campo not found")));
    }

    private void apply(Campo e, CampoRequest r) {
        e.nome = r.nome();
        e.rotulo = r.rotulo();
        e.maskara = r.maskara();
        e.tipo = r.tipo();
        e.tamanho = r.tamanho();
        e.categoriaId = r.categoriaId();
        e.flagNome = r.flagNome();
        e.flagTelefone = r.flagTelefone();
        e.flagEmail = r.flagEmail();
        e.flagRedeSocial = r.flagRedeSocial();
        e.flagEndereco = r.flagEndereco();
        e.flagIdade = r.flagIdade();
        e.flagBanco = r.flagBanco();
        e.flagMaskara = r.flagMaskara();
        e.flagDataNascimento = r.flagDataNascimento();
        e.flagLogradouro = r.flagLogradouro();
        e.flagUpload = r.flagUpload();
    }

    private CampoResponse toResponse(Campo e) {
        return new CampoResponse(e.id, e.nome, e.rotulo, e.maskara, e.tipo, e.tamanho, e.categoriaId, e.flagNome, e.flagTelefone, e.flagEmail, e.flagRedeSocial, e.flagEndereco, e.flagIdade, e.flagBanco, e.flagMaskara, e.flagDataNascimento, e.flagLogradouro, e.flagUpload);
    }


    // Migrado de CampoController.autoComplete (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/CampoController.java:135, camada controller)
    // Logica original (adaptar):
    // public List<Campo> autoComplete(String query) {
    //         if (ObjectUtil.nullOrEmpty(query)) {
    //             return campoService.buscaDezPrimeiros();
    //         }
    //         return campoService.autoComplete(query);
    //     }
    public Uni<List<Long>> autoComplete(String query) {
        if (query == null || query.isEmpty()) {
            return repository.buscaDezPrimeiros().map(list -> list.stream().map(x -> x.id).toList());
        }
        return repository.autoComplete(query.toLowerCase()).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de CampoController.autoCompleteInformacao (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/CampoController.java:142, camada controller)
    // Logica original (adaptar):
    // public List<CampoInformacao> autoCompleteInformacao(String query) {
    //         if (ObjectUtil.nullOrEmpty(query)) {
    //             return new ArrayList<>();
    //         }
    //         return campoInformacaoService.autoComplete(query);
    //     }
    public Uni<List<Long>> autoCompleteInformacao(String query) {
        // Obs: depende do modulo CampoInformacao nao migrado
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de CampoController.autoCompleteInformacaoComFiltro (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/CampoController.java:149, camada controller)
    // Logica original (adaptar):
    // public List<CampoInformacao> autoCompleteInformacaoComFiltro(String query) {
    //         FacesContext context = FacesContext.getCurrentInstance();
    //         Campo o = (Campo) UIComponent.getCurrentComponent(context).getAttributes().get("filter");
    // 
    //         if (ObjectUtil.nullOrEmpty(query)) {
    //             return campoInformacaoService.autoCompleteComCampoSemConsulta(o);
    //         }
    //         return campoInformacaoService.autoCompleteComCampo(o, query);
    //     }
    public Uni<List<Long>> autoCompleteInformacaoComFiltro(String query) {
        // Obs: metodo de UI (filtro do FacesContext); depende do modulo CampoInformacao nao migrado
        return Uni.createFrom().item(java.util.List.of());
    }

}
