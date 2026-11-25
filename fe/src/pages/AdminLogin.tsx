import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { ApiError, authApi, setStoredAuth } from '../api/adminApi';

interface FormFieldProps {
  id: string;
  name: string;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
}

function FormField({
  id,
  name,
  label,
  type,
  placeholder,
  value,
  onChange,
  autoComplete,
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="text-xs font-bold tracking-tight text-[#0F172A]"
      >
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className="h-11 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm text-[#0F172A] placeholder-[#94A3B8] transition-all focus:border-[#DC2626] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20"
      />
    </div>
  );
}

export interface AdminLoginProps {
  onLoginSuccess?: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [credentials, setCredentials] = useState({
    identifier: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await authApi.login(
        credentials.identifier.trim(),
        credentials.password
      );

      if (result.role === 'CUSTOMER') {
        setErrorMessage(
          'Access denied: Only Admin and Staff accounts can sign in here.'
        );
        return;
      }

      setStoredAuth(result.token, result.user);
      onLoginSuccess?.();

      if (result.role === 'STAFF') {
        navigate('/admin/check-in');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Unable to reach server. Please check backend status.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col justify-between bg-[#F8FAFC]">
      <Header />

      <main className="mx-auto my-auto flex w-full max-w-[1280px] flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 select-none text-2xl font-extrabold tracking-tight">
            <span className="text-[#ECC904]">SE</span>
            <span className="text-[#DC2626]">NEMA</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">
            Administrator & Staff
          </h1>
          <p className="mt-2.5 text-sm font-normal text-[#475569]">
            Sign in to manage the cinema operations
          </p>
        </div>

        <section className="w-full max-w-[440px] rounded-2xl border border-[#F1F5F9] bg-white p-7 shadow-[0_8px_30px_rgb(15,23,42,0.04)] sm:p-9">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {errorMessage && (
              <div
                role="alert"
                className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3.5 py-2.5 text-xs font-semibold text-[#B91C1C]"
              >
                {errorMessage}
              </div>
            )}

            <FormField
              id="identifier"
              name="identifier"
              label="Email / Phone Number"
              type="text"
              placeholder="admin@senema.vn"
              value={credentials.identifier}
              onChange={handleInputChange}
              autoComplete="username"
            />

            <FormField
              id="password"
              name="password"
              label="Password"
              type="password"
              placeholder="••••••••••••"
              value={credentials.password}
              onChange={handleInputChange}
              autoComplete="current-password"
            />

            <div className="mt-1 flex flex-col gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-11 w-full items-center justify-center rounded-lg bg-gradient-to-r from-[#DC2626] via-[#EA580C] to-[#F59E0B] text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'SIGNING IN...' : 'SIGN IN'}
              </button>

              <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                <span>Admin: admin@senema.vn</span>
                <span>Staff: minh.staff@senema.vn</span>
              </div>
            </div>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
}
