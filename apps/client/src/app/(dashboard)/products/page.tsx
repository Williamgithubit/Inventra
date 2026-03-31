"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import { AuthGuard } from "../../../components/auth/auth-guard";
import { LinkButton } from "../../../components/shared/link-button";
import { LoadingScreen } from "../../../components/shared/loading-screen";
import { PageHeader } from "../../../components/shared/page-header";
import { ProductsTable } from "../../../components/products/products-table";
import { useAuth } from "../../../hooks/use-auth";
import { useAppSelector } from "../../../hooks/use-app-store";
import { getApiErrorMessage, useDeleteProductMutation, useListProductsQuery } from "../../../store/api";

export default function ProductsPage() {
  const { token } = useAuth();
  const [deleteProduct] = useDeleteProductMutation();
  const { error } = useListProductsQuery(undefined, {
    skip: !token
  });
  const products = useAppSelector((state) => state.inventory.products);
  const loading = useAppSelector((state) => Boolean(token) && !state.inventory.hasLoadedOnce);

  useEffect(() => {
    if (error) {
      toast.error(getApiErrorMessage(error, "Unable to load products"));
    }
  }, [error]);

  async function handleDelete(productId: string) {
    try {
      await deleteProduct(productId).unwrap();
      toast.success("Product deleted");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to delete product"));
    }
  }

  return (
    <AuthGuard roles={["SHOP_OWNER"]}>
      <div className="space-y-8">
        <PageHeader
          eyebrow="Inventory"
          title="Products and labels"
          description="Create products, manage stock levels, and print QR codes for faster checkout."
          actions={<LinkButton href="/products/new" label="Add Product" />}
        />

        {loading && products.length === 0 ? <LoadingScreen /> : <ProductsTable onDelete={handleDelete} products={products} />}
      </div>
    </AuthGuard>
  );
}
