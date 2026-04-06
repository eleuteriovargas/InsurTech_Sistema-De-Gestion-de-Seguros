package com.vargas.insurtech.utils;

public final class Constants {

    private Constants() {
        throw new UnsupportedOperationException("Utility class");
    }

    public static final String API_VERSION = "v1";
    public static final String BASE_PATH = "/api/" + API_VERSION;

    public static final int DEFAULT_PAGE_SIZE = 20;
    public static final int MAX_PAGE_SIZE = 100;

    public static final int MAX_CUOTAS = 24;
    public static final int MIN_CUOTAS = 1;

    public static final String ROLE_ADMIN = "ROLE_ADMIN";
    public static final String ROLE_AGENT = "ROLE_AGENT";
    public static final String ROLE_EVALUATOR = "ROLE_EVALUATOR";
    public static final String ROLE_CUSTOMER = "ROLE_CUSTOMER";
    public static final String ROLE_FINANCE = "ROLE_FINANCE";

    public static final String DATE_FORMAT = "yyyy-MM-dd";
    public static final String DATETIME_FORMAT = "yyyy-MM-dd HH:mm:ss";
}
