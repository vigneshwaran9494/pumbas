// Import the RTK Query methods from the React-specific entry point
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = "http://localhost:9090/";

// Define our single API slice object
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  endpoints: (builder) => ({
    getWallet: builder.query({
      query: () => ({
        url: "/api/solana-wallets",
        method: "GET",
      }),
    }),
    getWalletBalance: builder.query({
      query: (address) => ({
        url: `/api/get-wallet-balance?walletId=${address}`,
        method: "GET",
      }),
    }),
    getMasterWalletBalance: builder.query({
      query: () => ({
        url: "/api/get-master-wallet-balance",
        method: "GET",
      }),
    }),
    distributeAmount: builder.mutation({
      query: (data) => ({
        url: "/api/distribute-amount",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useGetWalletQuery,
  useGetWalletBalanceQuery,
  useGetMasterWalletBalanceQuery,
  useDistributeAmountMutation,
} = apiSlice;
