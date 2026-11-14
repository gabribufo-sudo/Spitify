import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  ExternalLink,
  Globe,
  Headphones,
  MoreVertical,
  Music2,
  QrCode,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export function ChromeDownloadSite() {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [manifestOk, setManifestOk] = useState<boolean | null>(null);
  const [swOk, setSwOk] = useState<boolean | null>(null);
  const [installAttempted, setInstallAttempted] = useState(false);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const host = typeof window !== 'undefined' ? window.location.host : '';
  const downloadPageUrl = `${origin}/scarica`;
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
  const isAndroidUA =
    typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);
  const isChromeUA =
    typeof navigator !== 'undefined' &&
    /chrome|crios/i.test(navigator.userAgent) &&
    !/edg|opr|samsungbrowser/i.test(navigator.userAgent);

  // Android Intent URL that opens this exact page directly inside Google Chrome if viewed in another browser/WebView
  const chromeIntentUrl = host
    ? `intent://${host}/scarica#Intent;scheme=https;package=com.android.chrome;end`
    : downloadPageUrl;

  useEffect(() => {
    if (!origin) return;
    let cancelled = false;

    void QRCode.toDataURL(downloadPageUrl, {
      width: 220,
      margin: 1,
      color: {
        dark: '#20251E',
        light: '#F4F4F0',
      },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl('');
      });

    void fetch('/manifest.json')
      .then((r) => {
        if (!cancelled) setManifestOk(r.ok);
      })
      .catch(() => {
        if (!cancelled) setManifestOk(false);
      });

    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker
        .getRegistration()
        .then((reg) => {
          if (!cancelled) setSwOk(Boolean(reg));
        })
        .catch(() => {
          if (!cancelled) setSwOk(false);
        });
    } else {
      setSwOk(false);
    }

    return () => {
      cancelled = true;
    };
  }, [downloadPageUrl, origin]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(downloadPageUrl);
      setCopiedUrl(true);
      window.setTimeout(() => setCopiedUrl(false), 2200);
    } catch {
      // Ignore clipboard restriction
    }
  };

  const handleChromeInstallClick = async () => {
    setInstallAttempted(true);
    await install();
  };

  return (
    <div className="min-h-screen bg-[#F4F4F0] text-[#20251E] flex flex-col">
      {/* LastWave Floating Liquid Glass Header */}
      <header className="sticky top-0 z-30 px-4 sm:px-6 pt-3">
        <div className="max-w-[1120px] mx-auto px-5 h-14 rounded-full lw-liquid-bar flex items-center justify-between gap-4">
          <a
            href="/"
            className="font-display text-xl font-bold tracking-tight text-[#20251E] whitespace-nowrap"
          >
            ritmostudio<span className="text-[#88A600]">.</span>
          </a>

          <span className="hidden sm:inline-flex items-center gap-2 text-xs font-mono text-[#5B5E57]">
            <Globe className="w-3.5 h-3.5 text-[#536716]" />
            <span>CHROME WEB INSTALLER · 24-BIT / 192 KHZ</span>
          </span>

          <a
            href="/"
            className="px-4 py-2 rounded-full bg-[#20251E] hover:opacity-90 text-[#F4F4F0] text-xs font-semibold flex items-center gap-1.5 transition-opacity whitespace-nowrap"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Apri Web App</span>
          </a>
        </div>
      </header>

      <main className="flex-1 max-w-[1120px] w-full mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
        {/* Hero Obsidian Forest Section */}
        <section className="relative rounded-[28px] overflow-hidden bg-[#0E100C] text-[#EEF1E6] border border-[#2C3027] p-6 sm:p-10">
          {/* Concentric Orbital Rings */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-24 -top-24 w-[460px] h-[460px] rounded-full border border-[#EEF1E6]/10" />
            <div className="absolute -right-12 -top-12 w-[340px] h-[340px] rounded-full border border-[#C6F100]/20" />
            <div className="absolute right-6 top-6 w-[200px] h-[200px] rounded-full border border-[#EEF1E6]/10" />
            <div
              className="absolute right-8 -top-8 w-72 h-72 rounded-full blur-3xl opacity-25"
              style={{ background: 'radial-gradient(circle, #C6F100 0%, transparent 70%)' }}
            />
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 items-center">
            <div className="flex flex-col gap-4">
              <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#C6F100]">
                ✳ INSTALLAZIONE DIRETTA GOOGLE CHROME
              </p>

              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.08] text-[#EEF1E6]">
                Installa <span className="italic font-serif font-normal text-[#C6F100]">RitmoStudio</span>{' '}
                direttamente da Chrome.
              </h1>

              <p className="text-sm sm:text-base text-[#B8BFAE] leading-relaxed max-w-xl">
                Nessun file manuale da sbloccare e nessun errore di pacchetto: Google Chrome installa
                l’applicazione verificata a schermo intero sulla Home del tuo smartphone o computer,
                con audio 24-bit, equalizzatore a 15 bande e supporto offline.
              </p>

              {/* Primary Dynamic Chrome Action */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {isInstalled ? (
                  <a
                    href="/"
                    className="px-6 py-3.5 rounded-full bg-[#C6F100] text-[#20251E] text-sm font-bold inline-flex items-center gap-2 hover:brightness-95 transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>App Installata · Avvia RitmoStudio</span>
                  </a>
                ) : isInIframe ? (
                  <a
                    href={downloadPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3.5 rounded-full bg-[#C6F100] text-[#20251E] text-sm font-bold inline-flex items-center gap-2 hover:brightness-95 transition-all shadow-lg shadow-[#C6F100]/15"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Apri questa pagina in Chrome per Installare</span>
                  </a>
                ) : isInstallable ? (
                  <button
                    type="button"
                    onClick={() => void handleChromeInstallClick()}
                    className="px-6 py-3.5 rounded-full bg-[#C6F100] text-[#20251E] text-sm font-bold inline-flex items-center gap-2 hover:brightness-95 transition-all cursor-pointer shadow-lg shadow-[#C6F100]/15"
                  >
                    <Download className="w-4 h-4" />
                    <span>Installa Ora da Chrome</span>
                  </button>
                ) : isAndroidUA && !isChromeUA ? (
                  <a
                    href={chromeIntentUrl}
                    className="px-6 py-3.5 rounded-full bg-[#C6F100] text-[#20251E] text-sm font-bold inline-flex items-center gap-2 hover:brightness-95 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Apri in Google Chrome</span>
                  </a>
                ) : (
                  <a
                    href={chromeIntentUrl}
                    className="px-6 py-3.5 rounded-full bg-[#C6F100] text-[#20251E] text-sm font-bold inline-flex items-center gap-2 hover:brightness-95 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Avvia Installazione in Chrome</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => void handleCopyUrl()}
                  className="px-5 py-3.5 rounded-full border border-[#2C3027] bg-[#161912] hover:border-[#C6F100] text-xs sm:text-sm font-semibold text-[#EEF1E6] inline-flex items-center gap-2 cursor-pointer transition-colors"
                >
                  {copiedUrl ? (
                    <>
                      <Check className="w-4 h-4 text-[#C6F100]" />
                      <span>Link copiato</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#C6F100]" />
                      <span>Copia Link per Chrome</span>
                    </>
                  )}
                </button>
              </div>

              {installAttempted && !isInstallable && !isInstalled ? (
                <p className="text-xs text-[#C6F100]">
                  Se Chrome non mostra il popup automatico, usa il menu ⋮ in alto a destra in Chrome e
                  tocca &ldquo;Installa app&rdquo; oppure &ldquo;Aggiungi a schermata Home&rdquo;.
                </p>
              ) : null}
            </div>

            {/* Right QR & Direct Chrome Verification Card */}
            <div className="lw-sound-visual rounded-3xl p-6 flex flex-col items-center text-center gap-4">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR Code per aprire e installare in Chrome"
                  className="w-44 h-44 rounded-2xl border border-[#2C3027] bg-[#F4F4F0] p-2"
                />
              ) : (
                <div className="w-44 h-44 rounded-2xl border border-[#2C3027] bg-[#0E100C] flex items-center justify-center">
                  <QrCode className="w-10 h-10 text-[#C6F100]" />
                </div>
              )}

              <div>
                <p className="text-sm font-bold text-[#EEF1E6]">Scansiona e apri in Chrome</p>
                <p className="text-xs text-[#B8BFAE] mt-1 leading-relaxed">
                  Inquadra dal telefono per aprire questo link direttamente in Google Chrome ed eseguire
                  l’installazione in 1 tocco.
                </p>
              </div>

              <div className="w-full pt-3 border-t border-[#2C3027] flex flex-wrap items-center justify-center gap-3 text-[11px] font-mono text-[#B8BFAE]">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C6F100]" />
                  <span>Manifest: {manifestOk ? 'OK' : manifestOk === false ? 'Err' : '...'}</span>
                </span>
                <span>·</span>
                <span>SW: {swOk ? 'Attivo' : swOk === false ? 'Standby' : '...'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Step-by-Step Chrome Installation Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="lw-glass-card rounded-[22px] p-5 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C6F100] text-[#20251E] flex items-center justify-center font-mono font-bold text-sm">
              01
            </div>
            <h2 className="text-base font-bold text-[#20251E]">Apri il link in Chrome</h2>
            <p className="text-xs text-[#5B5E57] leading-relaxed">
              Incolla o apri l’indirizzo <span className="font-mono font-medium">{downloadPageUrl}</span>{' '}
              su <strong>Google Chrome</strong> (su smartphone o desktop) fuori da eventuali riquadri di
              anteprima.
            </p>
          </div>

          <div className="lw-glass-card rounded-[22px] p-5 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-full bg-[#20251E] text-[#C6F100] flex items-center justify-center">
              <MoreVertical className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-[#20251E]">Tocca &ldquo;Installa app&rdquo;</h2>
            <p className="text-xs text-[#5B5E57] leading-relaxed">
              {isIOS
                ? 'Su iPhone/iPad in Safari tocca Condividi e poi "Aggiungi alla schermata Home".'
                : 'Premi "Installa Ora da Chrome" qui sopra oppure tocca il menu ⋮ di Chrome in alto a destra e scegli "Installa app" / "Aggiungi a schermata Home".'}
            </p>
          </div>

          <div className="lw-glass-card rounded-[22px] p-5 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-full bg-[#536716] text-[#F4F4F0] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-[#20251E]">App Nativa a Schermo Intero</h2>
            <p className="text-xs text-[#5B5E57] leading-relaxed">
              RitmoStudio compare subito tra le tue app con icona dedicata, zero barre browser,
              aggiornamenti automatici e modalità offline pronta all’uso.
            </p>
          </div>
        </section>

        {/* Highlighted Features Included */}
        <section className="lw-glass-card rounded-[22px] p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0E100C] text-[#C6F100] flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#20251E]">
                Engine Audio LastWave 24-bit / 192 kHz &amp; Metronomo Live
              </h3>
              <p className="text-xs text-[#5B5E57]">
                EQ parametrico a 15 bande, AutoEQ cuffie, Bit-Perfect DAC bypass, testi sincronizzati
                LRCLIB, download Atmos MP3 e Liquid Stage.
              </p>
            </div>
          </div>

          <a
            href="/"
            className="px-4 py-2 rounded-full border border-[#D6D6CF] hover:border-[#536716] text-xs font-semibold text-[#20251E] inline-flex items-center gap-1.5"
          >
            <Music2 className="w-3.5 h-3.5 text-[#536716]" />
            <span>Vai al Player</span>
          </a>
        </section>
      </main>
    </div>
  );
}
