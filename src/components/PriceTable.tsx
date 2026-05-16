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

const TAX_LABELS: Record<string, string> = {
  vat: "VAT", gst: "GST", jct: "JCT", sales_tax: "Tax", other: "Tax",
};

type Tab = "web" | "appstore";

function TaxBadge({ entry }: { entry: PriceEntry }) {
  if (!entry.taxType || entry.taxType === "none") return null;
  const label = TAX_LABELS[entry.taxType] || entry.taxType.toUpperCase();
  const inclusive = entry.displayTaxHandling === "inclusive";
  return (
    <span className={`badge ${inclusive ? "badge-green" : "badge-amber"}`}>
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

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-0 mb-6">
        <button
          onClick={() => setTab("web")}
          className={`px-5 py-2 text-[13px] font-medium transition-colors border-b-2 ${
            tab === "web"
              ? "tab-active text-[#1d1d1f] border-[#0071e3]"
              : "text-[#86868b] border-transparent hover:text-[#1d1d1f]"
          }`}
        >
          {isZh ? "网页端订阅" : "Web Subscription"}
          <span className="ml-1.5 text-[#86868b] text-[12px]">({webPrices.length})</span>
        </button>
        <button
          onClick={() => setTab("appstore")}
          className={`px-5 py-2 text-[13px] font-medium transition-colors border-b-2 ${
            tab === "appstore"
              ? "tab-active text-[#1d1d1f] border-[#0071e3]"
              : "text-[#86868b] border-transparent hover:text-[#1d1d1f]"
          }`}
        >
          App Store
          <span className="ml-1.5 text-[#86868b] text-[12px]">({appStorePrices.length})</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <div className="relative">
          <input
            type="text"
            placeholder={isZh ? "搜索国家..." : "Search country..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[180px] h-8 pl-8 pr-3 rounded-[8px] border border-[#d2d2d7] text-[13px]
                       bg-white text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:border-[#0071e3]"
          />
          <svg className="absolute left-2.5 top-2 w-3.5 h-3.5 text-[#86868b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="h-8 px-3 rounded-[8px] border border-[#d2d2d7] text-[13px]
                     bg-white text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
        >
          <option value="all">{isZh ? "全部地区" : "All Regions"}</option>
          {regions.map((r) => (
            <option key={r} value={r}>{REGIONS[r] || r}</option>
          ))}
        </select>
        <button
          onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
          className="h-8 px-3 rounded-[8px] border border-[#d2d2d7] text-[13px]
                     bg-white text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors"
        >
          {sortDir === "asc" ? "↑ Cheapest" : "↓ Priciest"}
        </button>
      </div>

      {/* Summary */}
      {cheapest && mostExpensive && filtered.length > 1 && (
        <div className="flex gap-2 mb-5 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[980px] bg-[#e8f8ed] text-[12px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34c759]" />
            <span className="text-[#1d1d1f]">
              {countryMap.get(cheapest.countryCode)?.flagEmoji}{" "}
              {countryMap.get(cheapest.countryCode)?.nameEn}
            </span>
            <span className="font-semibold text-[#1a7f37]">
              {cheapest.symbol}{cheapest.displayAmount}
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[980px] bg-[#fff0f0] text-[12px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30]" />
            <span className="text-[#1d1d1f]">
              {countryMap.get(mostExpensive.countryCode)?.flagEmoji}{" "}
              {countryMap.get(mostExpensive.countryCode)?.nameEn}
            </span>
            <span className="font-semibold text-[#d92c20]">
              {mostExpensive.symbol}{mostExpensive.displayAmount}
            </span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="apple-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="apple-table">
            <thead>
              <tr>
                <th>{isZh ? "国家" : "Country"}</th>
                <th>{isZh ? "价格" : "Price"}</th>
                <th>{isZh ? "税务" : "Tax"}</th>
                <th>≈ USD</th>
                <th>vs US</th>
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
                      <div className="flex items-center gap-2">
                        <span className="text-[15px]">{country?.flagEmoji}</span>
                        <div>
                          <div className="text-[14px] font-medium text-[#1d1d1f]">
                            {country?.nameEn ?? entry.countryCode}
                          </div>
                          <div className="text-[11px] text-[#86868b]">
                            {entry.currencyCode}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-[15px] font-semibold text-[#1d1d1f] tabular-nums">
                        {entry.symbol}{entry.displayAmount.toLocaleString()}
                      </span>
                    </td>
                    <td><TaxBadge entry={entry} /></td>
                    <td>
                      <span className="text-[14px] text-[#86868b] tabular-nums">
                        ${entry.calculatedUsdEquivalent.toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`text-[14px] font-semibold tabular-nums ${
                          isCheap ? "text-[#34c759]" : isExpensive ? "text-[#ff3b30]" : "text-[#86868b]"
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
          <div className="py-16 text-center">
            <p className="text-[15px] text-[#86868b]">
              {isZh ? "暂无该渠道数据。" : "No data for this source yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
