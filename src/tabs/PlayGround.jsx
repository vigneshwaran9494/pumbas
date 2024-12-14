import { useGetWalletQuery } from "../redux/apislice";

export default function PlayGround() {
  const { data, isLoading, isError } = useGetWalletQuery();

  console.log(data);
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading data</div>;
  }

  return (
    <div>
      <h2>Solana Wallets</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Address</th>
            <th>Public Key</th>
            <th>Private Key</th>
            <th>Balance</th>
            <th>Wallet Type</th>
          </tr>
        </thead>
        <tbody>
          {data.map((wallet) => (
            <tr key={wallet.id}>
              <td>{wallet.id}</td>
              <td>{wallet.address}</td>
              <td>{wallet.publickey}</td>
              <td>{wallet.privatekey}</td>
              <td>{wallet.balance}</td>
              <td>{wallet.wallet_type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
