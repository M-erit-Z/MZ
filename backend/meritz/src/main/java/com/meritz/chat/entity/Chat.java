package com.meritz.chat.entity;

import com.meritz.global.entity.BaseEntity;
import com.meritz.room.entity.Room;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
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
public class Chat extends BaseEntity {

    private String messages;

    @OneToOne(mappedBy = "")
    private Room room;
}