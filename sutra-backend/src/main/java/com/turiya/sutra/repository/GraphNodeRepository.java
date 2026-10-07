package com.turiya.sutra.repository;

import com.turiya.sutra.model.GraphNode;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface GraphNodeRepository extends Neo4jRepository<GraphNode, String> {

    @Query("MATCH (n:Entity)-[r]->(m:Entity) RETURN {from: n.id, to: m.id, label: type(r)} AS edge")
    List<Map<String, Object>> findAllEdges();
}
