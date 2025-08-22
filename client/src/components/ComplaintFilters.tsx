import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { ComplaintStatus } from '../../../server/src/schema';

interface ComplaintFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: ComplaintStatus | 'all';
  onStatusFilterChange: (value: ComplaintStatus | 'all') => void;
  onClear: () => void;
}

export function ComplaintFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onClear
}: ComplaintFiltersProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg space-y-4 md:space-y-0 md:flex md:items-end md:gap-4">
      <div className="flex-1 space-y-2">
        <Label htmlFor="search">Search Complaints</Label>
        <Input
          id="search"
          placeholder="Search by title, description, or email..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
            onSearchChange(e.target.value)
          }
          className="form-input"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="status-filter">Filter by Status</Label>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-full md:w-48" id="status-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">📋 All Statuses</SelectItem>
            <SelectItem value="new">🆕 New</SelectItem>
            <SelectItem value="in_progress">⚡ In Progress</SelectItem>
            <SelectItem value="pending_user_info">⏳ Pending User Info</SelectItem>
            <SelectItem value="resolved">✅ Resolved</SelectItem>
            <SelectItem value="rejected">❌ Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button 
        variant="outline" 
        onClick={onClear}
        className="w-full md:w-auto enhanced-button"
      >
        🗑️ Clear Filters
      </Button>
    </div>
  );
}