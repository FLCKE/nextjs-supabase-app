'use client';

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { createStaffMember, getStaffMembers } from '@/lib/actions/staff-actions';
import type { StaffMember, Restaurant } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Zod schema for the form on the client-side
const staffFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  username: z.string().min(3, 'Username must be at least 3 characters.'),
  login_code: z.string().length(5, 'Login code must be 5 digits.').regex(/^\d+$/, 'Login code must be numeric.'),
});

type StaffFormValues = z.infer<typeof staffFormSchema>;

interface StaffClientProps {
  restaurants: Restaurant[];
  initialStaff: StaffMember[];
}

export function StaffClient({ restaurants, initialStaff }: StaffClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | undefined>(restaurants[0]?.id);
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff);
  const [isFetchingStaff, setIsFetchingStaff] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
  });

  const handleRestaurantChange = async (restaurantId: string) => {
    setSelectedRestaurantId(restaurantId);
    setIsFetchingStaff(true);
    try {
      const newStaff = await getStaffMembers(restaurantId);
      setStaff(newStaff);
    } catch (error) {
      toast.error('Failed to fetch staff members.');
      setStaff([]); // Clear staff on error
    } finally {
      setIsFetchingStaff(false);
    }
  };

  const onSubmit: SubmitHandler<StaffFormValues> = async (data) => {
    if (!selectedRestaurantId) {
      toast.error('No restaurant selected.');
      return;
    }

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('username', data.username);
    formData.append('login_code', data.login_code);
    formData.append('restaurantId', selectedRestaurantId);

    const result = await createStaffMember(formData);

    if (result.success && 'data' in result) {
      toast.success('Staff member created successfully!');
      // Add new staff member to the list without re-fetching
      setStaff(prevStaff => [...prevStaff, (result as any).data as StaffMember]);
      setIsOpen(false);
      reset();
    } else {
      // Handle nested error object for fields
      if (typeof result.error === 'object' && result.error !== null) {
        const fieldErrors = result.error as any;
        if(fieldErrors.username) toast.error(`Username: ${fieldErrors.username._errors.join(', ')}`);
        if(fieldErrors.name) toast.error(`Name: ${fieldErrors.name._errors.join(', ')}`);
        if(fieldErrors.login_code) toast.error(`Login Code: ${fieldErrors.login_code._errors.join(', ')}`);
      } else if (typeof result.error === 'string'){
        toast.error(`Failed to create staff member: ${result.error}`);
      } else {
        toast.error('An unknown error occurred.');
      }
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground">Add or remove staff for your restaurants.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button disabled={!selectedRestaurantId}>Add New Staff</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Staff Member</DialogTitle>
              <DialogDescription>
                Create a new staff member and assign them a unique username and a 5-digit login code.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input id="name" {...register('name')} className="col-span-3" />
                  {errors.name && <p className="col-span-4 text-red-500 text-sm">{errors.name.message}</p>}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">Username</Label>
                  <Input id="username" {...register('username')} className="col-span-3" />
                   {errors.username && <p className="col-span-4 text-red-500 text-sm">{errors.username.message}</p>}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="login_code" className="text-right">5-Digit Code</Label>
                  <Input id="login_code" type="text" maxLength={5} {...register('login_code')} className="col-span-3" />
                   {errors.login_code && <p className="col-span-4 text-red-500 text-sm">{errors.login_code.message}</p>}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Staff Member'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {restaurants.length > 1 && (
        <div className="mb-6 max-w-sm">
          <Label>Select Restaurant</Label>
          <Select
            value={selectedRestaurantId}
            onValueChange={handleRestaurantChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a restaurant" />
            </SelectTrigger>
            <SelectContent>
              {restaurants.map((restaurant) => (
                <SelectItem key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetchingStaff ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Loading staff...
                </TableCell>
              </TableRow>
            ) : staff.length > 0 ? (
              staff.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.username}</TableCell>
                  <TableCell>{new Date(s.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {/* Actions like Edit/Delete can be added here */}
                    <Button variant="outline" size="sm">
                      ...
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No staff members found for this restaurant.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
