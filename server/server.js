const express = require("express");
const {
  getAllUsers,
  getAllSolanaWallets,
  refillWallet,
  getWalletBalance,
  getMasterWalletBalance,
  distributeAmount,
  syncWalletBalance,
} = require("./DBModules");
const app = express();
const PORT = process.env.PORT || 9090;
const cors = require("cors");

app.use(cors());

app.get("/api", (req, res) => {
  res.send("Hello from Express!");
});

app.get("/api/data", (req, res) => {
  getAllUsers((err, rows) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.json(rows);
    }
  });
});

app.get("/api/solana-wallets", (req, res) => {
  getAllSolanaWallets((err, rows) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.json(rows);
    }
  });
});

app.get("/api/refill-wallet", async (req, res) => {
  try {
    await refillWallet(req.query.walletId);
    res.send("Wallet refilled");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/api/get-wallet-balance", (req, res) => {
  try {
    const balance = getWalletBalance(req.query.walletId);
    res.json({ balance });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/api/get-master-wallet-balance", (req, res) => {
  try {
    getMasterWalletBalance((err, row) => {
      console.log(row);
      if (err) {
        res.status(500).send(err.message);
      } else {
        res.json({ balance: row.balance });
      }
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/api/distribute-amount", express.json(), (req, res) => {
  console.log(req.body);
  const { amount, noOfRecipients } = req.body || {};
  if (amount === undefined || noOfRecipients === undefined) {
    res
      .status(400)
      .send("Invalid request: 'amount' and 'noOfRecipients' are required.");
    return;
  }
  distributeAmount(amount, noOfRecipients, (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      syncWalletBalance();
      res.json({ success: true, message: "Amount distributed successfully" });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
