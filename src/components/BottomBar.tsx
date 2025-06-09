import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface BottomBarProps {
  onMainPress: () => void;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  mainType: 'photo' | 'video';
  isRecording?: boolean;
}

const BottomBar: React.FC<BottomBarProps> = ({ onMainPress, onLeftPress, onRightPress, mainType, isRecording }) => {
  return (
    <View style={styles.wrap}>
      <TouchableOpacity style={styles.btn} onPress={onLeftPress}>
        <View style={styles.iconCircle}><Ionicons name="sparkles-outline" size={28} color="#fff" /></View>
        <Text style={styles.btnText}>特效</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.mainBtn} onPress={onMainPress} activeOpacity={0.85}>
        <LinearGradient colors={["#FF4040", "#FF7B7B"]} style={styles.mainBtnBg}>
          <Ionicons name={mainType === 'photo' ? 'camera' : isRecording ? 'stop' : 'videocam'} size={38} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={onRightPress}>
        <View style={styles.iconCircle}><Ionicons name="images" size={28} color="#fff" /></View>
        <Text style={styles.btnText}>相册</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 18,
    paddingHorizontal: 32,
    zIndex: 20,
  },
  mainBtn: {
    width: 86,
    height: 86,
    borderRadius: 43,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 18,
  },
  mainBtnBg: {
    width: 86,
    height: 86,
    borderRadius: 43,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF4040',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(40,40,40,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  btnText: {
    color: '#fff',
    fontSize: 13,
    marginTop: 2,
  },
});

export default BottomBar; 