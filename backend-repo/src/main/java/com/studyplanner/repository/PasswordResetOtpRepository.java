package com.studyplanner.repository;

import com.studyplanner.entity.PasswordResetOtp;
import com.studyplanner.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PasswordResetOtpRepository extends JpaRepository<PasswordResetOtp, Long> {

    Optional<PasswordResetOtp> findTopByUserAndIsUsedFalseOrderByCreatedAtDesc(User user);

    Optional<PasswordResetOtp> findTopByOtpAndIsUsedFalseOrderByCreatedAtDesc(String otp);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE PasswordResetOtp o SET o.isUsed = true WHERE o.user = :user")
    void invalidateAllUserOtps(@Param("user") User user);
}
