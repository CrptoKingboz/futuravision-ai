const URL = "https://teachablemachine.withgoogle.com/models/R8HTR4CcU/";

let model, webcam, maxPredictions;
let isFreeze = false;

// 1. Memuat Model
async function loadModel() {
    if (!model) {
        model = await tmImage.load(URL + "model.json", URL + "metadata.json");
        maxPredictions = model.getTotalClasses();
    }
}

// 2. Mode Kamera Live
async function init() {
    await loadModel();
    isFreeze = false;
    
    const container = document.getElementById("webcam-container");
    container.innerHTML = ""; 

    webcam = new tmImage.Webcam(350, 350, true);
    await webcam.setup();
    await webcam.play();
    
    container.appendChild(webcam.canvas);
    window.requestAnimationFrame(loop);
}

async function loop() {
    if (!isFreeze) {
        webcam.update();
        await predict(webcam.canvas);
        window.requestAnimationFrame(loop);
    }
}

// 3. Mode Upload Gambar
async function handleUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    await loadModel();
    isFreeze = true; 
    if (webcam) webcam.stop();

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.src = e.target.result;
        img.onload = async function() {
            const container = document.getElementById("webcam-container");
            container.innerHTML = "";
            container.appendChild(img);
            await predict(img);
        };
    };
    reader.readAsDataURL(file);
}

// 4. Fungsi Prediksi
async function predict(inputMedia) {
    const prediction = await model.predict(inputMedia);
    
    let highest = prediction[0];
    for (let i = 1; i < maxPredictions; i++) {
        if (prediction[i].probability > highest.probability) {
            highest = prediction[i];
        }
    }

    const label = highest.className;
    const confidence = (highest.probability * 100).toFixed(1);

    // Update Teks Hasil
    document.getElementById("result").innerText = "Terdeteksi : " + label;
    document.getElementById("confidence").innerText = "Confidence : " + confidence + "%";

    // Update Dampak & Progress Bar
    const impact = getImpactDetail(label);
    const bar = document.getElementById("impactBar");
    
    bar.style.width = impact.score + "%";
    document.getElementById("impactValue").innerText = impact.score + "%";
    document.getElementById("simulation").innerHTML = impact.html;

    // Logika Warna Progress Bar
    if (impact.score > 70) bar.style.background = "#ef4444"; // Merah
    else if (impact.score > 40) bar.style.background = "#facc15"; // Kuning
    else bar.style.background = "#22c55e"; // Hijau

    // Freeze jika deteksi objek selain manusia sudah cukup yakin
    if (label.toLowerCase() !== "human" && highest.probability > 0.9) {
        isFreeze = true;
    }
}

// 5. Reset App
function resetScan() {
    location.reload(); 
}

// 6. DATABASE DAMPAK (MASUKKAN DISINI)
function getImpactDetail(label) {
    // Membersihkan teks label agar cocok dengan case
    label = label.trim().toLowerCase();

    switch(label) {
        // ================= BOOK =================
        case "buku pelajaran":
            return {
                score: 15,
                html: `📚 <b>Buku Pelajaran</b><br>📊 Grafik: peningkatan pemahaman<br>📈 Impact: 15/100 (🟢 Positif tinggi)<br>💡 Gunakan rutin & latihan soal`
            };
        case "buku gambar":
            return {
                score: 22,
                html: `🎨 <b>Buku Gambar</b><br>📊 Grafik: peningkatan kreativitas<br>📈 Impact: 22/100 (🟢 Positif)<br>💡 Latih konsistensi menggambar`
            };
        case "buku tulis":
            return {
                score: 25,
                html: `📒 <b>Buku Tulis</b><br>📊 Grafik: peningkatan daya ingat<br>📈 Impact: 25/100 (🟢 Positif)<br>💡 Catat & ringkas materi`
            };

        // ================= FAST FOOD =================
        case "fast food":
            return {
                score: 78,
                html: `🍔 <b>Fast Food</b><br>📊 Grafik: peningkatan kalori & risiko<br>📈 Impact: 78/100 (🔴 Tinggi)<br>💡 Batasi konsumsi & olahraga`
            };

        // ================= GADGET =================
        case "headset":
            return {
                score: 55,
                html: `🎧 <b>Headset</b><br>📊 Grafik: durasi penggunaan<br>📈 Impact: 55/100 (🟡 Sedang)<br>💡 Batasi volume`
            };
        case "pc":
            return {
                score: 50,
                html: `💻 <b>PC / Laptop</b><br>📊 Grafik: produktif vs tidak<br>📈 Impact: 50/100 (🟡 Sedang)<br>💡 Gunakan untuk belajar`
            };
        case "smartphone":
            return {
                score: 65,
                html: `📱 <b>Smartphone</b><br>📊 Grafik: screen time tinggi<br>📈 Impact: 65/100 (🟡→🔴)<br>💡 Batasi penggunaan`
            };

        // ================= HEALTHY FOOD =================
        case "biji":
            return {
                score: 25,
                html: `🌾 <b>Biji-bijian</b><br>📊 Grafik: energi meningkat<br>📈 Impact: 25/100 (🟢 Positif)<br>💡 Konsumsi rutin`
            };
        case "buah":
            return {
                score: 20,
                html: `🍎 <b>Buah</b><br>📊 Grafik: vitamin meningkat<br>📈 Impact: 20/100 (🟢 Positif)<br>💡 Konsumsi setiap hari`
            };
        case "protein":
            return {
                score: 22,
                html: `🍗 <b>Protein</b><br>📊 Grafik: massa otot meningkat<br>📈 Impact: 22/100 (🟢 Positif)<br>💡 Konsumsi seimbang`
            };
        case "sayur":
            return {
                score: 18,
                html: `🥦 <b>Sayur</b><br>📊 Grafik: kesehatan meningkat<br>📈 Impact: 18/100 (🟢 Sangat Baik)<br>💡 Menu harian`
            };

        // ================= PLASTIC =================
        case "botol plastik":
            return {
                score: 85,
                html: `🧴 <b>Botol Plastik</b><br>📊 Grafik: sampah meningkat<br>📈 Impact: 85/100 (🔴 Sangat Tinggi)<br>💡 Gunakan tumbler`
            };
        case "kantong plastik":
            return {
                score: 70,
                html: `🛍 <b>Kantong Plastik</b><br>📊 Grafik: limbah bulanan<br>📈 Impact: 70/100 (🔴 Tinggi)<br>💡 Gunakan tas kain`
            };
        case "totebag":
            return {
                score: 20,
                html: `👜 <b>Tote Bag</b><br>📊 Grafik: pengurangan plastik<br>📈 Impact: 20/100 (🟢 Ramah Lingkungan)<br>💡 Gunakan saat belanja`
            };

        // ================= HUMAN =================
        case "human":
            return {
                score: 0,
                html: `Silakan arahkan kamera ke objek tertentu.`
            };

        // ================= DEFAULT =================
        default:
            return {
                score: 50,
                html: `⚠️ Tidak dikenali: ${label}<br>Coba pastikan objek terlihat jelas di kamera.`
            };
    }
}