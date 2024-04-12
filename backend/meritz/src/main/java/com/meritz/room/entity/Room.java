package com.meritz.room.entity;

import com.meritz.chat.entity.Chat;
import com.meritz.client.entity.Client;
import com.meritz.global.entity.BaseEntity;
import java.time.LocalDateTime;

import com.meritz.manager.entity.Manager;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Getter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
public class Room extends BaseEntity {

    private long roomNumber;
    private LocalDateTime accidentTime;
    private String accidentLocation;
    private String accidentContent;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;

    @ManyToOne
    @JoinColumn(name = "manager_id")
    private Manager manager;

    @OneToOne(mappedBy = "room")
    private Chat chat;
}
