import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, Linking, FlatList } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

export default function PaymentScreen({ route, navigation }: any) {
    const { schedule, seatNumber } = route.params;
    const [phone, setPhone] = useState('');
    const [fullName, setFullName] = useState('');
    const [nationality, setNationality] = useState('Burkinabè');
    const [idCardNumber, setIdCardNumber] = useState('');
    const [socialMedia, setSocialMedia] = useState('');
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    React.useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const dataStr = await AsyncStorage.getItem('userData');
            if (dataStr) {
                const data = JSON.parse(dataStr);
                setFullName(data.fullName || '');
                setPhone(data.phone || '');
            }

            // Tenter de charger le profil complet pour la nationalité et CNI
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                const profileRes = await axios.get(`${API_URL}/auth/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const profile = profileRes.data;
                setFullName(profile.fullName || '');
                setNationality(profile.nationality || 'Burkinabè');
                setIdCardNumber(profile.idCardNumber || '');
                setSocialMedia(profile.socialMedia || '');
            }
        } catch (error) {
            console.log('Erreur chargement profil au paiement', error);
        }
    };

    const handlePayment = async () => {
        if (phone.length < 8 || !fullName || !idCardNumber) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs (Nom, Téléphone, N° d\'identité)');
            return;
        }

        setLoading(true);
        setStatusMessage('Préparation de la réservation...');
        try {
            const token = await AsyncStorage.getItem('userToken');
            const userDataStr = await AsyncStorage.getItem('userData');
            const userData = userDataStr ? JSON.parse(userDataStr) : null;
            const userId = userData?.id;

            if (!token || !userId) {
                Alert.alert('Session expirée', 'Veuillez vous reconnecter.');
                navigation.replace('Login');
                return;
            }

            setStatusMessage('Réservation du siège...');
            // 2. Create Booking
            const bookingRes = await axios.post(`${API_URL}/bookings/book`, {
                scheduleId: schedule.id,
                seatNumber,
                userId,
                paymentMethod: 'CINETPAY',
                phoneNumber: phone
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Sauvegarder le numéro pour "Mes Voyages"
            await AsyncStorage.setItem('user_phone', phone);

            setStatusMessage('Préparation du paiement réel...');

            // 3. Initiate Real CinetPay Payment
            const { data: paymentData } = await axios.post(`${API_URL}/payments/initiate`, {
                bookingId: bookingRes.data.bookingId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setLoading(false);
            setStatusMessage('');

            // 4. Open CinetPay
            Alert.alert(
                'Paiement Sécurisé CinetPay',
                'Vous allez être redirigé vers l\'interface de paiement (Orange Money, Moov Money, Carte).',
                [
                    {
                        text: 'Payer maintenant',
                        onPress: () => {
                            Linking.openURL(paymentData.payment_url).catch(() => {
                                Alert.alert("Erreur", "Impossible d'ouvrir le lien de paiement.");
                            });

                            // Préparer la redirection après retour du navigateur
                            setTimeout(() => {
                                Alert.alert(
                                    'Paiement en cours',
                                    'Une fois le paiement terminé et validé par SMS, cliquez sur OK pour voir votre ticket.',
                                    [{
                                        text: 'OK',
                                        onPress: () => {
                                            navigation.reset({
                                                index: 0,
                                                routes: [{
                                                    name: 'Ticket',
                                                    params: {
                                                        booking: bookingRes.data,
                                                        schedule,
                                                        seatNumber,
                                                        qrCode: `TICKET-${bookingRes.data.bookingId}`
                                                    }
                                                }],
                                            });
                                        }
                                    }]
                                );
                            }, 3000);
                        }
                    },
                    { text: 'Annuler', style: 'cancel' }
                ]
            );

        } catch (error: any) {
            console.error('[PAYMENT ERROR]', error.response?.data || error.message);
            Alert.alert('Echec', 'L\'opération a échoué: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
            setStatusMessage('');
        }
    };

    return (
        <View style={styles.container}>
            <FlatList
                ListHeaderComponent={
                    <>
                        <Text style={styles.title}>Identification & Paiement</Text>

                        <View style={styles.summary}>
                            <Text style={styles.summaryTitle}>Résumé du voyage</Text>
                            <Text>De: {schedule.route.departureCity}</Text>
                            <Text>À: {schedule.route.arrivalCity}</Text>
                            <Text>Bus: {schedule.bus.model}</Text>
                            <Text style={styles.seatInfo}>Siège n°{seatNumber}</Text>
                            <Text style={styles.price}>{schedule.route.price} FCFA</Text>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Nom complet (tel que sur la pièce d'identité)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: Jean KABORE"
                                value={fullName}
                                onChangeText={setFullName}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Nationalité</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: Burkinabè"
                                value={nationality}
                                onChangeText={setNationality}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>N° de Pièce d'Identité (CNI / Passeport)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="N° de la pièce"
                                value={idCardNumber}
                                onChangeText={setIdCardNumber}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Profils Sociaux (Lien Facebook, WhatsApp, etc.)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Lien ou Identifiant"
                                value={socialMedia}
                                onChangeText={setSocialMedia}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Numéro de Paiement Orange / Moov</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: 70 12 34 56"
                                keyboardType="phone-pad"
                                value={phone}
                                onChangeText={setPhone}
                            />
                        </View>

                        <TouchableOpacity style={styles.payButton} onPress={handlePayment} disabled={loading}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Payer {schedule.route.price} FCFA</Text>}
                        </TouchableOpacity>

                        {loading && statusMessage ? (
                            <Text style={styles.statusText}>{statusMessage}</Text>
                        ) : null}

                        <View style={{ height: 40 }} />
                    </>
                }
                data={[]}
                renderItem={null}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    summary: { backgroundColor: '#f9fafb', padding: 20, borderRadius: 10, marginBottom: 20 },
    summaryTitle: { fontWeight: 'bold', marginBottom: 10, fontSize: 16 },
    seatInfo: { fontWeight: 'bold', color: '#2563EB', marginTop: 5 },
    price: { fontSize: 24, fontWeight: 'bold', color: '#16a34a', marginTop: 10 },
    inputContainer: { marginBottom: 20 },
    label: { marginBottom: 5, color: '#555' },
    input: { borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 8, fontSize: 18 },
    payButton: { backgroundColor: '#f97316', padding: 15, borderRadius: 8, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
    statusText: { color: '#2563eb', fontWeight: 'bold', textAlign: 'center', marginTop: 10, fontSize: 14 }
});
