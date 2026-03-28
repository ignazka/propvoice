'use client'

import { useState } from 'react'
import {
  LiveKitRoom,
  useLocalParticipant,
  RoomAudioRenderer,
} from '@livekit/components-react'

function MicButton() {
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant()

  async function toggleMic() {
    await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={toggleMic}
        className={`w-24 h-24 rounded-full text-white text-sm font-medium transition-colors ${
          isMicrophoneEnabled
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-black hover:bg-zinc-800'
        }`}
      >
        {isMicrophoneEnabled ? 'Stopp' : 'Sprechen'}
      </button>
      <p className="text-sm text-zinc-500">
        {isMicrophoneEnabled
          ? 'Beschreiben Sie den Schaden…'
          : 'Drücken Sie den Knopf und beschreiben Sie den Schaden.'}
      </p>
    </div>
  )
}

export default function MeldenPage() {
  const [token, setToken] = useState<string | null>(null)
  const [gesendet, setGesendet] = useState(false)
  const [fehler, setFehler] = useState<string | null>(null)

  async function starten() {
    setFehler(null)
    const res = await fetch('http://localhost:8000/api/token')
    if (!res.ok) {
      setFehler('Verbindung fehlgeschlagen. Ist der Backend-Server gestartet?')
      return
    }
    const data = await res.json()
    setToken(data.token)
  }

  if (gesendet) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold">Danke!</p>
          <p className="text-zinc-500 mt-2">Ihre Meldung wurde übermittelt.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-6 max-w-sm text-center">
        <h1 className="text-2xl font-semibold">Schaden melden</h1>

        {fehler && <p className="text-sm text-red-600">{fehler}</p>}

        {!token ? (
          <button
            onClick={starten}
            className="bg-black text-white rounded-full px-8 py-3 text-sm hover:bg-zinc-800"
          >
            Verbinden
          </button>
        ) : (
          <LiveKitRoom
            token={token}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
            audio={false}
            video={false}
          >
            <RoomAudioRenderer />
            <MicButton />
            <button
              onClick={() => setGesendet(true)}
              className="text-sm text-zinc-400 hover:text-black mt-4"
            >
              Meldung abschicken
            </button>
          </LiveKitRoom>
        )}
      </div>
    </main>
  )
}
