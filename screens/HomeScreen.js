import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Animated } from 'react-native';
import Modal from 'react-native-modal';
import LostItemForm from './LostItemForm';
import FoundItemForm from './FoundItemForm';
import tw from 'twrnc';
import LottieView from 'lottie-react-native';

export default function HomeScreen() {
  const [isLostModalVisible, setLostModalVisible] = useState(false);
  const [isFoundModalVisible, setFoundModalVisible] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const startAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    startAnimation();
  }, []); 

  return (
    <View style={tw`flex-1 bg-gray-100 p-5`}>
      <View style={tw`flex-row justify-between items-center mb-8`}>
        <Text style={tw`text-2xl font-bold mt-7`}>Home</Text>
      </View>

      <Animated.View
        style={[
          tw`bg-[#0F254F] p-5 rounded-3xl mb-12 shadow-lg`,
          { transform: [{ scale: scaleAnim }] }, 
        ]}
      >
        <View style={tw`flex-row justify-between items-center`}>
          <View>
            <Text style={tw`text-white text-3xl font-bold mb-2`}>Welcome!</Text>
            <Text style={tw`text-white text-base`}>"Bringing Lost Items</Text>
            <Text style={tw`text-white text-base`}>Back to You"</Text>
          </View>

          <LottieView
            source={require('../assets/animation.json')}
            autoPlay
            loop
            style={tw`w-25 h-25`} 
          />
        </View>
      </Animated.View>

      <Text style={tw`text-xl font-bold text-center mb-6`}>What Do You Want To Report?</Text>

      <View style={tw`flex-row flex-wrap justify-between px-4`}>
        <TouchableOpacity
          style={[
            tw`bg-[#0F254F] w-33 h-33 rounded-3xl items-center justify-center p-4`,
            { elevation: 5, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8, marginBottom: 24 }, 
          ]}
          onPress={() => setLostModalVisible(true)}
        >
          <View style={tw`flex-col items-center justify-center`}>
            <Image
              source={require('../assets/lost-icon.png')}
              style={tw`w-14 h-14`}
              resizeMode="contain"
            />
            <Text style={tw`text-white text-lg font-bold mt-2 text-center`}>Lost Item</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            tw`bg-[#0F254F] w-33 h-33 rounded-3xl items-center justify-center p-4`,
            { elevation: 5, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8, marginBottom: 24 }, 
          ]}
          onPress={() => setFoundModalVisible(true)}
        >
          <View style={tw`flex-col items-center justify-center`}>
            <Image
              source={require('../assets/found-icon.png')}
              style={tw`w-14 h-14`}
              resizeMode="contain"
            />
            <Text style={tw`text-white text-lg font-bold mt-2 text-center`}>Found Item</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Modal
        isVisible={isLostModalVisible}
        onBackdropPress={() => setLostModalVisible(false)}
        backdropOpacity={0.5}
        animationIn="zoomIn"
        animationOut="zoomOut"
      >
        <LostItemForm onClose={() => setLostModalVisible(false)} />
      </Modal>

      <Modal
        isVisible={isFoundModalVisible}
        onBackdropPress={() => setFoundModalVisible(false)}
        backdropOpacity={0.5}
        animationIn="zoomIn"
        animationOut="zoomOut"
      >
        <FoundItemForm onClose={() => setFoundModalVisible(false)} />
      </Modal>
    </View>
  );
}
