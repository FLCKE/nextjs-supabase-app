
'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { updateProfile } from '../actions'
import { toast } from "sonner"
import { useTransition } from 'react'
import { type Profile } from '@/types'
import { profileSchema } from '@/lib/validation/profile'

export function ProfileForm({ profile }: { profile: Profile }) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile.full_name || '',
      phone: profile.phone || '',
    },
  })

  const onSubmit = (data: z.infer<typeof profileSchema>) => {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('full_name', data.full_name)
      if (data.phone) {
        formData.append('phone', data.phone)
      }

      const { error } = await updateProfile(formData)

      if (error) {
        toast.error(error)
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" {...form.register('full_name')} />
            {form.formState.errors.full_name && (
              <p className="text-red-500 text-sm">{form.formState.errors.full_name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...form.register('phone')} />
            {form.formState.errors.phone && (
              <p className="text-red-500 text-sm">{form.formState.errors.phone.message}</p>
            )}
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Updating...' : 'Update Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
