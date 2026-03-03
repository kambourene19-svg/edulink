import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { ArrowLeft, CheckCircle, XCircle, FileText, Printer, Search } from 'lucide-react';
import { generateManifestPDF } from '../utils/pdfGenerator';
import { useAuth } from '../context/AuthContext';

interface Passenger {
    id: string; // Booking ID
    bookingId: string;
    seatNumber: number;
    status: string;
    checkedIn: boolean;
    user: {
        fullName: string;
        phone: string;
        idCardNumber?: string;
    };
    payment?: {
        amount: number;
        status: string;
    };
}

interface Schedule {
    id: string;
    departureTime: string;
    bus: { plate: string; seats: number };
    route: { departureCity: string; arrivalCity: string; company: { name: string; logoUrl?: string } };
    bookings: Passenger[];
}

export default function BoardingList() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [schedule, setSchedule] = useState<Schedule | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const { data } = await api.get(`/companies/schedules/${id}`);
            // Map bookings to flatten structure if needed, but api returns 'bookings' inside schedule
            setSchedule(data);
        } catch (error) {
            console.error('Error fetching boarding list', error);
            alert('Impossible de charger le manifeste.');
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleCheckIn = async (bookingId: string, currentStatus: boolean) => {
        try {
            await api.put(`/companies/bookings/${bookingId}/checkin`, { checkedIn: !currentStatus });
            // Optimistic update or refresh
            if (schedule) {
                const updatedBookings = schedule.bookings.map(b =>
                    b.id === bookingId ? { ...b, checkedIn: !currentStatus } : b
                );
                setSchedule({ ...schedule, bookings: updatedBookings });
            }
        } catch (error) {
            alert('Erreur lors de la mise à jour du statut.');
        }
    };

    const handlePrintManifest = async () => {
        if (!schedule) return;

        // Prepare data for PDF generator
        const manifestData = {
            schedule: {
                departureTime: schedule.departureTime,
                route: `${schedule.route.departureCity} ➔ ${schedule.route.arrivalCity}`,
                bus: schedule.bus.plate,
                confirmedCount: schedule.bookings.filter(b => b.status === 'CONFIRMED').length,
                totalSeats: schedule.bus.seats,
                company: schedule.route.company // For logo if needed
            },
            passengers: schedule.bookings
                .filter(b => b.status === 'CONFIRMED')
                .map(b => ({
                    seat: b.seatNumber,
                    name: b.user.fullName,
                    phone: b.user.phone,
                    idCard: b.user.idCardNumber || 'N/A'
                }))
        };

        await generateManifestPDF(manifestData);
    };

    if (loading) return <div className="p-8 text-center">Chargement du manifeste...</div>;
    if (!schedule) return <div className="p-8 text-center text-red-500">Voyage introuvable.</div>;

    const filteredBookings = schedule.bookings.filter(b =>
        b.user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.user.phone?.includes(searchTerm) ||
        b.seatNumber.toString().includes(searchTerm)
    );

    const onboardCount = schedule.bookings.filter(b => b.checkedIn).length;
    const confirmedCount = schedule.bookings.filter(b => b.status === 'CONFIRMED').length;

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8">
            <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-800 transition">
                <ArrowLeft size={20} /> Retour
            </button>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
                <div className="bg-slate-800 text-white p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <FileText /> Manifeste de Voyage
                        </h1>
                        <p className="text-slate-300 mt-1">
                            {schedule.route.departureCity} ➔ {schedule.route.arrivalCity} • {new Date(schedule.departureTime).toLocaleString()}
                        </p>
                        <p className="text-sm text-slate-400 mt-1">Bus: {schedule.bus.plate} ({schedule.bus.seats} places)</p>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-700 px-4 py-2 rounded-lg">
                        <div className="text-center">
                            <span className="block text-xs text-slate-400 uppercase">Confirmés</span>
                            <span className="text-xl font-bold">{confirmedCount}</span>
                        </div>
                        <div className="w-px h-8 bg-slate-600"></div>
                        <div className="text-center">
                            <span className="block text-xs text-slate-400 uppercase">À Bord</span>
                            <span className={`text-xl font-bold ${onboardCount === confirmedCount ? 'text-green-400' : 'text-orange-400'}`}>
                                {onboardCount}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={handlePrintManifest}
                        className="bg-white text-slate-900 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-100 transition shadow-md"
                    >
                        <Printer size={18} /> Imprimer Manifeste
                    </button>
                </div>

                <div className="p-4 border-b bg-gray-50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher un passager (nom, tél, siège)..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
                            <tr>
                                <th className="px-6 py-4 w-16 text-center">Siège</th>
                                <th className="px-6 py-4">Passager</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4 text-center">Statut Réservation</th>
                                <th className="px-6 py-4 text-center">Embarquement</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredBookings.map((booking) => (
                                <tr key={booking.id} className={`hover:bg-gray-50 transition ${booking.checkedIn ? 'bg-green-50' : ''}`}>
                                    <td className="px-6 py-4 text-center font-bold text-slate-700 text-lg">
                                        {booking.seatNumber}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{booking.user.fullName}</div>
                                        {booking.user.idCardNumber && <div className="text-xs text-gray-500">CNI: {booking.user.idCardNumber}</div>}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{booking.user.phone}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                                booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {booking.checkedIn ? (
                                            <span className="inline-flex items-center gap-1 text-green-600 font-bold text-sm">
                                                <CheckCircle size={16} /> À BORD
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-gray-400 text-sm">
                                                <XCircle size={16} /> En attente
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {booking.status === 'CONFIRMED' && (
                                            <button
                                                onClick={() => handleToggleCheckIn(booking.id, booking.checkedIn)}
                                                className={`px-3 py-1 rounded-lg text-sm font-medium transition ${booking.checkedIn
                                                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    }`}
                                            >
                                                {booking.checkedIn ? 'Débarquer' : 'Embarquer'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredBookings.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-500">
                                        Aucun passager trouvé.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
