import React from "react";
import Project from "../project/Project";

const projects = [
  {
    number: "01",
    title: "Lexical Editor",
    description:
      "A rich text editor built with React and Meta's Lexical framework. Features real-time collaboration via Yjs, custom nodes (links, images, tables), floating menus, a responsive toolbar with overflow handling, and serialization support.",
    tags: ["Next.js", "TypeScript", "Lexical", "Yjs", "Design Library"],
    link: "https://lexical-project-huzaifah.vercel.app",
    repo: "https://github.com/huzaifahGoher/lexical-project",
    featured: true,
    year: "2025",
  },
  {
    number: "02",
    title: "Three.js Data Globe",
    description:
      "An interactive 3D globe visualization with real country borders from GeoJSON, data-driven population spikes, raycasting tooltips, animated camera intro, and play/pause controls. Built with a clean useThreeScene hook architecture.",
    tags: ["React", "Three.js", "TypeScript", "Vite", "Design Library"],
    link: "https://threejs-project-steel.vercel.app",
    repo: "https://github.com/huzaifahGoher/threejs-project",
    featured: true,
    year: "2025",
  },
  {
    number: "03",
    title: "Design Library",
    description:
      "A reusable React component library with a full theming system (light/dark), semantic color tokens, and components like Button, Checkbox, Select, and Slider. Published on npm and used across multiple projects.",
    tags: ["React", "TypeScript", "Rollup", "npm"],
    link: "",
    repo: "https://github.com/huzaifahGoher/design-library",
    featured: true,
    year: "2025",
  },
];

const Projects = () => {
  return (
    <div id="work" className="w-full px-6">
      <div className="max-w-4xl m-auto flex flex-1 flex-col items-center pb-32 ">
        <div className="flex flex-col justify-between mb-20 gap-10 w-full">
          <div>
            <p className="font-mono text-xs text-accent tracking-widest uppercase mb-3">
              Work
            </p>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold">
              Projects<span className="text-accent">.</span>
            </h2>
          </div>
          <div className="">
            {projects.map((item: any, index: number) => (
              <Project project={item} key={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;
