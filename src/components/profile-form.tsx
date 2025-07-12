'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Switch } from './ui/switch';
import { updateUserProfile } from '@/app/actions/user';
import { useRouter } from 'next/navigation';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  location: z.string().optional(),
  bio: z.string().max(300, 'Bio cannot exceed 300 characters').optional(),
  skillsOffered: z.string().min(1, 'Please list at least one skill to offer'),
  skillsWanted: z.string().min(1, 'Please list at least one skill you want'),
  availability: z.string().min(1, 'Please specify your availability'),
  isPublic: z.boolean().default(true),
});

interface ProfileFormProps {
  user: User;
  onSave: () => void;
}

export default function ProfileForm({ user, onSave }: ProfileFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || '',
      location: user.location || '',
      bio: user.bio || '',
      skillsOffered: user.skillsOffered?.join(', ') || '',
      skillsWanted: user.skillsWanted?.join(', ') || '',
      availability: user.availability || '',
      isPublic: user.isPublic ?? true,
    },
  });

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    const result = await updateUserProfile(user.id, values as any);

    if (result.success) {
      toast({
        title: 'Profile Updated!',
        description: 'Your profile information has been saved successfully.',
      });
      // Force a hard refresh to update session `isNewUser` flag if needed
      router.refresh(); 
      onSave();
    } else {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: result.message,
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
           <FormField
            control={form.control}
            name="isPublic"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between w-full">
                <div>
                  <FormLabel>Profile Visibility</FormLabel>
                   <FormDescription>
                    {field.value ? "Your profile is visible to others." : "Your profile is hidden."}
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Your full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., San Francisco, CA" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>About You</FormLabel>
              <FormControl>
                <Textarea placeholder="Tell us a little about yourself" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="skillsOffered"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Skills You Offer</FormLabel>
              <FormControl>
                <Input placeholder="e.g., React, Sourdough Baking, Guitar" {...field} />
              </FormControl>
              <FormDescription>Separate skills with a comma.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="skillsWanted"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Skills You Want to Learn</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Python, Pottery, Public Speaking" {...field} />
              </FormControl>
              <FormDescription>Separate skills with a comma.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="availability"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Availability</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Weekends, Mon/Wed evenings" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onSave}>Discard</Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
