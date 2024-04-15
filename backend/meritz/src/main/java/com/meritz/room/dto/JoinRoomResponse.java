package com.meritz.room.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class JoinRoomResponse {
    private String clientName;
    private String phoneNumber;
    private LocalDateTime createTime;
    private String location;
}
