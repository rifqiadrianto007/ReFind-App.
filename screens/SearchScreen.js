import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl, TextInput, Modal, Image, Animated } from 'react-native';
import { collection, getDocs } from 'firebase/firestore'; 
import { dbFirestore } from '../firebase/firebaseConfig'; 
import tw from 'twrnc';
import { Linking } from 'react-native';

export default function SearchScreen() {
  const [selectedMenu, setSelectedMenu] = useState('Kehilangan');
  const [penemuan, setPenemuan] = useState([]);
  const [kehilangan, setKehilangan] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  const fetchPenemuan = useCallback(async () => {
    try {
      const querySnapshots = await getDocs(collection(dbFirestore, 'Barang Ditemukan'));
      const penemuanData = querySnapshots.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setPenemuan(penemuanData);
    } catch (error) {
      console.error('Error fetching Penemuan data: ', error);
    }
  }, []);

  const fetchKehilangan = useCallback(async () => {
    try {
      const querySnapshots = await getDocs(collection(dbFirestore, 'Barang Hilang'));
      const kehilanganData = querySnapshots.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setKehilangan(kehilanganData);
    } catch (error) {
      console.error('Error fetching Kehilangan data: ', error);
    }
  }, []);

  useEffect(() => {
    fetchPenemuan();
    fetchKehilangan();
  }, [fetchPenemuan, fetchKehilangan]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchPenemuan(), fetchKehilangan()]);
    setRefreshing(false);
  }, [fetchPenemuan, fetchKehilangan]);

  const dataToDisplay = selectedMenu === 'Penemuan' ? penemuan : kehilangan;

  const filteredData = dataToDisplay.filter((item) =>
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleWhatsApp = (phoneNumber) => {
    const url = `https://wa.me/${phoneNumber}`;
    Linking.openURL(url).catch((err) => console.error('Error opening WhatsApp:', err));
  };

  const openModal = (item) => {
    setSelectedItem(item);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setSelectedItem(null));
  };

  return (
    <View style={tw`flex-1 pt-12 px-5 bg-gray-100`}>
      <Text style={tw`text-2xl font-bold mb-5`}>Search</Text>

      <View style={tw`flex-row h-10 w-52 mb-5 rounded-full bg-gray-200 overflow-hidden self-center`}>
        <TouchableOpacity
          style={[
            tw`flex-1 py-2 items-center`,
            selectedMenu === 'Kehilangan' && tw`bg-[#0F254F]`,
            { borderTopLeftRadius: 10, borderBottomLeftRadius: 10 },
          ]}
          onPress={() => setSelectedMenu('Kehilangan')}
        >
          <Text style={[tw`text-sm font-bold`, selectedMenu === 'Kehilangan' && tw`text-white`]}>
            Kehilangan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            tw`flex-1 py-2 items-center`,
            selectedMenu === 'Penemuan' && tw`bg-[#0F254F]`,
            { borderTopRightRadius: 10, borderBottomRightRadius: 10 },
          ]}
          onPress={() => setSelectedMenu('Penemuan')}
        >
          <Text style={[tw`text-sm font-bold`, selectedMenu === 'Penemuan' && tw`text-white`]}>
            Penemuan
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={tw`border border-gray-300 rounded-xl p-3 mb-5`}
        placeholder="Cari berdasarkan nama barang..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              tw`p-4 mb-4 rounded-xl shadow-lg`,
              item.isCompleted ? tw`bg-green-100` : tw`bg-white`,
            ]}
            onPress={() => openModal(item)}
          >
            <Text style={[tw`text-lg font-bold`, item.isCompleted && tw`text-green-600`]}>
              {item.itemName}
            </Text>
            <Text style={tw`italic text-sm text-gray-600`}>
              Lokasi: {selectedMenu === 'Penemuan' ? item.locationFound : item.locationLost}
            </Text>
            {item.isCompleted && (
              <Text style={tw`text-sm text-green-500 font-bold`}>Laporan Selesai</Text>
            )}
          </TouchableOpacity>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      />

      {selectedItem && (
        <Modal transparent visible={!!selectedItem} animationType="none">
          <Animated.View
            style={[
              tw`flex-1 justify-center items-center bg-black bg-opacity-50`,
              { opacity: fadeAnim },
            ]}
          >
            <TouchableOpacity
              style={tw`absolute top-0 left-0 right-0 bottom-0`}
              onPress={closeModal}
            />
            <View style={tw`w-4/5 bg-white rounded-2xl p-5`}>
              <Text style={tw`text-2xl font-bold mb-5 text-center text-[#000000]`}>
                {selectedItem.itemName}
              </Text>
              <Text style={tw`text-base mb-5 text-center text-gray-700`}>
                {selectedItem.itemDescription}
              </Text>
              <Text style={tw`italic font-bold text-sm text-gray-600`}>
                Lokasi: {selectedMenu === 'Penemuan' ? selectedItem.locationFound : selectedItem.locationLost}
              </Text>
              <View style={tw`flex-row items-center justify-end`}>
                <Text style={tw`text-sm font-bold mr-4 text-[#000000]`}>Hubungi:</Text>
                <TouchableOpacity
                  style={tw`w-10 h-10 bg-[#fff] rounded-full flex items-center justify-center`}
                  onPress={() => handleWhatsApp(selectedItem.phoneNumber)}
                >
                  <Image
                    source={require('../assets/whatsapp-icon.png')}
                    style={tw`w-10 h-10`}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </Modal>
      )}
    </View>
  );
}
