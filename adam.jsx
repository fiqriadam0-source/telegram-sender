import { useEffect, useMemo, useRef, useState } from 'react'

const THEMES = [
  {
    id: 'corporate',
    label: 'Corporate',
    tone: 'Kemas',
    shell: 'bg-[#ecf2f7]',
    orbA: 'bg-cyan-300/35',
    orbB: 'bg-sky-200/45',
    orbC: 'bg-emerald-200/35',
    panel: 'border-slate-200/90 bg-white/85 shadow-cyan-950/10',
    badge: 'border-cyan-700/20 bg-cyan-50 text-cyan-700',
    accent: 'bg-slate-900 hover:bg-cyan-700',
    inputFocus: 'focus:border-cyan-500 focus:ring-cyan-100',
    sidePanel: 'border-slate-200 bg-slate-900 text-slate-100',
    sideItem: 'border-slate-700/80 bg-slate-800/70 text-slate-300',
    heading: 'tracking-tight',
  },
  {
    id: 'playful',
    label: 'Playful',
    tone: 'Energetik',
    shell: 'bg-[#fff5eb]',
    orbA: 'bg-amber-300/45',
    orbB: 'bg-fuchsia-200/45',
    orbC: 'bg-orange-200/45',
    panel: 'border-amber-200/90 bg-white/85 shadow-orange-950/10',
    badge: 'border-orange-700/20 bg-orange-50 text-orange-700',
    accent: 'bg-orange-500 hover:bg-fuchsia-600',
    inputFocus: 'focus:border-orange-500 focus:ring-orange-100',
    sidePanel: 'border-orange-200 bg-[#25161f] text-amber-50',
    sideItem: 'border-orange-300/30 bg-[#34202d] text-amber-100',
    heading: 'tracking-normal',
  },
  {
    id: 'neo',
    label: 'Neo Mint',
    tone: 'Futuristik',
    shell: 'bg-[#eefcf7]',
    orbA: 'bg-emerald-300/45',
    orbB: 'bg-lime-200/50',
    orbC: 'bg-teal-200/45',
    panel: 'border-emerald-200/90 bg-white/85 shadow-emerald-950/10',
    badge: 'border-emerald-700/20 bg-emerald-50 text-emerald-700',
    accent: 'bg-teal-700 hover:bg-emerald-600',
    inputFocus: 'focus:border-emerald-500 focus:ring-emerald-100',
    sidePanel: 'border-emerald-200 bg-[#062b2b] text-emerald-50',
    sideItem: 'border-emerald-300/30 bg-[#0c3934] text-emerald-100',
    heading: 'tracking-tight',
  },
]

function App() {
  const endpoint =
    'https://script.google.com/macros/s/AKfycbyGs4rHfYF49GbYVX4FGSpuAxyZcTSrhbExkBifXoDSEo-6y_Z4v02r11H7o4c48mWZ/exec'

  // ===== NAVIGATION =====
  const [currentPage, setCurrentPage] = useState('restock') // restock | stock | telegram
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // ===== RESTOK STATE =====
  const [materials, setMaterials] = useState([])
  const [material, setMaterial] = useState('')
  const [kuantiti, setKuantiti] = useState('')
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState({ type: 'idle', message: '' })
  const [themeId, setThemeId] = useState('corporate')
  const [isMaterialMenuOpen, setIsMaterialMenuOpen] = useState(false)
  const materialMenuRef = useRef(null)

  // ===== STOCK =====
  const [stock, setStock] = useState([])
  const [isLoadingStock, setIsLoadingStock] = useState(false)

  // ===== TELEGRAM =====
  const [tgToken, setTgToken] = useState('')
  const [tgChatId, setTgChatId] = useState('')
  const [tgMessage, setTgMessage] = useState('')
  const [tgStatus, setTgStatus] = useState({ type: 'idle', message: '' })
  const [isSendingTg, setIsSendingTg] = useState(false)

  // Load Telegram data dari localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('tg_token')
    const savedChatId = localStorage.getItem('tg_chatId')
    if (savedToken) setTgToken(savedToken)
    if (savedChatId) setTgChatId(savedChatId)
  }, [])

  // Tutup menu bila klik luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
      if (materialMenuRef.current && !materialMenuRef.current.contains(event.target)) {
        setIsMaterialMenuOpen(false)
      }
    }
    document.addEventListener('pointerdown', handleClickOutside)
    return () => document.removeEventListener('pointerdown', handleClickOutside)
  }, [])

  // Load materials
  useEffect(() => {
    const loadMaterials = async () => {
      try {
        const response = await fetch(`${endpoint}?action=getMaterials`)
        const data = await response.json()
        if (!Array.isArray(data)) throw new Error('Format material tidak sah')
        setMaterials(data)
      } catch (error) {
        setStatus({
          type: 'error',
          message: 'Gagal memuat senarai material. Sila cuba lagi.',
        })
      } finally {
        setIsLoadingMaterials(false)
      }
    }
    loadMaterials()
  }, [endpoint])

  // Load stock
  const loadStock = async () => {
    setIsLoadingStock(true)
    try {
      const response = await fetch(`${endpoint}?action=getStock`)
      const data = await response.json()
      if (!Array.isArray(data)) throw new Error('Format stock tidak sah')
      setStock(data)
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Gagal memuat maklumat stock.',
      })
    } finally {
      setIsLoadingStock(false)
    }
  }

  useEffect(() => {
    loadStock()
  }, [])

  const statusClass = useMemo(() => {
    if (status.type === 'success') return 'border-emerald-400/50 bg-emerald-100 text-emerald-800'
    if (status.type === 'error') return 'border-rose-400/50 bg-rose-100 text-rose-800'
    return 'border-slate-300/70 bg-slate-50 text-slate-700'
  }, [status.type])

  const activeTheme = useMemo(
    () => THEMES.find((theme) => theme.id === themeId) ?? THEMES[0],
    [themeId],
  )

  const filteredMaterials = useMemo(() => {
    const keyword = material.trim().toLowerCase()
    if (!keyword) return materials.slice(0, 8)
    return materials
      .filter((item) => item.toLowerCase().includes(keyword))
      .slice(0, 8)
  }, [material, materials])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!material.trim()) {
      setStatus({ type: 'error', message: 'Material wajib diisi.' })
      return
    }

    const jumlah = Number(kuantiti)
    if (!jumlah || jumlah < 1) {
      setStatus({ type: 'error', message: 'Kuantiti mesti sekurang-kurangnya 1.' })
      return
    }

    setIsSubmitting(true)
    setStatus({ type: 'idle', message: 'Menghantar restok...' })

    const formData = new FormData()
    formData.append('material', material.trim())
    formData.append('kuantiti', String(jumlah))
    formData.append('type', 'restock')

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      })

      const resultText = await response.text()

      if (resultText.includes('Restock Success')) {
        setStatus({ type: 'success', message: 'Restock berjaya direkod.' })
        setKuantiti('')
        loadStock()
      } else if (resultText.includes('Error')) {
        setStatus({ type: 'error', message: resultText })
      } else {
        setStatus({ type: 'success', message: resultText })
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Tidak dapat menghubungi server. Semak talian internet.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // ===== TELEGRAM FUNCTIONS =====
  const hantarMesej = async () => {
    if (!tgToken.trim() || !tgChatId.trim() || !tgMessage.trim()) {
      setTgStatus({ type: 'error', message: 'Sila isi semua medan!' })
      return
    }

    localStorage.setItem('tg_token', tgToken.trim())
    localStorage.setItem('tg_chatId', tgChatId.trim())

    setIsSendingTg(true)
    setTgStatus({ type: 'idle', message: 'Sedang menghantar...' })

    try {
      const url = `https://api.telegram.org/bot${tgToken.trim()}/sendMessage`
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: tgChatId.trim(),
          text: tgMessage.trim(),
          parse_mode: 'HTML',
        }),
      })

      const data = await response.json()

      if (data.ok) {
        setTgStatus({ type: 'success', message: 'Mesej berjaya dihantar!' })
        setTgMessage('')
      } else {
        setTgStatus({ type: 'error', message: `Gagal: ${data.description}` })
      }
    } catch (error) {
      setTgStatus({ type: 'error', message: `Ralat: ${error.message}` })
    } finally {
      setIsSendingTg(false)
    }
  }

  const padamDataTg = () => {
    localStorage.removeItem('tg_token')
    localStorage.removeItem('tg_chatId')
    setTgToken('')
    setTgChatId('')
    setTgStatus({ type: 'success', message: 'Data telah dipadam.' })
  }

  const changePage = (page) => {
    setCurrentPage(page)
    setIsMenuOpen(false)
  }

  return (
    <main className={`relative min-h-screen overflow-hidden px-4 py-6 sm:px-8 sm:py-10 ${activeTheme.shell}`}>
      {/* Background orbs */}
      <div className={`absolute -left-24 top-10 h-72 w-72 rounded-full blur-3xl ${activeTheme.orbA}`} />
      <div className={`absolute right-0 top-0 h-80 w-80 rounded-full blur-3xl ${activeTheme.orbB}`} />
      <div className={`absolute bottom-0 left-1/3 h-96 w-96 rounded-full blur-3xl ${activeTheme.orbC}`} />

      <section className="relative mx-auto w-full max-w-5xl">
        {/* ===== HEADER + HAMBURGER MENU ===== */}
        <div className={`mb-6 flex items-center justify-between rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-lg sm:px-6 ${activeTheme.panel}`}>
          <div className="flex items-center gap-3">
            <div className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${activeTheme.badge}`}>
              Restock Console
            </div>
            <span className="hidden text-sm font-medium text-slate-600 sm:inline">
              {currentPage === 'restock' && 'Borang Restok'}
              {currentPage === 'stock' && 'Senarai Stock'}
              {currentPage === 'telegram' && 'Telegram Sender'}
            </span>
          </div>

          {/* Hamburger Button */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-xl bg-slate-900/90 text-white transition hover:bg-slate-800"
              aria-label="Menu"
            >
              <span className={`block h-[2px] w-5 rounded-full bg-white transition ${isMenuOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
              <span className={`block h-[2px] w-5 rounded-full bg-white transition ${isMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-[2px] w-5 rounded-full bg-white transition ${isMenuOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20">
                <button
                  type="button"
                  onClick={() => changePage('restock')}
                  className={`flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm font-semibold transition hover:bg-slate-50 ${
                    currentPage === 'restock' ? 'bg-slate-100 text-slate-900' : 'text-slate-700'
                  }`}
                >
                  <span className="text-lg">📦</span>
                  Restok
                </button>
                <button
                  type="button"
                  onClick={() => changePage('stock')}
                  className={`flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm font-semibold transition hover:bg-slate-50 ${
                    currentPage === 'stock' ? 'bg-slate-100 text-slate-900' : 'text-slate-700'
                  }`}
                >
                  <span className="text-lg">📋</span>
                  Senarai Stock
                </button>
                <button
                  type="button"
                  onClick={() => changePage('telegram')}
                  className={`flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm font-semibold transition hover:bg-slate-50 ${
                    currentPage === 'telegram' ? 'bg-slate-100 text-slate-900' : 'text-slate-700'
                  }`}
                >
                  <span className="text-lg">✈️</span>
                  Telegram Sender
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ===== PAGE: RESTOK ===== */}
        {currentPage === 'restock' && (
          <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
            <form
              onSubmit={handleSubmit}
              className="reveal reveal-2 lift-card rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/10 sm:p-8"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2
                  className={`text-2xl text-slate-900 ${activeTheme.heading}`}
                  style={{ fontFamily: 'Archivo Black, sans-serif' }}
                >
                  Borang Restok
                </h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-600">
                  Live
                </span>
              </div>

              <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-slate-700">
                Material
              </label>
              <div ref={materialMenuRef} className="relative mb-6">
                <input
                  type="text"
                  value={material}
                  onChange={(event) => {
                    setMaterial(event.target.value)
                    setIsMaterialMenuOpen(true)
                  }}
                  onFocus={() => setIsMaterialMenuOpen(true)}
                  placeholder={isLoadingMaterials ? 'Memuat material...' : 'Taip atau pilih material'}
                  className={`w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 pr-12 text-slate-900 outline-none transition focus:bg-white focus:ring-4 ${activeTheme.inputFocus}`}
                  disabled={isLoadingMaterials || isSubmitting}
                  required
                />
                <button
                  type="button"
                  onClick={() => setIsMaterialMenuOpen((open) => !open)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Buka senarai material"
                  disabled={isLoadingMaterials || isSubmitting}
                >
                  <svg
                    className={`h-4 w-4 transition ${isMaterialMenuOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 7.5L10 12.5L15 7.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {isMaterialMenuOpen && !isLoadingMaterials && (
                  <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
                    <div className="max-h-56 overflow-y-auto p-2">
                      {filteredMaterials.length > 0 ? (
                        filteredMaterials.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => {
                              setMaterial(item)
                              setIsMaterialMenuOpen(false)
                            }}
                            className="mb-1 block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 last:mb-0"
                          >
                            {item}
                          </button>
                        ))
                      ) : (
                        <p className="px-3 py-2 text-sm text-slate-500">Tiada padanan material.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-slate-700">
                Kuantiti
              </label>
              <input
                type="number"
                min="1"
                value={kuantiti}
                onChange={(event) => setKuantiti(event.target.value)}
                placeholder="Masukkan jumlah"
                className={`mb-7 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:bg-white focus:ring-4 ${activeTheme.inputFocus}`}
                disabled={isSubmitting}
                required
              />

              <button
                type="submit"
                disabled={isSubmitting || isLoadingMaterials}
                className={`w-full rounded-xl px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition disabled:cursor-not-allowed disabled:bg-slate-400 ${activeTheme.accent}`}
              >
                {isSubmitting ? 'Menghantar...' : 'Hantar Restok'}
              </button>

              {status.message && (
                <div className={`mt-5 rounded-xl border px-4 py-3 text-sm font-medium ${statusClass}`}>
                  {status.message}
                </div>
              )}
            </form>

            {/* Quick Stock Preview */}
            <aside className={`reveal reveal-3 lift-card rounded-3xl border p-6 shadow-xl shadow-slate-900/30 sm:p-8 ${activeTheme.sidePanel}`}>
              <div className="mb-5 flex items-center justify-between gap-3">
                <h3
                  className={`text-2xl leading-tight ${activeTheme.heading}`}
                  style={{ fontFamily: 'Archivo Black, sans-serif' }}
                >
                  Maklumat Stock
                </h3>
                <button
                  type="button"
                  onClick={loadStock}
                  disabled={isLoadingStock}
                  className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition hover:bg-white/20 disabled:opacity-50"
                >
                  {isLoadingStock ? 'Loading...' : 'Refresh'}
                </button>
              </div>

              {isLoadingStock ? (
                <p className="text-sm opacity-70">Sedang memuatkan stock...</p>
              ) : stock.length === 0 ? (
                <p className="text-sm opacity-70">Tiada data stock.</p>
              ) : (
                <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
                  {stock.map((item, index) => (
                    <div key={index} className={`rounded-xl border p-4 text-sm ${activeTheme.sideItem}`}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold leading-tight">{item.material}</p>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                            Number(item.baki) <= Number(item.minimum)
                              ? 'bg-red-500/20 text-red-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {item.baki}
                        </span>
                      </div>
                      <p className="mt-1 text-xs opacity-70">Minimum: {item.minimum}</p>
                    </div>
                  ))}
                </div>
              )}
            </aside>
          </div>
        )}

        {/* ===== PAGE: SENARAI STOCK ===== */}
        {currentPage === 'stock' && (
          <div className={`rounded-3xl border p-6 shadow-xl sm:p-8 ${activeTheme.sidePanel}`}>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h2
                className={`text-3xl ${activeTheme.heading}`}
                style={{ fontFamily: 'Archivo Black, sans-serif' }}
              >
                Senarai Stock
              </h2>
              <button
                type="button"
                onClick={loadStock}
                disabled={isLoadingStock}
                className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wide transition hover:bg-white/20 disabled:opacity-50"
              >
                {isLoadingStock ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {isLoadingStock ? (
              <p className="text-sm opacity-70">Sedang memuatkan stock...</p>
            ) : stock.length === 0 ? (
              <p className="text-sm opacity-70">Tiada data stock.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {stock.map((item, index) => (
                  <div key={index} className={`rounded-2xl border p-5 ${activeTheme.sideItem}`}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-lg font-bold leading-tight">{item.material}</p>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-sm font-bold ${
                          Number(item.baki) <= Number(item.minimum)
                            ? 'bg-red-500/25 text-red-300'
                            : 'bg-emerald-500/25 text-emerald-300'
                        }`}
                      >
                        {item.baki}
                      </span>
                    </div>
                    <p className="mt-2 text-sm opacity-70">Minimum: {item.minimum}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== PAGE: TELEGRAM SENDER ===== */}
        {currentPage === 'telegram' && (
          <div className="mx-auto max-w-md">
            <div className={`rounded-3xl border p-6 shadow-2xl backdrop-blur-lg sm:p-8 ${activeTheme.panel}`}>
              <div className="mb-6 text-center">
                <h2
                  className={`text-3xl text-slate-900 ${activeTheme.heading}`}
                  style={{ fontFamily: 'Archivo Black, sans-serif' }}
                >
                  Telegram Messenger
                </h2>
                <p className="mt-2 text-sm text-slate-500">Token & Chat ID disimpan automatik</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-slate-700">
                    Bot Token
                  </label>
                  <input
                    type="text"
                    value={tgToken}
                    onChange={(e) => setTgToken(e.target.value)}
                    placeholder="Masukkan Bot Token"
                    className={`w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:bg-white focus:ring-4 ${activeTheme.inputFocus}`}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-slate-700">
                    Chat ID
                  </label>
                  <input
                    type="text"
                    value={tgChatId}
                    onChange={(e) => setTgChatId(e.target.value)}
                    placeholder="Masukkan Chat ID"
                    className={`w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:bg-white focus:ring-4 ${activeTheme.inputFocus}`}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-slate-700">
                    Mesej
                  </label>
                  <textarea
                    value={tgMessage}
                    onChange={(e) => setTgMessage(e.target.value)}
                    placeholder="Tulis mesej anda di sini..."
                    rows={4}
                    className={`w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:bg-white focus:ring-4 ${activeTheme.inputFocus}`}
                  />
                </div>

                <button
                  type="button"
                  onClick={hantarMesej}
                  disabled={isSendingTg}
                  className={`w-full rounded-xl px-5 py-3.5 text-sm font-bold uppercase tracking-[0.16em] text-white transition disabled:cursor-not-allowed disabled:bg-slate-400 ${activeTheme.accent}`}
                >
                  {isSendingTg ? 'Menghantar...' : 'Hantar Mesej'}
                </button>

                <button
                  type="button"
                  onClick={padamDataTg}
                  className="w-full rounded-xl border-2 border-rose-400 px-5 py-3 text-sm font-bold uppercase tracking-wide text-rose-600 transition hover:bg-rose-50"
                >
                  Padam Data Tersimpan
                </button>

                {tgStatus.message && (
                  <div
                    className={`rounded-xl border px-4 py-3 text-center text-sm font-medium ${
                      tgStatus.type === 'success'
                        ? 'border-emerald-400/50 bg-emerald-100 text-emerald-800'
                        : tgStatus.type === 'error'
                          ? 'border-rose-400/50 bg-rose-100 text-rose-800'
                          : 'border-slate-300 bg-slate-50 text-slate-700'
                    }`}
                  >
                    {tgStatus.message}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Theme Switcher (bawah) */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => setThemeId(theme.id)}
              className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide transition ${
                themeId === theme.id
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-300 bg-white/80 text-slate-700 hover:border-slate-500'
              }`}
            >
              {theme.label}
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}

export default App