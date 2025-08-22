import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import type { Complaint, ComplaintStatus } from '../../../server/src/schema';

interface ComplaintCardProps {
  complaint: Complaint;
  isAdmin?: boolean;
  onStatusUpdate?: (complaintId: number, newStatus: ComplaintStatus) => void;
}

// Status color mapping for professional appearance
const getStatusColor = (status: ComplaintStatus): string => {
  switch (status) {
    case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
    case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
    case 'pending_user_info': return 'bg-orange-100 text-orange-800 border-orange-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Format status text for display
const formatStatus = (status: ComplaintStatus): string => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Format date for display
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Get status icon
const getStatusIcon = (status: ComplaintStatus): string => {
  switch (status) {
    case 'new': return '🆕';
    case 'in_progress': return '⚡';
    case 'resolved': return '✅';
    case 'rejected': return '❌';
    case 'pending_user_info': return '⏳';
    default: return '📋';
  }
};

export function ComplaintCard({ complaint, isAdmin = false, onStatusUpdate }: ComplaintCardProps) {
  const borderColor = isAdmin ? 'border-l-orange-500' : 'border-l-blue-500';

  return (
    <Card className={`border-l-4 ${borderColor} complaint-card`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <span>{getStatusIcon(complaint.status)}</span>
              {complaint.title}
            </CardTitle>
            <CardDescription className="space-y-1">
              <div>ID: #{complaint.id}</div>
              {isAdmin && <div>📧 {complaint.customer_email}</div>}
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`${getStatusColor(complaint.status)} status-badge`}>
              {formatStatus(complaint.status)}
            </Badge>
            {isAdmin && onStatusUpdate && (
              <Select
                value={complaint.status}
                onValueChange={(value: ComplaintStatus) => 
                  onStatusUpdate(complaint.id, value)
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">🆕 New</SelectItem>
                  <SelectItem value="in_progress">⚡ In Progress</SelectItem>
                  <SelectItem value="pending_user_info">⏳ Pending User Info</SelectItem>
                  <SelectItem value="resolved">✅ Resolved</SelectItem>
                  <SelectItem value="rejected">❌ Rejected</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className={`p-3 rounded-md ${isAdmin ? 'bg-gray-50' : 'bg-blue-50'}`}>
          <p className="text-gray-700 custom-scrollbar max-h-32 overflow-y-auto">
            {complaint.description}
          </p>
        </div>
        <Separator />
        <div className="text-sm text-gray-500 flex justify-between flex-wrap gap-2">
          <span className="flex items-center gap-1">
            📅 Submitted: {formatDate(complaint.created_at)}
          </span>
          <span className="flex items-center gap-1">
            🔄 Updated: {formatDate(complaint.updated_at)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}