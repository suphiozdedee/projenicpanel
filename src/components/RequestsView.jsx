import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { collection, query, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import RequestCard from '@/components/RequestCard';
import CreateRequestDialog from '@/components/CreateRequestDialog';

function RequestsView({ userRole }) {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const requestsRef = collection(db, 'requests');
    const unsubscribe = onSnapshot(query(requestsRef), (snapshot) => {
      const requestsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRequests(requestsList);
      setFilteredRequests(requestsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let filtered = requests;

    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(request => request.status === filterStatus);
    }

    setFilteredRequests(filtered);
  }, [searchTerm, filterStatus, requests]);

  const handleCreateRequest = async (requestData) => {
    try {
      await addDoc(collection(db, 'requests'), {
        ...requestData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      toast({
        title: "Request Submitted",
        description: "Your request has been submitted successfully.",
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateRequest = async (requestId, updates) => {
    try {
      await updateDoc(doc(db, 'requests', requestId), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      toast({
        title: "Request Updated",
        description: "Request has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update request. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-500 focus:ring-orange-500/20"
            />
          </div>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-orange-500 focus:ring-orange-500/20 outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_review">In Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-400 mb-2">No requests found</p>
          <p className="text-slate-500 text-sm">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRequests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <RequestCard 
                request={request} 
                onUpdate={handleUpdateRequest}
                userRole={userRole}
              />
            </motion.div>
          ))}
        </div>
      )}

      <CreateRequestDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateRequest}
      />
    </div>
  );
}

export default RequestsView;