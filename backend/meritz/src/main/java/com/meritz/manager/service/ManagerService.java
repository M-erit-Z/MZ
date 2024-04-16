package com.meritz.manager.service;

import com.meritz.client.dto.ClientSignUpRequest;
import com.meritz.client.entity.Client;
import com.meritz.manager.dto.ManagerSignUpRequest;
import com.meritz.manager.entity.Manager;
import com.meritz.manager.repository.ManagerRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ManagerService {

    private final ManagerRepository managerRepository;

    @Transactional
    public Object signUp(ManagerSignUpRequest in) {
        return managerRepository.save(
                Manager.builder()
                        .managerName(in.getManagerName())
                        .build()
        );
    }
}
