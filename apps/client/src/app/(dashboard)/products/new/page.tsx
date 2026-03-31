"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { ProductFormInput } from "@inventra/types";

import { AuthGuard } from "../../../../components/auth/auth-guard";
import { ProductForm } from "../../../../components/products/product-form";
import { PageHeader } from "../../../../components/shared/page-header";
import { getApiErrorMessage, useCreateProductMutation } from "../../../../store/api";

export default function NewProductPage() {
  const router = useRouter();
  const [createProduct] = useCreateProductMutation();

  async function handleSubmit(values: ProductFormInput) {
    try {
      await createProduct(values).unwrap();
      toast.success("Product created with QR code");
      router.push("/products");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to create product"));
    }
  }

  return (
    <AuthGuard roles={["SHOP_OWNER"]}>
      <div className="space-y-8">
        <PageHeader
          eyebrow="Inventory"
          title="Add a new product"
          description="Create a new inventory record and Inventra will generate a printable QR code automatically."
        />
        <ProductForm onSubmit={handleSubmit} submitLabel="Create Product" />
      </div>
    </AuthGuard>
  );
}
