import React from "react";
import {
  Tab,
  TabPanel,
  Tabs,
  TabsBody,
  TabsHeader,
} from "@material-tailwind/react";
import "./App.css";
import Wallet from "./tabs/Wallet";
import Transaction from "./tabs/Transaction";
import PlayGround from "./tabs/PlayGround";
import { ToastContainer } from "react-toastify";

const data = [
  {
    label: "Wallet",
    component: <Wallet />,
  },
  {
    label: "Transaction",
    component: <Transaction />,
  },
  {
    label: "PlayGround",
    component: <PlayGround />,
  },
];

function App() {
  return (
    <div className="App w-[100vw] h-[100vh]">
      <Tabs value="Wallet" className="w-full h-full p-4">
        <TabsHeader className="mx-3">
          {data.map(({ label }) => (
            <Tab key={label} value={label}>
              {label}
            </Tab>
          ))}
        </TabsHeader>
        <TabsBody className="w-full p-2">
          {data.map((item, index) => (
            <TabPanel
              className="w-full h-[90vh] p-4 border-2 border-teal-500 rounded-lg"
              key={item.label}
              value={item.label}
            >
              {item.component}
            </TabPanel>
          ))}
        </TabsBody>
      </Tabs>
      <ToastContainer />
    </div>
  );
}

export default App;
