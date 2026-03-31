import { createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { Sale, ShopDashboardMetrics } from "@inventra/types";

import { salesApi } from "../api/sales-api";
import type { RootState } from "..";

interface SalesState {
  items: Sale[];
  newSalesCount: number;
  hasLoadedOnce: boolean;
}

const initialState: SalesState = {
  items: [],
  newSalesCount: 0,
  hasLoadedOnce: false
};

function sortSales(sales: Sale[]) {
  return [...sales].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

function applySales(state: SalesState, sales: Sale[]) {
  state.items = sortSales(sales);
  state.hasLoadedOnce = true;
}

function applySale(state: SalesState, sale: Sale) {
  const alreadyPresent = state.items.some((item) => item.id === sale.id);
  const existingSales = state.items.filter((item) => item.id !== sale.id);

  state.items = sortSales([sale, ...existingSales]);

  if (!alreadyPresent) {
    state.newSalesCount += 1;
  }

  state.hasLoadedOnce = true;
}

const salesSlice = createSlice({
  name: "sales",
  initialState,
  reducers: {
    setSales(state, action: PayloadAction<Sale[]>) {
      applySales(state, action.payload);
    },
    prependSale(state, action: PayloadAction<Sale>) {
      applySale(state, action.payload);
    },
    markSalesSeen(state) {
      state.newSalesCount = 0;
    },
    clearSales(state) {
      state.items = [];
      state.newSalesCount = 0;
      state.hasLoadedOnce = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(salesApi.endpoints.listSales.matchFulfilled, (state, action) => {
        applySales(state, action.payload);
      })
      .addMatcher(salesApi.endpoints.createSale.matchFulfilled, (state, action) => {
        applySale(state, action.payload);
      })
      .addMatcher(salesApi.endpoints.getSale.matchFulfilled, (state, action) => {
        applySale(state, action.payload);
      });
  }
});

const selectProductsState = (state: RootState) => state.inventory.products;
const selectSalesState = (state: RootState) => state.sales.items;
const selectLowStockThreshold = (state: RootState) => state.inventory.lowStockThreshold;

export const selectProducts = selectProductsState;
export const selectSales = selectSalesState;
export const selectNewSalesCount = (state: RootState) => state.sales.newSalesCount;
export const selectHasLoadedSales = (state: RootState) => state.sales.hasLoadedOnce;

export const selectShopDashboardMetrics = createSelector(
  [selectProductsState, selectSalesState, selectLowStockThreshold],
  (products, sales, lowStockThreshold): ShopDashboardMetrics => ({
    totalProducts: products.length,
    totalSales: sales.reduce((sum, sale) => sum + sale.totalAmount, 0),
    lowStockCount: products.filter((product) => product.quantity <= lowStockThreshold).length,
    recentTransactions: sales.slice(0, 5),
    lowStockProducts: products.filter((product) => product.quantity <= lowStockThreshold).slice(0, 6)
  })
);

export const { setSales, prependSale, markSalesSeen, clearSales } = salesSlice.actions;
export default salesSlice.reducer;
