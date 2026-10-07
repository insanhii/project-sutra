package com.turiya.sutra.service;

import com.turiya.sutra.dto.MutationResponse;
import com.turiya.sutra.dto.NetworkResponse;
import com.turiya.sutra.model.GraphEdge;
import com.turiya.sutra.model.GraphNode;
import com.turiya.sutra.repository.GraphNodeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NetworkService {

    private final GraphNodeRepository nodeRepository;

    public NetworkResponse getFullNetwork() {
        List<GraphNode> nodes = nodeRepository.findAll();
        List<GraphEdge> edges = nodeRepository.findAllEdges().stream()
                .map(this::mapToEdge)
                .collect(Collectors.toList());
        
        log.info("Fetched {} nodes and {} edges from Neo4j", nodes.size(), edges.size());
        return new NetworkResponse(nodes, edges);
    }

    public MutationResponse deleteNode(String id) {
        nodeRepository.deleteById(id);
        log.info("Deleted node with id: {}", id);
        
        NetworkResponse network = getFullNetwork();
        return new MutationResponse("SUCCESS", network.getNodes(), network.getEdges());
    }

    private GraphEdge mapToEdge(Map<String, Object> edgeMap) {
        @SuppressWarnings("unchecked")
        Map<String, Object> edge = (Map<String, Object>) edgeMap.get("edge");
        return new GraphEdge(
                (String) edge.get("from"),
                (String) edge.get("to"),
                (String) edge.get("label")
        );
    }
}
