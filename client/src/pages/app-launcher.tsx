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
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAppSchema, type App, type InsertApp } from "@shared/schema";
import { Plus, Trash2, ExternalLink, Grid3x3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AppLauncher() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState<App | null>(null);
  const { toast } = useToast();

  const { data: apps, isLoading } = useQuery<App[]>({
    queryKey: ["/api/apps"],
  });

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
        <header className="flex items-center justify-between pb-6 border-b mb-8">
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
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-6 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full" />
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {apps.map((app) => (
              <Card
                key={app.id}
                className="p-6 cursor-pointer hover-elevate active-elevate-2 relative group transition-all duration-200"
                onClick={() => handleCardClick(app.url)}
                data-testid={`card-app-${app.id}`}
              >
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(app);
                  }}
                  data-testid={`button-delete-${app.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <div className="flex items-start gap-3">
                  <ExternalLink className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-lg font-semibold mb-1 truncate"
                      data-testid={`text-app-name-${app.id}`}
                    >
                      {app.name}
                    </h3>
                    <p
                      className="text-sm text-muted-foreground truncate"
                      data-testid={`text-app-url-${app.id}`}
                    >
                      {app.url}
                    </p>
                  </div>
                </div>
              </Card>
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
