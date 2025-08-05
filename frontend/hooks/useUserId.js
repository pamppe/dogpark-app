// hooks/useUserId.js
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

export default function useUserId() {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    (async () => {
      let id = await AsyncStorage.getItem("userId");
      if (!id) {
        id = uuidv4();
        await AsyncStorage.setItem("userId", id);
      }
      setUserId(id);
    })();
  }, []);

  return userId;
}
