package br.com.sol7.olimpio.educacao.chamadaassinadaimpressa.util;

import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;

import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class JasperReportUtil {

    public static byte[] gerarRelatorioPdf(String reportPath, Map<String, Object> parameters, List<?> dataSource) {
        try (InputStream reportStream = JasperReportUtil.class.getResourceAsStream(reportPath)) {
            if (reportStream == null) {
                throw new RuntimeException("Relatório não encontrado: " + reportPath);
            }

            JRBeanCollectionDataSource jrDataSource = new JRBeanCollectionDataSource(dataSource);
            Map<String, Object> params = new HashMap<>(parameters);
            params.put("REPORT_DATA_SOURCE", jrDataSource);

            JasperPrint jasperPrint = JasperFillManager.fillReport(reportStream, params, jrDataSource);
            return JasperExportManager.exportReportToPdf(jasperPrint);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar PDF do relatório: " + e.getMessage(), e);
        }
    }
}