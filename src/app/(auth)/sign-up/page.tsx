// app/sign-up/page.tsx
import { getAllRoles, getAllBranches } from '@/actions/auth';
import { SignUpWrapper } from '@/components/auth/SignUpWrapper';

export default async function SignUpPage() {
  const roles = await getAllRoles();
  const branches = await getAllBranches();


  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignUpWrapper roles={roles} branches={branches} />
      </div>
    </div>
  );
}
