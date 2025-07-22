import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function useCounts() {
  const [peopleCount, setPeopleCount] = useState(0);
  const [dogCount, setDogCount] = useState(0);

  useEffect(() => {
    (async () => {
      const people = await AsyncStorage.getItem("peopleCount");
      const dogs = await AsyncStorage.getItem("dogCount");

      if (people !== null) setPeopleCount(parseInt(people));
      if (dogs !== null) setDogCount(parseInt(dogs));
    })();
  }, []);

  const updatePeopleCount = async (value) => {
    setPeopleCount(value);
    await AsyncStorage.setItem("peopleCount", value.toString());
  };

  const updateDogCount = async (value) => {
    setDogCount(value);
    await AsyncStorage.setItem("dogCount", value.toString());
  };

  return { peopleCount, dogCount, updatePeopleCount, updateDogCount };
}
