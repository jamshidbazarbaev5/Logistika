import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Service {
  service_type: number;
  amount: number;
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
    setCalculatedServices: (state: TransactionState, action: PayloadAction<any>) => {
      state.calculatedServices = action.payload.services.map((service: any) => ({
        service_type: service.service_type_id,
        amount: service.requested_amount,
        price: service.price,
      }));
      state.totalPrice = action.payload.total_price;
      // Save to localStorage
      localStorage.setItem('transactionState', JSON.stringify(state));
    },
    setApplicationId: (state: TransactionState, action: PayloadAction<number>) => {
      state.applicationId = action.payload;
      // Save to localStorage
      localStorage.setItem('transactionState', JSON.stringify(state));
    },
    clearTransaction: () => {
      // Clear localStorage when transaction is cleared
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

