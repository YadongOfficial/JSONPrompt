import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// --- Ikon SVG Kustom agar tidak ketergantungan library eksternal ---
const SparklesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const CopyIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12" />
  </svg>
);

const ImageIcon = () => (
  <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const CameraIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export default function App() {
  // --- State Manajemen ---
  const [productName, setProductName] = useState('');
  const [experience, setExperience] = useState('');
  const [tone, setTone] = useState('drama');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  
  // Hasil Output
  const [threadList, setThreadList] = useState([]);
  const [generatedImg, setGeneratedImg] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);
  
  // Toast Notification
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // API Key Setup
  const apiKey = ""; // Diset kosong sesuai instruksi

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  // --- Fungsi Copy To Clipboard (Fallback Safe) ---
  const handleCopyToClipboard = (text, index = null) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      
      if (index !== null) {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
        showToast('Tweet berhasil disalin!');
      } else {
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
        showToast('Seluruh rangkaian cerita disalin!');
      }
    } catch (err) {
      showToast('Gagal menyalin teks.', 'error');
    }
  };

  // --- Handle Unggah Gambar ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        showToast('Ukuran gambar terlalu besar! Maksimal 4MB.', 'error');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        analyzeProductImage(reader.result.split(',')[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    showToast('Foto produk dihapus');
  };

  // --- Exponential Backoff Fetch Wrapper ---
  const fetchWithRetry = async (url, options, retries = 5, delay = 1000) => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, retries - 1, delay * 2);
      }
      throw error;
    }
  };

  // --- ANALISIS GAMBAR PRODUK ---
  const analyzeProductImage = async (base64Data) => {
    setIsAnalyzing(true);
    setLoadingStep('Menganalisis foto produk dengan AI...');
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{
        role: "user",
        parts: [
          { 
            text: "Identify this product. Provide a concise JSON response with three keys: 'productName' (the brand/generic name of the product), 'description' (a brief aesthetic description of its features), and 'vibes' (aesthetic keywords/vibes, e.g. futuristic, minimalist, luxury). Answer only with the JSON block." 
          },
          { 
            inlineData: { 
              mimeType: "image/png", 
              data: base64Data 
            } 
          }
        ]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            productName: { type: "STRING" },
            description: { type: "STRING" },
            vibes: { type: "STRING" }
          },
          required: ["productName", "description", "vibes"]
        }
      }
    };

    try {
      const data = await fetchWithRetry(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const parsed = JSON.parse(data.candidates[0].content.parts[0].text);
      if (parsed.productName) {
        setProductName(parsed.productName);
        if (!experience) {
          setExperience(`Baru pertama kali nyobain ini karena vibesnya super ${parsed.vibes}. Desainnya yang ${parsed.description} bener-bener bikin penasaran.`);
        }
        showToast('Berhasil mendeteksi detail produk!');
      }
    } catch (error) {
      console.error(error);
      showToast('Gagal menganalisis gambar secara otomatis, silakan isi manual.', 'error');
    } finally {
      setIsAnalyzing(false);
      setLoadingStep('');
    }
  };

  // --- PEMBUATAN UTAS CERITA VIRAL ---
  const handleGenerateStory = async () => {
    if (!productName.trim()) {
      showToast('Masukkan nama produk terlebih dahulu!', 'error');
      return;
    }

    setIsGenerating(true);
    setLoadingStep('Menenun takdir utas viral untuk Anda...');
    setThreadList([]);
    setGeneratedImg('');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    
    const systemPrompt = `
      Anda adalah seorang Social Media Copywriter handal asal Jakarta Selatan yang berspesialisasi dalam membuat utas (thread) viral di X (Twitter) dan Threads.
      Gaya penulisan Anda harus sangat natural, menggunakan istilah gaul/slang X Indonesia terkini (seperti: 'fess', 'plis', 'jujurly', 'wkwk', 'menurut gw', 'pake banget', 'overthinking', 'salut', ' spill', 'plot twist').
      Setiap utas harus memiliki hook pembuka yang luar biasa menarik, memicu rasa penasaran, empati, kemarahan, atau kelucuan ekstrem agar netizen terdorong me-retweet atau berinteraksi.
      Cerita harus menceritakan pengalaman pribadi yang sangat emosional atau kocak tentang pembelian/penggunaan produk ini.
    `;

    const tonePrompts = {
      drama: "Misterius, dramatis, seperti menceritakan 'spill the tea' atau gosip panas yang bikin syok. Gunakan kalimat gantung di akhir tiap tweet agar orang terus scroll.",
      komedi: "Sangat lucu, sarkastik, penuh penderitaan konyol yang menimpa diri sendiri (self-deprecating humor). Bikin pembaca tertawa terpingkal-pingkal.",
      rant: "Penuh emosi meledak-ledak di awal (seperti komplain keras), huruf kapital di kata-kata tertentu, namun di akhir cerita berubah menjadi plot-twist haru atau sangat merekomendasikan produk karena ternyata luar biasa bagus.",
      aesthetic: "Estetik, reflektif, menyentuh hati, romantisasi kehidupan sehari-hari (slice of life), cocok untuk audiens Threads yang lebih santai dan puitis.",
      clickbait: "Menggunakan formula clickbait sensasional, diawali dengan kontroversi besar atau klaim ekstrem tentang produk tersebut yang ternyata kesalahpahaman lucu."
    };

    const userPrompt = `
      Buatkan utas cerita viral tentang produk: "${productName}".
      Konteks tambahan dari user: "${experience || 'Pengalaman random tidak terduga saat pertama kali unboxing'}".
      Nada emosi cerita wajib: ${tonePrompts[tone] || tonePrompts.drama}.
      
      Format output wajib berupa JSON yang memiliki dua properti:
      1. "threads": Array dari string. Setiap string adalah satu bagian tweet dalam utas (maksimum 260 karakter per tweet). Utas harus terdiri dari 3 sampai 6 tweet yang runut dan klimaks.
      2. "imagePrompt": Satu string deskripsi gambar untuk visualisasi adegan puncak/klimaks paling dramatis dari cerita utas tersebut.
         Aturan wajib deskripsi gambar:
         - Harus mendeskripsikan ORANG INDONESIA ASLI (Indonesian person/people, Indonesian facial features, warm olive skin tone).
         - Suasana latar belakang harus khas Indonesia (bisa rumah tipe 36, kos-kosan, warung kopi, atau jalanan Jakarta/kota di Indonesia yang sangat familiar).
         - Gaya visual harus candid, kasual, tidak kaku, dan mengekspresikan emosi yang pas.
         - Jangan mencantumkan teks atau watermark apa pun di dalam gambar prompt.
         - Tuliskan deskripsi prompt ini dalam Bahasa Inggris yang detail dan ekspresif.
    `;

    const payload = {
      contents: [{
        role: "user",
        parts: [{ text: userPrompt }]
      }],
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            threads: {
              type: "ARRAY",
              items: { type: "STRING" }
            },
            imagePrompt: { type: "STRING" }
          },
          required: ["threads", "imagePrompt"]
        }
      }
    };

    try {
      const data = await fetchWithRetry(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const parsed = JSON.parse(data.candidates[0].content.parts[0].text);
      if (parsed.threads && parsed.threads.length > 0) {
        setThreadList(parsed.threads);
        setImagePrompt(parsed.imagePrompt);
        
        // Pindah ke step berikutnya: Pembuatan gambar menggunakan Imagen 4
        await generateVisualImage(parsed.imagePrompt);
      } else {
        throw new Error('Gagal merangkai cerita cerdas.');
      }
    } catch (error) {
      console.error(error);
      showToast('Gagal memproses cerita viral. Coba klik generate lagi!', 'error');
      setIsGenerating(false);
      setLoadingStep('');
    }
  };

  // --- PENJELASAN VISUAL IMAGEN 4.0 DENGAN REFERENSI IPHONE 17 PRO MAX ---
  const generateVisualImage = async (promptText) => {
    setLoadingStep('Melukis foto natural khas iPhone 17 Pro Max...');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;
    
    // Memasukkan spesifikasi teknis kamera, sensor, resolusi 48MP, dan model orang Indonesia asli yang natural
    const cameraSpecs = "shot on iPhone 17 Pro Max 48MP camera, 24mm lens f/1.78, raw unedited social media photo, authentic daylight, natural skin textures, slight depth of field, real candid snap, no filters, high-fidelity";
    const enhancedPrompt = `An authentic natural photo of an Indonesian person, ${promptText}, ${cameraSpecs}`;

    const payload = {
      instances: [
        { prompt: enhancedPrompt }
      ],
      parameters: {
        sampleCount: 1,
        aspectRatio: "1:1"
      }
    };

    try {
      const response = await fetchWithRetry(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.predictions && response.predictions[0]?.bytesBase64Encoded) {
        const generatedBase64 = `data:image/png;base64,${response.predictions[0].bytesBase64Encoded}`;
        setGeneratedImg(generatedBase64);
        showToast('Utas dan Ilustrasi Gambar siap viral!');
      } else {
        throw new Error('Gagal menerima visual dari Imagen.');
      }
    } catch (error) {
      console.error(error);
      showToast('Cerita berhasil dibuat, namun gagal merender gambar visual.', 'warning');
    } finally {
      setIsGenerating(false);
      setLoadingStep('');
    }
  };

  // --- REGENERASI GAMBAR SAJA ---
  const handleRegenerateImage = async () => {
    if (!imagePrompt) {
      showToast('Buat cerita terlebih dahulu untuk mendapat prompt gambar!', 'error');
      return;
    }
    setIsGenerating(true);
    await generateVisualImage(imagePrompt);
  };

  // --- DOWNLOAD GAMBAR YANG DIHASILKAN ---
  const downloadImage = () => {
    if (!generatedImg) return;
    const link = document.createElement('a');
    link.href = generatedImg;
    link.download = `viralstory-iphone17-${productName.toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Gambar berhasil diunduh!');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 p-4 rounded-xl shadow-2xl transition-all duration-300 border ${
          toast.type === 'error' ? 'bg-rose-950/90 border-rose-500/50 text-rose-200' : 
          toast.type === 'warning' ? 'bg-amber-950/90 border-amber-500/50 text-amber-200' :
          'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
        }`}>
          <div className="w-2 h-2 rounded-full animate-ping bg-current" />
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl shadow-lg shadow-indigo-500/20">
              <SparklesIcon />
            </div>
            <div>
              <h1 className="font-extrabold text-xl bg-gradient-to-r from-white via-indigo-200 to-purple-400 bg-clip-text text-transparent">
                ViralStory AI
              </h1>
              <p className="text-xs text-slate-400 font-medium">X & Threads Storytelling Studio</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Empowered by Gemini 2.5 & Imagen 4
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Kolom Kiri: Form Input & Unggahan */}
        <section className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-6 backdrop-blur-sm shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <span className="text-indigo-400">1.</span> Amunisi Produk & Cerita
              </h2>
              {/* Lensa Aktif Badge */}
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-500/20 px-2.5 py-1 rounded-md">
                <CameraIcon />
                iPhone 17 Pro Max 48MP
              </div>
            </div>

            {/* Unggah Foto Produk */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-300">
                Foto Produk (Opsional - AI akan menganalisisnya)
              </label>
              
              {!imagePreview ? (
                <div className="relative group border-2 border-dashed border-slate-700 hover:border-indigo-500/80 rounded-2xl p-6 transition-all bg-slate-950/50 hover:bg-slate-950 flex flex-col items-center justify-center text-center cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="p-3 bg-slate-900 rounded-xl group-hover:scale-110 transition-transform">
                    <ImageIcon />
                  </div>
                  <p className="mt-3 text-sm font-medium text-slate-300">
                    Klik atau drag & drop foto produk
                  </p>
                  <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 4MB</p>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950">
                  <img 
                    src={imagePreview} 
                    alt="Preview produk" 
                    className="w-full h-48 object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                    <button
                      onClick={clearImage}
                      className="ml-auto bg-rose-600/90 hover:bg-rose-500 text-white p-2 rounded-xl transition-all shadow-lg flex items-center gap-1.5 text-xs font-semibold"
                    >
                      <TrashIcon />
                      Hapus
                    </button>
                  </div>
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
                      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
                      <p className="text-xs text-indigo-300 font-semibold animate-pulse">AI Sedang Mengamati Foto...</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Nama Produk */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-300">
                Nama Produk <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Contoh: Kopi Susu Senja Gula Aren, MacBook M3 Max"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-indigo-500/80 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>

            {/* Pilihan Tone / Vibe */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-300">Pilih Vibe Cerita</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'drama', label: 'Spill the Tea ☕️', desc: 'Dramatis & Syok' },
                  { id: 'komedi', label: 'Komedi / Receh 🤣', desc: 'Humor & Penderitaan' },
                  { id: 'rant', label: 'Rant / Ngamuk 😡', desc: 'Plot twist keren' },
                  { id: 'aesthetic', label: 'Aesthetic 🌸', desc: 'Tenang & Menyentuh' },
                  { id: 'clickbait', label: 'Clickbait 👀', desc: 'Sensasional & Konyol' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setTone(item.id)}
                    className={`p-3 rounded-xl border text-left transition-all relative ${
                      tone === item.id
                        ? 'border-indigo-500/80 bg-indigo-500/10 text-white'
                        : 'border-slate-800 bg-slate-950/40 hover:bg-slate-900/60 text-slate-400'
                    }`}
                  >
                    <div className="font-semibold text-xs">{item.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                    {tone === item.id && (
                      <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Konteks Pengalaman Tambahan */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-semibold text-slate-300">
                  Konteks / Detail Pengalaman
                </label>
                <span className="text-[10px] text-slate-500">Makin aneh, makin viral</span>
              </div>
              <textarea
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Contoh: Kurirnya salah kirim rumah tapi malah dapet kenalan baru, pas unboxing dapet hadiah rahasia..."
                rows="4"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-indigo-500/80 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
              />
            </div>

            {/* Tombol Eksekusi */}
            <button
              onClick={handleGenerateStory}
              disabled={isGenerating || isAnalyzing || !productName.trim()}
              className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 font-bold text-sm text-white rounded-2xl shadow-xl hover:shadow-indigo-500/10 disabled:shadow-none hover:-translate-y-0.5 disabled:translate-y-0 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <SparklesIcon />
              {isGenerating ? 'Sedang Meracik Keajaiban...' : 'Buatkan Utas Cerita & Gambar'}
            </button>
          </div>
        </section>

        {/* Kolom Kanan: Hasil Utas X & Threads + Visual Ilustrasi */}
        <section className="lg:col-span-7 space-y-6">
          
          {/* Keadaan Loading */}
          {isGenerating && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 min-h-[500px] flex flex-col items-center justify-center text-center backdrop-blur-sm animate-pulse">
              <div className="relative mb-6">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-2 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full opacity-60 animate-ping" />
              </div>
              <h3 className="text-lg font-bold text-slate-200 mb-2">Mengolah Konten Heboh...</h3>
              <p className="text-sm text-indigo-400 font-medium animate-pulse">{loadingStep}</p>
              <div className="mt-8 max-w-sm space-y-2 text-xs text-slate-500">
                <p>💡 Tip: Utas yang sukses biasanya memiliki hook mengejutkan di 10 kata pertama.</p>
                <p>📸 Visual: Dipotret dengan simulator lensa iPhone 17 Pro Max 48MP agar terlihat seperti foto asli warga lokal.</p>
              </div>
            </div>
          )}

          {/* Keadaan Kosong (Belum ada generasi) */}
          {!isGenerating && threadList.length === 0 && (
            <div className="bg-slate-900/20 border border-slate-800/80 rounded-3xl p-8 min-h-[500px] flex flex-col items-center justify-center text-center backdrop-blur-sm">
              <div className="p-4 bg-slate-900/60 rounded-2xl mb-4 border border-slate-800 text-indigo-400">
                <CameraIcon />
              </div>
              <h3 className="text-lg font-bold text-slate-200">Menanti Skenario Hebat Anda</h3>
              <p className="text-sm text-slate-400 mt-2 max-w-md">
                Isi form di samping kiri dan biarkan AI kami mengonversinya menjadi cerita spektakuler lengkap dengan foto realistik orang Indonesia bersensor kamera 48MP!
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md mt-8">
                <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-900 text-left">
                  <div className="font-semibold text-xs text-indigo-400">🇮🇩 Referensi Wajah Lokal</div>
                  <p className="text-[11px] text-slate-500 mt-1">Render wajah, warna kulit, latar belakang, dan ekspresi natural khas Indonesia.</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-900 text-left">
                  <div className="font-semibold text-xs text-purple-400">📸 Kamera iPhone 17 Pro Max</div>
                  <p className="text-[11px] text-slate-500 mt-1">Visual raw tanpa filter beresolusi tajam 48MP untuk meyakinkan pembaca.</p>
                </div>
              </div>
            </div>
          )}

          {/* Keadaan Hasil Sukses Ter-generate */}
          {!isGenerating && threadList.length > 0 && (
            <div className="space-y-6">
              
              {/* Box Utas Feeds */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                      <span className="text-indigo-400">2.</span> Draf Rangkaian Cerita
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Tiap kotak mewakili satu postingan terpisah</p>
                  </div>
                  <button
                    onClick={() => handleCopyToClipboard(threadList.join('\n\n'))}
                    className="flex items-center gap-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl transition-all border border-slate-700/50"
                  >
                    {copiedAll ? <CheckIcon /> : <CopyIcon />}
                    {copiedAll ? 'Tersalin!' : 'Salin Semua'}
                  </button>
                </div>

                <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                  {threadList.map((tweet, index) => (
                    <div 
                      key={index} 
                      className="group relative bg-slate-950/60 hover:bg-slate-950 border border-slate-800 hover:border-slate-700/80 p-5 rounded-2xl transition-all"
                    >
                      {/* Avatar & Identitas Pengirim Mock */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-slate-200 truncate">Warga Netizen</span>
                            <span className="text-[10px] text-slate-500">@lokalgenius</span>
                            <span className="text-slate-600 text-[10px]">•</span>
                            <span className="text-[10px] text-indigo-400 font-semibold">Tweet {index + 1}</span>
                          </div>
                          
                          <p className="mt-2 text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                            {tweet}
                          </p>
                        </div>
                      </div>

                      {/* Tombol Copy per Tweet */}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleCopyToClipboard(tweet, index)}
                          className="p-2 bg-slate-900 hover:bg-indigo-600 rounded-xl text-slate-400 hover:text-white transition-all shadow-md"
                          title="Salin Tweet Ini"
                        >
                          {copiedIndex === index ? <CheckIcon /> : <CopyIcon />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box Ilustrasi Gambar */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                      <span className="text-indigo-400">3.</span> Visual Pendukung Cerita
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Dihasilkan dengan parameter kamera iPhone 17 Pro Max & Model Indonesia</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRegenerateImage}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-700/50"
                      title="Regenerasi Gambar Baru"
                    >
                      <RefreshIcon />
                    </button>
                    {generatedImg && (
                      <button
                        onClick={downloadImage}
                        className="flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-xl transition-all shadow-lg shadow-indigo-600/10"
                      >
                        Unduh Gambar
                      </button>
                    )}
                  </div>
                </div>

                {generatedImg ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 aspect-square max-w-md mx-auto shadow-2xl">
                    <img 
                      src={generatedImg} 
                      alt="Hasil ilustrasi Imagen" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-4">
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold mb-1">
                        <CameraIcon />
                        Simulated iPhone 17 Pro Max • 48MP Raw Photo
                      </div>
                      <p className="text-xs text-slate-300 font-medium line-clamp-2">
                        💡 <span className="text-slate-400 italic">Prompt Seni:</span> {imagePrompt}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-sm font-semibold text-slate-300">Menyelesaikan Lukisan AI...</p>
                    <p className="text-xs text-slate-500 mt-1">Harap tunggu sesaat selagi Imagen memproses foto realistis Anda.</p>
                  </div>
                )}
              </div>

              {/* Tips Menarik Interaksi */}
              <div className="bg-gradient-to-r from-indigo-950/30 to-purple-950/30 border border-indigo-900/30 rounded-2xl p-5">
                <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                  🚀 Tips Meluncurkan Utas agar FYP:
                </h4>
                <ul className="list-disc list-inside mt-3 text-xs text-slate-400 space-y-1.5">
                  <li><strong>Gunakan Gambar Natural:</strong> Gambar ini telah disesuaikan agar tidak kelihatan seperti stok foto komersial buatan barat, melainkan murni tangkapan kamera netizen lokal Indonesia agar mendapat trust lebih tinggi.</li>
                  <li><strong>Post secara bertahap:</strong> Untuk Threads, Anda bisa memposting utas sekaligus. Di X, pastikan mengikat tweet kedua dan seterusnya sebagai balasan (reply) tweet pertama.</li>
                  <li><strong>Pasang Gambar di Tweet Pertama:</strong> Upload gambar yang diunduh di atas pada postingan pertama guna meningkatkan rasio klik (CTR) hingga 150%.</li>
                </ul>
              </div>

            </div>
          )}

        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-2">
          <p className="text-xs text-slate-500">
            Dibuat secara cerdas untuk mempermudah creator, dropshipper, dan pebisnis meningkatkan awareness produk via social media organic.
          </p>
          <p className="text-[10px] text-slate-600">
            &copy; {new Date().getFullYear()} ViralStory AI. Hak Cipta Dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}
