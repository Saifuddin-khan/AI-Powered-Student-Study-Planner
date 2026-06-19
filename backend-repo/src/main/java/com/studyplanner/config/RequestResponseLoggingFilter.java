package com.studyplanner.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Component
@Order(1)
@Slf4j
public class RequestResponseLoggingFilter implements Filter {

    private static final String REQUEST_ID_HEADER = "X-Request-Id";
    private static final String MDC_REQUEST_ID    = "requestId";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        if (!(request instanceof HttpServletRequest httpRequest)) {
            chain.doFilter(request, response);
            return;
        }

        HttpServletResponse httpResponse = (HttpServletResponse) response;
        String requestId = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        MDC.put(MDC_REQUEST_ID, requestId);
        httpResponse.setHeader(REQUEST_ID_HEADER, requestId);

        long start = System.currentTimeMillis();
        String method   = httpRequest.getMethod();
        String path     = buildPath(httpRequest);

        try {
            chain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - start;
            int  status   = httpResponse.getStatus();
            log.info("{} {} {} {}ms [{}]", method, path, status, duration, requestId);
            MDC.remove(MDC_REQUEST_ID);
        }
    }

    private String buildPath(HttpServletRequest req) {
        String path = req.getRequestURI();
        String qs   = req.getQueryString();
        String full = qs != null ? path + "?" + qs : path;
        return full.length() > 200 ? full.substring(0, 200) : full;
    }
}
