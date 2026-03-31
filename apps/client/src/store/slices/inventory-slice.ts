import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { Product } from "@inventra/types";
import { DEFAULT_LOW_STOCK_THRESHOLD } from "@inventra/utils";

import { productsApi } from "../api/products-api";

function sortProducts(products: Product[]) {
  return [...products].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

interface InventoryState {
  products: Product[];
  highlightedProductIds: string[];
  lowStockThreshold: number;
  hasLoadedOnce: boolean;
}

const initialState: InventoryState = {
  products: [],
  highlightedProductIds: [],
  lowStockThreshold: DEFAULT_LOW_STOCK_THRESHOLD,
  hasLoadedOnce: false
};

function syncHighlightedProducts(state: InventoryState) {
  state.highlightedProductIds = state.products
    .filter((product) => product.quantity <= state.lowStockThreshold)
    .map((product) => product.id);
}

function applyProducts(state: InventoryState, products: Product[]) {
  state.products = sortProducts(products);
  state.hasLoadedOnce = true;
  syncHighlightedProducts(state);
}

function applyUpsertProduct(state: InventoryState, product: Product) {
  const index = state.products.findIndex((item) => item.id === product.id);

  if (index === -1) {
    state.products = sortProducts([...state.products, product]);
  } else {
    state.products[index] = product;
    state.products = sortProducts(state.products);
  }

  state.hasLoadedOnce = true;
  syncHighlightedProducts(state);
}

function applyRemoveProduct(state: InventoryState, productId: string) {
  state.products = state.products.filter((product) => product.id !== productId);
  state.highlightedProductIds = state.highlightedProductIds.filter((highlightedId) => highlightedId !== productId);
}

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    setProducts(
      state,
      action: PayloadAction<{
        products: Product[];
        lowStockThreshold?: number;
      }>
    ) {
      if (action.payload.lowStockThreshold !== undefined) {
        state.lowStockThreshold = action.payload.lowStockThreshold;
      }

      applyProducts(state, action.payload.products);
    },
    upsertProduct(state, action: PayloadAction<Product>) {
      applyUpsertProduct(state, action.payload);
    },
    removeProduct(state, action: PayloadAction<string>) {
      applyRemoveProduct(state, action.payload);
    },
    setLowStockThreshold(state, action: PayloadAction<number>) {
      state.lowStockThreshold = action.payload;
      syncHighlightedProducts(state);
    },
    clearInventory(state) {
      state.products = [];
      state.highlightedProductIds = [];
      state.lowStockThreshold = DEFAULT_LOW_STOCK_THRESHOLD;
      state.hasLoadedOnce = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(productsApi.endpoints.listProducts.matchFulfilled, (state, action) => {
        applyProducts(state, action.payload);
      })
      .addMatcher(productsApi.endpoints.getProduct.matchFulfilled, (state, action) => {
        applyUpsertProduct(state, action.payload);
      })
      .addMatcher(productsApi.endpoints.createProduct.matchFulfilled, (state, action) => {
        applyUpsertProduct(state, action.payload);
      })
      .addMatcher(productsApi.endpoints.updateProduct.matchFulfilled, (state, action) => {
        applyUpsertProduct(state, action.payload);
      })
      .addMatcher(productsApi.endpoints.deleteProduct.matchFulfilled, (state, action) => {
        applyRemoveProduct(state, action.payload.id);
      })
      .addMatcher(productsApi.endpoints.scanProduct.matchFulfilled, (state, action) => {
        applyUpsertProduct(state, action.payload);
      });
  }
});

export const { setProducts, upsertProduct, removeProduct, setLowStockThreshold, clearInventory } =
  inventorySlice.actions;
export default inventorySlice.reducer;
