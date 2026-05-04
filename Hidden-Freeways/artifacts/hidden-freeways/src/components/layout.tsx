import { Link, useLocation } from "wouter";
import {
  useGetCurrentUser,
  useLogout,
  getGetCurrentUserQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Shield,
  LogOut,
  PlusSquare,
  MessageSquare,
  Users,
  Mail
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function Layout({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useGetCurrentUser();
  const logout = useLogout();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getGetCurrentUserQueryKey()
        });
        queryClient.clear(); // 🔥 kills stale session cache
        setLocation("/login");
      }
    });
  };

  // ✅ hard stop if no user
  if (!isLoading && !user) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <Link href="/login">
          <Button variant="outline">Access Portal</Button>
        </Link>
      </div>
    );
  }

  // ✅ no fake fallback
  const username = user?.username;
  const initials = username
    ? username.slice(0, 2).toUpperCase()
    : "??";

  return (
    <div className="min-h-[100dvh] flex flex-col relative">
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">

          <Link href="/" className="flex items-center gap-2">
            <span className="text-primary font-serif text-2xl uppercase tracking-widest">
              HiddenFreeways
            </span>
          </Link>

          <nav className="flex items-center gap-4">

            {isLoading ? (
              <Skeleton className="h-8 w-8 rounded-full" />
            ) : (
              <>
                <Link href="/chat">
                  <Button variant="ghost" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" /> Chat
                  </Button>
                </Link>

                <Link href="/crews">
                  <Button variant="ghost" size="sm">
                    <Users className="h-4 w-4 mr-2" /> Crews
                  </Button>
                </Link>

                <Link href="/messages">
                  <Button variant="ghost" size="sm">
                    <Mail className="h-4 w-4 mr-2" /> DMs
                  </Button>
                </Link>

                <Link href="/new-thread">
                  <Button variant="outline" size="sm">
                    <PlusSquare className="h-4 w-4 mr-2" />
                    New Thread
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8 rounded-none border">
                        <AvatarImage src={user?.avatarUrl ?? ""} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <p className="text-sm font-mono">{username}</p>
                        <p className="text-xs text-muted-foreground uppercase">
                          {user?.role ?? "member"}
                        </p>
                      </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    {user?.role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center w-full">
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Control
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Disconnect
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t py-6 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs font-mono uppercase text-muted-foreground">
            {new Date().getFullYear()} // HiddenFreeways
          </p>
        </div>
      </footer>
    </div>
  );
}
