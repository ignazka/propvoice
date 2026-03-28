import asyncio
import os
from dotenv import load_dotenv
from livekit import agents, rtc
from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli
from livekit.plugins import openai as lk_openai, silero
from supabase import create_client

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
)


async def transcribe_und_speichern(audio_track: rtc.Track):
    stt = lk_openai.STT()
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
                    collected.append(text)

    await asyncio.gather(audio_senden(), transkription_empfangen())

    if not collected:
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


async def entrypoint(ctx: JobContext):
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    participant = await ctx.wait_for_participant()
    print(f"Teilnehmer verbunden: {participant.identity}")

    @ctx.room.on("track_subscribed")
    def on_track(track: rtc.Track, *_):
        if track.kind == rtc.TrackKind.KIND_AUDIO:
            asyncio.ensure_future(transcribe_und_speichern(track))


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
