package com.meritz.manager.controller;

import com.meritz.manager.dto.ManagerSignUpRequest;
import com.meritz.manager.entity.Manager;
import com.meritz.manager.repository.ManagerRepository;
import com.meritz.manager.service.ManagerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@Slf4j
@RestController
@RequiredArgsConstructor
public class ManagerController {

    private final ManagerRepository managerRepository;
    private final ManagerService managerService;

    @PostMapping("/api/managers/signup")
    public ResponseEntity<?> signUp(@RequestBody ManagerSignUpRequest in) {
        Optional<Manager> manager = managerRepository.findByManagerName(in.getManagerName());
        if (manager.isEmpty()) {
            return ResponseEntity.ok(managerService.signUp(in));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Client Already Exists.");
        }
    }
}
