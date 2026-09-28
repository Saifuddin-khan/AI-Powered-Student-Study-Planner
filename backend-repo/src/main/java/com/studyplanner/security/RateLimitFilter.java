package com.studyplanner.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studyplanner.dto.response.ApiResponse;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private record Rule(int capacity, Duration window, boolean perUser) {}

    private static final Map<String, Rule> RULES = Map.of(
            "/api/v1/auth/login", new Rule(5, Duration.ofMinutes(1), false),
            "/api/v1/auth/register", new Rule(5, Duration.ofHours(1), false),
            "/api/v1/auth/forgot-password", new Rule(3, Duration.ofHours(1), false),
            "/api/v1/ai/chat", new Rule(20, Duration.ofMinutes(1), true)
    );

    private final ObjectMapper objectMapper;
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    public RateLimitFilter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        Rule rule = RULES.get(request.getRequestURI());
        if (rule != null && "POST".equalsIgnoreCase(request.getMethod())) {
            String key = request.getRequestURI() + ":" + (rule.perUser() ? userKey(request) : clientIp(request));
            Bucket bucket = buckets.computeIfAbsent(key, k -> newBucket(rule));

            if (!bucket.tryConsume(1)) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.setHeader("Retry-After", String.valueOf(rule.window().getSeconds()));
                objectMapper.writeValue(response.getOutputStream(),
                        ApiResponse.failure("Too many requests. Please try again later."));
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private Bucket newBucket(Rule rule) {
        Bandwidth limit = Bandwidth.builder()
                .capacity(rule.capacity())
                .refillIntervally(rule.capacity(), rule.window())
                .build();
        return Bucket.builder().addLimit(limit).build();
    }

    private String clientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String userKey(HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getName() != null) {
            return auth.getName();
        }
        return clientIp(request);
    }
}
