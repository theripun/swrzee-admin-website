import { Metadata } from "next";
import { LoginForm } from "@/components/login/login-form";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Corporate Login | Swrzee Enterprise",
  description: "Secure login portal for corporate clients of Swrzee Enterprise.",
};

export default function CorporateLogin() {
  return (
    <div className="min-h-screen bg-white flex flex-col">      
      <div className="flex-1 flex items-center justify-center py-16">
        <div className="w-full max-w-md px-4 sm:px-6">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Image
                src="/logo/swrzee-logo.png"
                alt="Swrzee Enterprise Logo"
                width={180}
                height={54}
                priority
                className="h-auto"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Swrzee Enterprise</h1>
            <p className="text-gray-600">
              Sign in to your corporate admin portal to manage training programs and organizational services.
            </p>
          </div>
          
          <div className="bg-white shadow-sm border border-gray-100 rounded-lg p-8">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
} 