import React from "react";

const Project = ({ project }: { project: any }) => {
  return (
    <div
      key={project.number}
      className="group grid grid-cols-1 md:grid-cols-[80px_1fr_auto] gap-4 md:gap-6 items-start py-8 border-t border-white/5 hover:bg-white/[0.02] transition-colors duration-300 px-4 -mx-4 rounded-sm"
    >
      {/* Number */}
      <span className="hidden md:block font-mono text-xs text-paper/20 pt-1">
        {project.number}
      </span>

      {/* Content */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h3 className="font-display text-xl md:text-2xl font-bold group-hover:text-accent transition-colors duration-200">
            {project.title}
          </h3>
          {project.featured && (
            <span className="text-[10px] font-mono text-accent/70 border border-accent/20 px-2 py-0.5 rounded-sm">
              Featured
            </span>
          )}
        </div>
        <p className="text-paper/50 text-sm leading-relaxed mb-4">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag:any) => (
            <span
              key={tag}
              className="text-[11px] font-mono text-paper/40 bg-white/5 px-2.5 py-1 rounded-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="flex flex-row md:flex-col items-start md:items-end gap-3 pt-1">
        <span className="font-mono text-xs text-paper/20">{project.year}</span>
        <div className="flex items-center gap-3 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
          <a
            href={project.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-paper/40 hover:text-accent transition-colors"
          >
            Repo ↗
          </a>
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-accent"
            >
              Live ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default Project;
