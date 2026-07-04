import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { LoginPage } from '../../features/auth/LoginPage';
import { RegisterPage } from '../../features/auth/RegisterPage';
import { ProtectedRoute } from '../../features/auth/ProtectedRoute';
import { DashboardPage } from '../../features/dashboard/DashboardPage';
import { OrganizationsPage } from '../../features/organizations/OrganizationsPage';
import { ProjectsPage } from '../../features/projects/ProjectsPage';
import { QueuesPage } from '../../features/queues/QueuesPage';
import { JobsPage } from '../../features/jobs/JobsPage';
import { WorkersPage } from '../../features/workers/WorkersPage';
import { LogsPage } from '../../features/logs/LogsPage';
import { RetryPoliciesPage } from '../../features/retryPolicies/RetryPoliciesPage';
import { DeadLetterPage } from '../../features/deadLetter/DeadLetterPage';
import { AnalyticsPage } from '../../features/analytics/AnalyticsPage';
import { SettingsPage } from '../../features/settings/SettingsPage';
import { ErrorBoundary } from '../../components/ui/ErrorBoundary';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage />, errorElement: <ErrorBoundary /> },
  { path: '/register', element: <RegisterPage />, errorElement: <ErrorBoundary /> },
  {
    path: '/',
    element: <ProtectedRoute />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'organizations', element: <OrganizationsPage /> },
          { path: 'projects', element: <ProjectsPage /> },
          { path: 'queues', element: <QueuesPage /> },
          { path: 'jobs', element: <JobsPage /> },
          { path: 'workers', element: <WorkersPage /> },
          { path: 'logs', element: <LogsPage /> },
          { path: 'retry-policies', element: <RetryPoliciesPage /> },
          { path: 'dead-letter', element: <DeadLetterPage /> },
          { path: 'analytics', element: <AnalyticsPage /> },
          { path: 'settings', element: <SettingsPage /> }
        ]
      }
    ]
  }
]);
