import asyncio
import os
import threading
from dotenv import load_dotenv
from livekit import rtc
from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli, stt
from livekit.plugins import deepgram as lk_deepgram
from supabase import create_client
from groq import Groq  # Synchroner Client!

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
)

# Synchroner Groq-Client — kein asyncio nötig
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def kategorie_und_speichern_sync(beschreibung: str):
    try:
        # Kategorie und Titel parallel bestimmen
        kategorie_response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "Du kategorisierst Schadensmeldungen. Antworte nur mit einem Wort aus: Sanitär, Heizung, Elektrik, Fenster, Sonstiges."},
                {"role": "user", "content": beschreibung},
            ],
        )
        titel_response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "Du fasst Schadensmeldungen in einem kurzen Titel zusammen. Antworte nur mit dem Titel, maximal 5 Wörter, keine Anführungszeichen."},
                {"role": "user", "content": beschreibung},
            ],
        )

        kategorie = kategorie_response.choices[0].message.content.strip()
        titel = titel_response.choices[0].message.content.strip()

        print(f"Titel: {titel}")
        print(f"Kategorie: {kategorie}")

        supabase.table("schadensmeldungen").insert({
            "titel": titel,
            "beschreibung": beschreibung,
            "kategorie": kategorie,
            "status": "offen",
        }).execute()

        print(f"Gespeichert: {titel} [{kategorie}]")
    except Exception as e:
        import traceback
        print(f"Fehler bei Kategorisierung/Speicherung: {e}")
        traceback.print_exc()


async def transcribe_und_speichern(audio_track: rtc.Track) -> None:
    print("Transkription gestartet...")
    try:
        stt_plugin = lk_deepgram.STT(language="de")
        audio_stream = rtc.AudioStream(audio_track)
        stt_stream = stt_plugin.stream()

        collected: list[str] = []
        interim = ""
        gespeichert = False

        def jetzt_speichern(beschreibung: str):
            nonlocal gespeichert
            if gespeichert:
                return
            gespeichert = True
            print(f"Speichere: {beschreibung}")
            t = threading.Thread(
                target=kategorie_und_speichern_sync,
                args=(beschreibung,),
                daemon=False,
            )
            t.start()
            t.join()

        async def audio_senden():
            frame_count = 0
            async for frame_event in audio_stream:
                frame_count += 1
                stt_stream.push_frame(frame_event.frame)
            print(f"Audio-Stream beendet: {frame_count} Frames empfangen")
            await stt_stream.aclose()

        async def transkription_empfangen():
            nonlocal interim
            async for event in stt_stream:
                if not event.alternatives:
                    continue
                text = event.alternatives[0].text.strip()
                if not text:
                    continue
                if event.type == stt.SpeechEventType.INTERIM_TRANSCRIPT:
                    print(f"Interim: {text}")
                    interim = text
                elif event.type == stt.SpeechEventType.FINAL_TRANSCRIPT:
                    print(f"Final: {text}")
                    collected.append(text)
                    interim = ""
                elif event.type == stt.SpeechEventType.END_OF_SPEECH:
                    # Sprache erkannt und Pause — sofort speichern, nicht auf Disconnect warten
                    beschreibung = " ".join(collected) if collected else interim
                    if beschreibung:
                        print(f"END_OF_SPEECH erkannt, speichere: {beschreibung}")
                        jetzt_speichern(beschreibung)

            # Fallback: Stream endet ohne END_OF_SPEECH (z.B. bei kurzem Clip)
            if not gespeichert:
                beschreibung = " ".join(collected) if collected else interim
                if beschreibung:
                    print(f"Fallback-Speicherung: {beschreibung}")
                    jetzt_speichern(beschreibung)
                else:
                    print("Keine Sprache erkannt.")

        await asyncio.gather(audio_senden(), transkription_empfangen())

    except Exception as e:
        import traceback
        print(f"Fehler bei Transkription: {e}")
        traceback.print_exc()


async def entrypoint(ctx: JobContext):
    load_dotenv()
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    participant = await ctx.wait_for_participant()
    print(f"Teilnehmer verbunden: {participant.identity}")

    tasks: list[asyncio.Task] = []

    def handle_track(track: rtc.Track):
        if track.kind == rtc.TrackKind.KIND_AUDIO:
            print(f"Audio-Track empfangen von {participant.identity}")
            task = asyncio.create_task(transcribe_und_speichern(track))
            tasks.append(task)

    for track_pub in participant.track_publications.values():
        if track_pub.track:
            handle_track(track_pub.track)

    @ctx.room.on("track_subscribed")
    def on_track(track: rtc.Track, *_):
        handle_track(track)

    # Warten bis der Raum getrennt wird (Mieter aktiviert Mikrofon erst nach Verbindung)
    disconnected = asyncio.Event()

    @ctx.room.on("disconnected")
    def on_disconnected(*_):
        disconnected.set()

    await disconnected.wait()

    if tasks:
        await asyncio.gather(*tasks, return_exceptions=True)


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))