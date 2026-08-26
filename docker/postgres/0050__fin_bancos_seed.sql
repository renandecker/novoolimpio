-- V50: Semente de credenciais de gateways (Asaas e Fiserv) em fin_bancos para todas as unidades ativas.

-- ASAAS: api-key
INSERT INTO public.fin_bancos (id_unidade, provedor, chave, valor, fl_ativo)
SELECT u.id, 'ASAAS', 'api-key',
       '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjE1MjVlNjliLTRhMDItNDkzZC1hMTI0LTcyYjgzNjVmMDNhNDo6JGFhY2hfYmM0OGJjMTQtZDk1OC00MDVmLWEyYmUtODQxN2U1YTY4MTFk',
       true
FROM public.bas_unidade u
WHERE u.fl_ativo = true
  AND NOT EXISTS (
      SELECT 1 FROM public.fin_bancos fb
      WHERE fb.id_unidade = u.id AND fb.provedor = 'ASAAS' AND fb.chave = 'api-key'
  );

-- FISERV: api-key
INSERT INTO public.fin_bancos (id_unidade, provedor, chave, valor, fl_ativo)
SELECT u.id, 'FISERV', 'api-key',
       'RGkq5yaacHoXmvqJGqdHxziacmhhhSbXZlLOnxGVYMvQyfTy',
       true
FROM public.bas_unidade u
WHERE u.fl_ativo = true
  AND NOT EXISTS (
      SELECT 1 FROM public.fin_bancos fb
      WHERE fb.id_unidade = u.id AND fb.provedor = 'FISERV' AND fb.chave = 'api-key'
  );

-- FISERV: api-secret
INSERT INTO public.fin_bancos (id_unidade, provedor, chave, valor, fl_ativo)
SELECT u.id, 'FISERV', 'api-secret',
       'w58j8cHQ05Y8kRAeWGj8jVVUzGTo4dl8wJQOVO7GwA8hP31fKsuVy4Jd8xxMgUBV',
       true
FROM public.bas_unidade u
WHERE u.fl_ativo = true
  AND NOT EXISTS (
      SELECT 1 FROM public.fin_bancos fb
      WHERE fb.id_unidade = u.id AND fb.provedor = 'FISERV' AND fb.chave = 'api-secret'
  );
