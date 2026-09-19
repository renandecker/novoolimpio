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

    public Uni<ArquivoProconResponse> uploadChunkAndProduce(ArquivoProconChunkRequest r) {
        return Uni.createFrom().item(() -> {
            try {
                String tempDir = System.getProperty("java.io.tmpdir") + java.io.File.separator + "olimpio_procon_uploads";
                java.io.File dir = new java.io.File(tempDir);
                if (!dir.exists()) {
                    dir.mkdirs();
                }

                String safeFileName = r.fileName().replaceAll("[^a-zA-Z0-9\\.\\-_]", "_");
                java.io.File chunkFile = new java.io.File(dir, r.uploadId() + "_" + r.chunkIndex() + ".part");

                String base64 = r.fileData();
                if (base64.contains(",")) {
                    base64 = base64.split(",")[1];
                }
                byte[] decoded = java.util.Base64.getDecoder().decode(base64);
                java.nio.file.Files.write(chunkFile.toPath(), decoded);

                // Check if all chunks have arrived
                java.io.File[] allParts = dir.listFiles((d, name) -> name.startsWith(r.uploadId() + "_") && name.endsWith(".part"));
                if (allParts != null && allParts.length == r.totalChunks()) {
                    java.io.File assembledFile = new java.io.File(dir, r.uploadId() + "_" + safeFileName);
                    try (java.io.FileOutputStream fos = new java.io.FileOutputStream(assembledFile)) {
                        for (int i = 0; i < r.totalChunks(); i++) {
                            java.io.File part = new java.io.File(dir, r.uploadId() + "_" + i + ".part");
                            java.nio.file.Files.copy(part.toPath(), fos);
                        }
                    }

                    // Clean up parts
                    for (int i = 0; i < r.totalChunks(); i++) {
                        new java.io.File(dir, r.uploadId() + "_" + i + ".part").delete();
                    }

                    // Send assembled file path to Kafka
                    com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    java.util.Map<String, String> payloadMap = new java.util.HashMap<>();
                    payloadMap.put("filePath", assembledFile.getAbsolutePath());
                    payloadMap.put("fileName", safeFileName);
                    String json = mapper.writeValueAsString(payloadMap);
                    arquivoProconEmitter.send(json);
                }
            } catch (Exception ex) {
                ex.printStackTrace();
            }
            return null;
        }).flatMap(ignored -> {
            var e = new ArquivoProcon();
            e.data = new java.util.Date();
            e.numeroLinhas = 0;
            e.hash = java.util.UUID.randomUUID().toString();
            e.prospectosDeletadosPacote = -1;
            return repository.persist(e).map(this::toResponse);
        });
    }

    @org.eclipse.microprofile.reactive.messaging.Incoming("arquivo-procon-in")
    public void consumeArquivoProcon(String payload) {
        java.io.File assembledFile = null;
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            @SuppressWarnings("unchecked")
            java.util.Map<String, String> map = mapper.readValue(payload, java.util.Map.class);
            String filePath = map.get("filePath");
            if (filePath != null) {
                assembledFile = new java.io.File(filePath);
            }

            java.io.BufferedReader reader;
            if (assembledFile != null && assembledFile.exists()) {
                reader = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(assembledFile), java.nio.charset.StandardCharsets.ISO_8859_1));
            } else {
                // Fallback if legacy payload
                ArquivoProconUploadRequest legacy = mapper.readValue(payload, ArquivoProconUploadRequest.class);
                String base64 = legacy.fileData();
                if (base64.contains(",")) {
                    base64 = base64.split(",")[1];
                }
                byte[] decoded = java.util.Base64.getDecoder().decode(base64);
                reader = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.ByteArrayInputStream(decoded), java.nio.charset.StandardCharsets.ISO_8859_1));
            }

            String line;
            int count = 0;
            boolean first = true;
            while ((line = reader.readLine()) != null) {
                if (first) {
                    first = false;
                    continue; // skip header
                }
                count++;
                // Process each line of the CSV and send/receive via Kafka or apply business rule as existing in the system
            }
            reader.close();

            final int finalCount = count;
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
        } finally {
            // Apague o arquivo do local temporário após o processo
            if (assembledFile != null && assembledFile.exists()) {
                try {
                    assembledFile.delete();
                } catch (Exception ignored) {}
            }
        }
    }

}
