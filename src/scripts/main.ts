import "../styles/main.scss";
import { GoogleMap } from "./Map";

document.addEventListener("DOMContentLoaded", async (): Promise<void> => {
  const map = new GoogleMap("#map", {
    apiKey: "AIzaSyCYon71vBnNK-0ghe9mXGgAmnp_V6rsqzE",
    mapId: "dd2ae071ffad46372ed83dfa",
    center: { lat: 40, lng: 4 },
    zoom: 2.1,
  });

  await map.init();
  await map.loadGeoJson(["USA", "CAN", "GBR", "DEU", "CHN"]);
  map.addMarkers([
    {
      position: { lat: 40.7128, lng: -74.006 },
      data: [
        {
          title: "IVC WOD",
          areas: ["Greenville, SC", "United States"],
          services: ["Tablets", "Packaging", "Softgels", "R&D Center"],
        },
        {
          title: "IVC DDR",
          areas: ["Greenville, SC", "United States"],
          services: ["Tablets", "Packaging", "Softgels", "R&D Center", "Gummies", "Capsules"],
        },
        {
          title: "IVC HQ",
          areas: ["Newport, CA", "United States"],
          services: ["Tablets", "Packaging"],
        },
      ],
    },
    {
      position: { lat: 45.7128, lng: -71.006 },
      data: [
        {
          title: "IVC WOD",
          areas: ["Greenville, SC", "United States"],
          services: ["Tablets", "Packaging", "Softgels", "R&D Center"],
        },
        {
          title: "IVC DDR",
          areas: ["Greenville, SC", "United States"],
          services: ["Tablets", "Packaging", "Softgels", "R&D Center", "Gummies", "Capsules"],
        },
        {
          title: "IVC HQ",
          areas: ["Newport, CA", "United States"],
          services: ["Tablets", "Packaging"],
        },
      ],
    },
  ]);
});
