// src/app/store.js (ya jo bhi file hai)

import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../src/features/Auth/LoginSlice';


export const store = configureStore({
  reducer: {
    auth: authReducer,

    // RTK Query reducers
    // [PaymentSlice.reducerPath]: PaymentSlice.reducer,

 


  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // non-serializable values jaise functions, dates ke liye
    })
    // .concat(PaymentSlice.middleware) 
  

});