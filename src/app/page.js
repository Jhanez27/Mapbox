"use client";
import Image from "next/image";
import dynamic from "next/dynamic";
import Head from "next/head";
import "mapbox-gl/dist/mapbox-gl.css";

const Map = dynamic(() => import("../components/Map"), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <div className="text-2xl font-bold text-center w-full bg-amber-50 border-8">
        <h1 className="text-black">Mapbox with Next.js</h1>
      </div>
      <div
        className="w-full h-full
       border bg-white">
        <Map />
      </div>
    </div>
  );
}
