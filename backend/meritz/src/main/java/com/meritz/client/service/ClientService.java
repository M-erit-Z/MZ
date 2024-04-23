package com.meritz.client.service;

import com.meritz.client.dto.ClientSignUpRequest;
import com.meritz.client.dto.GetEstimatedFeeResponse;
import com.meritz.client.entity.Client;
import com.meritz.client.repository.ClientRepository;
import com.meritz.room.dto.GetRoomsResponse;
import com.meritz.room.entity.Room;
import com.meritz.room.entity.RoomStatus;
import com.meritz.room.repository.RoomRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClientService {

    private final RoomRepository roomRepository;
    private final ClientRepository clientRepository;

    public Map<RoomStatus, List<GetRoomsResponse>> getAll(Client client) {
        List<Room> rooms = roomRepository.findByClient(client);

        Map<RoomStatus, List<GetRoomsResponse>> out = new HashMap<>();
        for (RoomStatus status : RoomStatus.values()) {
            List<GetRoomsResponse> filteredRooms = rooms.stream()
                    .filter(room -> room.getStatus() == status)
                    .map(this::getAllResponse)
                    .collect(Collectors.toList());
            out.put(status, filteredRooms);
        }

        return out;
    }

    public GetRoomsResponse getAllResponse(Room room) {
        return GetRoomsResponse.builder()
                .roomId(room.getId())
                .clientName(room.getClient().getClientName())
                .location(room.getLocation())
                .occurTime(room.getCreatedAt())
                .managerName(room.getManager().getManagerName())
                .status(room.getStatus())
                .build();
    }


    @Transactional
    public Object signUp(ClientSignUpRequest in) {
        return clientRepository.save(
                Client.builder()
                        .clientName(in.getClientName())
                        .clientPhone(in.getClientPhone())
                        .clientEmail(in.getClientEmail())
                        .insuranceFee((int)(Math.random() * 140) + 60)
                        .build()
        );
    }

    public GetEstimatedFeeResponse getFee(Room room) {
        Client client = room.getClient();

        int currentFee = client.getInsuranceFee();
        int increaseFee = (int)(currentFee * 1.2);
        int accidentAmount = (increaseFee - currentFee) * 3;

        return GetEstimatedFeeResponse.builder()
                .currentFee(currentFee)
                .increaseFee(increaseFee)
                .accidentAmount(accidentAmount)
                .build();
    }
}
