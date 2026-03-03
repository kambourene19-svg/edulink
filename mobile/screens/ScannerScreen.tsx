import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

export default function ScannerScreen({ navigation }: any) {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        if (!permission) requestPermission();
    }, []);

    if (!permission) {
        return <View style={styles.center}><ActivityIndicator size="large" /></View>;
    }

    if (!permission.granted) {
        return (
            <View style={styles.center}>
                <Text style={styles.text}>L'accès à la caméra est requis pour scanner les tickets.</Text>
                <TouchableOpacity style={styles.button} onPress={requestPermission}>
                    <Text style={styles.buttonText}>Autoriser la caméra</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleBarCodeScanned = async ({ data }: any) => {
        if (scanned || loading) return;

        setScanned(true);
        setLoading(true);

        try {
            // Le QR code contient "TICKET-uuid-timestamp"
            // Notre backend attend l'ID du booking
            const parts = data.split('-');
            if (parts.length < 2 || parts[0] !== 'TICKET') {
                throw new Error('Format de QR Code invalide');
            }

            const bookingId = parts[1];
            const token = await AsyncStorage.getItem('userToken');

            const response = await axios.post(`${API_URL}/bookings/validate`,
                { bookingId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setResult({ success: true, data: response.data });
        } catch (error: any) {
            setResult({
                success: false,
                message: error.response?.data?.error || error.message
            });
        } finally {
            setLoading(false);
        }
    };

    const resetScanner = () => {
        setScanned(false);
        setResult(null);
    };

    if (result) {
        return (
            <View style={[styles.container, result.success ? styles.successBg : styles.errorBg]}>
                <Text style={styles.statusTitle}>
                    {result.success ? '✅ TICKET VALIDE' : '❌ ERREUR'}
                </Text>

                {result.success ? (
                    <View style={styles.resultCard}>
                        <Text style={styles.resLabel}>PASSAGER</Text>
                        <Text style={styles.resValue}>{result.data.passenger}</Text>

                        <Text style={styles.resLabel}>TRAJET</Text>
                        <Text style={styles.resValue}>{result.data.route}</Text>

                        <Text style={styles.resLabel}>SIEGE</Text>
                        <Text style={styles.resValue}>N° {result.data.seat}</Text>
                    </View>
                ) : (
                    <Text style={styles.errorText}>{result.message}</Text>
                )}

                <TouchableOpacity style={styles.button} onPress={resetScanner}>
                    <Text style={styles.buttonText}>Scanner un autre ticket</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.secondaryButtonText}>Fermer</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Scanner un Ticket</Text>
                <Text style={styles.headerSub}>Placez le QR Code dans le cadre</Text>
            </View>

            <View style={styles.cameraContainer}>
                <CameraView
                    style={styles.camera}
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: ["qr"],
                    }}
                />
                <View style={styles.overlay}>
                    <View style={styles.scanFrame} />
                </View>
            </View>

            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingText}>Validation en cours...</Text>
                </View>
            )}

            <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    text: { color: '#fff', textAlign: 'center', marginBottom: 20, fontSize: 16 },
    header: { padding: 40, alignItems: 'center' },
    headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    headerSub: { color: '#94a3b8', marginTop: 10 },
    cameraContainer: { flex: 1, overflow: 'hidden' },
    camera: { flex: 1 },
    overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
    scanFrame: { width: 250, height: 250, borderWidth: 2, borderColor: '#2563EB', borderRadius: 20, backgroundColor: 'rgba(37, 99, 235, 0.05)' },
    button: { backgroundColor: '#2563EB', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 12, marginTop: 20 },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    secondaryButton: { marginTop: 15 },
    secondaryButtonText: { color: '#fff', opacity: 0.8 },
    cancelButton: { margin: 40, alignItems: 'center' },
    cancelButtonText: { color: '#ef4444', fontWeight: 'bold' },
    successBg: { backgroundColor: '#15803d', justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorBg: { backgroundColor: '#b91c1c', justifyContent: 'center', alignItems: 'center', padding: 20 },
    statusTitle: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 30 },
    resultCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '100%', marginBottom: 30 },
    resLabel: { fontSize: 12, color: '#64748b', fontWeight: 'bold', marginTop: 10 },
    resValue: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
    errorText: { color: '#fff', fontSize: 18, textAlign: 'center', marginBottom: 30 },
    loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: '#fff', marginTop: 15, fontWeight: 'bold' }
});
