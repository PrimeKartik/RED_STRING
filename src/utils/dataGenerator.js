// Simple seeded PRNG to keep the dataset identical every time
const seededRandom = (function() {
  let seed = 12345;
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
})();

export const generateMockTransactions = (count = 50) => {
  // Reset seed so multiple calls generate the exact same set
  seededRandom(); 
  
  const accounts = [
    { id: 'Acc-001', name: 'Global Invest Ltd', balance: 5000000, type: 'Entity' },
    { id: 'Acc-002', name: 'John Doe', balance: 12000, type: 'Individual' },
    { id: 'Acc-003', name: 'Shell Corp A', balance: 150000, type: 'Entity' },
    { id: 'Acc-004', name: 'Offshore Trust', balance: 2000000, type: 'Entity' },
    { id: 'Acc-005', name: 'James Smith', balance: 45000, type: 'Individual' },
    { id: 'Acc-006', name: 'Crypto Exchange X', balance: 800000, type: 'Entity' },
    { id: 'Acc-007', name: 'Retailer Alpha', balance: 350000, type: 'Business' },
    { id: 'Acc-008', name: 'Launders & Co', balance: 5000, type: 'Entity' },
    { id: 'Acc-009', name: 'Sarah Wilson', balance: 95000, type: 'Individual' },
    { id: 'Acc-010', name: 'Consulting Prime', balance: 600000, type: 'Business' },
  ];

  // Add more dynamic accounts
  for (let i = 11; i <= 30; i++) {
    accounts.push({
      id: `Acc-${String(i).padStart(3, '0')}`,
      name: `User ${i}`,
      balance: Math.floor(seededRandom() * 50000),
      type: seededRandom() > 0.5 ? 'Individual' : 'Business'
    });
  }

  const transactions = [];
  for (let i = 0; i < count; i++) {
    const fromIdx = Math.floor(seededRandom() * accounts.length);
    let toIdx = Math.floor(seededRandom() * accounts.length);
    while (toIdx === fromIdx) {
      toIdx = Math.floor(seededRandom() * accounts.length);
    }

    const amount = Math.floor(seededRandom() * 20000) + 100;
    
    transactions.push({
      id: `TX-${String(i).padStart(4, '0')}`,
      from: accounts[fromIdx].id,
      to: accounts[toIdx].id,
      amount,
      timestamp: new Date(Date.now() - seededRandom() * 1000000000).toISOString(),
      type: amount > 10000 ? 'WIRE' : 'TRANSFER'
    });
  }

  // Create a suspicious cycle
  const cycleAccounts = ['Acc-003', 'Acc-008', 'Acc-010', 'Acc-003'];
  for (let i = 0; i < cycleAccounts.length - 1; i++) {
    transactions.push({
      id: `TX-CYC-${i}`,
      from: cycleAccounts[i],
      to: cycleAccounts[i+1],
      amount: 45000,
      timestamp: new Date().toISOString(),
      type: 'WIRE'
    });
  }

  // Create a high-connectivity hub
  const hubId = 'Acc-006';
  for (let i = 0; i < 5; i++) {
    transactions.push({
      id: `TX-HUB-${i}`,
      from: accounts[Math.floor(seededRandom() * 10)].id,
      to: hubId,
      amount: 15000,
      timestamp: new Date().toISOString(),
      type: 'WIRE'
    });
  }

  return { accounts, transactions };
};

export const buildGraphData = (accounts, transactions) => {
  const nodes = accounts.map(acc => ({
    ...acc,
    val: 5, // base size
    riskScore: 0,
    flags: []
  }));

  const links = transactions.map(tx => ({
    ...tx,
    source: tx.from,
    target: tx.to
  }));

  // Simple fraud detection
  nodes.forEach(node => {
    const outgoing = transactions.filter(t => t.from === node.id);
    const incoming = transactions.filter(t => t.to === node.id);
    const totalVolume = [...outgoing, ...incoming].reduce((sum, t) => sum + t.amount, 0);

    // Rule: High Volume
    if (totalVolume > 50000) {
      node.riskScore += 20;
      node.flags.push('High Volume');
    }

    // Rule: Hub Detection (many connections)
    const uniqueConnections = new Set([
      ...outgoing.map(t => t.to),
      ...incoming.map(t => t.from)
    ]).size;

    if (uniqueConnections > 10) {
      node.riskScore += 30;
      node.flags.push('Hub Account');
    }

    // Rule: Large Transfers
    if (outgoing.some(t => t.amount > 15000)) {
      node.riskScore += 15;
      node.flags.push('Large Transfers');
    }

    // Rule: Cycle Detection (Smurfing/Structuring)
    const cycleTx = [...outgoing, ...incoming].filter(t => t.id && t.id.includes('CYC'));
    if (cycleTx.length > 0) {
      node.riskScore += 40;
      node.flags.push('Cycle Detected');
    }

    node.val = 5 + (node.riskScore / 10);
  });

  // Apply Auto-Freeze Algorithm Pipeline
  nodes.forEach(node => {
    if (node.isFrozen !== undefined) return; // Allow manual overrides to persist if logic allows (though this is fresh graph build)

    if (node.riskScore >= 80 && node.flags.length >= 2) {
      node.isFrozen = true;
      node.freezeType = 'temporary';
      node.status = 'Auto-Frozen (24h)';
      node.flags.push('Auto-Freeze Triggered');
    } else if (node.riskScore >= 60) {
      node.status = 'Manual Review Queue';
      node.isFrozen = false;
    } else {
      node.status = 'Monitoring';
      node.isFrozen = false;
    }
  });

  return { nodes, links };
};
