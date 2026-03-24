package com.wow.domain.notification.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Table(name = "notification_types")
public class NotificationType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_types_id")
    // [fix] 수정 전: notificationTypesId (복수형) | 이유: 다른 모든 엔티티는 id로 통일, 네이밍 불일치
    private Long id;

    // [fix] 수정 전: notificationTypesCord (오타 "cord") | 이유: 의미상 "code"가 맞고 Java 필드명이 혼란을 줌
    //   → @Column(name = "notification_types_cord") 명시로 DB 컬럼명은 그대로 유지하여 마이그레이션 없이 수정
    @Column(name = "notification_types_cord", nullable = false, unique = true, length = 20)
    private String notificationTypesCode;

    @Column(name = "notification_name", nullable = false, length = 20)
    private String notificationName;

}