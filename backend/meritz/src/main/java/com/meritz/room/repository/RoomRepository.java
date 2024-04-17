package com.meritz.room.repository;

import com.meritz.client.entity.Client;
import com.meritz.room.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByClient(Client client);
}
