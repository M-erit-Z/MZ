package com.meritz.room.service;
import com.meritz.client.entity.Client;
import com.meritz.manager.repository.ManagerRepository;
import com.meritz.room.dto.*;
import com.meritz.room.entity.Room;
import com.meritz.room.entity.RoomStatus;
import com.meritz.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoomService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    private final RoomRepository roomRepository;
    private final ManagerRepository managerRepository;

    private final EmailService emailService;

    public Long create(Client client, CreateRoomRequest in) {

        Room room = Room.builder()
                .client(client)
                .location(in.getLocation())
                .occurTime(LocalDateTime.now())
                .status(RoomStatus.대기중)
                .manager(managerRepository.findById(1L).get())
                .build();
        roomRepository.save(room);

        messagingTemplate.convertAndSend("/topic/rooms",
                GetRoomsResponse.builder()
                        .roomId(room.getId())
                        .clientName(room.getClient().getClientName())
                        .location(room.getLocation())
                        .occurTime(room.getCreatedAt())
                        .managerName(room.getManager().getManagerName())
                        .status(room.getStatus())
                        .build());

        return room.getId();
    }

    public JoinRoomResponse join(Room room) {
        return JoinRoomResponse.builder()
                .clientName(room.getClient().getClientName())
                .clientPhone(room.getClient().getClientPhone())
                .clientEmail(room.getClient().getClientEmail())
                .createTime(room.getCreatedAt())
                .location(room.getLocation())
                .build();
    }

    public HttpStatus update(Room room) {
        if (room.getStatus().equals(RoomStatus.처리중)) {
            return HttpStatus.OK;
        }
        room.updateStatus();
        room.setManager(managerRepository.findById(2L).get());
        roomRepository.save(room);
        messagingTemplate.convertAndSend("/topic/rooms",
                GetRoomsResponse.builder()
                        .roomId(room.getId())
                        .clientName(room.getClient().getClientName())
                        .location(room.getLocation())
                        .occurTime(room.getCreatedAt())
                        .managerName(room.getManager().getManagerName())
                        .status(room.getStatus())
                        .previousStatus(RoomStatus.대기중)
                        .build());

        return HttpStatus.OK;
    }

    public Map<RoomStatus, List<GetRoomsResponse>> getAll() {
        List<Room> rooms = roomRepository.findAll();

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

    public HttpStatus submit(Room room, SubmitRoomRequest in) {
        room.submit(in);
        roomRepository.save(room);

        messagingTemplate.convertAndSend("/topic/" + room.getId(),
                TerminateRoomResponse.builder()
                        .msg("상담이 종료되었습니다.")
                        .clientId(room.getClient().getId())
                        .build());
        messagingTemplate.convertAndSend("/topic/rooms",
                GetRoomsResponse.builder()
                        .roomId(room.getId())
                        .clientName(room.getClient().getClientName())
                        .location(room.getLocation())
                        .occurTime(room.getCreatedAt())
                        .managerName(room.getManager().getManagerName())
                        .status(room.getStatus())
                        .previousStatus(RoomStatus.처리중)
                        .build());

        // Email 보내기
        emailService.sendEmail(in.getClientEmail(), "사고 내역", in.getContent()+"이상입니다.");
        return HttpStatus.OK;
    }

    public SubmitRoomRequest read(Room room) {
        return SubmitRoomRequest.builder()
                .roomId(room.getId())
                .clientName(room.getClient().getClientName())
                .clientPhone(room.getClient().getClientPhone())
                .clientEmail(room.getClient().getClientEmail())
                .occurTime(room.getOccurTime())
                .location(room.getLocation())
                .content(room.getContent())
                .build();
    }
}
