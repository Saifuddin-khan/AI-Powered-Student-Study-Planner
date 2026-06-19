package com.studyplanner.enums;

/**
 * Enumeration for different statuses of a quiz attempt
 */
public enum AttemptStatus {
    IN_PROGRESS,      // User is taking the quiz
    SUBMITTED,        // User submitted answers
    EVALUATED         // AI grading complete
}
