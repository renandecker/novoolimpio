package br.com.sol7.olimpio.relatorios.extrator.service;

import br.com.sol7.olimpio.relatorios.extrator.entity.Extrator;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.docx4j.Docx4J;
import org.docx4j.jaxb.Context;
import org.docx4j.openpackaging.packages.WordprocessingMLPackage;
import org.docx4j.wml.ObjectFactory;
import org.docx4j.wml.P;
import org.docx4j.wml.R;
import org.docx4j.wml.Tbl;
import org.docx4j.wml.Tc;
import org.docx4j.wml.Tr;
import org.docx4j.wml.Text;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.ResultSetExtractor;

import javax.sql.DataSource;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.sql.ResultSetMetaData;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@ApplicationScoped
public class DocumentoGeneratorService {

    @Inject
    DataSource dataSource;

    private record Dados(List<String> cabecalhos, List<List<Object>> linhas) {
    }

    public File gerar(Extrator extrator, String sql, String tipo, String diretorioArquivos, Map<String, Object> filtros) {
        try {
            if (sql == null || sql.isBlank()) {
                throw new IllegalArgumentException("SQL vazio, impossivel gerar documento");
            }
            Dados dados = executarJdbc(sql);
            List<List<Object>> linhas = aplicarFiltros(dados, filtros);

            File dir = new File(diretorioArquivos);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String ext = switch (tipo.toUpperCase()) {
                case "PDF" -> "pdf";
                case "EXCEL", "XLSX" -> "xlsx";
                default -> "csv";
            };
            File arquivo = new File(dir, extrator.id + "." + ext);

            switch (tipo.toUpperCase()) {
                case "PDF" -> gerarPdf(arquivo, dados.cabecalhos(), linhas);
                case "EXCEL", "XLSX" -> gerarXlsx(arquivo, dados.cabecalhos(), linhas);
                default -> gerarCsv(arquivo, dados.cabecalhos(), linhas);
            }
            return arquivo;
        } catch (RuntimeException re) {
            throw re;
        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar documento: " + e.getMessage(), e);
        }
    }

    private Dados executarJdbc(String sql) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return jdbc.query(sql, (ResultSetExtractor<Dados>) rs -> {
            ResultSetMetaData md = rs.getMetaData();
            int colunas = md.getColumnCount();
            List<String> cabecalhos = new ArrayList<>();
            for (int i = 1; i <= colunas; i++) {
                cabecalhos.add(md.getColumnLabel(i));
            }
            List<List<Object>> linhas = new ArrayList<>();
            while (rs.next()) {
                List<Object> linha = new ArrayList<>();
                for (int i = 1; i <= colunas; i++) {
                    linha.add(rs.getObject(i));
                }
                linhas.add(linha);
            }
            return new Dados(cabecalhos, linhas);
        });
    }

    private List<List<Object>> aplicarFiltros(Dados dados, Map<String, Object> filtros) {
        if (filtros == null || filtros.isEmpty()) return dados.linhas();
        List<List<Object>> resultado = new ArrayList<>();
        for (List<Object> linha : dados.linhas()) {
            boolean aceita = true;
            for (Map.Entry<String, Object> entrada : filtros.entrySet()) {
                int indice = indiceColuna(dados.cabecalhos(), entrada.getKey());
                if (indice < 0) continue;
                Object coluna = indice < linha.size() ? linha.get(indice) : null;
                if (!aceitaCondicao(coluna, entrada.getValue())) {
                    aceita = false;
                    break;
                }
            }
            if (aceita) resultado.add(linha);
        }
        return resultado;
    }

    private int indiceColuna(List<String> cabecalhos, String campo) {
        for (int i = 0; i < cabecalhos.size(); i++) {
            if (cabecalhos.get(i).equalsIgnoreCase(campo)) return i;
        }
        return -1;
    }

    @SuppressWarnings("unchecked")
    private boolean aceitaCondicao(Object coluna, Object condicaoObj) {
        if (coluna == null) return true;
        if (!(condicaoObj instanceof Map)) return true;
        Map<String, Object> condicao = (Map<String, Object>) condicaoObj;
        Object opObj = condicao.containsKey("operation") ? condicao.get("operation") : condicao.get("operator");
        Object valor = condicao.get("value");
        Object valor2 = condicao.get("value2");
        if (opObj == null || valor == null) return true;
        String op = String.valueOf(opObj).toUpperCase();
        return compara(coluna, op, valor, valor2);
    }

    private boolean compara(Object coluna, String op, Object valor, Object valor2) {
        Object alvo = normalizaComparacao(coluna);
        Object alvo2 = normalizaComparacao(valor);
        switch (op) {
            case "EQUALS", "EQ", "=":
                return equalsGenerico(alvo, alvo2);
            case "NOT_EQUALS", "NE", "!=":
                return !equalsGenerico(alvo, alvo2);
            case "GREATER_THAN", "GT", ">":
                return compareGenerico(alvo, alvo2) > 0;
            case "LESS_THAN", "LT", "<":
                return compareGenerico(alvo, alvo2) < 0;
            case "GREATER_THAN_OR_EQUAL", "GE", ">=":
                return compareGenerico(alvo, alvo2) >= 0;
            case "LESS_THAN_OR_EQUAL", "LE", "<=":
                return compareGenerico(alvo, alvo2) <= 0;
            case "CONTAINS":
                return String.valueOf(alvo).toLowerCase().contains(String.valueOf(alvo2).toLowerCase());
            case "STARTS_WITH":
                return String.valueOf(alvo).toLowerCase().startsWith(String.valueOf(alvo2).toLowerCase());
            case "ENDS_WITH":
                return String.valueOf(alvo).toLowerCase().endsWith(String.valueOf(alvo2).toLowerCase());
            case "BETWEEN":
                if (valor2 == null) return true;
                return compareGenerico(alvo, alvo2) >= 0 && compareGenerico(alvo, normalizaComparacao(valor2)) <= 0;
            case "IN":
                if (valor instanceof List) {
                    for (Object item : (List<?>) valor) {
                        if (equalsGenerico(alvo, normalizaComparacao(item))) return true;
                    }
                }
                return equalsGenerico(alvo, alvo2);
            default:
                return equalsGenerico(alvo, alvo2);
        }
    }

    private Object normalizaComparacao(Object valor) {
        if (valor instanceof Number) return valor;
        if (valor == null) return null;
        String s = String.valueOf(valor).trim();
        try {
            return new BigDecimal(s);
        } catch (NumberFormatException e1) {
            try {
                return Long.parseLong(s);
            } catch (NumberFormatException e2) {
                return s;
            }
        }
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    private int compareGenerico(Object a, Object b) {
        if (a == null && b == null) return 0;
        if (a == null) return -1;
        if (b == null) return 1;
        if (a instanceof Number na && b instanceof Number nb) {
            return new BigDecimal(na.toString()).compareTo(new BigDecimal(nb.toString()));
        }
        return String.valueOf(a).compareTo(String.valueOf(b));
    }

    private boolean equalsGenerico(Object a, Object b) {
        if (a == null && b == null) return true;
        if (a == null || b == null) return false;
        if (a instanceof Number na && b instanceof Number nb) {
            return new BigDecimal(na.toString()).compareTo(new BigDecimal(nb.toString())) == 0;
        }
        return String.valueOf(a).equalsIgnoreCase(String.valueOf(b));
    }

    private void gerarCsv(File arquivo, List<String> cabecalhos, List<List<Object>> linhas) throws IOException {
        try (PrintWriter writer = new PrintWriter(new OutputStreamWriter(new FileOutputStream(arquivo), StandardCharsets.UTF_8))) {
            writer.println(String.join(";", cabecalhos));
            for (List<Object> linha : linhas) {
                List<String> celulas = new ArrayList<>();
                for (Object valor : linha) {
                    String s = valor == null ? "" : String.valueOf(valor);
                    if (s.contains(";") || s.contains("\n") || s.contains("\"")) {
                        s = "\"" + s.replace("\"", "\"\"") + "\"";
                    }
                    celulas.add(s);
                }
                writer.println(String.join(";", celulas));
            }
        }
    }

    private void gerarXlsx(File arquivo, List<String> cabecalhos, List<List<Object>> linhas) throws IOException {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            XSSFSheet sheet = workbook.createSheet("Dados");
            XSSFRow headerRow = sheet.createRow(0);
            for (int i = 0; i < cabecalhos.size(); i++) {
                headerRow.createCell(i).setCellValue(cabecalhos.get(i));
            }
            int r = 1;
            for (List<Object> linha : linhas) {
                XSSFRow row = sheet.createRow(r++);
                for (int i = 0; i < linha.size(); i++) {
                    Object valor = linha.get(i);
                    row.createCell(i).setCellValue(valor == null ? "" : String.valueOf(valor));
                }
            }
            try (FileOutputStream out = new FileOutputStream(arquivo)) {
                workbook.write(out);
            }
        }
    }

    private void gerarPdf(File arquivo, List<String> cabecalhos, List<List<Object>> linhas) throws Exception {
        WordprocessingMLPackage document = WordprocessingMLPackage.createPackage();
        ObjectFactory factory = Context.getWmlObjectFactory();
        Tbl table = factory.createTbl();
        addRowToPdfTable(factory, table, cabecalhos, true);
        for (List<Object> linha : linhas) {
            List<String> valores = new ArrayList<>();
            for (Object valor : linha) {
                valores.add(valor == null ? "" : String.valueOf(valor));
            }
            addRowToPdfTable(factory, table, valores, false);
        }
        document.getMainDocumentPart().addObject(table);
        try (FileOutputStream out = new FileOutputStream(arquivo)) {
            Docx4J.toPDF(document, out);
        }
    }

    private void addRowToPdfTable(ObjectFactory factory, Tbl table, List<String> celulas, boolean header) {
        Tr row = factory.createTr();
        for (String celula : celulas) {
            Tc tc = factory.createTc();
            P paragrafo = factory.createP();
            R run = factory.createR();
            Text texto = factory.createText();
            texto.setValue(celula);
            run.getContent().add(texto);
            paragrafo.getContent().add(run);
            tc.getContent().add(paragrafo);
            row.getContent().add(tc);
        }
        table.getContent().add(row);
    }
}