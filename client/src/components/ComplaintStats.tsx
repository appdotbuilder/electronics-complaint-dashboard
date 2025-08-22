import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Complaint, ComplaintStatus } from '../../../server/src/schema';

interface ComplaintStatsProps {
  complaints: Complaint[];
}

export function ComplaintStats({ complaints }: ComplaintStatsProps) {
  // Calculate statistics
  const totalComplaints = complaints.length;
  const statusCounts = complaints.reduce((acc, complaint) => {
    acc[complaint.status] = (acc[complaint.status] || 0) + 1;
    return acc;
  }, {} as Record<ComplaintStatus, number>);

  const newComplaints = statusCounts.new || 0;
  const inProgress = statusCounts.in_progress || 0;
  const resolved = statusCounts.resolved || 0;
  const rejected = statusCounts.rejected || 0;
  const pendingInfo = statusCounts.pending_user_info || 0;

  const pendingTotal = newComplaints + inProgress + pendingInfo;
  const resolutionRate = totalComplaints > 0 ? ((resolved + rejected) / totalComplaints * 100) : 0;

  const stats = [
    {
      title: 'Total Complaints',
      value: totalComplaints,
      icon: '📋',
      color: 'text-gray-600'
    },
    {
      title: 'Pending Action',
      value: pendingTotal,
      icon: '⏳',
      color: 'text-orange-600'
    },
    {
      title: 'Resolved',
      value: resolved,
      icon: '✅',
      color: 'text-green-600'
    },
    {
      title: 'Resolution Rate',
      value: `${resolutionRate.toFixed(1)}%`,
      icon: '📊',
      color: 'text-blue-600'
    }
  ];

  const statusBreakdown = [
    { label: 'New', count: newComplaints, color: 'bg-blue-100 text-blue-800' },
    { label: 'In Progress', count: inProgress, color: 'bg-yellow-100 text-yellow-800' },
    { label: 'Pending Info', count: pendingInfo, color: 'bg-orange-100 text-orange-800' },
    { label: 'Resolved', count: resolved, color: 'bg-green-100 text-green-800' },
    { label: 'Rejected', count: rejected, color: 'bg-red-100 text-red-800' }
  ];

  return (
    <div className="space-y-6">
      {/* Main Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{stat.icon}</span>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            📊 Status Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {statusBreakdown.map((status) => (
              <div key={status.label} className="text-center">
                <div className={`rounded-lg p-3 ${status.color}`}>
                  <div className="text-xl font-bold">{status.count}</div>
                  <div className="text-sm font-medium">{status.label}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}