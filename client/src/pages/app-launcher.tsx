import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAppSchema, type App, type InsertApp } from "@shared/schema";
import { Plus, Trash2, Grid3x3, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
  } catch {
    return "";
  }
}

function getAppInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getDomainName(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function AppLauncher() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState<App | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: apps, isLoading } = useQuery<App[]>({
    queryKey: ["/api/apps"],
  });

  const filteredApps = apps?.filter((app) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const createAppMutation = useMutation({
    mutationFn: async (data: InsertApp) => {
      return await apiRequest("POST", "/api/apps", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/apps"] });
      form.reset();
      setIsAddDialogOpen(false);
      toast({
        title: "App added successfully",
        description: "Your app has been added to the launcher.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to add app",
        description: "There was an error adding your app. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteAppMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/apps/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/apps"] });
      setAppToDelete(null);
      toast({
        title: "App deleted",
        description: "The app has been removed from your launcher.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to delete app",
        description: "There was an error deleting the app. Please try again.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertApp>({
    resolver: zodResolver(insertAppSchema),
    defaultValues: {
      name: "",
      url: "",
    },
  });

  const onSubmit = (data: InsertApp) => {
    createAppMutation.mutate(data);
  };

  const handleDelete = (app: App) => {
    setAppToDelete(app);
  };

  const confirmDelete = () => {
    if (appToDelete) {
      deleteAppMutation.mutate(appToDelete.id);
    }
  };

  const handleCardClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <header className="pb-6 border-b mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold" data-testid="text-page-title">
              App Launcher
            </h1>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-app">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New App
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  Add New App
                </DialogTitle>
                <DialogDescription>
                  Add a new application to your launcher with a name and URL.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>App Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="My Application"
                            {...field}
                            data-testid="input-app-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>App URL</FormLabel>
                        <FormControl>
                          <Input
                            type="url"
                            placeholder="https://example.com"
                            {...field}
                            data-testid="input-app-url"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsAddDialogOpen(false);
                        form.reset();
                      }}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createAppMutation.isPending}
                      data-testid="button-submit"
                    >
                      {createAppMutation.isPending ? "Adding..." : "Add App"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          </div>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-apps"
            />
            {searchQuery && (
              <Button
                size="sm"
                variant="ghost"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setSearchQuery("")}
                data-testid="button-clear-search"
              >
                ×
              </Button>
            )}
          </div>
          {apps && apps.length > 0 && (
            <p className="text-sm text-muted-foreground mt-3" data-testid="text-results-count">
              {filteredApps && filteredApps.length !== apps.length
                ? `Showing ${filteredApps.length} of ${apps.length} apps`
                : `${apps.length} ${apps.length === 1 ? 'app' : 'apps'}`}
            </p>
          )}
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : !apps || apps.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center min-h-[400px] text-center"
            data-testid="empty-state"
          >
            <Grid3x3 className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground max-w-md">
              No apps yet. Add your first app to get started.
            </p>
          </div>
        ) : !filteredApps || filteredApps.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center min-h-[400px] text-center"
            data-testid="no-results-state"
          >
            <Search className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground max-w-md mb-2">
              No matches for "{searchQuery}"
            </p>
            <Button
              variant="outline"
              onClick={() => setSearchQuery("")}
              data-testid="button-clear-search-empty"
            >
              Clear search
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredApps.map((app) => (
              <Tooltip key={app.id}>
                <TooltipTrigger asChild>
                  <Card
                    className="p-6 cursor-pointer hover-elevate active-elevate-2 relative group transition-all duration-200"
                    onClick={() => handleCardClick(app.url)}
                    data-testid={`card-app-${app.id}`}
                  >
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(app);
                      }}
                      data-testid={`button-delete-${app.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={getFaviconUrl(app.url)}
                          alt={app.name}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <AvatarFallback className="text-sm font-semibold">
                          {getAppInitials(app.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3
                          className="text-lg font-semibold mb-1 truncate"
                          data-testid={`text-app-name-${app.id}`}
                        >
                          {app.name}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {getDomainName(app.url)}
                        </p>
                      </div>
                    </div>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{app.url}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        )}
      </div>

      <AlertDialog
        open={appToDelete !== null}
        onOpenChange={(open) => !open && setAppToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete App</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{appToDelete?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteAppMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
