import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState } from 'react';
import type { CreateComplaintInput } from '../../../server/src/schema';

interface ComplaintFormProps {
  onSubmit: (data: CreateComplaintInput) => Promise<void>;
  isLoading?: boolean;
  message?: string;
}

export function ComplaintForm({ onSubmit, isLoading = false, message }: ComplaintFormProps) {
  const [formData, setFormData] = useState<CreateComplaintInput>({
    title: '',
    description: '',
    customer_email: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    
    // Reset form after successful submission (only if no error)
    if (!message?.includes('❌')) {
      setFormData({
        title: '',
        description: '',
        customer_email: ''
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="customer_email">Your Email Address *</Label>
        <Input
          id="customer_email"
          type="email"
          placeholder="your.email@company.com"
          value={formData.customer_email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData((prev: CreateComplaintInput) => ({ 
              ...prev, 
              customer_email: e.target.value 
            }))
          }
          required
          className="max-w-md form-input"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Complaint Title *</Label>
        <Input
          id="title"
          placeholder="Brief summary of the issue (e.g., 'Defective capacitor batch XY123')"
          value={formData.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData((prev: CreateComplaintInput) => ({ 
              ...prev, 
              title: e.target.value 
            }))
          }
          required
          className="form-input"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Detailed Description *</Label>
        <Textarea
          id="description"
          placeholder="Please describe the issue in detail:&#10;• What component was affected?&#10;• What went wrong?&#10;• When did it happen?&#10;• Any error codes or symptoms?&#10;• Steps to reproduce the issue?"
          value={formData.description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setFormData((prev: CreateComplaintInput) => ({ 
              ...prev, 
              description: e.target.value 
            }))
          }
          required
          rows={8}
          className="custom-scrollbar form-input"
        />
        <p className="text-sm text-gray-500">
          💡 Tip: The more details you provide, the faster we can resolve your issue
        </p>
      </div>

      <Button 
        type="submit" 
        disabled={isLoading} 
        className="w-full sm:w-auto enhanced-button"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <div className="spinner"></div>
            Submitting...
          </span>
        ) : (
          '📤 Submit Complaint'
        )}
      </Button>

      {message && (
        <Alert className={message.includes('✅') ? 
          'border-green-200 bg-green-50' : 
          'border-red-200 bg-red-50'
        }>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
    </form>
  );
}