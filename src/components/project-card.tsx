import type { ReactNode } from 'react';
import { Badge, Card } from '@hackersdeal/ui';
import type { ProjectItem } from '@/lib/api/projects';

export function ProjectCard({
  project,
  actionSlot,
}: {
  project: ProjectItem;
  actionSlot?: ReactNode;
}) {
  const budgetLabel = project.budgetType === 'HOURLY' ? 'Hourly' : project.budgetType === 'FIXED' ? 'Fixed' : 'Milestone';
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-neutral-50">{project.title}</h3>
          <p className="mt-2 text-sm text-neutral-300">{project.description}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-neutral-400">
            <span>Cost: {budgetLabel}</span>
            <span>|</span>
            <span>
              {project.budgetType === 'HOURLY' ? `₹${project.budgetAmount}/hr` : `₹${project.budgetAmount}`}
            </span>
            <span>|</span>
            <span>Visibility: {project.visibility}</span>
          </div>
        </div>
        <Badge tone={project.status === 'ACTIVE' ? 'success' : 'warning'}>{project.status}</Badge>
      </div>
      {actionSlot ? <div className="mt-4">{actionSlot}</div> : null}
    </Card>
  );
}
