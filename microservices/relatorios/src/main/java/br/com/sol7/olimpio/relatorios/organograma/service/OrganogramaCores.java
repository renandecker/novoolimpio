package br.com.sol7.olimpio.relatorios.organograma;

/**
 * Paleta fixa de 40 cores usada para colorir, em tempo real, os nós do organograma por
 * departamento (campo "department"/"departamento"). Nada aqui é persistido no banco: a cor é
 * calculada a cada requisição a partir do nome do departamento, então o mesmo departamento
 * sempre recebe a mesma cor dentro de um organograma.
 */
public final class OrganogramaCores {

    private OrganogramaCores() {
    }

    public static final String[] PALETA = new String[]{
            "#1B65BF", "#327C35", "#A94F1D", "#8E24AA", "#00838F",
            "#C2185B", "#5D4037", "#455A64", "#EF6C00", "#2E7D32",
            "#6A1B9A", "#00695C", "#AD1457", "#4E342E", "#37474F",
            "#F57F17", "#1565C0", "#558B2F", "#D84315", "#4527A0",
            "#00838F", "#AD1457", "#33691E", "#BF360C", "#283593",
            "#006064", "#880E4F", "#33691E", "#E65100", "#311B92",
            "#0277BD", "#2E7D32", "#B71C1C", "#4A148C", "#01579B",
            "#33691E", "#EF6C00", "#6A1B9A", "#004D40", "#795548",
    };

    /** Cor de fundo (fill) suave e cor de borda (stroke) mais forte, por índice da paleta. */
    public static String fill(int indice) {
        return PALETA[Math.floorMod(indice, PALETA.length)];
    }

    /** Índice estável (0-39) calculado a partir do texto do departamento. */
    public static int indice(String departamento) {
        if (departamento == null || departamento.isBlank()) return 0;
        return Math.floorMod(departamento.trim().toLowerCase().hashCode(), PALETA.length);
    }

    public static String corPara(String departamento) {
        return fill(indice(departamento));
    }
}
