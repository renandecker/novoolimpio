package br.com.sol7.olimpio.educacao.gestaoaluno;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import org.apache.commons.io.IOUtils;
import org.docx4j.Docx4J;
import org.docx4j.convert.out.FOSettings;
import org.docx4j.openpackaging.packages.WordprocessingMLPackage;
import org.jboss.logging.Logger;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@ApplicationScoped
@WithTransaction
public class GestaoAlunoService {

    private static final Logger LOG = Logger.getLogger(GestaoAlunoService.class);

    @Inject
    GestaoAlunoRepository repository;

    public Uni<List<GestaoAlunoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<GestaoAlunoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<GestaoAlunoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("GestaoAluno not found")).map(this::toResponse);
    }

    public Uni<GestaoAlunoResponse> create(GestaoAlunoRequest r) {
        var e = new GestaoAluno();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<GestaoAlunoResponse> update(Long id, GestaoAlunoRequest r) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("GestaoAluno not found")).invoke(e -> apply(e, r)).map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem() : Uni.createFrom().failure(new NotFoundException("GestaoAluno not found")));
    }

    private void apply(GestaoAluno e, GestaoAlunoRequest r) {
        e.nome = r.nome();
        e.dadosJson = r.dadosJson();
    }

    private GestaoAlunoResponse toResponse(GestaoAluno e) {
        return new GestaoAlunoResponse(e.id, e.nome, e.dadosJson);
    }



    public Uni<Void> atualizarDataVencimento(Long parcelaId, Date novaData) {
        String sql = "UPDATE fin_parcela SET data_vencimento = ? WHERE data_pagamento IS NULL AND id = ?";
        return Panache.getSession()
                .chain(s -> s.createNativeQuery(sql)
                        .setParameter(1, novaData)
                        .setParameter(2, parcelaId)
                        .executeUpdate())
                .replaceWithVoid()
                .onItem().invoke(() -> LOG.infof("Data de vencimento da parcela %d atualizada", parcelaId));
    }

    public Uni<Void> atualizarValorVencimento(Long parcelaId, Double novoValor) {
        String sql = "UPDATE fin_parcela SET valor = ? WHERE data_pagamento IS NULL AND id = ?";
        return Panache.getSession()
                .chain(s -> s.createNativeQuery(sql)
                        .setParameter(1, novoValor)
                        .setParameter(2, parcelaId)
                        .executeUpdate())
                .replaceWithVoid()
                .onItem().invoke(() -> LOG.infof("Valor da parcela %d atualizado", parcelaId));
    }

    public Uni<Void> atualizarDescontoParcela(Long parcelaId, Double novoDesconto) {
        String sql = "UPDATE fin_parcela SET desconto = ? WHERE data_pagamento IS NULL AND id = ?";
        return Panache.getSession()
                .chain(s -> s.createNativeQuery(sql)
                        .setParameter(1, novoDesconto)
                        .setParameter(2, parcelaId)
                        .executeUpdate())
                .replaceWithVoid()
                .onItem().invoke(() -> LOG.infof("Desconto da parcela %d atualizado", parcelaId));
    }

    public Uni<Void> atualizarJurosParcela(Long parcelaId, Double novosJuros) {
        String sql = "UPDATE fin_parcela SET juros = ? WHERE data_pagamento IS NULL AND id = ?";
        return Panache.getSession()
                .chain(s -> s.createNativeQuery(sql)
                        .setParameter(1, novosJuros)
                        .setParameter(2, parcelaId)
                        .executeUpdate())
                .replaceWithVoid()
                .onItem().invoke(() -> LOG.infof("Juros da parcela %d atualizados", parcelaId));
    }

    public Uni<Void> atualizarMultaParcela(Long parcelaId, Double novaMulta) {
        String sql = "UPDATE fin_parcela SET multa = ? WHERE data_pagamento IS NULL AND id = ?";
        return Panache.getSession()
                .chain(s -> s.createNativeQuery(sql)
                        .setParameter(1, novaMulta)
                        .setParameter(2, parcelaId)
                        .executeUpdate())
                .replaceWithVoid()
                .onItem().invoke(() -> LOG.infof("Multa da parcela %d atualizada", parcelaId));
    }


    // Migrado de GestaoAlunoController.ajusteManualValorReparcela (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/GestaoAlunoController.java:410, camada controller)
    // Observacao: parametro parcela: era ParcelaWapper no legado
    // Logica original (adaptar):
    // public boolean ajusteManualValorReparcela(ParcelaWapper parcela) {
    //         if (usuarioLogadoController.getUsuario().getHierarquia().equals(HierarquiaPerfil.ADMIN)) {
    //             return true;
    //         }
    //         if (configuracaoParcela != null && quantidadesVezes != null) {
    //             int total = (int) (quantidadesVezes * (configuracaoParcela.getQtdeReparcValorManual().floatValue() / 100));
    //             if (parcela.getParcela().getParcela() <= total) {
    //                 return true;
    //             }
    //         }
    //         return false;
    //     }
    public Uni<Boolean> ajusteManualValorReparcela(String parcela) {
        // Obs: depende do usuario logado (hierarquia) e do estado da tela (configuracaoParcela, quantidadesVezes, parcela)
        return Uni.createFrom().item(false);
    }


public Uni<List<Long>> autoCompleteAluno(String query) {
        String q = query == null ? "" : query.toLowerCase();
        return repository.find("lower(nome) like ?1", "%" + q + "%").list()
                .map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<String> gerarContrato(Long ccId, Long usuarioId) {
        return Uni.createFrom().item(() -> {
            try (InputStream templateStream = getClass().getResourceAsStream("/relatorios/modeloContrato.docx")) {
                if (templateStream == null) {
                    throw new RuntimeException("Template de contrato nÃ£o encontrado");
                }

                WordprocessingMLPackage wordPackage = WordprocessingMLPackage.load(templateStream);

                Map<String, String> placeholders = new HashMap<>();
                placeholders.put("CONTRATO_ID", ccId.toString());
                placeholders.put("DATA_GERACAO", new Date().toString());
                placeholders.put("USUARIO_ID", usuarioId.toString());

                substituirPlaceholders(wordPackage, placeholders);

                ByteArrayOutputStream output = new ByteArrayOutputStream();
                FOSettings foSettings = Docx4J.createFOSettings();
                foSettings.setWmlPackage(wordPackage);
                Docx4J.toPDF(wordPackage, output);

                String base64Pdf = Base64.getEncoder().encodeToString(output.toByteArray());
                String fileName = "contrato_" + ccId + "_" + System.currentTimeMillis() + ".pdf";

                registrarDownloadContrato(ccId, usuarioId);

                return base64Pdf;
            } catch (Exception e) {
                LOG.errorf(e, "Erro ao gerar contrato %d", ccId);
                throw new RuntimeException("Erro ao gerar contrato: " + e.getMessage(), e);
            }
        });
    }

    public Uni<String> gerarPromissoria(Long ccId, Long usuarioId) {
        return Uni.createFrom().item(() -> {
            try (InputStream templateStream = getClass().getResourceAsStream("/relatorios/modeloPromissoria.docx")) {
                if (templateStream == null) {
                    throw new RuntimeException("Template de promissÃ³ria nÃ£o encontrado");
                }

                WordprocessingMLPackage wordPackage = WordprocessingMLPackage.load(templateStream);

                Map<String, String> placeholders = new HashMap<>();
                placeholders.put("CONTRATO_ID", ccId.toString());
                placeholders.put("DATA_GERACAO", new Date().toString());
                placeholders.put("USUARIO_ID", usuarioId.toString());

                substituirPlaceholders(wordPackage, placeholders);

                ByteArrayOutputStream output = new ByteArrayOutputStream();
                FOSettings foSettings = Docx4J.createFOSettings();
                foSettings.setWmlPackage(wordPackage);
                Docx4J.toPDF(wordPackage, output);

                String base64Pdf = Base64.getEncoder().encodeToString(output.toByteArray());
                String fileName = "promissoria_" + ccId + "_" + System.currentTimeMillis() + ".pdf";

                registrarDownloadPromissoria(ccId, usuarioId);

                return base64Pdf;
            } catch (Exception e) {
                LOG.errorf(e, "Erro ao gerar promissÃ³ria %d", ccId);
                throw new RuntimeException("Erro ao gerar promissÃ³ria: " + e.getMessage(), e);
            }
        });
    }

    private void substituirPlaceholders(WordprocessingMLPackage template, Map<String, String> placeholders) {
        List<Object> texts = getAllElementFromObject(template.getMainDocumentPart(), org.docx4j.wml.Text.class);
        for (Object text : texts) {
            org.docx4j.wml.Text textElement = (org.docx4j.wml.Text) text;
            String value = textElement.getValue();
            for (Map.Entry<String, String> entry : placeholders.entrySet()) {
                if (value.contains(entry.getKey())) {
                    textElement.setValue(value.replaceAll(entry.getKey(), entry.getValue()));
                }
            }
        }
    }

    private List<Object> getAllElementFromObject(Object obj, Class<?> toSearch) {
        List<Object> result = new java.util.ArrayList<>();
        if (obj instanceof jakarta.xml.bind.JAXBElement)
            obj = ((jakarta.xml.bind.JAXBElement<?>) obj).getValue();
        if (obj.getClass().equals(toSearch))
            result.add(obj);
        else if (obj instanceof org.docx4j.openpackaging.parts.WordprocessingML.MainDocumentPart) {
            List<?> children = ((org.docx4j.openpackaging.parts.WordprocessingML.MainDocumentPart) obj).getContent();
            for (Object child : children) {
                result.addAll(getAllElementFromObject(child, toSearch));
            }
        } else if (obj instanceof org.docx4j.wml.ContentAccessor) {
            List<?> children = ((org.docx4j.wml.ContentAccessor) obj).getContent();
            for (Object child : children) {
                result.addAll(getAllElementFromObject(child, toSearch));
            }
        }
        return result;
    }

    private void registrarDownloadContrato(Long contratoId, Long usuarioId) {
        String sql = """
            INSERT INTO edc_contrato_download (data_download, qtde, id_usuario, id_contrato)
            VALUES (NOW(), 1, ?, ?)
            ON CONFLICT ON CONSTRAINT uk_edc_contrato_download DO UPDATE
            SET qtde = edc_contrato_download.qtde + 1, data_download = NOW()
            """;
        Panache.getSession()
                .chain(s -> s.createNativeQuery(sql)
                        .setParameter(1, usuarioId)
                        .setParameter(2, contratoId)
                        .executeUpdate())
                .subscribe().with(v -> LOG.infof("Download de contrato registrado: contrato=%d, usuario=%d", contratoId, usuarioId));
    }

    private void registrarDownloadPromissoria(Long contratoId, Long usuarioId) {
        String sql = """
            INSERT INTO edc_promissoria_download (data_download, qtde, id_usuario, id_contrato)
            VALUES (NOW(), 1, ?, ?)
            ON CONFLICT ON CONSTRAINT uk_edc_promissoria_download DO UPDATE
            SET qtde = edc_promissoria_download.qtde + 1, data_download = NOW()
            """;
        Panache.getSession()
                .chain(s -> s.createNativeQuery(sql)
                        .setParameter(1, usuarioId)
                        .setParameter(2, contratoId)
                        .executeUpdate())
                .subscribe().with(v -> LOG.infof("Download de promissÃ³ria registrado: contrato=%d, usuario=%d", contratoId, usuarioId));
    }

    public Uni<List<Long>> buscarParcelas(Long contratoId) {
        if (contratoId == null) {
            return Uni.createFrom().item(List.of());
        }
        return io.quarkus.hibernate.reactive.panache.Panache.getSession().chain(session ->
                session.createNativeQuery("SELECT id FROM fin_parcela WHERE contrato_id = ?1").setParameter(1, contratoId).getResultList())
                .map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }

    public Uni<List<Long>> buscarMatriculas(Long contratoId) {
        if (contratoId == null) {
            return Uni.createFrom().item(List.of());
        }
        return io.quarkus.hibernate.reactive.panache.Panache.getSession().chain(session ->
                session.createNativeQuery("SELECT id FROM edu_matricula WHERE contrato_id = ?1").setParameter(1, contratoId).getResultList())
                .map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }

    public Uni<List<Integer>> buscarDiasPagamento(Long unidadeId, Date dataPrimeiraParcela, Integer prazoReparcSegunda) {
        if (unidadeId == null || dataPrimeiraParcela == null) {
            return Uni.createFrom().item(List.of());
        }
        return io.quarkus.hibernate.reactive.panache.Panache.getSession().chain(session ->
                session.createNativeQuery("SELECT dia FROM fin_dia_pagamento WHERE unidade_id = ?1").setParameter(1, unidadeId).getResultList())
                .map(list -> list.stream().map(x -> ((Number) x).intValue()).toList());
    }

    public Uni<List<Long>> carregarHistoricoCobranca(Long pessoaId) {
        if (pessoaId == null) {
            return Uni.createFrom().item(List.of());
        }
        return io.quarkus.hibernate.reactive.panache.Panache.getSession().chain(session ->
                session.createNativeQuery("SELECT id FROM fin_ligacao_cobranca WHERE pessoa_id = ?1").setParameter(1, pessoaId).getResultList())
                .map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }

    public Uni<List<Long>> buscarDetalheNotas(Long matriculaId) {
        if (matriculaId == null) {
            return Uni.createFrom().item(List.of());
        }
        return io.quarkus.hibernate.reactive.panache.Panache.getSession().chain(session ->
                session.createNativeQuery("SELECT id FROM edu_nota WHERE matricula_id = ?1").setParameter(1, matriculaId).getResultList())
                .map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }

    public Uni<List<Long>> buscarDetalhePresencasTrocaTurma(Long trocaTurmaId) {
        if (trocaTurmaId == null) {
            return Uni.createFrom().item(List.of());
        }
        return io.quarkus.hibernate.reactive.panache.Panache.getSession().chain(session ->
                session.createNativeQuery("SELECT id FROM edu_caderno_componente_curricular WHERE troca_turma_id = ?1").setParameter(1, trocaTurmaId).getResultList())
                .map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }

    public Uni<List<Long>> buscarDetalhePresencas(Long matriculaId) {
        if (matriculaId == null) {
            return Uni.createFrom().item(List.of());
        }
        return io.quarkus.hibernate.reactive.panache.Panache.getSession().chain(session ->
                session.createNativeQuery("SELECT id FROM edu_caderno_componente_curricular WHERE matricula_id = ?1").setParameter(1, matriculaId).getResultList())
                .map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }

    public Uni<List<Long>> carregarMatriculasMatricula(Long matriculaId) {
        if (matriculaId == null) {
            return Uni.createFrom().item(List.of());
        }
        return io.quarkus.hibernate.reactive.panache.Panache.getSession().chain(session ->
                session.createNativeQuery("SELECT id FROM edu_matricula WHERE id = ?1").setParameter(1, matriculaId).getResultList())
                .map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }

    public Uni<List<Long>> carregarMatriculasPessoa(Long pessoaId) {
        if (pessoaId == null) {
            return Uni.createFrom().item(List.of());
        }
        return io.quarkus.hibernate.reactive.panache.Panache.getSession().chain(session ->
                session.createNativeQuery("SELECT id FROM edu_matricula WHERE pessoa_id = ?1").setParameter(1, pessoaId).getResultList())
                .map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }

    public Uni<List<Long>> carregarMatriculasContrato(Long contratoId) {
        if (contratoId == null) {
            return Uni.createFrom().item(List.of());
        }
        return io.quarkus.hibernate.reactive.panache.Panache.getSession().chain(session ->
                session.createNativeQuery("SELECT id FROM edu_matricula WHERE contrato_id = ?1").setParameter(1, contratoId).getResultList())
                .map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }

    public Uni<List<Long>> carregarHistoricoNap(Long pessoaId) {
        if (pessoaId == null) {
            return Uni.createFrom().item(List.of());
        }
        return io.quarkus.hibernate.reactive.panache.Panache.getSession().chain(session ->
                session.createNativeQuery("SELECT id FROM fin_ligacao_nap WHERE pessoa_id = ?1").setParameter(1, pessoaId).getResultList())
                .map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }

    public Uni<Void> ajustarResponsavel(Long contratoId, Long responsavelId) {
        if (contratoId == null || responsavelId == null) {
            return Uni.createFrom().failure(new IllegalArgumentException("ParÃ¢metros invÃ¡lidos"));
        }
        return io.quarkus.hibernate.reactive.panache.Panache.getSession().chain(session ->
                session.createNativeQuery("UPDATE edu_contrato SET responsavel_id = ?1 WHERE id = ?2")
                        .setParameter(1, responsavelId).setParameter(2, contratoId).executeUpdate()
        ).replaceWithVoid();
    }

    public Uni<Void> ajustarUnidadeResponsavel(Long contratoId, Long unidadeResponsavelId) {
        if (contratoId == null || unidadeResponsavelId == null) {
            return Uni.createFrom().failure(new IllegalArgumentException("ParÃ¢metros invÃ¡lidos"));
        }
        return io.quarkus.hibernate.reactive.panache.Panache.getSession().chain(session ->
                session.createNativeQuery("UPDATE edu_contrato SET unidade_responsavel_id = ?1 WHERE id = ?2")
                        .setParameter(1, unidadeResponsavelId).setParameter(2, contratoId).executeUpdate()
        ).replaceWithVoid();
    }

    public Uni<List<Long>> carregarResponsaveis(Long alunoId) {
        if (alunoId == null) {
            return Uni.createFrom().item(List.of());
        }
        return io.quarkus.hibernate.reactive.panache.Panache.getSession().chain(session ->
                session.createNativeQuery("SELECT responsavel_id FROM edu_contrato WHERE aluno_id = ?1").setParameter(1, alunoId).getResultList())
                .map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }

}
