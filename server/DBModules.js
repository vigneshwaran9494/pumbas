const sqlite3 = require("sqlite3").verbose();
const solanaWeb3 = require("@solana/web3.js");

// create a transaction
const connection = new solanaWeb3.Connection(
  solanaWeb3.clusterApiUrl("devnet"),
  "confirmed"
);

const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.error("Error opening database " + err.message);
  } else {
    console.log("Connected to the SQLite database.");
    createUserTable();
    createSolanaWalletTable();
    createTransactionTable();
    syncWalletBalance();
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
                [
                  wallet.publicKey.toBase58(),
                  wallet.publicKey.toBase58(),
                  wallet.secretKey.toString(),
                  0,
                  walletType,
                ],
                (err) => {
                  if (err) {
                    reject(
                      "Error inserting default solana wallet " + err.message
                    );
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

function getWalletBalance(walletId) {
  db.get(
    "SELECT balance FROM solana_wallets WHERE publickey = ?",
    [walletId],
    (err, row) => {
      if (err) {
        console.error("Error getting wallet balance " + err.message);
      } else {
        return row.balance;
      }
    }
  );
}

async function refillWallet(walletId) {
  // Ensure walletId is a PublicKey
  const publicKey =
    typeof walletId === "string"
      ? new solanaWeb3.PublicKey(walletId)
      : walletId;

  const airdropSignature = await connection.requestAirdrop(
    publicKey,
    solanaWeb3.LAMPORTS_PER_SOL
  );

  await connection.confirmTransaction(airdropSignature, {
    commitment: "confirmed",
  });

  const walletBalance = await connection.getBalance(publicKey);
  const bal = walletBalance / solanaWeb3.LAMPORTS_PER_SOL;
  console.log(bal);

  // Find wallet by public key and update balance
  db.run(
    `UPDATE solana_wallets SET balance = ? WHERE publickey = ?`,
    [bal, publicKey.toBase58()],
    (err) => {
      if (err) {
        console.error("Error updating wallet balance " + err.message);
      } else {
        syncWalletBalance();
        console.log("Wallet balance updated successfully");
      }
    }
  );
}

function getMasterWalletBalance(callback) {
  db.get(
    "SELECT balance FROM solana_wallets WHERE wallet_type = 'master'",
    [],
    (err, row) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, row);
      }
    }
  );
}

function syncWalletBalance() {
  db.all("SELECT * FROM solana_wallets", [], (err, rows) => {
    if (err) {
      console.error("Error syncing wallet balance " + err.message);
    } else {
      rows.forEach(async (row) => {
        const balance = await connection.getBalance(
          new solanaWeb3.PublicKey(row.publickey)
        );

        const bal = balance / solanaWeb3.LAMPORTS_PER_SOL;
        db.run(`UPDATE solana_wallets SET balance = ? WHERE publickey = ?`, [
          bal,
          row.publickey,
        ]);
      });
      console.log("Wallet balance synced successfully");
    }
  });
}

async function distributeAmount(amount, noOfRecipients, callback) {
  const distributeAmount = amount / noOfRecipients;

  const masterWallet = await new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM solana_wallets WHERE wallet_type = 'master'",
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      }
    );
  });

  db.all(
    "SELECT * FROM solana_wallets WHERE wallet_type = 'slave' LIMIT ?",
    [noOfRecipients],
    (err, rows) => {
      if (err) {
        callback(err, null);
        return;
      } else {
        if (rows.length < noOfRecipients) {
          callback(new Error("Not enough slave wallets available"), null);
          return;
        } else {
          // Proceed with distribution logic here
          Promise.all(
            rows.map(async (row) => {
              console.log(row);

              const transaction = new solanaWeb3.Transaction().add(
                solanaWeb3.SystemProgram.transfer({
                  fromPubkey: new solanaWeb3.PublicKey(masterWallet.publickey),
                  toPubkey: new solanaWeb3.PublicKey(row.publickey),
                  lamports: distributeAmount * solanaWeb3.LAMPORTS_PER_SOL,
                })
              );

              const signature = await solanaWeb3.sendAndConfirmTransaction(
                connection,
                transaction,
                [
                  solanaWeb3.Keypair.fromSecretKey(
                    Uint8Array.from(
                      masterWallet.privatekey.split(",").map(Number)
                    )
                  ),
                ]
              );

              console.log(signature);
            })
          )
            .then(() => {
              syncWalletBalance();
              callback(null, {
                success: true,
                message: "All transactions completed successfully",
              });
            })
            .catch((err) => {
              syncWalletBalance();
              callback(err, null);
            });
        }
      }
    }
  );
}

const transferEntireBalance = async (senderWallet, recipientPublicKey) => {
  try {
    // Get the current balance of the sender wallet
    const balance = await connection.getBalance(senderWallet.publicKey);
    if (balance === 0) {
      console.log("Sender wallet has zero balance.");
      return;
    }

    // Get the latest blockhash
    const { blockhash } = await connection.getLatestBlockhash();

    // Estimate the transaction fee
    const dummyTransaction = new solanaWeb3.Transaction({
      recentBlockhash: blockhash,
      feePayer: senderWallet.publicKey,
    }).add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey: senderWallet.publicKey,
        toPubkey: recipientPublicKey,
        lamports: balance,
      })
    );

    const transactionFee = await connection.getFeeForMessage(
      dummyTransaction.compileMessage({ recentBlockhash: blockhash })
    );

    // Ensure the sender has enough balance to cover the transaction fee
    const amountToSend = balance - transactionFee.value || 0;
    if (amountToSend <= 0) {
      console.log("Insufficient balance to cover transaction fees.");
      return;
    }

    // Create the actual transaction
    const transaction = new solanaWeb3.Transaction({
      recentBlockhash: blockhash,
      feePayer: senderWallet.publicKey,
    }).add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey: senderWallet.publicKey,
        toPubkey: recipientPublicKey,
        lamports: amountToSend,
      })
    );

    // Sign the transaction with the sender's private key
    transaction.sign(senderWallet);

    // Send and confirm the transaction
    const signature = await solanaWeb3.sendAndConfirmTransaction(
      connection,
      transaction,
      [senderWallet],
      {
        commitment: "confirmed",
      }
    );

    console.log("Transaction successful, signature:", signature);

    return signature;
  } catch (error) {
    console.error("Error during transfer:", error.message, error.stack);
  }
};

async function withdrawAmount(callback) {
  const masterWallet = await new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM solana_wallets WHERE wallet_type = 'master'",
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      }
    );
  });

  const slaveWallets = await new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM solana_wallets WHERE wallet_type = 'slave'",
      [],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });

  Promise.all(
    slaveWallets.map(async (row) => {
      console.log(row);

      const signature = await transferEntireBalance(
        solanaWeb3.Keypair.fromSecretKey(
          Uint8Array.from(row.privatekey.split(",").map(Number))
        ),
        new solanaWeb3.PublicKey(masterWallet.publickey)
      );

      console.log(signature);
    })
  )
    .then(() => {
      syncWalletBalance();
      callback(null, {
        success: true,
        message: "All transactions completed successfully",
      });
    })
    .catch((err) => {
      syncWalletBalance();
      callback(err, null);
    });
}

module.exports = {
  getAllUsers,
  createSolanaWalletTable,
  getAllSolanaWallets,
  getWalletBalance,
  refillWallet,
  getMasterWalletBalance,
  distributeAmount,
  syncWalletBalance,
  withdrawAmount,
};
