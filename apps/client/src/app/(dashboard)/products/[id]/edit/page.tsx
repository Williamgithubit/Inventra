"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import type { ProductFormInput } from "@inventra/types";

import { AuthGuard } from "../../../../../components/auth/auth-guard";
import { ProductForm } from "../../../../../components/products/product-form";
import { LoadingScreen } from "../../../../../components/shared/loading-screen";
import { PageHeader } from "../../../../../components/shared/page-header";
import { useAuth } from "../../../../../hooks/use-auth";
import { getApiErrorMessage, useGetProductQuery, useUpdateProductMutation } from "../../../../../store/api";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();
  const [updateProduct] = useUpdateProductMutation();
  const { data: product, error, isFetching, isLoading } = useGetProductQuery(params.id, {
    skip: !token || !params.id
  });

  useEffect(() => {
    if (error) {
      toast.error(getApiErrorMessage(error, "Unable to load product"));
    }
  }, [error]);

  async function handleSubmit(values: ProductFormInput) {
    try {
      await updateProduct({
        productId: params.id,
        payload: values
      }).unwrap();
      toast.success("Product updated");
      router.push("/products");
    } catch (submitError) {
      toast.error(getApiErrorMessage(submitError, "Unable to update product"));
    }
  }

  return (
    <AuthGuard roles={["SHOP_OWNER"]}>
      <div className="space-y-8">
        <PageHeader
          eyebrow="Inventory"
          title="Edit product"
          description="Adjust pricing or stock counts without losing the existing QR code."
        />
        {(isLoading || isFetching) || !product ? (
          <LoadingScreen />
        ) : (
          <ProductForm
            defaultValues={{
              name: product.name,
              price: product.price,
              quantity: product.quantity
            }}
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
          />
        )}
      </div>
    </AuthGuard>
  );
}
