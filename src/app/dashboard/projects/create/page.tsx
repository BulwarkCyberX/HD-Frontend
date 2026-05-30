'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, Input, Textarea } from '@hackersdeal/ui';
import { useAuth } from '@/hooks/auth-context';
import { ApiError } from '@/lib/api/auth';
import { aiSuggestScope } from '@/lib/api/ai';
import { createProject } from '@/lib/api/projects';
import { linkOrganizationProject, listMyOrganizations, type OrganizationSummary } from '@/lib/api/organizations';

const assetSchema = z.object({
  type: z.enum(['DOMAIN', 'URL', 'IP']),
  value: z.string().min(2, 'Asset value is required'),
});

const projectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  assets: z.array(assetSchema).min(1, 'At least one asset is required'),
  inScopeRaw: z.string().min(2, 'At least one in-scope item is required'),
  outOfScopeRaw: z.string().optional(),
  testingWindow: z.string().min(3, 'Testing window is required'),
  timeline: z.string().min(3, 'Timeline is required'),
  budgetType: z.enum(['FIXED', 'HOURLY', 'MILESTONE']),
  budgetAmount: z.number().min(1, 'Budget amount must be greater than 0'),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'INVITE_ONLY']),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

function toScopeArray(value: string | undefined) {
  if (!value) return [];
  return value
    .split(/\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export default function CreateProjectPage() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [serverError, setServerError] = useState('');
  const [serverSuccess, setServerSuccess] = useState('');
  const [aiScopeBusy, setAiScopeBusy] = useState(false);
  const [organizations, setOrganizations] = useState<OrganizationSummary[]>([]);
  const [organizationId, setOrganizationId] = useState('');

  useEffect(() => {
    if (!token || user?.role !== 'CLIENT') return;
    void listMyOrganizations(token)
      .then(setOrganizations)
      .catch(() => undefined);
  }, [token, user?.role]);

  const defaultValues = useMemo<ProjectFormValues>(
    () => ({
      title: '',
      description: '',
      assets: [{ type: 'DOMAIN', value: '' }],
      inScopeRaw: '',
      outOfScopeRaw: '',
      testingWindow: '',
      timeline: '',
      budgetType: 'FIXED',
      budgetAmount: 1000,
      visibility: 'PUBLIC',
    }),
    [],
  );

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'assets',
  });

  const descriptionField = watch('description');

  const onSubmit = async (values: ProjectFormValues) => {
    setServerError('');
    setServerSuccess('');

    if (!token) {
      setServerError('You must be authenticated to create a project.');
      return;
    }
    if (user?.role !== 'CLIENT') {
      setServerError('Only CLIENT users can create projects.');
      return;
    }

    const inScope = toScopeArray(values.inScopeRaw);
    const outOfScope = toScopeArray(values.outOfScopeRaw);

    if (inScope.length === 0) {
      setServerError('Add at least one in-scope entry.');
      return;
    }

    try {
      const created = await createProject(token, {
        title: values.title,
        description: values.description,
        assets: values.assets,
        inScope,
        outOfScope,
        testingWindow: values.testingWindow,
        timeline: values.timeline,
        budgetType: values.budgetType,
        budgetAmount: values.budgetAmount,
        visibility: values.visibility,
      });
      if (organizationId) {
        await linkOrganizationProject(token, organizationId, created.id);
      }
      setServerSuccess('Project created successfully.');
      router.push('/projects?created=1');
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message);
        return;
      }
      setServerError(error instanceof Error ? error.message : 'Unable to create project');
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Create Project</h1>
        <p className="mt-2 text-sm text-slate-600">
          Define a clear security scope with assets, testing limits, and budget details.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <Card className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900">1) Basic Info</h2>
          <div className="space-y-1.5">
            <label htmlFor="title" className="text-sm font-medium text-slate-700">
              Title
            </label>
            <Input id="title" {...register('title')} />
            {errors.title ? <p className="text-xs text-rose-600">{errors.title.message}</p> : null}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="description" className="text-sm font-medium text-slate-700">
              Description
            </label>
            <Textarea id="description" rows={4} {...register('description')} />
            {errors.description ? (
              <p className="text-xs text-rose-600">{errors.description.message}</p>
            ) : null}
          </div>
          {organizations.length > 0 ? (
            <div className="space-y-1.5">
              <label htmlFor="organization" className="text-sm font-medium text-slate-700">
                Organization (optional)
              </label>
              <select
                id="organization"
                className="w-full rounded-md border border-tropical-jade-200 bg-white px-3 py-2 text-sm text-slate-900"
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
              >
                <option value="">None</option>
                {organizations.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </Card>

        <Card className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900">2) Assets</h2>
          {fields.map((field, index) => (
            <div key={field.id} className="grid gap-2 rounded-md border border-tropical-jade-100 p-3 sm:grid-cols-3">
              <select
                className="rounded-md border border-tropical-jade-200 bg-white px-3 py-2 text-sm text-slate-900"
                {...register(`assets.${index}.type`)}
              >
                <option value="DOMAIN">Domain</option>
                <option value="URL">URL</option>
                <option value="IP">IP</option>
              </select>
              <Input
                className="sm:col-span-2"
                placeholder="example.com or https://..."
                {...register(`assets.${index}.value`)}
              />
              <div className="sm:col-span-3">
                <button
                  type="button"
                  className="text-xs font-medium text-rose-600 disabled:opacity-50"
                  disabled={fields.length === 1}
                  onClick={() => remove(index)}
                >
                  Remove
                </button>
              </div>
              {errors.assets?.[index]?.value ? (
                <p className="sm:col-span-3 text-xs text-rose-600">
                  {errors.assets[index]?.value?.message}
                </p>
              ) : null}
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            onClick={() => append({ type: 'DOMAIN', value: '' })}
          >
            Add Asset
          </Button>
          {errors.assets ? <p className="text-xs text-rose-600">{errors.assets.message}</p> : null}
        </Card>

        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-900">3) Scope</h2>
            <Button
              type="button"
              variant="secondary"
              disabled={aiScopeBusy || !token || (descriptionField?.length ?? 0) < 10}
              onClick={async () => {
                if (!token) return;
                setAiScopeBusy(true);
                setServerError('');
                try {
                  const res = (await aiSuggestScope(token, descriptionField)) as {
                    inScope?: string[];
                    outOfScope?: string[];
                    notes?: string;
                  };
                  if (res.inScope?.length) setValue('inScopeRaw', res.inScope.join('\n'));
                  if (res.outOfScope?.length) setValue('outOfScopeRaw', res.outOfScope.join('\n'));
                  setServerSuccess(res.notes ? `AI: ${res.notes}` : 'Scope suggestions applied — please review.');
                } catch {
                  setServerError('Could not generate scope suggestions.');
                } finally {
                  setAiScopeBusy(false);
                }
              }}
            >
              {aiScopeBusy ? 'Generating…' : 'Generate scope (AI)'}
            </Button>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="inScopeRaw" className="text-sm font-medium text-slate-700">
              In-scope (one per line)
            </label>
            <Textarea id="inScopeRaw" rows={4} {...register('inScopeRaw')} />
            {errors.inScopeRaw ? (
              <p className="text-xs text-rose-600">{errors.inScopeRaw.message}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="outOfScopeRaw" className="text-sm font-medium text-slate-700">
              Out-of-scope (one per line)
            </label>
            <Textarea id="outOfScopeRaw" rows={3} {...register('outOfScopeRaw')} />
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900">4) Testing Details</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="testingWindow" className="text-sm font-medium text-slate-700">
                Testing Window
              </label>
              <Input id="testingWindow" placeholder="Mon-Fri, 9AM-6PM UTC" {...register('testingWindow')} />
              {errors.testingWindow ? (
                <p className="text-xs text-rose-600">{errors.testingWindow.message}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="timeline" className="text-sm font-medium text-slate-700">
                Timeline
              </label>
              <Input id="timeline" placeholder="2 weeks" {...register('timeline')} />
              {errors.timeline ? (
                <p className="text-xs text-rose-600">{errors.timeline.message}</p>
              ) : null}
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900">5) Budget</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="budgetType" className="text-sm font-medium text-slate-700">
                Budget Type
              </label>
              <select
                id="budgetType"
                className="w-full rounded-md border border-tropical-jade-200 bg-white px-3 py-2 text-sm text-slate-900"
                {...register('budgetType')}
              >
                <option value="FIXED">Fixed</option>
                <option value="HOURLY">Hourly</option>
                <option value="MILESTONE">Milestone</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="budgetAmount" className="text-sm font-medium text-slate-700">
                Budget Amount
              </label>
              <Input
                id="budgetAmount"
                type="number"
                min={1}
                step="0.01"
                {...register('budgetAmount', { valueAsNumber: true })}
              />
              {errors.budgetAmount ? (
                <p className="text-xs text-rose-600">{errors.budgetAmount.message}</p>
              ) : null}
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900">6) Visibility</h2>
          <select
            className="w-full rounded-md border border-tropical-jade-200 bg-white px-3 py-2 text-sm text-slate-900 sm:w-64"
            {...register('visibility')}
          >
            <option value="PUBLIC">Public</option>
            <option value="PRIVATE">Private</option>
            <option value="INVITE_ONLY">Invite-only</option>
          </select>
        </Card>

        {serverError ? <p className="text-sm text-rose-600">{serverError}</p> : null}
        {serverSuccess ? <p className="text-sm text-emerald-700">{serverSuccess}</p> : null}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating project...' : 'Create Project'}
        </Button>
      </form>
    </div>
  );
}
