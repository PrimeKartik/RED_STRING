import React, { useState } from 'react';
import { Shield, Activity, Search, Bell, Database, FileText } from 'lucide-react';

const Header = ({ onSearch, onShowLogs, freezeCount }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(searchTerm);
    }
  };
  return (
    <header className="glass" style={{
      height: '64px',
      margin: '12px 12px 0 12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      zIndex: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ 
          background: 'var(--primary)', 
          padding: '8px', 
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px var(--primary-glow)'
        }}>
          <Shield size={24} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.2rem', margin: 0 }}>RED STRING</h1>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>CORE BANKING PORTAL</span>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '24px',
        flex: 1, 
        justifyContent: 'center',
        maxWidth: '500px'
      }}>
        <div className="glass" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          padding: '8px 16px', 
          width: '100%',
          gap: '8px',
          background: 'rgba(255,255,255,0.05)'
        }}>
          <Search size={18} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search accounts, entities, or TXIDs..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--text-primary)', 
              width: '100%',
              outline: 'none'
            }} 
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button className="btn" onClick={onShowLogs} style={{ borderColor: 'var(--border)' }}>
          <FileText size={18} color="var(--text-secondary)" />
          <span>Audit Logs</span>
          {freezeCount > 0 && (
            <span style={{ 
              background: 'var(--danger)', 
              color: '#fff', 
              borderRadius: '12px', 
              padding: '2px 6px', 
              fontSize: '0.7rem', 
              fontWeight: 'bold',
              marginLeft: '4px' 
            }}>
              {freezeCount}
            </span>
          )}
        </button>
        <div className="btn" style={{ borderColor: 'var(--secondary)', cursor: 'default' }}>
          <Database size={18} color="var(--secondary)" />
          <span style={{ color: 'var(--secondary)' }}>Dataset Connected</span>
        </div>
        <div className="btn">
          <Activity size={18} color="var(--success)" />
          <span>System Live</span>
        </div>
        <button className="btn" style={{ position: 'relative' }}>
          <Bell size={18} />
          <div style={{ 
            position: 'absolute', 
            top: '8px', 
            right: '12px', 
            width: '6px', 
            height: '6px', 
            background: 'var(--primary)', 
            borderRadius: '50%' 
          }}></div>
        </button>
      </div>
    </header>
  );
};

export default Header;
