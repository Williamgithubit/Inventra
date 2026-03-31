"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@inventra/types";
import { Button, Card, Input } from "@inventra/ui";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { getDefaultRoute } from "../../lib/navigation";
import { getApiErrorMessage, isApiClientError, useLoginMutation } from "../../store/api";

const formSchema = loginSchema;
type FormValues = z.infer<typeof formSchema>;

export function LoginForm() {
  const [login, { isLoading }] = useLoginMutation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const session = await login(values).unwrap();
      toast.success("Welcome back to Inventra");
      router.replace(searchParams.get("next") || getDefaultRoute(session.user.role));
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

      toast.error(getApiErrorMessage(error, "Unable to sign in"));
    }
  });

  return (
    <Card className="mx-auto w-full max-w-xl space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Login</p>
        <h1 className="font-display text-4xl text-ink">Return to your counter, not your spreadsheets.</h1>
        <p className="text-sm leading-6 text-stone-600">
          Sign in to manage products, ring up sales, and monitor stock in real time.
        </p>
      </div>

      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-ink" htmlFor="email">
            Email
          </label>
          <Input id="email" placeholder="owner@cornerstore.com" {...register("email")} />
          {errors.email ? <p className="text-sm text-rose-600">{errors.email.message}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-ink" htmlFor="password">
            Password
          </label>
          <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
          {errors.password ? <p className="text-sm text-rose-600">{errors.password.message}</p> : null}
        </div>

        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <p className="text-sm text-stone-500">
        New to Inventra?{" "}
        <Link className="font-semibold text-brand-700" href="/register">
          Start your free trial
        </Link>
      </p>
    </Card>
  );
}
