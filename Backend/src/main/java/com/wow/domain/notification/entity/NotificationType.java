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
    private Long notificationTypesId;

    @Column(name = "notification_types_cord", nullable = false, unique = true, length = 20)
    private String notificationTypesCord;

    @Column(name = "notification_name", nullable = false, length = 20)
    private String notificationName;

}