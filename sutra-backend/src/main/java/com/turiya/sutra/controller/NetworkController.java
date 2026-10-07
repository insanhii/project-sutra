package com.turiya.sutra.controller;

import com.turiya.sutra.dto.MutationResponse;
import com.turiya.sutra.dto.NetworkResponse;
import com.turiya.sutra.service.NetworkService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class NetworkController {

    private final NetworkService networkService;

    @GetMapping("/network")
    public ResponseEntity<NetworkResponse> getNetwork() {
        log.info("GET /api/network - Fetching full network graph");
        return ResponseEntity.ok(networkService.getFullNetwork());
    }

    @PostMapping("/upload")
    public ResponseEntity<MutationResponse> uploadEvidence(@RequestParam("file") MultipartFile file) {
        log.info("POST /api/upload - Received file: {} ({}KB)", file.getOriginalFilename(), file.getSize() / 1024);
        // TODO: Implement NLP parsing pipeline for CSV/XLSX/PDF evidence files
        // For now, return current network state
        var network = networkService.getFullNetwork();
        return ResponseEntity.ok(new MutationResponse("SUCCESS", network.getNodes(), network.getEdges()));
    }

    @DeleteMapping("/node/{id}")
    public ResponseEntity<MutationResponse> deleteNode(@PathVariable String id) {
        log.info("DELETE /api/node/{} - Purging record from database", id);
        return ResponseEntity.ok(networkService.deleteNode(id));
    }
}
