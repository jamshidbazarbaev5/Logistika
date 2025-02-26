import { configureStore } from '@reduxjs/toolkit';
import transactionReducer from './slice';

// Properly type the RootState
export interface RootState {
  transaction: ReturnType<typeof transactionReducer>;
}

const store = configureStore({
  reducer: {
    transaction: transactionReducer,
    // add other reducers here if you have them
  },
});

export type AppDispatch = typeof store.dispatch;
export default store;