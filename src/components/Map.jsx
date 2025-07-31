"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";

// Replace with your Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

const destination = [124.80045936709885, 10.68223415714612];

const Map = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markerRef = useRef(null);
  const directionsRef = useRef(null);
  const dotRef = useRef(null); // hold dot DOM

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: destination,
      zoom: 15,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add directions plugin
    const directions = new MapboxDirections({
      accessToken: mapboxgl.accessToken,
      unit: "metric",
      profile: "mapbox/driving",
      alternatives: false,
      geometries: "geojson",
      controls: {
        inputs: false,
        instructions: true,
      },
    });

    map.current.addControl(directions, "top-left");
    directionsRef.current = directions;

    directions.on("route", (e) => {
      const route = e.route[0];
      const durationMinutes = (route.duration / 60).toFixed(1);
      const distanceKm = (route.distance / 1000).toFixed(2);
      console.log(`ETA: ${durationMinutes} mins | Distance: ${distanceKm} km`);
    });

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const coords = [longitude, latitude];

        // Create pulsating dot once
        if (!dotRef.current) {
          const dot = document.createElement("div");
          dot.className = "pulsating-dot";
          dotRef.current = dot;
        }

        if (!markerRef.current) {
          markerRef.current = new mapboxgl.Marker({ element: dotRef.current })
            .setLngLat(coords)
            .addTo(map.current);
        } else {
          markerRef.current.setLngLat(coords);
        }

        directionsRef.current?.setOrigin(coords);
        directionsRef.current?.setDestination(destination);

        map.current.flyTo({ center: coords, speed: 1.2, curve: 1 });
      },
      (err) => console.error("Geolocation error", err),
      { enableHighAccuracy: true }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return (
    <>
      <style jsx>{`
        .pulsating-dot {
          width: 20px;
          height: 20px;
          background: #007aff;
          border-radius: 50%;
          box-shadow: 0 0 0 rgba(0, 122, 255, 0.4);
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(0.9);
            box-shadow: 0 0 0 0 rgba(0, 122, 255, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 10px rgba(0, 122, 255, 0);
          }
          100% {
            transform: scale(0.9);
            box-shadow: 0 0 0 0 rgba(0, 122, 255, 0);
          }
        }
      `}</style>

      <div className="w-full h-[500px]">
        <div ref={mapContainer} className="w-full h-full" />
      </div>
    </>
  );
};

export default Map;
