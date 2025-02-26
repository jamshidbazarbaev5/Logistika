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

const initialState: TransactionState = {
  calculatedServices: [],
  totalPrice: 0,
  applicationId: null,
};

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
    },
    setApplicationId: (state: TransactionState, action: PayloadAction<number>) => {
      state.applicationId = action.payload;
    },
    clearTransaction: () => {
      return initialState;
    },
  },
});

export const { setCalculatedServices, setApplicationId, clearTransaction } = transactionSlice.actions;
export default transactionSlice.reducer;

