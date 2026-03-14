import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import GraphView from './components/GraphView';
import { generateMockTransactions, buildGraphData } from './utils/dataGenerator';

function App() {
  const [rawData, setRawData] = useState({ accounts: [], transactions: [] });
  const [freezeLogs, setFreezeLogs] = useState([]); // Database for audit tracking
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogs, setShowLogs] = useState(false);
  const [freezeModalNodeId, setFreezeModalNodeId] = useState(null);

  // Simulate auto-connecting to Live Bank Database
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      // Simulate live fetch with a smaller, cleaner dataset
      const data = generateMockTransactions(40);
      setRawData(data);
      setLoading(false);
    }, 2500); // slightly longer to simulate actual db connection
  }, []);

  const graphData = useMemo(() => {
    if (rawData.accounts.length === 0) return { nodes: [], links: [] };
    const builtData = buildGraphData(rawData.accounts, rawData.transactions);
    
    // Auto-Freeze logging logic
    builtData.nodes.forEach(node => {
      // Check if node is auto-frozen but not yet logged
      if (node.isFrozen && node.status === 'Auto-Frozen (24h)') {
        setFreezeLogs(currentLogs => {
          if (!currentLogs.find(log => log.accountId === node.id && log.type === 'Auto-Freeze')) {
            return [...currentLogs, {
              id: `LOG-${Date.now()}-${Math.floor(Math.random()*1000)}`,
              accountId: node.id,
              accountName: node.name,
              reason: `Risk score > 80. Flags: ${node.flags.join(', ')}`,
              riskScore: node.riskScore.toFixed(0),
              type: 'Auto-Freeze',
              timestamp: new Date().toISOString(),
              admin: 'SYSTEM'
            }];
          }
          return currentLogs;
        });
      }
    });
    
    return builtData;
  }, [rawData]);

  const handleSearch = (term) => {
    if (!term.trim()) return;
    const lowerTerm = term.toLowerCase();

    // Search in nodes first
    const foundNode = graphData.nodes.find(n => 
      n.id.toLowerCase().includes(lowerTerm) || 
      (n.name && n.name.toLowerCase().includes(lowerTerm))
    );

    if (foundNode) {
      setSelectedNode(foundNode);
      return;
    }

    // Try finding by TXID
    const foundTx = rawData.transactions.find(t => 
      t.id && t.id.toLowerCase().includes(lowerTerm)
    );

    if (foundTx) {
      const txNode = graphData.nodes.find(n => n.id === foundTx.from || n.id === foundTx.to);
      if (txNode) {
        setSelectedNode(txNode);
        return;
      }
    }
    
    alert("No matching network entities or transactions found.");
  };

  const submitFreeze = (nodeId, freezeType) => {
    const targetAccount = rawData.accounts.find(a => a.id === nodeId) || {};
    const newIsFrozen = freezeType !== 'unfreeze';
    
    // Update Freeze Logs Audit Trail outside of the state updater (pure state update)
    setFreezeLogs(currentLogs => [
      {
        id: `LOG-${Date.now()}-${Math.floor(Math.random()*1000)}`,
        accountId: nodeId,
        accountName: targetAccount.name || 'Unknown',
        reason: newIsFrozen ? `Manual ${freezeType} freeze applied` : 'Manual override unfreeze requested',
        riskScore: 'N/A', // Assuming admin overrides risk
        type: newIsFrozen ? `Manual Freeze (${freezeType})` : 'Manual Unfreeze',
        timestamp: new Date().toISOString(),
        admin: 'admin_user_01'
      },
      ...currentLogs
    ]);

    setRawData(prev => {
      return {
        ...prev,
        accounts: prev.accounts.map(acc => 
          acc.id === nodeId ? { 
            ...acc, 
            isFrozen: newIsFrozen, 
            freezeType: newIsFrozen ? freezeType : undefined,
            status: newIsFrozen ? `${freezeType.charAt(0).toUpperCase() + freezeType.slice(1)} Freeze` : "Monitoring" 
          } : acc
        )
      };
    });
    
    // Also update selectedNode so the sidebar reflects it immediately
    setSelectedNode(prev => {
      if (prev && prev.id === nodeId) {
        return { 
          ...prev, 
          isFrozen: newIsFrozen, 
          freezeType: newIsFrozen ? freezeType : undefined,
          status: newIsFrozen ? `${freezeType.charAt(0).toUpperCase() + freezeType.slice(1)} Freeze` : "Monitoring" 
        };
      }
      return prev;
    });
    setFreezeModalNodeId(null);
  };

  const handleToggleFreeze = (nodeId) => {
    const targetAccount = rawData.accounts.find(a => a.id === nodeId) || {};
    if (targetAccount.isFrozen) {
      submitFreeze(nodeId, 'unfreeze');
    } else {
      setFreezeModalNodeId(nodeId);
    }
  };

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        width: '100vw',
        background: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--border)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <div className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '2px', textAlign: 'center' }}>
          <div>CONNECTING TO CORE BANKING DATASET...</div>
          <div style={{ marginTop: '8px', color: 'var(--secondary)' }}>ESTABLISHING SECURE PROTOCOL</div>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Header 
        onSearch={handleSearch} 
        onShowLogs={() => setShowLogs(true)} 
        freezeCount={freezeLogs.length} 
      />
      <main style={{ flex: 1, display: 'flex', overflow: 'hidden', padding: '0 12px' }}>
        <GraphView 
          data={graphData} 
          onNodeClick={setSelectedNode} 
          selectedNode={selectedNode}
        />
        <Sidebar 
          selectedNode={selectedNode} 
          transactions={rawData.transactions} 
          onToggleFreeze={handleToggleFreeze}
        />
      </main>

      {/* Freeze Selection Modal */}
      {freezeModalNodeId && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass" style={{ width: '400px', display: 'flex', flexDirection: 'column', padding: '32px', textAlign: 'center', gap: '24px' }}>
            <h2 style={{ fontSize: '1.5rem' }}>Select Freeze Type</h2>
            <p style={{ color: 'var(--text-muted)' }}>Choose the level of restriction to apply to this account.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button 
                className="btn" 
                style={{ justifyContent: 'center', borderColor: '#39ff14', color: '#39ff14', padding: '16px', background: 'rgba(57, 255, 20, 0.05)' }}
                onClick={() => submitFreeze(freezeModalNodeId, 'permanent')}
              >
                Permanent Freeze
              </button>
              <button 
                className="btn" 
                style={{ justifyContent: 'center', borderColor: '#ffff00', color: '#ffff00', padding: '16px', background: 'rgba(255, 255, 0, 0.05)' }}
                onClick={() => submitFreeze(freezeModalNodeId, 'temporary')}
              >
                Temporary Freeze
              </button>
            </div>
            
            <button className="btn" style={{ justifyContent: 'center', marginTop: '12px' }} onClick={() => setFreezeModalNodeId(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Freeze Logs Audit Modal */}
      {showLogs && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass" style={{ width: '80%', maxWidth: '900px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.5rem' }}>Compliance Audit Trail (Freeze Logs)</h2>
              <button className="btn" onClick={() => setShowLogs(false)}>Close</button>
            </div>
            
            <div style={{ overflowY: 'auto', flex: 1 }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px' }}>LOG ID</th>
                    <th style={{ padding: '12px' }}>TIMESTAMP</th>
                    <th style={{ padding: '12px' }}>ACTION</th>
                    <th style={{ padding: '12px' }}>ACCOUNT</th>
                    <th style={{ padding: '12px' }}>REASON / EVENT SIGNAL</th>
                    <th style={{ padding: '12px' }}>AUTHORITY</th>
                  </tr>
                </thead>
                <tbody>
                  {freezeLogs.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="mono" style={{ padding: '12px', color: 'var(--text-muted)' }}>{log.id}</td>
                      <td style={{ padding: '12px' }}>{new Date(log.timestamp).toLocaleString()}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem',
                          background: log.type.includes('Unfreeze') ? 'rgba(0,255,157,0.1)' : 'rgba(184,46,46,0.1)',
                          color: log.type.includes('Unfreeze') ? 'var(--success)' : 'var(--danger)'
                        }}>
                          {log.type.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}><span className="mono">{log.accountId}</span></td>
                      <td style={{ padding: '12px', maxWidth: '250px' }}>{log.reason}</td>
                      <td style={{ padding: '12px', color: log.admin === 'SYSTEM' ? 'var(--secondary)' : '#fff' }}>{log.admin}</td>
                    </tr>
                  ))}
                  {freezeLogs.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No actions logged yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {/* Background scanline effect */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '4px',
        background: 'linear-gradient(to bottom, transparent, var(--primary-glow), transparent)',
        opacity: 0.1,
        pointerEvents: 'none',
        zIndex: 100,
        animation: 'scanline 8s linear infinite'
      }}></div>
    </div>
  );
}

export default App;
