import { useEffect, useState } from "react";
import { z } from "zod";
import { Project } from "@/types/project";
import { collection, addDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const schema = z.object({
  title: z.string().trim().min(1, "Title required").max(120),
  description: z.string().trim().min(1, "Description required").max(2000),
  image_url: z.string().trim().url().max(500).or(z.literal("")),
  tech_stack: z.string().max(500),
  github_url: z.string().trim().url().max(500).or(z.literal("")),
  demo_url: z.string().trim().url().max(500).or(z.literal("")),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
}

const empty = { title: "", description: "", image_url: "", tech_stack: "", github_url: "", demo_url: "" };

export const ProjectFormDialog = ({ open, onOpenChange, project }: Props) => {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (project) {
      setForm({
        title: project.title,
        description: project.description,
        image_url: project.image_url ?? "",
        tech_stack: project.tech_stack.join(", "),
        github_url: project.github_url ?? "",
        demo_url: project.demo_url ?? "",
      });
    } else {
      setForm(empty);
    }
  }, [project, open]);

  const handleSave = async () => {
    const result = schema.safeParse(form);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    
    setSaving(true);
    
    const payload = {
      title: result.data.title,
      description: result.data.description,
      image_url: result.data.image_url || null,
      tech_stack: result.data.tech_stack
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      github_url: result.data.github_url || null,
      demo_url: result.data.demo_url || null,
    };

    try {
      if (project) {
        // Update existing project
        await updateDoc(doc(db, "projects", project.id), payload);
        toast.success("Project updated");
      } else {
        // Add new project
        await addDoc(collection(db, "projects"), {
          ...payload,
          display_order: 0,
          created_at: serverTimestamp()
        });
        toast.success("Project added");
      }
      onOpenChange(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-mono">
            <span className="text-primary">~/</span>
            {project ? "edit_project" : "new_project"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="title">title</Label>
            <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="description">description</Label>
            <Textarea
              id="description"
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="image">image url</Label>
            <Input id="image" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
          </div>
          <div>
            <Label htmlFor="tech">tech stack <span className="text-muted-foreground">(comma-separated)</span></Label>
            <Input id="tech" value={form.tech_stack} onChange={(e) => setForm({ ...form, tech_stack: e.target.value })} placeholder="React, Python, Arduino" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="gh">github url</Label>
              <Input id="gh" value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <Label htmlFor="demo">live demo url</Label>
              <Input id="demo" value={form.demo_url} onChange={(e) => setForm({ ...form, demo_url: e.target.value })} placeholder="https://..." />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "saving..." : project ? "update" : "deploy"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};