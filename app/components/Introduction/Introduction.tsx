import React from "react";
import "./../../globals.css";

const Introduction = () => {
  return (
    <div className="min-h-screen flex items-center ">
      {/* grid */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-accent) 1px, transparent 1px), linear-gradient(90deg, var(--color-accent) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        ></div>
      </div>
      <div className="m-auto px-6">
        <div className="max-w-4xl flex flex-col gap-10">
          <div className="flex flex-col gap-10 pointer-events-none">
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl/35 font-display font-bold tracking-tight text-gradient animate-fade-in">
              Crafting Digital Experiences.
            </h1>
          </div>
          <div className="text-paper/60 text-base md:text-lg lg:text-xl animate-fade-up">
            <p>
              <span className="text-paper font-medium">Huzaifah Goher</span> I'm
              a Software Engineer graduate from COMSATS University, where I
              built a VTuber platform as my Final Year Project using the MERN
              stack, Three.js, and Kalidokit — blending real-time 3D rendering
              with motion capture in the browser.
            </p>
            <p className="mt-3">
              I'm currently working at ELIXIR Technologies, developing rich text
              editing experiences with React and the Lexical library.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 animate-fade-up delay-400">
            <a
              href="#work"
              className="group flex items-center gap-3 bg-accent text-ink font-mono text-sm font-medium px-7 py-3.5 hover:bg-accent/90 transition-all duration-200"
            >
              View My Work
              <span className="group-hover:translate-x-1 transition-transform duration-200">
                →
              </span>
            </a>
            <a
              href="#contact"
              className="flex items-center gap-3 border border-paper/20 text-paper/70 font-mono text-sm px-7 py-3.5 hover:border-accent/40 hover:text-accent transition-all duration-200"
            >
              Get In Touch
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Introduction;
