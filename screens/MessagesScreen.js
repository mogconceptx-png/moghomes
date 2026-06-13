import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, TextInput,
} from 'react-native';

const CONVERSATIONS = [
  { id: '1', agent: 'Chukwuemeka Obi', property: 'Luxury 4-Bedroom Duplex, Lekki', lastMsg: 'The property is still available. When can you come for inspection?', time: '2m ago', unread: 2, verified: true },
  { id: '2', agent: 'Amara Nwosu', property: 'Modern 3-Bedroom, Victoria Island', lastMsg: 'Thank you for your interest! The rent is negotiable.', time: '1h ago', unread: 0, verified: true },
  { id: '3', agent: 'Folake Adeyemi', property: 'Executive Mansion, Banana Island', lastMsg: 'I have sent you the property documents via email.', time: '3h ago', unread: 1, verified: false },
  { id: '4', agent: 'Emeka Okafor', property: '2-Bedroom Flat, Ikeja GRA', lastMsg: 'Yes the water is constant and there is 24hr light.', time: 'Yesterday', unread: 0, verified: true },
];

function ChatScreen({ convo, onBack }) {
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hello, I am interested in your property listing.', mine: true, time: '10:00' },
    { id: '2', text: 'Welcome! Thank you for reaching out. Which property are you interested in?', mine: false, time: '10:02' },
    { id: '3', text: convo.property, mine: true, time: '10:03' },
    { id: '4', text: convo.lastMsg, mine: false, time: '10:05' },
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text: input.trim(),
      mine: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setInput('');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.chatAvatar}>
          <Text style={{ fontSize: 20 }}>👤</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.chatName}>{convo.agent} {convo.verified ? '✅' : ''}</Text>
          <Text style={styles.chatProp} numberOfLines={1}>{convo.property}</Text>
        </View>
        <TouchableOpacity style={styles.callIcon}>
          <Text style={{ fontSize: 20 }}>📞</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={messages}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.msgList}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.mine ? styles.bubbleMine : styles.bubbleTheirs]}>
            <Text style={[styles.bubbleText, item.mine && styles.bubbleTextMine]}>
              {item.text}
            </Text>
            <Text style={[styles.bubbleTime, item.mine && { color: 'rgba(255,255,255,0.7)' }]}>
              {item.time}
            </Text>
          </View>
        )}
      />

      <View style={styles.quickRow}>
        {['Is it available?', 'Schedule inspection', 'Send photos'].map(q => (
          <TouchableOpacity key={q} style={styles.quickBtn} onPress={() => setInput(q)}>
            <Text style={styles.quickText}>{q}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.msgInput}
          placeholder="Type a message..."
          placeholderTextColor="#6B7280"
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.sendText}>➤</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function MessagesScreen() {
  const [activeChat, setActiveChat] = useState(null);

  if (activeChat) {
    return <ChatScreen convo={activeChat} onBack={() => setActiveChat(null)} />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.newBtn}>
          <Text style={styles.newBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={CONVERSATIONS}
        keyExtractor={i => i.id}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={{ fontSize: 48 }}>💬</Text>
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySub}>
              Start chatting with an agent by tapping{'\n'}"Message Agent" on any property
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.convCard} onPress={() => setActiveChat(item)}>
            <View style={styles.avatarBox}>
              <Text style={{ fontSize: 24 }}>👤</Text>
            </View>
            <View style={styles.convInfo}>
              <View style={styles.convTopRow}>
                <Text style={styles.convAgent}>{item.agent} {item.verified ? '✅' : ''}</Text>
                <Text style={styles.convTime}>{item.time}</Text>
              </View>
              <Text style={styles.convProp} numberOfLines={1}>{item.property}</Text>
              <Text style={styles.convLast} numberOfLines={1}>{item.lastMsg}</Text>
            </View>
            {item.unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unread}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F6F1' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#1A1A1A' },
  newBtn: { backgroundColor: '#1B4332', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  newBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  convCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E5E0D5' },
  avatarBox: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#F8F6F1', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  convInfo: { flex: 1 },
  convTopRow: { flexDirection: 'row', justifyContent: 'space-between' },
  convAgent: { fontSize: 14, fontWeight: '800', color: '#1A1A1A' },
  convTime: { fontSize: 11, color: '#6B7280' },
  convProp: { fontSize: 11, color: '#1B4332', fontWeight: '600', marginTop: 2 },
  convLast: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  unreadBadge: { backgroundColor: '#1B4332', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  unreadText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginTop: 12 },
  emptySub: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginTop: 6, lineHeight: 20 },
  chatHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E0D5' },
  backBtn: { marginRight: 10, padding: 4 },
  backText: { fontSize: 20, color: '#1B4332', fontWeight: '700' },
  chatAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#F8F6F1', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  chatName: { fontSize: 15, fontWeight: '800', color: '#1A1A1A' },
  chatProp: { fontSize: 11, color: '#6B7280' },
  callIcon: { padding: 6 },
  msgList: { padding: 16 },
  bubble: { maxWidth: '75%', borderRadius: 16, padding: 12, marginBottom: 8 },
  bubbleMine: { backgroundColor: '#1B4332', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: '#FFFFFF', alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#E5E0D5' },
  bubbleText: { fontSize: 14, color: '#1A1A1A', lineHeight: 20 },
  bubbleTextMine: { color: '#FFFFFF' },
  bubbleTime: { fontSize: 10, color: '#6B7280', marginTop: 4, textAlign: 'right' },
  quickRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, gap: 8, backgroundColor: '#FFFFFF' },
  quickBtn: { backgroundColor: '#F8F6F1', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#E5E0D5' },
  quickText: { fontSize: 12, color: '#1B4332', fontWeight: '600' },
  inputRow: { flexDirection: 'row', padding: 12, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E0D5', alignItems: 'flex-end', gap: 10 },
  msgInput: { flex: 1, backgroundColor: '#F8F6F1', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#1A1A1A', maxHeight: 100, borderWidth: 1, borderColor: '#E5E0D5' },
  sendBtn: { backgroundColor: '#1B4332', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  sendText: { color: '#FFFFFF', fontSize: 16 },
});

