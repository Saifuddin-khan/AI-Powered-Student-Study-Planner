package com.studyplanner.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SystemHealthResponse {

    private Long uptime;                    // milliseconds
    private Double memoryUsagePercent;      // 0-100%
    private Long memoryUsedMb;              // used memory in MB
    private Long memoryMaxMb;               // max memory in MB
    private Integer activeDbConnections;    // current active connections
    private Integer maxDbConnections;       // pool max size
    private Double cpuUsagePercent;         // CPU usage percentage
    private Double p50ApiLatencyMs;         // 50th percentile latency
    private Double p95ApiLatencyMs;         // 95th percentile latency
    private Double p99ApiLatencyMs;         // 99th percentile latency
    private String status;                  // "HEALTHY", "DEGRADED", "CRITICAL"
}
