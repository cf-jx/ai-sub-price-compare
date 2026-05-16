"use client";

import { useState, useMemo, useCallback } from "react";
import type { PriceEntry, CountryData } from "@/lib/data";

const REGIONS: Record<string, string> = {
  asia_pacific: "Asia Pacific",
  europe: "Europe",
  americas: "Americas",
  middle_east_africa: "Middle East & Africa",
  oceania: "Oceania",
};

const TAX_LABELS: Record<string, string> = {
  vat: "VAT", gst: "GST", jct: "JCT", sales_tax: "Tax", other: "Tax",
};

type Tab = "web" | "appstore";

function TaxBadge({ entry }: { entry: PriceEntry }) {
  if (!entry.taxType || entry.taxType === "none") return null;
  const label = TAX_LABELS[entry.taxType] || entry.taxType.toUpperCase();
  const inclusive = entry.displayTaxHandling === "inclusive";
  return (
    <span className={`badge ${inclusive ? "badge-good" : "badge-warn"}`}>
      {inclusive
        ? `Incl. ${entry.taxPercent ?? ""}% ${label}`
        : `Excl. ${label}`}
    </span>
  );
}

export default function PriceTable({
  webPrices,
  appStorePrices,
  countryMap,
  basePriceUsd,
  locale,
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
      list = list.filter((p) => countryMap.get(p.countryCode)?.region === regionFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => {
        const c = countryMap.get(p.countryCode);
        return c?.nameEn.toLowerCase().includes(q) || c?.nameZh.includes(q) || p.countryCode.toLowerCase().includes(q);
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
  const isZh = locale === "zh";

  const handleTabKeyDown = useCallback((e: React.KeyboardEvent) => {
    const tabs = ["web", "appstore"] as const;
    const idx = tabs.indexOf(tab);
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      setTab(tabs[(idx + 1) % tabs.length]);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      setTab(tabs[(idx - 1 + tabs.length) % tabs.length]);
    }
  }, [tab]);

  return (
    <div>
      {/* Tabs */}
      <div role="tablist" aria-label={isZh ? "价格渠道" : "Price source"} className="flex gap-0 mb-5">
        <button
          role="tab"
          aria-selected={tab === "web"}
          tabIndex={tab === "web" ? 0 : -1}
          onClick={() => setTab("web")}
          onKeyDown={handleTabKeyDown}
          className="tab"
        >
          {isZh ? "网页端订阅" : "Web Subscription"}
          <span className="ml-1.5 text-[var(--color-text-tertiary)] text-[0.6875rem]">({webPrices.length})</span>
        </button>
        <button
          role="tab"
          aria-selected={tab === "appstore"}
          tabIndex={tab === "appstore" ? 0 : -1}
          onClick={() => setTab("appstore")}
          onKeyDown={handleTabKeyDown}
          className="tab"
        >
          App Store
          <span className="ml-1.5 text-[var(--color-text-tertiary)] text-[0.6875rem]">({appStorePrices.length})</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex gap-2.5 mb-5 flex-wrap" role="search" aria-label={isZh ? "筛选价格" : "Filter prices"}>
        <div className="relative">
          <label className="sr-only" htmlFor="country-search">
            {isZh ? "搜索国家" : "Search country"}
          </label>
          <input
            id="country-search"
            type="text"
            placeholder={isZh ? "搜索国家..." : "Search country..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field w-[180px] pl-8"
          />
          <svg className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[var(--color-text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <label className="sr-only" htmlFor="region-filter">
          {isZh ? "筛选地区" : "Filter region"}
        </label>
        <select
          id="region-filter"
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="select-field"
        >
          <option value="all">{isZh ? "全部地区" : "All Regions"}</option>
          {regions.map((r) => (
            <option key={r} value={r}>{REGIONS[r] || r}</option>
          ))}
        </select>
        <button
          onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
          className="btn-pill"
          aria-label={sortDir === "asc" ? (isZh ? "当前：最便宜优先" : "Current: cheapest first") : (isZh ? "当前：最贵优先" : "Current: priciest first")}
        >
          {sortDir === "asc" ? "↑ Cheapest" : "↓ Priciest"}
        </button>
      </div>

      {/* Summary */}
      {cheapest && mostExpensive && filtered.length > 1 && (
        <div className="flex gap-2.5 mb-5 flex-wrap" aria-label={isZh ? "价格摘要" : "Price summary"}>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[980px] bg-[var(--color-good-bg)] text-[0.75rem]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-good)]" aria-hidden="true" />
            <span>{countryMap.get(cheapest.countryCode)?.flagEmoji} {countryMap.get(cheapest.countryCode)?.nameEn}</span>
            <span className="font-semibold text-[var(--color-good)]">
              {cheapest.symbol}{cheapest.displayAmount}
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[980px] bg-[var(--color-bad-bg)] text-[0.75rem]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-bad)]" aria-hidden="true" />
            <span>{countryMap.get(mostExpensive.countryCode)?.flagEmoji} {countryMap.get(mostExpensive.countryCode)?.nameEn}</span>
            <span className="font-semibold text-[var(--color-bad)]">
              {mostExpensive.symbol}{mostExpensive.displayAmount}
            </span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <caption className="sr-only">
              {isZh
                ? `${tab === "web" ? "网页端" : "App Store"} 订阅价格对比表。${sortDir === "asc" ? "按价格从低到高排序" : "按价格从高到低排序"}.`
                : `${tab === "web" ? "Web" : "App Store"} subscription price comparison. Sorted ${sortDir === "asc" ? "cheapest first" : "priciest first"}.`}
            </caption>
            <thead>
              <tr>
                <th scope="col">{isZh ? "国家" : "Country"}</th>
                <th scope="col">{isZh ? "价格" : "Price"}</th>
                <th scope="col">{isZh ? "税务" : "Tax"}</th>
                <th scope="col">≈ USD</th>
                <th scope="col">vs US</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => {
                const country = countryMap.get(entry.countryCode);
                const diff = entry.premiumVsUsPct;
                const isCheap = diff < -3;
                const isExpensive = diff > 3;

                return (
                  <tr key={entry.countryCode}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <span className="text-[1.125rem]" aria-hidden="true">{country?.flagEmoji}</span>
                        <div>
                          <div className="text-[0.875rem] font-medium">{country?.nameEn ?? entry.countryCode}</div>
                          <div className="text-[0.6875rem] text-[var(--color-text-tertiary)]">{entry.currencyCode}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-[0.9375rem] font-semibold tabular-nums">
                        {entry.symbol}{entry.displayAmount.toLocaleString()}
                      </span>
                    </td>
                    <td><TaxBadge entry={entry} /></td>
                    <td>
                      <span className="text-[0.875rem] text-[var(--color-text-secondary)] tabular-nums">
                        ${entry.calculatedUsdEquivalent.toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`text-[0.875rem] font-semibold tabular-nums ${
                          isCheap ? "price-lower" : isExpensive ? "price-higher" : "text-[var(--color-text-secondary)]"
                        }`}
                      >
                        {diff > 0 ? "+" : ""}{diff.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center" role="status">
            <p className="text-[0.9375rem] text-[var(--color-text-secondary)]">
              {isZh ? "暂无该渠道数据。" : "No data for this source yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
