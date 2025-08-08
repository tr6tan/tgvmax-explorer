import React from 'react';
import { MapStats } from '../types';

interface StatsOverlayProps {
  stats: MapStats | null;
  loading?: boolean;
}

const StatPill: React.FC<{ label: string; value: string; accentClass?: string }> = ({ label, value, accentClass = 'text-blue-700' }) => (
  <div className="flex flex-col items-center px-3 py-2 bg-white/70 backdrop-blur-md border border-white/40 rounded-xl shadow-sm">
    <div className={`text-sm font-semibold ${accentClass}`}>{value}</div>
    <div className="text-[11px] text-gray-600 mt-0.5">{label}</div>
  </div>
);

const StatsOverlay: React.FC<StatsOverlayProps> = ({ stats, loading = false }) => {
  return (
    <div className="pointer-events-none fixed top-5 right-5 z-[2000]">
      <div className="flex items-center gap-2">
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-24 h-10 bg-white/60 rounded-xl backdrop-blur animate-pulse" />
            <div className="w-24 h-10 bg-white/60 rounded-xl backdrop-blur animate-pulse" />
            <div className="w-28 h-10 bg-white/60 rounded-xl backdrop-blur animate-pulse" />
          </div>
        ) : (
          <>
            <StatPill label="Trajets" value={String(stats?.trainsCount ?? 0)} accentClass="text-blue-700" />
            <StatPill label="Destinations" value={String(stats?.destinationsCount ?? 0)} accentClass="text-green-700" />
            <StatPill label="MAJ" value={stats ? new Date(stats.lastUpdated).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--:--'} accentClass="text-purple-700" />
          </>
        )}
      </div>
    </div>
  );
};

export default StatsOverlay;


