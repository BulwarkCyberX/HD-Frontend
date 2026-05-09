import { WorkspaceLayout } from '@/components/workspace-layout';

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceLayout requireAuth={false} contentVariant="flush">{children}</WorkspaceLayout>;
}
