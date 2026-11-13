'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type EstimateResult = {
  estimated_price: number;
  range_low: number;
  range_high: number;
  model_label: string;
  note: string;
};

type ErrorBody = { error?: string; message?: string };

const numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

function parseOptionalNumber(value: string): number | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : Number(trimmed);
}

export function PriceEstimator() {
  const [area, setArea] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [yearBuilt, setYearBuilt] = useState('');
  const [garage, setGarage] = useState('');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EstimateResult | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setSubmitting(true);

    try {
      const response = await fetch('/api/ml/house-price/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          area_sqft: Number(area),
          bedrooms: Number(bedrooms),
          bathrooms: Number(bathrooms),
          year_built: parseOptionalNumber(yearBuilt),
          garage_spaces: parseOptionalNumber(garage),
          location: location.trim() || undefined,
        }),
      });
      const body = (await response.json().catch(() => null)) as (EstimateResult & ErrorBody) | null;

      if (!response.ok || !body || typeof body.estimated_price !== 'number') {
        setError(body?.message ?? 'The price service did not return an estimate. Try again shortly.');
        return;
      }
      setResult(body);
    } catch {
      setError('Could not reach the price service. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle>Property price estimate</CardTitle>
        <CardDescription>
          Enter the property details. The estimate comes from a trained model on your uploaded sales dataset.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="area">Area (sq ft)</Label>
            <Input id="area" type="number" min={51} max={100000} required value={area} onChange={(e) => setArea(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bedrooms">Bedrooms</Label>
            <Input id="bedrooms" type="number" min={0} max={20} step={1} required value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bathrooms">Bathrooms</Label>
            <Input id="bathrooms" type="number" min={0} max={20} step={0.5} required value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="year-built">Year built (optional)</Label>
            <Input id="year-built" type="number" min={1800} step={1} value={yearBuilt} onChange={(e) => setYearBuilt(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="garage">Garage spaces (optional)</Label>
            <Input id="garage" type="number" min={0} max={10} step={1} value={garage} onChange={(e) => setGarage(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location (optional)</Label>
            <Input id="location" type="text" maxLength={100} value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div className="sm:col-span-2 flex items-center gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Estimating...' : 'Estimate price'}
            </Button>
          </div>
        </form>

        {error && (
          <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {result && (
          <div className="rounded-lg border border-border/60 bg-muted/40 p-6 space-y-3 transition-opacity duration-300">
            <p className="text-sm text-muted-foreground">Estimated value</p>
            <p className="text-3xl font-semibold tracking-tight">{numberFormatter.format(result.estimated_price)}</p>
            <p className="text-sm text-muted-foreground">
              Likely range {numberFormatter.format(result.range_low)} to {numberFormatter.format(result.range_high)}
            </p>
            <p className="text-xs text-muted-foreground">Model: {result.model_label}. {result.note}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
