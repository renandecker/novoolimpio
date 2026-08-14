package br.com.sol7.olimpio.educacao.enumm;

/**
 * Migrado de br.com.sol7.olimpio.enumm.TipoPlanejamentoAula (legado).
 * Define como as aulas de um oferecimento (curso/componente curricular) sao geradas.
 */
public enum TipoPlanejamentoAula {
    DISPONIBILIDADE_AULA("Disponibilidade aula"),
    DISPONIBILIDADE_SEQUENTE("Disponibilidade sequente"),
    DISPONIBILIDADE_LIVRE("Disponibilidade livre");

    private String label;

    private TipoPlanejamentoAula(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    @Override
    public String toString() {
        return label;
    }

    public static TipoPlanejamentoAula fromName(String name) {
        if (name == null || name.isBlank()) {
            return null;
        }
        for (TipoPlanejamentoAula tipo : values()) {
            if (tipo.name().equals(name)) {
                return tipo;
            }
        }
        return null;
    }

    public static TipoPlanejamentoAula fromNameOrDefault(String name) {
        TipoPlanejamentoAula tipo = fromName(name);
        return tipo != null ? tipo : DISPONIBILIDADE_SEQUENTE;
    }
}
