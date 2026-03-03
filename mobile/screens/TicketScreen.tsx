import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, SafeAreaView, StatusBar } from 'react-native';
import { Bus, Calendar, MapPin, Navigation, ArrowLeft, Download, Share2, ShieldCheck, Ticket as TicketIcon } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function TicketScreen({ route, navigation }: any) {
    const { schedule, seatNumber, qrCode } = route.params;
    const company = schedule.route.company;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header / Nav */}
            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBtn}>
                    <ArrowLeft size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.navTitle}>Votre Billet</Text>
                <View style={styles.navActions}>
                    <TouchableOpacity style={styles.navBtn}>
                        <Share2 size={22} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.ticketWrapper}>
                    {/* Top Section */}
                    <View style={styles.ticketTop}>
                        <View style={styles.brandSection}>
                            <View style={styles.logoBox}>
                                <Bus size={24} color="#1E293B" />
                            </View>
                            <View>
                                <Text style={styles.companyName}>{company.name}</Text>
                                <Text style={styles.classText}>Classe Standard</Text>
                            </View>
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>VALIDE</Text>
                            </View>
                        </View>

                        <View style={styles.routeSection}>
                            <View style={styles.cityInfo}>
                                <Text style={styles.timeText}>
                                    {new Date(schedule.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                                <Text style={styles.cityName}>{schedule.route.departureCity}</Text>
                            </View>

                            <View style={styles.pathLine}>
                                <View style={styles.dot} />
                                <View style={styles.line} />
                                <Navigation size={16} color="#CBD5E1" />
                                <View style={styles.line} />
                                <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
                            </View>

                            <View style={[styles.cityInfo, { alignItems: 'flex-end' }]}>
                                <Text style={styles.timeText}>Arrivée</Text>
                                <Text style={styles.cityName}>{schedule.route.arrivalCity}</Text>
                            </View>
                        </View>

                        <View style={styles.detailsGrid}>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>DATE</Text>
                                <Text style={styles.detailValue}>
                                    {new Date(schedule.departureTime).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>SIÈGE</Text>
                                <View style={styles.seatBadge}>
                                    <Text style={styles.seatText}>{seatNumber}</Text>
                                </View>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>BUS</Text>
                                <Text style={styles.detailValue}>{schedule.bus.plate}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Divider with Cuts */}
                    <View style={styles.dividerBox}>
                        <View style={styles.cutLeft} />
                        <View style={styles.dashedLine} />
                        <View style={styles.cutRight} />
                    </View>

                    {/* Bottom Section (QR) */}
                    <View style={styles.ticketBottom}>
                        <View style={styles.qrHeader}>
                            <Text style={styles.qrTitle}>Scanner pour embarquer</Text>
                            <Text style={styles.qrSub}>Présentez ce code au contrôleur à la gare.</Text>
                        </View>

                        <View style={styles.qrContainer}>
                            <View style={styles.qrFrame}>
                                {/* Placeholder logic for QR display */}
                                <View style={styles.qrBg}>
                                    <TicketIcon size={80} color="#1E293B" opacity={0.1} />
                                </View>
                                <Text style={styles.qrCodeText}>{qrCode.substring(0, 12).toUpperCase()}</Text>
                            </View>
                        </View>

                        <View style={styles.securityBox}>
                            <ShieldCheck size={14} color="#16A34A" />
                            <Text style={styles.securityText}>Billet authentifié par FasoTicket</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity style={styles.downloadBtn}>
                    <Download size={20} color="#fff" />
                    <Text style={styles.downloadText}>Télécharger en PDF</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.homeBtn}
                    onPress={() => navigation.navigate('Search')}
                >
                    <Text style={styles.homeBtnText}>Retour à l'accueil</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    navBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        height: 60
    },
    navTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
    navBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12
    },
    navActions: { width: 40 },
    scrollContent: { padding: 24, paddingBottom: 60 },
    ticketWrapper: {
        backgroundColor: '#fff',
        borderRadius: 32,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.2,
        shadowRadius: 30,
        elevation: 10
    },
    ticketTop: { padding: 24 },
    brandSection: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 32 },
    logoBox: {
        width: 48,
        height: 48,
        backgroundColor: '#F1F5F9',
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center'
    },
    companyName: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
    classText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
    statusBadge: {
        marginLeft: 'auto',
        backgroundColor: '#F0FDF4',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8
    },
    statusText: { color: '#16A34A', fontSize: 10, fontWeight: '900' },
    routeSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 32,
        backgroundColor: '#F8FAFC',
        padding: 20,
        borderRadius: 20
    },
    cityInfo: { flex: 1 },
    timeText: { fontSize: 13, fontWeight: '700', color: '#64748B', marginBottom: 4 },
    cityName: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
    pathLine: { flexDirection: 'row', alignItems: 'center', flex: 0.8, justifyContent: 'center', gap: 6 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#CBD5E1' },
    line: { height: 2, flex: 1, backgroundColor: '#E2E8F0', borderRadius: 1 },
    detailsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
    detailItem: { gap: 4 },
    detailLabel: { fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 1 },
    detailValue: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
    seatBadge: {
        backgroundColor: '#FFF7ED',
        paddingHorizontal: 12,
        paddingVertical: 2,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FFEDD5'
    },
    seatText: { fontSize: 15, fontWeight: '900', color: '#D97706' },
    dividerBox: { height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    cutLeft: { width: 20, height: 40, backgroundColor: '#0F172A', borderTopRightRadius: 20, borderBottomRightRadius: 20, marginLeft: -10 },
    cutRight: { width: 20, height: 40, backgroundColor: '#0F172A', borderTopLeftRadius: 20, borderBottomLeftRadius: 20, marginRight: -10 },
    dashedLine: { flex: 1, height: 1, borderStyle: 'dotted', borderWidth: 1, borderColor: '#E2E8F0', marginHorizontal: 10, opacity: 0.5 },
    ticketBottom: { padding: 24, paddingTop: 0, alignItems: 'center' },
    qrHeader: { alignItems: 'center', marginBottom: 24 },
    qrTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
    qrSub: { fontSize: 12, color: '#64748B', textAlign: 'center' },
    qrContainer: {
        width: 180,
        height: 180,
        backgroundColor: '#F8FAFC',
        borderRadius: 24,
        padding: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9'
    },
    qrFrame: {
        flex: 1,
        backgroundColor: '#1E293B',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center'
    },
    qrBg: { width: 100, height: 100, alignItems: 'center', justifyContent: 'center' },
    qrCodeText: { color: '#fff', fontSize: 10, fontWeight: '700', position: 'absolute', bottom: 12, letterSpacing: 1 },
    securityBox: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 24 },
    securityText: { fontSize: 11, fontWeight: '700', color: '#16A34A' },
    downloadBtn: {
        backgroundColor: '#1E293B',
        height: 64,
        borderRadius: 22,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginTop: 32
    },
    downloadText: { color: '#fff', fontSize: 16, fontWeight: '800' },
    homeBtn: {
        padding: 20,
        alignItems: 'center'
    },
    homeBtnText: { color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: '700' }
});
