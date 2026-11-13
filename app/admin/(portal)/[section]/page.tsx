import { WorkspacePage } from '@/components/shared/portal/workspace-page';

export default function AdminWorkspacePage({ params }: { params: { section: string } }) {
  return <WorkspacePage portal="admin" resource={params.section} />;
}
