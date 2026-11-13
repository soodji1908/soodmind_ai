'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { RefreshCw, Plus, Trash2, Search, Pencil, Eye, X, BriefcaseBusiness, Building2, FileText, Users, CalendarDays, LifeBuoy, ClipboardList, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Field = { name: string; label: string; type?: string; required?: boolean; placeholder?: string };
type PropertyOption = { _id: string; title: string; location?: { city?: string; address?: string } };
type ModuleConfig = { title: string; description: string; fields: Field[]; readOnly?: boolean; noCreate?: boolean };

const MODULES: Record<string, Record<string, ModuleConfig>> = {
  estate: {
    properties: { title: 'Property portfolio', description: 'Create and manage your property inventory, listing status and asking prices.', fields: [
      { name: 'title', label: 'Property title', required: true }, { name: 'propertyType', label: 'Property type', required: true, placeholder: 'Apartment, house, land…' },
      { name: 'price', label: 'Asking price', type: 'number', required: true }, { name: 'areaSqft', label: 'Area (sq ft)', type: 'number', required: true },
      { name: 'address', label: 'Street address', required: true }, { name: 'city', label: 'City', required: true },
      { name: 'latitude', label: 'Latitude (optional)', type: 'number' }, { name: 'longitude', label: 'Longitude (optional)', type: 'number' },
      { name: 'status', label: 'Status', placeholder: 'for_sale / for_rent / sold / off_market' }, { name: 'description', label: 'Description', type: 'textarea' },
    ] },
    leads: { title: 'Lead CRM', description: 'Track prospective buyers, sellers and investor enquiries through your sales pipeline.', fields: [
      { name: 'name', label: 'Contact name', required: true }, { name: 'email', label: 'Email' }, { name: 'phone', label: 'Phone' },
      { name: 'source', label: 'Lead source', placeholder: 'Website, referral, walk-in…' }, { name: 'budget', label: 'Budget', type: 'number' }, { name: 'notes', label: 'Notes', type: 'textarea' },
    ] },
    appointments: { title: 'Property appointments', description: 'Schedule and track property visits and client meetings.', fields: [
      { name: 'propertyId', label: 'Select property', type: 'property-select', required: true }, { name: 'scheduledAt', label: 'Date and time', type: 'datetime-local', required: true }, { name: 'notes', label: 'Notes', type: 'textarea' },
    ] },
    enquiries: { title: 'Property enquiries', description: 'Manage enquiries submitted against your property listings.', fields: [
      { name: 'propertyId', label: 'Select property', type: 'property-select', required: true }, { name: 'name', label: 'Enquirer name', required: true }, { name: 'email', label: 'Email', required: true }, { name: 'phone', label: 'Phone' }, { name: 'message', label: 'Message', type: 'textarea', required: true },
    ] },
    tickets: { title: 'Support centre', description: 'Open and track support requests for your workspace.', fields: [ { name: 'subject', label: 'Subject', required: true }, { name: 'description', label: 'Describe the issue', type: 'textarea', required: true }, { name: 'priority', label: 'Priority', placeholder: 'low / medium / high / urgent' } ] },
  },
  career: {
    resumes: { title: 'Resume library', description: 'Store resume text and manage versions for analysis and job matching.', fields: [ { name: 'fileName', label: 'Resume name' }, { name: 'fileType', label: 'File type', placeholder: 'pdf, docx, text…' }, { name: 'rawText', label: 'Resume text', type: 'textarea', required: true } ] },
    applications: { title: 'Job applications', description: 'Keep a live record of roles, employers and application outcomes.', fields: [ { name: 'company', label: 'Company', required: true }, { name: 'position', label: 'Position', required: true }, { name: 'status', label: 'Status', placeholder: 'saved / applied / interview / offer / rejected / accepted' }, { name: 'appliedAt', label: 'Applied date', type: 'date' }, { name: 'notes', label: 'Notes', type: 'textarea' } ] },
    interviews: { title: 'Interview practice', description: 'Create interview sessions and save question sets for preparation.', fields: [ { name: 'role', label: 'Target role', required: true }, { name: 'questions', label: 'Questions (one per line)', type: 'textarea' } ] },
    tickets: { title: 'Support centre', description: 'Open and track support requests for your workspace.', fields: [ { name: 'subject', label: 'Subject', required: true }, { name: 'description', label: 'Describe the issue', type: 'textarea', required: true }, { name: 'priority', label: 'Priority' } ] },
  },
  recruiter: {
    tickets: { title: 'Support centre', description: 'Open and track support requests for your workspace.', fields: [ { name: 'subject', label: 'Subject', required: true }, { name: 'description', label: 'Describe the issue', type: 'textarea', required: true }, { name: 'priority', label: 'Priority' } ] },
    jobs: { title: 'Job vacancies', description: 'Publish and manage your hiring pipeline, role requirements and compensation bands.', fields: [ { name: 'title', label: 'Job title', required: true }, { name: 'company', label: 'Company', required: true }, { name: 'location', label: 'Location' }, { name: 'jobType', label: 'Job type', placeholder: 'full_time / part_time / contract / remote / hybrid' }, { name: 'salaryMin', label: 'Minimum salary', type: 'number' }, { name: 'salaryMax', label: 'Maximum salary', type: 'number' }, { name: 'description', label: 'Job description', type: 'textarea', required: true }, { name: 'requirements', label: 'Requirements (one per line)', type: 'textarea' } ] },
  },
  admin: {
    users: { title: 'User directory', description: 'Review platform accounts and account status. Sensitive credentials are never exposed.', fields: [], readOnly: true, noCreate: true },
    adminTickets: { title: 'Support operations', description: 'Review and update support tickets across all portals.', fields: [], readOnly: false, noCreate: true },
    audit: { title: 'Audit log', description: 'Review recent administrative and system activity.', fields: [], readOnly: true, noCreate: true },
    allProperties: { title: 'Global property inventory', description: 'Review and moderate property records across all client accounts.', fields: [ { name: 'title', label: 'Property title', required: true }, { name: 'propertyType', label: 'Property type', required: true }, { name: 'price', label: 'Price', type: 'number', required: true }, { name: 'areaSqft', label: 'Area (sq ft)', type: 'number', required: true }, { name: 'address', label: 'Address', required: true }, { name: 'city', label: 'City', required: true }, { name: 'description', label: 'Description', type: 'textarea' } ] },
    subscriptions: { title: 'Subscription management', description: 'Manage client plans, subscription lifecycle and billing status. Payment collection must be connected to a payment provider.', fields: [ { name: 'userId', label: 'User ID', required: true }, { name: 'plan', label: 'Plan', required: true, placeholder: 'free / starter / pro / enterprise' }, { name: 'status', label: 'Status', required: true, placeholder: 'active / cancelled / expired / past_due' }, { name: 'price', label: 'Plan price', type: 'number', required: true }, { name: 'currency', label: 'Currency', placeholder: 'INR' }, { name: 'startDate', label: 'Start date', type: 'date' }, { name: 'endDate', label: 'End date', type: 'date' } ] },
    payments: { title: 'Payment ledger', description: 'Read-only ledger of payment records. Do not create or mark payments as successful manually.', fields: [], readOnly: true, noCreate: true },
    organizations: { title: 'Organizations', description: 'Manage brokerages, agencies and client organizations.', fields: [ { name: 'name', label: 'Organization name', required: true }, { name: 'slug', label: 'Unique URL slug', required: true }, { name: 'industry', label: 'Industry' }, { name: 'website', label: 'Website' } ] },
  },
};

const ICONS: Record<string, typeof Building2> = { properties: Building2, leads: Users, appointments: CalendarDays, enquiries: ClipboardList, resumes: FileText, applications: BriefcaseBusiness, interviews: CalendarDays, jobs: BriefcaseBusiness, tickets: LifeBuoy, users: Users, adminTickets: LifeBuoy, audit: ClipboardList, allProperties: Building2, subscriptions: CreditCard, payments: CreditCard, organizations: BriefcaseBusiness };

export function WorkspacePage({ portal, resource }: { portal: string; resource: string }) {
  const config = MODULES[portal]?.[resource];
  const [items, setItems] = useState<any[]>([]);
  const [propertyOptions, setPropertyOptions] = useState<PropertyOption[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedResumeId, setExpandedResumeId] = useState<string | null>(null);
  const Icon = ICONS[resource] || ClipboardList;

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch(`/api/workspace/${resource}`, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to load records.');
      setItems(data.items || []);
      if (portal === 'estate' && ['enquiries', 'appointments'].includes(resource)) {
        const propertyResponse = await fetch('/api/workspace/properties', { cache: 'no-store' });
        const propertyData = await propertyResponse.json();
        if (!propertyResponse.ok) throw new Error(propertyData.message || 'Unable to load your properties.');
        setPropertyOptions((propertyData.items || []).map((property: any) => ({ _id: String(property._id), title: property.title, location: property.location })));
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load records.'); }
    finally { setLoading(false); }
  }, [resource]);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => items.filter((item) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase())), [items, query]);

  async function submit(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError('');
    const payload: Record<string, any> = { ...values };
    for (const field of config.fields) {
      if (field.type === 'number' && payload[field.name] !== '') payload[field.name] = Number(payload[field.name]);
      if (field.name === 'questions' || field.name === 'requirements') payload[field.name] = (payload[field.name] || '').split('\n').map((v: string) => v.trim()).filter(Boolean);
    }
    try {
      const response = await fetch(`/api/workspace/${resource}`, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId ? { ...payload, id: editingId } : payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not save this record.');
      setValues({}); setEditingId(null); setShowForm(false); await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save this record.'); }
    finally { setSaving(false); }
  }


  function startEdit(item: any) {
    const next: Record<string, string> = {};
    for (const field of config?.fields || []) {
      const value = item[field.name];
      next[field.name] = Array.isArray(value) ? value.join('\n') : value == null ? '' : String(value);
    }
    setValues(next);
    setEditingId(String(item._id));
    setShowForm(true);
    setError('');
  }

  async function updateStatus(id: string, status: string) {
    try { const response = await fetch(`/api/workspace/${resource}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) }); const data = await response.json(); if (!response.ok) throw new Error(data.message || 'Update failed.'); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Update failed.'); }
  }

  async function toggleUser(item: any) {
    try { const response = await fetch(`/api/workspace/${resource}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item._id, isActive: !item.isActive }) }); const data = await response.json(); if (!response.ok) throw new Error(data.message || 'Update failed.'); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Update failed.'); }
  }

  async function remove(id: string) {
    if (!window.confirm('Delete this record permanently?')) return;
    try { const response = await fetch(`/api/workspace/${resource}?id=${encodeURIComponent(id)}`, { method: 'DELETE' }); const data = await response.json(); if (!response.ok) throw new Error(data.message); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Delete failed.'); }
  }

  if (!config) return <div className="rounded-2xl border bg-card p-8"><h1 className="text-xl font-semibold">Module not found</h1><p className="mt-2 text-sm text-muted-foreground">This module is not enabled for this portal.</p></div>;

  return <div className="space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-start gap-4"><div className="rounded-xl bg-primary/10 p-3 text-primary"><Icon className="h-6 w-6" /></div><div><p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Workspace module</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">{config.title}</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">{config.description}</p></div></div><div className="flex gap-2"><Button variant="outline" onClick={() => void load()} disabled={loading}><RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Refresh</Button>{!config.noCreate && <Button onClick={() => { if (showForm) { setShowForm(false); setEditingId(null); setValues({}); } else { setEditingId(null); setValues({}); setShowForm(true); } }}><Plus className="mr-2 h-4 w-4" />New record</Button>}</div></div>
    {error && <div role="alert" className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">{error}</div>}
    {showForm && <form onSubmit={submit} className="rounded-2xl border bg-card p-5 shadow-sm"><h2 className="mb-4 text-lg font-semibold">{editingId ? 'Edit' : 'Create'} {config.title.toLowerCase().replace(/s$/, '')}</h2>{['enquiries','appointments'].includes(resource) && <p className="mb-4 text-sm text-muted-foreground">Choose a property from your saved property portfolio. Property IDs are selected automatically.</p>}<div className="grid gap-4 md:grid-cols-2">{config.fields.map((field) => <label key={field.name} className={`space-y-1.5 text-sm ${field.type === 'textarea' ? 'md:col-span-2' : ''}`}><span className="font-medium">{field.label}{field.required ? ' *' : ''}</span>{field.type === 'textarea' ? <textarea required={field.required} rows={4} value={values[field.name] || ''} onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))} className="w-full rounded-lg border bg-background px-3 py-2" placeholder={field.placeholder || field.label} /> : field.type === 'property-select' ? <select required={field.required} value={values[field.name] || ''} onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))} className="h-10 w-full rounded-lg border bg-background px-3"><option value="">Choose one of your properties</option>{propertyOptions.map((property) => <option key={property._id} value={property._id}>{property.title}{property.location?.city ? ` — ${property.location.city}` : ''}</option>)}</select> : <input required={field.required} type={field.type || 'text'} value={values[field.name] || ''} onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))} className="h-10 w-full rounded-lg border bg-background px-3" placeholder={field.placeholder || field.label} />}</label>)}</div>{['enquiries','appointments'].includes(resource) && propertyOptions.length === 0 && <p className="mt-3 text-sm text-amber-700">No saved properties found. Add a property in Property Portfolio first, then refresh this page.</p>}<div className="mt-5 flex gap-2"><Button type="submit" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Update record' : 'Save record'}</Button><Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); setValues({}); }}>Cancel</Button></div></form>}
    <div className="flex items-center gap-3 rounded-xl border bg-card px-3"><Search className="h-4 w-4 text-muted-foreground"/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search records…" className="h-11 flex-1 bg-transparent text-sm outline-none"/><span className="text-xs text-muted-foreground">{filtered.length} records</span></div>
    <div className="overflow-hidden rounded-2xl border bg-card">{loading ? <div className="p-10 text-center text-sm text-muted-foreground">Loading workspace data…</div> : filtered.length === 0 ? <div className="p-12 text-center"><Icon className="mx-auto h-9 w-9 text-muted-foreground/50"/><h2 className="mt-3 font-semibold">No records yet</h2><p className="mt-1 text-sm text-muted-foreground">Create your first record to start using this module.</p></div> : <div className="divide-y">{filtered.map((item) => <div key={item._id} className="flex items-start justify-between gap-4 p-4"><div className="min-w-0"><p className="truncate font-medium">{item.title || item.fileName || item.name || item.subject || item.position || item.role || item.fullName || item.number || item.email || item.action || 'Record'}</p><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.description || item.message || item.notes || item.company || item.email || item.status || (item.createdAt ? new Date(item.createdAt).toLocaleString() : '')}</p><div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">{item.status && <><span className="rounded-full bg-muted px-2 py-1">{item.status}</span>{!config.readOnly && ['leads','appointments','enquiries','applications','interviews','jobs','adminTickets','tickets'].includes(resource) && <select aria-label="Update status" value={item.status} onChange={(e) => void updateStatus(item._id, e.target.value)} className="rounded-full border bg-background px-2 py-1 text-xs">{(resource === 'leads' ? ['new','contacted','qualified','converted','lost'] : resource === 'appointments' ? ['scheduled','completed','cancelled','no_show'] : resource === 'enquiries' ? ['new','responded','closed'] : resource === 'applications' ? ['saved','applied','interview','offer','rejected','accepted'] : resource === 'interviews' ? ['scheduled','in_progress','completed'] : resource === 'jobs' ? ['draft','active','closed','filled'] : ['open','in_progress','resolved','closed']).map((status) => <option key={status} value={status}>{status.replace('_',' ')}</option>)}</select>}</>}{item.price != null && <span>{Number(item.price).toLocaleString()} {item.currency || ''}</span>}{item.location?.city && <span>{item.location.city}</span>}{item.createdAt && <span>{new Date(item.createdAt).toLocaleDateString()}</span>}</div></div>{resource === 'resumes' && <Button size="sm" variant="outline" onClick={() => setExpandedResumeId(expandedResumeId === item._id ? null : item._id)}><Eye className="mr-2 h-4 w-4"/> {expandedResumeId === item._id ? 'Hide' : 'View'}</Button>}{resource === 'users' && <Button size="sm" variant="outline" onClick={() => void toggleUser(item)}>{item.isActive ? 'Deactivate' : 'Activate'}</Button>}{!config.readOnly && <><Button size="icon" variant="ghost" aria-label="Edit record" onClick={() => startEdit(item)}><Pencil className="h-4 w-4"/></Button><Button size="icon" variant="ghost" className="shrink-0 text-destructive" aria-label="Delete record" onClick={() => void remove(item._id)}><Trash2 className="h-4 w-4"/></Button></>}{resource === 'resumes' && expandedResumeId === item._id && <div className="mt-4 rounded-xl border bg-muted/40 p-4"><div className="mb-2 flex items-center justify-between"><p className="text-sm font-semibold">Resume content</p><Button size="icon" variant="ghost" aria-label="Close resume preview" onClick={() => setExpandedResumeId(null)}><X className="h-4 w-4"/></Button></div><p className="mb-2 text-xs text-muted-foreground">{item.fileName || 'Untitled resume'} · {item.fileType || 'Text'}</p>{item.fileType && item.fileType !== 'text' && <a href={`/api/workspace/resumes/${encodeURIComponent(item._id)}/file`} target="_blank" rel="noreferrer" className="mb-3 inline-flex rounded-lg border bg-background px-3 py-2 text-sm font-medium hover:bg-muted">Open / download original file</a>}<pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words text-sm">{item.rawText || 'No resume text saved.'}</pre></div>}</div>)}</div>}</div>
  </div>;
}
