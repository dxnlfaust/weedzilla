import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold text-carbon mb-6 text-center">
        Welcome Back
      </h1>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
