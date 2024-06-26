package com.meritz.manager.entity;

import com.meritz.global.entity.BaseEntity;
import com.meritz.room.entity.Room;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Getter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
public class Manager extends BaseEntity {

    private String managerName;

    @OneToMany(mappedBy = "manager")
    private List<Room> rooms;
}
