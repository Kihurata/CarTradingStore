"use client";

import { useState, useRef, useMemo } from "react";
import Image from "next/image";

interface GalleryProps {
  images: string[];
  className?: string;
}

export default function Gallery({ images, className = "" }: GalleryProps) {
  const [index, setIndex] = useState(0);
  const thumbsRef = useRef<HTMLDivElement | null>(null);

  const deduped = useMemo(
    () => Array.from(new Set(images.filter(Boolean))),
    [images]
  );

  if (!deduped.length) {
    return (
      <div className="relative w-full h-80 rounded-lg border bg-gray-100 flex items-center justify-center text-gray-500">
        Không có ảnh
      </div>
    );
  }

  const total = deduped.length;
  const current = deduped[index];

  const go = (delta: number) => {
    setIndex((i) => {
      const next = Math.max(0, Math.min(total - 1, i + delta));
      const el = thumbsRef.current?.querySelector<HTMLButtonElement>(
        `[data-thumb="${next}"]`
      );
      el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      return next;
    });
  };

  return (
    <div className={`grid grid-cols-12 gap-4 ${className}`}>
      {/* Ảnh lớn */}
      <div className="col-span-12 md:col-span-9 relative">
        <div className="relative w-full h-[420px] md:h-[520px] rounded-lg overflow-hidden border">
          <Image
            src={current}
            alt={`Ảnh ${index + 1}/${total}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 66vw"
            priority
          />
          <div className="absolute bottom-2 right-2 rounded-md bg-black/60 text-white text-xs px-2 py-1">
            {index + 1}/{total}
          </div>
          <button
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white grid place-items-center hover:bg-black/70"
            onClick={() => go(-1)}
            disabled={index === 0}
          >
            ‹
          </button>
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white grid place-items-center hover:bg-black/70"
            onClick={() => go(+1)}
            disabled={index === total - 1}
          >
            ›
          </button>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="col-span-12 md:col-span-3">
        <div ref={thumbsRef} className="flex md:flex-col gap-2 max-h-[520px] md:overflow-y-auto hide-scrollbar">
          {deduped.map((url, i) => (
            <button
              key={url + i}
              data-thumb={i}
              onClick={() => setIndex(i)}
              className={`relative w-28 h-20 md:w-full md:h-24 shrink-0 rounded-md overflow-hidden border ${
                i === index ? "ring-2 ring-red-500 border-red-500" : "border-gray-200"
              }`}
            >
              <Image src={url} alt={`Thumb ${i + 1}`} fill className="object-cover" sizes="(max-width: 768px) 112px, 240px"/>
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          width: 0;
          height: 0;
        }
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>
    </div>
  );
}
