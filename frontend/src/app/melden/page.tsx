'use client'

import { useEffect, useState } from 'react'
import {
  LiveKitRoom,
  useLocalParticipant,
  RoomAudioRenderer,
} from '@livekit/components-react'

function MicButton() {
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant()

  // Mikrofon automatisch aktivieren sobald die Verbindung steht
  useEffect(() => {
    if (localParticipant) {
      localParticipant.setMicrophoneEnabled(true)
    }
  }, [localParticipant])

  async function toggleMic() {
    if (!localParticipant) return
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
  const [livekitUrl, setLivekitUrl] = useState<string | null>(null)
  const [gesendet, setGesendet] = useState(false)
  const [laden, setLaden] = useState(false)

  async function sprechen() {
    setLaden(true)
    try {
      const res = await fetch('http://localhost:8000/api/token')
      if (res.ok) {
        const data = await res.json()
        setToken(data.token)
        setLivekitUrl(data.url)
      }
    } finally {
      setLaden(false)
    }
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

        {!token || !livekitUrl ? (
          <button
            onClick={sprechen}
            disabled={laden}
            className="w-24 h-24 rounded-full bg-black text-white text-sm font-medium hover:bg-zinc-800 disabled:opacity-50"
          >
            {laden ? '…' : 'Sprechen'}
          </button>
        ) : (
          <LiveKitRoom
            token={token}
            serverUrl={livekitUrl}
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
