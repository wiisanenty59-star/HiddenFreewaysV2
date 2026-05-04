import {
  useListCategories,
  useListStates,
  useGetForumStats,
  useGetRecentActivity
} from "@workspace/api-client-react";

import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, MapPin, Users, Activity, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AnnouncementsBanner } from "@/components/announcements-banner";

export default function Home() {
  const { data: categoriesRaw, isLoading: loadingCategories } = useListCategories();
  const { data: statesRaw, isLoading: loadingStates } = useListStates();
  const { data: stats } = useGetForumStats();
  const { data: recentActivityRaw, isLoading: loadingActivity } = useGetRecentActivity();

  // ✅ HARDEN DATA (fix all "not array" crashes)
  const categories = Array.isArray(categoriesRaw) ? categoriesRaw : [];
  const states = Array.isArray(statesRaw) ? statesRaw : [];
  const recentActivity = Array.isArray(recentActivityRaw) ? recentActivityRaw : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <AnnouncementsBanner />

      {/* HERO */}
      <section className="relative border border-primary/20 bg-card/50 p-6 md:p-8 overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-serif uppercase tracking-widest">
              Central <span className="text-primary">Dispatch</span>
            </h1>
            <p className="text-muted-foreground font-mono text-sm max-w-xl">
              Encrypted communications for urban exploration.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto">
            {[
              { label: "Operatives", value: stats?.memberCount ?? 0, icon: Users },
              { label: "Locations", value: stats?.locationCount ?? 0, icon: MapPin },
              { label: "Threads", value: stats?.threadCount ?? 0, icon: FileText },
              { label: "Posts", value: stats?.postCount ?? 0, icon: MessageSquare }
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-muted-foreground flex items-center gap-1">
                  <stat.icon className="w-3 h-3" />
                  <span className="font-mono text-[10px] uppercase">{stat.label}</span>
                </div>
                <div className="font-serif text-2xl">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* CATEGORIES */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="font-serif text-xl text-primary uppercase border-b pb-2">
              Comms Channels
            </h2>

            <div className="grid gap-4 mt-4">
              {loadingCategories ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))
              ) : categories.length === 0 ? (
                <div className="text-muted-foreground font-mono text-sm italic">
                  No channels established.
                </div>
              ) : (
                categories.map((cat: any) => (
                  <Link key={cat.id ?? cat.slug} href={`/category/${cat.slug}`}>
                    <div className="border border-border bg-card/30 p-4 hover:bg-card/80 transition">
                      <h3 className="font-serif text-lg">
                        {cat.name ?? "Unnamed"}
                      </h3>

                      <p className="text-muted-foreground text-sm">
                        {cat.description ?? ""}
                      </p>

                      <div className="text-xs font-mono mt-2">
                        {cat.threadCount ?? 0} threads / {cat.postCount ?? 0} posts
                      </div>

                      {cat.latestThread?.title && (
                        <div className="text-xs mt-2 text-muted-foreground">
                          Latest: {cat.latestThread.title}
                        </div>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

          {/* STATES */}
          <section>
            <h2 className="font-serif text-xl text-primary uppercase border-b pb-2">
              Geographic Sectors
            </h2>

            <div className="grid grid-cols-2 gap-4 mt-4">
              {loadingStates ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))
              ) : states.length === 0 ? (
                <div className="text-muted-foreground font-mono text-sm italic col-span-full">
                  No sectors mapped.
                </div>
              ) : (
                states.map((state: any) => (
                  <Link key={state.id ?? state.slug} href={`/state/${state.slug}`}>
                    <div className="border border-border bg-card/30 p-3">
                      <div className="font-serif">{state.name ?? "Unknown"}</div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>

        {/* ACTIVITY */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Signal Feed
              </CardTitle>
            </CardHeader>

            <CardContent>
              {loadingActivity ? (
                <Skeleton className="h-20 w-full" />
              ) : recentActivity.length === 0 ? (
                <div className="text-muted-foreground text-xs">
                  No recent signals.
                </div>
              ) : (
                recentActivity.map((item: any, i) => (
                  <div key={i} className="border-b py-2">
                    <div className="text-sm font-medium">
                      {item.threadTitle ?? "Untitled"}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {item.actorUsername ?? "unknown"}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
