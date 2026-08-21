package br.com.sol7.olimpio.relatorios.documento.service;

import br.com.sol7.olimpio.relatorios.documento.dto.DocumentExportRequest;
import br.com.sol7.olimpio.relatorios.documento.dto.DocumentExportResponse;
import br.com.sol7.olimpio.relatorios.documento.entity.DocumentTemplate;
import br.com.sol7.olimpio.relatorios.documento.repository.DocumentTemplateRepository;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import org.apache.commons.io.IOUtils;
import org.docx4j.Docx4J;
import org.docx4j.convert.out.FOSettings;
import org.docx4j.jaxb.Context;
import org.docx4j.openpackaging.exceptions.Docx4JException;
import org.docx4j.openpackaging.packages.WordprocessingMLPackage;
import org.docx4j.wml.*;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import jakarta.xml.bind.JAXBElement;

@ApplicationScoped
public class DocumentGenerationService {

    @Inject
    DocumentTemplateRepository templateRepository;

    public Uni<DocumentExportResponse> gerarDocumento(DocumentTemplate template, DocumentExportRequest request, Map<String, Object> dados) {
        return Uni.createFrom().item(() -> {
            try {
                InputStream templateStream = new ByteArrayInputStream(template.arquivoDados);
                WordprocessingMLPackage wordPackage = WordprocessingMLPackage.load(templateStream);

                Map<String, Object> parametros = request.parametros();
                if (parametros == null) {
                    parametros = new java.util.HashMap<>();
                }

                substituirPlaceholders(wordPackage, dados, parametros);
                wordPackage = processarQuebrasLinha(wordPackage);

                ByteArrayOutputStream output = new ByteArrayOutputStream();
                String fileName;
                String contentType;

                if ("PDF".equalsIgnoreCase(request.tipoExportacao())) {
                    FOSettings foSettings = Docx4J.createFOSettings();
                    foSettings.setWmlPackage(wordPackage);
                    Docx4J.toPDF(wordPackage, output);
                    fileName = template.arquivoNome.replace(".docx", "") + "_" + System.currentTimeMillis() + ".pdf";
                    contentType = "application/pdf";
                } else {
                    wordPackage.save(output);
                    fileName = template.arquivoNome.replace(".docx", "") + "_" + System.currentTimeMillis() + ".docx";
                    contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                }

                String base64Data = Base64.getEncoder().encodeToString(output.toByteArray());
                return new DocumentExportResponse(fileName, contentType, base64Data);
            } catch (Exception e) {
                throw new RuntimeException("Erro ao gerar documento: " + e.getMessage(), e);
            }
        });
    }

    private void substituirPlaceholders(WordprocessingMLPackage template, Map<String, Object> dados, Map<String, Object> parametros) {
        Map<String, String> placeholders = construirPlaceholders(dados, parametros);
        
        for (Map.Entry<String, String> entry : placeholders.entrySet()) {
            replacePlaceholder(template, entry.getValue(), entry.getKey());
        }
    }

    private Map<String, String> construirPlaceholders(Map<String, Object> dados, Map<String, Object> parametros) {
        Map<String, String> map = new java.util.HashMap<>();

        if (dados != null) {
            for (Map.Entry<String, Object> entry : dados.entrySet()) {
                map.put(entry.getKey().toUpperCase(), entry.getValue() != null ? entry.getValue().toString() : "");
            }
        }

        if (parametros != null) {
            for (Map.Entry<String, Object> entry : parametros.entrySet()) {
                map.put(entry.getKey().toUpperCase(), entry.getValue() != null ? entry.getValue().toString() : "");
            }
        }

        return map;
    }

    private void replacePlaceholder(WordprocessingMLPackage template, String textToAdd, String placeholder) {
        List<Object> texts = getAllElementFromObject(template.getMainDocumentPart(), Text.class);
        try {
            for (Object text : texts) {
                Text textElement = (Text) text;
                if (textElement.getValue().contains(placeholder)) {
                    textElement.setValue(textElement.getValue().replaceAll(placeholder, textToAdd));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private WordprocessingMLPackage processarQuebrasLinha(WordprocessingMLPackage doc) {
        try {
            List<Object> paragraphs = getAllElementFromObject(doc.getMainDocumentPart(), P.class);
            for (Object par : paragraphs) {
                P p = (P) par;
                List<Object> texts = getAllElementFromObject(p, Text.class);
                ObjectFactory factory = Context.getWmlObjectFactory();
                R run = factory.createR();
                boolean verifica = false;
                boolean verificaQuebra = false;
                for (Object text : texts) {
                    Text t = (Text) text;
                    if (t.getValue().contains("SJ_QUEBRA_LINHA")) {
                        String partes[] = t.getValue().split("SJ_QUEBRA_LINHA");
                        for (int i = 0; i < partes.length; i++) {
                            Text text1 = factory.createText();
                            verifica = true;
                            text1.setValue(partes[i]);
                            if (verificaQuebra) {
                                Br nl = factory.createBr();
                                run.getContent().add(nl);
                            } else {
                                verificaQuebra = true;
                            }
                            run.getContent().add(text1);

                            if (p.getPPr() != null) {
                                if (p.getPPr().getRPr() != null) {
                                    RPr rPr = new RPr();
                                    rPr.setSz(p.getPPr().getRPr().getSz());
                                    rPr.setRFonts(p.getPPr().getRPr().getRFonts());
                                    rPr.setColor(p.getPPr().getRPr().getColor());
                                    rPr.setEffect(p.getPPr().getRPr().getEffect());
                                    rPr.setPosition(p.getPPr().getRPr().getPosition());
                                    run.setRPr(rPr);
                                }
                            }
                            t.setValue("");
                        }
                    }
                    if (t.getValue().contains("SJ_QUEBRA_LINHA")) {
                        t.setValue(t.getValue().replaceAll("SJ_QUEBRA_LINHA", ""));
                    }
                }
                if (verifica) {
                    p.getContent().add(run);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return doc;
    }

    private List<Object> getAllElementFromObject(Object obj, Class<?> toSearch) {
        List<Object> result = new java.util.ArrayList<>();
        if (obj instanceof JAXBElement)
            obj = ((JAXBElement<?>) obj).getValue();
        if (obj.getClass().equals(toSearch))
            result.add(obj);
        else if (obj instanceof ContentAccessor) {
            List<?> children = ((ContentAccessor) obj).getContent();
            for (Object child : children) {
                result.addAll(getAllElementFromObject(child, toSearch));
            }
        }
        return result;
    }
}