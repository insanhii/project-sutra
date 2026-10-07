package com.turiya.sutra.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GraphEdge {
    private String from;
    private String to;
    private String label;
}
