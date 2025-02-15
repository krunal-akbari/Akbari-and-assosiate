const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

function initDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS accounts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          middle_name TEXT,
          date TEXT,
          mobile_number TEXT,
          cif_number TEXT,
          account_number TEXT UNIQUE,
          pan_number TEXT,
          aadhar_number TEXT,
          date_of_birth TEXT,
          amount REAL,
          interest_rate REAL,
          maturity_date TEXT,
          maturity_amount REAL,
          nominee TEXT,
          account_under_person TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating database:', err);
          reject(err);
        } else {
          console.log('Database initialized successfully');
          resolve();
        }
      });
    });
  });
}

function getAllAccounts() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM accounts ORDER BY created_at DESC', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function addAccount(accountData) {
  return new Promise((resolve, reject) => {
    const {
      first_name,
      last_name,
      middle_name,
      date,
      mobile_number,
      cif_number,
      account_number,
      pan_number,
      aadhar_number,
      date_of_birth,
      amount,
      interest_rate,
      maturity_date,
      maturity_amount,
      nominee,
      account_under_person
    } = accountData;

    if (!first_name || !last_name || !account_number) {
      reject(new Error('First name, last name, and account number are required'));
      return;
    }

    const stmt = db.prepare(`
      INSERT INTO accounts (
        first_name, last_name, middle_name, date, mobile_number, cif_number,
        account_number, pan_number, aadhar_number, date_of_birth, amount,
        interest_rate, maturity_date, maturity_amount, nominee, account_under_person
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      first_name, last_name, middle_name, date, mobile_number, cif_number,
      account_number, pan_number, aadhar_number, date_of_birth, amount,
      interest_rate, maturity_date, maturity_amount, nominee, account_under_person,
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id: this.lastID,
            ...accountData,
            created_at: new Date().toISOString()
          });
        }
      }
    );
    stmt.finalize();
  });
}

function deleteAccount(id) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('DELETE FROM accounts WHERE id = ?');
    stmt.run(id, function(err) {
      if (err) {
        reject(err);
      } else {
        if (this.changes > 0) {
          resolve({ success: true, id });
        } else {
          reject(new Error('Account not found'));
        }
      }
    });
    stmt.finalize();
  });
}

module.exports = {
  initDatabase,
  getAllAccounts,
  addAccount,
  deleteAccount
};
