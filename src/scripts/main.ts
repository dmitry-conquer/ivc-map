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

  // Add markers with popup data
  await map.addMarker({ lat: 40.7128, lng: -74.006 }, [
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
  ]);
  await map.addMarker({ lat: 41.7128, lng: -79.006 }, [
    {
      title: "IVC WOD",
      areas: ["South Derbyshire, Swadlincote", "Winnipeg, Manitoba"],
      services: ["Canada", "Packaging", "Capsules (VMS/OTC)", "R&D Center"],
    },
  ]);
});
