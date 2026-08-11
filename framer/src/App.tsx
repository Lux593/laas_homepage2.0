import { framer } from "framer-plugin"
import { useState, useEffect } from "react"
import hoverMaskRevealCode from "./HoverMaskReveal.tsx?raw"
import "./App.css"

framer.showUI({
  position: "top right",
  width: 280,
  height: 220,
})

const COMPONENT_NAME = "HoverMaskReveal.tsx"

export function App() {
  const [installed, setInstalled] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    framer.getCodeFiles().then((files) => {
      setInstalled(files.some((f) => f.name === COMPONENT_NAME))
    })
  }, [])

  const handleInstall = async () => {
    setLoading(true)
    setError(null)
    try {
      await framer.createCodeFile(COMPONENT_NAME, hoverMaskRevealCode)
      setInstalled(true)
      framer.notify("HoverMaskReveal installed — find it in your Assets panel.", {
        variant: "success",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Install failed")
    }
    setLoading(false)
  }

  const handleUpdate = async () => {
    setLoading(true)
    setError(null)
    try {
      const files = await framer.getCodeFiles()
      const existing = files.find((f) => f.name === COMPONENT_NAME)
      if (existing) {
        await framer.createCodeFile(COMPONENT_NAME, hoverMaskRevealCode)
        framer.notify("HoverMaskReveal updated.", { variant: "success" })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed")
    }
    setLoading(false)
  }

  return (
    <main>
      <h4 style={{ margin: 0, fontSize: 13 }}>Hover Mask Reveal</h4>
      <p style={{ margin: 0, fontSize: 11, opacity: 0.6 }}>
        Liquid fluid simulation that reveals an image on hover. WebGL2 powered.
      </p>

      {installed === null && (
        <p style={{ fontSize: 11, opacity: 0.5 }}>Checking…</p>
      )}

      {installed === false && (
        <button
          className="framer-button-primary"
          onClick={handleInstall}
          disabled={loading}
        >
          {loading ? "Installing…" : "Install Component"}
        </button>
      )}

      {installed === true && (
        <>
          <p style={{ margin: 0, fontSize: 11, color: "#4ade80" }}>
            Installed. Drag it from the Assets panel onto your canvas.
          </p>
          <button
            className="framer-button-secondary"
            onClick={handleUpdate}
            disabled={loading}
            style={{ fontSize: 11 }}
          >
            {loading ? "Updating…" : "Reinstall / Update"}
          </button>
        </>
      )}

      {error && (
        <p style={{ margin: 0, fontSize: 11, color: "#f87171" }}>{error}</p>
      )}
    </main>
  )
}
