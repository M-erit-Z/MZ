package com.meritz.room.entity;

import com.meritz.chat.entity.Chat;
import com.meritz.client.entity.Client;
import com.meritz.global.entity.BaseEntity;
import java.time.LocalDateTime;

import com.meritz.manager.entity.Manager;
import com.meritz.room.dto.SubmitRoomRequest;
import jakarta.persistence.*;
import jakarta.transaction.Transactional;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
public class Room extends BaseEntity {

    private String location;
    private String content;
    private LocalDateTime occurTime;
    @Enumerated(EnumType.STRING)
    private RoomStatus status;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;

    @Setter
    @ManyToOne
    @JoinColumn(name = "manager_id")
    private Manager manager;


    @OneToOne
    @JoinColumn(name = "chat_id")
    private Chat chat;


    @Transactional
    public void updateStatus() {
        if (this.status == RoomStatus.대기중) {
            this.status = RoomStatus.처리중;
        } else if (this.status == RoomStatus.처리중) {
            this.status = RoomStatus.완료;
        }
    }

    @Transactional
    public void submit(SubmitRoomRequest in) {
        this.occurTime = in.getOccurTime();
        this.location = in.getLocation();
        this.content = in.getContent();
        this.updateStatus();
    }
}
