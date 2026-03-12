import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold text-carbon mb-6 text-center">
        Create an Account
      </h1>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <SignupForm />
      </div>
    </div>
  );
}
