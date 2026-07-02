'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { z } from 'zod';
import { Building2, User, Mail, Phone, Users, Clock } from 'lucide-react';

interface FormData {
  schoolName: string;
  contactName: string;
  contactRole: string;
  email: string;
  phone: string;
  numberOfStudents: string;
  numberOfTeachers: string;
  preferredMorning: boolean;
  preferredAfternoon: boolean;
  specificDate: string;
  additionalNotes: string;
}

const demoSchema = z.object({
  schoolName: z.string().min(1, 'School name is required').max(100),
  contactName: z.string().min(1, 'Contact name is required').max(100),
  contactRole: z.string().min(1, 'Role is required'),
  email: z.string().email('Please enter a valid email').max(255),
  phone: z.string().min(10, 'Please enter a valid phone number').max(20),
  numberOfStudents: z.string().min(1, 'Please select number of students'),
  numberOfTeachers: z.string().min(1, 'Please select number of teachers'),
});

export function DemoRequestForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FormData>({
    schoolName: '',
    contactName: '',
    contactRole: '',
    email: '',
    phone: '',
    numberOfStudents: '',
    numberOfTeachers: '',
    preferredMorning: false,
    preferredAfternoon: false,
    specificDate: '',
    additionalNotes: '',
  });

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = demoSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/schools/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Request failed');
      }
      router.push('/schools/demo/success');
    } catch (err) {
      console.error('Demo request form error:', err);
      setErrors({ form: 'Something went wrong. Please try again or contact us directly.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const studentOptions = ['1-100', '101-500', '501-1000', '1000+'];

  const teacherOptions = ['1-20', '21-50', '51-100', '100+'];

  const roleOptions = ['Head Teacher', 'Deputy Head', 'Head of Department', 'IT Manager', 'Other'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form-level error */}
      {errors.form && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-4 py-3">
          {errors.form}
        </p>
      )}

      {/* School Name */}
      <div className="space-y-2">
        <Label htmlFor="schoolName" className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          School Name *
        </Label>
        <Input
          id="schoolName"
          value={formData.schoolName}
          onChange={(e) => updateField('schoolName', e.target.value)}
          placeholder="e.g., Oakwood Academy"
          className={errors.schoolName ? 'border-destructive' : ''}
        />
        {errors.schoolName && <p className="text-xs text-destructive">{errors.schoolName}</p>}
      </div>

      {/* Contact Name & Role */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contactName" className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            Your Name *
          </Label>
          <Input
            id="contactName"
            value={formData.contactName}
            onChange={(e) => updateField('contactName', e.target.value)}
            placeholder="John Smith"
            className={errors.contactName ? 'border-destructive' : ''}
          />
          {errors.contactName && <p className="text-xs text-destructive">{errors.contactName}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactRole">Your Role *</Label>
          <Select
            value={formData.contactRole}
            onValueChange={(value) => updateField('contactRole', value)}
          >
            <SelectTrigger className={errors.contactRole ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.contactRole && <p className="text-xs text-destructive">{errors.contactRole}</p>}
        </div>
      </div>

      {/* Email & Phone */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            Email *
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="john@school.edu"
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground" />
            Phone *
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            placeholder="+44 20 1234 5678"
            className={errors.phone ? 'border-destructive' : ''}
          />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
        </div>
      </div>

      {/* School Size */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="numberOfStudents" className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            Number of Students *
          </Label>
          <Select
            value={formData.numberOfStudents}
            onValueChange={(value) => updateField('numberOfStudents', value)}
          >
            <SelectTrigger className={errors.numberOfStudents ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              {studentOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.numberOfStudents && (
            <p className="text-xs text-destructive">{errors.numberOfStudents}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="numberOfTeachers">Number of Teachers *</Label>
          <Select
            value={formData.numberOfTeachers}
            onValueChange={(value) => updateField('numberOfTeachers', value)}
          >
            <SelectTrigger className={errors.numberOfTeachers ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              {teacherOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.numberOfTeachers && (
            <p className="text-xs text-destructive">{errors.numberOfTeachers}</p>
          )}
        </div>
      </div>

      {/* Preferred Contact Time */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          Preferred Contact Time (optional)
        </Label>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="morning"
              checked={formData.preferredMorning}
              onCheckedChange={(checked) => updateField('preferredMorning', checked === true)}
            />
            <label htmlFor="morning" className="text-sm text-foreground cursor-pointer">
              Morning (9am-12pm)
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="afternoon"
              checked={formData.preferredAfternoon}
              onCheckedChange={(checked) => updateField('preferredAfternoon', checked === true)}
            />
            <label htmlFor="afternoon" className="text-sm text-foreground cursor-pointer">
              Afternoon (12pm-5pm)
            </label>
          </div>
        </div>
        <Input
          type="date"
          value={formData.specificDate}
          onChange={(e) => updateField('specificDate', e.target.value)}
          placeholder="Or select a specific date"
          className="max-w-xs"
        />
      </div>

      {/* Additional Notes */}
      <div className="space-y-2">
        <Label htmlFor="additionalNotes">Additional Notes (optional)</Label>
        <Textarea
          id="additionalNotes"
          value={formData.additionalNotes}
          onChange={(e) => updateField('additionalNotes', e.target.value)}
          placeholder="Tell us about your specific needs or questions..."
          rows={4}
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin" />
            Submitting...
          </span>
        ) : (
          'Request Demo'
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        We&apos;ll contact you within 24 hours to schedule your demo
      </p>
    </form>
  );
}
