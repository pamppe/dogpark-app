// hooks/useCounts.js
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { sendPresence } from "../api/client";
import useUserId from "./useUserId";

export default function useCounts(parkId) {
  const userId = useUserId();
  const [peopleCount, setPeopleCount] = useState(0);
  const [dogCount, setDogCount] = useState(0);

  // Ladataan paikallinen kopio AsyncStoragesta kuten ennen…
  useEffect(() => {
    (async () => {
      const people = await AsyncStorage.getItem("peopleCount");
      const dogs = await AsyncStorage.getItem("dogCount");
      if (people !== null) setPeopleCount(+people);
      if (dogs !== null) setDogCount(+dogs);
    })();
  }, []);

  const updatePeopleCount = async (val) => {
    setPeopleCount(val);
    await AsyncStorage.setItem("peopleCount", val.toString());
    if (userId) {
      sendPresence({
        userId,
        parkId,
        peopleCount: val,
        dogCount,
        action: "update",
      });
    }
  };

  const updateDogCount = async (val) => {
    setDogCount(val);
    await AsyncStorage.setItem("dogCount", val.toString());
    if (userId) {
      sendPresence({
        userId,
        parkId,
        peopleCount,
        dogCount: val,
        action: "update",
      });
    }
  };

  return { peopleCount, dogCount, updatePeopleCount, updateDogCount };
}
