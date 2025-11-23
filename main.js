const readline = require('readline');
const db = require('./db');
require('./events/logger'); // Initialize event logger
require('dotenv').config(); // Load environment variables

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Initialize database when app starts
async function initializeApp() {
  console.log('🚀 Initializing NodeVault...');
  await db.initializeDatabase();
  menu();
}

function menu() {
  console.log(`
===== NodeVault =====
1. Add Record
2. List Records
3. Update Record
4. Delete Record
5. Search Record
6. Sort Records
7. Export Data
8. Get Stats
9. Exit

=====================
  `);

  rl.question('Choose option: ', ans => {
    switch (ans.trim()) {
      case '1':
        rl.question('Enter name: ', name => {
          rl.question('Enter value: ', value => {
            db.addRecord({ name, value });
            console.log('✅ Record added successfully!');
            menu();
          });
        });
        break;

      case '2':
        const records = db.listRecords();
        if (records.length === 0) console.log('No records found.');
        else records.forEach(r => console.log(`ID: ${r.id} | Name: ${r.name} | Value: ${r.value}`));
        menu();
        break;

      case '3':
        rl.question('Enter record ID to update: ', id => {
          rl.question('New name: ', name => {
            rl.question('New value: ', value => {
              const updated = db.updateRecord(Number(id), name, value);
              console.log(updated ? '✅ Record updated!' : '❌ Record not found.');
              menu();
            });
          });
        });
        break;

      case '4':
        rl.question('Enter record ID to delete: ', id => {
          const deleted = db.deleteRecord(Number(id));
          console.log(deleted ? '🗑️ Record deleted!' : '❌ Record not found.');
          menu();
        });
        break;
	case '5':
         rl.question('Enter search keyword: ', keyword => {
          const results = db.searchRecords(keyword);
          if (results.length === 0) {
            console.log('No records found.');
          } else {
            console.log(`Found ${results.length} matching records:`);
            results.forEach((r, i) => {
              console.log(`${i+1}. ID: ${r.id} | Name: ${r.name} | Value: ${r.value}`);
            });
          }
          menu();
        });
        break;
      case '6':
        rl.question('Choose field to sort by (name/id): ', field => {
          if (field !== 'name' && field !== 'id') {
            console.log('Invalid field. Use "name" or "id".');
            menu();
            return;
          }

          rl.question('Choose order (asc/desc): ', order => {
            if (order !== 'asc' && order !== 'desc') {
              console.log('Invalid order. Use "asc" or "desc".');
              menu();
              return;
            }

            const sorted = db.sortRecords(field, order);
            console.log('Sorted Records:');
            sorted.forEach((r, i) => {
              console.log(`${i+1}. ID: ${r.id} | Name: ${r.name} | Value: ${r.value}`);
            });
            menu();
          });
        });
        break;

      case '7':
        try {
          const exportPath = db.exportToFile();
          console.log(`✅ Data exported successfully to ${exportPath}`);
        } catch (error) {
          console.log('❌ Export failed:', error.message);
        }
        menu();
        break;





      case '8':
        const stats = db.getVaultStatistics();
        if (stats.message) {
          console.log(stats.message);
        } else {
          console.log(`
	Vault Statistics:
	---
	Total Records: ${stats.totalRecords}
	Last Modified: ${stats.lastModified}
	Longest Name: ${stats.longestName}
	Earliest Record: ${stats.earliestRecord}
	Latest Record: ${stats.latestRecord}
          `);
        }
        menu();
        break;
    case '9':
        console.log('👋 Exiting NodeVault...');
        rl.close();
        break;

      default:
        console.log('Invalid option.');
        menu();
    }
  });
}
initializeApp();
