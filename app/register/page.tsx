import { SignUp } from "@clerk/nextjs";

export default function RegisterPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <SignUp routing="hash" signInUrl="/login" />
    </div>
  );
}
