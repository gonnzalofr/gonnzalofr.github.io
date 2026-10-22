// A board in 3D (HiFi page): a still render until three.js draws the model over it. An island, hydrated as the
// figure comes near the viewport; three.js and the scene (board-scene.ts) are imported only then, and only where
// WebGL works. Without JavaScript or WebGL the still render stays, and the status line says why. The model never
// moves on its own: it turns only while the reader drags it (no inertia), so there is nothing for
// prefers-reduced-motion to stop. The body of a <Figure>.
import { useEffect, useRef, useState } from 'react';

export interface BoardViewerProps {
  /** the glTF model (meshopt-compressed), relative to the page */
  model: string;
  /** the canvas's accessible name once the model is live */
  label: string;
  /** the still render: shown until the model loads, and whenever it can't */
  poster: { src: string; width: number; height: number; alt: string };
}

const statusId = 'board-status';
const failed = 'still render · the 3D model could not be loaded';

function webgl() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); }
  catch { return false; }
}

export function BoardViewer({ model, label, poster }: BoardViewerProps) {
  const stage = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('still render · turning the model needs JavaScript and WebGL');
  const [reset, setReset] = useState<(() => void) | null>(null);

  useEffect(() => {
    const el = stage.current;
    if (!el || !webgl()) return;
    let gone = false;
    setStatus('loading the model…');
    import('./board-scene.ts')
      .then(({ showBoard }) => showBoard(el, { model, label, describedBy: statusId }))
      .then((view) => {
        if (gone) return;
        setStatus('drag to turn · ctrl + scroll or pinch to zoom · arrow keys when focused');
        setReset(() => view.reset);
      })
      .catch(() => { if (!gone) setStatus(failed); });
    return () => { gone = true; };
  }, [model, label]);

  return (
    <>
      {/* board-scene.ts adds the canvas and .is-live (which hides the poster) in the frame it first draws the model */}
      <div className="board__stage" ref={stage}>
        <img className="board__poster" src={poster.src} width={poster.width} height={poster.height} loading="lazy" decoding="async" alt={poster.alt} />
      </div>
      <p className="board__bar"><span className="board__status" id={statusId}>{status}</span><button className="board__reset" type="button" hidden={!reset} onClick={() => reset?.()}>reset view</button></p>
    </>
  );
}
