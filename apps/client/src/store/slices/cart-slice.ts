import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { Product } from "@inventra/types";

export interface CartLine {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  availableQuantity: number;
}

interface CartState {
  items: CartLine[];
}

const initialState: CartState = {
  items: []
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<Product>) {
      const existingLine = state.items.find((item) => item.productId === action.payload.id);

      if (existingLine) {
        existingLine.quantity = Math.min(existingLine.quantity + 1, existingLine.availableQuantity);
        existingLine.availableQuantity = action.payload.quantity;
        return;
      }

      state.items.push({
        productId: action.payload.id,
        name: action.payload.name,
        price: action.payload.price,
        quantity: 1,
        availableQuantity: action.payload.quantity
      });
    },
    updateQuantity(
      state,
      action: PayloadAction<{
        productId: string;
        quantity: number;
      }>
    ) {
      const line = state.items.find((item) => item.productId === action.payload.productId);

      if (!line) {
        return;
      }

      if (action.payload.quantity <= 0) {
        state.items = state.items.filter((item) => item.productId !== action.payload.productId);
        return;
      }

      line.quantity = Math.min(action.payload.quantity, line.availableQuantity);
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.productId !== action.payload);
    },
    clearCart(state) {
      state.items = [];
    },
    syncInventory(state, action: PayloadAction<Product[]>) {
      const inventory = new Map(action.payload.map((product) => [product.id, product]));

      state.items = state.items
        .map((item) => {
          const product = inventory.get(item.productId);

          if (!product) {
            return item;
          }

          return {
            ...item,
            availableQuantity: product.quantity,
            quantity: Math.min(item.quantity, product.quantity)
          };
        })
        .filter((item): item is CartLine => item !== null && item.quantity > 0);
    }
  }
});

export const { addToCart, updateQuantity, removeFromCart, clearCart, syncInventory } = cartSlice.actions;
export default cartSlice.reducer;
