import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as turf from "@turf/turf";
import { sendPresence } from "../api/client"; // toteuta tämä endpoint
import useUserId from "./useUserId";

export default function useParkPresence(location, parks) {
  const currentParkRef = useRef(null);
  const appState = useRef(AppState.currentState);
  const userId = useUserId();

  // Lue viimeksi tallennettu puisto käynnistyksessä
  useEffect(() => {
    AsyncStorage.getItem("lastParkId").then((id) => {
      currentParkRef.current = id || null;
    });
  }, []);

  // Kuuntele app-tilan muutoksia (background → exit)
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (
        appState.current === "active" &&
        (next === "inactive" || next === "background")
      ) {
        _notifyExit();
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, []);

  // Kun sijainti tai puistot päivittyvät, tarkista sisälläolo
  useEffect(() => {
    if (!userId || !location?.coords || parks.length === 0) return;

    const { latitude, longitude } = location.coords;
    const pt = turf.point([longitude, latitude]);

    // 1) Try polygon containment
    let foundId = null;
    for (let p of parks) {
      if (p.geometry) {
        const poly = turf.polygon([p.geometry.map((g) => [g.lon, g.lat])]);
        if (turf.booleanPointInPolygon(pt, poly)) {
          foundId = p.id.toString();
          break;
        }
      }
    }

    // 2) Node-puistoille: etäisyysbuffer
    if (!foundId) {
      for (let p of parks.filter((p) => !p.geometry)) {
        const d = p.distance; // olet pohjalla laskenut distance
        if (d != null && d < 30) {
          // 30 m säde
          foundId = p.id.toString();
          break;
        }
      }
    }

    // If parkId actually changed, send enter/exit
    if (foundId !== currentParkRef.current) {
      const action = foundId ? "enter" : "exit";
      currentParkRef.current = foundId;
      AsyncStorage.setItem("lastParkId", foundId || "");

      _notifyPresence(foundId, action);
    }
  }, [location, parks, userId]);

  // Helper: pack and send
  async function _notifyPresence(parkId, action) {
    // grab latest counts
    const [people, dogs] = await Promise.all([
      AsyncStorage.getItem("peopleCount"),
      AsyncStorage.getItem("dogCount"),
    ]);
    await sendPresence({
      userId,
      parkId,
      peopleCount: people ? +people : 0,
      dogCount: dogs ? +dogs : 0,
      action,
    });
  }

  // Helper: exit without re-reading counts
  function _notifyExit() {
    sendPresence({
      userId,
      parkId: null,
      peopleCount: 0,
      dogCount: 0,
      action: "exit",
    }).catch(() => {});
  }
}
