import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CLASS_THEME = {
  A: "border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.7)] text-red-400",
  B: "border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.7)] text-orange-400",
  C: "border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.7)] text-yellow-300",
  D: "border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.7)] text-green-400",
};

const WAGE_BUDGET = 2000000;
const FALLBACK_AVATAR = "https://tr.rbxcdn.com/30DAY-AvatarHeadshot-Default.png";

const players = [
  { username: "deashui", club: "Bayern Munich", position: "CAM", class: "A", ovr: 85, wage: 252000 },
  { username: "MPS_Kante", club: "Bayern Munich", position: "ST", class: "A", ovr: 86, wage: 258000 },
  { username: "iLegendZico", club: "Bayern Munich", position: "CDM", class: "C", ovr: 79, wage: 217000 },
];

async function fetchRobloxAvatar(username) {
  try {
    const userRes = await fetch(`https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(username)}&limit=1`);
    if (!userRes.ok) throw new Error();
    const userData = await userRes.json();
    const userId = userData.data?.[0]?.id;
    if (!userId) return FALLBACK_AVATAR;

    const thumbRes = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=true`);
    if (!thumbRes.ok) throw new Error();
    const thumbData = await thumbRes.json();
    return thumbData.data?.[0]?.imageUrl || FALLBACK_AVATAR;
  } catch {
    return FALLBACK_AVATAR;
  }
}

function Modal({ title, subtitle, onClose, children }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.92, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.92, y: 30 }}
          className="bg-gradient-to-b from-neutral-800 to-neutral-900 border border-neutral-700 rounded-2xl p-6 w-[460px] max-h-[80vh] overflow-y-auto font-sans"
        >
          <div className="mb-4">
            <h2 className="text-2xl font-extrabold tracking-wide">{title}</h2>
            {subtitle && <div className="text-sm text-neutral-400">{subtitle}</div>}
          </div>
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const [avatars, setAvatars] = useState({});
  const [clubModal, setClubModal] = useState(null);
  const [positionModal, setPositionModal] = useState(null);
  const [playerPopup, setPlayerPopup] = useState(null);

  useEffect(() => {
    (async () => {
      for (const p of players) {
        if (!avatars[p.username]) {
          const url = await fetchRobloxAvatar(p.username);
          setAvatars((a) => ({ ...a, [p.username]: url }));
        }
      }
    })();
  }, [avatars]);

  const rankedPlayers = [...players].sort((a, b) => b.ovr - a.ovr);

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 to-black text-white p-10 font-[Inter]">
      <h1 className="text-5xl font-extrabold text-center mb-12 tracking-[0.2em] text-red-500">
        IFF SPREADSHEET
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {players.map((p) => (
          <motion.div
            key={p.username}
            whileHover={{ scale: 1.05 }}
            className={`rounded-3xl border-2 bg-gradient-to-b from-neutral-800 to-neutral-900 p-5 transition-all ${CLASS_THEME[p.class]}`}
          >
            <div className="flex gap-5">
              <img src={avatars[p.username] || FALLBACK_AVATAR} className="w-20 h-20 rounded-full border-4" />
              <div className="flex-1">
                <button
                  onClick={(e) => setPlayerPopup({ player: p, x: e.clientX, y: e.clientY })}
                  className="text-xl font-bold hover:text-red-400 transition"
                >
                  {p.username}
                </button>

                <div className="text-4xl font-black tracking-tight">{p.ovr} <span className="text-base font-semibold">OVR</span></div>

                <div className="mt-3 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Position</span>
                    <button className="underline" onClick={() => setPositionModal(p.position)}>{p.position}</button>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Club</span>
                    <button className="underline" onClick={() => setClubModal(p.club)}>{p.club}</button>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Wage</span>
                    <span>${p.wage.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {clubModal && (
        <Modal title={clubModal} subtitle="Club Overview" onClose={() => setClubModal(null)}>
          {players.filter(p => p.club === clubModal).map(p => (
            <div key={p.username} className="flex justify-between py-2 border-b border-neutral-700">
              <span>{p.username}</span>
              <span className="font-semibold">{p.ovr} OVR</span>
            </div>
          ))}
          <div className="mt-4 text-sm text-neutral-400">
            Wage Used: ${players.filter(p => p.club === clubModal).reduce((s,p)=>s+p.wage,0).toLocaleString()} / ${WAGE_BUDGET.toLocaleString()}
          </div>
        </Modal>
      )}

      {positionModal && (
        <Modal title={`${positionModal} Rankings`} subtitle="Sorted by Overall Rating" onClose={() => setPositionModal(null)}>
          {rankedPlayers.filter(p => p.position === positionModal).map((p,i) => (
            <div key={p.username} className="flex justify-between py-2 border-b border-neutral-700">
              <span>#{i+1} {p.username}</span>
              <span className="font-semibold">{p.ovr}</span>
            </div>
          ))}
        </Modal>
      )}

      {playerPopup && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="fixed z-50 bg-gradient-to-b from-neutral-800 to-neutral-900 border border-neutral-700 rounded-xl p-4 text-sm shadow-xl"
          style={{ left: playerPopup.x + 12, top: playerPopup.y + 12 }}
        >
          <div className="font-bold text-lg mb-1">{playerPopup.player.username}</div>
          <div className="text-neutral-300">Club: {playerPopup.player.club}</div>
          <div className="text-neutral-300">Position: {playerPopup.player.position}</div>
          <div className="text-neutral-300">Global Rank: #{rankedPlayers.findIndex(p => p.username === playerPopup.player.username)+1}</div>
          <div className="mt-2 text-xs text-neutral-400">Click a club or position to switch context</div>
          <button className="mt-2 text-xs underline" onClick={() => setPlayerPopup(null)}>Close</button>
        </motion.div>
      )}
    </div>
  );
}
