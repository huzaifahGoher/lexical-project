"use client";
import Image from "next/image";
import React, { useState } from "react";

export const Button = ({
  onClick,
  image,
  title,
  styles,
}: {
  onClick: () => void;
  image?: string;
  title?: string;
  styles?: any;
}) => {
  const [hovering, setHovering] = useState(false);
  return (
    <button
      className="bg-(--muted)"
      onClick={onClick}
      onMouseEnter={() => {
        setHovering(true);
      }}
      onMouseLeave={() => {
        setHovering(false);
      }}
      style={{
        ...styles,
        padding: "3px",
        border: "1px solid var(--muted-foreground)",
        borderRadius: "5px",
        cursor: "pointer",
        backgroundColor: hovering ? "var(--ring)" : "",
      }}
    >
      {image && <Image src={image} alt={title || ""} />}
      {title && <span>{title}</span>}
    </button>
  );
};
