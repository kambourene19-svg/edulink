import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import { Briefcase, Bus, Calendar, ChevronRight, Clock, MapPin, Navigation, Ticket, TriangleAlert } from 'lucide-react-native';

export default function MyBookingsScreen({ navigation }: any) {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [phone, setPhone] = useState('');
    const [activeTab, setActiveTab] = useState<'FUTURE' | 'PAST'>('FUTURE');

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            const savedPhone = await AsyncStorage.getItem('user_phone');
            if (!savedPhone) {
                setLoading(false);
                return;
            }
            setPhone(savedPhone);

            const { data } = await axios.get(`${API_URL}/bookings/my-bookings`, {
                params: { phone: savedPhone }
            });
            // Trier par date décroissante
            setBookings(data.sort((a: any, b: any) =>
                new Date(b.schedule.departureTime).getTime() - new Date(a.schedule.departureTime).getTime()
            ));
        } catch (error: any) {
            console.error('Erreur chargement voyages', error);
            if (error.response?.status === 403 || error.response?.status === 401) {
                await AsyncStorage.removeItem('userToken');
                navigation.replace('Login');
            }
        } finally {
            setLoading(false);
        }
    };

    const filteredBookings = bookings.filter(b => {
        const isFuture = new Date(b.schedule.departureTime).getTime() > Date.now();
        return activeTab === 'FUTURE' ? isFuture : !isFuture;
    });

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return { color: '#16A34A', bg: '#F0FDF4', label: 'Confirmé' };
            case 'CANCELLED': return { color: '#DC2626', bg: '#FEF2F2', label: 'Annulé' };
            default: return { color: '#D97706', bg: '#FFF7ED', label: 'En attente' };
        }
    };

    const renderItem = ({ item }: any) => {
        const status = getStatusInfo(item.status);
        const departureDate = new Date(item.schedule.departureTime);

        return (
            <TouchableOpacity
                activeOpacity={0.9}
                style={styles.card}
                onPress={() => item.status !== 'CANCELLED' && navigation.navigate('Ticket', { schedule: item.schedule, seatNumber: item.seatNumber, qrCode: item.qrCode })}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.companyBox}>
                        <View style={styles.logoCircle}>
                            <Navigation size={14} color="#64748B" />
                        </View>
                        <Text style={styles.companyName}>{item.schedule.route.company.name}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                        <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                    </View>
                </View>

                <View style={styles.routeRow}>
                    <View style={styles.cityCol}>
                        <Text style={styles.timeText}>{departureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                        <Text style={styles.cityName}>{item.schedule.route.departureCity}</Text>
                    </View>

                    <View style={styles.pathGraphic}>
                        <View style={styles.dot} />
                        <View style={styles.dashLine} />
                        <Bus size={16} color="#CBD5E1" />
                        <View style={styles.dashLine} />
                        <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
                    </View>

                    <View style={[styles.cityCol, { alignItems: 'flex-end' }]}>
                        <Text style={styles.timeText}>Arrivée</Text>
                        <Text style={styles.cityName}>{item.schedule.route.arrivalCity}</Text>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <View style={styles.footerItem}>
                        <Calendar size={14} color="#94A3B8" />
                        <Text style={styles.footerValue}>{departureDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</Text>
                    </View>
                    <View style={styles.footerItem}>
                        <Ticket size={14} color="#94A3B8" />
                        <Text style={styles.footerValue}>Siège #{item.seatNumber}</Text>
                    </View>
                    <ChevronRight size={18} color="#CBD5E1" style={{ marginLeft: 'auto' }} />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mes Titres de Transport</Text>
                <Text style={styles.headerSub}>{bookings.length} réservations au total</Text>
            </View>

            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'FUTURE' && styles.activeTab]}
                    onPress={() => setActiveTab('FUTURE')}
                >
                    <Text style={[styles.tabText, activeTab === 'FUTURE' && styles.activeTabText]}>À venir</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'PAST' && styles.activeTab]}
                    onPress={() => setActiveTab('PAST')}
                >
                    <Text style={[styles.tabText, activeTab === 'PAST' && styles.activeTabText]}>Historique</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#1E293B" />
                </View>
            ) : (
                <FlatList
                    data={filteredBookings}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyBox}>
                            <View style={styles.emptyIconCircle}>
                                <Briefcase size={40} color="#CBD5E1" />
                            </View>
                            <Text style={styles.emptyTitle}>
                                {activeTab === 'FUTURE' ? 'Aucun voyage prévu' : 'Historique vide'}
                            </Text>
                            <Text style={styles.emptySub}>
                                {activeTab === 'FUTURE'
                                    ? "Vous n'avez pas de réservations actives. Trouvez votre prochain trajet !"
                                    : "Vous n'avez pas encore effectué de voyages avec nous."}
                            </Text>
                            {activeTab === 'FUTURE' && (
                                <TouchableOpacity
                                    style={styles.emptyBtn}
                                    onPress={() => navigation.navigate('Search')}
                                >
                                    <Text style={styles.emptyBtnText}>Réserver maintenant</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    }
                    onRefresh={loadBookings}
                    refreshing={loading}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { paddingHorizontal: 24, paddingTop: 20, marginBottom: 20 },
    headerTitle: { fontSize: 24, fontWeight: '900', color: '#0F172A', letterSpacing: -0.5 },
    headerSub: { fontSize: 13, color: '#64748B', fontWeight: '600', marginTop: 4 },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        marginHorizontal: 24,
        padding: 6,
        borderRadius: 16,
        marginBottom: 24
    },
    tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
    activeTab: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    tabText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
    activeTabText: { color: '#0F172A' },
    list: { paddingHorizontal: 24, paddingBottom: 40 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        shadowColor: "#1E293B",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    companyBox: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    logoCircle: { width: 32, height: 32, backgroundColor: '#F1F5F9', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    companyName: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
    routeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    cityCol: { flex: 1 },
    timeText: { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 4 },
    cityName: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
    pathGraphic: { flexDirection: 'row', alignItems: 'center', flex: 0.7, justifyContent: 'center', gap: 6 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#CBD5E1' },
    dashLine: { height: 1, flex: 1, backgroundColor: '#E2E8F0', borderStyle: 'dotted' },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9'
    },
    footerItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    footerValue: { fontSize: 12, fontWeight: '700', color: '#64748B' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyBox: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: 20 },
    emptyIconCircle: {
        width: 80,
        height: 80,
        backgroundColor: '#F1F5F9',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20
    },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
    emptySub: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
    emptyBtn: { backgroundColor: '#1E293B', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14 },
    emptyBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' }
});
