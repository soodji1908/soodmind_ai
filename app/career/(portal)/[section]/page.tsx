import { WorkspacePage } from '@/components/shared/portal/workspace-page';

export default function CareerWorkspacePage({ params }: { params: { section: string } }) {
  return <WorkspacePage portal="career" resource={params.section} />;
}
