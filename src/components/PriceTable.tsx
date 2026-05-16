"use client";

import { useState, useMemo } from "react";
import type { PriceEntry, CountryData } from "@/lib/data";

const REGIONS: Record<string, string> = {
  asia_pacific: "Asia Pacific",
  europe: "Europe",
  americas: "Americas",
  middle_east_africa: "Middle East & Africa",
  oceania: "Oceania",
};

type Tab = "web" | "appstore";

const TAX_LABELS: Record<string, string> = {
  vat: "VAT",
  gst: "GST",
  jct: "JCT",
  sales_tax: "Sales Tax",
  other: "Tax",
  none: "",
};

function TaxBadge({ entry }: { entry: PriceEntry }) {
  if (!entry.taxType || entry.taxType === "none") return null;

  const label = TAX_LABELS[entry.taxType] || entry.taxType.toUpperCase();
  const inclusive = entry.displayTaxHandling === "inclusive";

  return (
    <span
      className={`inline-block text-xs px-1.5 py-0.5 rounded ${
        inclusive
          ? "bg-green-100 text-green-700"
          : "bg-amber-100 text-amber-700"
      }`}
      title={
        inclusive
          ? `Price includes ${entry.taxPercent ?? ""}% ${label}`
          : `Tax not included — ${label} charged at checkout`
      }
    >
      {inclusive
        ? `incl. ${entry.taxPercent ?? ""}% ${label}`
        : `excl. ${label}`}
    </span>
  );
}

export default function PriceTable({
  webPrices,
  appStorePrices,
  countryMap,
  exchangeRates,
  basePriceUsd,
  locale = "en",
}: {
  webPrices: PriceEntry[];
  appStorePrices: PriceEntry[];
  countryMap: Map<string, CountryData>;
  exchangeRates: Record<string, number>;
  basePriceUsd: number;
  locale?: string;
}) {
  const [tab, setTab] = useState<Tab>("web");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const prices = tab === "web" ? webPrices : appStorePrices;

  const filtered = useMemo(() => {
    let list = [...prices];
    if (regionFilter !== "all") {
      list = list.filter(
        (p) => countryMap.get(p.countryCode)?.region === regionFilter
      );
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => {
        const c = countryMap.get(p.countryCode);
        return (
          c?.nameEn.toLowerCase().includes(q) ||
          c?.nameZh.includes(q) ||
          p.countryCode.toLowerCase().includes(q)
        );
      });
    }
    list.sort((a, b) => {
      const diff = a.calculatedUsdEquivalent - b.calculatedUsdEquivalent;
      return sortDir === "asc" ? diff : -diff;
    });
    return list;
  }, [prices, regionFilter, search, sortDir, countryMap]);

  const regions = useMemo(() => {
    const set = new Set<string>();
    prices.forEach((p) => {
      const r = countryMap.get(p.countryCode)?.region;
      if (r) set.add(r);
    });
    return [...set];
  }, [prices, countryMap]);

  const cheapest = filtered[0];
  const mostExpensive = filtered[filtered.length - 1];

  return (
    <div>
      {/* Tab Switcher */}
      <div className="flex gap-1 mb-4 border-b border-gray-200">
        <button
          onClick={() => setTab("web")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            tab === "web"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Web Subscription
          <span className="ml-1 text-xs text-gray-400">({webPrices.length})</span>
        </button>
        <button
          onClick={() => setTab("appstore")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            tab === "appstore"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          App Store
          <span className="ml-1 text-xs text-gray-400">({appStorePrices.length})</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Search country..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1.5 border border-gray-200 rounded text-sm w-48"
        />
        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="px-3 py-1.5 border border-gray-200 rounded text-sm"
        >
          <option value="all">All Regions</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {REGIONS[r] || r}
            </option>
          ))}
        </select>
        <button
          onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
          className="px-3 py-1.5 border border-gray-200 rounded text-sm hover:bg-gray-50"
        >
          {sortDir === "asc" ? "↑ Cheapest first" : "↓ Most expensive first"}
        </button>
      </div>

      {/* Summary chips */}
      {cheapest && mostExpensive && filtered.length > 1 && (
        <div className="flex gap-3 mb-4 text-sm">
          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700">
            Best: {countryMap.get(cheapest.countryCode)?.flagEmoji}{" "}
            {countryMap.get(cheapest.countryCode)?.nameEn} —{" "}
            {cheapest.symbol}{cheapest.displayAmount}
          </span>
          <span className="px-3 py-1 rounded-full bg-red-100 text-red-700">
            Most: {countryMap.get(mostExpensive.countryCode)?.flagEmoji}{" "}
            {countryMap.get(mostExpensive.countryCode)?.nameEn} —{" "}
            {mostExpensive.symbol}{mostExpensive.displayAmount}
          </span>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="py-2 pr-4">Country</th>
              <th className="py-2 pr-4">Currency</th>
              <th className="py-2 pr-4">Display Price</th>
              <th className="py-2 pr-4">Tax</th>
              <th className="py-2 pr-4">≈ USD</th>
              <th className="py-2 pr-4">vs US</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry) => {
              const country = countryMap.get(entry.countryCode);
              const diff = entry.premiumVsUsPct;
              const diffColor =
                diff < -3 ? "text-green-600" : diff > 3 ? "text-red-600" : "text-gray-400";
              const diffSign = diff > 0 ? "+" : "";

              return (
                <tr
                  key={entry.countryCode}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-2 pr-4">
                    {country?.flagEmoji} {country?.nameEn ?? entry.countryCode}
                  </td>
                  <td className="py-2 pr-4 text-gray-500">
                    {entry.currencyCode}
                  </td>
                  <td className="py-2 pr-4 font-medium">
                    {entry.symbol}{entry.displayAmount.toLocaleString()}
                  </td>
                  <td className="py-2 pr-4">
                    <TaxBadge entry={entry} />
                  </td>
                  <td className="py-2 pr-4 text-gray-500">
                    ${entry.calculatedUsdEquivalent.toFixed(2)}
                  </td>
                  <td className={`py-2 pr-4 ${diffColor}`}>
                    {diffSign}{diff.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-400 py-8">No data available for this source.</p>
      )}
    </div>
  );
}
