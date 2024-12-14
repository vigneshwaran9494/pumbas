import {
  Button,
  Input,
  List,
  ListItem,
  ListItemPrefix,
  ListItemSuffix,
  Typography,
} from "@material-tailwind/react";
import { useState } from "react";
import {
  useGetMasterWalletBalanceQuery,
  useGetWalletQuery,
  useDistributeAmountMutation,
} from "../redux/apislice";
import { ServerIcon } from "@heroicons/react/16/solid";

export default function Transaction() {
  const [distributeAmount, setDistributeAmount] = useState(0);
  const [noOfRecipients, setNoOfRecipients] = useState(0);

  const { data: wallet, isSuccess: isWalletSuccess } = useGetWalletQuery();

  const { data: masterWalletBalance, isSuccess: isMasterWalletBalanceSuccess } =
    useGetMasterWalletBalanceQuery();

  const [
    callDistributeAmount,
    { isLoading: isDistributeAmountLoading },
  ] = useDistributeAmountMutation();

  const handleDistribute = () => {
    callDistributeAmount({
      amount: distributeAmount,
      noOfRecipients: noOfRecipients,
    });
  };

  const onDistributeAmountChange = (e) => {
    setDistributeAmount(e.target.value);
  };

  const onNoOfRecipientsChange = (e) => {
    setNoOfRecipients(e.target.value);
  };

  return (
    <div className="flex flex-row justify-between text-gray-100">
      <div className="border-2 flex-1 border-teal-300 h-full rounded-md p-2">
        <div className="flex flex-row justify-evenly border-2 border-teal-300 border-dashed p-2 rounded-md">
          <Typography variant="h5" className="text-gray-300">
            Distribute
          </Typography>

          <Typography variant="lead" className="text-gray-300">
            Master Wallet Balance:{" "}
            {isMasterWalletBalanceSuccess
              ? masterWalletBalance?.balance
              : "Loading..."}
          </Typography>
        </div>

        <div className="flex flex-row justify-evenly mt-3 w-full px-4 gap-2 items-center">
          <Input
            className="text-gray-100"
            placeholder="Amount"
            color="teal"
            type="number"
            label="Amount"
            value={distributeAmount}
            onChange={onDistributeAmountChange}
          />
          <Typography variant="lead" className="text-gray-300">
            /
          </Typography>
          <Input
            className="text-gray-100"
            placeholder="No of Recipients"
            color="teal"
            type="number"
            max={wallet?.length}
            label="No of Recipients"
            value={noOfRecipients}
            onChange={onNoOfRecipientsChange}
          />
          <Typography variant="lead" className="text-gray-300">
            {`= ${distributeAmount / noOfRecipients}`}
          </Typography>
          <Button
            className="flex-1 min-w-60"
            color="teal"
            variant="outlined"
            onClick={handleDistribute}
          >
            Distribute
          </Button>
        </div>

        <div>
          <List className="text-gray-100">
            {isWalletSuccess &&
              wallet
                ?.filter((item) => item.wallet_type === "slave")
                .map((item, index) => (
                  <ListItem>
                    <ListItemPrefix className="flex flex-row gap-1">
                      <Typography>{index + 1}/</Typography>
                      <ServerIcon className="h-5 w-5" />
                    </ListItemPrefix>
                    <Typography>{item.address}</Typography>
                    <ListItemSuffix>
                      <Typography>{item.balance}</Typography>
                    </ListItemSuffix>
                  </ListItem>
                ))}
          </List>
        </div>
      </div>

      <div className="border-2 flex-1 border-teal-300 h-full rounded-md p-2">
        withdraw
      </div>
    </div>
  );
}
