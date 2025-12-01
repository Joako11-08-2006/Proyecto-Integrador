package com.ecommerce.chat.repository;

import com.ecommerce.chat.entity.ChatKnowledge;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ChatKnowledgeRepository extends JpaRepository<ChatKnowledge, Long> {

    Optional<ChatKnowledge> findTopByOrderByUpdatedAtDesc();

    @Query(value = "SELECT * FROM chat_knowledge ORDER BY updated_at DESC LIMIT 10", nativeQuery = true)
    java.util.List<ChatKnowledge> findLatestHistory();
}
