import asyncio
import os
from dotenv import load_dotenv
from livekit import agents, rtc
from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli
from livekit.plugins import openai as lk_openai, groq as lk_groq
from supabase import create_client

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
)


async def transcribe_und_speichern(audio_track: rtc.Track):
    print("Transkription gestartet...")
    try:
        stt = lk_groq.STT()
        audio_stream = rtc.AudioStream(audio_track)
        stt_stream = stt.stream()

        collected = []

        async def audio_senden():
            async for frame_event in audio_stream:
                stt_stream.push_frame(frame_event.frame)
            await stt_stream.aclose()

        async def transkription_empfangen():
            async for event in stt_stream:
                if event.is_final and event.alternatives:
                    text = event.alternatives[0].text.strip()
                    if text:
                        print(f"Transkription: {text}")
                        collected.append(text)

        await asyncio.gather(audio_senden(), transkription_empfangen())

        if not collected:
            print("Keine Sprache erkannt.")
            return

        beschreibung = " ".join(collected)

        # Kategorie per OpenAI bestimmen
        client = lk_openai.LLM()
        antwort = await client.chat(
            messages=[
                agents.llm.ChatMessage(
                    role="system",
                    content="Du kategorisierst Schadensmeldungen. Antworte nur mit einem Wort aus: Sanitär, Heizung, Elektrik, Fenster, Sonstiges.",
                ),
                agents.llm.ChatMessage(role="user", content=beschreibung),
            ]
        )
        kategorie = antwort.choices[0].message.content.strip()

        supabase.table("schadensmeldungen").insert({
            "titel": beschreibung[:60],
            "beschreibung": beschreibung,
            "kategorie": kategorie,
            "status": "offen",
        }).execute()

        print(f"Gespeichert: {beschreibung[:60]} [{kategorie}]")

    except Exception as e:
        print(f"Fehler bei Transkription: {e}")


async def entrypoint(ctx: JobContext):
    load_dotenv()  # Im Subprocess neu laden
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    participant = await ctx.wait_for_participant()
    print(f"Teilnehmer verbunden: {participant.identity}")

    def handle_track(track: rtc.Track):
        if track.kind == rtc.TrackKind.KIND_AUDIO:
            print(f"Audio-Track empfangen von {participant.identity}")
            asyncio.ensure_future(transcribe_und_speichern(track))

    # Tracks die bereits publiziert sind
    for track_pub in participant.track_publications.values():
        if track_pub.track:
            handle_track(track_pub.track)

    # Tracks die nach dem Verbinden publiziert werden
    @ctx.room.on("track_subscribed")
    def on_track(track: rtc.Track, *_):
        handle_track(track)


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
