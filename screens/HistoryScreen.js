import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { dbFirestore } from '../firebase/firebaseConfig';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { auth } from '../firebase/firebaseConfig';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/Ionicons';

export default function HistoryScreen() {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistoryData = useCallback(async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
  
      // Ambil data dari koleksi Barang Hilang
      const lostReportsQuery = query(
        collection(dbFirestore, 'Barang Hilang'),
        where('userEmail', '==', currentUser.email)
      );
  
      // Ambil data dari koleksi Barang Ditemukan
      const foundReportsQuery = query(
        collection(dbFirestore, 'Barang Ditemukan'),
        where('userEmail', '==', currentUser.email)
      );
  
      const [lostQuerySnapshot, foundQuerySnapshot] = await Promise.all([
        getDocs(lostReportsQuery),
        getDocs(foundReportsQuery),
      ]);
  
      // Gabungkan hasil dari kedua koleksi
      const lostReports = lostQuerySnapshot.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data(),
        collectionName: 'Barang Hilang'
      }));
      const foundReports = foundQuerySnapshot.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data(),
        collectionName: 'Barang Ditemukan'
      }));
  
      // Gabungkan hasil laporan barang hilang dan ditemukan
      const allReports = [...lostReports, ...foundReports];
      setHistoryData(allReports);
    } catch (error) {
      console.error('Error fetching history data: ', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistoryData();
  }, [fetchHistoryData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHistoryData();
    setRefreshing(false);
  }, [fetchHistoryData]);

  const handleCompleteReport = async (item) => {
    // Tampilkan konfirmasi dialog sebelum menandai laporan sebagai selesai
    Alert.alert(
      'Konfirmasi',
      'Apakah Anda yakin ingin menandai laporan ini sebagai selesai?',
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Ya, Selesai',
          onPress: async () => {
            try {
              const reportRef = doc(dbFirestore, item.collectionName, item.id);
              
              // Update dokumen di Firestore
              await updateDoc(reportRef, {
                isCompleted: true
              });

              // Update state lokal
              setHistoryData(prevData => 
                prevData.map(report => 
                  report.id === item.id 
                    ? {...report, isCompleted: true} 
                    : report
                )
              );
            } catch (error) {
              console.error('Error menandai laporan selesai: ', error);
              Alert.alert('Error', 'Gagal menandai laporan sebagai selesai.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" color="#0F254F" />
      </View>
    );
  }

  return (
    <View style={tw`flex-1 pt-12 px-5 bg-gray-100`}>
      <Text style={tw`text-2xl font-bold mb-5 text-[#000000]`}>Riwayat Laporan</Text>

      <FlatList
        data={historyData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View 
            style={[
              tw`flex-row items-center justify-between p-4 mb-4 bg-white rounded-xl shadow-lg`,
              item.isCompleted && tw`opacity-50`
            ]}
          >
            <View style={tw`flex-1 mr-2`}>
              <Text style={tw`text-lg font-bold`}>{item.itemName}</Text>
              <Text style={tw`italic text-sm text-gray-600`}>
                Lokasi: {item.locationLost || item.locationFound}
              </Text>
            </View>
            {!item.isCompleted ? (
              <TouchableOpacity 
                onPress={() => handleCompleteReport(item)}
                style={tw`mr-2`}
              >
                <Icon name="checkmark-circle" size={24} color="#0F254F" />
              </TouchableOpacity>
            ) : (
              <Icon name="checkmark-circle" size={24} color="green" />
            )}
          </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
}