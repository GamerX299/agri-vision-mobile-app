import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Tabs } from 'expo-router';
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import { SymbolView } from 'expo-symbols';
function NativeTabLayout(){return <NativeTabs><NativeTabs.Trigger name="index"><Icon sf={{default:'square.grid.2x2',selected:'square.grid.2x2.fill'}}/><Label>Field health</Label></NativeTabs.Trigger><NativeTabs.Trigger name="diagnosis"><Icon sf={{default:'camera',selected:'camera.fill'}}/><Label>Diagnosis</Label></NativeTabs.Trigger></NativeTabs>}
function ClassicTabLayout(){const c=useColors(); const isIOS=Platform.OS==='ios'; const isWeb=Platform.OS==='web'; return <Tabs screenOptions={{headerShown:false,tabBarActiveTintColor:c.primary,tabBarInactiveTintColor:c.mutedForeground,tabBarStyle:{position:'absolute',backgroundColor:isIOS?'transparent':c.background,borderTopWidth:isWeb?1:0,borderTopColor:c.border,elevation:0,...(isWeb?{height:84}: {})},tabBarBackground:()=>isIOS?<BlurView intensity={100} tint="light" style={StyleSheet.absoluteFill}/>:<View style={[StyleSheet.absoluteFill,{backgroundColor:c.background}]} />}}><Tabs.Screen name="index" options={{title:'Field health',tabBarIcon:({color})=>isIOS?<SymbolView name="square.grid.2x2" tintColor={color} size={24}/>:<Feather name="grid" size={22} color={color}/>}}/><Tabs.Screen name="diagnosis" options={{title:'Diagnosis',tabBarIcon:({color})=>isIOS?<SymbolView name="camera" tintColor={color} size={24}/>:<Feather name="camera" size={22} color={color}/>}}/></Tabs>}
export default function TabLayout(){return isLiquidGlassAvailable()?<NativeTabLayout/>:<ClassicTabLayout/>}