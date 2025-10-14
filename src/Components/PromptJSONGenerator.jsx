import React, { useState } from "react";

export default function PromptJSONGenerator() {
  const [inputText, setInputText] = useState("");
  const [refinedText, setRefinedText] = useState("");
  const [jsonOutput, setJsonOutput] = useState("");

  // Fungsi sederhana untuk memperhalus deskripsi menggunakan AI Refiner (mock)
  const refineText = async () => {
    if (!inputText.trim()) return;

    // Simulasi proses AI (di versi live bisa diganti dengan API OpenAI / Gemini / Claude)
    const refined = inputText
      .replace(/\s+/g, " ")
      .replace(/\baku\b/g, "seorang pria")
      .replace(/malam/g, "malam yang sunyi dengan cahaya bulan lembut")
      .replace(/pagi/g, "pagi yang cerah dan damai")
      .replace(/youtube/g, "YouTube notification glowing softly")
      .replace(/\bghibli\b/gi, "Studio Ghibli anime style")
      .trim();

    setRefinedText(refined);
  };

  // Fungsi untuk generate JSON prompt dari teks refined
  const generateJSON = () => {
    const text = (refinedText || inputText).toLowerCase();

    const jsonTemplate = {
      title: "",
      style: "",
      lighting: "",
      characters: [],
      environment: "",
      camera: {
        angle: "",
        movement: "",
      },
      story: refinedText || inputText,
      emotion: "",
      duration: 8,
      aspect_ratio: "16:9",
    };

    if (text.includes("ghibli")) jsonTemplate.style = "Studio Ghibli anime style";
    else if (text.includes("pixel")) jsonTemplate.style = "Pixel art 16-bit";
    else if (text.includes("realistic")) jsonTemplate.style = "Realistic cinematic";

    if (text.includes("malam") || text.includes("night")) jsonTemplate.lighting = "night lighting";
    else if (text.includes("siang") || text.includes("day")) jsonTemplate.lighting = "daylight";

    if (text.includes("pria") || text.includes("man")) jsonTemplate.characters.push("male character");
    if (text.includes("wanita") || text.includes("girl") || text.includes("putri")) jsonTemplate.characters.push("female character");
    if (text.includes("hewan") || text.includes("cat") || text.includes("dog")) jsonTemplate.characters.push("animal");

    if (text.includes("kamar") || text.includes("room")) jsonTemplate.environment = "indoor room";
    else if (text.includes("hutan") || text.includes("forest")) jsonTemplate.environment = "forest";
    else if (text.includes("kota") || text.includes("city")) jsonTemplate.environment = "urban city";

    if (text.includes("zoom")) jsonTemplate.camera.movement = "slow zoom-in";
    if (text.includes("atas")) jsonTemplate.camera.angle = "top view";
    else if (text.includes("bawah")) jsonTemplate.camera.angle = "low angle";
    else jsonTemplate.camera.angle = "eye-level";

    if (text.includes("sedih") || text.includes("lonely")) jsonTemplate.emotion = "sad";
    else if (text.includes("bahagia") || text.includes("happy")) jsonTemplate.emotion = "joyful";

    const matchDuration = text.match(/(\d+)\s*(detik|seconds?)/);
    if (matchDuration) jsonTemplate.duration = parseInt(matchDuration[1]);

    jsonTemplate.title = (refinedText || inputText).split(" ").slice(0, 4).join(" ");

    setJsonOutput(JSON.stringify(jsonTemplate, null, 2));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">🧩 Image-to-Video Prompt JSON Generator + AI Refiner</h1>

      <textarea
        className="w-full max-w-2xl p-3 border rounded-lg shadow-sm focus:ring focus:ring-blue-300 mb-4"
        rows="5"
        placeholder="Tulis deskripsi teks bebas di sini..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />

      <div className="flex gap-4">
        <button
          onClick={refineText}
          className="bg-purple-600 text-white px-5 py-2 rounded-lg shadow hover:bg-purple-700 transition"
        >
          🔮 AI Refine Text
        </button>

        <button
          onClick={generateJSON}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          🚀 Generate JSON
        </button>
      </div>

      {refinedText && (
        <div className="mt-6 w-full max-w-2xl">
          <h2 className="font-semibold mb-2 text-gray-700">✨ Hasil Refine Text:</h2>
          <textarea
            className="w-full p-3 border rounded-lg bg-gray-50 text-gray-800"
            rows="5"
            value={refinedText}
            readOnly
          />
        </div>
      )}

      {jsonOutput && (
        <div className="mt-6 w-full max-w-2xl">
          <h2 className="font-semibold mb-2 text-gray-700">📄 Hasil JSON Prompt:</h2>
          <textarea
            className="w-full p-3 border rounded-lg bg-gray-900 text-green-300 font-mono"
            rows="15"
            value={jsonOutput}
            readOnly
          />
          <button
            onClick={() => navigator.clipboard.writeText(jsonOutput)}
            className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Copy JSON
          </button>
        </div>
      )}
    </div>
  );
}
