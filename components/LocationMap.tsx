"use client";

import { useMemo } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";

type Props = {
  latitude: number;
  longitude: number;
  onChange?: (latitude: number, longitude: number) => void;
  height?: string;
};

const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

function ClickHandler({ onChange }: { onChange?: Props["onChange"] }) {
  useMapEvents({
    click(event) {
      onChange?.(event.latlng.lat, event.latlng.lng);
    }
  });
  return null;
}

export default function LocationMap({ latitude, longitude, onChange, height = "320px" }: Props) {
  const position = useMemo(() => [latitude, longitude] as [number, number], [latitude, longitude]);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200" style={{ height }}>
      <MapContainer center={position} zoom={13} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={icon} draggable={Boolean(onChange)} eventHandlers={{
          dragend(event) {
            const marker = event.target;
            const latlng = marker.getLatLng();
            onChange?.(latlng.lat, latlng.lng);
          }
        }} />
        <ClickHandler onChange={onChange} />
      </MapContainer>
    </div>
  );
}
