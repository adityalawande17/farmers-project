import { useState, useEffect } from "react";

const SLIDES = [
  "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1280&h=720&q=80",
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1280&h=720&q=80",
  "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1280&h=720&q=80",
  "https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=1280&h=720&q=80",
  "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1280&h=720&q=80",
];

export default function FarmSlideshow() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setCurrent((c) => (c + 1) % SLIDES.length),
      4000,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-4xl px-6">
      {/* 16:9 image container */}
      <div className="relative w-full aspect-video overflow-hidden">
        {SLIDES.map((url, i) => (
          <img
            key={i}
            src={url}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              i === current ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

      {/* Caption */}
      <div className="text-center">
        <p className="text-gray-500 text-sm tracking-wide">
          Some moments from my farm
        </p>

        {/* Passive dot indicators */}
        <div className="flex justify-center gap-2 mt-3">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === current ? "w-5 bg-green-500" : "w-1.5 bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
