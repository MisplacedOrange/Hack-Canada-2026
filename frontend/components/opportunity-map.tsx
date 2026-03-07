"use client"

import { useEffect, useMemo, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

const CAUSE_MARKER_COLORS: Record<string, string> = {
  environment: "#059669",
  education: "#2563eb",
  healthcare: "#dc2626",
  community: "#ca8a04",
  "animal-care": "#9333ea",
  "arts-culture": "#ec4899",
  "food security": "#f97316",
}

function markerColor(cause: string): string {
  return CAUSE_MARKER_COLORS[cause] ?? "#6b7280"
}

function createIcon(cause: string, urgency: string) {
  const color = markerColor(cause)
  const size = urgency === "high" ? 14 : urgency === "medium" ? 11 : 9
  const ring = urgency === "high" ? `<circle cx="12" cy="12" r="11" fill="none" stroke="${color}" stroke-width="2" opacity="0.35"/>` : ""
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    ${ring}
    <circle cx="12" cy="12" r="${size / 2}" fill="${color}" stroke="white" stroke-width="2"/>
  </svg>`
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  })
}

export type MapOpportunity = {
  id: string
  title: string
  organization: string
  cause: string
  location: string
  urgency: string
  latitude: number
  longitude: number
  match_pct?: number
}

type OpportunityMapProps = {
  items: MapOpportunity[]
  className?: string
  onMarkerClick?: (id: string) => void
}

export default function OpportunityMap({ items, className, onMarkerClick }: OpportunityMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<L.LayerGroup | null>(null)

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: [43.6532, -79.3832],
      zoom: 11,
      zoomControl: true,
      attributionControl: true,
    })

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map)

    markersRef.current = L.layerGroup().addTo(map)
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      markersRef.current = null
    }
  }, [])

  // Valid items with coordinates
  const validItems = useMemo(
    () => items.filter((i) => i.latitude && i.longitude && isFinite(i.latitude) && isFinite(i.longitude)),
    [items],
  )

  // Update markers when items change
  useEffect(() => {
    const map = mapRef.current
    const group = markersRef.current
    if (!map || !group) return

    group.clearLayers()

    for (const item of validItems) {
      const icon = createIcon(item.cause, item.urgency)
      const matchBadge =
        item.match_pct && item.match_pct > 0
          ? `<span style="display:inline-block;background:#f3e8ff;color:#7c3aed;border-radius:9999px;padding:1px 7px;font-size:11px;font-weight:600;margin-left:6px">${item.match_pct}%</span>`
          : ""

      const popup = `
        <div style="min-width:180px;font-family:system-ui,sans-serif">
          <div style="font-weight:600;font-size:13px;line-height:1.3">${item.title}${matchBadge}</div>
          <div style="color:#6b7280;font-size:12px;margin-top:2px">${item.organization}</div>
          <div style="margin-top:4px;display:flex;gap:4px;flex-wrap:wrap">
            <span style="background:${markerColor(item.cause)}22;color:${markerColor(item.cause)};border-radius:9999px;padding:1px 8px;font-size:11px">${item.cause.replace(/-/g, " ")}</span>
            <span style="background:#f3f4f6;color:#374151;border-radius:9999px;padding:1px 8px;font-size:11px">${item.location}</span>
          </div>
        </div>`

      const marker = L.marker([item.latitude, item.longitude], { icon }).bindPopup(popup)
      if (onMarkerClick) {
        marker.on("click", () => onMarkerClick(item.id))
      }
      group.addLayer(marker)
    }

    // Fit bounds to show all markers
    if (validItems.length > 0) {
      const bounds = L.latLngBounds(validItems.map((i) => [i.latitude, i.longitude] as [number, number]))
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 })
    }
  }, [validItems, onMarkerClick])

  return (
    <div ref={containerRef} className={className ?? "h-[380px] w-full rounded-xl"} />
  )
}
