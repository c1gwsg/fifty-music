import os
import shutil
import zipfile
import plistlib
import json

base_dir = r"c:\Users\bakaz\OneDrive\Desktop\new\Fifty"
extracted_dir = os.path.join(base_dir, "build_ipa")
payload_dir = os.path.join(extracted_dir, "Payload")
app_dir = os.path.join(payload_dir, "App.app")
dist_dir = os.path.join(base_dir, "dist")
output_ipa = os.path.join(base_dir, "Fifty.ipa")
downloads_ipa = r"C:\Users\bakaz\Downloads\Fifty.ipa"

print("=== Building Fifty Native iOS Package (Zero amfid integrity error) ===")

# 1. Clean existing build_ipa and re-extract from mori_base.ipa
if os.path.exists(extracted_dir):
    shutil.rmtree(extracted_dir, ignore_errors=True)
os.makedirs(extracted_dir, exist_ok=True)

mori_ipa = os.path.join(base_dir, "mori_base.ipa")
print(f"Extracting base native container from {mori_ipa}...")
with zipfile.ZipFile(mori_ipa, 'r') as zf:
    zf.extractall(extracted_dir)

# 2. Remove old signatures from App.app and all embedded Frameworks
print("Removing old signatures to ensure clean signature allocation...")
for root, dirs, files in os.walk(app_dir):
    if "_CodeSignature" in dirs:
        sig_path = os.path.join(root, "_CodeSignature")
        shutil.rmtree(sig_path, ignore_errors=True)
    if "embedded.mobileprovision" in files:
        try:
            os.remove(os.path.join(root, "embedded.mobileprovision"))
        except:
            pass

# 3. Clean App.app/public and copy Fifty dist web bundle
public_dir = os.path.join(app_dir, "public")
if os.path.exists(public_dir):
    shutil.rmtree(public_dir, ignore_errors=True)
os.makedirs(public_dir, exist_ok=True)

print("Copying compiled Fifty assets into App.app/public/...")
for item in os.listdir(dist_dir):
    s = os.path.join(dist_dir, item)
    d = os.path.join(public_dir, item)
    if os.path.isdir(s):
        shutil.copytree(s, d, dirs_exist_ok=True)
    else:
        shutil.copy2(s, d)

# 4. Update capacitor.config.json
cap_config_path = os.path.join(app_dir, "capacitor.config.json")
cap_config = {
    "appId": "com.bakaz.fifty",
    "appName": "Fifty",
    "webDir": "public",
    "plugins": {
        "CapacitorHttp": {
            "enabled": True
        },
        "CapacitorCookies": {
            "enabled": True
        }
    }
}
with open(cap_config_path, "w", encoding="utf-8") as f:
    json.dump(cap_config, f, indent=2)

# 5. Update Info.plist
plist_path = os.path.join(app_dir, "Info.plist")
with open(plist_path, "rb") as f:
    pl = plistlib.load(f)

# Update metadata for Fifty
pl["CFBundleDisplayName"] = "Fifty"
pl["CFBundleName"] = "Fifty"
pl["CFBundleIdentifier"] = "com.bakaz.fifty"
pl["CFBundleShortVersionString"] = "1.0.0"
pl["CFBundleVersion"] = "1"
pl["CFBundleExecutable"] = "App"

# Background audio playback mode so iOS doesn't mute when gaming or locked
pl["UIBackgroundModes"] = ["audio"]

# Arbitrary loads for local streaming from server
pl["NSAppTransportSecurity"] = {"NSAllowsArbitraryLoads": True}

# Lock to portrait like Spotify mobile
pl["UISupportedInterfaceOrientations"] = ["UIInterfaceOrientationPortrait"]

with open(plist_path, "wb") as f:
    plistlib.dump(pl, f, fmt=plistlib.FMT_BINARY)

print("Info.plist successfully updated:")
print(f"  CFBundleDisplayName: {pl.get('CFBundleDisplayName')}")
print(f"  CFBundleIdentifier: {pl.get('CFBundleIdentifier')}")
print(f"  CFBundleExecutable: {pl.get('CFBundleExecutable')}")
print(f"  UIBackgroundModes: {pl.get('UIBackgroundModes')}")

# 6. Copy App Icons
icon_source = os.path.join(base_dir, "build_ipa", "Payload", "Fifty.app")
# Check if we have icon files in previous build
sample_icon_60 = os.path.join(base_dir, "extracted_sample", "Payload", "Spotube.app", "AppIcon60x60@2x.png")
sample_icon_76 = os.path.join(base_dir, "extracted_sample", "Payload", "Spotube.app", "AppIcon76x76@2x~ipad.png")
if os.path.exists(sample_icon_60):
    shutil.copy2(sample_icon_60, os.path.join(app_dir, "AppIcon60x60@2x.png"))
if os.path.exists(sample_icon_76):
    shutil.copy2(sample_icon_76, os.path.join(app_dir, "AppIcon76x76@2x~ipad.png"))

# 7. Package into Fifty.ipa
if os.path.exists(output_ipa):
    os.remove(output_ipa)

print("Packaging Payload into Fifty.ipa...")
with zipfile.ZipFile(output_ipa, "w", zipfile.ZIP_DEFLATED) as zout:
    for root, dirs, files in os.walk(payload_dir):
        for file in files:
            full_path = os.path.join(root, file)
            # Relative to extracted_dir so it starts with Payload/App.app/...
            rel_path = os.path.relpath(full_path, extracted_dir)
            zout.write(full_path, rel_path)

ipa_size = os.path.getsize(output_ipa)
print(f"Created Fifty.ipa! Size: {ipa_size} bytes ({ipa_size / 1024 / 1024:.2f} MB)")

# Copy to Downloads
shutil.copy2(output_ipa, downloads_ipa)
print(f"Copied to {downloads_ipa}")
