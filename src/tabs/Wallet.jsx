import { ArrowPathIcon } from "@heroicons/react/16/solid";
import { useGetWalletQuery } from "../redux/apislice";

export default function Wallet() {
  const { data, isLoading, isError, refetch } = useGetWalletQuery({
    refetchOnMountOrArgChange: true,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading data</div>;
  }

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div>
      <div className="flex justify-between items-center border-b-teal-400 border-b-2 pb-2">
        <div className="flex items-center justify-center text-white">
          <h2>Solana Wallets</h2>
        </div>

        <button
          onClick={handleRefresh}
          className="bg-teal-500 text-white px-4 py-2 rounded-md"
        >
          <ArrowPathIcon className="w-4 h-4" />
        </button>
      </div>

      <table className="w-full min-w-max table-auto text-left text-teal-200 mt-2">
        <thead>
          <tr>
            <th>ID</th>
            <th>Address</th>
            <th>Balance</th>
            <th>Wallet Type</th>
          </tr>
        </thead>
        <tbody>
          {data
            .slice()
            .sort((a, b) => (a.wallet_type === "master" ? -1 : 1))
            .map((wallet, index) => {
              const isLast = index === wallet.length - 1;
              const classes = isLast ? "p-1" : "p-1 ";
              const masterWallet = wallet.wallet_type === "master";
              const walletClasses = masterWallet ? "bg-teal-800" : "";
              return (
                <tr key={wallet.id} className={walletClasses}>
                  <td className={classes}>{wallet.id}</td>
                  <td className={classes}>{wallet.address}</td>
                  <td className={classes}>{wallet.balance}</td>
                  <td className={classes}>{wallet.wallet_type}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
