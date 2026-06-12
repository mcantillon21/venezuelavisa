"use client";

import { useEffect, useRef } from "react";
import { Input } from "@/components/ui";

/* Address input with Google Places Autocomplete (restricted to Venezuela)
   when NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is configured; a plain input
   otherwise. The parent only ever sees a string. */

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

declare global {
  interface Window {
    google?: {
      maps?: {
        places?: {
          Autocomplete: new (
            input: HTMLInputElement,
            opts: object,
          ) => { addListener: (ev: string, cb: () => void) => void; getPlace: () => { formatted_address?: string } };
        };
      };
    };
  }
}

export function AddressField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!KEY || !ref.current) return;
    let cancelled = false;

    if (!document.querySelector("script[data-vv-places]")) {
      const s = document.createElement("script");
      s.src = `https://maps.googleapis.com/maps/api/js?key=${KEY}&libraries=places&loading=async`;
      s.async = true;
      s.dataset.vvPlaces = "1";
      document.head.appendChild(s);
    }

    // with loading=async the places lib registers AFTER script onload:
    // poll until the class exists, then attach
    const t = setInterval(() => {
      const Autocomplete = window.google?.maps?.places?.Autocomplete;
      if (cancelled || !Autocomplete || !ref.current) return;
      clearInterval(t);
      // no `types` restriction: travelers type hotels (establishments),
      // not just street addresses
      const ac = new Autocomplete(ref.current, {
        componentRestrictions: { country: "ve" },
        fields: ["formatted_address", "name"],
      });
      ac.addListener("place_changed", () => {
        const addr = ac.getPlace()?.formatted_address;
        if (addr) onChange(addr);
      });
    }, 120);
    setTimeout(() => clearInterval(t), 10000);

    return () => {
      cancelled = true;
      clearInterval(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Input
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete="street-address"
    />
  );
}
