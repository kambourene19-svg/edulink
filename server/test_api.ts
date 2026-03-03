import axios from 'axios';

async function testAPI() {
    try {
        console.log('--- Logging in ---');
        const loginRes = await axios.post('http://localhost:3001/api/auth/login', {
            phone: '00000000',
            password: 'admin123'
        });

        const token = loginRes.data.token;
        console.log('Token obtained:', token.substring(0, 20) + '...');
        console.log('User role:', loginRes.data.user.role);

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        console.log('\n--- Testing /api/companies ---');
        const compRes = await axios.get('http://localhost:3001/api/companies', config);
        console.log('Companies found:', compRes.data.length);

        console.log('\n--- Testing /api/stats ---');
        const statsRes = await axios.get('http://localhost:3001/api/stats', config);
        console.log('Stats:', JSON.stringify(statsRes.data.stats, null, 2));
        console.log('Recent Bookings:', statsRes.data.recentBookings.length);

        console.log('\n--- Testing /api/companies/bus ---');
        const busRes = await axios.get('http://localhost:3001/api/companies/bus', config);
        console.log('Buses found:', busRes.data.length);

    } catch (error: any) {
        console.error('API Test Failed:', error.response?.status, error.response?.data || error.message);
    }
}

testAPI();
