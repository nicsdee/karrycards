"use client";

import { useEffect, useMemo, useState } from "react";
import { getBrandLogoSources } from "../lib/brand-assets";

type BrandLogoImageProps = {
  brand: string;
  className: string;
  color?: string;
};

export function BrandLogoImage({ brand, className, color }: BrandLogoImageProps) {
  const sources = useMemo(() => getBrandLogoSources(brand, color), [brand, color]);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [logoFailed, setLogoFailed] = useState(false);
  const src = sources[sourceIndex];

  useEffect(() => {
    setSourceIndex(0);
    setLogoFailed(false);
  }, [sources, brand]);

  if (!src || logoFailed) {
    return (
      <span aria-hidden="true" className={`${className} brand-logo-fallback`}>
        {brand}
      </span>
    );
  }

  return (
    <img
      alt=""
      aria-hidden="true"
      className={className}
      src={src}
      onError={() => {
        setSourceIndex((current) => {
          if (current >= sources.length - 1) {
            setLogoFailed(true);
            return current;
          }

          return current + 1;
        });
      }}
    />
  );
}
