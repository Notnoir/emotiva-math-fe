# AR Mode - EMOTIVA-MATH

## 🌟 Fitur Augmented Reality

Mode AR memungkinkan siswa melihat bangun ruang 3D di dunia nyata mereka menggunakan kamera smartphone.

## 📱 Cara Menggunakan

### 1. **Akses AR Mode**

- Buka halaman pembelajaran
- Pilih topik bangun ruang (Kubus, Balok, Bola, dll)
- Klik tombol **"Mode AR"** (hijau dengan icon view_in_ar)

### 2. **Gunakan di Smartphone**

AR mode bekerja optimal di:

- **iOS**: Safari (iOS 12+) - Menggunakan AR Quick Look
- **Android**: Chrome (Android 8+) - Menggunakan Scene Viewer

### 3. **Izinkan Kamera**

- Browser akan meminta akses kamera
- Klik "Allow" atau "Izinkan"

### 4. **Tempatkan Model**

- Arahkan kamera ke permukaan datar (meja, lantai)
- Tap di layar untuk menempatkan model 3D
- Model akan muncul di dunia nyata!

## 🎮 Kontrol AR

### Di Mode Preview (sebelum AR):

- **Drag 1 jari** - Rotate model
- **Pinch 2 jari** - Zoom in/out
- **Drag 2 jari** - Pan/move view
- **Auto-rotate** - Model berputar otomatis

### Di Mode AR (setelah activate):

- **Tap** - Tempatkan model
- **Pinch** - Scale model (iOS)
- **Rotate** - Gesture rotate (iOS)
- **Move** - Walk around untuk lihat dari berbagai sudut

## 🛠️ Teknologi

### Library

- **@google/model-viewer** - AR viewer component
- **WebXR Device API** - Browser AR support
- **AR Quick Look** - iOS native AR
- **Scene Viewer** - Android native AR

### 3D Models

- Format: GLB (binary glTF)
- Generated from Three.js geometries
- Optimized for mobile (<1MB each)

## 📋 Setup Instructions

### 1. Install Dependencies

```bash
cd fe-emotiva-math
npm install
```

### 2. Generate 3D Models

```bash
npm run generate-models
```

Ini akan membuat file GLB di `public/models/`:

- cube.glb
- box.glb
- sphere.glb
- cylinder.glb
- cone.glb
- pyramid.glb
- prism.glb

### 3. Run Development Server

```bash
npm run dev
```

### 4. Test AR Mode

- Buka di browser desktop untuk preview
- Untuk AR penuh, akses dari smartphone:
  - Scan QR code atau
  - Buka URL di mobile browser

## 🎯 Fitur AR Viewer

### ARViewer Component Props:

```typescript
interface ARViewerProps {
  shapeType:
    | "kubus"
    | "balok"
    | "bola"
    | "tabung"
    | "kerucut"
    | "limas"
    | "prisma";
  color?: string;
  scale?: [number, number, number];
  onClose: () => void;
}
```

### Features:

✅ **3D Preview** - Lihat model sebelum AR
✅ **Auto-rotate** - Model berputar otomatis
✅ **Camera controls** - Touch gestures
✅ **Shadow** - Realistic ground shadow
✅ **Lighting** - Dynamic lighting
✅ **AR Button** - One-tap activate AR
✅ **Instructions** - In-app guidance
✅ **Platform Detection** - iOS/Android support
✅ **Fallback** - Desktop preview mode

## 🔧 Troubleshooting

### AR tidak tersedia?

- ✅ Gunakan smartphone (bukan desktop)
- ✅ Gunakan browser yang support (Safari iOS / Chrome Android)
- ✅ Update browser ke versi terbaru
- ✅ Berikan izin akses kamera

### Model tidak muncul?

- ✅ Check file GLB ada di `public/models/`
- ✅ Run `npm run generate-models`
- ✅ Check console untuk error

### AR button tidak muncul?

- ✅ Buka di mobile device
- ✅ Check WebXR support di browser
- ✅ Pastikan HTTPS (required untuk AR)

## 🚀 Production Deployment

### Requirements:

1. **HTTPS** - AR requires secure context
2. **Valid SSL Certificate**
3. **GLB files** - Upload to public/models/
4. **CDN** (optional) - For faster model loading

### Optimization:

- Compress GLB files (use gltf-pipeline)
- Use CDN for models
- Lazy load AR component
- Progressive loading

## 📊 Browser Support

| Platform   | Browser        | Support          |
| ---------- | -------------- | ---------------- |
| iOS 12+    | Safari         | ✅ AR Quick Look |
| Android 8+ | Chrome         | ✅ Scene Viewer  |
| Desktop    | Chrome/Firefox | ⚠️ Preview only  |

## 🎓 Educational Benefits

### Why AR for Math Education?

1. **Spatial Understanding** - See 3D shapes in real space
2. **Size Perception** - Real-world scale comparison
3. **Multiple Angles** - Walk around the shape
4. **Engagement** - Fun and interactive
5. **Memorable** - Better retention

### Use Cases:

- 📐 Understand shape dimensions
- 📏 Compare sizes visually
- 🔄 See all faces/sides
- 📸 Take photos for homework
- 🎯 Present to class

## 💡 Tips for Teachers

1. **Demo First** - Show students how to use AR
2. **Safe Space** - Clear area for AR viewing
3. **Good Lighting** - Well-lit room works best
4. **Flat Surfaces** - Use tables or floor
5. **Share Screenshots** - Students can capture AR views

## 🔮 Future Enhancements

- [ ] Multiple shapes at once
- [ ] Measurement tools in AR
- [ ] Formula overlay in AR
- [ ] Animation in AR mode
- [ ] AR collaboration (multi-user)
- [ ] AR quiz integration
- [ ] Export AR sessions

## 📝 Notes

- AR mode requires smartphone for full experience
- Desktop shows interactive 3D preview
- Models are optimized for mobile performance
- AR works offline once models are loaded
- Compatible with most modern mobile devices

---

**Made with ❤️ for better math education**
