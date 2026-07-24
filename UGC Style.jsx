import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, Copy, Check, Image as ImageIcon, Sparkles, Loader2, 
  Video, Mic, RefreshCw, Key, AlertCircle, Play, Sliders, CheckCircle2,
  XCircle, Settings, ChevronRight, HelpCircle, ShieldCheck
} from 'lucide-react';

const CATEGORIES = [
  "Baju / Dress",
  "Celana / Rok",
  "Sepatu",
  "Tas",
  "Make Up / Parfume",
  "Aksesoris Tangan / Dipakai",
  "Lainnya"
];

const VISUAL_STYLES = [
  "Luxury Editorial",
  "Streetwear Chic",
  "Minimalist Premium",
  "Elegant Feminine",
  "Dark Luxury Premium",
  "High Fashion Runway"
];

const CAMERA_MOVEMENTS = [
  "Slow Dolly In",
  "Tracking Shot",
  "Orbit Shot",
  "Handheld Commercial",
  "Close Up Macro"
];

const VO_FORMULAS = {
  "Hook-Problem-Solution": {
    label: "HOOK → MASALAH → SOLUSI → CTA",
    hook: "Kenapa baru sekarang aku nemu ini?",
    problem: "Aku tuh sering bingung cari yang nyaman tapi tetep bagus dipakai.",
    solution: "Ternyata [PRODUCT] ini jawabannya.",
    cta: "Linknya ada di keranjang kuning ya."
  },
  "Viral-TikTok": {
    label: "Viral TikTok (HOOK → REAKSI → BENEFIT → CTA)",
    hook: "AKU KAGET SIH!",
    problem: "Barang murah ini ternyata bagus banget.",
    solution: "Bahannya se-premium ini dan fit-nya cakep pas dipakai.",
    cta: "Checkout sebelum sold out."
  },
  "POV": {
    label: "POV Formula (Relatable)",
    hook: "POV: akhirnya nemu [PRODUCT] online yang nggak zonk.",
    problem: "Dipakai langsung keliatan mahal dan mewah banget.",
    solution: "Kualitas jahitannya bener-bener rapi luar biasa.",
    cta: "Linknya ada di bawah ya."
  },
  "Before-After": {
    label: "BEFORE → AFTER (Fashion/Beauty)",
    hook: "Sebelum pakai ini outfit aku biasa aja.",
    problem: "Setelah pakai [PRODUCT] ini langsung keliatan lebih clean.",
    solution: "Auto glow up instant dalam sekali pakai.",
    cta: "Fix wajib checkout sekarang."
  },
  "FOMO": {
    label: "FOMO Formula (Takut Kehabisan)",
    hook: "Jangan sampai kehabisan produk viral ini.",
    problem: "Karena sekarang lagi rame dan dicari di mana-mana.",
    solution: "Dan ternyata pas dicoba emang sebagus itu.",
    cta: "Buruan checkout sekarang sebelum kehabisan."
  },
  "Review-Jujur": {
    label: "REVIEW JUJUR (Trusted Content)",
    hook: "Jujur awalnya aku nggak expect banyak.",
    problem: "Tapi pas barangnya dateng, ternyata se-premium itu.",
    solution: "[PRODUCT] ini nyaman dan kepake banget tiap hari.",
    cta: "Sangat worth it, buruan cek sekarang."
  },
  "Soft-Selling": {
    label: "SOFT SELLING (Kasual / Gak Maksa)",
    hook: "Aku akhir-akhir ini lagi sering pakai ini.",
    problem: "Soalnya nyaman banget dan gampang dipaduin sama apa aja.",
    solution: "[PRODUCT] ini penolong instan buat penampilan rapi.",
    cta: "Kalau kalian penasaran, bisa langsung cek linknya."
  },
  "Hard-Selling": {
    label: "HARD SELLING (Diskon / Promo)",
    hook: "INI LAGI DISKON BESAR!",
    problem: "Harga segini dapet kualitas premium kayak gini tuh jarang.",
    solution: "Bahan tebal mewah, jahitan kokoh khas butik mahal.",
    cta: "Buruan checkout sebelum harganya naik lagi!"
  }
};

const DEFAULT_ACTIONS = {
  "Baju / Dress": "0-3s: Model walks in with a graceful turn showing the dress flow.\n3-7s: Close-up on the premium fabric texture and neat stitching.\n7-10s: Model poses elegantly, smiling at the camera, showing a clear CTA.",
  "Celana / Rok": "0-3s: Low angle tracking shot of the model walking confidently.\n3-7s: Focus on the comfortable waistline fit and pocket details.\n7-10s: Model turns around gracefully, presenting a perfect silhouette.",
  "Sepatu": "0-3s: Close-up on the shoes taking steady, stylish steps on a clean surface.\n3-7s: Slow pan showing the leather reflections and brand detailing.\n7-10s: Model pauses, tilting the foot to show the elegant profile.",
  "Tas": "0-3s: Model holds the bag elegantly, walking toward the camera.\n3-7s: Extreme close-up on the metal buckle, zipper, and leather grain.\n7-10s: Model slings the bag over their shoulder with a confident look.",
  "Make Up / Parfume": "0-3s: Elegant close-up on the product aesthetic with soft studio lighting.\n3-7s: Model applying/spraying the product with a luxurious and fresh expression.\n7-10s: Sharp display of the product next to the model's glowing face.",
  "Aksesoris Tangan / Dipakai": "0-3s: Close-up of the model's hand adjusting the accessory elegantly.\n3-7s: Light catching the reflective surfaces and detailed craftsmanship.\n7-10s: Model showcases the accessory with a natural, sophisticated hand gesture.",
  "Lainnya": "0-3s: Smooth cinematic dolly zoom-in on the product showcase.\n3-7s: Detailed product pan displaying premium texture and luxury design.\n7-10s: Aesthetic layout showcasing product in a commercial ad setup."
};

const GEMINI_MODELS = [
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash (Sangat Direkomendasikan / Cepat)" },
  { id: "gemini-1.5-flash", label: "Gemini 1.5 Flash (Stabil & Kompatibel)" },
  { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro (Lebih Detail / Lambat)" }
];

export default function FashionPromptGenerator() {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageMetadata, setImageMetadata] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [productName, setProductName] = useState("");
  const [visualStyle, setVisualStyle] = useState(VISUAL_STYLES[0]);
  const [cameraMovement, setCameraMovement] = useState(CAMERA_MOVEMENTS[0]);
  const [voFormula, setVoFormula] = useState(Object.keys(VO_FORMULAS)[0]);
  const [selectedModel, setSelectedModel] = useState(GEMINI_MODELS[0].id);
  
  const [specificAction, setSpecificAction] = useState("");
  const [voiceOver, setVoiceOver] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  
  const [safePromptOverride, setSafePromptOverride] = useState(null);
  const [isSanitizing, setIsSanitizing] = useState(false);

  const [apiKey, setApiKey] = useState(() => {
    try {
      return localStorage.getItem("gemini_api_key") || "";
    } catch (e) {
      return "";
    }
  });
  const [saveKey, setSaveKey] = useState(true);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const placeholder = productName || "[Nama Produk Anda]";
    const actionTemplate = DEFAULT_ACTIONS[category] || DEFAULT_ACTIONS["Lainnya"];
    setSpecificAction(actionTemplate);

    const voTemplate = VO_FORMULAS[voFormula];
    const generatedVO = `${voTemplate.hook} ${voTemplate.problem} ${voTemplate.solution} ${voTemplate.cta}`
      .replace(/\[PRODUCT\]/g, placeholder);
    
    setVoiceOver(generatedVO);
  }, [category, voFormula, productName]);

  useEffect(() => {
    // Reset the safe prompt override if any input parameter changes
    setSafePromptOverride(null);
  }, [category, productName, visualStyle, cameraMovement, voFormula, specificAction, voiceOver]);

  const handleSaveApiKey = (val) => {
    setApiKey(val);
    if (saveKey) {
      try {
        localStorage.setItem("gemini_api_key", val);
      } catch (e) {}
    } else {
      try {
        localStorage.removeItem("gemini_api_key");
      } catch (e) {}
    }
  };

  const analyzeImageWithAI = async () => {
    setApiError(null);
    if (!imageMetadata) {
      setApiError("Silakan pilih dan upload foto produk Anda terlebih dahulu.");
      return;
    }
    if (!productName) {
      setApiError("Silakan isi Nama / Brand Produk Anda terlebih dahulu.");
      return;
    }
    if (!apiKey) {
      setApiError("Silakan masukkan Gemini API Key Anda pada pengaturan di panel kiri.");
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;
      
      const promptText = `
        Analisis gambar fashion ini untuk video TikTok / Reels komersial berdurasi 10 detik.
        
        Kategori Produk: ${category}
        Nama Produk: ${productName}
        Gaya Visual yang Dinginkan: ${visualStyle}
        Gaya Pergerakan Kamera: ${cameraMovement}
        Formula Voice Over yang harus diikuti: ${VO_FORMULAS[voFormula].label}

        [VIDEO DURATION]
        Must be strictly structured for a 10-second video.

        [VOICE OVER RULE]
        - Maximum 30 spoken words total in Indonesian.
        - Must fully finish before 10 seconds.
        - Use short, punchy sentences with fast natural pacing.
        - No long pauses.
        - Follow this selected formula structure:
          HOOK (0-3s) -> MASALAH/BENEFIT (3-7s) -> SOLUSI & CTA (7-10s)

        [SCENE PACING]
        - 0-3s: Hook visual (capturing attention, showing model interacting with ${category}).
        - 3-7s: Product showcase (extreme close-up on details/textures/movement).
        - 7-10s: CTA shot (call to action, model displaying product with confidence).

        [AUDIO PRIORITY]
        Prioritize complete voice delivery over cinematic pauses.

        Berikan jawaban dalam format JSON murni tanpa markdown lain:
        {
          "specificAction": "Deskripsi adegan model dan kamera dalam bahasa Inggris (0-3s, 3-7s, 7-10s) menggunakan gaya visual ${visualStyle} dan kamera ${cameraMovement}.",
          "voiceOver": "Naskah Voice Over Bahasa Indonesia yang kreatif, 25-30 kata saja, dijamin selesai dibaca dalam 10 detik."
        }
      `;

      const payload = {
        contents: [{ 
          role: "user", 
          parts: [
            { text: promptText }, 
            { inlineData: { mimeType: imageMetadata.type, data: imageMetadata.data } }
          ] 
        }],
        generationConfig: { responseMimeType: "application/json" }
      };

      const response = await fetch(apiUrl, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      });
      
      if (!response.ok) {
        let serverErrorMsg = `HTTP Error ${response.status}`;
        try {
          const errData = await response.json();
          if (errData?.error?.message) {
            serverErrorMsg = errData.error.message;
          }
        } catch (e) {
          // Response was not JSON
        }
        throw new Error(serverErrorMsg);
      }

      const result = await response.json();
      if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
        const parsedData = JSON.parse(result.candidates[0].content.parts[0].text);
        setSpecificAction(parsedData.specificAction || DEFAULT_ACTIONS[category]);
        setVoiceOver(parsedData.voiceOver || "");
      } else {
        throw new Error("Format respon dari AI tidak lengkap. Silakan coba kembali.");
      }
    } catch (error) {
      console.error("AI Analysis Failed:", error);
      setApiError(error.message || "Terjadi kesalahan tidak dikenal saat menghubungi server AI.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setApiError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setImageMetadata({ data: reader.result.split(',')[1], type: file.type });
    };
    reader.readAsDataURL(file);
  };

  const baseGeneratedPrompt = !productName 
    ? "⚠️ MENUNGGU INPUT NAMA PRODUK...\n\nSilakan ketik nama/brand produk Anda di kolom input hijau terlebih dahulu untuk mengaktifkan generator otomatis."
    : `Create a luxury cinematic AI fashion commercial in ultra realistic style.

[CATEGORY]
${category}

[MAIN SUBJECT]
${productName.trim()}

[VISUAL STYLE]
${visualStyle}, ultra photorealistic, hyper detailed skin texture, premium fashion photography aesthetic, luxury commercial look, 4K resolution, HDR, studio quality, highly cinematic.

[CAMERA MOVEMENT]
${cameraMovement}, handheld luxury commercial feeling, smooth tracking shot, dramatic angles, fashion advertisement style.

[SCENE PACING & ACTION (10s)]
${specificAction}

[VOICE OVER (Indonesian - FAST PACED - MAX 30 WORDS)]
"${voiceOver}"

[VIDEO FORMAT]
Vertical 9:16 aspect ratio for TikTok, Instagram Reels, Shorts.

[NEGATIVE PROMPT]
Low quality, blurry, bad anatomy, distorted hands, extra fingers, deformed face, low resolution, watermark, text overlay, cartoon, CGI look, oversaturated colors.`;

  const displayPrompt = safePromptOverride || baseGeneratedPrompt;

  const rewritePromptForSafety = async () => {
    if (!apiKey) {
      setApiError("Silakan masukkan Gemini API Key Anda pada pengaturan di panel kiri untuk menggunakan fitur Risk Analyzer.");
      return;
    }
    if (!productName) return;

    setIsSanitizing(true);
    setApiError(null);

    try {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;

      const promptText = `Rewrite the following user's video prompt into a safe, policy-compliant cinematic prompt.

Rules:
- Remove explicit sexual content
- Remove public figures
- Avoid graphic violence
- Preserve artistic intent
- Keep cinematic quality high
- Prefer stylized language
- Output only the rewritten prompt without any markdown blocks or extra explanations.

User Prompt:
${baseGeneratedPrompt}`;

      const payload = {
        contents: [{ role: "user", parts: [{ text: promptText }] }],
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let serverErrorMsg = `HTTP Error ${response.status}`;
        try {
          const errData = await response.json();
          if (errData?.error?.message) {
            serverErrorMsg = errData.error.message;
          }
        } catch (e) {}
        throw new Error(serverErrorMsg);
      }

      const result = await response.json();
      const rewrittenText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rewrittenText) {
        setSafePromptOverride(rewrittenText.trim());
      } else {
        throw new Error("Gagal memformat ulang prompt.");
      }
    } catch (error) {
      console.error("Safety Rewrite Failed:", error);
      setApiError(error.message || "Terjadi kesalahan saat memproses Risk Analyzer.");
    } finally {
      setIsSanitizing(false);
    }
  };

  const handleCopy = () => {
    const textArea = document.createElement("textarea");
    textArea.value = displayPrompt;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
        console.error('Salin gagal', err);
    }
    document.body.removeChild(textArea);
  };

  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto grid gap-8">
        
        {/* Header */}
        <header className="text-center space-y-3 py-4">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 rounded-full text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Marketing & Ads Video Prompt
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent flex items-center justify-center gap-3">
            Fashion Image → Video Prompt Gen
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto text-sm md:text-base">
            Ubah foto produk Anda menjadi prompt video AI siap-pakai untuk Runway, Pika, Kling, atau Sora dengan formula Voice Over konversi tinggi.
          </p>
        </header>

        {/* API Notification/Error Banner (Visual Alert instead of browser alert popup) */}
        {apiError && (
          <div className="bg-rose-950/40 border border-rose-500/40 p-4 rounded-2xl flex items-start gap-3 text-rose-200 text-sm animate-fadeIn">
            <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-rose-300 mb-0.5">Terjadi Masalah Analisis</h4>
              <p className="text-rose-400/90 leading-relaxed text-xs">{apiError}</p>
              <div className="mt-2 text-[11px] text-zinc-400">
                Penyebab umum: API Key salah, batas kuota terlampaui, atau model yang dipilih tidak terhubung ke API Key Anda. Silakan ganti model atau kunci Anda.
              </div>
            </div>
            <button 
              onClick={() => setApiError(null)}
              className="text-rose-400 hover:text-rose-300 text-xs font-bold px-2 py-1 rounded bg-rose-900/30 border border-rose-500/20"
            >
              Tutup
            </button>
          </div>
        )}
        
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Panel Kiri: Input Kontrol */}
          <div className="lg:col-span-5 bg-zinc-900/40 p-6 rounded-3xl border border-zinc-800/80 space-y-6 backdrop-blur-md">
            
            {/* Area Upload Gambar */}
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                1. Upload Foto Produk (Referensi Visual)
              </label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed ${imagePreview ? 'border-indigo-500/50 bg-indigo-950/5' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/20'} rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 group`}
              >
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                {imagePreview ? (
                  <div className="relative group/img max-h-48 mx-auto overflow-hidden rounded-lg">
                    <img src={imagePreview} className="max-h-48 mx-auto object-cover rounded-lg" alt="Preview Produk" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                      <p className="text-white text-xs font-medium flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" /> Ganti Gambar
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <div className="p-3 bg-zinc-900 rounded-full w-fit mx-auto group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-6 h-6 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <p className="text-zinc-400 text-sm font-medium">Klik untuk upload foto fashion Anda</p>
                    <p className="text-[10px] text-zinc-600">Mendukung JPG, PNG, WEBP</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Input Kontrol */}
            <div className="space-y-4">
              
              <div>
                <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  2. Nama / Brand Produk <span className="text-[10px] text-emerald-500/80 font-normal">(Wajib Diisi)</span>
                </label>
                <input 
                  type="text" 
                  value={productName} 
                  onChange={(e) => setProductName(e.target.value)} 
                  className="w-full bg-zinc-950 p-3 mt-1.5 rounded-xl border border-emerald-500/30 focus:border-emerald-400 outline-none text-sm transition-all text-emerald-300 placeholder:text-zinc-700" 
                  placeholder="Contoh: Dress Velvet Merah Maroon" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Kategori</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)} 
                    className="w-full bg-zinc-950 p-3 mt-1.5 rounded-xl border border-zinc-800 text-sm text-zinc-300 focus:border-indigo-500 outline-none"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Style Visual</label>
                  <select 
                    value={visualStyle} 
                    onChange={(e) => setVisualStyle(e.target.value)} 
                    className="w-full bg-zinc-950 p-3 mt-1.5 rounded-xl border border-zinc-800 text-sm text-zinc-300 focus:border-indigo-500 outline-none"
                  >
                    {VISUAL_STYLES.map(style => <option key={style} value={style}>{style}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Kamera</label>
                  <select 
                    value={cameraMovement} 
                    onChange={(e) => setCameraMovement(e.target.value)} 
                    className="w-full bg-zinc-950 p-3 mt-1.5 rounded-xl border border-zinc-800 text-sm text-zinc-300 focus:border-indigo-500 outline-none"
                  >
                    {CAMERA_MOVEMENTS.map(mov => <option key={mov} value={mov}>{mov}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Formula VO Affiliate</label>
                  <select 
                    value={voFormula} 
                    onChange={(e) => setVoFormula(e.target.value)} 
                    className="w-full bg-zinc-950 p-3 mt-1.5 rounded-xl border border-zinc-800 text-sm text-zinc-300 focus:border-indigo-500 outline-none"
                  >
                    {Object.entries(VO_FORMULAS).map(([key, info]) => (
                      <option key={key} value={key}>{info.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* API Configuration Panel */}
              <div className="bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800/60 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-indigo-400" /> Gemini API Settings
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input 
                      type="checkbox" 
                      id="save_key" 
                      checked={saveKey} 
                      onChange={(e) => setSaveKey(e.target.checked)}
                      className="rounded accent-indigo-500 bg-zinc-950 border-zinc-800 w-3 h-3" 
                    />
                    <label htmlFor="save_key" className="text-[10px] text-zinc-500 cursor-pointer select-none">Ingat saya</label>
                  </div>
                </div>

                {/* API Model Selector */}
                <div>
                  <label className="text-[10px] font-semibold text-zinc-500 block mb-1">Model Yang Digunakan:</label>
                  <select 
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800/80 rounded-lg p-2 text-xs text-zinc-300 focus:border-indigo-500 outline-none"
                  >
                    {GEMINI_MODELS.map(m => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </select>
                </div>

                {/* API Password Input */}
                <div>
                  <label className="text-[10px] font-semibold text-zinc-500 block mb-1 font-mono">Gemini API Key:</label>
                  <input 
                    type="password" 
                    value={apiKey} 
                    onChange={(e) => handleSaveApiKey(e.target.value)} 
                    className="w-full bg-zinc-900 p-2.5 rounded-lg border border-zinc-800 text-xs text-zinc-300 placeholder:text-zinc-600 focus:border-indigo-500 outline-none font-mono" 
                    placeholder="AIZAsy..." 
                  />
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed">
                  Diperlukan untuk menganalisis gambar dengan AI, otomatis mendeteksi model gerakan dan naskah unik dari referensi foto Anda.
                </p>
              </div>

              <button 
                onClick={analyzeImageWithAI} 
                disabled={!imageMetadata || !productName || isAnalyzing || !apiKey} 
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-indigo-600/10 disabled:opacity-50 disabled:shadow-none text-sm"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Menganalisis Gambar...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" /> Analisis Menggunakan AI
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Panel Kanan: Output & Preview */}
          <div className="lg:col-span-7 bg-zinc-900/40 p-6 rounded-3xl border border-zinc-800/80 flex flex-col backdrop-blur-md">
            
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-200">
                <Sparkles className="text-amber-400 w-5 h-5" /> Output Prompt Akhir
              </h2>
              <div className="flex gap-2">
                <button 
                  onClick={rewritePromptForSafety} 
                  disabled={isSanitizing || !productName} 
                  className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 disabled:opacity-50 disabled:hover:bg-indigo-600/20 px-4 py-2.5 rounded-xl font-medium text-xs md:text-sm flex items-center gap-2 transition-all border border-indigo-500/30 shadow-md"
                  title="Risk Analyzer: Tulis ulang prompt agar aman dari pelanggaran kebijakan AI"
                >
                  {isSanitizing ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Proses...</>
                  ) : (
                    <><ShieldCheck className="w-4 h-4" /> Risk Analyzer</>
                  )}
                </button>
                <button 
                  onClick={handleCopy} 
                  disabled={!productName}
                  className="bg-zinc-800 hover:bg-zinc-700 active:scale-95 disabled:opacity-50 disabled:active:scale-100 text-zinc-200 px-4 py-2.5 rounded-xl font-medium text-xs md:text-sm flex items-center gap-2 transition-all border border-zinc-700/50 shadow-md"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" /> <span className="text-emerald-400">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Salin
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="relative flex-1">
              <textarea 
                readOnly 
                value={displayPrompt} 
                className="w-full h-full min-h-[420px] bg-zinc-950 p-5 rounded-2xl border border-zinc-800 text-zinc-300 font-mono text-xs md:text-sm leading-relaxed resize-none focus:outline-none" 
              />
              {safePromptOverride && (
                <div className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-3 py-1.5 rounded-md border border-emerald-500/30 flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                  <ShieldCheck className="w-3.5 h-3.5" /> SAFE PROMPT ACTIVE
                </div>
              )}
            </div>

            {/* Manual Tweak & Preview Parameters */}
            <div className="mt-5 grid md:grid-cols-2 gap-4 pt-4 border-t border-zinc-800/80">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  <Play className="w-3.5 h-3.5 text-indigo-400" /> Model Action (10 Detik)
                </div>
                <textarea 
                  value={specificAction}
                  onChange={(e) => setSpecificAction(e.target.value)}
                  className="w-full bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/60 text-xs text-zinc-400 h-24 focus:border-indigo-500 focus:text-zinc-300 outline-none resize-none leading-normal"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  <Mic className="w-3.5 h-3.5 text-emerald-400" /> Voice Over (Indonesian)
                </div>
                <textarea 
                  value={voiceOver}
                  onChange={(e) => setVoiceOver(e.target.value)}
                  className="w-full bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/60 text-xs text-zinc-400 h-24 focus:border-emerald-500 focus:text-zinc-300 outline-none resize-none leading-normal"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid (Baku & Selalu Aktif) */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-zinc-900/20 border border-zinc-800/50 p-5 rounded-2xl flex items-start gap-3.5">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-200 text-sm mb-1">Standardisasi Sinematik</h3>
              <ul className="space-y-1 text-zinc-500 text-xs">
                <li>• Resolusi Output 4K HDR</li>
                <li>• Aspek Rasio Portrait 9:16</li>
                <li>• Pencahayaan Studio Luxury</li>
              </ul>
            </div>
          </div>

          <div className="bg-zinc-900/20 border border-zinc-800/50 p-5 rounded-2xl flex items-start gap-3.5">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 shrink-0">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-200 text-sm mb-1">Aturan Voice Over (VO)</h3>
              <ul className="space-y-1 text-zinc-500 text-xs">
                <li>• Maksimal 30 kata (cepat & bertenaga)</li>
                <li>• Durasi sinkron penuh dalam 10 detik</li>
                <li>• Struktur Hook, Masalah/Benefit, & CTA</li>
              </ul>
            </div>
          </div>

          <div className="bg-zinc-900/20 border border-zinc-800/50 p-5 rounded-2xl flex items-start gap-3.5">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-200 text-sm mb-1">Cara Penggunaan</h3>
              <ul className="space-y-1 text-zinc-500 text-xs">
                <li>• Tulis Nama Produk secara manual</li>
                <li>• Pilih kategori & formula VO marketing</li>
                <li>• Salin prompt ke Runway/Luma/Kling AI</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
