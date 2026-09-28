package com.studyplanner.dto.request;

import com.studyplanner.enums.GoalStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GoalStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private GoalStatus status;
}
