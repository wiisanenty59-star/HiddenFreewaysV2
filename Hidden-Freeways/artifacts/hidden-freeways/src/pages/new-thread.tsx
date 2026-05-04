import { useState } from "react";
import { useLocation } from "wouter";
import {
  useListCategories,
  useListStates,
  useGetStateBySlug,
  useCreateThread,
  getGetStateBySlugQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import { Terminal, Send } from "lucide-react";

type Category = {
  id: number;
  name: string;
};

type StateItem = {
  id: number;
  slug: string;
  abbreviation: string;
};

type LocationItem = {
  id: number;
  name: string;
};

export default function NewThread() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const searchParams = new URLSearchParams(window.location.search);

  const initialCategoryId = searchParams.get("categoryId")
    ? Number(searchParams.get("categoryId"))
    : "";

  const initialLocationId = searchParams.get("locationId")
    ? Number(searchParams.get("locationId"))
    : "";

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">(initialCategoryId);
  const [selectedStateSlug, setSelectedStateSlug] = useState("");
  const [locationId, setLocationId] = useState<number | "">(initialLocationId);

  const { data: categories, isLoading: loadingCategories } =
    useListCategories();

  const { data: states, isLoading: loadingStates } = useListStates();

  const { data: stateData, isLoading: loadingStateData } =
    useGetStateBySlug(selectedStateSlug, {
      query: {
        enabled: !!selectedStateSlug,
        queryKey: getGetStateBySlugQueryKey(selectedStateSlug),
      },
    });

  const createThread = useCreateThread();

  // ✅ SAFE CASTING (removes `never`)
  const categoriesList: Category[] =
    (categories as any)?.data ??
    (categories as any)?.categories ??
    [];

  const statesList: StateItem[] =
    (states as any)?.data ??
    (states as any)?.states ??
    [];

  const locationsList: LocationItem[] = Array.isArray(
    stateData?.locations,
  )
    ? stateData!.locations
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !body || !categoryId) return;

    createThread.mutate(
      {
        data: {
          title,
          body,
          categoryId: Number(categoryId),
          locationId: locationId ? Number(locationId) : null,
        },
      },
      {
        onSuccess: (newThread) => {
          setLocation(`/thread/${newThread.id}`);
        },
      },
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="border border-border/50 bg-card/40 backdrop-blur-sm p-6 md:p-8">

        <h1 className="font-serif text-3xl text-primary tracking-widest uppercase mb-2 flex items-center">
          <Terminal className="w-6 h-6 mr-3" />
          Initialize Transmission
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6 mt-8">

          {/* TITLE */}
          <div className="space-y-2">
            <Label className="font-mono text-xs uppercase text-muted-foreground">
              Transmission Header
            </Label>

            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-background/50 border-border font-mono rounded-none"
              placeholder="Designation / Subject"
            />
          </div>

          {/* CATEGORY */}
          <div className="space-y-2">
            <Label className="font-mono text-xs uppercase text-muted-foreground">
              Comm Channel (Required)
            </Label>

            {loadingCategories ? (
              <Skeleton className="h-10 w-full rounded-none" />
            ) : (
              <Select
                value={categoryId.toString()}
                onValueChange={(v) => setCategoryId(Number(v))}
              >
                <SelectTrigger className="bg-background/50 rounded-none border-border font-mono">
                  <SelectValue placeholder="Select Channel" />
                </SelectTrigger>

                <SelectContent className="bg-card border-border rounded-none">
                  {categoriesList.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No channels
                    </SelectItem>
                  ) : (
                    categoriesList.map((cat) => (
                      <SelectItem
                        key={cat.id}
                        value={cat.id.toString()}
                      >
                        {cat.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* STATES */}
          <div className="space-y-2">
            <Label className="font-mono text-xs uppercase text-muted-foreground">
              Linked Coordinates (Optional)
            </Label>

            {loadingStates ? (
              <Skeleton className="h-10 w-full rounded-none" />
            ) : (
              <div className="flex gap-2">

                <Select
                  value={selectedStateSlug}
                  onValueChange={(v) => {
                    setSelectedStateSlug(v);
                    setLocationId("");
                  }}
                >
                  <SelectTrigger className="bg-background/50 rounded-none border-border font-mono w-[120px]">
                    <SelectValue placeholder="Sector" />
                  </SelectTrigger>

                  <SelectContent className="bg-card border-border rounded-none">
                    <SelectItem value="none">None</SelectItem>

                    {statesList.map((s) => (
                      <SelectItem key={s.id} value={s.slug}>
                        {s.abbreviation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  disabled={
                    !selectedStateSlug ||
                    selectedStateSlug === "none" ||
                    loadingStateData
                  }
                  value={locationId.toString()}
                  onValueChange={(v) => setLocationId(Number(v))}
                >
                  <SelectTrigger className="bg-background/50 rounded-none border-border font-mono flex-1">
                    <SelectValue placeholder="Site" />
                  </SelectTrigger>

                  <SelectContent className="bg-card border-border rounded-none">
                    {locationsList.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No sites
                      </SelectItem>
                    ) : (
                      locationsList.map((loc) => (
                        <SelectItem
                          key={loc.id}
                          value={loc.id.toString()}
                        >
                          {loc.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

              </div>
            )}
          </div>

          {/* BODY */}
          <div className="space-y-2">
            <Label className="font-mono text-xs uppercase text-muted-foreground">
              Data Payload
            </Label>

            <Textarea
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="bg-background/50 border-border font-mono rounded-none min-h-[300px]"
              placeholder="Enter field notes..."
            />
          </div>

          {/* SUBMIT */}
          <div className="flex justify-end pt-4 border-t border-border/50">
            <Button
              type="submit"
              disabled={createThread.isPending}
              className="font-serif tracking-widest uppercase rounded-none"
            >
              <Send className="w-4 h-4 mr-2" />
              {createThread.isPending ? "Broadcasting..." : "Broadcast Intel"}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
