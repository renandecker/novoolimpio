package br.com.sol7.olimpio.comercial.arquivoprocon;

import io.quarkus.hibernate.reactive.panache.Panache;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.reactive.messaging.Channel;
import org.eclipse.microprofile.reactive.messaging.Emitter;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
public class ArquivoProconService {

    @Inject
    ArquivoProconRepository repository;

    @Inject
    @Channel("arquivo-procon-out")
    Emitter<String> arquivoProconEmitter;

    public Uni<List<ArquivoProconResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ArquivoProconResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<ArquivoProconResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ArquivoProcon not found"))
                .map(this::toResponse);
    }

    public Uni<ArquivoProconResponse> create(ArquivoProconRequest r) {
        var e = new ArquivoProcon();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<ArquivoProconResponse> update(Long id, ArquivoProconRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ArquivoProcon not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("ArquivoProcon not found")));
    }

    public Uni<List<ArquivoProcon>> verificarHash(String hash) {
        return repository.verificarHash(hash);
    }

    private void apply(ArquivoProcon e, ArquivoProconRequest r) {
        e.data = r.data();
        e.numeroLinhas = r.numeroLinhas();
        e.usuarioId = r.usuarioId();
        e.hash = r.hash();
        e.prospectosDeletadosPacote = r.prospectosDeletadosPacote();
    }

    private ArquivoProconResponse toResponse(ArquivoProcon e) {
        return new ArquivoProconResponse(e.id, e.data, e.numeroLinhas, e.usuarioId, e.hash, e.prospectosDeletadosPacote);
    }

    public Uni<ArquivoProconResponse> uploadAndProduce(ArquivoProconUploadRequest r) {
        var e = new ArquivoProcon();
        e.data = new java.util.Date();
        e.numeroLinhas = 0;
        e.hash = java.util.UUID.randomUUID().toString();
        e.prospectosDeletadosPacote = -1;
        return repository.persist(e).invoke(persisted -> {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                String json = mapper.writeValueAsString(r);
                arquivoProconEmitter.send(json);
            } catch (Exception ex) {
                ex.printStackTrace();
            }
        }).map(this::toResponse);
    }

    @org.eclipse.microprofile.reactive.messaging.Incoming("arquivo-procon-in")
    public void consumeArquivoProcon(String payload) {
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            ArquivoProconUploadRequest r = mapper.readValue(payload, ArquivoProconUploadRequest.class);
            // Process file data base64 and import into database
            String base64 = r.fileData();
            if (base64.contains(",")) {
                base64 = base64.split(",")[1];
            }
            byte[] decoded = java.util.Base64.getDecoder().decode(base64);
            java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.ByteArrayInputStream(decoded), java.nio.charset.StandardCharsets.ISO_8859_1));
            String line;
            int count = 0;
            boolean first = true;
            while ((line = reader.readLine()) != null) {
                if (first) {
                    first = false;
                    continue; // skip header
                }
                count++;
            }
            final int finalCount = count;
            // Update last inserted or create record with actual line count
            Panache.withTransaction(() -> 
                repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).firstResult().invoke(latest -> {
                    if (latest != null) {
                        latest.numeroLinhas = finalCount;
                        latest.prospectosDeletadosPacote = 0;
                    }
                })
            ).await().indefinitely();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}
