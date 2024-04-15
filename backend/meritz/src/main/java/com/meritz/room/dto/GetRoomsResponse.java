package com.meritz.room.dto;

import com.meritz.room.entity.RoomStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class GetRoomsResponse {
    private Long roomId;
    private String clientName;
    private String location;
    private LocalDateTime occurTime;
    private String managerName;
    private RoomStatus status;
}
