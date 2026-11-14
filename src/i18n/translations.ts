import type { AppLanguage, ChatModelId } from '../types/music';

export const LANGUAGES: { code: AppLanguage; label: string; nativeName: string }[] = [
  { code: 'it', label: 'IT', nativeName: 'Italiano' },
  { code: 'en', label: 'EN', nativeName: 'English' },
  { code: 'es', label: 'ES', nativeName: 'Español' },
  { code: 'fr', label: 'FR', nativeName: 'Français' },
  { code: 'de', label: 'DE', nativeName: 'Deutsch' },
];

export const LOCALE_MAP: Record<AppLanguage, string> = {
  it: 'it-IT',
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
};

export interface Translations {
  nav: {
    releases: string;
    catalog: string;
    playlists: string;
    history: string;
    studio: string;
    covers: string;
    chat: string;
    liquidCast: string;
    refreshReleases: string;
  };
  toolbar: {
    regionItaly: string;
    regionGlobal: string;
    languageLabel: string;
    updatedAt: string;
    nextUpdateIn: string;
    loadingCatalog: string;
  };
  catalog: {
    heroTitle: string;
    heroSubtitle: string;
    syncTopSong: string;
    searchPlaceholder: string;
    advancedSearch: string;
    searchBtn: string;
    searchingBtn: string;
    artistLabel: string;
    artistPlaceholder: string;
    albumLabel: string;
    albumPlaceholder: string;
    genreLabel: string;
    yearLabel: string;
    allYears: string;
    latestYear: string;
    before2020: string;
    filterHint: string;
    clearFilters: string;
    applyCatalog: string;
    webBulletinBtn: string;
    webBulletinLoading: string;
    webBulletinTitle: string;
    albumsFound: string;
    newAlbumsTitle: string;
    openAlbumHint: string;
    noAlbumsFound: string;
    songsFound: string;
    liveSongsTitle: string;
    syncSongsHint: string;
    noSongsFound: string;
    noSongsHint: string;
    colTrack: string;
    colTempo: string;
    colDuration: string;
    colActions: string;
    syncBtn: string;
    syncedBtn: string;
    saveInPlaylist: string;
    newPlaylistInput: string;
    createBtn: string;
    bpmAuto: string;
    loadingAlbumTracks: string;
    tracksCount: string;
  };
  metronome: {
    title: string;
    lockedTo: string;
    readyToSync: string;
    autoSyncOn: string;
    autoSyncOff: string;
    analyzingBeat: string;
    noPreviewNote: string;
    selectSongPrompt: string;
    generateCoverForTrack: string;
    currentTempo: string;
    startClick: string;
    stopClick: string;
    tap: string;
    meter: string;
    accentOn: string;
    accentOff: string;
    subdivision: string;
    tripletLabel: string;
    clickTimbre: string;
    timbreWood: string;
    timbreDigital: string;
    timbreRimshot: string;
    phaseAlign: string;
    alignBtn: string;
    volClick: string;
    volTrack: string;
    freeMetronome: string;
    manualTempo: string;
    tapTempoSource: string;
    stopShort: string;
    clickShort: string;
  };
  playlists: {
    title: string;
    subtitle: string;
    newPlaylistBtn: string;
    createTitle: string;
    cancel: string;
    namePlaceholder: string;
    descPlaceholder: string;
    savePlaylistBtn: string;
    emptyTitle: string;
    emptySubtitle: string;
    tracksLabel: string;
    updatedLabel: string;
    shareBtn: string;
    saveChangesBtn: string;
    emptyTracklist: string;
    syncBtn: string;
    syncedBtn: string;
    defaultName: string;
    defaultDesc: string;
    createdFromCatalogDesc: string;
  };
  covers: {
    title: string;
    subtitlePrefix: string;
    subtitleSuffix: string;
    adaptToSong: string;
    promptLabel: string;
    promptPlaceholder: string;
    resolutionLabel: string;
    res1k: string;
    res2k: string;
    res4k: string;
    formatLabel: string;
    presetsLabel: string;
    loadStyleHint: string;
    generateBtn: string;
    generatingBtn: string;
    galleryTitle: string;
    emptyTitle: string;
    emptySubtitle: string;
    downloadBtn: string;
    applyToSongBtn: string;
    appliedBtn: string;
    ratioCover: string;
    ratioBanner: string;
    ratioPoster: string;
    ratioStory: string;
  };
  chat: {
    title: string;
    activeRoleLabel: string;
    contextOn: string;
    contextOff: string;
    newChat: string;
    inputPlaceholder: string;
    sendBtn: string;
    webSearchToggle: string;
    thinkingLabel: string;
    youLabel: string;
    quickPrompts: string[];
    roles: Record<
      ChatModelId,
      { roleName: string; taskLabel: string; description: string }
    >;
  };
  share: {
    shareSongTitle: string;
    sharePlaylistTitle: string;
    tracksInPlaylist: string;
    copiedInstagram: string;
    copyInstagram: string;
    copied: string;
    copy: string;
    nativeShare: string;
    listeningText: string;
    playlistText: string;
  };
  pwa: {
    installApp: string;
    downloadChromeBtn: string;
    installIOS: string;
    iosTitle: string;
    iosStep1: string;
    iosStep2: string;
    iosGotIt: string;
    offlineBanner: string;
  };
  history: {
    title: string;
    subtitle: string;
    clearBtn: string;
    emptyTitle: string;
    emptySubtitle: string;
    statPlays: string;
    statUnique: string;
    statAvgBpm: string;
    statTopGenre: string;
    statTopArtist: string;
    bpmDistributionTitle: string;
    genreBreakdownTitle: string;
    recentTracksTitle: string;
    playsUnit: string;
    noDataYet: string;
  };
  download: {
    atmosBtn: string;
    atmosProcessing: string;
    atmosTitle: string;
    atmosUnavailable: string;
  };
  liquid: {
    title: string;
    subtitle: string;
    stageNoTrack: string;
    fullscreen: string;
    exitFullscreen: string;
    playBtn: string;
    pauseBtn: string;
    audioSectionTitle: string;
    audioReset: string;
    presetLabel: string;
    presets: {
      flat: string;
      atmos: string;
      'liquid-warmth': string;
      'club-bass': string;
      vocal: string;
      night: string;
    };
    bassLabel: string;
    midLabel: string;
    trebleLabel: string;
    spatialLabel: string;
    reverbLabel: string;
    speedLabel: string;
    qualityLabel: string;
    qualities: {
      'atmos-mp3': string;
      'cd-lossless': string;
      'hires-96': string;
      'master-192': string;
    };
    bitPerfectTitle: string;
    bitPerfectDesc: string;
    bitPerfectActive: string;
    autoEqLabel: string;
    eq15Title: string;
    automixTitle: string;
    automixDesc: string;
    crossfadeLabel: string;
    soundMonitorEyebrow: string;
    soundMonitorDesc: string;
    screenSectionTitle: string;
    visualReset: string;
    themeLabel: string;
    themes: {
      'studio-light': string;
      'obsidian-dark': string;
      'amoled-black': string;
      'liquid-glass': string;
      'dynamic-cover': string;
    };
    visualizerLabel: string;
    visualizers: {
      'liquid-waves': string;
      'orbital-glass': string;
      'spectrum-silk': string;
      'cover-aura': string;
    };
    glassBlurLabel: string;
    motionLabel: string;
    accentLabel: string;
    accentAutoCover: string;
    showCoverToggle: string;
    castTitle: string;
    castSubtitle: string;
    castConnectBtn: string;
    castDisconnectBtn: string;
    castSendTrackBtn: string;
    castSending: string;
    castConnectedTo: string;
    castReady: string;
    castUnavailable: string;
    castIframeNote: string;
    castOpenStandalone: string;
    castErrNoPreview: string;
    castErrSession: string;
    castErrMedia: string;
    castActiveTrackSent: string;
  };
}

const it: Translations = {
  nav: {
    releases: 'Uscite Live',
    catalog: 'Ricerca',
    playlists: 'Playlist',
    history: 'Statistiche',
    studio: 'Impostazioni',
    covers: 'Copertine',
    chat: 'Assistente AI',
    liquidCast: 'Liquid & Audio',
    refreshReleases: 'Aggiorna Uscite',
  },
  toolbar: {
    regionItaly: 'Italia',
    regionGlobal: 'Globale',
    languageLabel: 'Lingua',
    updatedAt: 'Aggiornato',
    nextUpdateIn: 'Prossimo agg.',
    loadingCatalog: 'Caricamento catalogo...',
  },
  catalog: {
    heroTitle: 'Nuove uscite musicali sempre aggiornate, sincronizzate al tuo metronomo.',
    heroSubtitle:
      'Ascolta i nuovi singoli e album in tempo reale, rileva il BPM esatto e suona perfettamente a tempo.',
    syncTopSong: 'Sincronizza #1',
    searchPlaceholder: 'Cerca qualsiasi canzone, artista o album nel catalogo globale...',
    advancedSearch: 'Ricerca Avanzata',
    searchBtn: 'Cerca',
    searchingBtn: 'Ricerca...',
    artistLabel: 'Artista',
    artistPlaceholder: 'Es. Marracash, Coldplay...',
    albumLabel: 'Album',
    albumPlaceholder: 'Titolo album...',
    genreLabel: 'Genere',
    yearLabel: 'Anno di uscita',
    allYears: 'Tutti gli anni',
    latestYear: '2026 (Ultime uscite)',
    before2020: 'Prima del 2020',
    filterHint: 'I filtri aggiornano la vista istantaneamente e interrogano il catalogo globale con Cerca.',
    clearFilters: 'Azzera filtri',
    applyCatalog: 'Applica su tutto il catalogo',
    webBulletinBtn: 'Ultime uscite Web',
    webBulletinLoading: 'Ricerca web...',
    webBulletinTitle: 'Bollettino Nuove Uscite Web',
    albumsFound: 'Album trovati',
    newAlbumsTitle: 'Nuovi Album e Uscite',
    openAlbumHint: 'Seleziona un album per aprire le tracce',
    noAlbumsFound: 'Nessun album corrisponde ai filtri selezionati.',
    songsFound: 'Canzoni trovate',
    liveSongsTitle: 'Canzoni in Tempo Reale',
    syncSongsHint: 'Clicca Sincronizza per agganciare il metronomo al brano',
    noSongsFound: 'Nessuna canzone trovata',
    noSongsHint: 'Prova a modificare i filtri di artista, album, genere o anno.',
    colTrack: 'Brano',
    colTempo: 'Tempo',
    colDuration: 'Durata',
    colActions: 'Azioni',
    syncBtn: 'Sincronizza',
    syncedBtn: 'Attivo',
    saveInPlaylist: 'Salva in playlist',
    newPlaylistInput: 'Nuova playlist...',
    createBtn: 'Crea',
    bpmAuto: 'Auto',
    loadingAlbumTracks: "Caricamento tracce dell'album...",
    tracksCount: 'tracce',
  },
  metronome: {
    title: 'Metronomo Sincronizzato',
    lockedTo: 'Agganciato a',
    readyToSync: 'Pronto per sincronizzazione brano',
    autoSyncOn: 'Auto-Sync Attivo',
    autoSyncOff: 'Auto-Sync Off',
    analyzingBeat: 'Analisi beat audio in corso...',
    noPreviewNote: 'Anteprima audio non disponibile: BPM sincronizzato dai metadati.',
    selectSongPrompt: 'Seleziona una canzone dal catalogo per rilevare il BPM e sincronizzare il click.',
    generateCoverForTrack: 'Genera copertina per questo brano',
    currentTempo: 'Tempo corrente',
    startClick: 'Avvia Click',
    stopClick: 'Ferma',
    tap: 'Tap',
    meter: 'Metro musicale',
    accentOn: 'Accento 1° attivo',
    accentOff: 'Accento disattivo',
    subdivision: 'Suddivisione',
    tripletLabel: 'Terz.',
    clickTimbre: 'Timbro Click',
    timbreWood: 'Legno',
    timbreDigital: 'Digitale',
    timbreRimshot: 'Rimshot',
    phaseAlign: 'Allineamento fase',
    alignBtn: 'Allinea',
    volClick: 'Click',
    volTrack: 'Brano',
    freeMetronome: 'Metronomo libero',
    manualTempo: 'Tempo manuale',
    tapTempoSource: 'Tap Tempo manuale',
    stopShort: 'Stop',
    clickShort: 'Click',
  },
  playlists: {
    title: 'Le Tue Playlist',
    subtitle: 'Organizza i brani per BPM o scaletta, salvali in locale e condividili sui social.',
    newPlaylistBtn: 'Nuova Playlist',
    createTitle: 'Crea nuova playlist',
    cancel: 'Annulla',
    namePlaceholder: 'Nome playlist (es. Prove Band 120 BPM)',
    descPlaceholder: 'Descrizione breve (opzionale)',
    savePlaylistBtn: 'Salva Playlist',
    emptyTitle: 'Nessuna playlist salvata',
    emptySubtitle: 'Crea la tua prima playlist o aggiungi brani dal catalogo.',
    tracksLabel: 'brani',
    updatedLabel: 'Aggiornata',
    shareBtn: 'Condividi',
    saveChangesBtn: 'Salva modifiche',
    emptyTracklist: 'Playlist vuota. Usa il pulsante + su qualsiasi brano per aggiungerlo qui.',
    syncBtn: 'Sincronizza',
    syncedBtn: 'Attivo',
    defaultName: 'Prove & Studio BPM',
    defaultDesc: 'Raccolta personale per esercitarsi a tempo con il metronomo.',
    createdFromCatalogDesc: 'Playlist creata dal catalogo',
  },
  covers: {
    title: 'Studio Copertine AI',
    subtitlePrefix: 'Genera artwork ufficiali con',
    subtitleSuffix: 'scegliendo la risoluzione finale fino a 4K.',
    adaptToSong: 'Adatta al brano attivo',
    promptLabel: 'Direzione creativa e soggetto della copertina',
    promptPlaceholder: 'Descrivi atmosfera, materiali, luce, colori e stile...',
    resolutionLabel: 'Risoluzione Output (1K / 2K / 4K)',
    res1k: '1024px · Rapido',
    res2k: '2048px · Stampa HD',
    res4k: '4096px · Master Ultra',
    formatLabel: 'Formato Copertina',
    presetsLabel: 'Riferimenti stilistici rapidi',
    loadStyleHint: 'Carica stile nel prompt',
    generateBtn: 'Genera Copertina',
    generatingBtn: 'Generazione in corso...',
    galleryTitle: 'Galleria Copertine Generate',
    emptyTitle: 'Nessuna copertina ancora generata',
    emptySubtitle: 'Scegli la risoluzione 1K, 2K o 4K qui sopra e crea la tua copertina.',
    downloadBtn: 'Scarica',
    applyToSongBtn: 'Usa su brano',
    appliedBtn: 'Applicata',
    ratioCover: '1:1 Copertina',
    ratioBanner: '16:9 Banner',
    ratioPoster: '3:4 Poster',
    ratioStory: '9:16 Story',
  },
  chat: {
    title: 'Assistente Musicale',
    activeRoleLabel: 'Ruolo attivo',
    contextOn: 'Contesto',
    contextOff: 'Contesto brano off',
    newChat: 'Nuova chat',
    inputPlaceholder: 'Scrivi una domanda su nuove uscite, BPM, armonia o esercizi...',
    sendBtn: 'Invia',
    webSearchToggle: 'Usa Google Search in tempo reale per nuove uscite e classifiche',
    thinkingLabel: 'Elaborazione in corso...',
    youLabel: 'Tu',
    quickPrompts: [
      'Analizza il groove e suggerisci esercizi al metronomo per questo brano',
      'Quali album e singoli importanti sono usciti questa settimana?',
      'Suggerisci 4 brani con BPM simile per creare una transizione fluida',
      'Spiegami come studiare una poliritmia 3 contro 4 sul metronomo',
    ],
    roles: {
      'gemini-4-hydrogen': {
        roleName: 'Curatore Nuove Uscite',
        taskLabel: 'Generale & Web Search',
        description: 'Scoperta album recenti, artisti emergenti e collegamenti sonori.',
      },
      'gemini-4-carbon': {
        roleName: 'Direttore Musicale & Teoria',
        taskLabel: 'Ragionamento Profondo',
        description: 'Analisi armonica, poliritmia, tempi composti e struttura brani.',
      },
      'gemini-4-argon': {
        roleName: 'Produttore & Live Set',
        taskLabel: 'Task Complessi',
        description: 'Transizioni BPM tra brani, arrangiamento, mix e sound design.',
      },
      'gemini-3.1-flash-lite': {
        roleName: 'Assistente Rapido Ritmo',
        taskLabel: 'Risposte Istantanee',
        description: 'Esercizi lampo sul metronomo, suddivisioni e riferimenti rapidi.',
      },
    },
  },
  share: {
    shareSongTitle: 'Condividi Brano',
    sharePlaylistTitle: 'Condividi Playlist',
    tracksInPlaylist: 'brani nella playlist',
    copiedInstagram: 'Copiata per Instagram!',
    copyInstagram: 'Copia per Instagram',
    copied: 'Copiato',
    copy: 'Copia',
    nativeShare: 'Condividi dal dispositivo',
    listeningText: 'Sto ascoltando e sincronizzando',
    playlistText: 'Ascolta la mia playlist',
  },
  pwa: {
    installApp: 'Installa App',
    downloadChromeBtn: 'Scarica da Chrome',
    installIOS: 'Installa su iOS',
    iosTitle: 'Installa su iPhone / iPad',
    iosStep1: 'Tocca il pulsante Condividi nella barra di Safari.',
    iosStep2: 'Scorri e seleziona Aggiungi alla schermata Home.',
    iosGotIt: 'Ho capito',
    offlineBanner: 'Modalità offline — Metronomo e dati in cache attivi',
  },
  history: {
    title: 'Cronologia e Statistiche',
    subtitle: 'Tutte le canzoni ascoltate e sincronizzate, con andamento BPM e generi preferiti.',
    clearBtn: 'Svuota cronologia',
    emptyTitle: 'Nessun ascolto registrato',
    emptySubtitle: 'Sincronizza o ascolta un brano dal catalogo per iniziare a raccogliere cronologia e statistiche.',
    statPlays: 'Ascolti Totali',
    statUnique: 'Brani Unici',
    statAvgBpm: 'BPM Medio',
    statTopGenre: 'Genere Principale',
    statTopArtist: 'Artista Più Ascoltato',
    bpmDistributionTitle: 'Distribuzione BPM Ascoltati',
    genreBreakdownTitle: 'Generi Principali',
    recentTracksTitle: 'Cronologia Canzoni Ascoltate',
    playsUnit: 'riprod.',
    noDataYet: 'Nessun dato',
  },
  download: {
    atmosBtn: 'Dolby Atmos',
    atmosProcessing: 'Ottimizzo...',
    atmosTitle: 'Scarica Dolby Atmos Spatial (MP3 leggero)',
    atmosUnavailable: 'Anteprima non disponibile per il download',
  },
  liquid: {
    title: 'Liquid Studio, Audio FX & Google Cast',
    subtitle:
      'Personalizza equalizzazione, spazialità 3D, visualizzatore Liquid Glass, temi schermo e trasmetti su Google Cast.',
    stageNoTrack: 'Seleziona un brano o avvia il metronomo per animare lo stage',
    fullscreen: 'Schermo intero TV',
    exitFullscreen: 'Esci da schermo intero',
    playBtn: 'Play',
    pauseBtn: 'Pausa',
    audioSectionTitle: 'Personalizzazione Audio Live',
    audioReset: 'Ripristina Audio',
    presetLabel: 'Profilo Sonoro',
    presets: {
      flat: 'Studio Neutro',
      atmos: 'Dolby Atmos 3D',
      'liquid-warmth': 'Liquid Warmth',
      'club-bass': 'Club & Bassi',
      vocal: 'Voce & Acustico',
      night: 'Modalità Notte',
    },
    bassLabel: 'Bassi (85 Hz)',
    midLabel: 'Medi (1 kHz)',
    trebleLabel: 'Alti / Aria (8.2 kHz)',
    spatialLabel: 'Ampiezza Spaziale 3D',
    reverbLabel: 'Riverbero Liquid Room',
    speedLabel: 'Velocità Riproduzione',
    qualityLabel: 'Qualità Audio & Output',
    qualities: {
      'atmos-mp3': 'Dolby Atmos Spatial (MP3 leggero)',
      'cd-lossless': 'CD Lossless FLAC (16-bit / 44.1 kHz)',
      'hires-96': 'Hi-Res Lossless (24-bit / 96 kHz)',
      'master-192': 'Studio Master (24-bit / 192 kHz)',
    },
    bitPerfectTitle: 'Output Bit-Perfect / Bypass DAC Diretto',
    bitPerfectDesc: 'Bypassa compressore ed EQ per un percorso del segnale puro.',
    bitPerfectActive: 'Direct Bypass Attivo',
    autoEqLabel: 'Profilo Cuffie AutoEQ',
    eq15Title: 'Equalizzatore Parametrico 15 Bande (25 Hz – 16 kHz)',
    automixTitle: 'Automix & Dissolvenza Incrociata',
    automixDesc: 'Transizioni morbide automatiche al cambio brano.',
    crossfadeLabel: 'Crossfade',
    soundMonitorEyebrow: 'THE SOUND OF MORE',
    soundMonitorDesc: 'Catena audio live & campionamento hardware',
    screenSectionTitle: 'Personalizzazione Schermate & Liquid Glass',
    visualReset: 'Ripristina Schermata',
    themeLabel: 'Tema Schermate App',
    themes: {
      'studio-light': 'Studio Chiaro',
      'obsidian-dark': 'Obsidian Scuro',
      'amoled-black': 'AMOLED Nero Puro',
      'liquid-glass': 'Liquid Glass',
      'dynamic-cover': 'Colori Copertina',
    },
    visualizerLabel: 'Stile Visualizzatore',
    visualizers: {
      'liquid-waves': 'Onde Liquide',
      'orbital-glass': 'Sfere Orbitali',
      'spectrum-silk': 'Spettro Seta',
      'cover-aura': 'Aura Copertina',
    },
    glassBlurLabel: 'Sfocatura Vetro',
    motionLabel: 'Reattività Liquida',
    accentLabel: 'Colore Accento',
    accentAutoCover: 'Auto da Copertina',
    showCoverToggle: 'Mostra copertina sullo stage Liquid',
    castTitle: 'Connessione Google Cast / Chromecast',
    castSubtitle:
      'Invia il flusso audio e la copertina del brano attivo a TV, Google Nest o Chromecast sulla tua rete Wi-Fi.',
    castConnectBtn: 'Connetti a Google Cast',
    castDisconnectBtn: 'Disconnetti Cast',
    castSendTrackBtn: 'Trasmetti Brano Attivo',
    castSending: 'Invio al dispositivo...',
    castConnectedTo: 'Connesso a',
    castReady: 'Pronto per la ricerca dispositivi Cast',
    castUnavailable: 'Cast non rilevato in questo frame — usa Chrome o apri la app standalone',
    castIframeNote:
      'In anteprima incorporata (iframe) il browser può limitare il popup Chromecast: apri la app in una nuova scheda Chrome per trasmettere.',
    castOpenStandalone: 'Apri app in scheda standalone',
    castErrNoPreview: 'Seleziona un brano con anteprima audio prima di trasmettere.',
    castErrSession: 'Nessun dispositivo Google Cast selezionato o disponibile.',
    castErrMedia: 'Impossibile avviare la riproduzione sul dispositivo Cast.',
    castActiveTrackSent: 'In riproduzione su Cast',
  },
};

const en: Translations = {
  nav: {
    releases: 'Live Releases',
    catalog: 'Search',
    playlists: 'Playlists',
    history: 'Stats',
    studio: 'Settings',
    covers: 'Covers',
    chat: 'AI Assistant',
    liquidCast: 'Liquid & Audio',
    refreshReleases: 'Refresh Feed',
  },
  toolbar: {
    regionItaly: 'Italy',
    regionGlobal: 'Global',
    languageLabel: 'Language',
    updatedAt: 'Updated',
    nextUpdateIn: 'Next sync',
    loadingCatalog: 'Loading catalog...',
  },
  catalog: {
    heroTitle: 'Live new music releases, synced directly to your precision metronome.',
    heroSubtitle:
      'Preview the latest singles and albums in real time, detect exact BPM, and practice in lockstep.',
    syncTopSong: 'Sync #1',
    searchPlaceholder: 'Search any song, artist, or album across the global catalog...',
    advancedSearch: 'Advanced Search',
    searchBtn: 'Search',
    searchingBtn: 'Searching...',
    artistLabel: 'Artist',
    artistPlaceholder: 'e.g. Coldplay, Måneskin...',
    albumLabel: 'Album',
    albumPlaceholder: 'Album title...',
    genreLabel: 'Genre',
    yearLabel: 'Release Year',
    allYears: 'All years',
    latestYear: '2026 (Latest)',
    before2020: 'Before 2020',
    filterHint: 'Filters update the view instantly and query the global catalog on Search.',
    clearFilters: 'Reset filters',
    applyCatalog: 'Search full catalog',
    webBulletinBtn: 'Web Releases Bulletin',
    webBulletinLoading: 'Searching web...',
    webBulletinTitle: 'Latest Web Music Releases',
    albumsFound: 'Albums found',
    newAlbumsTitle: 'New Albums & Releases',
    openAlbumHint: 'Click an album to view full tracklist',
    noAlbumsFound: 'No albums match your active filters.',
    songsFound: 'Songs found',
    liveSongsTitle: 'Live Songs & Singles',
    syncSongsHint: 'Click Sync to lock the metronome to the track',
    noSongsFound: 'No songs found',
    noSongsHint: 'Try adjusting your artist, album, genre, or year filters.',
    colTrack: 'Track',
    colTempo: 'Tempo',
    colDuration: 'Time',
    colActions: 'Actions',
    syncBtn: 'Sync',
    syncedBtn: 'Synced',
    saveInPlaylist: 'Save to playlist',
    newPlaylistInput: 'New playlist...',
    createBtn: 'Create',
    bpmAuto: 'Auto',
    loadingAlbumTracks: 'Loading album tracks...',
    tracksCount: 'tracks',
  },
  metronome: {
    title: 'Synced Metronome',
    lockedTo: 'Locked to',
    readyToSync: 'Ready for track sync',
    autoSyncOn: 'Auto-Sync On',
    autoSyncOff: 'Auto-Sync Off',
    analyzingBeat: 'Analyzing audio beat...',
    noPreviewNote: 'Audio preview unavailable: BPM synced from track metadata.',
    selectSongPrompt: 'Select any song from the catalog to detect BPM and lock the click.',
    generateCoverForTrack: 'Generate cover for this song',
    currentTempo: 'Current tempo',
    startClick: 'Start Click',
    stopClick: 'Stop',
    tap: 'Tap',
    meter: 'Time signature',
    accentOn: 'Beat 1 accent on',
    accentOff: 'Accent off',
    subdivision: 'Subdivision',
    tripletLabel: 'Trip.',
    clickTimbre: 'Click Sound',
    timbreWood: 'Wood',
    timbreDigital: 'Digital',
    timbreRimshot: 'Rimshot',
    phaseAlign: 'Phase alignment',
    alignBtn: 'Align',
    volClick: 'Click',
    volTrack: 'Track',
    freeMetronome: 'Free metronome',
    manualTempo: 'Manual tempo',
    tapTempoSource: 'Manual Tap Tempo',
    stopShort: 'Stop',
    clickShort: 'Click',
  },
  playlists: {
    title: 'Your Playlists',
    subtitle: 'Organize songs by BPM or setlist, save locally, and share on social media.',
    newPlaylistBtn: 'New Playlist',
    createTitle: 'Create new playlist',
    cancel: 'Cancel',
    namePlaceholder: 'Playlist name (e.g. Band Rehearsal 120 BPM)',
    descPlaceholder: 'Short description (optional)',
    savePlaylistBtn: 'Save Playlist',
    emptyTitle: 'No saved playlists yet',
    emptySubtitle: 'Create your first playlist or add songs directly from the catalog.',
    tracksLabel: 'tracks',
    updatedLabel: 'Updated',
    shareBtn: 'Share',
    saveChangesBtn: 'Save changes',
    emptyTracklist: 'Empty playlist. Use the + button on any song in the catalog to add tracks.',
    syncBtn: 'Sync',
    syncedBtn: 'Synced',
    defaultName: 'Studio & BPM Practice',
    defaultDesc: 'Personal collection for practicing in time with the metronome.',
    createdFromCatalogDesc: 'Playlist created from catalog',
  },
  covers: {
    title: 'AI Cover Studio',
    subtitlePrefix: 'Generate bespoke album artwork with',
    subtitleSuffix: 'and choose output resolution up to 4K.',
    adaptToSong: 'Adapt to active track',
    promptLabel: 'Creative direction and artwork subject',
    promptPlaceholder: 'Describe mood, materials, lighting, colors, and style...',
    resolutionLabel: 'Output Resolution (1K / 2K / 4K)',
    res1k: '1024px · Fast',
    res2k: '2048px · HD Print',
    res4k: '4096px · Ultra Master',
    formatLabel: 'Aspect Ratio',
    presetsLabel: 'Quick style presets',
    loadStyleHint: 'Load style into prompt',
    generateBtn: 'Generate Cover',
    generatingBtn: 'Generating...',
    galleryTitle: 'Generated Covers Gallery',
    emptyTitle: 'No covers generated yet',
    emptySubtitle: 'Pick 1K, 2K, or 4K resolution above and create your first cover.',
    downloadBtn: 'Download',
    applyToSongBtn: 'Use on track',
    appliedBtn: 'Applied',
    ratioCover: '1:1 Cover',
    ratioBanner: '16:9 Banner',
    ratioPoster: '3:4 Poster',
    ratioStory: '9:16 Story',
  },
  chat: {
    title: 'Multi-Turn Music Assistant',
    activeRoleLabel: 'Active role',
    contextOn: 'Context',
    contextOff: 'Track context off',
    newChat: 'New chat',
    inputPlaceholder: 'Ask about new releases, BPM, harmony, or practice drills...',
    sendBtn: 'Send',
    webSearchToggle: 'Use live Google Search for new releases and charts',
    thinkingLabel: 'Thinking...',
    youLabel: 'You',
    quickPrompts: [
      'Analyze the groove and suggest metronome drills for this song',
      'What major albums and singles were released this week?',
      'Suggest 4 songs with similar BPM for a smooth transition',
      'Explain how to practice a 3-against-4 polyrhythm with a metronome',
    ],
    roles: {
      'gemini-4-hydrogen': {
        roleName: 'New Releases Curator',
        taskLabel: 'General & Web Search',
        description: 'Latest albums, emerging artists, and sonic recommendations.',
      },
      'gemini-4-carbon': {
        roleName: 'Music Director & Theory',
        taskLabel: 'Deep Reasoning',
        description: 'Harmonic analysis, polyrhythms, odd meters, and arrangement.',
      },
      'gemini-4-argon': {
        roleName: 'Producer & Live Set',
        taskLabel: 'Complex Tasks',
        description: 'BPM transitions, mixing chains, sidechain, and live setlists.',
      },
      'gemini-3.1-flash-lite': {
        roleName: 'Fast Rhythm Coach',
        taskLabel: 'Instant Answers',
        description: 'Quick tempo references, subdivisions, and metronome drills.',
      },
    },
  },
  share: {
    shareSongTitle: 'Share Song',
    sharePlaylistTitle: 'Share Playlist',
    tracksInPlaylist: 'tracks in playlist',
    copiedInstagram: 'Copied for Instagram!',
    copyInstagram: 'Copy for Instagram',
    copied: 'Copied',
    copy: 'Copy',
    nativeShare: 'Share from device',
    listeningText: 'Listening and syncing',
    playlistText: 'Listen to my playlist',
  },
  pwa: {
    installApp: 'Install App',
    downloadChromeBtn: 'Get on Chrome',
    installIOS: 'Install on iOS',
    iosTitle: 'Install on iPhone / iPad',
    iosStep1: 'Tap the Share button in Safari toolbar.',
    iosStep2: 'Scroll down and tap Add to Home Screen.',
    iosGotIt: 'Got it',
    offlineBanner: 'Offline mode — Metronome and cached data active',
  },
  history: {
    title: 'Listening History & Stats',
    subtitle: 'All listened and synced songs, with real-time BPM trends and top genres.',
    clearBtn: 'Clear history',
    emptyTitle: 'No listening history yet',
    emptySubtitle: 'Play or sync any song from the catalog to start tracking your listening stats.',
    statPlays: 'Total Plays',
    statUnique: 'Unique Tracks',
    statAvgBpm: 'Average BPM',
    statTopGenre: 'Top Genre',
    statTopArtist: 'Top Artist',
    bpmDistributionTitle: 'BPM Distribution',
    genreBreakdownTitle: 'Top Genres',
    recentTracksTitle: 'Recently Listened Songs',
    playsUnit: 'plays',
    noDataYet: 'No data',
  },
  download: {
    atmosBtn: 'Dolby Atmos',
    atmosProcessing: 'Optimizing...',
    atmosTitle: 'Download Dolby Atmos Spatial (Light MP3)',
    atmosUnavailable: 'Preview audio unavailable for download',
  },
  liquid: {
    title: 'Liquid Studio, Audio FX & Google Cast',
    subtitle:
      'Customize live EQ, 3D spatial width, Liquid Glass visualizer, full-app screen themes, and stream via Google Cast.',
    stageNoTrack: 'Select a song or start the metronome to animate the stage',
    fullscreen: 'TV Fullscreen',
    exitFullscreen: 'Exit fullscreen',
    playBtn: 'Play',
    pauseBtn: 'Pause',
    audioSectionTitle: 'Live Audio Customization',
    audioReset: 'Reset Audio',
    presetLabel: 'Sound Profile',
    presets: {
      flat: 'Studio Flat',
      atmos: 'Dolby Atmos 3D',
      'liquid-warmth': 'Liquid Warmth',
      'club-bass': 'Club & Bass',
      vocal: 'Vocal & Acoustic',
      night: 'Night Mode',
    },
    bassLabel: 'Bass (85 Hz)',
    midLabel: 'Midrange (1 kHz)',
    trebleLabel: 'Treble / Air (8.2 kHz)',
    spatialLabel: '3D Spatial Width',
    reverbLabel: 'Liquid Room Reverb',
    speedLabel: 'Playback Speed',
    qualityLabel: 'Audio Quality & Output',
    qualities: {
      'atmos-mp3': 'Dolby Atmos Spatial (Light MP3)',
      'cd-lossless': 'CD Lossless FLAC (16-bit / 44.1 kHz)',
      'hires-96': 'Hi-Res Lossless (24-bit / 96 kHz)',
      'master-192': 'Studio Master (24-bit / 192 kHz)',
    },
    bitPerfectTitle: 'Bit-Perfect Output / Direct DAC Bypass',
    bitPerfectDesc: 'Bypasses EQ and limiter for a clean bit-transparent signal.',
    bitPerfectActive: 'Direct Bypass On',
    autoEqLabel: 'AutoEQ Headphone Target',
    eq15Title: '15-Band Parametric Equalizer (25 Hz – 16 kHz)',
    automixTitle: 'Automix & Smooth Crossfade',
    automixDesc: 'Smooth volume transitions when switching tracks.',
    crossfadeLabel: 'Crossfade',
    soundMonitorEyebrow: 'THE SOUND OF MORE',
    soundMonitorDesc: 'Live audio chain & hardware sampling rate',
    screenSectionTitle: 'Screen & Liquid Glass Graphics',
    visualReset: 'Reset Visuals',
    themeLabel: 'App Screen Theme',
    themes: {
      'studio-light': 'Crisp Studio',
      'obsidian-dark': 'Obsidian Dark',
      'amoled-black': 'AMOLED Pure Black',
      'liquid-glass': 'Liquid Glass',
      'dynamic-cover': 'Dynamic Cover',
    },
    visualizerLabel: 'Visualizer Style',
    visualizers: {
      'liquid-waves': 'Liquid Waves',
      'orbital-glass': 'Orbital Glass',
      'spectrum-silk': 'Spectrum Silk',
      'cover-aura': 'Cover Aura',
    },
    glassBlurLabel: 'Glass Blur',
    motionLabel: 'Liquid Motion',
    accentLabel: 'Accent Color',
    accentAutoCover: 'Auto from Cover',
    showCoverToggle: 'Show album artwork on Liquid stage',
    castTitle: 'Google Cast / Chromecast Connection',
    castSubtitle:
      'Stream audio and cover metadata from the active track directly to Chromecast, Google TV, or Nest speakers.',
    castConnectBtn: 'Connect Google Cast',
    castDisconnectBtn: 'Disconnect Cast',
    castSendTrackBtn: 'Cast Active Song',
    castSending: 'Sending to device...',
    castConnectedTo: 'Connected to',
    castReady: 'Ready to discover Cast devices',
    castUnavailable: 'Cast restricted in this frame — use Chrome or standalone PWA',
    castIframeNote:
      'Browsers restrict the Chromecast picker inside embedded iframes. Open the app in a standalone Chrome tab to cast.',
    castOpenStandalone: 'Open standalone tab',
    castErrNoPreview: 'Select a song with an audio preview before casting.',
    castErrSession: 'No Google Cast device selected or available.',
    castErrMedia: 'Could not start playback on the Cast receiver.',
    castActiveTrackSent: 'Playing on Cast',
  },
};

const es: Translations = {
  nav: {
    releases: 'Estrenos Live',
    catalog: 'Búsqueda',
    playlists: 'Playlists',
    history: 'Estadísticas',
    studio: 'Ajustes',
    covers: 'Portadas',
    chat: 'Asistente IA',
    liquidCast: 'Liquid & Audio',
    refreshReleases: 'Actualizar',
  },
  toolbar: {
    regionItaly: 'Italia',
    regionGlobal: 'Global',
    languageLabel: 'Idioma',
    updatedAt: 'Actualizado',
    nextUpdateIn: 'Próx. act.',
    loadingCatalog: 'Cargando catálogo...',
  },
  catalog: {
    heroTitle: 'Nuevos lanzamientos musicales al día, sincronizados con tu metrónomo.',
    heroSubtitle:
      'Escucha los últimos sencillos y álbumes en tiempo real, detecta el BPM exacto y toca a tiempo.',
    syncTopSong: 'Sincronizar #1',
    searchPlaceholder: 'Busca cualquier canción, artista o álbum en el catálogo global...',
    advancedSearch: 'Búsqueda Avanzada',
    searchBtn: 'Buscar',
    searchingBtn: 'Buscando...',
    artistLabel: 'Artista',
    artistPlaceholder: 'Ej. Rosalía, Coldplay...',
    albumLabel: 'Álbum',
    albumPlaceholder: 'Título del álbum...',
    genreLabel: 'Género',
    yearLabel: 'Año de lanzamiento',
    allYears: 'Todos los años',
    latestYear: '2026 (Últimos)',
    before2020: 'Antes de 2020',
    filterHint: 'Los filtros actualizan la vista al instante y consultan el catálogo global al buscar.',
    clearFilters: 'Limpiar filtros',
    applyCatalog: 'Buscar en todo el catálogo',
    webBulletinBtn: 'Novedades Web',
    webBulletinLoading: 'Buscando...',
    webBulletinTitle: 'Boletín de Estrenos Web',
    albumsFound: 'Álbumes encontrados',
    newAlbumsTitle: 'Nuevos Álbumes y Estrenos',
    openAlbumHint: 'Haz clic en un álbum para ver las pistas',
    noAlbumsFound: 'Ningún álbum coincide con los filtros.',
    songsFound: 'Canciones encontradas',
    liveSongsTitle: 'Canciones en Tiempo Real',
    syncSongsHint: 'Pulsa Sincronizar para acoplar el metrónomo',
    noSongsFound: 'No se encontraron canciones',
    noSongsHint: 'Prueba cambiando los filtros de artista, álbum, género o año.',
    colTrack: 'Canción',
    colTempo: 'Tempo',
    colDuration: 'Duración',
    colActions: 'Acciones',
    syncBtn: 'Sincronizar',
    syncedBtn: 'Activo',
    saveInPlaylist: 'Guardar en playlist',
    newPlaylistInput: 'Nueva playlist...',
    createBtn: 'Crear',
    bpmAuto: 'Auto',
    loadingAlbumTracks: 'Cargando pistas del álbum...',
    tracksCount: 'pistas',
  },
  metronome: {
    title: 'Metrónomo Sincronizado',
    lockedTo: 'Sincronizado con',
    readyToSync: 'Listo para sincronizar',
    autoSyncOn: 'Auto-Sync Activo',
    autoSyncOff: 'Auto-Sync Off',
    analyzingBeat: 'Analizando ritmo del audio...',
    noPreviewNote: 'Vista previa no disponible: BPM sincronizado por metadatos.',
    selectSongPrompt: 'Elige cualquier canción para detectar su BPM y sincronizar el clic.',
    generateCoverForTrack: 'Generar portada para este tema',
    currentTempo: 'Tempo actual',
    startClick: 'Iniciar Clic',
    stopClick: 'Detener',
    tap: 'Tap',
    meter: 'Compás',
    accentOn: 'Acento en 1 activo',
    accentOff: 'Acento desactivado',
    subdivision: 'Subdivisión',
    tripletLabel: 'Tres.',
    clickTimbre: 'Sonido Clic',
    timbreWood: 'Madera',
    timbreDigital: 'Digital',
    timbreRimshot: 'Aro',
    phaseAlign: 'Ajuste de fase',
    alignBtn: 'Alinear',
    volClick: 'Clic',
    volTrack: 'Tema',
    freeMetronome: 'Metrónomo libre',
    manualTempo: 'Tempo manual',
    tapTempoSource: 'Tap Tempo manual',
    stopShort: 'Parar',
    clickShort: 'Clic',
  },
  playlists: {
    title: 'Tus Playlists',
    subtitle: 'Organiza temas por BPM o repertorio, guárdalos localmente y compártelos.',
    newPlaylistBtn: 'Nueva Playlist',
    createTitle: 'Crear nueva playlist',
    cancel: 'Cancelar',
    namePlaceholder: 'Nombre (ej. Ensayo Banda 120 BPM)',
    descPlaceholder: 'Descripción breve (opcional)',
    savePlaylistBtn: 'Guardar Playlist',
    emptyTitle: 'No hay playlists guardadas',
    emptySubtitle: 'Crea tu primera playlist o añade canciones desde el catálogo.',
    tracksLabel: 'pistas',
    updatedLabel: 'Actualizada',
    shareBtn: 'Compartir',
    saveChangesBtn: 'Guardar cambios',
    emptyTracklist: 'Playlist vacía. Usa el botón + en cualquier canción para añadirla.',
    syncBtn: 'Sincronizar',
    syncedBtn: 'Activo',
    defaultName: 'Ensayo & Studio BPM',
    defaultDesc: 'Colección personal para practicar a tiempo con el metrónomo.',
    createdFromCatalogDesc: 'Playlist creada desde el catálogo',
  },
  covers: {
    title: 'Estudio de Portadas IA',
    subtitlePrefix: 'Crea portadas profesionales con',
    subtitleSuffix: 'eligiendo resolución hasta 4K.',
    adaptToSong: 'Adaptar al tema activo',
    promptLabel: 'Dirección creativa y concepto de la portada',
    promptPlaceholder: 'Describe atmósfera, materiales, luz, colores y estilo...',
    resolutionLabel: 'Resolución de Salida (1K / 2K / 4K)',
    res1k: '1024px · Rápido',
    res2k: '2048px · Impresión HD',
    res4k: '4096px · Master Ultra',
    formatLabel: 'Formato',
    presetsLabel: 'Referencias rápidas de estilo',
    loadStyleHint: 'Cargar estilo',
    generateBtn: 'Generar Portada',
    generatingBtn: 'Generando...',
    galleryTitle: 'Galería de Portadas',
    emptyTitle: 'Aún no hay portadas generadas',
    emptySubtitle: 'Elige 1K, 2K o 4K arriba y crea tu primera portada.',
    downloadBtn: 'Descargar',
    applyToSongBtn: 'Usar en tema',
    appliedBtn: 'Aplicada',
    ratioCover: '1:1 Portada',
    ratioBanner: '16:9 Banner',
    ratioPoster: '3:4 Póster',
    ratioStory: '9:16 Story',
  },
  chat: {
    title: 'Asistente Musical IA',
    activeRoleLabel: 'Rol activo',
    contextOn: 'Contexto',
    contextOff: 'Sin contexto de tema',
    newChat: 'Nuevo chat',
    inputPlaceholder: 'Pregunta sobre estrenos, BPM, armonía o ejercicios...',
    sendBtn: 'Enviar',
    webSearchToggle: 'Usar Google Search en vivo para estrenos y listas',
    thinkingLabel: 'Pensando...',
    youLabel: 'Tú',
    quickPrompts: [
      'Analiza el groove y sugiere ejercicios de metrónomo para este tema',
      '¿Qué álbumes y sencillos destacados salieron esta semana?',
      'Sugiere 4 canciones con BPM similar para una transición fluida',
      'Explícame cómo estudiar un polirritmo 3 contra 4 con metrónomo',
    ],
    roles: {
      'gemini-4-hydrogen': {
        roleName: 'Curador de Estrenos',
        taskLabel: 'General & Web Search',
        description: 'Nuevos álbumes, artistas emergentes y recomendaciones.',
      },
      'gemini-4-carbon': {
        roleName: 'Director Musical & Teoría',
        taskLabel: 'Razonamiento Profundo',
        description: 'Armonía, polirritmia, compases irregulares y arreglos.',
      },
      'gemini-4-argon': {
        roleName: 'Productor & Live Set',
        taskLabel: 'Tareas Complejas',
        description: 'Transiciones BPM, mezcla, sidechain y repertorios en vivo.',
      },
      'gemini-3.1-flash-lite': {
        roleName: 'Asistente Rápido Ritmo',
        taskLabel: 'Respuestas Rápidas',
        description: 'Referencias de BPM, subdivisiones y ejercicios inmediatos.',
      },
    },
  },
  share: {
    shareSongTitle: 'Compartir Canción',
    sharePlaylistTitle: 'Compartir Playlist',
    tracksInPlaylist: 'pistas en la playlist',
    copiedInstagram: '¡Copiado para Instagram!',
    copyInstagram: 'Copiar para Instagram',
    copied: 'Copiado',
    copy: 'Copiar',
    nativeShare: 'Compartir desde el dispositivo',
    listeningText: 'Escuchando y sincronizando',
    playlistText: 'Escucha mi playlist',
  },
  pwa: {
    installApp: 'Instalar App',
    downloadChromeBtn: 'Instalar con Chrome',
    installIOS: 'Instalar en iOS',
    iosTitle: 'Instalar en iPhone / iPad',
    iosStep1: 'Toca el botón Compartir en la barra de Safari.',
    iosStep2: 'Desliza y selecciona Añadir a pantalla de inicio.',
    iosGotIt: 'Entendido',
    offlineBanner: 'Modo sin conexión — Metrónomo y caché activos',
  },
  history: {
    title: 'Historial y Estadísticas',
    subtitle: 'Todas las canciones escuchadas y sincronizadas, con tendencias de BPM y géneros.',
    clearBtn: 'Borrar historial',
    emptyTitle: 'Sin historial de escucha',
    emptySubtitle: 'Reproduce o sincroniza cualquier canción del catálogo para ver tus estadísticas.',
    statPlays: 'Reproducciones',
    statUnique: 'Temas Únicos',
    statAvgBpm: 'BPM Promedio',
    statTopGenre: 'Género Principal',
    statTopArtist: 'Artista Más Escuchado',
    bpmDistributionTitle: 'Distribución de BPM',
    genreBreakdownTitle: 'Géneros Principales',
    recentTracksTitle: 'Canciones Escuchadas',
    playsUnit: 'reprod.',
    noDataYet: 'Sin datos',
  },
  download: {
    atmosBtn: 'Dolby Atmos',
    atmosProcessing: 'Optimizando...',
    atmosTitle: 'Descargar Dolby Atmos Spatial (MP3 ligero)',
    atmosUnavailable: 'Vista previa no disponible para descarga',
  },
  liquid: {
    title: 'Estudio Liquid, Audio FX y Google Cast',
    subtitle:
      'Personaliza ecualizador en vivo, amplitud espacial 3D, visualizador Liquid Glass, temas de pantalla y envía a Google Cast.',
    stageNoTrack: 'Elige una canción o inicia el metrónomo para animar el escenario',
    fullscreen: 'Pantalla completa TV',
    exitFullscreen: 'Salir de pantalla completa',
    playBtn: 'Play',
    pauseBtn: 'Pausa',
    audioSectionTitle: 'Personalización de Audio en Vivo',
    audioReset: 'Restablecer Audio',
    presetLabel: 'Perfil Sonoro',
    presets: {
      flat: 'Estudio Neutro',
      atmos: 'Dolby Atmos 3D',
      'liquid-warmth': 'Liquid Warmth',
      'club-bass': 'Club & Graves',
      vocal: 'Voz & Acústico',
      night: 'Modo Noche',
    },
    bassLabel: 'Graves (85 Hz)',
    midLabel: 'Medios (1 kHz)',
    trebleLabel: 'Agudos / Aire (8.2 kHz)',
    spatialLabel: 'Amplitud Espacial 3D',
    reverbLabel: 'Reverberación Liquid',
    speedLabel: 'Velocidad',
    qualityLabel: 'Calidad de Audio y Salida',
    qualities: {
      'atmos-mp3': 'Dolby Atmos Spatial (MP3 ligero)',
      'cd-lossless': 'CD Lossless FLAC (16-bit / 44.1 kHz)',
      'hires-96': 'Hi-Res Lossless (24-bit / 96 kHz)',
      'master-192': 'Studio Master (24-bit / 192 kHz)',
    },
    bitPerfectTitle: 'Salida Bit-Perfect / Bypass DAC Directo',
    bitPerfectDesc: 'Omite EQ y limitador para una señal pura sin alterar.',
    bitPerfectActive: 'Bypass Directo Activo',
    autoEqLabel: 'Perfil Auriculares AutoEQ',
    eq15Title: 'Ecualizador Paramétrico 15 Bandas (25 Hz – 16 kHz)',
    automixTitle: 'Automix y Fundido Cruzado',
    automixDesc: 'Transiciones suaves automáticas al cambiar de tema.',
    crossfadeLabel: 'Crossfade',
    soundMonitorEyebrow: 'THE SOUND OF MORE',
    soundMonitorDesc: 'Cadena de audio en vivo y muestreo',
    screenSectionTitle: 'Pantallas y Gráficos Liquid Glass',
    visualReset: 'Restablecer Pantalla',
    themeLabel: 'Tema de Pantalla',
    themes: {
      'studio-light': 'Estudio Claro',
      'obsidian-dark': 'Obsidian Oscuro',
      'amoled-black': 'AMOLED Negro Puro',
      'liquid-glass': 'Liquid Glass',
      'dynamic-cover': 'Color Portada',
    },
    visualizerLabel: 'Estilo Visualizador',
    visualizers: {
      'liquid-waves': 'Ondas Líquidas',
      'orbital-glass': 'Órbitas Cristal',
      'spectrum-silk': 'Espectro Seda',
      'cover-aura': 'Aura Portada',
    },
    glassBlurLabel: 'Desenfoque Cristal',
    motionLabel: 'Reactividad Líquida',
    accentLabel: 'Color Acento',
    accentAutoCover: 'Auto de Portada',
    showCoverToggle: 'Mostrar portada en escenario Liquid',
    castTitle: 'Conexión Google Cast / Chromecast',
    castSubtitle:
      'Envía audio y carátula de la canción activa directamente a tu TV, Chromecast o altavoces Google Nest.',
    castConnectBtn: 'Conectar Google Cast',
    castDisconnectBtn: 'Desconectar Cast',
    castSendTrackBtn: 'Transmitir Canción',
    castSending: 'Enviando al dispositivo...',
    castConnectedTo: 'Conectado a',
    castReady: 'Listo para buscar dispositivos Cast',
    castUnavailable: 'Cast limitado en iframe — abre en Chrome o PWA',
    castIframeNote:
      'En vista embebida el navegador limita Chromecast. Abre la app en una pestaña de Chrome para transmitir.',
    castOpenStandalone: 'Abrir en pestaña propia',
    castErrNoPreview: 'Selecciona una canción con vista previa antes de transmitir.',
    castErrSession: 'No hay ningún dispositivo Google Cast conectado.',
    castErrMedia: 'No se pudo iniciar la reproducción en el dispositivo Cast.',
    castActiveTrackSent: 'Reproduciendo en Cast',
  },
};

const fr: Translations = {
  nav: {
    releases: 'Sorties Live',
    catalog: 'Recherche',
    playlists: 'Playlists',
    history: 'Statistiques',
    studio: 'Paramètres',
    covers: 'Pochettes',
    chat: 'Assistant IA',
    liquidCast: 'Liquid & Audio',
    refreshReleases: 'Actualiser',
  },
  toolbar: {
    regionItaly: 'Italie',
    regionGlobal: 'Mondial',
    languageLabel: 'Langue',
    updatedAt: 'Mis à jour',
    nextUpdateIn: 'Proch. synchro',
    loadingCatalog: 'Chargement du catalogue...',
  },
  catalog: {
    heroTitle: 'Nouvelles sorties musicales en direct, synchronisées avec votre métronome.',
    heroSubtitle:
      'Écoutez les derniers singles et albums en temps réel, détectez le BPM exact et jouez en rythme.',
    syncTopSong: 'Synchroniser #1',
    searchPlaceholder: 'Rechercher un titre, un artiste ou un album...',
    advancedSearch: 'Recherche Avancée',
    searchBtn: 'Rechercher',
    searchingBtn: 'Recherche...',
    artistLabel: 'Artiste',
    artistPlaceholder: 'Ex. Daft Punk, Stromae...',
    albumLabel: 'Album',
    albumPlaceholder: "Titre de l'album...",
    genreLabel: 'Genre',
    yearLabel: 'Année de sortie',
    allYears: 'Toutes les années',
    latestYear: '2026 (Dernières)',
    before2020: 'Avant 2020',
    filterHint: 'Les filtres actualisent la vue instantanément et interrogent le catalogue global.',
    clearFilters: 'Réinitialiser',
    applyCatalog: 'Appliquer au catalogue',
    webBulletinBtn: 'Actu Sorties Web',
    webBulletinLoading: 'Recherche web...',
    webBulletinTitle: 'Bulletin des Sorties Web',
    albumsFound: 'Albums trouvés',
    newAlbumsTitle: 'Nouveaux Albums & Sorties',
    openAlbumHint: 'Cliquez sur un album pour voir ses pistes',
    noAlbumsFound: 'Aucun album ne correspond à vos filtres.',
    songsFound: 'Titres trouvés',
    liveSongsTitle: 'Titres en Temps Réel',
    syncSongsHint: 'Cliquez sur Synchroniser pour caler le métronome',
    noSongsFound: 'Aucun titre trouvé',
    noSongsHint: "Essayez d'ajuster les filtres artiste, album, genre ou année.",
    colTrack: 'Titre',
    colTempo: 'Tempo',
    colDuration: 'Durée',
    colActions: 'Actions',
    syncBtn: 'Synchroniser',
    syncedBtn: 'Actif',
    saveInPlaylist: 'Ajouter à une playlist',
    newPlaylistInput: 'Nouvelle playlist...',
    createBtn: 'Créer',
    bpmAuto: 'Auto',
    loadingAlbumTracks: "Chargement des pistes de l'album...",
    tracksCount: 'pistes',
  },
  metronome: {
    title: 'Métronome Synchronisé',
    lockedTo: 'Calé sur',
    readyToSync: 'Prêt pour synchronisation',
    autoSyncOn: 'Auto-Sync Actif',
    autoSyncOff: 'Auto-Sync Off',
    analyzingBeat: 'Analyse du tempo audio...',
    noPreviewNote: 'Aperçu audio indisponible : BPM synchronisé via métadonnées.',
    selectSongPrompt: 'Sélectionnez un titre pour détecter le BPM et caler le métronome.',
    generateCoverForTrack: 'Générer une pochette pour ce titre',
    currentTempo: 'Tempo actuel',
    startClick: 'Démarrer Clic',
    stopClick: 'Arrêter',
    tap: 'Tap',
    meter: 'Mesure',
    accentOn: 'Accent temps 1 actif',
    accentOff: 'Accent inactif',
    subdivision: 'Subdivision',
    tripletLabel: 'Triolet',
    clickTimbre: 'Son du Clic',
    timbreWood: 'Bois',
    timbreDigital: 'Digital',
    timbreRimshot: 'Rimshot',
    phaseAlign: 'Alignement de phase',
    alignBtn: 'Aligner',
    volClick: 'Clic',
    volTrack: 'Titre',
    freeMetronome: 'Métronome libre',
    manualTempo: 'Tempo manuel',
    tapTempoSource: 'Tap Tempo manuel',
    stopShort: 'Stop',
    clickShort: 'Clic',
  },
  playlists: {
    title: 'Vos Playlists',
    subtitle: 'Organisez vos titres par BPM ou setlist, sauvegardez localement et partagez.',
    newPlaylistBtn: 'Nouvelle Playlist',
    createTitle: 'Créer une playlist',
    cancel: 'Annuler',
    namePlaceholder: 'Nom (ex. Répétition 120 BPM)',
    descPlaceholder: 'Courte description (optionnel)',
    savePlaylistBtn: 'Enregistrer',
    emptyTitle: 'Aucune playlist enregistrée',
    emptySubtitle: 'Créez votre première playlist ou ajoutez des titres depuis le catalogue.',
    tracksLabel: 'titres',
    updatedLabel: 'Mise à jour',
    shareBtn: 'Partager',
    saveChangesBtn: 'Enregistrer',
    emptyTracklist: 'Playlist vide. Utilisez le bouton + sur un titre pour l’ajouter ici.',
    syncBtn: 'Synchroniser',
    syncedBtn: 'Actif',
    defaultName: 'Studio & Pratique BPM',
    defaultDesc: 'Collection personnelle pour travailler en rythme avec le métronome.',
    createdFromCatalogDesc: 'Playlist créée depuis le catalogue',
  },
  covers: {
    title: 'Studio Pochettes IA',
    subtitlePrefix: 'Générez des pochettes sur mesure avec',
    subtitleSuffix: "en choisissant la résolution jusqu'à 4K.",
    adaptToSong: 'Adapter au titre actif',
    promptLabel: 'Direction artistique et sujet de la pochette',
    promptPlaceholder: 'Décrivez ambiance, textures, lumière, couleurs et style...',
    resolutionLabel: 'Résolution de Sortie (1K / 2K / 4K)',
    res1k: '1024px · Rapide',
    res2k: '2048px · Impression HD',
    res4k: '4096px · Master Ultra',
    formatLabel: 'Format',
    presetsLabel: 'Styles rapides',
    loadStyleHint: 'Charger ce style',
    generateBtn: 'Générer Pochette',
    generatingBtn: 'Génération...',
    galleryTitle: 'Galerie des Pochettes',
    emptyTitle: 'Aucune pochette générée',
    emptySubtitle: 'Choisissez 1K, 2K ou 4K ci-dessus et créez votre pochette.',
    downloadBtn: 'Télécharger',
    applyToSongBtn: 'Appliquer au titre',
    appliedBtn: 'Appliquée',
    ratioCover: '1:1 Pochette',
    ratioBanner: '16:9 Bannière',
    ratioPoster: '3:4 Affiche',
    ratioStory: '9:16 Story',
  },
  chat: {
    title: 'Assistant Musical IA',
    activeRoleLabel: 'Rôle actif',
    contextOn: 'Contexte',
    contextOff: 'Contexte titre désactivé',
    newChat: 'Nouveau chat',
    inputPlaceholder: 'Posez une question sur les sorties, le BPM, l’harmonie...',
    sendBtn: 'Envoyer',
    webSearchToggle: 'Utiliser Google Search en direct pour les sorties récentes',
    thinkingLabel: 'Réflexion en cours...',
    youLabel: 'Vous',
    quickPrompts: [
      'Analyse le groove et propose des exercices au métronome pour ce titre',
      'Quels albums et singles majeurs sont sortis cette semaine ?',
      'Suggère 4 morceaux au BPM proche pour une transition fluide',
      'Explique comment travailler un polyrythme 3 pour 4 au métronome',
    ],
    roles: {
      'gemini-4-hydrogen': {
        roleName: 'Curateur Nouveautés',
        taskLabel: 'Général & Web Search',
        description: 'Albums récents, nouveaux artistes et recommandations.',
      },
      'gemini-4-carbon': {
        roleName: 'Directeur Musical & Théorie',
        taskLabel: 'Raisonnement Avancé',
        description: 'Analyse harmonique, polyrythmie et structure musicale.',
      },
      'gemini-4-argon': {
        roleName: 'Producteur & Live Set',
        taskLabel: 'Tâches Complexes',
        description: 'Transitions BPM, mixage, sidechain et setlists live.',
      },
      'gemini-3.1-flash-lite': {
        roleName: 'Coach Rythme Rapide',
        taskLabel: 'Réponses Rapides',
        description: 'Repères BPM, subdivisions et exercices instantanés.',
      },
    },
  },
  share: {
    shareSongTitle: 'Partager le Titre',
    sharePlaylistTitle: 'Partager la Playlist',
    tracksInPlaylist: 'titres dans la playlist',
    copiedInstagram: 'Copié pour Instagram !',
    copyInstagram: 'Copier pour Instagram',
    copied: 'Copié',
    copy: 'Copier',
    nativeShare: "Partager depuis l'appareil",
    listeningText: 'J’écoute et je synchronise',
    playlistText: 'Écoute ma playlist',
  },
  pwa: {
    installApp: 'Installer App',
    downloadChromeBtn: 'Installer via Chrome',
    installIOS: 'Installer sur iOS',
    iosTitle: 'Installer sur iPhone / iPad',
    iosStep1: 'Appuyez sur le bouton Partager dans Safari.',
    iosStep2: "Faites défiler et choisissez Sur l'écran d'accueil.",
    iosGotIt: 'Compris',
    offlineBanner: 'Mode hors ligne — Métronome et cache actifs',
  },
  history: {
    title: 'Historique et Statistiques',
    subtitle: 'Tous les titres écoutés et synchronisés, avec vos tendances BPM et genres favoris.',
    clearBtn: "Effacer l'historique",
    emptyTitle: 'Aucun historique',
    emptySubtitle: 'Écoutez ou synchronisez un titre du catalogue pour suivre vos statistiques.',
    statPlays: 'Écoutes Totales',
    statUnique: 'Titres Uniques',
    statAvgBpm: 'BPM Moyen',
    statTopGenre: 'Genre Principal',
    statTopArtist: 'Artiste Favori',
    bpmDistributionTitle: 'Répartition des BPM',
    genreBreakdownTitle: 'Genres Principaux',
    recentTracksTitle: 'Titres Écoutés',
    playsUnit: 'écoutes',
    noDataYet: 'Aucune donnée',
  },
  download: {
    atmosBtn: 'Dolby Atmos',
    atmosProcessing: 'Optimisation...',
    atmosTitle: 'Télécharger Dolby Atmos Spatial (MP3 léger)',
    atmosUnavailable: 'Aperçu indisponible au téléchargement',
  },
  liquid: {
    title: 'Studio Liquid, Audio FX & Google Cast',
    subtitle:
      'Personnalisez égaliseur, spatialisation 3D, visualiseur Liquid Glass, thèmes d’écran et diffusez sur Google Cast.',
    stageNoTrack: 'Choisissez un titre ou lancez le métronome pour animer la scène',
    fullscreen: 'Plein écran TV',
    exitFullscreen: 'Quitter plein écran',
    playBtn: 'Lire',
    pauseBtn: 'Pause',
    audioSectionTitle: 'Personnalisation Audio Live',
    audioReset: 'Réinitialiser Audio',
    presetLabel: 'Profil Sonore',
    presets: {
      flat: 'Studio Neutre',
      atmos: 'Dolby Atmos 3D',
      'liquid-warmth': 'Liquid Warmth',
      'club-bass': 'Club & Basses',
      vocal: 'Voix & Acoustique',
      night: 'Mode Nuit',
    },
    bassLabel: 'Basses (85 Hz)',
    midLabel: 'Médiums (1 kHz)',
    trebleLabel: 'Aigus / Air (8.2 kHz)',
    spatialLabel: 'Largeur Spatiale 3D',
    reverbLabel: 'Réverbération Liquid',
    speedLabel: 'Vitesse de lecture',
    qualityLabel: 'Qualité Audio & Sortie',
    qualities: {
      'atmos-mp3': 'Dolby Atmos Spatial (MP3 léger)',
      'cd-lossless': 'CD Lossless FLAC (16-bit / 44.1 kHz)',
      'hires-96': 'Hi-Res Lossless (24-bit / 96 kHz)',
      'master-192': 'Studio Master (24-bit / 192 kHz)',
    },
    bitPerfectTitle: 'Sortie Bit-Perfect / Bypass DAC Direct',
    bitPerfectDesc: 'Contourne EQ et limiteur pour un signal transparent.',
    bitPerfectActive: 'Bypass Direct Actif',
    autoEqLabel: 'Profil Casque AutoEQ',
    eq15Title: 'Égaliseur Paramétrique 15 Bandes (25 Hz – 16 kHz)',
    automixTitle: 'Automix & Fondu Enchaîné',
    automixDesc: 'Transitions fluides automatiques entre les titres.',
    crossfadeLabel: 'Crossfade',
    soundMonitorEyebrow: 'THE SOUND OF MORE',
    soundMonitorDesc: 'Chaîne audio live & fréquence matérielle',
    screenSectionTitle: 'Personnalisation Écrans & Liquid Glass',
    visualReset: 'Réinitialiser Écran',
    themeLabel: 'Thème des écrans',
    themes: {
      'studio-light': 'Studio Clair',
      'obsidian-dark': 'Obsidian Sombre',
      'amoled-black': 'AMOLED Noir Pur',
      'liquid-glass': 'Liquid Glass',
      'dynamic-cover': 'Couleurs Pochette',
    },
    visualizerLabel: 'Style de Visualiseur',
    visualizers: {
      'liquid-waves': 'Ondes Liquides',
      'orbital-glass': 'Orbes Verre',
      'spectrum-silk': 'Spectre Soie',
      'cover-aura': 'Aura Pochette',
    },
    glassBlurLabel: 'Flou Verre',
    motionLabel: 'Réactivité Liquide',
    accentLabel: 'Couleur d’Accent',
    accentAutoCover: 'Auto Pochette',
    showCoverToggle: 'Afficher la pochette sur la scène Liquid',
    castTitle: 'Connexion Google Cast / Chromecast',
    castSubtitle:
      'Diffusez l’audio et la pochette du titre actif vers votre TV, Chromecast ou enceinte Google Nest.',
    castConnectBtn: 'Connecter Google Cast',
    castDisconnectBtn: 'Déconnecter Cast',
    castSendTrackBtn: 'Diffuser le Titre',
    castSending: 'Envoi vers appareil...',
    castConnectedTo: 'Connecté à',
    castReady: 'Prêt à détecter vos appareils Cast',
    castUnavailable: 'Cast limité dans ce cadre — ouvrez dans Chrome ou PWA',
    castIframeNote:
      'Les navigateurs limitent Chromecast dans une iframe intégrée. Ouvrez l’application dans un onglet Chrome pour diffuser.',
    castOpenStandalone: 'Ouvrir dans un onglet',
    castErrNoPreview: 'Sélectionnez un titre avec aperçu audio avant de diffuser.',
    castErrSession: 'Aucun appareil Google Cast sélectionné ou disponible.',
    castErrMedia: 'Impossible de lancer la lecture sur le récepteur Cast.',
    castActiveTrackSent: 'Lecture sur Cast',
  },
};

const de: Translations = {
  nav: {
    releases: 'Live-Releases',
    catalog: 'Suche',
    playlists: 'Playlists',
    history: 'Statistiken',
    studio: 'Einstellungen',
    covers: 'Cover-Studio',
    chat: 'KI-Assistent',
    liquidCast: 'Liquid & Audio',
    refreshReleases: 'Aktualisieren',
  },
  toolbar: {
    regionItaly: 'Italien',
    regionGlobal: 'Global',
    languageLabel: 'Sprache',
    updatedAt: 'Aktualisiert',
    nextUpdateIn: 'Nächster Sync',
    loadingCatalog: 'Katalog wird geladen...',
  },
  catalog: {
    heroTitle: 'Aktuelle Musik-Releases live, direkt mit deinem Metronom synchronisiert.',
    heroSubtitle:
      'Höre neue Singles und Alben in Echtzeit, erkenne die exakten BPM und übe perfekt im Takt.',
    syncTopSong: 'Sync #1',
    searchPlaceholder: 'Suche nach Songs, Künstlern oder Alben im globalen Katalog...',
    advancedSearch: 'Erweiterte Suche',
    searchBtn: 'Suchen',
    searchingBtn: 'Suche...',
    artistLabel: 'Künstler',
    artistPlaceholder: 'z.B. Kraftwerk, Coldplay...',
    albumLabel: 'Album',
    albumPlaceholder: 'Albumtitel...',
    genreLabel: 'Genre',
    yearLabel: 'Erscheinungsjahr',
    allYears: 'Alle Jahre',
    latestYear: '2026 (Neueste)',
    before2020: 'Vor 2020',
    filterHint: 'Filter aktualisieren die Ansicht sofort und durchsuchen den globalen Katalog.',
    clearFilters: 'Zurücksetzen',
    applyCatalog: 'Im Gesamtkatalog suchen',
    webBulletinBtn: 'Web-Releases',
    webBulletinLoading: 'Suche läuft...',
    webBulletinTitle: 'Aktuelle Web-Neuerscheinungen',
    albumsFound: 'Gefundene Alben',
    newAlbumsTitle: 'Neue Alben & Releases',
    openAlbumHint: 'Album anklicken, um alle Titel anzuzeigen',
    noAlbumsFound: 'Keine Alben für diese Filter gefunden.',
    songsFound: 'Gefundene Songs',
    liveSongsTitle: 'Songs in Echtzeit',
    syncSongsHint: 'Klicke auf Sync, um das Metronom anzupassen',
    noSongsFound: 'Keine Songs gefunden',
    noSongsHint: 'Passe Künstler-, Album-, Genre- oder Jahresfilter an.',
    colTrack: 'Titel',
    colTempo: 'Tempo',
    colDuration: 'Dauer',
    colActions: 'Aktionen',
    syncBtn: 'Sync',
    syncedBtn: 'Aktiv',
    saveInPlaylist: 'Zur Playlist hinzufügen',
    newPlaylistInput: 'Neue Playlist...',
    createBtn: 'Erstellen',
    bpmAuto: 'Auto',
    loadingAlbumTracks: 'Albumtitel werden geladen...',
    tracksCount: 'Titel',
  },
  metronome: {
    title: 'Synchrones Metronom',
    lockedTo: 'Gekoppelt mit',
    readyToSync: 'Bereit für Song-Sync',
    autoSyncOn: 'Auto-Sync Ein',
    autoSyncOff: 'Auto-Sync Aus',
    analyzingBeat: 'Analysiere Audio-Beat...',
    noPreviewNote: 'Keine Audiovorschau: BPM aus Metadaten synchronisiert.',
    selectSongPrompt: 'Wähle einen Song aus dem Katalog, um BPM und Klick zu synchronisieren.',
    generateCoverForTrack: 'Cover für diesen Song erstellen',
    currentTempo: 'Aktuelles Tempo',
    startClick: 'Klick Start',
    stopClick: 'Stopp',
    tap: 'Tap',
    meter: 'Taktart',
    accentOn: 'Betonung auf 1 ein',
    accentOff: 'Betonung aus',
    subdivision: 'Unterteilung',
    tripletLabel: 'Triole',
    clickTimbre: 'Klick-Sound',
    timbreWood: 'Holz',
    timbreDigital: 'Digital',
    timbreRimshot: 'Rimshot',
    phaseAlign: 'Phasenabgleich',
    alignBtn: 'Abgleichen',
    volClick: 'Klick',
    volTrack: 'Track',
    freeMetronome: 'Freies Metronom',
    manualTempo: 'Manuelles Tempo',
    tapTempoSource: 'Manuelles Tap-Tempo',
    stopShort: 'Stopp',
    clickShort: 'Klick',
  },
  playlists: {
    title: 'Deine Playlists',
    subtitle: 'Ordne Songs nach BPM oder Setlist, speichere lokal und teile sie.',
    newPlaylistBtn: 'Neue Playlist',
    createTitle: 'Neue Playlist erstellen',
    cancel: 'Abbrechen',
    namePlaceholder: 'Name (z.B. Bandprobe 120 BPM)',
    descPlaceholder: 'Kurze Beschreibung (optional)',
    savePlaylistBtn: 'Speichern',
    emptyTitle: 'Keine gespeicherten Playlists',
    emptySubtitle: 'Erstelle deine erste Playlist oder füge Songs aus dem Katalog hinzu.',
    tracksLabel: 'Titel',
    updatedLabel: 'Aktualisiert',
    shareBtn: 'Teilen',
    saveChangesBtn: 'Änderungen speichern',
    emptyTracklist: 'Leere Playlist. Nutze + bei einem Song im Katalog, um ihn hinzuzufügen.',
    syncBtn: 'Sync',
    syncedBtn: 'Aktiv',
    defaultName: 'Probe & Studio BPM',
    defaultDesc: 'Persönliche Sammlung zum Üben mit dem Metronom.',
    createdFromCatalogDesc: 'Playlist aus dem Katalog erstellt',
  },
  covers: {
    title: 'KI Cover-Studio',
    subtitlePrefix: 'Erstelle hochwertige Album-Cover mit',
    subtitleSuffix: 'und wähle eine Auflösung bis 4K.',
    adaptToSong: 'An aktiven Song anpassen',
    promptLabel: 'Kreative Beschreibung und Motiv',
    promptPlaceholder: 'Beschreibe Stimmung, Materialien, Licht, Farben und Stil...',
    resolutionLabel: 'Ausgabeauflösung (1K / 2K / 4K)',
    res1k: '1024px · Schnell',
    res2k: '2048px · HD-Druck',
    res4k: '4096px · Ultra-Master',
    formatLabel: 'Seitenverhältnis',
    presetsLabel: 'Stilvorlagen',
    loadStyleHint: 'Stil übernehmen',
    generateBtn: 'Cover generieren',
    generatingBtn: 'Wird generiert...',
    galleryTitle: 'Generierte Cover',
    emptyTitle: 'Noch keine Cover erstellt',
    emptySubtitle: 'Wähle oben 1K, 2K oder 4K und erstelle dein erstes Cover.',
    downloadBtn: 'Herunterladen',
    applyToSongBtn: 'Für Song nutzen',
    appliedBtn: 'Angewendet',
    ratioCover: '1:1 Cover',
    ratioBanner: '16:9 Banner',
    ratioPoster: '3:4 Poster',
    ratioStory: '9:16 Story',
  },
  chat: {
    title: 'Musik-KI-Assistent',
    activeRoleLabel: 'Aktive Rolle',
    contextOn: 'Kontext',
    contextOff: 'Song-Kontext aus',
    newChat: 'Neuer Chat',
    inputPlaceholder: 'Frage zu Releases, BPM, Harmonie oder Übungen stellen...',
    sendBtn: 'Senden',
    webSearchToggle: 'Live-Google-Suche für neue Releases und Charts nutzen',
    thinkingLabel: 'Denkt nach...',
    youLabel: 'Du',
    quickPrompts: [
      'Analysiere den Groove und schlage Metronom-Übungen vor',
      'Welche wichtigen Alben und Singles sind diese Woche erschienen?',
      'Empfiehl 4 Songs mit ähnlichem BPM für einen Übergang',
      'Erkläre wie man einen 3-gegen-4 Polyrhythmus mit Metronom übt',
    ],
    roles: {
      'gemini-4-hydrogen': {
        roleName: 'Release-Kurator',
        taskLabel: 'Allgemein & Websuche',
        description: 'Neue Alben, aufstrebende Künstler und Musikempfehlungen.',
      },
      'gemini-4-carbon': {
        roleName: 'Musikdirektor & Theorie',
        taskLabel: 'Tiefe Analyse',
        description: 'Harmonik, Polyrhythmik, ungerade Taktarten und Arrangement.',
      },
      'gemini-4-argon': {
        roleName: 'Produzent & Live-Set',
        taskLabel: 'Komplexe Aufgaben',
        description: 'BPM-Übergänge, Mixing, Sidechain und Live-Setlists.',
      },
      'gemini-3.1-flash-lite': {
        roleName: 'Schneller Rhythmus-Coach',
        taskLabel: 'Sofort-Antworten',
        description: 'Schnelle Tempo-Tipps, Unterteilungen und Übungsdrills.',
      },
    },
  },
  share: {
    shareSongTitle: 'Song teilen',
    sharePlaylistTitle: 'Playlist teilen',
    tracksInPlaylist: 'Titel in der Playlist',
    copiedInstagram: 'Für Instagram kopiert!',
    copyInstagram: 'Für Instagram kopieren',
    copied: 'Kopiert',
    copy: 'Kopieren',
    nativeShare: 'Über Gerät teilen',
    listeningText: 'Ich höre und synchronisiere',
    playlistText: 'Höre meine Playlist',
  },
  pwa: {
    installApp: 'App installieren',
    downloadChromeBtn: 'In Chrome laden',
    installIOS: 'Auf iOS installieren',
    iosTitle: 'Auf iPhone / iPad installieren',
    iosStep1: 'Tippe auf Teilen in der Safari-Leiste.',
    iosStep2: 'Scrolle und wähle Zum Home-Bildschirm.',
    iosGotIt: 'Verstanden',
    offlineBanner: 'Offline-Modus — Metronom & Cache aktiv',
  },
  history: {
    title: 'Verlauf & Statistiken',
    subtitle: 'Alle gehörten und synchronisierten Songs mit BPM-Verteilung und Top-Genres.',
    clearBtn: 'Verlauf löschen',
    emptyTitle: 'Noch keine Hörhistorie',
    emptySubtitle: 'Spiele oder synchronisiere einen Song aus dem Katalog, um Statistiken zu erfassen.',
    statPlays: 'Gesamtwiedergaben',
    statUnique: 'Einzigartige Songs',
    statAvgBpm: 'Durchschn. BPM',
    statTopGenre: 'Top-Genre',
    statTopArtist: 'Top-Künstler',
    bpmDistributionTitle: 'BPM-Verteilung',
    genreBreakdownTitle: 'Top-Genres',
    recentTracksTitle: 'Kürzlich gehörte Songs',
    playsUnit: 'Mal',
    noDataYet: 'Keine Daten',
  },
  download: {
    atmosBtn: 'Dolby Atmos',
    atmosProcessing: 'Optimiere...',
    atmosTitle: 'Dolby Atmos Spatial (Kompaktes MP3) laden',
    atmosUnavailable: 'Keine Vorschau zum Herunterladen verfügbar',
  },
  liquid: {
    title: 'Liquid Studio, Audio FX & Google Cast',
    subtitle:
      'Passe Live-EQ, 3D-Raumklang, Liquid-Glass-Visualizer und App-Bildschirmthemes an und streame via Google Cast.',
    stageNoTrack: 'Wähle einen Song oder starte das Metronom, um die Bühne zu animieren',
    fullscreen: 'TV-Vollbild',
    exitFullscreen: 'Vollbild beenden',
    playBtn: 'Play',
    pauseBtn: 'Pause',
    audioSectionTitle: 'Live-Audio-Anpassung',
    audioReset: 'Audio zurücksetzen',
    presetLabel: 'Klangprofil',
    presets: {
      flat: 'Studio Neutral',
      atmos: 'Dolby Atmos 3D',
      'liquid-warmth': 'Liquid Warmth',
      'club-bass': 'Club & Bass',
      vocal: 'Stimme & Akustik',
      night: 'Nachtmodus',
    },
    bassLabel: 'Bässe (85 Hz)',
    midLabel: 'Mitten (1 kHz)',
    trebleLabel: 'Höhen / Air (8.2 kHz)',
    spatialLabel: '3D-Raumbreite',
    reverbLabel: 'Liquid Raumhall',
    speedLabel: 'Geschwindigkeit',
    qualityLabel: 'Audioqualität & Ausgang',
    qualities: {
      'atmos-mp3': 'Dolby Atmos Spatial (Kompaktes MP3)',
      'cd-lossless': 'CD Lossless FLAC (16-Bit / 44,1 kHz)',
      'hires-96': 'Hi-Res Lossless (24-Bit / 96 kHz)',
      'master-192': 'Studio Master (24-Bit / 192 kHz)',
    },
    bitPerfectTitle: 'Bit-Perfect Ausgang / USB-DAC Bypass',
    bitPerfectDesc: 'Umgeht EQ und Limiter für einen reinen Signalweg.',
    bitPerfectActive: 'Direct Bypass Aktiv',
    autoEqLabel: 'AutoEQ Kopfhörerprofil',
    eq15Title: 'Parametrischer 15-Band-EQ (25 Hz – 16 kHz)',
    automixTitle: 'Automix & Sanftes Crossfade',
    automixDesc: 'Nahtlose Übergänge beim Titelwechsel.',
    crossfadeLabel: 'Crossfade',
    soundMonitorEyebrow: 'THE SOUND OF MORE',
    soundMonitorDesc: 'Live-Audiokette & Hardware-Abtastrate',
    screenSectionTitle: 'Bildschirm- & Liquid-Glass-Design',
    visualReset: 'Design zurücksetzen',
    themeLabel: 'App-Bildschirmtheme',
    themes: {
      'studio-light': 'Studio Hell',
      'obsidian-dark': 'Obsidian Dunkel',
      'amoled-black': 'AMOLED Reinschwarz',
      'liquid-glass': 'Liquid Glass',
      'dynamic-cover': 'Cover-Farben',
    },
    visualizerLabel: 'Visualizer-Stil',
    visualizers: {
      'liquid-waves': 'Liquid Waves',
      'orbital-glass': 'Orbital Glass',
      'spectrum-silk': 'Spectrum Silk',
      'cover-aura': 'Cover Aura',
    },
    glassBlurLabel: 'Glas-Unschärfe',
    motionLabel: 'Flüssige Dynamik',
    accentLabel: 'Akzentfarbe',
    accentAutoCover: 'Auto vom Cover',
    showCoverToggle: 'Albumcover auf der Liquid-Bühne anzeigen',
    castTitle: 'Google Cast / Chromecast Verbindung',
    castSubtitle:
      'Streame Audio und Cover-Metadaten des aktiven Songs direkt an TV, Chromecast oder Google Nest.',
    castConnectBtn: 'Mit Google Cast verbinden',
    castDisconnectBtn: 'Cast trennen',
    castSendTrackBtn: 'Aktiven Song casten',
    castSending: 'Sende an Gerät...',
    castConnectedTo: 'Verbunden mit',
    castReady: 'Bereit für Cast-Gerätesuche',
    castUnavailable: 'Cast in diesem Frame eingeschränkt — Chrome oder PWA nutzen',
    castIframeNote:
      'Browser schränken Chromecast in eingebetteten Iframes ein. Öffne die App in einem eigenen Chrome-Tab.',
    castOpenStandalone: 'Im eigenen Tab öffnen',
    castErrNoPreview: 'Wähle zuerst einen Song mit Audiovorschau zum Casten.',
    castErrSession: 'Kein Google Cast-Gerät ausgewählt oder verfügbar.',
    castErrMedia: 'Wiedergabe auf dem Cast-Gerät fehlgeschlagen.',
    castActiveTrackSent: 'Wird auf Cast gespielt',
  },
};

export const TRANSLATIONS: Record<AppLanguage, Translations> = {
  it,
  en,
  es,
  fr,
  de,
};
