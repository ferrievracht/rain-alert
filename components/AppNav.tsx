import Link from "next/link";
import { CloudRain, MapPin, Settings, Shield } from "lucide-react";

export function AppNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 px-3 py-2 backdrop-blur md:sticky md:top-0 md:bottom-auto">
      <div className="mx-auto flex max-w-5xl items-center justify-around gap-2 md:justify-start">
        <Link className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slateblue hover:bg-mist" href="/dashboard">
          <CloudRain size={18} /> Dashboard
        </Link>
        <Link className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slateblue hover:bg-mist" href="/locations/new">
          <MapPin size={18} /> Locatie
        </Link>
        <Link className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slateblue hover:bg-mist" href="/settings">
          <Settings size={18} /> Instellingen
        </Link>
        <Link className="hidden items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slateblue hover:bg-mist md:flex" href="/privacy">
          <Shield size={18} /> Privacy
        </Link>
      </div>
    </nav>
  );
}
