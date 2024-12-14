const sqlite3 = require("sqlite3").verbose();
const solanaWeb3 = require("@solana/web3.js");

const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.error("Error opening database " + err.message);
  } else {
    console.log("Connected to the SQLite database.");
    createUserTable();
    createSolanaWalletTable();
    createTransactionTable();
  }
});

function createUserTable() {
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        password TEXT NOT NULL
    )`,
    (err) => {
      if (err) {
        console.error("Error creating table " + err.message);
      } else {
        insertDefaultUser();
      }
    }
  );
}

function insertDefaultUser() {
  db.get("SELECT COUNT(*) AS count FROM users", (err, row) => {
    if (err) {
      console.error("Error checking user count " + err.message);
    } else if (row.count === 0) {
      db.run(
        `INSERT INTO users (id, name, password) VALUES (?, ?, ?)`,
        [123, "admin", "admin123"],
        (err) => {
          if (err) {
            console.error("Error inserting default user " + err.message);
          } else {
            console.log("Default user inserted.");
          }
        }
      );
    }
  });
}

function createSolanaWalletTable() {
  db.run(
    `CREATE TABLE IF NOT EXISTS solana_wallets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        address TEXT NOT NULL,
        publickey TEXT NOT NULL,
        privatekey TEXT NOT NULL,
        balance TEXT NOT NULL,
        wallet_type TEXT NOT NULL
    )`,
    (err) => {
      if (err) {
        console.error("Error creating table " + err.message);
      } else {
        createDefaultSolanaWallet();
      }
    }
  );
}

function createDefaultSolanaWallet() {
  db.get("SELECT COUNT(*) AS count FROM solana_wallets", (err, row) => {
    if (err) {
      console.error("Error checking solana_wallets count " + err.message);
    } else if (row.count === 0) {
      for (let i = 0; i < 11; i++) {
        (async () => {
          try {
            const wallet = solanaWeb3.Keypair.generate();
            const walletType = i === 0 ? "master" : "slave";
            await new Promise((resolve, reject) => {
              db.run(
                `INSERT INTO solana_wallets (address, publickey, privatekey, balance, wallet_type) VALUES (?, ?, ?, ?, ?)`,
                [wallet.publicKey.toBase58(), wallet.publicKey.toBase58(), wallet.secretKey.toString(), 0, walletType],
                (err) => {
                  if (err) {
                    reject("Error inserting default solana wallet " + err.message);
                  } else {
                    console.log("Default solana wallet inserted.");
                    resolve();
                  }
                }
              );
            });
          } catch (error) {
            console.error(error);
          }
        })();
      }
    }
  });
}

function getAllSolanaWallets(callback) {
  db.all("SELECT * FROM solana_wallets", [], (err, rows) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, rows);
    }
  });
}

function createTransactionTable() {
  db.run(
    `CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_address TEXT NOT NULL,
        to_address TEXT NOT NULL,
        date_time TEXT NOT NULL,
        amount REAL NOT NULL
    )`,
    (err) => {
      if (err) {
        console.error("Error creating table " + err.message);
      }
    }
  );
}

function getAllUsers(callback) {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, rows);
    }
  });
}

module.exports = {
  getAllUsers,
  createSolanaWalletTable,
  getAllSolanaWallets,
};
