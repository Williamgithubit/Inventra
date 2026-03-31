"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { productFormSchema, type ProductFormInput } from "@inventra/types";
import { Button, Card, Input } from "@inventra/ui";
import { useForm } from "react-hook-form";

export function ProductForm({
  defaultValues,
  onSubmit,
  submitLabel
}: {
  defaultValues?: ProductFormInput;
  onSubmit: (values: ProductFormInput) => Promise<void>;
  submitLabel: string;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ProductFormInput>({
    resolver: zodResolver(productFormSchema),
    defaultValues: defaultValues ?? {
      name: "",
      price: 0,
      quantity: 0
    }
  });

  return (
    <Card className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-display text-3xl text-ink">Product Details</h2>
        <p className="text-sm text-stone-500">
          Save pricing, stock counts, and the QR code will be generated automatically.
        </p>
      </div>

      <form
        className="grid gap-5 md:grid-cols-2"
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(values);
        })}
      >
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-ink" htmlFor="name">
            Product name
          </label>
          <Input id="name" placeholder="Ground coffee 250g" {...register("name")} />
          {errors.name ? <p className="text-sm text-rose-600">{errors.name.message}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-ink" htmlFor="price">
            Price
          </label>
          <Input id="price" min={0} step="0.01" type="number" {...register("price", { valueAsNumber: true })} />
          {errors.price ? <p className="text-sm text-rose-600">{errors.price.message}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-ink" htmlFor="quantity">
            Quantity
          </label>
          <Input id="quantity" min={0} step="1" type="number" {...register("quantity", { valueAsNumber: true })} />
          {errors.quantity ? <p className="text-sm text-rose-600">{errors.quantity.message}</p> : null}
        </div>

        <div className="md:col-span-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  );
}
