import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Service {
  service_type_id: number;
  service_name: string;
  total_amount: number;
  requested_amount: number;
  price: number;
}

interface WorkingService {
  service_type_id: number;
  service_name: string;
  total_amount: number;
  requested_amount: number;
  price: number;
  amount?: number;
}

interface TransactionState {
  calculatedServices: Service[];
  workingServices: WorkingService[];
  totalPrice: number;
  applicationId: number | null;
}

const loadState = () => {
  try {
    const serializedState = localStorage.getItem('transactionState');
    if (serializedState === null) {
      return {
        calculatedServices: [],
        workingServices: [],
        totalPrice: 0,
        applicationId: null,
      };
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return {
      calculatedServices: [],
      workingServices: [],
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
    setCalculatedServices: (state: TransactionState, action: PayloadAction<{
      services: Service[], 
      working_services: WorkingService[],
      total_price: number
    }>) => {
      console.log('Setting calculated services:', action.payload);
      state.calculatedServices = action.payload.services;
      state.workingServices = action.payload.working_services.map(service => ({
        ...service,
        requested_amount: service.amount || service.requested_amount,
        total_amount: service.total_amount
      }));
      state.totalPrice = action.payload.total_price;
      console.log('Updated state:', state);
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
        workingServices: [],
        totalPrice: 0,
        applicationId: null,
      };
    },
  },
});

export const { setCalculatedServices, setApplicationId, clearTransaction } = transactionSlice.actions;
export default transactionSlice.reducer;

