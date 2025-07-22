import { useEffect, useState } from "react";
import * as Location from "expo-location";

export default function useLocation() {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    let subscriber;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        subscriber = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 5 },
          (loc) => setLocation(loc),
        );
      }
    })();
    return () => subscriber && subscriber.remove();
  }, []);

  return location;
}
