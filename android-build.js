import { execSync } from 'child_process';

async function buildAndroid() {
  try {
    // Build the web app first
    console.log('\n📦 Step 1: Building web application...');
    execSync('npm run build', { stdio: 'inherit' });

    // Add Android platform if not already added
    console.log('\n📱 Step 2: Setting up Android platform...');
    try {
      execSync('npx cap add android', { stdio: 'inherit' });
    } catch (error) {
      console.log('Android platform already exists, continuing...');
    }

    // Copy web assets
    console.log('\n📂 Step 3: Copying web assets to Android platform...');
    execSync('npx cap copy', { stdio: 'inherit' });

    // Update Android project
    console.log('\n🔄 Step 4: Syncing Android project...');
    execSync('npx cap sync android', { stdio: 'inherit' });

    // Build APK using Gradle
    console.log('\n🛠️ Step 5: Building Android APK...');
    process.chdir('android');
    execSync('./gradlew assembleDebug', { stdio: 'inherit' });
    process.chdir('..');

    console.log('\n✨ Build Complete!');
    console.log('\nYour APK can be found at:');
    console.log('android/app/build/outputs/apk/debug/app-debug.apk');

    console.log('\n📱 To install on your Android device:');
    console.log('1. Download the APK file from the location above');
    console.log('2. Transfer it to your Android device');
    console.log('3. On your Android device, tap the APK file to install');
    console.log('4. You might need to enable "Install from Unknown Sources" in your Android settings');

  } catch (error) {
    console.error('❌ Error during Android build:', error);
    process.exit(1);
  }
}

buildAndroid();