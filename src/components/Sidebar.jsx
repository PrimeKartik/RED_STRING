import React from 'react';
import { AlertTriangle, TrendingUp, Users, ArrowRightLeft, Info, Lock, Unlock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ selectedNode, transactions, onToggleFreeze }) => {
  return (
    <aside className="glass" style={{
      width: '380px',
      margin: '12px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      overflowY: 'auto'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <AlertTriangle size={20} color="var(--primary)" />
        <h2 style={{ fontSize: '1.1rem' }}>Investigation Intel</h2>
      </div>

      <AnimatePresence mode="wait">
        {selectedNode ? (
          <motion.div 
            key={selectedNode.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            <div className="glass" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{selectedNode.name}</h3>
                  <code style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedNode.id}</code>
                </div>
                <div style={{ 
                  background: selectedNode.riskScore > 40 ? 'var(--primary-glow)' : 'var(--secondary-glow)',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  border: `1px solid ${selectedNode.riskScore > 40 ? 'var(--primary)' : 'var(--secondary)'}`,
                  color: selectedNode.riskScore > 40 ? 'var(--primary)' : 'var(--secondary)'
                }}>
                  {selectedNode.type}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>RISK SCORE</div>
                  <div style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: '700', 
                    color: selectedNode.riskScore > 40 ? 'var(--primary)' : 'var(--success)' 
                  }}>
                    {selectedNode.riskScore}/100
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>BALANCE</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>
                    ₹{selectedNode.balance?.toLocaleString()}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: `3px solid ${selectedNode.isFrozen ? (selectedNode.freezeType === 'permanent' ? '#39ff14' : '#ffff00') : (selectedNode.riskScore >= 60 ? 'var(--warning)' : 'var(--success)')}` }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>ALGORITHM STATUS</div>
                <div style={{ fontSize: '1rem', fontWeight: '600', color: selectedNode.isFrozen ? (selectedNode.freezeType === 'permanent' ? '#39ff14' : '#ffff00') : (selectedNode.riskScore >= 60 ? 'var(--warning)' : 'var(--success)') }}>
                  {selectedNode.status || 'Monitoring'}
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <button 
                  className={`btn ${selectedNode.isFrozen ? 'btn-primary' : ''}`}
                  style={{ 
                    width: '100%', 
                    justifyContent: 'center', 
                    borderColor: selectedNode.isFrozen ? (selectedNode.freezeType === 'permanent' ? '#39ff14' : '#ffff00') : 'var(--danger)',
                    background: selectedNode.isFrozen ? (selectedNode.freezeType === 'permanent' ? '#39ff14' : '#ffff00') : 'transparent',
                    color: selectedNode.isFrozen ? '#000' : 'var(--danger)'
                  }}
                  onClick={() => onToggleFreeze(selectedNode.id)}
                >
                  {selectedNode.isFrozen ? <Unlock size={18} /> : <Lock size={18} />}
                  <span>{selectedNode.isFrozen ? 'Unfreeze Account' : 'Freeze Account'}</span>
                </button>
              </div>
            </div>

            {selectedNode.flags?.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>DETECTION FLAGS</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedNode.flags.map(flag => (
                    <div key={flag} className="glass" style={{ 
                      padding: '4px 10px', 
                      fontSize: '0.75rem', 
                      borderColor: 'var(--primary)',
                      color: 'var(--primary)',
                      background: 'rgba(184, 46, 46, 0.1)'
                    }}>
                      {flag}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>RECENT ACTIVITY</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {transactions
                  .filter(t => t.from === selectedNode.id || t.to === selectedNode.id)
                  .slice(0, 5)
                  .map(t => (
                    <div key={t.id} className="glass" style={{ padding: '12px', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span className="mono">{t.id}</span>
                        <span style={{ color: t.from === selectedNode.id ? 'var(--primary)' : 'var(--success)' }}>
                          {t.from === selectedNode.id ? '-' : '+'}₹{t.amount?.toLocaleString()}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {t.from === selectedNode.id ? `To: ${t.to}` : `From: ${t.from}`}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <div style={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--text-muted)',
            textAlign: 'center',
            gap: '16px'
          }}>
            <Info size={48} opacity={0.2} />
            <p>Select a node on the graph to view financial intelligence and risk breakdown.</p>
          </div>
        )}
      </AnimatePresence>

      <div style={{ marginTop: 'auto' }}>
        <div className="glass" style={{ padding: '16px', background: 'rgba(0, 242, 255, 0.05)', borderColor: 'var(--secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <TrendingUp size={16} color="var(--secondary)" />
            <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Network Stats</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>NODES</div>
              <div style={{ fontSize: '1.1rem' }}>452</div>
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>RISK LEVEL</div>
              <div style={{ fontSize: '1.1rem', color: 'var(--warning)' }}>ELEVATED</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
