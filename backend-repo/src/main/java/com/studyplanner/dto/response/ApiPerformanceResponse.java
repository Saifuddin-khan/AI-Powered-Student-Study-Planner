package com.studyplanner.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ApiPerformanceResponse {

    private String endpoint;                // API endpoint path
    private Double p50LatencyMs;            // 50th percentile latency in ms
    private Double p95LatencyMs;            // 95th percentile latency in ms
    private Double p99LatencyMs;            // 99th percentile latency in ms
    private Double avgLatencyMs;            // average latency in ms
    private Double maxLatencyMs;            // maximum latency in ms
    private Double minLatencyMs;            // minimum latency in ms
    private Long totalRequests;             // total requests to this endpoint
    private Double errorRate;               // percentage of failed requests
}
