/**
 * Background Worker for JobPilot AI
 * 
 * This worker runs scheduled tasks like job scanning.
 * For Render deployment, this requires the Starter plan or higher.
 * 
 * Alternative: Use Render Cron Jobs feature (paid) or external cron service.
 */

const { execSync } = require('child_process');

const SCAN_INTERVAL = process.env.SCAN_INTERVAL_MS || 2 * 60 * 60 * 1000; // 2 hours default
const APP_URL = process.env.RENDER_EXTERNAL_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function runJobScan() {
  console.log(`[${new Date().toISOString()}] Running job scan...`);
  
  try {
    const response = await fetch(`${APP_URL}/api/cron/job-scan`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || ''}`,
      },
    });
    
    const result = await response.json();
    console.log(`[${new Date().toISOString()}] Scan complete:`, result);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Scan failed:`, error.message);
  }
}

async function main() {
  console.log('🚀 JobPilot Worker started');
  console.log(`📊 Scan interval: ${SCAN_INTERVAL / 1000 / 60} minutes`);
  console.log(`🌐 App URL: ${APP_URL}`);
  
  // Run immediately on start
  await runJobScan();
  
  // Then run on interval
  setInterval(runJobScan, SCAN_INTERVAL);
}

main().catch(console.error);
