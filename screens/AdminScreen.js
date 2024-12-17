import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, RefreshControl, Modal, Animated, Linking, Alert, Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import AdminProfileScreen from './AdminProfileScreen';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { dbFirestore } from '../firebase/firebaseConfig';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [kehilangan, setKehilangan] = useState([]);
  const [penemuan, setPenemuan] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const fetchData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchKehilangan(), fetchPenemuan()]);
    setLoading(false);
  }, [fetchKehilangan, fetchPenemuan]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const deleteReport = async (id, collectionName) => {
    try {
      await deleteDoc(doc(dbFirestore, collectionName, id));
      
      if (collectionName === 'Barang Hilang') {
        setKehilangan((prev) => prev.filter((item) => item.id !== id));
      } else {
        setPenemuan((prev) => prev.filter((item) => item.id !== id));
      }
      return true;
    } catch (error) {
      console.error('Error menghapus laporan: ', error);
      return false;
    }
  };

  return (
    <DataContext.Provider value={{ 
      kehilangan, 
      penemuan, 
      loading, 
      deleteReport,
      fetchData 
    }}>
      {children}
    </DataContext.Provider>
  );
}

function AdminHomeScreen() {
  const { kehilangan, penemuan, loading, deleteReport, fetchData } = useContext(DataContext);
  const [selectedMenu, setSelectedMenu] = useState('Kehilangan');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const dataToDisplay = selectedMenu === 'Kehilangan' ? kehilangan : penemuan;
  const filteredData = dataToDisplay.filter((item) =>
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleWhatsApp = (phoneNumber) => {
    const url = `https://wa.me/${phoneNumber}`;
    Linking.openURL(url).catch((err) => console.error('Error membuka WhatsApp:', err));
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

  const confirmDelete = (id) => {
    const collectionName = selectedMenu === 'Kehilangan' ? 'Barang Hilang' : 'Barang Ditemukan';
    Alert.alert(
      'Konfirmasi Hapus',
      'Apakah Anda yakin ingin menghapus laporan ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          onPress: async () => {
            const success = await deleteReport(id, collectionName);
            if (success) {
              Alert.alert('Berhasil', 'Laporan berhasil dihapus.');
            } else {
              Alert.alert('Gagal', 'Terjadi kesalahan saat menghapus laporan.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <Text>Memuat data...</Text>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 pt-12 px-5 bg-gray-100`}>
      <Text style={tw`text-2xl font-bold mb-5`}>Admin</Text>

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
          <View style={[tw`flex-row items-center justify-between p-4 mb-4 bg-white rounded-xl shadow-lg`,
            item.isCompleted ? tw`bg-green-100` : tw`bg-white`
          ]}>
            <TouchableOpacity
              style={tw`flex-1`}
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
            <TouchableOpacity onPress={() => confirmDelete(item.id)}>
              <Icon name="trash-bin" size={24} color="red" />
            </TouchableOpacity>
          </View>
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

const Tab = createBottomTabNavigator();

export default function AdminScreen() {
  return (
    <DataProvider>
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
          component={AdminHomeScreen}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Icon name="home" size={size + 3} color={color} />
            ),
            tabBarLabel: () => <Text style={tw`text-white text-sm font-medium`}>Home</Text>,
          }}
        />
        <Tab.Screen
          name="Profile"
          component={AdminProfileScreen}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Icon name="person" size={size + 3} color={color} />
            ),
            tabBarLabel: () => <Text style={tw`text-white text-sm font-medium`}>Profile</Text>,
          }}
        />
      </Tab.Navigator>
    </DataProvider>
  );
}