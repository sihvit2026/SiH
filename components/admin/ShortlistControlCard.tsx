'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useRouter } from 'next/navigation';

export const ShortlistControlCard: React.FC<{ currentShortlisted: number }> = ({ currentShortlisted }) => {
  const [topN, setTopN] = useState('10');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const router = useRouter();

  const handleApplyShortlist = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/shortlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topN }),
      });

      if (res.ok) {
        setFeedback(`Successfully shortlisted Top ${topN} teams for Round 2!`);
        router.refresh();
      } else {
        const data = await res.json();
        setFeedback(`Error: ${data.error || 'Failed to apply shortlist'}`);
      }
    } catch (err) {
      setFeedback(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card glowColor="purple">
      <CardHeader>
        <div>
          <CardTitle className="text-purple-300">Configurable Top N Shortlisting</CardTitle>
          <CardDescription>
            Automatically rank eligible Round 1 teams by average score and promote Top N to Round 2
          </CardDescription>
        </div>
        <Badge variant="purple" glow>
          Currently Shortlisted: {currentShortlisted}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleApplyShortlist} className="flex flex-col sm:flex-row items-end gap-3">
          <div className="flex-1">
            <Input
              label="Set Top N Shortlist Target"
              type="number"
              min="1"
              max="200"
              value={topN}
              onChange={(e) => setTopN(e.target.value)}
              placeholder="e.g. 10, 25, 70"
              required
            />
          </div>
          <Button type="submit" variant="accent" size="md" isLoading={isSubmitting}>
            ⚡ Generate Top {topN} Shortlist
          </Button>
        </form>

        {feedback && (
          <div className="p-3 rounded-lg bg-purple-950 border border-purple-500/40 text-xs font-medium text-purple-300">
            {feedback}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
