-- corrigirAvaliacoes: adiciona colunas de nota e percentual de correcao
-- na tabela edc_avaliacao_aluno para armazenar o resultado da correcao
-- automatica de avaliacoes (comparacao de respostas do aluno vs resposta
-- correta da pergunta).

ALTER TABLE edc_avaliacao_aluno ADD COLUMN IF NOT EXISTS nota_acerto NUMERIC(5,2);
ALTER TABLE edc_avaliacao_aluno ADD COLUMN IF NOT EXISTS percentual_correcao NUMERIC(5,2);
