package com.meritz.chat.entity;

import com.meritz.global.entity.BaseEntity;
import com.meritz.room.entity.Room;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Getter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Chat extends BaseEntity {

    @Lob
    @Column(columnDefinition = "MEDIUMTEXT")
    private String messages;

    @OneToOne(mappedBy = "chat")
    private Room room;

    public void updateChat(String chat) {
        this.messages+=chat;
    }
}