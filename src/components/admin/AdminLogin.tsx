"use client";

import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { OtpForm, type OtpLabels } from "@/components/auth/OtpForm";
import { ADMIN_ERRORS } from "./errors";

export type AdminLoginProps = {
  next?: string;
};

export function AdminLogin({ next = "/admin" }: AdminLoginProps): React.JSX.Element {
  const router = useRouter();

  const labels: OtpLabels = {
    title: "Admin sign in",
    emailLabel: "Staff email address",
    emailPlaceholder: "admin@sadhakpawanpandey.com",
    sendCode: "Send sign-in code",
    sending: "Sending code...",
    enterCode: "Enter 6-digit code",
    codeSentTo: "We sent a verification code to {email}",
    verify: "Sign in",
    verifying: "Verifying...",
    resendCode: "Resend code",
    resendIn: "Resend code in {seconds}s",
    changeEmail: "Change email",
    errors: ADMIN_ERRORS,
  };

  const handleDone = (dest: string): void => {
    const target = dest || next || "/admin";
    router.replace(target);
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-n9 px-4 py-12">
      <div className="w-full max-w-[420px] flex flex-col items-center">
        {/* Brand header */}
        <div className="mb-8 flex flex-col items-center gap-2.5 text-center">
          <Logo uid="admin-login" className="h-10 w-auto text-iv" />
          <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-g3">
            Admin Portal
          </span>
        </div>

        {/* Centered Cream Card via OtpForm */}
        <OtpForm
          purpose="admin_login"
          locale="en"
          labels={labels}
          next={next}
          onDone={handleDone}
        />
      </div>
    </div>
  );
}
