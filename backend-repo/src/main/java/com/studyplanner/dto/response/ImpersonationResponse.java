package com.studyplanner.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ImpersonationResponse {

    private String accessToken;
    private Long targetUserId;
    private String targetUserName;
    private String targetUserEmail;
    private String targetUserRole;
    private String adminName;
    private String adminEmail;
}
