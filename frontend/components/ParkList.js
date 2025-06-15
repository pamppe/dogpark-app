import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

export default function ParkList({ parks, onSelect }) {
  const formatDistance = (distance) => {
    if (!distance && distance !== 0) return '';
    return distance > 1000
      ? `${(distance / 1000).toFixed(1)} km`
      : `${Math.round(distance)} m`;
  };

 return (
    <View style={styles.container}>
      <FlatList
        data={parks}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => onSelect(item)}>
            <View style={styles.item}>
              <Text style={styles.name}>{item.name}</Text>
              {item.distance != null && (
                <Text style={styles.distance}>
                  {formatDistance(item.distance)}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,                 // vie kaiken tilan
    backgroundColor: '#fff'
  },
  listContent: {
    paddingVertical: 8
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee'
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16
  },
  distance: {
    color: 'gray',
    marginTop: 4
  }
});