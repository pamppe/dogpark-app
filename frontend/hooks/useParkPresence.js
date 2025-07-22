import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as turf from "@turf/turf";
import { sendPresence } from "../api/backend"; // toteuta tämä endpoint

export default function useParkPresence(location, parks) {
  const currentParkRef = useRef(null);
  const appState = useRef(AppState.currentState);

  // Lue viimeksi tallennettu puisto käynnistyksessä
  useEffect(() => {
    AsyncStorage.getItem("lastParkId").then((id) => {
      currentParkRef.current = id || null;
    });
  }, []);

  // Kuuntele app-tilan muutoksia (background → exit)
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (appState.current === "active" && next.match(/inactive|background/)) {
        // merkitse ulos, kun sovellus sulkeutuu
        sendPresence({ parkId: null });
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, []);

  // Kun sijainti tai puistot päivittyvät, tarkista sisälläolo
  useEffect(() => {
    if (!location?.coords || parks.length === 0) return;

    const pt = turf.point([
      location.coords.longitude,
      location.coords.latitude,
    ]);

    let foundId = null;

    // 1) Polygoneille: point-in-polygon
    for (let park of parks) {
      if (park.geometry) {
        const poly = turf.polygon([park.geometry.map((g) => [g.lon, g.lat])]);
        if (turf.booleanPointInPolygon(pt, poly)) {
          foundId = park.id.toString();
          break;
        }
      }
    }

    // 2) Node-puistoille: etäisyysbuffer
    if (!foundId) {
      for (let park of parks.filter((p) => !p.geometry)) {
        const d = park.distance; // olet pohjalla laskenut distance
        if (d != null && d < 30) {
          // 30 m säde
          foundId = park.id.toString();
          break;
        }
      }
    }

    // Jos tila vaihtui, päivitä
    if (foundId !== currentParkRef.current) {
      currentParkRef.current = foundId;
      AsyncStorage.setItem("lastParkId", foundId || "");
      sendPresence({ parkId: foundId }); // backendille päivitys
    }
  }, [location, parks]);
}
