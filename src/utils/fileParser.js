import Papa from 'papaparse';

export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        // Transform CSV rows into transactions
        const transactions = results.data.map((row, index) => ({
          id: row.id || row.txid || `TX-U-${index}`,
          from: row.from || row.sender || row.source,
          to: row.to || row.receiver || row.destination,
          amount: parseFloat(row.amount || row.value),
          timestamp: row.timestamp || row.date || new Date().toISOString(),
          type: row.type || 'TRANSFER'
        })).filter(tx => tx.from && tx.to && !isNaN(tx.amount));

        // Extract unique accounts
        const accountIds = new Set();
        transactions.forEach(tx => {
          accountIds.add(tx.from);
          accountIds.add(tx.to);
        });

        const accounts = Array.from(accountIds).map(id => ({
          id,
          name: id, // Fallback name
          balance: 0, // Unknown from transaction log
          type: 'Unknown'
        }));

        resolve({ accounts, transactions });
      },
      error: (err) => reject(err)
    });
  });
};

export const parseJSON = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        // Expecting { accounts: [], transactions: [] } or just [] of transactions
        if (Array.isArray(data)) {
          // Process as list of transactions (same logic as CSV)
          const transactions = data.map((row, index) => ({
            id: row.id || `TX-J-${index}`,
            from: row.from,
            to: row.to,
            amount: row.amount,
            timestamp: row.timestamp || new Date().toISOString()
          }));
          const accountIds = new Set();
          transactions.forEach(tx => { accountIds.add(tx.from); accountIds.add(tx.to); });
          const accounts = Array.from(accountIds).map(id => ({ id, name: id, balance: 0, type: 'Parsed' }));
          resolve({ accounts, transactions });
        } else {
          resolve(data);
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsText(file);
  });
};
