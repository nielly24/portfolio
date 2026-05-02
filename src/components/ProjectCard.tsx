import { Github, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { Project } from "@/types/project";
import { Button } from "@/components/ui/button";

interface Props {
  project: Project;
  isAdmin: boolean;
  onEdit: (p: Project) => void;
  onDelete: (p: Project) => void;
  index: number;
}

export const ProjectCard = ({ project, isAdmin, onEdit, onDelete, index }: Props) => {
  return (
    <article
      className="terminal-card group relative overflow-hidden rounded-md transition-all duration-300 animate-fade-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {project.image_url && (
        <div className="aspect-video overflow-hidden border-b border-border bg-muted">
          <img
            src={project.image_url}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
            <span className="text-primary">$</span> {project.title}
          </h3>
          {isAdmin && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onEdit(project)} aria-label="Edit">
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(project)} aria-label="Delete">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {project.description}
        </p>

        {project.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {project.tech_stack.map((tech) => (
              <span
                key={tech}
                className="text-xs font-mono px-2 py-0.5 rounded-sm bg-secondary text-primary border border-border"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <Github className="h-3.5 w-3.5" /> source
            </a>
          )}
          {project.demo_url && (
            <a
              href={project.demo_url}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" /> live
            </a>
          )}
        </div>
      </div>
    </article>
  );
};
