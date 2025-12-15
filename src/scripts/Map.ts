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
      const mapZoom = this.getZoom();

      this.map = new Map(this.container, {
        center: this.options.center,
        zoom: mapZoom,
        mapId: this.options.mapId,
        disableDefaultUI: true,
        zoomControl: false,
        scrollwheel: false,
        disableDoubleClickZoom: true,
        gestureHandling: "none",
        minZoom: mapZoom,
        maxZoom: mapZoom,
        draggable: false,
      });

      this.dataLayer = new google.maps.Data();
      this.dataLayer.setMap(this.map);

      this.dataLayer.setStyle({
        fillColor: "#7FBD00",
        fillOpacity: 1.0,
        strokeColor: "#7FBD00",
        strokeWeight: 0,
        strokeOpacity: 0,
      });

      this.map.addListener("zoom_changed", () => {
        if (this.map) {
          const mapZoom = this.getZoom();
          const currentZoom = this.map.getZoom();
          if (currentZoom !== mapZoom) {
            this.map.setZoom(mapZoom);
            setTimeout(() => {
              if (this.map) {
                google.maps.event.trigger(this.map, "resize");
              }
            }, 100);
          }
        }
      });

      this.map.addListener("dblclick", (e: google.maps.MapMouseEvent) => {
        e.stop();
      });

      let resizeTimeout: ReturnType<typeof setTimeout>;
      window.addEventListener("resize", () => {
        if (this.map) {
          clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(() => {
            if (this.map) {
              const mapZoom = this.getZoom();
              const currentZoom = this.map.getZoom();

              google.maps.event.trigger(this.map, "resize");

              if (currentZoom !== mapZoom) {
                this.map.setZoom(mapZoom);
                this.map.setOptions({
                  minZoom: mapZoom,
                  maxZoom: mapZoom,
                });

                setTimeout(() => {
                  if (this.map) {
                    google.maps.event.trigger(this.map, "resize");
                  }
                }, 150);
              } else {
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
    title?: string,
    popupData?: { title: string; content: string }
  ): Promise<google.maps.marker.AdvancedMarkerElement | null> {
    if (!this.map) {
      throw new Error("Map not initialized. Call init() first.");
    }

    try {
      const { AdvancedMarkerElement } = (await importLibrary("marker")) as google.maps.MarkerLibrary;

      const svgMarker = document.createElement("div");
      svgMarker.innerHTML = `
        <svg width="26" height="33" viewBox="0 0 26 33" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.6562 30.5122C14.7907 26.9801 17.5958 24.3739 19.8301 21.9409C22.4299 19.1098 24.3123 16.4805 24.3125 12.6567C24.3125 6.22699 19.086 1.00049 12.6562 1.00049C6.2265 1.00049 1 6.22699 1 12.6567C1.00015 16.4805 2.88257 19.1098 5.48242 21.9409C7.71672 24.3739 10.5218 26.9801 12.6562 30.5122Z" fill="black" stroke="black" stroke-width="2" stroke-miterlimit="10"/>
          <path d="M12.6562 17.9868C15.5935 17.9868 17.9844 15.5959 17.9844 12.6587C17.9844 9.72144 15.5935 7.33057 12.6562 7.33057C9.719 7.33057 7.32812 9.72144 7.32812 12.6587C7.32813 15.5959 9.719 17.9868 12.6562 17.9868Z" stroke="white" stroke-width="2" stroke-miterlimit="10"/>
        </svg>
      `;
      svgMarker.style.width = "26px";
      svgMarker.style.height = "33px";
      svgMarker.style.display = "flex";
      svgMarker.style.alignItems = "center";
      svgMarker.style.justifyContent = "center";
      svgMarker.style.cursor = "pointer";

      const marker = new AdvancedMarkerElement({
        map: this.map,
        position: position,
        title: title,
        content: svgMarker,
      });

      // Add click handler to open popup
      if (popupData) {
        marker.addListener("click", () => {
          this.openPopup(popupData);
        });
      }

      return marker;
    } catch (error) {
      console.error("Error adding marker:", error);
      throw error;
    }
  }

  private openPopup(data: { title: string; content: string }): void {
    const popup = document.getElementById("map-popup");
    const titleElement = popup?.querySelector(".map-popup__title");
    const contentElement = popup?.querySelector(".map-popup__details");

    if (popup && titleElement && contentElement) {
      titleElement.textContent = data.title;
      contentElement.textContent = data.content;

      // Use MicroModal from window or import dynamically
      if ((window as any).MicroModal) {
        (window as any).MicroModal.show("map-popup");
      } else {
        import("micromodal").then((MicroModal) => {
          MicroModal.default.show("map-popup");
        });
      }
    }
  }

  async loadGeoJson(url: string, fillColor: string = "#7FBD00"): Promise<void> {
    if (!this.dataLayer) {
      throw new Error("Map not initialized. Call init() first.");
    }

    try {
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
