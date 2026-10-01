package br.com.sol7.olimpio.shared;

import io.quarkus.hibernate.reactive.panache.Panache;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;

import java.lang.reflect.Field;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class GenericSearchService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private static String entityName(Class<?> entityClass) {
        String simple = entityClass.getSimpleName();
        String first = simple.substring(0, 1).toLowerCase();
        return first + simple.substring(1);
    }

    @SuppressWarnings("unchecked")
    public <T> Uni<PagedResponse<T>> search(Class<T> entityClass, SearchFilterRequest request, int page, int size) {
        int p = Math.min(Math.max(page, 0), Integer.MAX_VALUE);
        int s = Math.min(Math.max(size, 1), 100);

        StringBuilder where = new StringBuilder("1=1");
        List<Object> paramValues = new ArrayList<>();

        if (request != null && request.filters() != null) {
            for (var entry : request.filters().entrySet()) {
                String field = entry.getKey();
                SearchFilterRequest.FilterCondition cond = entry.getValue();
                if (cond == null || cond.value() == null || cond.value().isBlank()) continue;
                appendCondition(where, paramValues, entityClass, field, cond);
            }
        }

        String whereStr = where.toString();
        String entity = entityName(entityClass);
        String select = "select e from " + entity + " e where " + whereStr;
        String count = "select count(e) from " + entity + " e where " + whereStr;

        Uni<List<T>> listUni = Panache.getSession()
                .chain(session -> {
                    var query = session.createQuery(select, entityClass)
                            .setMaxResults(s)
                            .setFirstResult(p * s);
                    for (int i = 0; i < paramValues.size(); i++) {
                        query.setParameter(i + 1, paramValues.get(i));
                    }
                    return query.getResultList();
                });
        Uni<Long> countUni = Panache.getSession()
                .chain(session -> {
                    var query = session.createQuery(count, Long.class);
                    for (int i = 0; i < paramValues.size(); i++) {
                        query.setParameter(i + 1, paramValues.get(i));
                    }
                    return query.getSingleResult();
                })
                .map(Long::longValue);

        return Uni.combine().all().unis(listUni, countUni).asTuple()
                .map(tuple -> new PagedResponse<>(tuple.getItem1(), tuple.getItem2(), p, s));
    }

    private <T> void appendCondition(StringBuilder where, List<Object> paramValues,
                                     Class<T> entityClass, String field, SearchFilterRequest.FilterCondition cond) {
        String op = cond.operation().toUpperCase();
        String value = cond.value();
        String value2 = cond.value2();
        Class<?> fieldType = resolveFieldType(entityClass, field);
        String fieldRef = "e." + field;

        switch (op) {
            case "CONTAINS" -> {
                where.append(" AND lower(").append(fieldRef).append(") like lower(concat('%', ?").append(paramValues.size() + 1).append(", '%'))");
                paramValues.add(value);
            }
            case "EQUALS" -> {
                where.append(" AND ").append(fieldRef).append(" = ?").append(paramValues.size() + 1);
                paramValues.add(convertValue(value, fieldType));
            }
            case "NOT_EQUALS" -> {
                where.append(" AND ").append(fieldRef).append(" != ?").append(paramValues.size() + 1);
                paramValues.add(convertValue(value, fieldType));
            }
            case "STARTS_WITH" -> {
                where.append(" AND lower(").append(fieldRef).append(") like lower(concat(?").append(paramValues.size() + 1).append(", '%'))");
                paramValues.add(value);
            }
            case "ENDS_WITH" -> {
                where.append(" AND lower(").append(fieldRef).append(") like lower(concat('%', ?").append(paramValues.size() + 1).append("))");
                paramValues.add(value);
            }
            case "GREATER_THAN" -> {
                where.append(" AND ").append(fieldRef).append(" > ?").append(paramValues.size() + 1);
                paramValues.add(convertValue(value, fieldType));
            }
            case "GREATER_THAN_OR_EQUAL" -> {
                where.append(" AND ").append(fieldRef).append(" >= ?").append(paramValues.size() + 1);
                paramValues.add(convertValue(value, fieldType));
            }
            case "LESS_THAN" -> {
                where.append(" AND ").append(fieldRef).append(" < ?").append(paramValues.size() + 1);
                paramValues.add(convertValue(value, fieldType));
            }
            case "LESS_THAN_OR_EQUAL" -> {
                where.append(" AND ").append(fieldRef).append(" <= ?").append(paramValues.size() + 1);
                paramValues.add(convertValue(value, fieldType));
            }
            case "BETWEEN" -> {
                if (value2 != null && !value2.isBlank()) {
                    where.append(" AND ").append(fieldRef).append(" BETWEEN ?").append(paramValues.size() + 1);
                    where.append(" AND ?").append(paramValues.size() + 2);
                    paramValues.add(convertValue(value, fieldType));
                    paramValues.add(convertValue(value2, fieldType));
                } else {
                    where.append(" AND lower(").append(fieldRef).append(") like lower(concat('%', ?").append(paramValues.size() + 1).append(", '%'))");
                    paramValues.add(value);
                }
            }
            default -> {
                where.append(" AND lower(").append(fieldRef).append(") like lower(concat('%', ?").append(paramValues.size() + 1).append(", '%'))");
                paramValues.add(value);
            }
        }
    }

    private Class<?> resolveFieldType(Class<?> entityClass, String fieldName) {
        Class<?> clazz = entityClass;
        while (clazz != null && clazz != Object.class) {
            try {
                Field f = clazz.getDeclaredField(fieldName);
                return f.getType();
            } catch (NoSuchFieldException e) {
                clazz = clazz.getSuperclass();
            }
        }
        return String.class;
    }

    private Object convertValue(String value, Class<?> fieldType) {
        if (value == null) return null;
        if (fieldType == null) return value;

        if (fieldType == Boolean.class || fieldType == boolean.class) {
            return parseBoolean(value);
        }
        if (fieldType == Integer.class || fieldType == int.class) {
            try { return Integer.parseInt(value.trim()); } catch (NumberFormatException e) { return value; }
        }
        if (fieldType == Long.class || fieldType == long.class) {
            try { return Long.parseLong(value.trim()); } catch (NumberFormatException e) { return value; }
        }
        if (fieldType == Double.class || fieldType == double.class) {
            try { return Double.parseDouble(value.trim()); } catch (NumberFormatException e) { return value; }
        }
        if (fieldType == Float.class || fieldType == float.class) {
            try { return Float.parseFloat(value.trim()); } catch (NumberFormatException e) { return value; }
        }
        if (fieldType == Short.class || fieldType == short.class) {
            try { return Short.parseShort(value.trim()); } catch (NumberFormatException e) { return value; }
        }
        if (fieldType == Byte.class || fieldType == byte.class) {
            try { return Byte.parseByte(value.trim()); } catch (NumberFormatException e) { return value; }
        }
        if (java.math.BigDecimal.class.isAssignableFrom(fieldType)) {
            try { return new java.math.BigDecimal(value.trim()); } catch (NumberFormatException e) { return value; }
        }
        if (java.math.BigInteger.class.isAssignableFrom(fieldType)) {
            try { return new java.math.BigInteger(value.trim()); } catch (NumberFormatException e) { return value; }
        }
        if (fieldType == LocalDate.class) {
            try { return LocalDate.parse(value.trim(), DATE_FMT); } catch (DateTimeParseException e) { return value; }
        }
        if (fieldType == LocalDateTime.class) {
            try { return LocalDateTime.parse(value.trim()); } catch (DateTimeParseException e) {
                try { return LocalDate.parse(value.trim(), DATE_FMT).atStartOfDay(); } catch (DateTimeParseException e2) { return value; }
            }
        }
        if (fieldType == java.util.Date.class) {
            try {
                return java.sql.Date.valueOf(LocalDate.parse(value.trim(), DATE_FMT));
            } catch (DateTimeParseException e) { return value; }
        }
        return value;
    }

    private Boolean parseBoolean(String value) {
        if (value == null) return null;
        String v = value.trim().toLowerCase();
        return switch (v) {
            case "true", "1", "s", "sim", "ativo", "a", "yes", "y" -> Boolean.TRUE;
            case "false", "0", "n", "nao", "não", "inativo", "i", "no" -> Boolean.FALSE;
            default -> Boolean.valueOf(v);
        };
    }
}
