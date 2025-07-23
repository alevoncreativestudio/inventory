// components/auth/SignUpWrapper.tsx
'use client';

import { useRouter } from 'next/navigation';
import { UserForm } from '@/components/auth/signup-form';
import type { Role, Branch } from '@prisma/client';

interface SignUpWrapperProps {
  roles: Role[];
  branches: Branch[];
}

export function SignUpWrapper({ roles, branches }: SignUpWrapperProps) {
  const router = useRouter();

  return (
    <UserForm
      roles={roles}
      branches={branches}
      onSuccess={() => router.push('/login')}
    />
  );
}
