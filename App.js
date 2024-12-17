import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; 
import tw from 'twrnc'; 

import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';
import AdminScreen from './screens/AdminScreen';
import HistoryScreen from './screens/HistoryScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: tw`bg-[#0F254F] h-16 rounded-t-3xl shadow-md`, 
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'gray', 
        tabBarLabelStyle: tw`text-sm font-medium`, 
        tabBarIconStyle: tw`mt-1`, 
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size + 3} color={color} /> 
          ),
          tabBarLabel: () => (
            <Text style={tw`text-white text-sm font-medium`}>Home</Text> 
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Icon name="clipboard" size={size + 3} color={color} /> 
          ),
          tabBarLabel: () => (
            <Text style={tw`text-white text-sm font-medium`}>Search</Text> 
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Icon name="person" size={size + 3} color={color} /> 
          ),
          tabBarLabel: () => (
            <Text style={tw`text-white text-sm font-medium`}>Profile</Text> 
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [userRole, setUserRole] = useState(null);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HomeTabs"
          component={HomeTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AdminScreen"
          component={AdminScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HistoryScreen"
          component={HistoryScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
