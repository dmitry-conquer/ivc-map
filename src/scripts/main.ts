import "../styles/main.scss";
import { GoogleMap } from "./Map";

document.addEventListener("DOMContentLoaded", async (): Promise<void> => {
  /**
   * Code here
   */
  const map = new GoogleMap("#map", {
    apiKey: "AIzaSyCYon71vBnNK-0ghe9mXGgAmnp_V6rsqzE",
    mapId: "dd2ae071ffad46372ed83dfa",
    center: { lat: 40, lng: 0 },
    zoom: 2.1,
  });

  await map.init();

  // Завантажуємо GeoJSON дані з публічних API
  // Використовуємо GitHub репозиторії з GeoJSON даними для країн
  
  try {
    // США
    await map.loadGeoJson("https://raw.githubusercontent.com/johan/world.geo.json/master/countries/USA.geo.json");
    
    // Канада
    await map.loadGeoJson("https://raw.githubusercontent.com/johan/world.geo.json/master/countries/CAN.geo.json");
    
    // Великобританія
    await map.loadGeoJson("https://raw.githubusercontent.com/johan/world.geo.json/master/countries/GBR.geo.json");
    
    // Німеччина
    await map.loadGeoJson("https://raw.githubusercontent.com/johan/world.geo.json/master/countries/DEU.geo.json");
    
    // Китай
    await map.loadGeoJson("https://raw.githubusercontent.com/johan/world.geo.json/master/countries/CHN.geo.json");
  } catch (error) {
    console.warn("Помилка завантаження GeoJSON з окремих файлів, використовуємо альтернативне джерело:", error);
    
    // Альтернативне джерело - використовуємо фільтрацію з великого файлу
    try {
      // Завантажуємо весь світ і фільтруємо потрібні країни
      await map.loadGeoJsonWithFilter(
        "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson",
        ["USA", "United States", "CAN", "Canada", "GBR", "United Kingdom", "DEU", "Germany", "CHN", "China"]
      );
    } catch (altError) {
      console.error("Не вдалося завантажити GeoJSON дані:", altError);
      
      // Останній варіант - використовуємо інший публічний репозиторій
      try {
        await map.loadGeoJson("https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson");
      } catch (finalError) {
        console.error("Всі спроби завантажити GeoJSON не вдалися:", finalError);
      }
    }
  }

  // Додаємо маркери
  await map.addMarker({ lat: 40.7128, lng: -74.006 }, "Маркер 1");
  await map.addMarker({ lat: 34.0522, lng: -118.2437 }, "Маркер 2");
  await map.addMarker({ lat: 51.5074, lng: -0.1278 }, "Маркер 3");
  await map.addMarker({ lat: 52.52, lng: 13.405 }, "Маркер 4");
  await map.addMarker({ lat: 39.9042, lng: 116.4074 }, "Маркер 5");
});
