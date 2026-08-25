-- Flyway Migration: Update bas_modulo outcome column from .xhtml to new React routes
-- Version: 0049__update_bas_modulo_outcome_react_routes.sql
-- Description: Replace .xhtml paths in outcome column with new React route paths (without .xhtml)
-- This migration maps legacy PrimeFaces .xhtml paths to new React Router paths

-- ============================================
-- STEP 1: Generic cleanup - remove .xhtml extensions
-- ============================================
UPDATE bas_modulo 
SET outcome = REPLACE(outcome, '.xhtml.xhtml', '')
WHERE outcome LIKE '%.xhtml.xhtml';

UPDATE bas_modulo 
SET outcome = REPLACE(outcome, '.xhtml', '')
WHERE outcome LIKE '%.xhtml';

-- ============================================
-- STEP 2: Special cases for non-standard routes
-- These routes don't follow the /view/feature/resource pattern
-- ============================================
-- Default landing page (was /default.xhtml)
UPDATE bas_modulo SET outcome = '/default' WHERE outcome = '/default';

-- Note: /view/alterarSenha/alterarSenha and /view/login/login 
-- are already correctly updated by the generic REPLACE above
-- since they follow the /view/... pattern

-- ============================================
-- STEP 3: Verify all outcomes are clean
-- ============================================
-- This should return 0 rows after migration
SELECT 'CHECK: Remaining .xhtml in outcome' as check_name, COUNT(*) as count
FROM bas_modulo 
WHERE outcome LIKE '%.xhtml%';

-- ============================================
-- STEP 4: Report - Show all modules with their new outcomes
-- ============================================
SELECT 
    id,
    rotulo as label,
    outcome as new_route,
    ajuda as help_text,
    ordem as sort_order,
    id_modulo as parent_id
FROM bas_modulo 
WHERE outcome IS NOT NULL AND outcome != '\N'
ORDER BY COALESCE(id_modulo, 0), ordem, id;

-- ============================================
-- STEP 5: Summary statistics
-- ============================================
SELECT 
    COUNT(*) as total_modules,
    COUNT(CASE WHEN outcome LIKE '/view/%' THEN 1 END) as view_routes,
    COUNT(CASE WHEN outcome = '/default' THEN 1 END) as default_route,
    COUNT(CASE WHEN outcome IS NULL OR outcome = '\N' THEN 1 END) as menu_items_no_route
FROM bas_modulo;