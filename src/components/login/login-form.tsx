"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiLock, FiMail, FiAlertCircle, FiX } from "react-icons/fi";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { API_BASE_URL, storeAuthData, LoginResponse, getStoredAuthData } from "@/lib/utils";

// Interface for admin creation
interface AdminFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: string;
}

// Admin Creation Modal Component
function AdminCreationModal({ onClose }: { onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<AdminFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "admin"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Get the stored auth tokens
      const { tokens } = getStoredAuthData();
      
      if (!tokens?.accessToken) {
        throw new Error('No access token found. Please login again.');
      }

      const response = await fetch(`${API_BASE_URL}/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create admin');
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-gray-700"
        >
          <FiX className="h-5 w-5" />
        </button>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Create Admin Account</h2>
          <p className="mt-2 text-gray-600 text-sm">Fill in the details to create a new admin user.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center text-sm mb-6">
            <FiAlertCircle className="mr-2 h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full"
              placeholder="Enter first name"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full"
              placeholder="Enter last name"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="adminEmail" className="text-sm font-medium text-gray-700">Email</Label>
            <Input
              id="adminEmail"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">Phone Number</Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full"
              placeholder="Enter phone number"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="adminPassword" className="text-sm font-medium text-gray-700">Password</Label>
            <Input
              id="adminPassword"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full"
              placeholder="••••••••"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full mt-8"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Admin"}
          </Button>
        </form>
      </div>
    </div>
  );
}

// Interface for super admin creation
interface SuperAdminFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

// Super Admin Creation Modal Component
function SuperAdminCreationModal({ onClose }: { onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<SuperAdminFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register-super-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create super admin');
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-gray-700"
        >
          <FiX className="h-5 w-5" />
        </button>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Create Super Admin Account</h2>
          <p className="mt-2 text-gray-600 text-sm">One Time Setup for Super Admin Account.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center text-sm mb-6">
            <FiAlertCircle className="mr-2 h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full"
              placeholder="Enter first name"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full"
              placeholder="Enter last name"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="superAdminEmail" className="text-sm font-medium text-gray-700">Email</Label>
            <Input
              id="superAdminEmail"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full"
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">Phone Number</Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full"
              placeholder="Enter phone number"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="superAdminPassword" className="text-sm font-medium text-gray-700">Password</Label>
            <Input
              id="superAdminPassword"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full"
              placeholder="Enter password"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full mt-8"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Super Admin"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [createSuperAdmin, setCreateSuperAdmin] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showSuperAdminModal, setShowSuperAdminModal] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    if (createSuperAdmin) {
      setShowSuperAdminModal(true);
      return;
    }

    setIsLoading(true);
    setLoginError(null);
    
    // Validate email
    if (!email || !email.includes('@')) {
      setLoginError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }
    
    // Validate password
    if (!password || password.length < 8) {
      setLoginError("Password must be at least 8 characters.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login-with-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store auth data
      storeAuthData(data.data);

      // Handle role-based routing
      if (data.data.user.role === 'superadmin') {
        setShowAdminModal(true);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-6">
        {loginError && !createSuperAdmin && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center text-sm mb-4">
            <FiAlertCircle className="mr-2 h-4 w-4" />
            {loginError}
          </div>
        )}
        
        <div className="flex items-center space-x-2 mb-6">
          <Checkbox 
            id="createSuperAdmin" 
            checked={createSuperAdmin}
            onCheckedChange={(checked) => {
              setCreateSuperAdmin(checked === true);
              setLoginError(null);
            }}
          />
          <Label
            htmlFor="createSuperAdmin"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700"
          >
            Create Super Admin
          </Label>
        </div>

        {!createSuperAdmin && (
          <>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  id="email"
                  type="email"
                  placeholder="corporate@example.com" 
                  className="pl-10" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required={!createSuperAdmin}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <FiLock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  id="password"
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!createSuperAdmin}
                />
              </div>
            </div>
          </>
        )}
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {createSuperAdmin ? "One Time Setup" : (isLoading ? "Signing in..." : "Sign in")}
        </Button>
      </form>

      {showAdminModal && (
        <AdminCreationModal onClose={() => {
          setShowAdminModal(false);
          router.push('/');
        }} />
      )}

      {showSuperAdminModal && (
        <SuperAdminCreationModal onClose={() => {
          setShowSuperAdminModal(false);
          setCreateSuperAdmin(false);
          router.push('/');
        }} />
      )}
    </>
  );
} 