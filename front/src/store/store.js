// store.js
import { configureStore } from '@reduxjs/toolkit';
import tokenReducer from './tokenSlice';  // Путь к редюсеру

export const store = configureStore({
  reducer: {
    token: tokenReducer,  // Подключение редюсера для token
  },
});
