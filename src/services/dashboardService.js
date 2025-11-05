// services/dashboardService.js - UPDATED
import api from './api';

export const dashboardService = {
  // Admin Dashboard Data
  getAdminDashboardData: async () => {
    try {
      const requests = [
        api.get('/admin/pending-users-count').catch(() => ({ pending_count: 0 })),
        api.get('/incidents/stats').catch(() => ({ stats: {} })),
        api.get('/admin/barangays/population-data').catch(() => ({ barangays: [], total_barangays: 0 })),
        api.get('/analytics/municipal').catch(() => ({ data: {} })),
        api.get('/notifications?limit=5').catch(() => ({ notifications: [] })),
        api.get('/incidents?limit=5').catch(() => ({ incidents: [] }))
      ];

      const [
        pendingUsersRes,
        incidentsRes,
        barangaysRes,
        analyticsRes,
        notificationsRes,
        recentIncidentsRes
      ] = await Promise.all(requests);

      return {
        pendingApprovals: pendingUsersRes.pending_count || 0,
        totalBarangays: barangaysRes.total_barangays || 0,
        activeIncidents: incidentsRes.stats?.total || 0,
        highCriticalIncidents: incidentsRes.stats?.high_critical || 0,
        barangays: barangaysRes.barangays || [],
        analytics: analyticsRes.data || {},
        recentNotifications: notificationsRes.notifications || [],
        recentIncidents: recentIncidentsRes.incidents || []
      };
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      return {
        pendingApprovals: 0,
        totalBarangays: 0,
        activeIncidents: 0,
        highCriticalIncidents: 0,
        barangays: [],
        analytics: {},
        recentNotifications: [],
        recentIncidents: []
      };
    }
  },

  // Barangay Dashboard Data - ENHANCED
  getBarangayDashboardData: async () => {
    try {
      const requests = [
        api.get('/incidents/stats').catch(() => ({ stats: {} })),
        api.get('/population/barangay-overview').catch(() => ({ data: {} })),
        api.get('/analytics/barangay').catch(() => ({ data: {} })),
        api.get('/notifications?limit=5').catch(() => ({ notifications: [] })),
        api.get('/incidents?limit=10').catch(() => ({ incidents: [] })) // Get more incidents for filtering
      ];

      const [
        incidentsRes,
        populationRes,
        analyticsRes,
        notificationsRes,
        incidentsListRes
      ] = await Promise.all(requests);

      // Calculate additional statistics
      const recentIncidents = incidentsListRes.incidents || [];
      const highSeverityIncidents = recentIncidents.filter(
        incident => incident.severity === 'High' || incident.severity === 'Critical'
      );

      return {
        incidents: incidentsRes.stats || {},
        population: populationRes.data || {},
        analytics: analyticsRes.data || {},
        recentNotifications: notificationsRes.notifications || [],
        recentIncidents: recentIncidents.slice(0, 5), // Show only 5 most recent
        highSeverityIncidents: highSeverityIncidents.length
      };
    } catch (error) {
      console.error('Error fetching barangay dashboard data:', error);
      return {
        incidents: {},
        population: {},
        analytics: {},
        recentNotifications: [],
        recentIncidents: [],
        highSeverityIncidents: 0
      };
    }
  },

  // Get recent incidents for barangay
  getRecentIncidents: async () => {
    try {
      const response = await api.get('/incidents?limit=5');
      return response.incidents || response.data?.incidents || [];
    } catch (error) {
      console.error('Error fetching recent incidents:', error);
      return [];
    }
  },

  // Mark notification as read
  markNotificationAsRead: async (notificationId) => {
    try {
      await api.post(`/notifications/${notificationId}/read`);
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }
};