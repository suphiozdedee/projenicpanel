import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Calendar, MoreVertical, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

function RequestCard({ request, onUpdate, userRole }) {
  const { toast } = useToast();

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'from-green-500 to-green-600';
      case 'in_review':
        return 'from-blue-500 to-blue-600';
      case 'pending':
        return 'from-amber-500 to-amber-600';
      case 'rejected':
        return 'from-red-500 to-red-600';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'in_review':
        return 'In Review';
      case 'pending':
        return 'Pending';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  const handleApprove = () => {
    onUpdate(request.id, { status: 'approved' });
  };

  const handleReject = () => {
    onUpdate(request.id, { status: 'rejected' });
  };

  const handleReview = () => {
    onUpdate(request.id, { status: 'in_review' });
  };

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300"
    >
      <div className={`h-2 bg-gradient-to-r ${getStatusColor(request.status)}`}></div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">
              {request.title || 'Untitled Request'}
            </h3>
            <p className="text-slate-400 text-sm line-clamp-2">
              {request.description || 'No description provided'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-white -mt-2 -mr-2"
            onClick={() => toast({
              title: "Request Options",
              description: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
            })}
          >
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Building2 className="w-4 h-4" />
            <span>{request.company || 'No company'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Calendar className="w-4 h-4" />
            <span>{request.eventDate || 'No event date'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
          <span className={`text-xs px-3 py-1 rounded-full bg-gradient-to-r ${getStatusColor(request.status)} text-white font-semibold shadow-lg`}>
            {getStatusLabel(request.status)}
          </span>
          {(userRole === 'admin' || userRole === 'designer') && request.status === 'pending' && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                onClick={handleApprove}
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Approve
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                onClick={handleReview}
              >
                <Clock className="w-4 h-4 mr-1" />
                Review
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default RequestCard;