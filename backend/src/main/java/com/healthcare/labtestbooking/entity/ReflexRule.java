package com.healthcare.labtestbooking.entity;

import com.healthcare.labtestbooking.entity.enums.ReflexPriority;
import com.healthcare.labtestbooking.entity.enums.TriggerCondition;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "reflex_rules", indexes = {
        @Index(name = "idx_reflex_rule_trigger", columnList = "trigger_test_name"),
        @Index(name = "idx_reflex_rule_active", columnList = "is_active")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReflexRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "trigger_test_name", nullable = false, length = 200)
    private String triggerTestName;

    @Enumerated(EnumType.STRING)
    @Column(name = "trigger_condition", nullable = false, length = 40)
    private TriggerCondition triggerCondition;

    @Column(name = "trigger_value", precision = 14, scale = 4)
    private BigDecimal triggerValue;

    @Column(name = "reflex_test_name", nullable = false, length = 200)
    private String reflexTestName;

    @Column(name = "reflex_test_slug", nullable = false, length = 200)
    private String reflexTestSlug;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 20)
    private ReflexPriority priority;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_by")
    private Long createdBy;
}
