import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/utils/trpc';
import { ComplaintCard } from '@/components/ComplaintCard';
import { ComplaintForm } from '@/components/ComplaintForm';
import { ComplaintStats } from '@/components/ComplaintStats';
import { ComplaintFilters } from '@/components/ComplaintFilters';
import { useState, useEffect, useCallback } from 'react';
import type { Complaint, CreateComplaintInput, ComplaintStatus } from '../../server/src/schema';



function App() {
  // State management
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [customerComplaints, setCustomerComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [isLoadingComplaints, setIsLoadingComplaints] = useState(true);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);
  
  // Admin filtering state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all');



  // Load all complaints for admin view
  const loadAllComplaints = useCallback(async () => {
    setIsLoadingComplaints(true);
    try {
      const result = await trpc.getAllComplaints.query();
      setComplaints(result);
    } catch (error) {
      console.error('Failed to load complaints:', error);
    } finally {
      setIsLoadingComplaints(false);
    }
  }, []);

  // Load complaints by email for customer view
  const loadCustomerComplaints = useCallback(async (email: string) => {
    if (!email.trim()) {
      setCustomerComplaints([]);
      return;
    }
    
    setIsLoadingCustomer(true);
    try {
      const result = await trpc.getComplaintsByEmail.query({ customer_email: email });
      setCustomerComplaints(result);
    } catch (error) {
      console.error('Failed to load customer complaints:', error);
      setCustomerComplaints([]);
    } finally {
      setIsLoadingCustomer(false);
    }
  }, []);

  // Initial load of admin complaints
  useEffect(() => {
    loadAllComplaints();
  }, [loadAllComplaints]);

  // Submit new complaint
  const handleSubmitComplaint = async (formData: CreateComplaintInput) => {
    setIsLoading(true);
    setSubmitMessage('');
    
    try {
      const response = await trpc.createComplaint.mutate(formData);
      setComplaints((prev: Complaint[]) => [response, ...prev]);
      
      // If this customer's complaints are currently displayed, update them too
      if (customerEmail === formData.customer_email) {
        setCustomerComplaints((prev: Complaint[]) => [response, ...prev]);
      }
      
      setSubmitMessage('✅ Complaint submitted successfully! You can track its status using your email.');
    } catch (error) {
      console.error('Failed to create complaint:', error);
      setSubmitMessage('❌ Failed to submit complaint. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update complaint status (admin)
  const handleStatusUpdate = async (complaintId: number, newStatus: ComplaintStatus) => {
    try {
      const response = await trpc.updateComplaintStatus.mutate({
        id: complaintId,
        status: newStatus
      });
      
      // Update in admin complaints list
      setComplaints((prev: Complaint[]) => 
        prev.map((complaint: Complaint) => 
          complaint.id === complaintId ? response : complaint
        )
      );
      
      // Update in customer complaints list if displayed
      setCustomerComplaints((prev: Complaint[]) => 
        prev.map((complaint: Complaint) => 
          complaint.id === complaintId ? response : complaint
        )
      );
    } catch (error) {
      console.error('Failed to update complaint status:', error);
    }
  };

  // Handle customer email lookup
  const handleCustomerLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    await loadCustomerComplaints(customerEmail);
  };

  // Filter complaints based on search term and status
  const filteredComplaints = complaints.filter((complaint: Complaint) => {
    const matchesSearch = searchTerm === '' || 
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.customer_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔧 Electronics Support Center
          </h1>
          <p className="text-gray-600">
            Submit complaints about electronics components and track their resolution status
          </p>
        </div>

        <Tabs defaultValue="submit" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="submit">Submit Complaint</TabsTrigger>
            <TabsTrigger value="track">Track My Complaints</TabsTrigger>
            <TabsTrigger value="admin">Admin Dashboard</TabsTrigger>
          </TabsList>

          {/* Submit Complaint Tab */}
          <TabsContent value="submit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>📝 Submit New Complaint</CardTitle>
                <CardDescription>
                  Please provide detailed information about your electronics component issue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ComplaintForm
                  onSubmit={handleSubmitComplaint}
                  isLoading={isLoading}
                  message={submitMessage}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Track Complaints Tab */}
          <TabsContent value="track" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>🔍 Track Your Complaints</CardTitle>
                <CardDescription>
                  Enter your email address to view all your submitted complaints
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCustomerLookup} className="flex gap-4 mb-6 max-w-md">
                  <Input
                    type="email"
                    placeholder="your.email@company.com"
                    value={customerEmail}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setCustomerEmail(e.target.value)
                    }
                    required
                    className="form-input"
                  />
                  <Button type="submit" disabled={isLoadingCustomer} className="enhanced-button">
                    {isLoadingCustomer ? (
                      <span className="flex items-center gap-2">
                        <div className="spinner"></div>
                        Searching...
                      </span>
                    ) : (
                      '🔍 Search'
                    )}
                  </Button>
                </form>

                {customerComplaints.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    {customerEmail ? 'No complaints found for this email address.' : 'Enter your email address to view your complaints.'}
                  </p>
                ) : (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">
                      Found {customerComplaints.length} complaint{customerComplaints.length !== 1 ? 's' : ''}
                    </h3>
                    {customerComplaints.map((complaint: Complaint) => (
                      <ComplaintCard
                        key={complaint.id}
                        complaint={complaint}
                        isAdmin={false}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Dashboard Tab */}
          <TabsContent value="admin" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>⚙️ Admin Dashboard</CardTitle>
                <CardDescription>
                  Manage all customer complaints and update their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingComplaints ? (
                  <div className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <div className="spinner"></div>
                      <span>Loading complaints...</span>
                    </div>
                  </div>
                ) : complaints.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No complaints submitted yet.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {/* Statistics Dashboard */}
                    <ComplaintStats complaints={complaints} />

                    {/* Search and Filter */}
                    <ComplaintFilters
                      searchTerm={searchTerm}
                      onSearchChange={setSearchTerm}
                      statusFilter={statusFilter}
                      onStatusFilterChange={setStatusFilter}
                      onClear={handleClearFilters}
                    />

                    {/* Complaints List */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center flex-wrap gap-4">
                        <div>
                          <h3 className="font-semibold text-lg">
                            All Complaints 
                            {filteredComplaints.length !== complaints.length ? (
                              <span className="text-sm font-normal text-gray-600">
                                ({filteredComplaints.length} of {complaints.length})
                              </span>
                            ) : (
                              <span className="text-sm font-normal text-gray-600">
                                ({complaints.length})
                              </span>
                            )}
                          </h3>
                          {(searchTerm || statusFilter !== 'all') && (
                            <p className="text-sm text-gray-500">
                              Filtered results - {filteredComplaints.length === 0 ? 'no matches found' : `${filteredComplaints.length} complaints shown`}
                            </p>
                          )}
                        </div>
                        <Button 
                          variant="outline" 
                          onClick={loadAllComplaints}
                          className="text-sm enhanced-button"
                        >
                          🔄 Refresh
                        </Button>
                      </div>

                      {filteredComplaints.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          {searchTerm || statusFilter !== 'all' ? (
                            <div>
                              <p className="text-lg mb-2">🔍 No complaints match your filters</p>
                              <p>Try adjusting your search terms or filters</p>
                            </div>
                          ) : (
                            <p>No complaints found</p>
                          )}
                        </div>
                      ) : (
                        <div className="grid gap-4">
                          {filteredComplaints.map((complaint: Complaint) => (
                            <ComplaintCard
                              key={complaint.id}
                              complaint={complaint}
                              isAdmin={true}
                              onStatusUpdate={handleStatusUpdate}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;