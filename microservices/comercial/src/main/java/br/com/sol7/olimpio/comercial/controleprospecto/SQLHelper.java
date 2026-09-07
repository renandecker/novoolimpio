package br.com.sol7.olimpio.comercial.controleprospecto;

import jakarta.persistence.Tuple;

import java.util.ArrayList;
import java.util.List;

final class SQLHelper {

    private SQLHelper() {
    }

     static List<ControleProspectoWapperResponse> rowsToWapper(List<?> rows) {
        List<ControleProspectoWapperResponse> out = new ArrayList<>();
        if (rows == null) return out;
        for (Object row : rows) {
            if (row == null) continue;
            Long id = numericOrNull(column(row, "id"));
            if (id == null) id = 0L;
            String nome = str(column(row, "nome"));
            String valor = str(column(row, "valor"));
            String outro = str(column(row, "outro"));
            out.add(new ControleProspectoWapperResponse(id, nome, valor, outro, null, null));
        }
        return out;
    }

    static List<ProspectoDetalheResponse> rowsToDetalhe(List<?> rows) {
        List<ProspectoDetalheResponse> out = new ArrayList<>();
        if (rows == null) return out;
        for (Object row : rows) {
            Long campoId = numericOrNull(column(row, "campo_id"));
            String rotulo = str(column(row, "rotulo"));
            String tipo = str(column(row, "tipo"));
            String categoria = str(column(row, "categoria"));
            String valor = str(column(row, "valor"));
            out.add(new ProspectoDetalheResponse(campoId, rotulo, tipo, categoria, valor));
        }
        return out;
    }

    static List<ProspectoSimplesResponse> rowsToSimples(List<?> rows) {
        List<ProspectoSimplesResponse> out = new ArrayList<>();
        if (rows == null) return out;
        for (Object row : rows) {
            Long id = numericOrNull(column(row, "id"));
            String nome = str(column(row, "nome"));
            String unidadeSucinto = str(column(row, "unidade_sucinto"));
            String valor = str(column(row, "valor"));
            out.add(new ProspectoSimplesResponse(id, nome, unidadeSucinto, valor));
        }
        return out;
    }

    private static Object column(Object row, String name) {
        if (row == null) return null;
        if (row instanceof Tuple) {
            return ((Tuple) row).get(name);
        }
        return row;
    }

    private static Long numericOrNull(Object o) {
        if (o == null) return null;
        if (o instanceof Number n) return n.longValue();
        try {
            return Long.valueOf(o.toString().trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static String str(Object o) {
        return o == null ? null : o.toString();
    }
}
