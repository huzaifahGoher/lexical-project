import React from "react";

const Contact = () => {
  return (
    <div id="contact" className="w-full mb-20 px-6">
      <div className="max-w-4xl m-auto flex flex-col">
        <p className="font-mono text-xs text-accent tracking-widest uppercase mb-3">
          Contact
        </p>
        <div className="flex flex-wrap gap-8">
            {[
              { label: 'GitHub', handle: '@huzaifahGoher', href: 'https://github.com/huzaifahGoher' },
              { label: 'LinkedIn', handle: 'Huzaifah Goher', href: 'https://www.linkedin.com/in/huzaifah-goher-1b685023b/' },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-1"
              >
                <span className="font-mono text-[10px] text-paper/30 tracking-widest uppercase">
                  {s.label}
                </span>
                <span className="font-mono text-sm text-paper/60 group-hover:text-accent transition-colors underline-accent">
                  {s.handle}
                </span>
              </a>
            ))}
          </div>
      </div>
    </div>
  );
};

export default Contact;
