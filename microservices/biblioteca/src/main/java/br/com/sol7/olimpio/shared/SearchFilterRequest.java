package br.com.sol7.olimpio.shared;

import jakarta.enterprise.inject.Vetoed;
import java.util.Map;

@Vetoed
public record SearchFilterRequest(Map<String, FilterCondition> filters) {

    public record FilterCondition(String operation, String value, String value2) {
        public FilterCondition {
            if (operation == null || operation.isBlank()) operation = "CONTAINS";
        }

        public static FilterCondition of(String operation, String value) {
            return new FilterCondition(operation, value, null);
        }

        public static FilterCondition between(String value, String value2) {
            return new FilterCondition("BETWEEN", value, value2);
        }
    }
}