"use client";

import dynamic from "next/dynamic";
import g from "./generator.module.css";

function Skeleton() {
  return (
    <div className={g.shell} aria-busy="true" aria-label="Memuat generator">
      <div className={`${g.editor} ${g.skeleton}`} style={{ minHeight: 640 }} />
      <div className={g.previewCol}>
        <div className={`${g.preview} ${g.skeleton}`} style={{ minHeight: 640 }} />
      </div>
    </div>
  );
}

// The studio reads localStorage and canvas APIs on first render, so it is
// rendered on the client only; the server sends a same-sized skeleton.
const GeneratorApp = dynamic(() => import("./GeneratorApp"), { ssr: false, loading: Skeleton });

export default function QRGenerator() {
  return (
    <section id="generator" className={`container ${g.generator}`} aria-label="Generator kode QR">
      <GeneratorApp />
    </section>
  );
}
