package com.studyplanner.dto.response;

import com.studyplanner.enums.DifficultyLevel;
import com.studyplanner.enums.MasteryStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SyllabusTopicResponse {

    private Long id;
    private String unitName;
    private String chapterName;
    private String topicName;
    private Integer orderIndex;
    private DifficultyLevel difficultyLevel;
    private MasteryStatus masteryStatus;
    private Integer progressPercent;
}
