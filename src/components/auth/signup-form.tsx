'use client';

import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userFormSchema } from '@/schemas/user-schema';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ErrorMessage } from '@/components/ui/error-message';
import type { UserFormProps, UserFormData } from '@/types/user';
import { createUserAction } from '@/actions/auth';
import { useState, useEffect } from 'react';
import { useAction } from 'next-safe-action/hooks';
import { toast } from 'sonner';
import Link from 'next/link';

type CreateUserFormData = UserFormData;

export function UserForm({ roles, branches, onSuccess, initialData }: UserFormProps) {
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      password: '',
      confirmPassword: '',
      role: initialData?.role || '',
      branch: initialData?.branch || '',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || '',
        email: initialData.email || '',
        password: '',
        confirmPassword: '',
        role: initialData.role || '',
        branch: initialData.branch || '',
      });
    }
  }, [initialData, form]);

  const { execute, isExecuting } = useAction(createUserAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(data.message || 'User created successfully');
        form.reset();
        setFormError(null);
        onSuccess?.();
      }
    },
    onError: () => {
      setFormError('An unexpected error occurred');
    },
  });

  const submit = async (data: CreateUserFormData) => {
    setFormError(null);
    execute(data);
  };

  return (
    <div className="space-y-4">
      {formError && <ErrorMessage message={formError} />}
      <Card>
        <CardHeader>
          <CardTitle>Create User</CardTitle>
          <CardDescription>
            Fill in the details to create a new user account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(submit)} className="space-y-4">

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter user's full name"
                          type="text"
                          autoComplete="name"
                          disabled={isExecuting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter user's email address"
                          type="email"
                          autoComplete="email"
                          disabled={isExecuting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter user's password"
                          type="password"
                          autoComplete="new-password"
                          disabled={isExecuting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Confirm user's password"
                          type="password"
                          autoComplete="new-password"
                          disabled={isExecuting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isExecuting}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.name}>
                              <div className="flex flex-col">
                                <span className="font-medium">{role.name}</span>
                                {role.description && (
                                  <span className="text-xs text-muted-foreground truncate">
                                    {role.description}
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isExecuting}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a branch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {branches.map((branch) => (
                            <SelectItem key={branch.id} value={branch.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{branch.name}</span>
                                {branch.address && (
                                  <span className="text-xs text-muted-foreground truncate">
                                    {branch.address}
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isExecuting} className="w-full">
                    {isExecuting ? 'Creating User...' : 'Create User'}
                  </Button>
                </div>
              </form>
            </Form>
          </FormProvider>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline underline-offset-4">
              Log in
            </Link>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
