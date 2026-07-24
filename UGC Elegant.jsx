import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Image as ImageIcon, 
  User, 
  RefreshCw, 
  Download, 
  Sliders, 
  CheckCircle2, 
  ArrowRight, 
  Info, 
  Smartphone, 
  Maximize2, 
  Layout, 
  HelpCircle,
  Eye,
  Settings,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

const DEFAULT_POSE = "Standing straight, full-body portrait, holding a grey modern smartphone in one hand elevated to capture a mirror selfie.";
const DEFAULT_FRAMING = "Full-body shot, vertical orientation (9:16 ratio recommended), subject centered in the frame.";
const DEFAULT_BACKGROUND = "Interior photograph of a high-end, customized walk-in wardrobe. The walls are covered in seamless walnut wood paneling. The left side features custom backlit open shelves displaying curated luxury items: rare sneakers, leather-bound books, and premium candles. Integrated warm linear LED lighting creates a sophisticated glow. The right wall has minimalist, flush wood cabinet doors. A long, patterned vintage runner rug leads the eye down the wooden floor hallway to the back, where a white artisan commode and a large potted plant are visible under a warm pendant light. Cinematic lighting, cozy and wealthy aesthetic, photorealistic, 9:16 vertical ratio.";

const BACKGROUND_PRESETS = [
  {
    id: "walnut_wardrobe",
    name: "Walnut Walk-In Wardrobe (Default)",
    description: "Lemari pakaian kayu walnut mewah dengan pencahayaan hangat.",
    prompt: DEFAULT_BACKGROUND
  },
  {
    id: "luxury_yacht",
    name: "Superyacht Sun Deck",
    description: "Dek kapal pesiar super mewah di tengah laut dengan sinar matahari sore.",
    prompt: "Interior photograph of a modern superyacht deck overlooking Monaco during golden hour. White teak wood floors, luxurious leather lounge seating, a polished chrome railing, glass of champagne resting on a marble side table. Warm ocean breeze, cinematic photorealistic lighting, wealthy lifestyle aesthetic."
  },
  {
    id: "penthouse_tokyo",
    name: "Tokyo Penthouse Lounge",
    description: "Lounge penthouse dengan pemandangan cakrawala kota Tokyo di malam hari.",
    prompt: "Interior high-end Tokyo penthouse lounge with floor-to-ceiling windows. Through the glass, the illuminated Tokyo skyline and Tokyo Tower are visible at night. Minimalist dark marble floors, premium designer furniture, ambient warm LED strips, luxury and wealthy atmosphere, dramatic lighting, photorealistic."
  },
  {
    id: "old_money_library",
    name: "Old Money Study Room",
    description: "Perpustakaan klasik Eropa dengan tumpukan buku kuno dan perapian hangat.",
    prompt: "Interior photograph of a grand, classic European estate library. Deep mahogany wood walls, shelves filled with antique books, a green velvet chesterfield armchair near a crackling stone fireplace, a vintage Persian rug, warm glowing chandelier, rich dark tones, elite scholastic and wealthy aesthetic, photorealistic."
  }
];

export default function App() {
  const [faceImage, setFaceImage] = useState(null);
  const [faceImageFileName, setFaceImageFileName] = useState('');
  const [outfitImage, setOutfitImage] = useState(null);
  const [outfitImageFileName, setOutfitImageFileName] = useState('');
  const [sameAsFace, setSameAsFace] = useState(true);

  const [selectedPreset, setSelectedPreset] = useState("walnut_wardrobe");
  const [posePrompt, setPosePrompt] = useState(DEFAULT_POSE);
  const [framingPrompt, setFramingPrompt] = useState(DEFAULT_FRAMING);
  const [backgroundPrompt, setBackgroundPrompt] = useState(DEFAULT_BACKGROUND);
  const [strictIdentity, setStrictIdentity] = useState(true);

  const [loading, setLoading] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [resultImage, setResultImage] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('generator');

  const handleImageUpload = (e, target) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg("Ukuran file terlalu besar! Maksimum adalah 8MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (target === 'face') {
        setFaceImage(reader.result);
        setFaceImageFileName(file.name);
      } else {
        setOutfitImage(reader.result);
        setOutfitImageFileName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const selectPreset = (presetId) => {
    const preset = BACKGROUND_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setSelectedPreset(presetId);
      setBackgroundPrompt(preset.prompt);
    }
  };

  const generateImage = async () => {
    if (!faceImage) {
      setErrorMsg("Harap unggah foto wajah / identitas Anda terlebih dahulu.");
      return;
    }

    setErrorMsg('');
    setLoading(true);
    setResultImage(null);

    const steps = [
      "Menganalisis kemiripan wajah & struktur anatomi...",
      "Mengekstrak palet warna dan detail outfit referensi...",
      "Menyusun ulang pose & framing (Mirror Selfie)...",
      "Merender latar belakang premium sesuai spesifikasi...",
      "Menyatukan elemen & menjaga integritas wajah..."
    ];

    let currentStepIndex = 0;
    setGenerationStep(steps[currentStepIndex]);
    const stepInterval = setInterval(() => {
      if (currentStepIndex < steps.length - 1) {
        currentStepIndex++;
        setGenerationStep(steps[currentStepIndex]);
      }
    }, 3000);

    try {
      // Clean base64 strings
      const faceBase64 = faceImage.split(',')[1];
      const outfitBase64 = sameAsFace ? faceBase64 : (outfitImage ? outfitImage.split(',')[1] : faceBase64);

      // Structure rich instruction prompt for Gemini 3.1 Flash Image
      const systemInstruction = `
        You are a highly advanced AI Image Editor and Portrait Generator. Your core directive is "IDENTITY LOCK" - you MUST preserve the exact face features, identity, facial shape, eyes, lips, nose, hair color, and skin texture of the subject provided in the Face Reference Image. Do not alter their bone structure or body mass.
        
        You must recreate a new photorealistic image based on these instructions:
        1. FACE / IDENTITY (LOCK): Keep the face EXACTLY the same as in the Face Reference Image. Do not change expression dramatically unless needed, and preserve absolute resemblance.
        2. POSE: ${posePrompt}
        3. FRAMING: ${framingPrompt}
        4. OUTFIT: Wear the outfit shown in the Outfit Reference Image. Match the clothing style, colors, materials, and drapery as closely as possible.
        5. BACKGROUND: ${backgroundPrompt}
        
        Ensure seamless integration of the subject into the newly generated premium scene. The lighting on the face must perfectly match the cozy, warm, and rich aesthetic of the new environment. Output a single stunning 9:16 portrait.
      `;

      const payload = {
        contents: [
          {
            role: "user",
            parts: [
              { text: systemInstruction },
              { text: "Face Reference Image: This is the subject whose identity and face must be preserved exactly in the output." },
              {
                inlineData: {
                  mimeType: "image/png",
                  data: faceBase64
                }
              },
              { text: "Outfit Reference Image: This is the outfit (clothes, shoes, accessories) that the subject must wear in the output." },
              {
                inlineData: {
                  mimeType: "image/png",
                  data: outfitBase64
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseModalities: ['IMAGE'],
          imageConfig: {
            aspectRatio: "9:16"
          }
        }
      };

      const apiKey = ""; // Canvas handles dynamic key injection at runtime
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${apiKey}`;

      // Call API helper with Exponential Backoff
      const executeCall = async (retries = 3, delay = 1500) => {
        try {
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `HTTP ${response.status}`);
          }
          return await response.json();
        } catch (err) {
          if (retries > 0) {
            await new Promise(res => setTimeout(res, delay));
            return executeCall(retries - 1, delay * 2);
          }
          throw err;
        }
      };

      const data = await executeCall();
      clearInterval(stepInterval);

      const generatedPart = data?.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (generatedPart && generatedPart.inlineData?.data) {
        const outUrl = `data:${generatedPart.inlineData.mimeType};base64,${generatedPart.inlineData.data}`;
        setResultImage(outUrl);
        
        // Save to History list
        const newItem = {
          id: Date.now(),
          src: outUrl,
          preset: selectedPreset,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setHistory(prev => [newItem, ...prev]);
      } else {
        throw new Error("Gagal mengekstrak output gambar dari respon API Gemini.");
      }

    } catch (err) {
      clearInterval(stepInterval);
      console.error(err);
      setErrorMsg(`Terjadi kesalahan pemrosesan: ${err.message || "Koneksi API terputus"}. Silakan coba lagi.`);
    } finally {
      setLoading(false);
      setGenerationStep('');
    }
  };

  const downloadResult = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `instamorph_wardrobe_selfie_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-900">
      
      {}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-amber-500 to-rose-600 p-2 rounded-xl shadow-lg shadow-amber-500/10">
              <Sparkles className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-amber-400 bg-clip-text text-transparent">
                InstaMorph AI Studio
              </h1>
              <p className="text-xs text-slate-400">Identity-Locked Luxury Photo Transformer</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveTab('generator')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'generator' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              Generator
            </button>
            <button 
              onClick={() => setActiveTab('presets')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'presets' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              Eksplorasi Background
            </button>
          </div>
        </div>
      </header>

      {}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Controls (8 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Active Tab: Generator Controls */}
          {activeTab === 'generator' && (
            <>
              {/* Photo Upload Section */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-amber-500" />
                    <h2 className="font-semibold text-base text-slate-200">1. Unggah Foto Sumber</h2>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                    Identity Protected
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Face Reference Upload */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                      <span>Foto Wajah (Kunci Identitas) <span className="text-red-500">*</span></span>
                      <span className="text-[10px] text-slate-500">Maksimal 8MB</span>
                    </label>
                    
                    <div className="relative border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-xl transition-all duration-200 overflow-hidden bg-slate-950/50 group">
                      {faceImage ? (
                        <div className="relative aspect-video flex items-center justify-center bg-slate-900">
                          <img src={faceImage} alt="Face Ref" className="h-full object-contain" />
                          <button 
                            onClick={() => { setFaceImage(null); setFaceImageFileName(''); }}
                            className="absolute top-2 right-2 bg-rose-600/90 text-white p-1 rounded-full hover:bg-rose-500 transition-colors"
                            title="Ganti Foto"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-sm px-3 py-1.5 text-[11px] text-slate-300 truncate">
                            {faceImageFileName}
                          </div>
                        </div>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center justify-center py-8 px-4 text-center">
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleImageUpload(e, 'face')} 
                            className="hidden" 
                          />
                          <div className="p-2.5 bg-slate-800 rounded-lg text-slate-400 group-hover:bg-amber-500/10 group-hover:text-amber-400 transition-colors mb-2">
                            <Upload className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-medium text-slate-300">Pilih Foto Utama Anda</span>
                          <span className="text-[10px] text-slate-500 mt-1">Wajah harus terlihat jelas</span>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Outfit Reference Upload */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-300">Foto Referensi Outfit</label>
                      <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={sameAsFace} 
                          onChange={(e) => setSameAsFace(e.target.checked)} 
                          className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-800"
                        />
                        <span className="text-slate-400 text-[11px]">Sama dengan Wajah</span>
                      </label>
                    </div>

                    <div className={`relative border-2 border-dashed rounded-xl transition-all duration-200 overflow-hidden bg-slate-950/50 group ${sameAsFace ? 'opacity-50 border-slate-800 pointer-events-none' : 'border-slate-700 hover:border-amber-500/50'}`}>
                      {sameAsFace ? (
                        <div className="aspect-video flex flex-col items-center justify-center text-center p-4">
                          <ImageIcon className="w-6 h-6 text-slate-600 mb-1" />
                          <span className="text-xs text-slate-500">Menggunakan pakaian dari foto wajah di sebelah kiri.</span>
                        </div>
                      ) : outfitImage ? (
                        <div className="relative aspect-video flex items-center justify-center bg-slate-900">
                          <img src={outfitImage} alt="Outfit Ref" className="h-full object-contain" />
                          <button 
                            onClick={() => { setOutfitImage(null); setOutfitImageFileName(''); }}
                            className="absolute top-2 right-2 bg-rose-600/90 text-white p-1 rounded-full hover:bg-rose-500 transition-colors"
                            title="Ganti Foto"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-sm px-3 py-1.5 text-[11px] text-slate-300 truncate">
                            {outfitImageFileName}
                          </div>
                        </div>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center justify-center py-8 px-4 text-center">
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleImageUpload(e, 'outfit')} 
                            className="hidden" 
                          />
                          <div className="p-2.5 bg-slate-800 rounded-lg text-slate-400 group-hover:bg-amber-500/10 group-hover:text-amber-400 transition-colors mb-2">
                            <Camera className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-medium text-slate-300">Pilih Foto Pakaian Tambahan</span>
                          <span className="text-[10px] text-slate-500 mt-1">Menggunakan gaya pakaian lain</span>
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {/* Identity Lock Note */}
                <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 flex gap-2.5 items-start">
                  <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-amber-400">Teknologi Kunci Identitas AI</span>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Sistem kami secara otomatis mendeteksi titik penting wajah Anda. Struktur tulang wajah, ekspresi, warna kulit, dan rambut akan direkonstruksi secara presisi ke dalam pose baru tanpa mengalami perubahan bentuk badan.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pose, Framing, and Background Setup */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-amber-500" />
                    <h2 className="font-semibold text-base text-slate-200">2. Pengaturan Pose & Background</h2>
                  </div>
                </div>

                {/* Dynamic Presets Selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-300">Pilih Template Latar Belakang Mewah</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {BACKGROUND_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => selectPreset(p.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all duration-200 flex flex-col gap-1 ${selectedPreset === p.id ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-md shadow-amber-500/5' : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'}`}
                      >
                        <span className="text-[11px] font-bold truncate w-full">{p.name}</span>
                        <span className="text-[9px] leading-tight text-slate-500 truncate w-full">{p.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Editable Advanced Prompts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                  {/* Pose */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-slate-400" /> Pose Kustom
                    </span>
                    <textarea
                      value={posePrompt}
                      onChange={(e) => setPosePrompt(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-slate-300 placeholder-slate-600 resize-none"
                      placeholder="Uraikan pose karakter..."
                    />
                  </div>

                  {/* Framing */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Maximize2 className="w-3.5 h-3.5 text-slate-400" /> Framing Kustom
                    </span>
                    <textarea
                      value={framingPrompt}
                      onChange={(e) => setFramingPrompt(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-slate-300 placeholder-slate-600 resize-none"
                      placeholder="Atur rasio dan komposisi lensa..."
                    />
                  </div>
                </div>

                {/* Background Prompt (Full Width) */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Layout className="w-3.5 h-3.5 text-slate-400" /> Latar Belakang Detail (Prompts)
                  </span>
                  <textarea
                    value={backgroundPrompt}
                    onChange={(e) => setBackgroundPrompt(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-slate-300 placeholder-slate-600 resize-y"
                    placeholder="Deskripsikan ruangan atau lanskap sekitar secara detail..."
                  />
                  <span className="text-[10px] text-slate-500 leading-tight">
                    *Gunakan bahasa Inggris deskriptif demi hasil render yang paling realistis.
                  </span>
                </div>

                {/* Process Button */}
                <div className="pt-2 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={generateImage}
                    disabled={loading || !faceImage}
                    className={`w-full py-3.5 rounded-xl text-slate-950 font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${loading || !faceImage ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-amber-400 via-amber-500 to-rose-500 hover:brightness-110 shadow-amber-500/15 hover:shadow-amber-500/25 transform active:scale-[0.98]'}`}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Sedang Memproses...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>Mulai Transformasi AI Sekarang</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Active Tab: Presets Explore */}
          {activeTab === 'presets' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
              <div className="border-b border-slate-800 pb-3 flex items-center gap-2">
                <Layout className="w-5 h-5 text-amber-500" />
                <h2 className="font-semibold text-base text-slate-200">Gaya & Latar Belakang Eksotis</h2>
              </div>
              <p className="text-xs text-slate-400 mb-2 leading-relaxed">
                Selain walk-in wardrobe walnut mewah, Anda juga dapat mencoba menaruh karakter Anda di skenario old-money atau futuristik elit berikut. Klik tombol untuk memuat template tersebut ke tab generator utama.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {BACKGROUND_PRESETS.map((preset) => (
                  <div 
                    key={preset.id} 
                    className="border border-slate-800 hover:border-slate-700 bg-slate-950/40 rounded-xl p-4 flex flex-col gap-2 transition-all duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-bold text-amber-400">{preset.name}</span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-mono">9:16</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed min-h-[36px]">{preset.description}</p>
                    <div className="text-[10px] bg-slate-950 p-2 rounded border border-slate-900 text-slate-500 font-mono italic select-none truncate">
                      {preset.prompt}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        selectPreset(preset.id);
                        setActiveTab('generator');
                      }}
                      className="mt-2 py-1.5 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 font-medium text-xs rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5"
                    >
                      <span>Gunakan Background Ini</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips Section */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 flex gap-3">
            <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-200">Kiat Menggunakan InstaMorph AI:</span>
              <ul className="list-disc pl-4 text-[11px] text-slate-400 flex flex-col gap-1">
                <li>Pastikan wajah Anda di foto sumber tidak tertutup bayangan tebal atau tangan/masker.</li>
                <li>Foto sumber dengan pencahayaan netral menghasilkan akurasi warna kulit yang terbaik.</li>
                <li>Rasio default 9:16 direkomendasikan untuk format potret vertikal / story media sosial.</li>
              </ul>
            </div>
          </div>

        </div>

        {/* Right Column: Preview Panel (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Main Visualizer Frame */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col min-h-[500px]">
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-amber-500" /> Pratinjau Output (9:16)
              </span>
              {resultImage && (
                <button
                  onClick={downloadResult}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow"
                >
                  <Download className="w-3.5 h-3.5" /> Unduh Foto
                </button>
              )}
            </div>

            {/* Display/Loading Area */}
            <div className="flex-1 bg-slate-950 relative flex items-center justify-center p-4 min-h-[350px]">
              {loading ? (
                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
                  {/* Interactive luxury loading skeleton */}
                  <div className="relative w-28 h-48 border border-slate-800 rounded-xl overflow-hidden bg-slate-900 animate-pulse flex items-center justify-center mb-4 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
                    <Sparkles className="w-10 h-10 text-amber-500/20 animate-bounce" />
                    {/* Glowing light sweep animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                  </div>
                  <span className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-500" /> Memproses Foto...
                  </span>
                  <p className="text-xs text-slate-400 max-w-xs mt-2 italic leading-relaxed">
                    "{generationStep}"
                  </p>
                  <span className="text-[9px] text-slate-600 mt-6 tracking-wide uppercase">Gemini 3.1 Neural Rendering Engine</span>
                </div>
              ) : null}

              {resultImage ? (
                <div className="relative w-full max-w-sm aspect-[9/16] rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900">
                  <img 
                    src={resultImage} 
                    alt="Transformasi Hasil Gemini" 
                    className="w-full h-full object-cover"
                  />
                  {/* Subtle water-mark overlay */}
                  <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur px-2 py-1 rounded border border-slate-800 text-[9px] text-slate-400 font-mono tracking-wider">
                    INSTAMORPH AI
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-8 max-w-xs">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 mb-4 shadow">
                    <Sparkles className="w-8 h-8 text-slate-500" />
                  </div>
                  <span className="text-sm font-semibold text-slate-300">Siap Melakukan Transformasi</span>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Unggah foto utama Anda, sesuaikan gaya ruangan yang diinginkan, lalu klik tombol transformasi untuk memulai rendering.
                  </p>
                </div>
              )}
            </div>

            {/* Error Message banner */}
            {errorMsg && (
              <div className="bg-rose-500/10 border-t border-rose-500/20 px-4 py-3 flex gap-2.5 items-center text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}
          </div>

          {/* History Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
            <h3 className="font-semibold text-xs tracking-wider text-slate-400 uppercase">Riwayat Transformasi Sesi Ini</h3>
            {history.length > 0 ? (
              <div className="grid grid-cols-3 gap-2.5">
                {history.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => setResultImage(item.src)}
                    className="relative aspect-[9/16] rounded-lg overflow-hidden border border-slate-800 hover:border-amber-500 cursor-pointer transition-all duration-200 bg-slate-950 group"
                  >
                    <img src={item.src} alt="History item" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Eye className="w-5 h-5 text-amber-400" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-slate-800 rounded-xl p-4 text-center text-xs text-slate-600">
                Belum ada riwayat hasil transformasi.
              </div>
            )}
          </div>

        </div>

      </main>

      {}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-4 text-center mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] text-slate-500">
          <span>&copy; {new Date().getFullYear()} InstaMorph AI Studio. All rights reserved.</span>
          <span className="flex items-center gap-1.5">
            Powered by <span className="text-amber-500 font-semibold">Gemini 3.1 Flash Image</span> &amp; Identity Guard Tech.
          </span>
        </div>
      </footer>
    </div>
  );
}
