import { useState, useEffect } from "react";

const SLIDES = [
  "img1.jpeg",
  "img2.jpeg",
  "img3.jpeg",
  "img4.jpeg",
  "img5.jpeg",
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
