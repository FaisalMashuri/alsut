rm -f release.apk
ionic cordova build --release android &&
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore guardtour-release-key.keystore platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk  alias_name &&
 ~/Library/Android/sdk/build-tools/25.0.2/zipalign -v 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk release.apk
