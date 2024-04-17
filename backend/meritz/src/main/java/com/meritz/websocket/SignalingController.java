package com.meritz.websocket;

import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
public class SignalingController {

    // offer 메시지 처리
    @MessageMapping("/peer/offer/{roomId}")
    @SendTo("/topic/peer/offer/{roomId}")
    public String handleOffer(@Payload String offer, @DestinationVariable String roomId) {
        log.info("[OFFER] Room {}: {}", roomId, offer);
        return offer;
    }

    // answer 메시지 처리
    @MessageMapping("/peer/answer/{roomId}")
    @SendTo("/topic/peer/answer/{roomId}")
    public String handleAnswer(@Payload String answer, @DestinationVariable String roomId) {
        log.info("[ANSWER] Room {}: {}", roomId, answer);
        return answer;
    }

    // iceCandidate 메시지 처리
    @MessageMapping("/peer/iceCandidate/{roomId}")
    @SendTo("/topic/peer/iceCandidate/{roomId}")
    public String handleIceCandidate(@Payload String candidate, @DestinationVariable String roomId) {
        log.info("[ICECANDIDATE] Room {}: {}", roomId, candidate);
        return candidate;
    }

    @MessageMapping("/peer/offer/{camKey}/{roomId}")
    @SendTo("/topic/peer/offer/{camKey}/{roomId}")
    public String PeerHandleOffer(@Payload String offer,
                                  @DestinationVariable(value = "camKey") String camKey,
                                  @DestinationVariable(value = "roomId") String roomId) {
        log.info("[OFFER] {} : {}", camKey, offer);
        return offer;
    }

    @MessageMapping("/peer/iceCandidate/{camKey}/{roomId}")
    @SendTo("/topic/peer/iceCandidate/{camKey}/{roomId}")
    public String PeerHandleIceCandidate(@Payload String candidate,
                                         @DestinationVariable(value = "camKey") String camKey,
                                         @DestinationVariable(value = "roomId") String roomId) {
        log.info("[ICECANDIDATE] {} : {}", camKey, candidate);
        return candidate;
    }

    @MessageMapping("/peer/answer/{camKey}/{roomId}")
    @SendTo("/topic/peer/answer/{camKey}/{roomId}")
    public String PeerHandleAnswer(@Payload String answer, @DestinationVariable(value = "roomId") String roomId,
                                   @DestinationVariable(value = "camKey") String camKey) {
        log.info("[ANSWER] {} : {}", camKey, answer);
        return answer;
    }

    //camKey 를 받기위해 신호를 보내는 webSocket
    @MessageMapping("/call/key")
    @SendTo("/topic/call/key")
    public String callKey(@Payload String message) {
        log.info("[Key] : {}", message);
        return message;
    }

    //자신의 camKey 를 모든 연결된 세션에 보내는 webSocket
    @MessageMapping("/send/key")
    @SendTo("/topic/send/key")
    public String sendKey(@Payload String message) {
        return message;
    }


}