'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users, Eye, Globe, Monitor, Smartphone, Globe2,
  TrendingUp, Clock, ArrowUpRight, ArrowDownRight, BarChart3,
  Wifi, Activity,
} from 'lucide-react';

interface AnalyticsData {
  overview?: {
    totalViews: number;
    uniqueVisits: number;
    viewsChange: number;
    visitsChange: number;
    bounceRate: number;
    avgDuration: number;
    liveVisitors: number;
  };
  traffic?: { date: string; views: number; visits: number }[];
  devices?: { device: string; count: number; percentage: number }[];
  browsers?: { browser: string; count: number; percentage: number }[];
  countries?: { country: string; count: number; percentage: number }[];
  pages?: { title: string; slug: string; views: number }[];
  referrers?: { referrer: string; count: number; percentage: number }[];
}

const periods = [
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: '90d', label: '90 Days' },
];

const tabs = [
  { key: 'overview', label: 'Overview', icon: BarChart3 },
  { key: 'traffic', label: 'Traffic', icon: TrendingUp },
  { key: 'devices', label: 'Devices', icon: Monitor },
  { key: 'pages', label: 'Top Pages', icon: Eye },
  { key: 'referrers', label: 'Sources', icon: Globe2 },
];

export default function AnalyticsPage() {
  const { admin, loading: authLoading } = useAdminAuth();
  const [period, setPeriod] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState<AnalyticsData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!admin) return;
    let cancelled = false;
    fetch(`/api/admin/analytics?period=${period}&type=${activeTab}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setLoading(false);
        }
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [admin, period, activeTab]);

  if (authLoading) return <div className="p-8"><Skeleton className="h-8 w-64" /></div>;
  if (!admin) return null;

  const { overview, traffic, devices, browsers, countries, pages, referrers } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time website traffic and performance monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-green-500 animate-pulse" />
          <span className="text-sm font-medium">{overview?.liveVisitors || 0} live</span>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
        {periods.map((p) => (
          <Button
            key={p.key}
            variant={period === p.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod(p.key)}
          >
            {p.label}
          </Button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.key ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          {(activeTab === 'overview' || activeTab === 'traffic') && overview && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                    <Eye className="h-3.5 w-3.5" /> Total Page Views
                  </div>
                  <div className="text-2xl font-bold">{(overview.totalViews || 0).toLocaleString()}</div>
                  <div className={`text-xs mt-1 flex items-center gap-0.5 ${overview.viewsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {overview.viewsChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {Math.abs(overview.viewsChange || 0).toFixed(1)}%
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                    <Users className="h-3.5 w-3.5" /> Unique Visitors
                  </div>
                  <div className="text-2xl font-bold">{(overview.uniqueVisits || 0).toLocaleString()}</div>
                  <div className={`text-xs mt-1 flex items-center gap-0.5 ${overview.visitsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {overview.visitsChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {Math.abs(overview.visitsChange || 0).toFixed(1)}%
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                    <Wifi className="h-3.5 w-3.5" /> Bounce Rate
                  </div>
                  <div className="text-2xl font-bold">{(overview.bounceRate || 0).toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground mt-1">Average</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                    <Clock className="h-3.5 w-3.5" /> Avg. Duration
                  </div>
                  <div className="text-2xl font-bold">{Math.floor(overview.avgDuration || 0)}m {Math.round(((overview.avgDuration || 0) % 1) * 60)}s</div>
                  <div className="text-xs text-muted-foreground mt-1">Per session</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Traffic Chart */}
          {activeTab === 'traffic' && traffic && traffic.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Traffic Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end gap-1">
                  {traffic.map((item, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-primary/80 rounded-t-sm transition-all hover:bg-primary min-h-[4px]"
                        style={{ height: `${Math.max(4, ((item.views || 0) / Math.max(...traffic.map((t) => t.views || 1))) * 200)}px` }}
                        title={`${item.date}: ${item.views} views`}
                      />
                      {i % Math.ceil(traffic.length / 7) === 0 && (
                        <span className="text-[9px] text-muted-foreground rotate-0">{new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Devices & Browsers */}
          {activeTab === 'devices' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Monitor className="h-4 w-4" /> Device Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  {devices && devices.length > 0 ? devices.map((item) => (
                    <div key={item.device} className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        {item.device === 'Mobile' ? <Smartphone className="h-4 w-4" /> : item.device === 'Tablet' ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{item.device}</span>
                          <span className="text-muted-foreground">{item.count} ({item.percentage}%)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${item.percentage}%` }} />
                        </div>
                      </div>
                    </div>
                  )) : <p className="text-sm text-muted-foreground text-center py-4">No device data yet</p>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Globe className="h-4 w-4" /> Browser Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  {browsers && browsers.length > 0 ? browsers.map((item) => (
                    <div key={item.browser} className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        <Globe className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{item.browser}</span>
                          <span className="text-muted-foreground">{item.count} ({item.percentage}%)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${item.percentage}%` }} />
                        </div>
                      </div>
                    </div>
                  )) : <p className="text-sm text-muted-foreground text-center py-4">No browser data yet</p>}
                </CardContent>
              </Card>
              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Globe2 className="h-4 w-4" /> Country Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  {countries && countries.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {countries.map((item) => (
                        <div key={item.country} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                          <Globe2 className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium line-clamp-1">{item.country}</p>
                            <p className="text-xs text-muted-foreground">{item.percentage}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-muted-foreground text-center py-4">No country data yet</p>}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Top Pages */}
          {activeTab === 'pages' && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Top Performing Pages</CardTitle>
              </CardHeader>
              <CardContent>
                {pages && pages.length > 0 ? (
                  <div className="space-y-2">
                    {pages.map((page, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <span className="text-lg font-bold text-muted-foreground/30 w-8 text-right">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{page.title}</p>
                          <p className="text-xs text-muted-foreground">/{page.slug}</p>
                        </div>
                        <Badge variant="secondary">{page.views.toLocaleString()} views</Badge>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground text-center py-4">No page view data yet</p>}
              </CardContent>
            </Card>
          )}

          {/* Referrers */}
          {activeTab === 'referrers' && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Traffic Sources</CardTitle>
              </CardHeader>
              <CardContent>
                {referrers && referrers.length > 0 ? (
                  <div className="space-y-2">
                    {referrers.map((ref, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                        <span className="text-lg font-bold text-muted-foreground/30 w-8 text-right">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{ref.referrer}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${ref.percentage}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground w-12 text-right">{ref.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground text-center py-4">No referrer data yet</p>}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
