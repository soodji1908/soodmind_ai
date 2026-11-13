import { WorkspacePage } from '@/components/shared/portal/workspace-page';

export default function RecruiterWorkspacePage({ params }: { params: { section: string } }) {
  return <WorkspacePage portal="recruiter" resource={params.section} />;
}
