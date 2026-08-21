package br.com.sol7.olimpio.relatorios.documento.service;

import br.com.sol7.olimpio.relatorios.documento.dto.DocumentTemplateRequest;
import br.com.sol7.olimpio.relatorios.documento.entity.DocumentTemplate;
import br.com.sol7.olimpio.relatorios.documento.repository.DocumentTemplateRepository;
import io.quarkus.runtime.StartupEvent;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

@ApplicationScoped
public class DocumentTemplateSeeder {

    @Inject
    DocumentTemplateRepository repository;

    @Inject
    DocumentTemplateService templateService;

    void onStart(@Observes StartupEvent ev) {
        criarTemplatesPadrao().subscribe().with(
                v -> System.out.println("Templates padrão criados com sucesso"),
                e -> System.err.println("Erro ao criar templates padrão: " + e.getMessage())
        );
    }

    private Uni<Void> criarTemplatesPadrao() {
        return repository.count()
                .onItem().transformToUni(count -> {
                    if (count > 0) {
                        return Uni.createFrom().voidItem();
                    }
                    return criarTemplateBasico();
                });
    }

    private Uni<Void> criarTemplateBasico() {
        String templateXml = """
            <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
                <w:body>
                    <w:p>
                        <w:r>
                            <w:t>RELATÓRIO: {{TITULO}}</w:t>
                        </w:r>
                    </w:p>
                    <w:p>
                        <w:r>
                            <w:t>Data: {{DATA_ATUAL}}</w:t>
                        </w:r>
                    </w:p>
                    <w:p>
                        <w:r>
                            <w:t>Total de Registros: {{TOTAL_REGISTROS}}</w:t>
                        </w:r>
                    </w:p>
                    <w:tbl>
                        <w:tr>
                            <w:tc>
                                <w:p>
                                    <w:r>
                                        <w:t>Coluna</w:t>
                                    </w:r>
                                </w:p>
                            </w:tc>
                            <w:tc>
                                <w:p>
                                    <w:r>
                                        <w:t>Valor</w:t>
                                    </w:r>
                                </w:p>
                            </w:tc>
                        </w:tr>
                        <w:tr>
                            <w:tc>
                                <w:p>
                                    <w:r>
                                        <w:t>{{COLUNA_1}}</w:t>
                                    </w:r>
                                </w:p>
                            </w:tc>
                            <w:tc>
                                <w:p>
                                    <w:r>
                                        <w:t>{{LINHA_COLUNA_1}}</w:t>
                                    </w:r>
                                </w:p>
                            </w:tc>
                        </w:tr>
                        <w:tr>
                            <w:tc>
                                <w:p>
                                    <w:r>
                                        <w:t>{{COLUNA_2}}</w:t>
                                    </w:r>
                                </w:p>
                            </w:tc>
                            <w:tc>
                                <w:p>
                                    <w:r>
                                        <w:t>{{LINHA_COLUNA_2}}</w:t>
                                    </w:r>
                                </w:p>
                            </w:tc>
                        </w:tr>
                    </w:tbl>
                </w:body>
            </w:document>
            """;

        DocumentTemplateRequest request = new DocumentTemplateRequest(
                "Relatório Básico",
                "Template básico para relatórios de tabela",
                "relatorio-basico.docx",
                Base64.getEncoder().encodeToString(templateXml.getBytes(StandardCharsets.UTF_8)),
                "TABELA",
                null,
                true
        );

        return templateService.create(request).replaceWithVoid();
    }
}