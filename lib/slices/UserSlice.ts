import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

// Define a type for the slice state
export type UserState = {
  username: string | null;
  password: string | null;
  iat: number | null;
  exp: number | null;
  status: boolean | null;
  balance: number | null;
  address: string | null;
  assets: any[] | null;
  canTransact: boolean;
};
// Define the initial state using that type
const initialState: UserState = {
  username: null,
  password: null,
  iat: null,
  exp: null,
  status: null,
  balance: null,
  address: null,
  assets: null,
  canTransact: false,
};

export const UserSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserDataRedux: (state, action: PayloadAction<UserState>) => {
      state = { ...action.payload };
    },
  },
});

export const { setUserDataRedux } = UserSlice.actions;

export default UserSlice.reducer;
