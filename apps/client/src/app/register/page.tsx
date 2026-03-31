import { GuestGuard } from "../../components/auth/guest-guard";
import { RegisterForm } from "../../components/auth/register-form";
import { SiteHeader } from "../../components/layout/site-header";

export default function RegisterPage() {
  return (
    <GuestGuard>
      <div className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <RegisterForm />
        </main>
      </div>
    </GuestGuard>
  );
}
