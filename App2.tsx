import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

const App = () => {
  const chatItems = [
    {
      id: '1',
      avatar: 'https://via.placeholder.com/40',
      name: '文件传输助手',
      latestMessage: 'https://cpc59k.csb.app/',
      time: '13:51',
    },
    {
      id: '2',
      avatar: 'https://via.placeholder.com/40',
      name: '人文学子而后的艺术人生🏆',
      latestMessage: '长木: 下场焦灼到第四节牛仔险胜',
      time: '12:46',
    },
    {
      id: '3',
      avatar: 'https://via.placeholder.com/40',
      name: '直男F4',
      latestMessage: 'James 篮球: [动画表情]',
      time: '12:45',
    },
    {
      id: '5',
      avatar: 'https://via.placeholder.com/40',
      name: '文件传输助手',
      latestMessage: 'https://cpc59k.csb.app/',
      time: '13:51',
    },
    {
      id: '4',
      avatar: 'https://via.placeholder.com/40',
      name: '人文学子而后的艺术人生🏆',
      latestMessage: '长木: 下场焦灼到第四节牛仔险胜',
      time: '12:46',
    },
    {
      id: '6',
      avatar: 'https://via.placeholder.com/40',
      name: '直男F4',
      latestMessage: 'James 篮球: [动画表情]',
      time: '12:45',
    },
    {
      id: '7',
      avatar: 'https://via.placeholder.com/40',
      name: '人文学子而后的艺术人生🏆',
      latestMessage: '长木: 下场焦灼到第四节牛仔险胜',
      time: '12:46',
    },
    {
      id: '8',
      avatar: 'https://via.placeholder.com/40',
      name: '直男F4',
      latestMessage: 'James 篮球: [动画表情]',
      time: '12:45',
    },
    {
      id: '9',
      avatar: 'https://via.placeholder.com/40',
      name: '人文学子而后的艺术人生🏆',
      latestMessage: '长木: 下场焦灼到第四节牛仔险胜',
      time: '12:46',
    },
    {
      id: '10',
      avatar: 'https://via.placeholder.com/40',
      name: '直男F4',
      latestMessage: 'James 篮球: [动画表情]',
      time: '12:45',
    },
    {
      id: '11',
      avatar: 'https://via.placeholder.com/40',
      name: '直男F4',
      latestMessage: 'James 篮球: [动画表情]',
      time: '12:45',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.chatList}>
        {chatItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.chatItem}>
            <Image source={{ uri: item.avatar }} style={styles.chatIcon} />
            <View style={styles.chatText}>
              <Text style={styles.chatTitle}>{item.name}</Text>
              <Text style={styles.chatSubtitle}>{item.latestMessage}</Text>
            </View>
            <Text style={styles.chatTime}>{item.time}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
    backgroundColor: '#181818',
  },
  chatIcon: {
    width: 45,
    height: 45,
    borderRadius: 10,
  },
  chatText: {
    flex: 1,
    marginLeft: 16,
  },
  chatTitle: {
    color: '#C8C8C8',
    fontSize: 14,
    paddingBottom: 2,
  },
  chatSubtitle: {
    color: '#434343',
    fontSize: 11,
  },
  chatTime: {
    color: '#434343',
    fontSize: 11,
  },
});

export default App;
