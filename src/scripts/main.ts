import "../styles/main.scss";
import { GoogleMap } from "./Map";

declare const mapData: {
  apiKey: string;
  mapId: string;
  coveredAreas: string[];
  markers: { position: { lat: number; lng: number }; data: { title: string; areas: string[]; services: string[] }[] }[];
};

document.addEventListener("DOMContentLoaded", async (): Promise<void> => {
  const mapContainer = document.getElementById("map");
  if (mapContainer && mapData) {
    const map = new GoogleMap("#map", {
      apiKey: mapData.apiKey,
      mapId: mapData.mapId,
      center: { lat: 45, lng: 7 },
      zoom: 2.1,
    });

    await map.init();
    await map.loadGeoJson(mapData.coveredAreas);
    map.addMarkers(mapData.markers);
  }
});
