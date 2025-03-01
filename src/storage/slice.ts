import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Service {
  service_type_id: number;
  service_name: string;
  total_amount: number;
  requested_amount: number;
  price: number;
}


interface TransactionState {
  calculatedServices: Service[];
  totalPrice: number;
  applicationId: number | null;
}

// Load initial state from localStorage if available
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('transactionState');
    if (serializedState === null) {
      return {
        calculatedServices: [],
        totalPrice: 0,
        applicationId: null,
      };
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return {
      calculatedServices: [],
      totalPrice: 0,
      applicationId: null,
    };
  }
};

const initialState: TransactionState = loadState();

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    setCalculatedServices: (state: TransactionState, action: PayloadAction<{services: Service[], total_price: number}>) => {
      state.calculatedServices = action.payload.services;
      state.totalPrice = action.payload.total_price;
      localStorage.setItem('transactionState', JSON.stringify(state));
    },
    setApplicationId: (state: TransactionState, action: PayloadAction<number>) => {
      state.applicationId = action.payload;
      localStorage.setItem('transactionState', JSON.stringify(state));
    },
    clearTransaction: () => {
      localStorage.removeItem('transactionState');
      return {
        calculatedServices: [],
        totalPrice: 0,
        applicationId: null,
      };
    },
  },
});

export const { setCalculatedServices, setApplicationId, clearTransaction } = transactionSlice.actions;
export default transactionSlice.reducer;

