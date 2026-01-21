import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, CheckCircle2, AlertCircle, Users, Briefcase, Palette, Zap } from 'lucide-react';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import StatCard from '@/components/StatCard';
import RecentActivity from '@/components/RecentActivity';
import ProjectStatusChart from '@/components/ProjectStatusChart';

function DashboardOverview({ userRole }) {
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    pendingRequests: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const projectsRef = collection(db, 'projects');
    const requestsRef = collection(db, 'requests');

    const unsubscribeProjects = onSnapshot(query(projectsRef), (snapshot) => {
      const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setStats(prev => ({
        ...prev,
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'in_progress').length,
        completedProjects: projects.filter(p => p.status === 'completed').length,
      }));

      setRecentProjects(projects.slice(0, 5));
      setLoading(false);
    });

    const unsubscribeRequests = onSnapshot(query(requestsRef, where('status', '==', 'pending')), (snapshot) => {
      setStats(prev => ({
        ...prev,
        pendingRequests: snapshot.docs.length
      }));
    });

    return () => {
      unsubscribeProjects();
      unsubscribeRequests();
    };
  }, []);

  const statCards = [
    {
      title: 'Total Projects',
      value: stats.totalProjects,
      icon: Briefcase,
      color: 'from-blue-500 to-blue-600',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      icon: Zap,
      color: 'from-orange-500 to-orange-600',
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Completed',
      value: stats.completedProjects,
      icon: CheckCircle2,
      color: 'from-green-500 to-green-600',
      change: '+15%',
      trend: 'up'
    },
    {
      title: 'Pending Requests',
      value: stats.pendingRequests,
      icon: AlertCircle,
      color: 'from-amber-500 to-amber-600',
      change: '-5%',
      trend: 'down'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProjectStatusChart />
        </div>
        <div>
          <RecentActivity projects={recentProjects} />
        </div>
      </div>

      {userRole === 'admin' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/30 rounded-xl p-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Admin Quick Actions</h3>
              <p className="text-slate-400 text-sm mb-4">Manage team members, assign projects, and oversee workflow</p>
              <div className="flex flex-wrap gap-3">
                <button className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-400 rounded-lg text-sm font-medium transition-all duration-300">
                  Manage Users
                </button>
                <button className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-slate-300 rounded-lg text-sm font-medium transition-all duration-300">
                  View Reports
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default DashboardOverview;