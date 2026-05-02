import { useEffect, useState } from "react";
import { Terminal, LogIn, LogOut, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types/project";
import { useAuth } from "@/hooks/useAuth";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectFormDialog } from "@/components/ProjectFormDialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
import { Link } from "react-router-dom";

const Index = () => {
  const { user, isAdmin, signOut } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);

  useEffect(() => {
    document.title = "computer engineer · portfolio";
    fetchProjects();

    const channel = supabase
      .channel("projects-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects" },
        () => fetchProjects()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Failed to load projects");
    } else {
      setProjects(data ?? []);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const { error } = await supabase.from("projects").delete().eq("id", deleting.id);
    if (error) toast.error(error.message);
    else toast.success("Project removed");
    setDeleting(null);
  };

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (p: Project) => {
    setEditing(p);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen relative">
      {/* NAV */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-background/70 border-b border-border">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-2 font-mono text-sm">
            <Terminal className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">root@portfolio</span>
            <span className="text-primary">:~$</span>
          </div>
          <nav className="flex items-center gap-2">
            {user ? (
              <>
                {isAdmin && (
                  <Button size="sm" variant="outline" onClick={openNew} className="gap-1.5">
                    <Plus className="h-3.5 w-3.5" /> new
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={signOut} className="gap-1.5 text-muted-foreground">
                  <LogOut className="h-3.5 w-3.5" /> logout
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground">
                  <LogIn className="h-3.5 w-3.5" /> admin
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="container py-20 md:py-32">
        <div className="max-w-3xl space-y-6 animate-fade-up">
          <div className="font-mono text-sm text-primary terminal-glow">
            <span className="text-muted-foreground">$</span> whoami
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight">
            computer<br />
            <span className="text-primary terminal-glow">engineer</span>
            <span className="blink-caret"></span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
            building things at the intersection of hardware and software.
            <br />
            below: a live feed of projects i'm shipping.
          </p>
          <div className="flex gap-2 pt-2 font-mono text-xs text-muted-foreground">
            <span className="px-2 py-1 border border-border rounded-sm">embedded</span>
            <span className="px-2 py-1 border border-border rounded-sm">systems</span>
            <span className="px-2 py-1 border border-border rounded-sm">full-stack</span>
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section className="container pb-24">
        <div className="flex items-baseline justify-between mb-8 border-b border-border pb-3">
          <h2 className="font-mono text-sm text-primary">
            <span className="text-muted-foreground">$ ls</span> ./projects
          </h2>
          <span className="font-mono text-xs text-muted-foreground">
            {projects.length} {projects.length === 1 ? "entry" : "entries"}
          </span>
        </div>

        {loading ? (
          <div className="font-mono text-sm text-muted-foreground">loading<span className="blink-caret"></span></div>
        ) : projects.length === 0 ? (
          <div className="terminal-card rounded-md p-10 text-center">
            <p className="font-mono text-muted-foreground text-sm">
              <span className="text-destructive">err:</span> no projects found.
            </p>
            {isAdmin && (
              <Button onClick={openNew} className="mt-4 gap-1.5">
                <Plus className="h-4 w-4" /> add your first project
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <ProjectCard
                key={p.id}
                project={p}
                isAdmin={isAdmin}
                onEdit={openEdit}
                onDelete={setDeleting}
                index={i}
              />
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-border">
        <div className="container py-6 font-mono text-xs text-muted-foreground flex justify-between">
          <span>// end of transmission</span>
          <span className="text-primary">●</span>
        </div>
      </footer>

      <ProjectFormDialog open={dialogOpen} onOpenChange={setDialogOpen} project={editing} />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-mono">
              <span className="text-destructive">$ rm -rf</span> {deleting?.title}?
            </AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
