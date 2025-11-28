const fileDB = require('./file');
const recordUtils = require('./record');
const vaultEvents = require('../events');
const mongodb = require('./mongodb');

// Use file system by default, can be switched to MongoDB
let useMongoDB = true;

async function initializeDatabase() {
  // For now, use file system. We'll switch to MongoDB after testing
  useMongoDB = false;
  
  if (useMongoDB) {
    const connected = await mongodb.connect();
    if (!connected) {
      console.log('⚠️  Falling back to file system');
      useMongoDB = false;
    }
  }
  
  return true;
}

// File-based functions (existing)
function addRecord({ name, value }) {
  recordUtils.validateRecord({ name, value });
  const data = fileDB.readDB();
  const newRecord = { id: recordUtils.generateId(), name, value };
  data.push(newRecord);
  fileDB.writeDB(data);
  vaultEvents.emit('recordAdded', newRecord);
  createBackup();
  return newRecord;
}

function listRecords() {
  return fileDB.readDB();
}

function updateRecord(id, newName, newValue) {
  const data = fileDB.readDB();
  const record = data.find(r => r.id === id);
  if (!record) return null;
  record.name = newName;
  record.value = newValue;
  fileDB.writeDB(data);
  vaultEvents.emit('recordUpdated', record);
  createBackup();
  return record;
}

function deleteRecord(id) {
  let data = fileDB.readDB();
  const record = data.find(r => r.id === id);
  if (!record) return null;
  data = data.filter(r => r.id !== id);
  fileDB.writeDB(data);
  vaultEvents.emit('recordDeleted', record);
  createBackup();
  return record;
}

function searchRecords(searchTerm) {
  const data = fileDB.readDB();
  const term = searchTerm.toLowerCase();
  
  return data.filter(record => 
    record.id.toString().includes(term) || 
    record.name.toLowerCase().includes(term)
  );
}

function sortRecords(field, order) {
  const data = fileDB.readDB();
  
  return data.sort((a, b) => {
    let aValue, bValue;
    
    if (field === 'name') {
      aValue = a.name.toLowerCase();
      bValue = b.name.toLowerCase();
    } else if (field === 'id') {
      aValue = a.id;
      bValue = b.id;
    } else {
      return 0;
    }
    
    if (order === 'desc') {
      return aValue < bValue ? 1 : -1;
    } else {
      return aValue > bValue ? 1 : -1;
    }
  });
}

function exportToFile() {
  const data = fileDB.readDB();
  const fs = require('fs');
  const path = require('path');
  
  const exportPath = path.join(__dirname, '..', 'export.txt');
  const timestamp = new Date().toLocaleString();
  
  let content = `=== NodeVault Export ===\n`;
  content += `Export Date: ${timestamp}\n`;
  content += `Total Records: ${data.length}\n`;
  content += `File: export.txt\n`;
  content += `=======================\n\n`;
  
  if (data.length === 0) {
    content += 'No records to export.\n';
  } else {
    data.forEach((record, index) => {
      content += `Record ${index + 1}:\n`;
      content += `  ID: ${record.id}\n`;
      content += `  Name: ${record.name}\n`;
      content += `  Value: ${record.value}\n`;
      content += `  Created: ${new Date(record.id).toLocaleDateString()}\n`;
      content += `-------------------\n`;
    });
  }
  
  fs.writeFileSync(exportPath, content);
  return exportPath;
}

function createBackup() {
  const data = fileDB.readDB();
  const fs = require('fs');
  const path = require('path');
  
  const backupsDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir);
  }
  
  const timestamp = new Date().toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .slice(0, -5);
  
  const backupFile = path.join(backupsDir, `backup_${timestamp}.json`);
  
  const backupData = {
    timestamp: new Date().toISOString(),
    totalRecords: data.length,
    records: data
  };
  
  fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
  console.log(`[BACKUP] Backup created: ${backupFile}`);
  return backupFile;
}

function getVaultStatistics() {
  const data = fileDB.readDB();
  const fs = require('fs');
  const path = require('path');
  
  if (data.length === 0) {
    return {
      totalRecords: 0,
      message: "No records in vault"
    };
  }
  
  // Find longest name
  const longestNameRecord = data.reduce((longest, current) => 
    current.name.length > longest.name.length ? current : longest
  , { name: '', value: '' });
  
  // Find creation dates
  const creationDates = data.map(record => new Date(record.id));
  const earliestDate = new Date(Math.min(...creationDates));
  const latestDate = new Date(Math.max(...creationDates));
  
  // Get last modified time from file stats
  const dbFile = path.join(__dirname, '..', 'data', 'vault.json');
  const stats = fs.statSync(dbFile);
  const lastModified = stats.mtime;
  
  return {
    totalRecords: data.length,
    lastModified: lastModified.toLocaleString(),
    longestName: `${longestNameRecord.name} (${longestNameRecord.name.length} characters)`,
    earliestRecord: earliestDate.toLocaleDateString(),
    latestRecord: latestDate.toLocaleDateString()
  };
}

module.exports = { 
  initializeDatabase,
  addRecord, 
  listRecords, 
  updateRecord, 
  deleteRecord,
  searchRecords,
  sortRecords,
  exportToFile,
  getVaultStatistics
};
