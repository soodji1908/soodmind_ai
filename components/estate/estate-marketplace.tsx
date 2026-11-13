'use client';

import { useCallback, useEffect, useState } from 'react';
import { Heart, Map, Search, MapPin, BedDouble, Bath, Ruler, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Listing = {
  _id: string; title: string; description?: string; propertyType: string; status: 'for_sale' | 'for_rent';
  price: number; currency?: string; areaSqft: number; bedrooms?: number; bathrooms?: number;
  location?: { address?: string; city?: string; state?: string; country?: string; coordinates?: { lat?: number; lng?: number } };
};
const money = (price: number, currency = 'INR') => new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(price || 0);

export function EstateMarketplace() {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'all' | 'for_sale' | 'for_rent'>('all');
  const [listings, setListings] = useState<Listing[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams(); if (query.trim()) params.set('q', query.trim()); if (mode !== 'all') params.set('type', mode);
      const response = await fetch(`/api/marketplace/properties?${params.toString()}`, { cache: 'no-store' });
      const data = await response.json(); if (!response.ok) throw new Error(data.message || 'Unable to load property listings.');
      setListings(data.items || []);
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load property listings.'); setListings([]); }
    finally { setLoading(false); }
  }, [query, mode]);

  useEffect(() => { const timer = window.setTimeout(() => void load(), 250); return () => window.clearTimeout(timer); }, [load]);
  const mapQuery = listings[0] ? [listings[0].location?.city, listings[0].location?.state, listings[0].location?.country].filter(Boolean).join(', ') : query;

  return <section className="-mx-4 -mt-8 bg-[#f8fafc] sm:-mx-6 lg:-mx-8">
    <div className="border-b border-slate-200 bg-white px-4 py-5 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-600">EstateMind marketplace</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Find a place that feels like home.</h1>
      <div className="mt-5 flex flex-wrap gap-2"><div className="relative min-w-[240px] flex-1 sm:max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><Input value={query} onChange={(e) => setQuery(e.target.value)} className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-9 text-slate-900" placeholder="Search city, neighbourhood or address" aria-label="Search properties"/></div>
        <Button variant={mode === 'all' ? 'default' : 'outline'} onClick={() => setMode('all')} className="h-11 rounded-xl">All listings</Button><Button variant={mode === 'for_sale' ? 'default' : 'outline'} onClick={() => setMode('for_sale')} className="h-11 rounded-xl">For sale</Button><Button variant={mode === 'for_rent' ? 'default' : 'outline'} onClick={() => setMode('for_rent')} className="h-11 rounded-xl">For rent</Button><Button variant="outline" onClick={() => void load()} disabled={loading} className="h-11 rounded-xl"><RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}/>Refresh</Button></div>
    </div></div>
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.15fr)] lg:px-8">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center gap-2 border-b p-4 text-sm font-semibold text-slate-800"><Map className="h-4 w-4 text-sky-600"/> Live listing map</div>{mapQuery ? <iframe title="Property search map" src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-[420px] w-full border-0 lg:h-[620px]"/> : <div className="flex h-[420px] items-center justify-center p-8 text-center text-sm text-slate-500 lg:h-[620px]">Add a city or search for a listing to view its map.</div>}<p className="border-t p-3 text-xs text-slate-500">Map search is based on the location of actual saved listings. Exact property pins require latitude and longitude on each property record.</p></div>
      <div className="space-y-4"><div className="flex items-end justify-between gap-4"><div><p className="text-sm font-medium text-slate-500">Database listings</p><h2 className="text-2xl font-semibold tracking-tight text-slate-950">{query || 'All available properties'}</h2></div><span className="text-sm text-slate-500">{listings.length} properties</span></div>
        {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
        {loading ? <div className="rounded-2xl border bg-white p-10 text-center text-sm text-slate-500">Loading live property records…</div> : listings.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><p className="font-semibold text-slate-900">No live listings found</p><p className="mt-2 text-sm text-slate-500">No sample properties are displayed. Add a property in your Property Portfolio and set its status to For Sale or For Rent.</p></div> : listings.map((listing) => {const location = [listing.location?.address, listing.location?.city, listing.location?.state].filter(Boolean).join(', ');return <article key={listing._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col sm:flex-row"><div className="flex min-h-44 min-w-0 items-center justify-center bg-gradient-to-br from-sky-50 to-slate-100 p-6 text-center sm:w-48"><div><MapPin className="mx-auto h-8 w-8 text-sky-600"/><p className="mt-2 text-xs font-medium text-slate-500">Property record</p></div></div><div className="flex flex-1 flex-col justify-between p-5"><div><div className="flex items-center justify-between gap-2"><span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">{listing.status === 'for_rent' ? 'FOR RENT' : 'FOR SALE'}</span><button onClick={() => setSaved((current) => current.includes(listing._id) ? current.filter((id) => id !== listing._id) : [...current, listing._id])} aria-label="Save property" className="rounded-full border p-2 text-slate-500"><Heart className={`h-4 w-4 ${saved.includes(listing._id) ? 'fill-rose-500 text-rose-500' : ''}`}/></button></div><h3 className="mt-2 text-lg font-semibold text-slate-950">{listing.title}</h3><p className="mt-1 text-sm text-slate-500">{location || 'Location not provided'}</p><p className="mt-3 text-xl font-bold text-slate-950">{money(listing.price, listing.currency || 'INR')}</p><div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">{listing.bedrooms != null && <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5"/>{listing.bedrooms} beds</span>}{listing.bathrooms != null && <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5"/>{listing.bathrooms} baths</span>}<span className="flex items-center gap-1"><Ruler className="h-3.5 w-3.5"/>{listing.areaSqft.toLocaleString('en-IN')} sq ft</span><span>{listing.propertyType}</span></div>{listing.description && <p className="mt-2 line-clamp-2 text-sm text-slate-600">{listing.description}</p>}</div><div className="mt-4 flex flex-wrap items-center justify-between gap-2"><span className="text-xs text-slate-400">Listing ID: {listing._id}</span>{listing.location?.coordinates?.lat != null && listing.location?.coordinates?.lng != null && <a className="text-sm font-semibold text-sky-700 underline" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${listing.location.coordinates.lat},${listing.location.coordinates.lng}`}>Open exact map location</a>}</div></div></div></article>})}
      </div>
    </div>
  </section>;
}
