package com.turiya.sutra.dto;

import com.turiya.sutra.model.GraphEdge;
import com.turiya.sutra.model.GraphNode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NetworkResponse {
    private List<GraphNode> nodes;
    private List<GraphEdge> edges;
}
