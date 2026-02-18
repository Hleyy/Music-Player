import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier trouvé" }, { status: 400 });
    }

    // Whisper nécessite un objet File avec un nom pour fonctionner
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["segment"],
    });

    // On formate pour ton lecteur Zenka
    const lyrics = transcription.segments.map((s) => ({
      time: s.start,
      text: s.text.trim(),
    }));

    return NextResponse.json({ lyrics });
  } catch (error) {
    console.error("Erreur API Whisper:", error);
    return NextResponse.json({ error: "Erreur lors de la transcription" }, { status: 500 });
  }
}