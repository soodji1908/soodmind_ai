import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { getSessionFromCookies } from '@/lib/services/session';
import { resolvePortalAccess } from '@/lib/auth/access';
import type { PortalKey } from '@/lib/models/PortalMembership';
import { getPlatformSetting } from '@/lib/platform-settings';

import {
  Property,
  Lead,
  Appointment,
  PropertyEnquiry,
  Resume,
  JobApplication,
  InterviewSession,
  JobVacancy,
  SupportTicket,
  User,
  AuditLog,
  Subscription,
  Payment,
  Organization,
} from '@/lib/models';

// Resource configuration
const RESOURCES: Record<string, any> = {
  properties: {
    portal: 'estate',
    model: Property,
    scope: 'ownerUserId',
    fields: [
      'title', 'description', 'propertyType', 'status',
      'price', 'currency', 'areaSqft', 'bedrooms',
      'bathrooms', 'yearBuilt', 'amenities', 'location',
      'latitude', 'longitude',
    ],
    label: 'Property',
  },

  leads: {
    portal: 'estate',
    model: Lead,
    scope: 'agentId',
    fields: [
      'name', 'email', 'phone', 'source',
      'status', 'budget', 'notes',
    ],
    label: 'Lead',
  },

  appointments: {
    portal: 'estate',
    model: Appointment,
    scope: 'agentId',
    fields: [
      'propertyId', 'userId', 'scheduledAt',
      'status', 'notes',
    ],
    label: 'Appointment',
  },

  enquiries: {
    portal: 'estate',
    model: PropertyEnquiry,
    scope: 'userId',
    fields: [
      'propertyId', 'name', 'email',
      'phone', 'message', 'status',
    ],
    label: 'Enquiry',
  },

  resumes: {
    portal: 'career',
    model: Resume,
    scope: 'userId',
    fields: [
      'fileName', 'fileType', 'rawText', 'isActive',
    ],
    label: 'Resume',
  },

  applications: {
    portal: 'career',
    model: JobApplication,
    scope: 'userId',
    fields: [
      'jobVacancyId', 'company', 'position',
      'status', 'appliedAt', 'notes',
    ],
    label: 'Application',
  },

  interviews: {
    portal: 'career',
    model: InterviewSession,
    scope: 'userId',
    fields: [
      'role', 'questions', 'status',
    ],
    label: 'Interview',
  },

  jobs: {
    portal: 'recruiter',
    model: JobVacancy,
    scope: 'recruiterId',
    fields: [
      'title', 'company', 'description',
      'requirements', 'location', 'jobType',
      'salaryMin', 'salaryMax', 'currency', 'status',
    ],
    label: 'Job vacancy',
  },

  tickets: {
    portals: ['estate', 'career', 'recruiter'],
    model: SupportTicket,
    scope: 'userId',
    fields: [
      'subject', 'description', 'priority', 'portal',
    ],
    label: 'Support ticket',
  },

  users: {
    portal: 'admin',
    model: User,
    scope: null,
    fields: [
      'fullName', 'email', 'phone', 'isActive',
    ],
    label: 'User',
  },

  allProperties: {
    portal: 'admin',
    model: Property,
    scope: null,
    fields: [
      'title', 'description', 'propertyType', 'status',
      'price', 'currency', 'areaSqft', 'bedrooms',
      'bathrooms', 'yearBuilt', 'amenities', 'location',
      'latitude', 'longitude',
    ],
    label: 'Platform property',
  },

  subscriptions: {
    portal: 'admin',
    model: Subscription,
    scope: null,
    fields: [
      'plan', 'status', 'startDate', 'endDate',
      'price', 'currency', 'userId',
    ],
    label: 'Subscription',
  },

  payments: {
    portal: 'admin',
    model: Payment,
    scope: null,
    fields: [],
    label: 'Payment',
    readOnly: true,
  },

  organizations: {
    portal: 'admin',
    model: Organization,
    scope: null,
    fields: [
      'name', 'slug', 'industry', 'website',
    ],
    label: 'Organization',
  },

  adminTickets: {
    portal: 'admin',
    model: SupportTicket,
    scope: null,
    fields: [
      'subject', 'description', 'status',
      'priority', 'portal',
    ],
    label: 'Support ticket',
  },

  audit: {
    portal: 'admin',
    model: AuditLog,
    scope: null,
    fields: [],
    label: 'Audit log',
    readOnly: true,
  },
};

// Explicit context type to prevent undefined return inference
type WorkspaceContext =
  | {
      error: NextResponse;
    }
  | {
      config: any;
      userId: string;
      access: NonNullable<
        Awaited<ReturnType<typeof resolvePortalAccess>>
      >;
      portal: string;
    };

// Authentication and authorization
async function getContext(
  resource: string
): Promise<WorkspaceContext> {
  const session = await getSessionFromCookies();

  if (!session) {
    return {
      error: NextResponse.json(
        { message: 'Authentication required.' },
        { status: 401 }
      ),
    };
  }

  const config = RESOURCES[resource];

  if (
    !config ||
    (config.portal && config.portal !== session.portal) ||
    (config.portals && !config.portals.includes(session.portal))
  ) {
    return {
      error: NextResponse.json(
        { message: 'This module is not available in your portal.' },
        { status: 404 }
      ),
    };
  }

  const access = await resolvePortalAccess(
    session.portal as PortalKey
  );

  if (!access) {
    return {
      error: NextResponse.json(
        { message: 'You do not have permission to access this module.' },
        { status: 403 }
      ),
    };
  }

  await connectDB();

  return {
    config,
    userId: session.userId,
    access,
    portal: session.portal,
  };
}

// GET: List records
export async function GET(
  _request: NextRequest,
  context: { params: { resource: string } }
): Promise<NextResponse> {
  try {
    const ctx = await getContext(context.params.resource);

    if ('error' in ctx) {
      return ctx.error;
    }

    const filter: Record<string, unknown> = ctx.config.scope
      ? { [ctx.config.scope]: ctx.userId }
      : {};

    let query = ctx.config.model
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(100);

    if (
      ['enquiries', 'appointments'].includes(
        context.params.resource
      )
    ) {
      query = query.populate('propertyId', 'title location.city');
    }

    const rows = await query
      .select(
        ctx.config.portal === 'admin' &&
        context.params.resource === 'users'
          ? '-passwordHash -emailVerifyToken -emailVerifyExpires -passwordResetToken -passwordResetExpires'
          : undefined
      )
      .lean();

    return NextResponse.json({
      ok: true,
      items: rows,
    });
  } catch (error) {
    console.error('[workspace:list]', error);

    return NextResponse.json(
      { message: 'Could not load records.' },
      { status: 500 }
    );
  }
}

// POST: Create record
export async function POST(
  request: NextRequest,
  context: { params: { resource: string } }
): Promise<NextResponse> {
  try {
    const ctx = await getContext(context.params.resource);

    if ('error' in ctx) {
      return ctx.error;
    }

    if (ctx.config.readOnly) {
      return NextResponse.json(
        { message: 'This module is read-only.' },
        { status: 405 }
      );
    }

    const gates: Record<string, string> = {
      properties: 'allowPropertyListings',
      enquiries: 'allowPropertyEnquiries',
      appointments: 'allowAppointments',
    };

    const gate = gates[context.params.resource];

    if (
      gate &&
      !(await getPlatformSetting<boolean>(gate, true))
    ) {
      return NextResponse.json(
        {
          message:
            'This feature is currently disabled by the platform owner.',
        },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => null);

    if (
      !body ||
      typeof body !== 'object' ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { message: 'A valid JSON object is required.' },
        { status: 422 }
      );
    }

    const payload: Record<string, unknown> = {};

    for (const key of ctx.config.fields) {
      if (body[key] !== undefined) {
        payload[key] = body[key];
      }
    }

    if (ctx.config.scope) {
      payload[ctx.config.scope] = ctx.userId;
    }

    // Property validation
    if (
      ['enquiries', 'appointments'].includes(
        context.params.resource
      )
    ) {
      const propertyId = String(body.propertyId || '');

      if (!mongoose.isValidObjectId(propertyId)) {
        return NextResponse.json(
          {
            message:
              'Please select a valid property from your property portfolio.',
          },
          { status: 422 }
        );
      }

      const property = await Property.findById(propertyId)
        .select('_id ownerUserId title')
        .lean();

      if (!property) {
        return NextResponse.json(
          {
            message:
              'Selected property was not found. Refresh your property list and try again.',
          },
          { status: 404 }
        );
      }

      if (
        context.params.resource === 'enquiries' &&
        String(property.ownerUserId || '') !== String(ctx.userId)
      ) {
        return NextResponse.json(
          {
            message:
              'You can only create enquiries for properties in your own portfolio.',
          },
          { status: 403 }
        );
      }
    }

    if (context.params.resource === 'tickets') {
      payload.portal = ctx.portal;
    }

    // Property location handling
    if (
      context.params.resource === 'properties' ||
      context.params.resource === 'allProperties'
    ) {
      const location: Record<string, unknown> =
        payload.location &&
        typeof payload.location === 'object'
          ? {
              ...(payload.location as Record<string, unknown>),
            }
          : {};

      if (body.address) {
        location.address = String(body.address).slice(0, 300);
      }

      if (body.city) {
        location.city = String(body.city).slice(0, 100);
      }

      if (body.state) {
        location.state = String(body.state).slice(0, 100);
      }

      if (body.country) {
        location.country = String(body.country)
          .slice(0, 2)
          .toUpperCase();
      }

      if (
        body.latitude !== undefined &&
        body.longitude !== undefined &&
        Number.isFinite(Number(body.latitude)) &&
        Number.isFinite(Number(body.longitude))
      ) {
        location.coordinates = {
          lat: Number(body.latitude),
          lng: Number(body.longitude),
        };
      }

      delete payload.latitude;
      delete payload.longitude;

      if (Object.keys(location).length) {
        payload.location = location;
      }
    }

    const created = await ctx.config.model.create(payload);

    await AuditLog.create({
      actorId: ctx.userId,
      action: 'workspace.create',
      entityType: context.params.resource,
      entityId: created._id.toString(),
      metadata: {
        portal: ctx.portal,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        item: created.toObject(),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[workspace:create]', error);

    const message =
      error?.name === 'ValidationError'
        ? error.message
        : 'Could not save this record. Check the required fields.';

    return NextResponse.json(
      { message },
      { status: 422 }
    );
  }
}

// PATCH: Update record
export async function PATCH(
  request: NextRequest,
  context: { params: { resource: string } }
): Promise<NextResponse> {
  try {
    const ctx = await getContext(context.params.resource);

    if ('error' in ctx) {
      return ctx.error;
    }

    if (ctx.config.readOnly) {
      return NextResponse.json(
        { message: 'This module is read-only.' },
        { status: 405 }
      );
    }

    const body = await request.json().catch(() => null);

    if (!body?.id) {
      return NextResponse.json(
        { message: 'Record ID is required.' },
        { status: 422 }
      );
    }

    const update: Record<string, unknown> = {};

    for (const key of ctx.config.fields) {
      if (body[key] !== undefined) {
        update[key] = body[key];
      }
    }

    const filter: Record<string, unknown> = {
      _id: body.id,
    };

    if (ctx.config.scope) {
      filter[ctx.config.scope] = ctx.userId;
    }

    if (
      context.params.resource === 'users' &&
      body.id === ctx.userId
    ) {
      return NextResponse.json(
        {
          message:
            'You cannot deactivate your own admin account here.',
        },
        { status: 403 }
      );
    }

    const item = await ctx.config.model
      .findOneAndUpdate(
        filter,
        { $set: update },
        { new: true, runValidators: true }
      )
      .lean();

    if (!item) {
      return NextResponse.json(
        { message: 'Record not found.' },
        { status: 404 }
      );
    }

    await AuditLog.create({
      actorId: ctx.userId,
      action: 'workspace.update',
      entityType: context.params.resource,
      entityId: body.id,
      metadata: {
        portal: ctx.portal,
        changedFields: Object.keys(update),
      },
    });

    return NextResponse.json({
      ok: true,
      item,
    });
  } catch (error) {
    console.error('[workspace:update]', error);

    return NextResponse.json(
      { message: 'Could not update this record.' },
      { status: 422 }
    );
  }
}

// DELETE: Delete record
export async function DELETE(
  request: NextRequest,
  context: { params: { resource: string } }
): Promise<NextResponse> {
  try {
    const ctx = await getContext(context.params.resource);

    if ('error' in ctx) {
      return ctx.error;
    }

    if (ctx.config.readOnly) {
      return NextResponse.json(
        { message: 'This module is read-only.' },
        { status: 405 }
      );
    }

    const id = new URL(request.url).searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: 'Record ID is required.' },
        { status: 422 }
      );
    }

    const filter: Record<string, unknown> = {
      _id: id,
    };

    if (ctx.config.scope) {
      filter[ctx.config.scope] = ctx.userId;
    }

    const deleted = await ctx.config.model.findOneAndDelete(filter);

    if (!deleted) {
      return NextResponse.json(
        { message: 'Record not found.' },
        { status: 404 }
      );
    }

    await AuditLog.create({
      actorId: ctx.userId,
      action: 'workspace.delete',
      entityType: context.params.resource,
      entityId: id,
      metadata: {
        portal: ctx.portal,
      },
    });

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error('[workspace:delete]', error);

    return NextResponse.json(
      { message: 'Could not delete this record.' },
      { status: 500 }
    );
  }
}