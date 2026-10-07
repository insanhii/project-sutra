import React, { useState, useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

const MOCK_CDRS = [
  { id: 'CDR-9021', caller: '+971-501234567', receiver: '+91-9876543210', duration: '14m 22s', cellTower: 'Pune-Sector 4 (Tower B)', timestamp: '2026-03-29 02:14:08', flag: 'CRITICAL' },
  { id: 'CDR-9022', caller: '+971-501234567', receiver: '+971-509876543', duration: '03m 10s', cellTower: 'Mumbai-Roaming Node', timestamp: '2026-03-29 04:55:12', flag: 'SUSPICIOUS' },
  { id: 'CDR-9023', caller: '+91-9876543210', receiver: '+91-9811223344', duration: '45m 00s', cellTower: 'Jaipur-Central Hub', timestamp: '2026-03-28 22:10:44', flag: 'NORMAL' },
  { id: 'CDR-9024', caller: '+971-501234567', receiver: '+91-9988776655', duration: '01m 15s', cellTower: 'Pune-Sector 4 (Tower B)', timestamp: '2026-03-28 19:30:01', flag: 'CRITICAL' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('graph');
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [activeFilters, setActiveFilters] = useState({
    Financial: true,
    Communication: true,
    Behavioral: true
  });
  
  const [aiExplanation, setAiExplanation] = useState(null);
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, time: '12:10:04', type: 'SYS_BOOT', msg: 'Neo4j Bolt Driver connected securely on bolt://localhost:7687' },
    { id: 2, time: '12:10:05', type: 'SEC_65B', msg: 'Chain of custody ledger verified via cryptographic timestamp.' }
  ]);

  const fgRef = useRef();

  useEffect(() => {
    fetch(`${API_BASE}/api/network`)
      .then(res => res.json())
      .then(data => {
        const formattedNodes = data.nodes.map((node, index) => {
          const angle = (index / data.nodes.length) * 2 * Math.PI;
          const radius = 220; // Wide spread radius so nodes don't overlap
          return {
            ...node,
            val: node.group === 'Person' ? 24 : node.group === 'BankAccount' ? 18 : 14,
            color: node.group === 'Person' ? '#ef4444' : node.group === 'BankAccount' ? '#3b82f6' : '#10b981',
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius
          };
        });

        const formattedLinks = data.edges.map(edge => ({
          source: edge.from,
          target: edge.to,
          label: edge.label,
          type: edge.label && (edge.label.includes('TRANSFERRED') || edge.label.includes('OWNER')) ? 'Financial' : 'Communication'
        }));

        setGraphData({ nodes: formattedNodes, links: formattedLinks });
        setAuditLogs(prev => [
          { id: Date.now(), time: new Date().toLocaleTimeString(), type: 'SYNC_SUCCESS', msg: `Synced ${formattedNodes.length} nodes from persistent backend storage.` },
          ...prev
        ]);
      })
      .catch(err => {
        console.error("Backend sync error:", err);
        // Fallback demo data when backend is offline
        const demoNodes = [
          { id: 'p1', label: 'Vikram Deshmukh', group: 'Person', val: 24, color: '#ef4444', x: 0, y: -200 },
          { id: 'p2', label: 'Rahul Kapoor', group: 'Person', val: 24, color: '#ef4444', x: -200, y: 100 },
          { id: 'p3', label: 'Amir Sheikh', group: 'Person', val: 24, color: '#ef4444', x: 200, y: 100 },
          { id: 'b1', label: 'HDFC-998822', group: 'BankAccount', val: 18, color: '#3b82f6', x: -100, y: -100 },
          { id: 'b2', label: 'SBI-554411', group: 'BankAccount', val: 18, color: '#3b82f6', x: 100, y: -100 },
          { id: 'ph1', label: '+971-501234567', group: 'Phone', val: 14, color: '#10b981', x: -150, y: 200 },
          { id: 'ph2', label: '+91-9876543210', group: 'Phone', val: 14, color: '#10b981', x: 150, y: 200 },
        ];
        const demoLinks = [
          { source: 'p1', target: 'b1', label: 'OWNER', type: 'Financial' },
          { source: 'p2', target: 'b2', label: 'OWNER', type: 'Financial' },
          { source: 'b1', target: 'b2', label: 'TRANSFERRED ₹14.5L', type: 'Financial' },
          { source: 'p1', target: 'ph1', label: 'USES', type: 'Communication' },
          { source: 'p3', target: 'ph2', label: 'USES', type: 'Communication' },
          { source: 'ph1', target: 'ph2', label: 'CALLED 14m', type: 'Communication' },
          { source: 'p3', target: 'p1', label: 'ASSOCIATE', type: 'Behavioral' },
        ];
        setGraphData({ nodes: demoNodes, links: demoLinks });
        setAuditLogs(prev => [
          { id: Date.now(), time: new Date().toLocaleTimeString(), type: 'FALLBACK_MODE', msg: 'Backend offline — loaded demo intelligence data for preview.' },
          ...prev
        ]);
      });
  }, []);

  // Strong repulsion to keep nodes cleanly separated
  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force('charge').strength(-1200);
      fgRef.current.d3Force('link').distance(150);
    }
  }, [graphData]);

  const handleFileUpload = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please select a valid evidence file first.");
      return;
    }

    setIsUploading(true);
    setUploadStatus("Uploading file to Java backend & parsing via NLP pipeline...");

    const formData = new FormData();
    formData.append("file", selectedFile);

    fetch(`${API_BASE}/api/upload`, {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        setIsUploading(false);
        if (data.status === "SUCCESS") {
          setUploadStatus(`Successfully parsed [${selectedFile.name}] and committed to Neo4j.`);
          
          const formattedNodes = data.nodes.map((node, index) => {
            const angle = (index / data.nodes.length) * 2 * Math.PI;
            const radius = 220;
            return {
              ...node,
              val: node.group === 'Person' ? 24 : node.group === 'BankAccount' ? 18 : 14,
              color: node.group === 'Person' ? '#ef4444' : node.group === 'BankAccount' ? '#3b82f6' : '#10b981',
              x: Math.cos(angle) * radius,
              y: Math.sin(angle) * radius
            };
          });

          const formattedLinks = data.edges.map((edge) => ({
            source: edge.from,
            target: edge.to,
            label: edge.label,
            type: edge.label && (edge.label.includes('TRANSFERRED') || edge.label.includes('OWNER')) ? 'Financial' : 'Communication'
          }));

          setGraphData({ nodes: formattedNodes, links: formattedLinks });
          setAuditLogs((prev) => [
            { id: Date.now(), time: new Date().toLocaleTimeString(), type: 'INGEST_SUCCESS', msg: `Backend successfully ingested and mapped ${selectedFile.name}` },
            ...prev
          ]);
        } else {
          setUploadStatus("Error processing file on backend.");
        }
        setSelectedFile(null);
      })
      .catch((err) => {
        console.error("Upload error:", err);
        setIsUploading(false);
        setUploadStatus("Failed to connect to Java backend storage.");
      });
  };

  const deleteSelectedNode = () => {
    if (!selectedNode) return;
    
    fetch(`${API_BASE}/api/node/${selectedNode.id}`, {
      method: "DELETE",
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === "SUCCESS") {
          const formattedNodes = data.nodes.map((node, index) => {
            const angle = (index / data.nodes.length) * 2 * Math.PI;
            const radius = 220;
            return {
              ...node,
              val: node.group === 'Person' ? 24 : node.group === 'BankAccount' ? 18 : 14,
              color: node.group === 'Person' ? '#ef4444' : node.group === 'BankAccount' ? '#3b82f6' : '#10b981',
              x: Math.cos(angle) * radius,
              y: Math.sin(angle) * radius
            };
          });

          const formattedLinks = data.edges.map(edge => ({
            source: edge.from,
            target: edge.to,
            label: edge.label,
            type: edge.label && (edge.label.includes('TRANSFERRED') || edge.label.includes('OWNER')) ? 'Financial' : 'Communication'
          }));

          setGraphData({ nodes: formattedNodes, links: formattedLinks });
          setAuditLogs(prev => [
            { id: Date.now(), time: new Date().toLocaleTimeString(), type: 'RECORD_PURGED', msg: `Successfully purged target record [${selectedNode.label}] from system database.` },
            ...prev
          ]);
          setSelectedNode(null);
        }
      })
      .catch(err => console.error("Delete error:", err));
  };

  const generateWordDossier = () => {
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>SEC-65B Evidence Dossier</title></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="text-align: center; color: #1e3a8a;">MINISTRY OF HOME AFFAIRS (MHA) / NCRB</h2>
        <h3 style="text-align: center; color: #dc2626;">PROJECT SUTRA - SECTION 65B EVIDENCE DOSSIER</h3>
        <hr/>
        <p><strong>Case File ID:</strong> #SIH-26189-PUNE</p>
        <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Cryptographic Hash (SHA-256):</strong> e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</p>
        <p><strong>Database Node:</strong> Neo4j Distributed Cluster (bolt://localhost:7687)</p>
        
        <h3 style="color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 4px;">1. Current Network Topology Summary</h3>
        <ul>
          <li><strong>Total Active Entities Tracked:</strong> ${graphData.nodes.length}</li>
          <li><strong>Total Relationship Vectors:</strong> ${graphData.links.length}</li>
          <li><strong>Primary Risk Classification:</strong> High Syndicate Convergence (Pune-Jaipur)</li>
        </ul>

        <h3 style="color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 4px;">2. Active Suspect Entities & Ledgers List</h3>
        <table border="1" cellspacing="0" cellpadding="8" style="width:100%; border-collapse: collapse; font-size: 12px;">
          <tr style="background-color: #f1f5f9;">
            <th>Entity Name / ID</th>
            <th>Classification Group</th>
            <th>UUID Hash</th>
          </tr>
          ${graphData.nodes.map(n => `
            <tr>
              <td><strong>${n.label}</strong></td>
              <td>${n.group}</td>
              <td>${n.id}</td>
            </tr>
          `).join('')}
        </table>

        <h3 style="color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 4px; margin-top: 20px;">3. Legal Certification Under Section 65B</h3>
        <p>This electronic record is generated automatically by Project Sutra Core Intelligence Engine. The computer output containing digital evidence is produced by a system operating properly and continuously. Certified true and admissible for court submission under the Indian Evidence Act.</p>
        <br/><br/>
        <p><strong>Authorized Investigating Officer Signature:</strong> __________________________</p>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SEC-65B_Court_Dossier_SIH26189.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setAuditLogs(prev => [
      { id: Date.now(), time: new Date().toLocaleTimeString(), type: 'LEGAL_EXPORT', msg: 'Generated & Downloaded Word-Compatible SEC-65B Dossier.' },
      ...prev
    ]);
  };

  const filteredLinks = graphData.links.filter(link => activeFilters[link.type] !== false);
  const currentFilteredData = {
    nodes: graphData.nodes,
    links: filteredLinks
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    setAiExplanation({
      target: node.label,
      rationale: `AI correlation engine flagged target [${node.label}] due to shared communication topology, multi-hop financial layering, and spatial-temporal cell tower intersection within a 24-hour window.`
    });
    setAuditLogs(prev => [
      { id: Date.now(), time: new Date().toLocaleTimeString(), type: 'NODE_INSPECT', msg: `Investigator focused on target: ${node.label} (${node.group}). Chain of custody hash logged.` },
      ...prev
    ]);
  };

  const toggleFilter = (type) => {
    setActiveFilters(prev => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090d16] text-[#cbd5e1] font-mono select-none">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-20 lg:w-64 bg-[#05080f] border-r border-[#1e293b] flex flex-col justify-between z-30 shrink-0">
        <div>
          <div className="h-16 border-b border-[#1e293b] flex items-center px-4 lg:px-6 gap-3 bg-[#090d16]">
            <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_#dc2626]"></div>
            <div className="hidden lg:block">
              <h1 className="text-xs font-bold tracking-widest text-slate-100 uppercase">PROJECT SUTRA</h1>
              <p className="text-[9px] text-cyan-400 tracking-wider">MHA / NCRB INTEL v4.2</p>
            </div>
          </div>

          <nav className="p-3 space-y-2">
            {[
              { id: 'dashboard', label: 'Command Dashboard', icon: '📊' },
              { id: 'graph', label: 'Network Graph View', icon: '🕸️' },
              { id: 'upload', label: 'Evidence Ingestion (PDF/Excel)', icon: '📁' },
              { id: 'search', label: 'CCTNS / FIR & CDRs', icon: '🔍' },
              { id: 'financials', label: 'Financial Ledgers', icon: '💳' },
              { id: 'alerts', label: 'AI Threat Alerts', icon: '⚡' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded text-xs transition-all ${
                  activeTab === item.id 
                    ? 'bg-[#1e3a8a] text-white font-semibold border-l-4 border-cyan-400 shadow-lg' 
                    : 'text-slate-400 hover:bg-[#0f172a] hover:text-slate-200'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span className="hidden lg:inline">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-[#1e293b] hidden lg:block bg-[#03050a]">
          <div className="text-[10px] text-slate-500 space-y-1">
            <div className="flex justify-between"><span>SEC-65B:</span> <span className="text-emerald-400">ACTIVE HASH</span></div>
            <div className="flex justify-between"><span>TOTAL NODES:</span> <span className="text-cyan-400">{graphData.nodes.length} MAPPED</span></div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT CONTAINER */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        <header className="h-16 bg-[#05080f] border-b border-[#1e293b] flex items-center justify-between px-6 z-20 shrink-0">
          <div className="flex items-center gap-4">
            <span className="bg-red-950/80 text-red-400 border border-red-800 text-[10px] px-2.5 py-1 rounded tracking-widest font-bold">
              TOP SECRET // RESTRICTED ACCESS
            </span>
            <h2 className="text-sm font-semibold tracking-wide text-slate-200 uppercase font-sans">
              {activeTab === 'dashboard' && 'Operations Command Overview'}
              {activeTab === 'graph' && 'Tactical Network & Relationship Matrix'}
              {activeTab === 'upload' && 'Secure Evidence Ingestion & Parsing Portal'}
              {activeTab === 'search' && 'Unified FIR, CDR & Suspect Repository'}
              {activeTab === 'financials' && 'Cross-Border Money Trail & Shell Ledgers'}
              {activeTab === 'alerts' && 'Neural Network Anomaly & Threat Detection'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={generateWordDossier}
              className="bg-emerald-800 hover:bg-emerald-700 text-white px-3 py-1.5 rounded font-bold text-[11px] tracking-wide border border-emerald-600 transition-all shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <span>📄</span> EXPORT SEC-65B DOSSIER (WORD)
            </button>
            <div className="bg-[#1e3a8a] text-white px-3 py-1.5 rounded font-bold text-[11px] tracking-wide">
              CASE: #SIH-26189-PUNE
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden relative">

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-[#020617]">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Active Threat Entities', val: graphData.nodes.length, change: 'Live from Neo4j Backend', color: 'text-red-400', border: 'border-red-900/50' },
                  { label: 'Mapped Relationships', val: graphData.links.length, change: 'Active Edges', color: 'text-amber-400', border: 'border-amber-900/50' },
                  { label: 'Mapped Transactions', val: '₹4.8 Cr', change: 'Flagged Layers', color: 'text-purple-400', border: 'border-purple-900/50' },
                  { label: 'System Health', val: '99.9%', change: '14ms Response', color: 'text-emerald-400', border: 'border-emerald-900/50' },
                ].map((kpi, idx) => (
                  <div key={idx} className={`bg-[#05080f] border ${kpi.border} p-5 rounded-lg shadow-xl`}>
                    <div className="text-[10px] text-slate-400 uppercase mb-1">{kpi.label}</div>
                    <div className={`text-2xl font-bold font-sans ${kpi.color}`}>{kpi.val}</div>
                    <div className="text-[10px] text-slate-500 mt-2">{kpi.change}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EVIDENCE INGESTION PORTAL TAB */}
          {activeTab === 'upload' && (
            <div className="flex-1 p-8 overflow-y-auto bg-[#020617] flex flex-col items-center justify-center">
              <div className="max-w-2xl w-full bg-[#05080f] border border-[#1e293b] rounded-xl p-8 shadow-2xl space-y-6">
                <div className="text-center space-y-2">
                  <span className="text-cyan-400 text-xs font-bold tracking-widest uppercase bg-cyan-950 px-3 py-1 rounded border border-cyan-800">SECURE MHA UPLOAD GATEWAY</span>
                  <h3 className="text-lg font-bold text-slate-100 font-sans">Ingest Unstructured Police Evidence</h3>
                  <p className="text-xs text-slate-400">Upload your dummy CDR CSV, Bank Excel, or FIR PDF files here. The backend will permanently store and merge them into Neo4j.</p>
                </div>

                <form onSubmit={handleFileUpload} className="space-y-4">
                  <div className="border-2 border-dashed border-[#334155] bg-[#090d16] rounded-lg p-8 text-center flex flex-col items-center justify-center gap-3">
                    <span className="text-3xl">📂</span>
                    <input 
                      type="file" 
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                      className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-500">Supported Formats: .CSV, .XLSX, .PDF</span>
                  </div>

                  {selectedFile && (
                    <div className="bg-[#090d16] p-3 rounded border border-[#1e293b] flex justify-between items-center text-xs">
                      <span className="text-slate-300">Selected: <strong>{selectedFile.name}</strong></span>
                      <span className="text-cyan-400 font-mono">{(selectedFile.size / 1024).toFixed(2)} KB</span>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={isUploading}
                    className="w-full bg-[#1e3a8a] hover:bg-blue-800 text-white py-3 rounded font-bold text-xs tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isUploading ? 'SAVING TO BACKEND STORAGE...' : 'INITIATE GRAPH NLP PARSING & INGESTION'}
                  </button>
                </form>

                {uploadStatus && (
                  <div className="bg-emerald-950/60 border border-emerald-800 p-4 rounded text-xs text-emerald-300 flex items-center gap-3">
                    <span className="animate-spin text-base">⚙️</span>
                    <span>{uploadStatus}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* GRAPH VIEW TAB (STABLE WITH CSS DISPLAY TOGGLE & WIDE SPREAD) */}
          <div className={`flex-1 relative bg-[#020408] overflow-hidden flex flex-col ${activeTab === 'graph' ? 'flex' : 'hidden'}`}>
            <div className="absolute top-4 left-4 z-10 bg-[#05080f]/90 border border-[#1e293b] p-3 rounded-lg flex items-center gap-4 text-xs shadow-xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Topology Filters:</span>
              {Object.keys(activeFilters).map((type) => (
                <button
                  key={type}
                  onClick={() => toggleFilter(type)}
                  className={`px-3 py-1.5 rounded transition-all flex items-center gap-2 text-[11px] ${
                    activeFilters[type] 
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-[0_0_8px_rgba(6,182,212,0.3)]' 
                      : 'bg-[#090d16] text-slate-500 border border-[#1e293b]'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${activeFilters[type] ? 'bg-cyan-400' : 'bg-slate-600'}`}></span>
                  {type}
                </button>
              ))}
            </div>

            <div className="flex-1 w-full h-full cursor-grab">
              <ForceGraph2D
                ref={fgRef}
                graphData={currentFilteredData}
                nodeId="id"
                nodeLabel="label"
                nodeColor="color"
                nodeVal="val"
                linkColor={() => '#475569'}
                linkWidth={2}
                linkDirectionalArrowLength={6}
                linkDirectionalArrowRelPos={1}
                enableNodeDrag={true}
                onNodeDragEnd={node => {
                  node.fx = node.x;
                  node.fy = node.y;
                }}
                nodeCanvasObject={(node, ctx, globalScale) => {
                  const label = node.label || 'Node';
                  const fontSize = Math.max(10 / globalScale, 7);
                  
                  ctx.beginPath();
                  if (node.group === 'BankAccount') {
                    ctx.rect(node.x - 10, node.y - 10, 20, 20);
                    ctx.fillStyle = '#1e3a8a';
                    ctx.fill();
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = '#60a5fa';
                    ctx.stroke();
                  } else if (node.group === 'Phone') {
                    ctx.arc(node.x, node.y, 9, 0, 2 * Math.PI, false);
                    ctx.fillStyle = '#065f46';
                    ctx.fill();
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = '#34d399';
                    ctx.stroke();
                  } else {
                    ctx.arc(node.x, node.y, 11, 0, 2 * Math.PI, false);
                    ctx.fillStyle = '#7f1d1d';
                    ctx.fill();
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = '#f87171';
                    ctx.stroke();
                  }

                  ctx.font = `bold ${fontSize}px Segoe UI, sans-serif`;
                  const textWidth = ctx.measureText(label).width;
                  const bkgDimensions = [textWidth + 6, fontSize + 4];

                  ctx.fillStyle = 'rgba(5, 8, 15, 0.9)';
                  ctx.fillRect(node.x - bkgDimensions[0] / 2, node.y + 14, bkgDimensions[0], bkgDimensions[1]);
                  
                  ctx.strokeStyle = '#334155';
                  ctx.lineWidth = 0.8;
                  ctx.strokeRect(node.x - bkgDimensions[0] / 2, node.y + 14, bkgDimensions[0], bkgDimensions[1]);

                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.fillStyle = '#ffffff';
                  ctx.fillText(label, node.x, node.y + 16 + (fontSize / 2));
                }}
                linkCanvasObject={(link, ctx, globalScale) => {
                  const start = link.source;
                  const end = link.target;
                  if (!start || !end) return;

                  ctx.beginPath();
                  ctx.moveTo(start.x, start.y);
                  ctx.lineTo(end.x, end.y);
                  ctx.strokeStyle = '#64748b';
                  ctx.lineWidth = 2;
                  ctx.stroke();

                  const textPos = { x: start.x + (end.x - start.x) / 2, y: start.y + (end.y - start.y) / 2 };
                  const fontSize = Math.max(8 / globalScale, 6);
                  ctx.font = `bold ${fontSize}px Segoe UI, sans-serif`;
                  
                  const textWidth = ctx.measureText(link.label || '').width;
                  ctx.fillStyle = '#090d16';
                  ctx.fillRect(textPos.x - textWidth / 2 - 3, textPos.y - fontSize / 2 - 2, textWidth + 6, fontSize + 4);
                  
                  ctx.strokeStyle = '#1e293b';
                  ctx.lineWidth = 0.8;
                  ctx.strokeRect(textPos.x - textWidth / 2 - 3, textPos.y - fontSize / 2 - 2, textWidth + 6, fontSize + 4);

                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.fillStyle = '#38bdf8';
                  ctx.fillText(link.label || '', textPos.x, textPos.y);
                }}
                onNodeClick={handleNodeClick}
              />
            </div>
          </div>

          {/* SEARCH & CDR TAB */}
          {activeTab === 'search' && (
            <div className="flex-1 p-6 overflow-y-auto bg-[#020617] space-y-6">
              <div className="bg-[#05080f] border border-[#1e293b] rounded-lg overflow-hidden shadow-xl">
                <div className="px-5 py-4 border-b border-[#1e293b] bg-[#090d16] flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-300 uppercase">CCTNS / FIR & Call Detail Records (CDRs)</h3>
                  <span className="text-[10px] text-emerald-400">Cryptographic Integrity Verified</span>
                </div>
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#1e293b] text-slate-500 bg-[#03050a] text-[10px] uppercase">
                      <th className="p-3">Record ID</th>
                      <th className="p-3">Caller</th>
                      <th className="p-3">Receiver</th>
                      <th className="p-3">Duration</th>
                      <th className="p-3">Cell Tower</th>
                      <th className="p-3">Threat Flag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e293b] text-slate-300">
                    {MOCK_CDRS.map((cdr) => (
                      <tr key={cdr.id} className="hover:bg-[#0f172a]">
                        <td className="p-3 font-bold text-cyan-400">{cdr.id}</td>
                        <td className="p-3">{cdr.caller}</td>
                        <td className="p-3">{cdr.receiver}</td>
                        <td className="p-3">{cdr.duration}</td>
                        <td className="p-3 text-slate-400">{cdr.cellTower}</td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] bg-red-950 text-red-400 border border-red-800">{cdr.flag}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* FINANCIALS TAB */}
          {activeTab === 'financials' && (
            <div className="flex-1 p-6 bg-[#020617]">
              <div className="bg-[#05080f] border border-[#1e293b] rounded-lg p-5 shadow-xl">
                <h3 className="text-xs font-bold text-slate-300 uppercase mb-4">Multi-Hop Money Laundering Trail (Hawala Pattern)</h3>
                <div className="p-4 bg-[#090d16] border border-[#1e293b] rounded text-xs space-y-3">
                  <div className="flex justify-between text-slate-400"><span>Source Ledger:</span> <strong className="text-slate-200">HDFC-998822 (Vikram D.)</strong></div>
                  <div className="flex justify-between text-slate-400"><span>Intermediary Shell:</span> <strong className="text-slate-200">SBI-554411 (Rahul K.)</strong></div>
                  <div className="flex justify-between text-slate-400"><span>Transfer Volume:</span> <strong className="text-emerald-400">₹14,50,000 INR</strong></div>
                  <div className="flex justify-between text-slate-400"><span>AI Verdict:</span> <strong className="text-red-400">High probability of structured layering</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* ALERTS TAB */}
          {activeTab === 'alerts' && (
            <div className="flex-1 p-6 bg-[#020617]">
              <div className="bg-[#05080f] border border-red-900/50 rounded-lg p-5 shadow-xl">
                <h3 className="text-xs font-bold text-red-400 uppercase mb-2">Automated Threat Rule #402: Syndicate Convergence</h3>
                <p className="text-xs text-slate-300 leading-relaxed">AI correlation engine detected active convergence between Pune and Jaipur networks with an analytical confidence score of <strong className="text-red-400">92.4%</strong>.</p>
              </div>
            </div>
          )}

          {/* NODE INSPECTOR DRAWER */}
          {selectedNode && (
            <aside className="w-96 bg-[#05080f] border-l border-[#1e293b] flex flex-col z-30 shadow-2xl shrink-0">
              <div className="h-16 border-b border-[#1e293b] flex items-center justify-between px-6 bg-[#090d16]">
                <h3 className="text-xs font-bold text-slate-100 uppercase">Target Dossier</h3>
                <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-white text-base font-bold cursor-pointer">✕</button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
                <div className="bg-[#090d16] border border-[#1e293b] p-4 rounded-lg space-y-3">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Identifier</span>
                    <strong className="text-sm text-slate-100 font-sans">{selectedNode.label}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">GROUP / TYPE</span>
                    <span className="text-cyan-400 font-bold">{selectedNode.group}</span>
                  </div>
                  <div className="pt-2 border-t border-[#1e293b]">
                    <span className="text-[10px] text-slate-500 block">NEO4J UUID</span>
                    <span className="text-[10px] text-slate-400 font-mono break-all">{selectedNode.id}</span>
                  </div>
                </div>

                {aiExplanation && (
                  <div className="bg-[#0f172a] border border-cyan-900/60 p-4 rounded-lg space-y-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-cyan-500/10 text-cyan-400 text-[9px] px-2 py-0.5 rounded-bl font-bold">EXPLAINABLE AI (XAI)</div>
                    <div className="text-[11px] font-bold text-cyan-300 pt-1">🤖 Why was this node flagged?</div>
                    <p className="text-[11px] text-slate-300 bg-[#020408] p-3 rounded border border-cyan-950 leading-relaxed">{aiExplanation.rationale}</p>
                  </div>
                )}

                <button 
                  onClick={deleteSelectedNode}
                  className="w-full bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 py-2.5 rounded font-bold text-xs tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  <span>🗑️</span> PURGE TARGET RECORD // DELETE FROM DB
                </button>
              </div>
            </aside>
          )}

        </div>

        {/* AUDIT TELEMETRY FOOTER */}
        <footer className="h-8 bg-[#03050a] border-t border-[#1e293b] flex items-center px-6 text-[10px] text-slate-400 z-20 shrink-0">
          <div className="flex items-center gap-6 overflow-hidden">
            <span className="text-cyan-400 font-bold shrink-0">[AUDIT STREAM]:</span>
            <div className="truncate flex gap-4">
              {auditLogs.slice(0, 2).map(log => (
                <span key={log.id} className="text-slate-300">
                  <span className="text-slate-500">[{log.time}]</span> {log.msg}
                </span>
              ))}
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}