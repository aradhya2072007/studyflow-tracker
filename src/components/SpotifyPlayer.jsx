import React, { useState, useEffect, useRef } from 'react';

const FOCUS_TRACKS = [
  { name: 'Rainy Day Lofi', artist: 'Chillhop Music', duration: 185 },
  { name: 'Late Night Study', artist: 'Lo-Fi Beats', duration: 210 },
  { name: 'Focus Flow', artist: 'Café Music', duration: 195 },
  { name: 'Calm Concentration', artist: 'Ambient Works', duration: 225 },
  { name: 'Deep Work Session', artist: 'Study Vibes', duration: 200 },
];

const SPOTIFY_PLAYLIST = 'https://open.spotify.com/playlist/37i9dQZF1DX8Uebhn9wzrS';

export default function SpotifyPlayer() {
  const [open, setOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [trackIdx, setTrackIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);

  const track = FOCUS_TRACKS[trackIdx];

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            setTrackIdx(i => (i + 1) % FOCUS_TRACKS.length);
            return 0;
          }
          return p + (100 / track.duration);
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, track.duration]);

  const togglePlay = () => setPlaying(p => !p);

  const formatTime = (secs) => {
    const elapsed = Math.floor((secs / 100) * track.duration);
    return `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`;
  };

  return (
    <>
      {open && (
        <div className="spotify-player fade-in">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#1db954,#1ed760)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🎵</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#1db954' }}>Focus Music</div>
            </div>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 14 }} onClick={() => setOpen(false)}>✕</button>
          </div>

          {!connected ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10, lineHeight: 1.5 }}>
                Connect Spotify for real tracks, or use built-in lo-fi mode.
              </div>
              <div style={{ display: 'flex', gap: 6, flexDirection: 'column' }}>
                <a href={SPOTIFY_PLAYLIST} target="_blank" rel="noreferrer"
                  style={{ display: 'block', textAlign: 'center', padding: '8px', borderRadius: 10, background: '#1db954', color: 'white', textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>
                  Open Spotify Playlist 🎧
                </a>
                <button className="spotify-link-btn" onClick={() => setConnected(true)}>
                  Use Built-in Lo-fi Mode
                </button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <div className="spotify-track">{track.name}</div>
                <div className="spotify-artist">{track.artist}</div>
              </div>
              <div className="spotify-progress">
                <div className="spotify-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text3)' }}>
                <span>{formatTime(progress)}</span>
                <span>{Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}</span>
              </div>
              <div className="spotify-controls">
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text2)' }}
                  onClick={() => { setTrackIdx(i => (i - 1 + FOCUS_TRACKS.length) % FOCUS_TRACKS.length); setProgress(0); }}>⏮</button>
                <button className="spotify-play-btn" onClick={togglePlay}>{playing ? '⏸' : '▶'}</button>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text2)' }}
                  onClick={() => { setTrackIdx(i => (i + 1) % FOCUS_TRACKS.length); setProgress(0); }}>⏭</button>
                <a href={SPOTIFY_PLAYLIST} target="_blank" rel="noreferrer" className="spotify-link-btn" style={{ textDecoration: 'none' }}>
                  Open Spotify
                </a>
              </div>
            </>
          )}
        </div>
      )}

      <button
        className="floating-btn"
        style={{ left: 24, background: playing ? 'linear-gradient(135deg,#1db954,#1ed760)' : 'white', color: playing ? 'white' : '#1db954', border: '2px solid #1db954', boxShadow: playing ? '0 4px 20px rgba(29,185,84,.4)' : '0 4px 20px rgba(0,0,0,.12)' }}
        onClick={() => setOpen(o => !o)}
        title="Focus Music"
      >
        {playing ? '🎵' : '🎧'}
      </button>
    </>
  );
}
