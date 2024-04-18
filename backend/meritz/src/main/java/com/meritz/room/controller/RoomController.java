package com.meritz.room.controller;
import com.meritz.client.entity.Client;
import com.meritz.client.repository.ClientRepository;
import com.meritz.room.dto.CreateRoomRequest;
import com.meritz.room.dto.SubmitRoomRequest;
import com.meritz.room.entity.Room;
import com.meritz.room.repository.RoomRepository;
import com.meritz.room.service.RoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@Slf4j
@RestController
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;
    private final RoomRepository roomRepository;
    private final ClientRepository clientRepository;

    @GetMapping("/api/rooms/{roomId}")
    public ResponseEntity<?> join(@PathVariable("roomId") Long roomId) {
        Optional<Room> room = roomRepository.findById(roomId);
        if (room.isPresent()) {
            return ResponseEntity.ok(roomService.join(room.get()));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Room Not Found.");
        }
    }

    @GetMapping("/api/rooms")
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(roomService.getAll());
    }

    @PostMapping("/api/rooms")
    public ResponseEntity<?> create(@RequestBody CreateRoomRequest in) {
        Optional<Client> findClient = clientRepository.findByClientNameAndAndClientPhone(in.getClientName(), in.getClientPhone());
        if (findClient.isPresent()) {
            return ResponseEntity.ok((roomService.create(findClient.get(), in)));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Client Not Found.");
        }
    }

    @PostMapping("/api/rooms/{roomId}")
    public ResponseEntity<?> submit(@PathVariable("roomId") Long roomId, @RequestBody SubmitRoomRequest in) {
        log.info(in.toString());
        Optional<Room> findRoom = roomRepository.findById(roomId);
        if (findRoom.isPresent()) {
            return ResponseEntity.ok(roomService.submit(findRoom.get(), in));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Room Not Found.");
        }
    }

    @GetMapping("/api/record/{roomId}")
    public ResponseEntity<?> read(@PathVariable("roomId") Long roomId) {
        Optional<Room> findRoom = roomRepository.findById(roomId);
        if (findRoom.isPresent()) {
            return ResponseEntity.ok(roomService.read(findRoom.get()));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Room Not Fond.");
        }
    }

    @PatchMapping("/api/rooms/{roomId}")
    public ResponseEntity<?> update(@PathVariable("roomId") Long roomId) {
        Optional<Room> findRoom = roomRepository.findById(roomId);
        if (findRoom.isPresent()) {
            return ResponseEntity.ok(roomService.update(findRoom.get()));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Room Not Found.");
        }
    }

    @GetMapping("/api/rooms/client/{roomId}")
    public ResponseEntity<?> getClientId(@PathVariable("roomId") Long roomId) {
        Optional<Room> findRoom = roomRepository.findById(roomId);
        if (findRoom.isPresent()) {
            return ResponseEntity.ok(roomService.getClientId(findRoom.get()));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Room Not Fond.");
        }
    }

}
