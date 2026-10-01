package br.com.sol7.olimpio.shared;

import jakarta.persistence.Tuple;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

public final class TupleHelper {

    private TupleHelper() {
    }

    public static Object get(Tuple tuple, String name) {
        return tuple != null ? tuple.get(name) : null;
    }

    public static Object get(Object row, String name) {
        if (row instanceof Tuple) {
            return ((Tuple) row).get(name);
        }
        return null;
    }

    public static Long getLong(Tuple tuple, String name) {
        Object value = get(tuple, name);
        return toLong(value);
    }

    public static Long getLong(Object row, String name) {
        Object value = get(row, name);
        return toLong(value);
    }

    public static Integer getInteger(Tuple tuple, String name) {
        Object value = get(tuple, name);
        return toInteger(value);
    }

    public static Integer getInteger(Object row, String name) {
        Object value = get(row, name);
        return toInteger(value);
    }

    public static Boolean getBoolean(Tuple tuple, String name) {
        Object value = get(tuple, name);
        return toBoolean(value);
    }

    public static Boolean getBoolean(Object row, String name) {
        Object value = get(row, name);
        return toBoolean(value);
    }

    public static String getString(Tuple tuple, String name) {
        Object value = get(tuple, name);
        return toString(value);
    }

    public static String getString(Object row, String name) {
        Object value = get(row, name);
        return toString(value);
    }

    public static Date getDate(Tuple tuple, String name) {
        Object value = get(tuple, name);
        return toDate(value);
    }

    public static Date getDate(Object row, String name) {
        Object value = get(row, name);
        return toDate(value);
    }

    public static LocalDate getLocalDate(Tuple tuple, String name) {
        Object value = get(tuple, name);
        return toLocalDate(value);
    }

    public static LocalDate getLocalDate(Object row, String name) {
        Object value = get(row, name);
        return toLocalDate(value);
    }

    public static LocalDateTime getLocalDateTime(Tuple tuple, String name) {
        Object value = get(tuple, name);
        return toLocalDateTime(value);
    }

    public static LocalDateTime getLocalDateTime(Object row, String name) {
        Object value = get(row, name);
        return toLocalDateTime(value);
    }

    public static BigDecimal getBigDecimal(Tuple tuple, String name) {
        Object value = get(tuple, name);
        return toBigDecimal(value);
    }

    public static BigDecimal getBigDecimal(Object row, String name) {
        Object value = get(row, name);
        return toBigDecimal(value);
    }

    public static Long toLong(Object value) {
        if (value == null) return null;
        if (value instanceof Number n) return n.longValue();
        try {
            return Long.valueOf(value.toString().trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static Integer toInteger(Object value) {
        if (value == null) return null;
        if (value instanceof Number n) return n.intValue();
        try {
            return Integer.valueOf(value.toString().trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static Boolean toBoolean(Object value) {
        if (value == null) return null;
        if (value instanceof Boolean b) return b;
        if (value instanceof Number n) return n.intValue() != 0;
        String s = value.toString().trim().toLowerCase();
        return "true".equals(s) || "1".equals(s) || "t".equals(s) || "y".equals(s) || "yes".equals(s);
    }

    private static String toString(Object value) {
        return value == null ? null : value.toString();
    }

    private static Date toDate(Object value) {
        if (value == null) return null;
        if (value instanceof Date d) return d;
        if (value instanceof LocalDate ld) return java.sql.Date.valueOf(ld);
        if (value instanceof LocalDateTime ldt) return java.sql.Timestamp.valueOf(ldt);
        return null;
    }

    private static LocalDate toLocalDate(Object value) {
        if (value == null) return null;
        if (value instanceof LocalDate ld) return ld;
        if (value instanceof Date d) return new java.sql.Date(d.getTime()).toLocalDate();
        return null;
    }

    private static LocalDateTime toLocalDateTime(Object value) {
        if (value == null) return null;
        if (value instanceof LocalDateTime ldt) return ldt;
        if (value instanceof Date d) return new java.sql.Timestamp(d.getTime()).toLocalDateTime();
        return null;
    }

    private static BigDecimal toBigDecimal(Object value) {
        if (value == null) return null;
        if (value instanceof BigDecimal bd) return bd;
        if (value instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
        try {
            return new BigDecimal(value.toString().trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public static <T> List<T> mapRows(List<?> rows, RowMapper<T> mapper) {
        if (rows == null) return List.of();
        return rows.stream()
                .filter(r -> r != null)
                .map(mapper::map)
                .toList();
    }

    @FunctionalInterface
    public interface RowMapper<T> {
        T map(Object row);
    }
}