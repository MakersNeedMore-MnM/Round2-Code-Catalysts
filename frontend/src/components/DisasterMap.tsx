import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup, Marker, useMap } from 'react-leaflet';
import type { Incident, Resource } from '../types';
import { getMarkerColor, getPriorityLabel, getDisasterLabel, getDisasterIcon, getResourceTypeIcon } from '../utils/helpers';
import L from 'leaflet';
import { MapPin, Users, AlertTriangle, BarChart2 } from 'lucide-react';

// Fix Leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function createResourceIcon(emoji: string) {
  return L.divIcon({
    html: `<div style="font-size:18px;background:white;border:2px solid #334e68;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 4px rgba(0,0,0,0.2)">${emoji}</div>`,
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
}

interface MapProps {
  incidents: Incident[];
  resources: Resource[];
  selectedId?: string;
  onIncidentClick?: (incident: Incident) => void;
}

function FitBounds({ incidents }: { incidents: Incident[] }) {
  const map = useMap();
  useEffect(() => {
    if (incidents.length > 0) {
      const bounds = L.latLngBounds(incidents.map(i => [i.latitude, i.longitude]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [incidents.length]);
  return null;
}

export default function DisasterMap({ incidents, resources, selectedId, onIncidentClick }: MapProps) {
  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={[17.3850, 78.4867]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {incidents.length > 0 && <FitBounds incidents={incidents} />}

        {/* Incident markers */}
        {incidents.map(incident => (
          <CircleMarker
            key={incident.id}
            center={[incident.latitude, incident.longitude]}
            radius={incident.id === selectedId ? 16 : 12 + incident.priorityScore * 0.08}
            pathOptions={{
              color: getMarkerColor(incident.priorityScore),
              fillColor: getMarkerColor(incident.priorityScore),
              fillOpacity: 0.85,
              weight: incident.id === selectedId ? 3 : 2,
            }}
            eventHandlers={{ click: () => onIncidentClick?.(incident) }}
          >
            <Tooltip permanent={false} direction="top">
              <div className="text-xs">
                <div className="font-bold">{incident.incidentNumber}</div>
                <div>{getDisasterLabel(incident.type)}</div>
                <div>Priority: {incident.priorityScore} ({getPriorityLabel(incident.priorityScore)})</div>
              </div>
            </Tooltip>
            <Popup>
              <div className="min-w-[200px] font-sans">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{getDisasterIcon(incident.type)}</span>
                  <div>
                    <div className="font-bold text-slate-800">{incident.incidentNumber}</div>
                    <div className="text-xs text-slate-500">{getDisasterLabel(incident.type)}</div>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-1"><BarChart2 size={11} />Priority: <strong>{incident.priorityScore}</strong> ({getPriorityLabel(incident.priorityScore)})</div>
                  <div className="flex items-center gap-1"><Users size={11} />{incident.peopleAffected} people affected</div>
                  <div className="flex items-center gap-1"><MapPin size={11} />{incident.locationName || 'Unknown location'}</div>
                </div>
                {incident.isDevelopmentData && (
                  <div className="mt-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">⚠️ Development Data</div>
                )}
                {onIncidentClick && (
                  <button
                    onClick={() => onIncidentClick(incident)}
                    className="mt-2 w-full text-xs bg-navy-800 text-white py-1.5 rounded hover:bg-navy-700 transition-colors"
                  >
                    View Intelligence →
                  </button>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Resource markers */}
        {resources.map(resource => (
          resource.status === 'AVAILABLE' && (
            <Marker
              key={resource.id}
              position={[resource.latitude, resource.longitude]}
              icon={createResourceIcon(getResourceTypeIcon(resource.type as any))}
            >
              <Tooltip direction="top">
                <div className="text-xs">
                  <div className="font-bold">{resource.name}</div>
                  <div className="text-emerald-600">Available</div>
                </div>
              </Tooltip>
              <Popup>
                <div className="text-xs min-w-[160px] font-sans">
                  <div className="font-bold text-slate-800 mb-1">{resource.name}</div>
                  <div className="text-slate-500">{resource.capability}</div>
                  <div className="text-emerald-600 font-medium mt-1">✓ Available</div>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white border border-slate-200 rounded-lg shadow-sm px-3 py-2 text-xs space-y-1 z-[1000]">
        <div className="font-semibold text-slate-600 mb-1.5">Priority Legend</div>
        {[
          { label: 'Critical (86–100)', color: '#dc2626' },
          { label: 'Very High (71–85)', color: '#ea580c' },
          { label: 'High (51–70)', color: '#d97706' },
          { label: 'Moderate (31–50)', color: '#facc15' },
          { label: 'Low (0–30)', color: '#22c55e' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-slate-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
