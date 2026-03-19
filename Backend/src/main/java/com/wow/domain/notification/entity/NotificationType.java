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

    @Column(name = "notification_types_cord", nullable = false, unique = true, length = 20)
    private String notificationTypesCord;

    @Column(name = "notification_name", nullable = false, length = 20)
    private String notificationName;

}