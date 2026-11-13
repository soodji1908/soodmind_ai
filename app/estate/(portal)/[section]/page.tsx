import { WorkspacePage } from '@/components/shared/portal/workspace-page';

export default function EstateWorkspacePage({ params }: { params: { section: string } }) {
  return <WorkspacePage portal="estate" resource={params.section} />;
}
