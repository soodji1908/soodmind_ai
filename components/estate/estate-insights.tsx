
import { connectDB } from '@/lib/mongodb';
import { getSessionFromCookies } from '@/lib/services/session';
import { Property, Lead, Appointment, PropertyEnquiry } from '@/lib/models';
import {
  Building2,
  Users,
  CalendarCheck,
  MapPinned,
  TrendingUp,
} from 'lucide-react';
import { EstateCharts } from './estate-charts';
import { getPlatformSetting } from '@/lib/platform-settings';

const money = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);

export async function EstateInsights({
  fullDashboard = false,
}: {
  fullDashboard?: boolean;
}) {
  const session = await getSessionFromCookies();

  if (!session) return null;

  await connectDB();

  const ownerFilter = {
    ownerUserId: session.userId,
  };

  const [
    properties,
    leads,
    appointments,
    enquiries,
    mapsEnabled,
    mapZoom,
  ] = await Promise.all([
    Property.find(ownerFilter)
      .sort({ createdAt: -1 })
      .limit(80)
      .lean(),

    Lead.countDocuments({
      agentId: session.userId,
    }),

    Appointment.countDocuments({
      agentId: session.userId,
    }),

    PropertyEnquiry.countDocuments({
      userId: session.userId,
    }),

    getPlatformSetting<boolean>('enableGoogleMaps', true),

    getPlatformSetting<number>('mapZoom', 12),
  ]);

  const active = properties.filter(
    (p) => p.status === 'for_sale' || p.status === 'for_rent'
  );

  const totalValue = active.reduce(
    (sum, p) => sum + (Number(p.price) || 0),
    0
  );

  const statusData = [
    {
      name: 'For sale',
      value: properties.filter((p) => p.status === 'for_sale').length,
    },
    {
      name: 'For rent',
      value: properties.filter((p) => p.status === 'for_rent').length,
    },
    {
      name: 'Sold',
      value: properties.filter((p) => p.status === 'sold').length,
    },
    {
      name: 'Off market',
      value: properties.filter((p) => p.status === 'off_market').length,
    },
  ];

  // Count properties city-wise.
  const cityMap = new Map<string, number>();

  for (const p of properties) {
    const city = p.location?.city || 'Unknown';

    cityMap.set(city, (cityMap.get(city) || 0) + 1);
  }

  // Array.from avoids the downlevelIteration TypeScript error.
  const cityData = Array.from(cityMap.entries())
    .map(([city, count]) => ({
      city,
      count,
    }))
    .slice(0, 8);

  const locations = properties
    .filter((p) => p.location?.address || p.location?.city)
    .slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Dashboard metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={Building2}
          label="My properties"
          value={properties.length.toLocaleString('en-IN')}
          detail={`${active.length} active listings`}
        />

        <Metric
          icon={TrendingUp}
          label="Active portfolio value"
          value={money(totalValue)}
          detail="Asking value of active listings"
        />

        <Metric
          icon={Users}
          label="My leads"
          value={leads.toLocaleString('en-IN')}
          detail="Assigned CRM leads"
        />

        <Metric
          icon={CalendarCheck}
          label="Appointments"
          value={appointments.toLocaleString('en-IN')}
          detail={`${enquiries} property enquiries`}
        />
      </div>

      {/* Charts */}
      <EstateCharts
        statusData={statusData}
        cityData={cityData}
      />

      {/* Property location maps */}
      {mapsEnabled && (
        <section className="rounded-2xl border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <MapPinned className="h-5 w-5" />
                Property location map
              </h2>

              <p className="text-sm text-muted-foreground">
                Map previews for your latest listed properties.
              </p>
            </div>

            <span className="text-xs text-muted-foreground">
              Google Maps
            </span>
          </div>

          {locations.length === 0 ? (
            <div className="rounded-xl bg-muted/40 p-8 text-center text-sm text-muted-foreground">
              Add a property address to see it on the map.
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {locations.map((p) => {
                const query = [
                  p.location?.address,
                  p.location?.city,
                  p.location?.state,
                  p.location?.country,
                ]
                  .filter(Boolean)
                  .join(', ');

                const zoom = Math.max(
                  1,
                  Math.min(20, Number(mapZoom) || 12)
                );

                const src = `https://www.google.com/maps?q=${encodeURIComponent(
                  query
                )}&z=${zoom}&output=embed`;

                const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  query
                )}`;

                return (
                  <article
                    key={String(p._id)}
                    className="overflow-hidden rounded-xl border"
                  >
                    <iframe
                      title={`Map for ${p.title}`}
                      src={src}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="h-52 w-full border-0"
                    />

                    <div className="p-3">
                      <p className="font-semibold">
                        {p.title}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {query}
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        {money(Number(p.price))}
                      </p>

                      <a
                        className="mt-2 inline-block text-xs font-semibold text-primary underline"
                        href={directionsUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open directions
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {label}
        </p>

        <Icon className="h-5 w-5 text-primary" />
      </div>

      <p className="mt-3 text-2xl font-semibold tracking-tight">
        {value}
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        {detail}
      </p>
    </div>
  );
}
