import axios from 'axios';

async function checkHealth() {
    console.log('Checking server health on port 3001...');
    for (let i = 0; i < 30; i++) { // Try for 30 seconds
        try {
            const res = await axios.get('http://localhost:3001/health');
            if (res.status === 200) {
                console.log('Server is UP and READY!');
                return;
            }
        } catch (e) {
            // ignore
        }
        await new Promise(r => setTimeout(r, 1000));
        process.stdout.write('.');
    }
    console.log('\nServer timed out or failed to start.');
}

checkHealth();
