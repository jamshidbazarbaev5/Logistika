import { configureStore } from '@reduxjs/toolkit';
import transactionReducer from './slice';

export interface RootState {
  transaction: ReturnType<typeof transactionReducer>;
}

const store = configureStore({
  reducer: {
    transaction: transactionReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export default store;