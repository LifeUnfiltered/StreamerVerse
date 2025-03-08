const { execSync } = require('child_process');

async function buildAndroid() {
  try {
    // Build the web app first
    console.log('Building web application...');
    execSync('npm run build', { stdio: 'inherit' });

    // Initialize Capacitor if not already done
    console.log('Initializing Capacitor...');
    execSync('npx cap init "Streamer Verse" "com.streamerverse.app" --web-dir="dist/public"', { stdio: 'inherit' });

    // Add Android platform
    console.log('Adding Android platform...');
    execSync('npx cap add android', { stdio: 'inherit' });

    // Copy web assets
    console.log('Copying web assets to Android platform...');
    execSync('npx cap copy', { stdio: 'inherit' });

    // Open Android Studio (for local development)
    console.log('Opening Android Studio...');
    execSync('npx cap open android', { stdio: 'inherit' });

    console.log('Android build setup completed successfully!');
  } catch (error) {
    console.error('Error during Android build:', error);
    process.exit(1);
  }
}

buildAndroid();
