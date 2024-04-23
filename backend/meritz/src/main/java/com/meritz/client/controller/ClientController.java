package com.meritz.client.controller;

import com.meritz.client.dto.ClientSignUpRequest;
import com.meritz.client.entity.Client;
import com.meritz.client.repository.ClientRepository;
import com.meritz.client.service.ClientService;
import com.meritz.room.entity.Room;
import com.meritz.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@Slf4j
@RestController
@RequiredArgsConstructor
public class ClientController {

    private final ClientService clientService;
    private final ClientRepository clientRepository;
    private final RoomRepository roomRepository;

    @GetMapping("/api/clients")
    public ResponseEntity<?> getClientId(@RequestParam("clientName") String clientName,
                                         @RequestParam("clientPhone") String clientPhone) {
        Optional<Client> client = clientRepository.findByClientNameAndAndClientPhone(clientName, clientPhone);
        if (client.isPresent()) {
            return ResponseEntity.ok(client.get().getId());
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Client Not Found.");
        }
    }

    @GetMapping("/api/clients/{clientId}")
    public ResponseEntity<?> getHistory(@PathVariable("clientId") Long clientId) {
        Optional<Client> client = clientRepository.findById(clientId);
        if (client.isPresent()) {
            return ResponseEntity.ok(clientService.getAll(client.get()));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Client Not Found.");
        }
    }

    @PostMapping("/api/clients/signup")
    public ResponseEntity<?> signUp(@RequestBody ClientSignUpRequest in) {
        Optional<Client> client = clientRepository.findByClientNameAndAndClientPhone(in.getClientName(), in.getClientPhone());
        if (client.isEmpty()) {
            return ResponseEntity.ok(clientService.signUp(in));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Client Already Exists.");
        }
    }

    @GetMapping("/api/clients/fee/{roomId}")
    public ResponseEntity<?> getFee(@PathVariable("roomId") Long roomId) {
        Optional<Room> room = roomRepository.findById(roomId);
        if (room.isPresent()) {
            return ResponseEntity.ok(clientService.getFee(room.get()));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Client Not Found");
        }
    }

}
