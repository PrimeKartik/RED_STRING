import React, { useRef, useCallback, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const GraphView = ({ data, onNodeClick, selectedNode }) => {
  const fgRef = useRef();
  const [initialZoomDone, setInitialZoomDone] = useState(false);

  useEffect(() => {
    if (fgRef.current) {
      // Increase repulsion between nodes to spread them out horizontally
      fgRef.current.d3Force('charge').strength(-400); // Default is typically -30, -400 heavily repels
      // Give the nodes a larger base distance
      fgRef.current.d3Force('link').distance(80);
    }
  }, [data]);

  const handleNodeClick = useCallback(node => {
    onNodeClick(node);
    // Aim at node from near distance
    fgRef.current.centerAt(node.x, node.y, 1000);
    fgRef.current.zoom(2, 1000);
  }, [onNodeClick]);

  return (
    <div className="glass" style={{
      flex: 1,
      margin: '12px 0 12px 0',
      position: 'relative',
      overflow: 'hidden',
      background: 'var(--bg-secondary)'
    }}>
      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        warmupTicks={100}
        cooldownTicks={0}
        nodeLabel={node => `${node.name} (${node.id})`}
        nodeColor={node => {
          if (selectedNode && node.id === selectedNode.id) return '#fff';
          if (node.isFrozen) return node.freezeType === 'permanent' ? '#39ff14' : '#ffff00';
          return node.riskScore > 50 ? 'var(--primary)' : 'var(--secondary)';
        }}
        nodeVal={node => node.val}
        linkDirectionalArrowLength={5}
        linkDirectionalArrowRelPos={1}
        linkCurvature={0.25}
        linkWidth={1.5}
        linkColor={() => 'rgba(255, 255, 255, 0.4)'}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={d => d.amount * 0.001}
        onNodeClick={handleNodeClick}
        nodePointerAreaPaint={(node, color, ctx) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI, false);
          ctx.fill();
        }}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.name;
          const fontSize = 12/globalScale;
          ctx.font = `${fontSize}px Inter`;
          const textWidth = ctx.measureText(label).width;
          const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); 

          // Shadow/Glow
          ctx.shadowColor = node.isFrozen 
            ? (node.freezeType === 'permanent' ? 'rgba(57, 255, 20, 0.8)' : 'rgba(255, 255, 0, 0.8)') 
            : (node.riskScore > 50 ? 'rgba(184, 46, 46, 0.8)' : 'rgba(0, 242, 255, 0.8)');
          ctx.shadowBlur = 15;

          ctx.fillStyle = node.isFrozen 
            ? (node.freezeType === 'permanent' ? '#39ff14' : '#ffff00') 
            : (node.riskScore > 50 ? '#b82e2e' : '#00f2ff');
          if (selectedNode && node.id === selectedNode.id) {
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#ffffff';
          }
          
          ctx.beginPath(); 
          ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI, false); 
          ctx.fill();

          // Reset shadow for text
          ctx.shadowBlur = 0;

          if (globalScale > 1.5) {
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.fillText(label, node.x, node.y + node.val + 5);
          }
        }}
      />
      
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        display: 'flex',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--secondary)' }}></div>
          <span>Standard Account</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)' }}></div>
          <span>Suspicious Flag</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#39ff14' }}></div>
          <span>Permanent Freeze</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffff00' }}></div>
          <span>Temporary Freeze</span>
        </div>
      </div>
    </div>
  );
};

export default GraphView;
