import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc } from 'firebase/firestore';
import { dbFirestore, auth } from '../firebase/firebaseConfig';
import tw from 'twrnc';

export default function FoundItemForm({ onClose }) {
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [locationLost, setLocationLost] = useState('');
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Izin untuk mengakses galeri diperlukan!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!itemName || !itemDescription || !locationLost || !phoneNumber) {
      Alert.alert('Harap isi semua data');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Pengguna belum login');
      return;
    }

    try {
      await addDoc(collection(dbFirestore, 'Barang Ditemukan'), {
        itemName: itemName.trim(),
        itemDescription: itemDescription.trim(),
        locationLost: locationLost.trim(),
        phoneNumber: phoneNumber.trim(),
        userEmail: user.email,
        timestamp: new Date(),
      });
      Alert.alert('Success', 'Data berhasil ditambahkan');
      onClose();
    } catch (error) {
      console.error('Error adding data: ', error);
      Alert.alert('Error', 'Terjadi kesalahan');
    }
  }, [itemName, itemDescription, locationLost, phoneNumber, onClose]);

  return (
    <View style={tw`bg-white p-5 rounded-xl`}>
      <Text style={tw`text-2xl font-bold text-center text-black mb-2`}>Form Penemuan</Text>

      <TextInput
        style={tw`border border-gray-300 rounded-lg p-3 mb-3`}
        placeholder="Nama Barang"
        value={itemName}
        onChangeText={setItemName}
      />

      <TextInput
        style={tw`border border-gray-300 rounded-lg p-3 mb-3`}
        placeholder="Deskripsi Barang"
        value={itemDescription}
        onChangeText={setItemDescription}
      />

      <TextInput
        style={tw`border border-gray-300 rounded-lg p-3 mb-3`}
        placeholder="Lokasi Ditemukan"
        value={locationLost}
        onChangeText={setLocationLost}
      />

      <TextInput
        style={tw`border border-gray-300 rounded-lg p-3 mb-3`}
        placeholder="No. HP"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />

      <TouchableOpacity
        style={tw`bg-gray-400 w-2/5 h-8 rounded-lg justify-center items-center mb-5 mx-auto`}
        onPress={pickImage}
      >
        <Text style={tw`text-white font-bold`}>Upload File</Text>
      </TouchableOpacity>

      {selectedImage && (
        <Image
          source={{ uri: selectedImage }}
          style={tw`w-24 h-24 rounded-lg mx-auto`}
        />
      )}

      <TouchableOpacity
        style={tw`bg-green-500 py-2 rounded-lg items-center`}
        onPress={handleSubmit}
      >
        <Text style={tw`text-white font-bold`}>SUBMIT</Text>
      </TouchableOpacity>
    </View>
  );
}
