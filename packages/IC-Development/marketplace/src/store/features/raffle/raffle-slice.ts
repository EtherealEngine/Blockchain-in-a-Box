import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import { RaffleStatus } from '@/models';

export enum NFTStatus {
  None = 'None',
  Pending = 'Pending',
  Allocated = 'Allocated',
}

export enum RaffleTicketStatus {
  NotEntered,
  Entered,
  Won,
  Lost,
}

// Define a type for the slice state
interface RaffleState {
  ticketStatus?: RaffleTicketStatus;
  raffleStatus?: RaffleStatus;
  totalEntries?: number;
}

// Define the initial state using that type
const initialState: RaffleState = {
  ticketStatus: 0,
  totalEntries: undefined,
  raffleStatus: undefined,
};

export const raffleSlice = createSlice({
  name: 'raffle',
  initialState,
  reducers: {
    setTicketStatus: (
      state,
      action: PayloadAction<RaffleTicketStatus | undefined>
    ) => {
      state.ticketStatus = action.payload;
    },
    setTotalEntries: (state, action: PayloadAction<number | undefined>) => {
      state.totalEntries = action.payload;
    },
    setRaffleStatus: (
      state,
      action: PayloadAction<RaffleStatus | undefined>
    ) => {
      state.raffleStatus = action.payload;
    },
  },
});

export const {
  setTicketStatus: setRaffleTicketStatus,
  setTotalEntries: setRaffleTotalEntries,
  setRaffleStatus: setRaffleStatus,
} = raffleSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectRaffleState = (state: RootState) => state.raffle;

export default raffleSlice.reducer;
