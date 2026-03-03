// Test script to verify authentication flow
const axios = require('axios');

async function testAuth() {
    const baseURL = 'http://localhost:3001/api';

    try {
        console.log('=== Testing Authentication Flow ===\n');

        // 1. Login
        console.log('1. Logging in...');
        const loginRes = await axios.post(`${baseURL}/auth/login`, {
            phone: '00000000',
            password: 'admin123'
        });

        const token = loginRes.data.token;
        const user = loginRes.data.user;
        console.log('✅ Login successful');
        console.log('   User:', user.fullName, `(${user.role})`);
        console.log('   Token:', token.substring(0, 30) + '...\n');

        // 2. Test /api/companies WITHOUT token
        console.log('2. Testing /api/companies WITHOUT token...');
        try {
            await axios.get(`${baseURL}/companies`);
            console.log('✅ Accessible without token\n');
        } catch (err) {
            console.log(`❌ Blocked: ${err.response?.status} ${err.response?.statusText}\n`);
        }

        // 3. Test /api/companies WITH token
        console.log('3. Testing /api/companies WITH token...');
        const companiesRes = await axios.get(`${baseURL}/companies`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Success: ${companiesRes.data.length} companies found`);
        companiesRes.data.forEach(c => console.log(`   - ${c.name}`));
        console.log('');

        // 4. Test /api/companies/bus WITH token
        console.log('4. Testing /api/companies/bus WITH token...');
        const busesRes = await axios.get(`${baseURL}/companies/bus`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Success: ${busesRes.data.length} buses found\n`);

        // 5. Test /api/stats WITH token
        console.log('5. Testing /api/stats WITH token...');
        const statsRes = await axios.get(`${baseURL}/stats`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Success:`);
        console.log(`   Total Tickets: ${statsRes.data.stats.totalTickets}`);
        console.log(`   Revenue: ${statsRes.data.stats.revenue} FCFA`);
        console.log(`   Recent Bookings: ${statsRes.data.recentBookings.length}\n`);

        console.log('=== All Tests Passed ===');

    } catch (error) {
        console.error('\n❌ Test Failed:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
        }
    }
}

testAuth();
