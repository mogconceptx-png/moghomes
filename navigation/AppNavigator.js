import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { View, ActivityIndicator } from 'react-native';
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import PostListingScreen from '../screens/PostListingScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PropertyDetailScreen from '../screens/PropertyDetailScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#1a1a2e', tabBarInactiveTintColor: '#999', tabBarStyle: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee', paddingBottom: 5, height: 60 } }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: '🏠 Home' }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ tabBarLabel: '🔍 Search' }} />
      <Tab.Screen name="Post" component={PostListingScreen} options={{ tabBarLabel: '➕ Post' }} />
      <Tab.Screen name="Messages" component={MessagesScreen} options={{ tabBarLabel: '💬 Messages' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: '👤 Profile' }} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1a1a2e" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
