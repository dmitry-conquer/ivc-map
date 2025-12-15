import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

type MapOptions = {
  apiKey: string;
  center: { lat: number; lng: number };
  zoom?: number;
  mapId?: string;
};

export class GoogleMap {
  private container: HTMLElement;
  private options: MapOptions;
  private map: google.maps.Map | null = null;
  private dataLayer: google.maps.Data | null = null;

  constructor(container: HTMLElement | string, options: MapOptions) {
    this.container = typeof container === "string" ? (document.querySelector(container) as HTMLElement) : container;

    if (!this.container) {
      throw new Error("Map container not found");
    }

    this.options = {
      zoom: 10,
      ...options,
    };

    setOptions({
      key: this.options.apiKey,
      v: "weekly",
    });
  }

  private getZoom(): number {
    let mapZoom: number;
    const width = window.innerWidth;
    if (width < 375) {
      mapZoom = 0.7;
    } else if (width >= 375 && width < 480) {
      mapZoom = 0.75;
    } else if (width >= 480 && width < 576) {
      mapZoom = 0.9;
    } else if (width >= 576 && width < 992) {
      mapZoom = 1.7;
    } else if (width >= 992 && width < 1140) {
      mapZoom = 2;
    } else if (width >= 1140 && width < 1440) {
      mapZoom = 2.1;
    } else {
      mapZoom = 2.1;
    }
    return mapZoom;
  }

  async init(): Promise<void> {
    try {
      const { Map } = await importLibrary("maps");

      const mapStyles: google.maps.MapTypeStyle[] = [
        {
          featureType: "all",
          elementType: "geometry",
          stylers: [{ color: "#e5e5e5" }, { lightness: 50 }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#ffffff" }],
        },
        {
          featureType: "landscape",
          elementType: "geometry",
          stylers: [{ color: "#e5e5e5" }],
        },
        {
          featureType: "administrative",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "poi",
          elementType: "all",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "road",
          elementType: "all",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "transit",
          elementType: "all",
          stylers: [{ visibility: "off" }],
        },
      ];

      const mapZoom = this.getZoom();

      this.map = new Map(this.container, {
        center: this.options.center,
        zoom: mapZoom,
        mapId: this.options.mapId,
        styles: mapStyles,
        disableDefaultUI: true,
        zoomControl: false,
        scrollwheel: false,
        disableDoubleClickZoom: true,
        gestureHandling: "none",
        minZoom: mapZoom,
        maxZoom: mapZoom,
        draggable: false,
      });

      // Ініціалізуємо Data Layer для GeoJSON
      this.dataLayer = new google.maps.Data();
      this.dataLayer.setMap(this.map);

      // Налаштовуємо стиль для GeoJSON об'єктів
      this.dataLayer.setStyle({
        fillColor: "#7FBD00",
        fillOpacity: 1.0,
        strokeColor: "#7FBD00",
        strokeWeight: 0,
        strokeOpacity: 0,
      });

      // Блокуємо всі спроби змінити зум
      this.map.addListener("zoom_changed", () => {
        if (this.map) {
          const mapZoom = this.getZoom();
          const currentZoom = this.map.getZoom();
          if (currentZoom !== mapZoom) {
            this.map.setZoom(mapZoom);
            // Перемальовуємо карту після зміни зум
            setTimeout(() => {
              if (this.map) {
                google.maps.event.trigger(this.map, "resize");
              }
            }, 100);
          }
        }
      });

      // Блокуємо подвійний клік
      this.map.addListener("dblclick", (e: google.maps.MapMouseEvent) => {
        e.stop();
      });

      // Обробка зміни розміру вікна для коректного відображення карти
      let resizeTimeout: ReturnType<typeof setTimeout>;
      window.addEventListener("resize", () => {
        if (this.map) {
          // Debounce для оптимізації
          clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(() => {
            if (this.map) {
              const mapZoom = this.getZoom();
              const currentZoom = this.map.getZoom();
              
              // Оновлюємо розміри карти
              google.maps.event.trigger(this.map, "resize");
              
              // Оновлюємо зум тільки якщо він змінився
              if (currentZoom !== mapZoom) {
                this.map.setZoom(mapZoom);
                this.map.setOptions({
                  minZoom: mapZoom,
                  maxZoom: mapZoom,
                });
                
                // Додатково перемальовуємо після зміни зум
                setTimeout(() => {
                  if (this.map) {
                    google.maps.event.trigger(this.map, "resize");
                  }
                }, 150);
              } else {
                // Якщо зум не змінився, просто оновлюємо обмеження
                this.map.setOptions({
                  minZoom: mapZoom,
                  maxZoom: mapZoom,
                });
              }
            }
          }, 250);
        }
      });
    } catch (error) {
      console.error("Error loading Google Maps:", error);
      throw error;
    }
  }

  async addMarker(
    position: { lat: number; lng: number },
    title?: string
  ): Promise<google.maps.marker.AdvancedMarkerElement | null> {
    if (!this.map) {
      throw new Error("Map not initialized. Call init() first.");
    }

    try {
      const { AdvancedMarkerElement, PinElement } = (await importLibrary("marker")) as google.maps.MarkerLibrary;

      const pinElement = new PinElement({
        background: "#000000",
        borderColor: "#ffffff",
        glyphColor: "#ffffff",
        scale: 1.2,
      });

      const marker = new AdvancedMarkerElement({
        map: this.map,
        position: position,
        title: title,
        content: pinElement.element,
      });

      return marker;
    } catch (error) {
      console.error("Error adding marker:", error);
      throw error;
    }
  }

  async loadGeoJson(url: string, fillColor: string = "#7FBD00"): Promise<void> {
    if (!this.dataLayer) {
      throw new Error("Map not initialized. Call init() first.");
    }

    try {
      // Завантажуємо GeoJSON з URL
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const geoJson = await response.json();

      this.dataLayer.addGeoJson(geoJson);
      this.dataLayer.setStyle({
        fillColor: fillColor,
        fillOpacity: 1.0,
        strokeColor: fillColor,
        strokeWeight: 0,
        strokeOpacity: 0,
      });
    } catch (error) {
      console.error("Error loading GeoJSON:", error);
      throw error;
    }
  }

  async loadGeoJsonWithFilter(url: string, countryCodes: string[], fillColor: string = "#7FBD00"): Promise<void> {
    if (!this.dataLayer) {
      throw new Error("Map not initialized. Call init() first.");
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const geoJson = await response.json();

      // Фільтруємо тільки потрібні країни
      if (geoJson.type === "FeatureCollection" && Array.isArray(geoJson.features)) {
        const filteredFeatures = geoJson.features.filter((feature: any) => {
          const code = feature.properties?.ISO_A2 || feature.properties?.ISO_A3 || feature.properties?.NAME;
          return countryCodes.some(
            codeToMatch =>
              code === codeToMatch || feature.properties?.NAME?.toLowerCase().includes(codeToMatch.toLowerCase())
          );
        });

        const filteredGeoJson = {
          ...geoJson,
          features: filteredFeatures,
        };

        this.dataLayer.addGeoJson(filteredGeoJson);
        this.dataLayer.setStyle({
          fillColor: fillColor,
          fillOpacity: 1.0,
          strokeColor: fillColor,
          strokeWeight: 0,
          strokeOpacity: 0,
        });
      }
    } catch (error) {
      console.error("Error loading filtered GeoJSON:", error);
      throw error;
    }
  }

  async loadGeoJsonFromObject(geoJson: object, fillColor: string = "#7FBD00"): Promise<void> {
    if (!this.dataLayer) {
      throw new Error("Map not initialized. Call init() first.");
    }

    try {
      this.dataLayer.addGeoJson(geoJson);
      this.dataLayer.setStyle({
        fillColor: fillColor,
        fillOpacity: 1.0,
        strokeColor: fillColor,
        strokeWeight: 0,
        strokeOpacity: 0,
      });
    } catch (error) {
      console.error("Error loading GeoJSON from object:", error);
      throw error;
    }
  }

  getMap(): google.maps.Map | null {
    return this.map;
  }
}
