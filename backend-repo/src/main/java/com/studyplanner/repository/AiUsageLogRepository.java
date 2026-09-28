package com.studyplanner.repository;

import com.studyplanner.entity.AiUsageLog;
import com.studyplanner.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface AiUsageLogRepository extends JpaRepository<AiUsageLog, Long> {

    Page<AiUsageLog> findByFeatureAndCreatedAtAfterOrderByCreatedAtDesc(
            String feature, LocalDateTime after, Pageable p);

    Page<AiUsageLog> findByUserAndCreatedAtAfterOrderByCreatedAtDesc(
            User user, LocalDateTime after, Pageable p);

    Page<AiUsageLog> findByStatusNotAndCreatedAtAfterOrderByCreatedAtDesc(
            String status, LocalDateTime after, Pageable p);  // Failed requests

    @Query("SELECT COUNT(a) FROM AiUsageLog a WHERE a.createdAt >= :startDate AND a.createdAt <= :endDate")
    long countByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT SUM(a.costEstimate) FROM AiUsageLog a WHERE a.createdAt >= :startDate AND a.createdAt <= :endDate")
    BigDecimal sumCostByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT SUM(a.tokensUsed) FROM AiUsageLog a WHERE a.createdAt >= :startDate AND a.createdAt <= :endDate")
    Long sumTokensByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT a.feature, COUNT(a) as count, SUM(a.tokensUsed) as tokens, SUM(a.costEstimate) as cost " +
           "FROM AiUsageLog a WHERE a.createdAt >= :startDate AND a.createdAt <= :endDate " +
           "GROUP BY a.feature ORDER BY cost DESC")
    List<Object[]> getCostBreakdownByFeature(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT a.feature, COUNT(a) as count FROM AiUsageLog a WHERE a.status = 'SUCCESS' " +
           "AND a.createdAt >= :startDate AND a.createdAt <= :endDate GROUP BY a.feature")
    List<Object[]> getSuccessCountByFeature(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT a.feature, COUNT(a) as count FROM AiUsageLog a WHERE a.status = 'FAILED' " +
           "AND a.createdAt >= :startDate AND a.createdAt <= :endDate GROUP BY a.feature")
    List<Object[]> getFailureCountByFeature(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT DISTINCT DATE(a.createdAt) as date, COUNT(a) as count, SUM(a.costEstimate) as cost " +
           "FROM AiUsageLog a WHERE a.createdAt >= :startDate AND a.createdAt <= :endDate " +
           "GROUP BY DATE(a.createdAt) ORDER BY DATE(a.createdAt)")
    List<Object[]> getDailyTrendData(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT a.user, COUNT(a) as count, SUM(a.costEstimate) as totalCost, MAX(a.createdAt) as lastActivity " +
           "FROM AiUsageLog a GROUP BY a.user ORDER BY totalCost DESC")
    List<Object[]> getUserAiUsageStats();

    @Query("SELECT a FROM AiUsageLog a WHERE a.status = 'FAILED' " +
           "AND a.createdAt >= :startDate ORDER BY a.createdAt DESC")
    List<AiUsageLog> getFailedRequestsSince(
            @Param("startDate") LocalDateTime startDate);

    void deleteByUser(User user);
}
