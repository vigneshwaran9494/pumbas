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
    }),
});

export const {
    useGetWalletQuery
} = apiSlice;
