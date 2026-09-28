package com.studyplanner.repository;

import com.studyplanner.entity.Subject;
import com.studyplanner.entity.SyllabusFile;
import com.studyplanner.entity.SyllabusTopic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SyllabusTopicRepository extends JpaRepository<SyllabusTopic, Long> {

    List<SyllabusTopic> findBySyllabusFileOrderByOrderIndexAsc(SyllabusFile syllabusFile);

    List<SyllabusTopic> findBySubjectOrderByOrderIndexAsc(Subject subject);

    List<SyllabusTopic> findBySyllabusFileIdOrderByOrderIndexAsc(Long syllabusFileId);

    void deleteBySyllabusFile(SyllabusFile syllabusFile);
}
