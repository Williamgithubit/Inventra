"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@inventra/types";
import { Button, Card, Input } from "@inventra/ui";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { getApiErrorMessage, isApiClientError, useRegisterMutation } from "../../store/api";

const formSchema = registerSchema;
type FormValues = z.infer<typeof formSchema>;

export function RegisterForm() {
  const [registerUser, { isLoading }] = useRegisterMutation();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      shopName: ""
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await registerUser(values).unwrap();
      toast.success("Your shop is ready");
      router.replace("/dashboard");
    } catch (error) {
      if (isApiClientError(error) && error.fieldErrors) {
        Object.entries(error.fieldErrors).forEach(([field, messages]) => {
          const firstMessage = messages?.[0];

          if (firstMessage) {
            setError(field as keyof FormValues, {
              message: firstMessage
            });
          }
        });
      }

      toast.error(getApiErrorMessage(error, "Unable to create account"));
    }
  });

  return (
    <Card className="mx-auto w-full max-w-2xl space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Free Trial</p>
        <h1 className="font-display text-4xl text-ink">Launch your shop operations in one workspace.</h1>
        <p className="text-sm leading-6 text-stone-600">
          Create a shop owner account, stand up your inventory, and start taking sales today.
        </p>
      </div>

      <form className="grid gap-5 md:grid-cols-2" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-ink" htmlFor="name">
            Your name
          </label>
          <Input id="name" placeholder="Mina Johnson" {...register("name")} />
          {errors.name ? <p className="text-sm text-rose-600">{errors.name.message}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-ink" htmlFor="shopName">
            Shop name
          </label>
          <Input id="shopName" placeholder="Mina's Market" {...register("shopName")} />
          {errors.shopName ? <p className="text-sm text-rose-600">{errors.shopName.message}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-ink" htmlFor="email">
            Email
          </label>
          <Input id="email" placeholder="owner@minamarket.com" {...register("email")} />
          {errors.email ? <p className="text-sm text-rose-600">{errors.email.message}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-ink" htmlFor="password">
            Password
          </label>
          <Input id="password" type="password" placeholder="Strong password" {...register("password")} />
          {errors.password ? <p className="text-sm text-rose-600">{errors.password.message}</p> : null}
        </div>

        <div className="md:col-span-2">
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? "Creating your workspace..." : "Create Account"}
          </Button>
        </div>
      </form>

      <p className="text-sm text-stone-500">
        Already have an account?{" "}
        <Link className="font-semibold text-brand-700" href="/login">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
