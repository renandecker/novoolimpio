package br.com.sol7.olimpio.educacao.apresentacao;

import br.com.sol7.olimpio.educacao.apresentacaovideo.ApresentacaoVideo;
import br.com.sol7.olimpio.educacao.apresentacaovideo.ApresentacaoVideoRepository;
import br.com.sol7.olimpio.educacao.apresentacaovideo.ApresentacaoVideoResponse;
import br.com.sol7.olimpio.educacao.shared.FileStorageService;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class ApresentacaoService {

    @Inject
    ApresentacaoRepository repository;

    @Inject
    ApresentacaoVideoRepository videoRepository;

    @Inject
    FileStorageService fileStorageService;

    public Uni<List<ApresentacaoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ApresentacaoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("ordem").ascending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<java.util.List<ApresentacaoResponse>> ordenado() {
        return repository.listarApresentacoesOrdenado().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<java.util.List<String>> imagens() {
        return repository.listarApresentacoesOrdenado().map(items -> items.stream().map(a -> a.local).toList());
    }

    public Uni<ApresentacaoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Apresentacao not found"))
                .map(this::toResponse);
    }

    public Uni<ApresentacaoResponse> create(ApresentacaoRequest r) {
        var e = new Apresentacao();
        if (r.ordem() != null) {
            apply(e, r);
            return repository.persist(e).replaceWith(() -> toResponse(e));
        }
        return repository.maiorOrdem().onItem().transformToUni(max -> {
            e.ordem = max + 1;
            e.local = r.local();
            return repository.persist(e).replaceWith(() -> toResponse(e));
        });
    }

    public Uni<ApresentacaoResponse> update(Long id, ApresentacaoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Apresentacao not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<ApresentacaoResponse> updateOrdem(Long id, Integer ordem) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Apresentacao not found"))
                .invoke(e -> e.ordem = ordem != null ? ordem : 0)
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Apresentacao not found"))
                .chain(e -> {
                    fileStorageService.deleteApresentacaoImagem(e.local);
                    return repository.deleteById(id);
                })
                .onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Apresentacao not found")));
    }

    public Uni<ApresentacaoResponse> uploadImagem(FileUpload fileUpload, Integer ordem) {
        try (InputStream is = Files.newInputStream(fileUpload.uploadedFile())) {
            String relativePath = fileStorageService.saveApresentacaoImagem(is, fileUpload.fileName());
            var e = new Apresentacao();
            e.local = relativePath;
            e.ordem = ordem != null ? ordem : 0;
            if (e.ordem == 0) {
                return repository.maiorOrdem().onItem().transformToUni(max -> {
                    e.ordem = max + 1;
                    return repository.persist(e).replaceWith(() -> toResponse(e));
                });
            }
            return repository.persist(e).replaceWith(() -> toResponse(e));
        } catch (IOException e) {
            return Uni.createFrom().failure(new WebApplicationException("Erro ao fazer upload da imagem", Response.Status.INTERNAL_SERVER_ERROR));
        }
    }

    public Uni<ApresentacaoVideoResponse> uploadVideo(FileUpload fileUpload, String titulo) {
        try (InputStream is = Files.newInputStream(fileUpload.uploadedFile())) {
            String relativePath = fileStorageService.saveApresentacaoVideo(is, fileUpload.fileName());
            var video = new ApresentacaoVideo();
            video.titulo = titulo != null && !titulo.isBlank() ? titulo : fileUpload.fileName();
            video.local = relativePath;
            return videoRepository.persist(video).replaceWith(() -> toVideoResponse(video));
        } catch (IOException e) {
            return Uni.createFrom().failure(new WebApplicationException("Erro ao fazer upload do vídeo", Response.Status.INTERNAL_SERVER_ERROR));
        }
    }

    private void apply(Apresentacao e, ApresentacaoRequest r) {
        e.ordem = r.ordem();
        e.local = r.local();
    }

    private ApresentacaoResponse toResponse(Apresentacao e) {
        return new ApresentacaoResponse(e.id, e.ordem, e.local);
    }

    private ApresentacaoVideoResponse toVideoResponse(ApresentacaoVideo e) {
        return new ApresentacaoVideoResponse(e.id, e.titulo, e.local);
    }
}
