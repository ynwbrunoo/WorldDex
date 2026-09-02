import React, {
  useRef,
  useEffect,
  useCallback,
  useState,
  useMemo,
} from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { useTranslation } from "react-i18next";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { COUNTRY_BY_NUMERIC } from "@/data/countries";
import { featureIdToNumeric } from "@/utils/mapUtils";
import worldData from "world-atlas/countries-110m.json";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface WorldMapProps {
  unlockedIds: Set<string>;
  lastRolledId: string | null;
  selectedId: string | null;
  highlightId?: string | null;
  onCountryClick: (id: string) => void;
  viewOnMapTrigger?: { id: string; t: number } | null;
  resetZoomTrigger?: number;
}

// ─────────────────────────────────────────────
// Color helpers
// ─────────────────────────────────────────────

function getCountryFill(
  countryId: string | undefined,
  unlockedIds: Set<string>,
  lastRolledId: string | null,
  isHovered: boolean,
  highlightId?: string | null,
): string {
  if (!countryId) return "#2a3547"; // locked
  if (highlightId && countryId === highlightId) return "#facc15"; // yellow gambling flash
  if (countryId === lastRolledId) return "#f59e0b"; // rolled — gold
  if (isHovered && unlockedIds.has(countryId)) return "#0891b2"; // hover unlocked
  if (isHovered) return "#3d4f66"; // hover locked
  if (unlockedIds.has(countryId)) return "#0e7490"; // unlocked — teal
  return "#2a3547"; // locked — dark slate
}

// ─────────────────────────────────────────────
// Small countries not in world-atlas TopoJSON
// These render as interactive pins on the map
// ─────────────────────────────────────────────

const SMALL_COUNTRY_PINS: Array<{ id: string; lat: number; lng: number }> = [
  { id: "XK", lat: 42.602, lng: 20.902 }, // Kosovo
  { id: "VA", lat: 41.902, lng: 12.453 }, // Vatican
  { id: "CV", lat: 16.002, lng: -24.013 }, // Cape Verde
  { id: "MV", lat: 3.202, lng: 73.22 }, // Maldives
  { id: "MT", lat: 35.937, lng: 14.375 }, // Malta
  { id: "SM", lat: 43.942, lng: 12.457 }, // San Marino
  { id: "AD", lat: 42.546, lng: 1.601 }, // Andorra
  { id: "MC", lat: 43.733, lng: 7.4 }, // Monaco
  { id: "LI", lat: 47.141, lng: 9.521 }, // Liechtenstein
  { id: "MU", lat: -20.348, lng: 57.552 }, // Mauritius
  { id: "KM", lat: -11.875, lng: 43.872 }, // Comoros
  { id: "ST", lat: 0.186, lng: 6.613 }, // São Tomé e Príncipe
  { id: "SG", lat: 1.352, lng: 103.82 }, // Singapore
  { id: "BH", lat: 26.066, lng: 50.558 }, // Bahrain
  { id: "BB", lat: 13.193, lng: -59.543 }, // Barbados
  { id: "TT", lat: 10.691, lng: -61.222 }, // Trinidad and Tobago
  { id: "GD", lat: 12.114, lng: -61.679 }, // Grenada
  { id: "LC", lat: 13.909, lng: -60.978 }, // Saint Lucia
  { id: "VC", lat: 13.253, lng: -61.197 }, // Saint Vincent
  { id: "AG", lat: 17.06, lng: -61.797 }, // Antigua
  { id: "KN", lat: 17.357, lng: -62.783 }, // Saint Kitts
  { id: "DM", lat: 15.415, lng: -61.371 }, // Dominica
  { id: "WS", lat: -13.759, lng: -172.105 }, // Samoa
  { id: "TO", lat: -21.179, lng: -175.198 }, // Tonga
  { id: "TV", lat: -7.109, lng: 177.649 }, // Tuvalu
  { id: "NR", lat: -0.522, lng: 166.932 }, // Nauru
  { id: "PW", lat: 7.515, lng: 134.582 }, // Palau
  { id: "MH", lat: 7.131, lng: 171.185 }, // Marshall Islands
  { id: "FM", lat: 7.426, lng: 150.551 }, // Micronesia
  { id: "KI", lat: 1.87, lng: -157.362 }, // Kiribati
];

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export function WorldMap({
  unlockedIds,
  lastRolledId,
  selectedId,
  highlightId,
  onCountryClick,
  viewOnMapTrigger,
  resetZoomTrigger,
}: WorldMapProps): React.ReactElement {
  const { t } = useTranslation();
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 800, height: 450 });

  // Build GeoJSON features from TopoJSON
  const { features, mesh } = useMemo(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const countries = topojson.feature(
        worldData as any,
        (worldData as any).objects.countries,
      ) as unknown as GeoJSON.FeatureCollection;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const borders = topojson.mesh(
        worldData as any,
        (worldData as any).objects.countries,
        (a: unknown, b: unknown) => a !== b,
      );
      return { features: countries.features, mesh: borders };
    } catch (err) {
      console.error("[WorldMap] Failed to parse TopoJSON:", err);
      return { features: [], mesh: null };
    }
  }, []);

  // ResizeObserver to track container size
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        setDimensions({
          width: Math.max(width, 200),
          height: Math.max(height, 150),
        });
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Build projection whenever dimensions change
  const projection = useMemo(
    () =>
      d3
        .geoNaturalEarth1()
        .scale(dimensions.width / 6.2)
        .translate([dimensions.width / 2, dimensions.height / 2]),
    [dimensions],
  );

  const pathGenerator = useMemo(
    () => d3.geoPath().projection(projection),
    [projection],
  );

  // Set up D3 zoom
  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;

    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.8, 12])
      .on("zoom", ({ transform }: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        g.attr("transform", transform.toString());
      });

    svg.call(zoom);
    zoomRef.current = zoom;

    // Initial transform — fit to container
    svg.call(zoom.transform, d3.zoomIdentity);

    return () => {
      svg.on(".zoom", null);
    };
  }, [dimensions]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(300)
      .call(zoomRef.current.scaleBy, 1.5);
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(300)
      .call(zoomRef.current.scaleBy, 0.67);
  }, []);

  const handleZoomReset = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(400)
      .call(zoomRef.current.transform, d3.zoomIdentity);
  }, []);

  useEffect(() => {
    if (resetZoomTrigger && resetZoomTrigger > 0) {
      handleZoomReset();
    }
  }, [resetZoomTrigger, handleZoomReset]);

  useEffect(() => {
    if (
      !viewOnMapTrigger ||
      !svgRef.current ||
      !zoomRef.current ||
      features.length === 0
    )
      return;
    const targetId = viewOnMapTrigger.id;

    // First try TopoJSON features
    const feature = features.find((f) => {
      const num = featureIdToNumeric(f.id as string);
      return COUNTRY_BY_NUMERIC.get(num)?.id === targetId;
    });

    let x, y, dx, dy;
    if (feature) {
      const bounds = pathGenerator.bounds(feature);
      dx = bounds[1][0] - bounds[0][0];
      dy = bounds[1][1] - bounds[0][1];
      x = (bounds[0][0] + bounds[1][0]) / 2;
      y = (bounds[0][1] + bounds[1][1]) / 2;
    } else {
      // Fallback to small country pins
      const pin = SMALL_COUNTRY_PINS.find((p) => p.id === targetId);
      if (!pin) return;

      const projection = d3
        .geoMercator()
        .fitSize([dimensions.width, dimensions.height], { type: "Sphere" });
      const projected = projection([pin.lng, pin.lat]);
      if (!projected) return;

      x = projected[0];
      y = projected[1];
      dx = 10; // small arbitrary size for pins
      dy = 10;
    }

    // zoom level
    const scale = Math.max(
      2,
      Math.min(
        8,
        0.75 / Math.max(dx / dimensions.width, dy / dimensions.height),
      ),
    );
    const translate = [
      dimensions.width / 2 - scale * x,
      dimensions.height / 2 - scale * y,
    ];

    d3.select(svgRef.current)
      .transition()
      .duration(750)
      .call(
        zoomRef.current.transform,
        d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale),
      );
  }, [viewOnMapTrigger, features, pathGenerator, dimensions]);

  // Handle country click
  const handleCountryClick = useCallback(
    (featureId: string | number | undefined) => {
      const numeric = featureIdToNumeric(featureId as string);
      const country = COUNTRY_BY_NUMERIC.get(numeric);
      if (country) {
        onCountryClick(country.id);
      }
    },
    [onCountryClick],
  );

  // Handle mouse enter
  const handleMouseEnter = useCallback(
    (
      e: React.MouseEvent<SVGPathElement>,
      featureId: string | number | undefined,
    ) => {
      const numeric = featureIdToNumeric(featureId as string);
      const country = COUNTRY_BY_NUMERIC.get(numeric);
      if (country) {
        setHoveredId(country.id);
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          setTooltipPos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
        }
      }
    },
    [],
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredId(null);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGPathElement>) => {
      if (!hoveredId) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setTooltipPos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    },
    [hoveredId],
  );

  const hoveredCountry = hoveredId
    ? COUNTRY_BY_NUMERIC.get(
        featureIdToNumeric(
          features.find((f) => {
            const num = featureIdToNumeric(f.id as string);
            return COUNTRY_BY_NUMERIC.get(num)?.id === hoveredId
              ? f.id
              : undefined;
          })?.id as string,
        ),
      )
    : null;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-map-ocean rounded-xl"
      aria-label={t("accessibility.mainMap")}
    >
      {/* SVG Map */}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="cursor-grab active:cursor-grabbing select-none"
        role="img"
        aria-label={t("accessibility.mainMap")}
      >
        {/* Ocean background */}
        <rect
          width={dimensions.width}
          height={dimensions.height}
          fill="#060d1a"
        />

        <g ref={gRef}>
          {/* Country fills */}
          {features.map((feature, idx) => {
            const numeric = featureIdToNumeric(feature.id as string);
            const country = COUNTRY_BY_NUMERIC.get(numeric);
            const cId = country?.id;
            const isHovered = cId === hoveredId;
            const isSelected = cId === selectedId;
            const fill = getCountryFill(
              cId,
              unlockedIds,
              lastRolledId,
              isHovered,
              highlightId,
            );

            const d = pathGenerator(feature as GeoJSON.Feature);
            if (!d) return null;

            const ariaLabel = cId
              ? unlockedIds.has(cId)
                ? t("accessibility.unlockedCountry", {
                    country: t(`countries.${cId}.name`),
                  })
                : t("accessibility.lockedCountry", {
                    country: t(`countries.${cId}.name`),
                  })
              : undefined;

            return (
              <path
                key={
                  feature.id ? `feature-${feature.id}` : `feature-idx-${idx}`
                }
                d={d}
                fill={fill}
                stroke={isSelected ? "#22d3ee" : "#1e3a4a"}
                strokeWidth={isSelected ? 1.5 : 0.5}
                className={`transition-colors duration-200 outline-none ${isSelected ? "drop-shadow-[0_0_4px_rgba(34,211,238,0.8)]" : ""}`}
                onClick={() => handleCountryClick(feature.id)}
                onMouseEnter={(e) => handleMouseEnter(e, feature.id)}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
                style={{ cursor: cId ? "pointer" : "default" }}
                tabIndex={cId ? 0 : -1}
                role={cId ? "button" : undefined}
                aria-label={ariaLabel}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleCountryClick(feature.id);
                  }
                }}
              />
            );
          })}

          {/* Country borders mesh */}
          {mesh && (
            <path
              d={pathGenerator(mesh as unknown as GeoJSON.Feature) ?? undefined}
              fill="none"
              stroke="#0f2338"
              strokeWidth={0.3}
              pointerEvents="none"
            />
          )}

          {/* Pulsing ring on last rolled country */}
          {lastRolledId &&
            features.map((feature) => {
              const numeric = featureIdToNumeric(feature.id as string);
              const country = COUNTRY_BY_NUMERIC.get(numeric);
              if (country?.id !== lastRolledId) return null;

              const d = pathGenerator(feature as GeoJSON.Feature);
              if (!d) return null;

              return (
                <path
                  key={`rolled-${feature.id as string}`}
                  d={d}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth={2.5}
                  opacity={0.9}
                  pointerEvents="none"
                  className="animate-pulse"
                />
              );
            })}

          {/* Pins for small countries not in TopoJSON */}
          {SMALL_COUNTRY_PINS.map((pin) => {
            const projected = projection([pin.lng, pin.lat]);
            if (!projected) return null;
            const [px, py] = projected;
            const isUnlocked = unlockedIds.has(pin.id);
            const isHighlighted = pin.id === highlightId;
            const isLastRolled = pin.id === lastRolledId;
            const fill = isHighlighted
              ? "#facc15"
              : isLastRolled
                ? "#f59e0b"
                : isUnlocked
                  ? "#0e7490"
                  : "#4a5568";
            return (
              <g
                key={`pin-${pin.id}`}
                transform={`translate(${px},${py})`}
                onClick={() => onCountryClick(pin.id)}
                style={{ cursor: "pointer" }}
              >
                <circle r={5} fill={fill} stroke="#1e293b" strokeWidth={1.5} />
                {isLastRolled && (
                  <circle
                    r={7}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth={1.5}
                    className="animate-ping"
                  />
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Tooltip */}
      {hoveredId && (
        <div
          className="absolute z-10 pointer-events-none bg-surface-800/90 backdrop-blur-sm border border-slate-600/50 rounded-lg px-3 py-1.5 text-sm"
          style={{
            left: tooltipPos.x + 12,
            top: tooltipPos.y - 32,
            transform: "translateX(-50%)",
          }}
          aria-hidden="true"
        >
          <span className="font-medium text-slate-200">
            {hoveredCountry
              ? t(`countries.${hoveredId}.name`, { defaultValue: hoveredId })
              : hoveredId}
          </span>
          {hoveredCountry && (
            <span className="ml-1.5 text-xs text-slate-400">
              {unlockedIds.has(hoveredId) ? "✓" : ""}
            </span>
          )}
        </div>
      )}

      {/* Zoom controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
        <button
          type="button"
          onClick={handleZoomIn}
          aria-label="Zoom in"
          className="w-8 h-8 bg-surface-800/90 backdrop-blur-sm border border-slate-600/50 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-surface-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        >
          <ZoomIn className="w-4 h-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          aria-label="Zoom out"
          className="w-8 h-8 bg-surface-800/90 backdrop-blur-sm border border-slate-600/50 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-surface-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        >
          <ZoomOut className="w-4 h-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={handleZoomReset}
          aria-label="Reset zoom"
          className="w-8 h-8 bg-surface-800/90 backdrop-blur-sm border border-slate-600/50 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-surface-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        >
          <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>

      {/* Map legend */}
      <div
        className="absolute bottom-3 left-3 flex items-center gap-3 bg-surface-800/70 backdrop-blur-sm border border-slate-700/30 rounded-lg px-3 py-1.5 text-xs text-slate-400"
        aria-hidden="true"
      >
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-map-locked inline-block" />
          {t("country.status.locked")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-map-unlocked inline-block" />
          {t("country.status.unlocked")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-gold-500 inline-block" />
          {t("roll.button")}
        </span>
      </div>
    </div>
  );
}
