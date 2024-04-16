package com.meritz.client.service;

import com.meritz.client.entity.Client;
import com.meritz.room.dto.GetRoomsResponse;
import com.meritz.room.entity.Room;
import com.meritz.room.entity.RoomStatus;
import com.meritz.room.repository.RoomRepository;
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


}
