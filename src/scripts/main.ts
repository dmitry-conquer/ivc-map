import "../styles/main.scss";
import { GoogleMap } from "./Map";
import MicroModal from "micromodal";

document.addEventListener("DOMContentLoaded", async (): Promise<void> => {
  // Initialize MicroModal and make it globally available
  MicroModal.init({
    openTrigger: "data-micromodal-trigger",
    closeTrigger: "data-micromodal-close",
    openClass: "is-open",
    disableScroll: true,
    disableFocus: false,
    awaitOpenAnimation: false,
    awaitCloseAnimation: true,
  });

  // Make MicroModal available globally for Map class
  (window as any).MicroModal = MicroModal;

  const map = new GoogleMap("#map", {
    apiKey: "AIzaSyCYon71vBnNK-0ghe9mXGgAmnp_V6rsqzE",
    mapId: "dd2ae071ffad46372ed83dfa",
    center: { lat: 40, lng: 4 },
    zoom: 2.1,
  });

  await map.init();

  try {
    await map.loadGeoJson("https://raw.githubusercontent.com/johan/world.geo.json/master/countries/USA.geo.json");

    await map.loadGeoJson("https://raw.githubusercontent.com/johan/world.geo.json/master/countries/CAN.geo.json");

    await map.loadGeoJson("https://raw.githubusercontent.com/johan/world.geo.json/master/countries/GBR.geo.json");

    await map.loadGeoJson("https://raw.githubusercontent.com/johan/world.geo.json/master/countries/DEU.geo.json");

    await map.loadGeoJson("https://raw.githubusercontent.com/johan/world.geo.json/master/countries/CHN.geo.json");
  } catch (error) {
    console.warn("Error loading GeoJSON from individual files, using alternative source:", error);

    try {
      await map.loadGeoJsonWithFilter(
        "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson",
        ["USA", "United States", "CAN", "Canada", "GBR", "United Kingdom", "DEU", "Germany", "CHN", "China"]
      );
    } catch (altError) {
      console.error("Failed to load GeoJSON data:", altError);

      try {
        await map.loadGeoJson("https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson");
      } catch (finalError) {
        console.error("All attempts to load GeoJSON failed:", finalError);
      }
    }
  }

  // Add markers with popup data
  await map.addMarker(
    { lat: 40.7128, lng: -74.006 },
    "Marker 1",
    {
      title: "New York",
      content: "New York is the most populous city in the United States. It is located in the state of New York.",
    }
  );
  await map.addMarker(
    { lat: 34.0522, lng: -118.2437 },
    "Marker 2",
    {
      title: "Los Angeles",
      content: "Los Angeles is a sprawling Southern California city and the center of the nation's film and television industry.",
    }
  );
  await map.addMarker(
    { lat: 51.5074, lng: -0.1278 },
    "Marker 3",
    {
      title: "London",
      content: "London, the capital of England and the United Kingdom, is a 21st-century city with history stretching back to Roman times.",
    }
  );
  await map.addMarker(
    { lat: 52.52, lng: 13.405 },
    "Marker 4",
    {
      title: "Berlin",
      content: "Berlin, Germany's capital, dates to the 13th century. Reminders of the city's turbulent 20th-century history include its Holocaust memorial.",
    }
  );
  await map.addMarker(
    { lat: 39.9042, lng: 116.4074 },
    "Marker 5",
    {
      title: "Beijing",
      content: "Beijing, China's massive capital, has history stretching back 3 millennia. Yet it's known as much for modern architecture as its ancient sites.",
    }
  );
});
