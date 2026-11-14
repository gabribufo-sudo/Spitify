import { useCallback, useEffect, useRef, useState } from 'react';
import type { SongItem } from '../types/music';

export type CastStatus = 'initializing' | 'available' | 'connecting' | 'connected' | 'unavailable';

interface CastSessionLike {
  getCastDevice?: () => { friendlyName?: string };
  loadMedia: (request: unknown) => Promise<void>;
  endSession?: (stopCasting: boolean) => void;
  setVolume?: (volume: number) => Promise<void>;
}

interface CastContextLike {
  setOptions: (opts: { receiverApplicationId: string; autoJoinPolicy: string }) => void;
  getCastState: () => string;
  getCurrentSession: () => CastSessionLike | null;
  requestSession: () => Promise<void>;
  addEventListener: (eventType: string, handler: (ev: { castState?: string; sessionState?: string }) => void) => void;
}

declare global {
  interface Window {
    __ritmoCastAvailable?: boolean;
    cast?: {
      framework?: {
        CastContext: { getInstance: () => CastContextLike };
        CastContextEventType: {
          CAST_STATE_CHANGED: string;
          SESSION_STATE_CHANGED: string;
        };
        CastState: {
          NO_DEVICES_AVAILABLE: string;
          NOT_CONNECTED: string;
          CONNECTING: string;
          CONNECTED: string;
        };
      };
    };
    chrome?: {
      cast?: {
        AutoJoinPolicy: { ORIGIN_SCOPED: string };
        Image: new (url: string) => unknown;
        media: {
          DEFAULT_MEDIA_RECEIVER_APP_ID: string;
          MediaInfo: new (contentId: string, contentType: string) => {
            metadata?: unknown;
            streamType?: string;
          };
          MusicTrackMediaMetadata: new () => {
            title?: string;
            artist?: string;
            albumName?: string;
            images?: unknown[];
          };
          LoadRequest: new (mediaInfo: unknown) => { autoplay: boolean };
          StreamType: { BUFFERED: string };
        };
      };
    };
  }
}

export function useGoogleCast() {
  const [castStatus, setCastStatus] = useState<CastStatus>('initializing');
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [isCastingSong, setIsCastingSong] = useState(false);
  const [lastCastSongTitle, setLastCastSongTitle] = useState<string | null>(null);
  const [castErrorCode, setCastErrorCode] = useState<
    null | 'NO_PREVIEW' | 'IFRAME_OR_UNAVAILABLE' | 'SESSION_FAILED' | 'MEDIA_FAILED'
  >(null);

  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const initializedRef = useRef(false);

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  const syncFromCastContext = useCallback(() => {
    const framework = window.cast?.framework;
    if (!framework) return;
    try {
      const ctx = framework.CastContext.getInstance();
      const state = ctx.getCastState();
      const { CastState } = framework;

      if (state === CastState.CONNECTED) {
        setCastStatus('connected');
        const session = ctx.getCurrentSession();
        setDeviceName(session?.getCastDevice?.()?.friendlyName || 'Google Cast');
      } else if (state === CastState.CONNECTING) {
        setCastStatus('connecting');
      } else if (state === CastState.NOT_CONNECTED) {
        setCastStatus('available');
        setDeviceName(null);
      } else {
        setCastStatus('unavailable');
        setDeviceName(null);
      }
    } catch {
      setCastStatus('unavailable');
    }
  }, []);

  const initCastFramework = useCallback(() => {
    if (initializedRef.current) return;
    const framework = window.cast?.framework;
    const chromeCast = window.chrome?.cast;
    if (!framework || !chromeCast) return;

    try {
      initializedRef.current = true;
      const ctx = framework.CastContext.getInstance();
      ctx.setOptions({
        receiverApplicationId: chromeCast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
        autoJoinPolicy: chromeCast.AutoJoinPolicy.ORIGIN_SCOPED,
      });
      ctx.addEventListener(
        framework.CastContextEventType.CAST_STATE_CHANGED,
        syncFromCastContext
      );
      ctx.addEventListener(
        framework.CastContextEventType.SESSION_STATE_CHANGED,
        syncFromCastContext
      );
      syncFromCastContext();
    } catch {
      setCastStatus('unavailable');
    }
  }, [syncFromCastContext]);

  useEffect(() => {
    if (window.__ritmoCastAvailable) {
      initCastFramework();
    } else {
      const timer = window.setTimeout(() => {
        if (!initializedRef.current) {
          setCastStatus(window.cast?.framework ? 'available' : 'unavailable');
        }
      }, 2800);

      const handleReady = (ev: Event) => {
        const custom = ev as CustomEvent<boolean>;
        if (custom.detail) {
          initCastFramework();
        } else {
          setCastStatus('unavailable');
        }
      };

      window.addEventListener('ritmo-cast-api-ready', handleReady);
      return () => {
        window.clearTimeout(timer);
        window.removeEventListener('ritmo-cast-api-ready', handleReady);
      };
    }
  }, [initCastFramework]);

  const requestCastSession = useCallback(async () => {
    setCastErrorCode(null);
    const framework = window.cast?.framework;
    if (framework) {
      try {
        setCastStatus('connecting');
        const ctx = framework.CastContext.getInstance();
        await ctx.requestSession();
        syncFromCastContext();
        return;
      } catch {
        syncFromCastContext();
        setCastErrorCode(isInIframe ? 'IFRAME_OR_UNAVAILABLE' : 'SESSION_FAILED');
        return;
      }
    }

    // Standard W3C Remote Playback API fallback for browsers without Cast Sender extension
    try {
      if (!remoteAudioRef.current) {
        remoteAudioRef.current = document.createElement('audio');
      }
      const audioEl = remoteAudioRef.current as HTMLAudioElement & {
        remote?: { prompt?: () => Promise<void> };
      };
      if (audioEl.remote && typeof audioEl.remote.prompt === 'function') {
        await audioEl.remote.prompt();
        return;
      }
    } catch {
      // Fall through to error notice
    }

    setCastErrorCode('IFRAME_OR_UNAVAILABLE');
  }, [isInIframe, syncFromCastContext]);

  const stopCastSession = useCallback(() => {
    const framework = window.cast?.framework;
    if (!framework) return;
    try {
      const session = framework.CastContext.getInstance().getCurrentSession();
      session?.endSession?.(true);
      setCastStatus('available');
      setDeviceName(null);
      setLastCastSongTitle(null);
    } catch {
      // Ignore
    }
  }, []);

  const castSong = useCallback(async (song: SongItem) => {
    setCastErrorCode(null);
    if (!song.previewUrl) {
      setCastErrorCode('NO_PREVIEW');
      return false;
    }

    const framework = window.cast?.framework;
    const chromeCast = window.chrome?.cast;
    if (!framework || !chromeCast) {
      // Fallback: route via HTMLAudioElement Remote Playback if user triggered it
      if (remoteAudioRef.current) {
        try {
          remoteAudioRef.current.src = song.previewUrl;
          await remoteAudioRef.current.play();
          setLastCastSongTitle(song.title);
          return true;
        } catch {
          setCastErrorCode('IFRAME_OR_UNAVAILABLE');
          return false;
        }
      }
      setCastErrorCode('IFRAME_OR_UNAVAILABLE');
      return false;
    }

    try {
      const ctx = framework.CastContext.getInstance();
      let session = ctx.getCurrentSession();
      if (!session) {
        setCastStatus('connecting');
        await ctx.requestSession();
        session = ctx.getCurrentSession();
      }
      if (!session) {
        setCastErrorCode('SESSION_FAILED');
        return false;
      }

      setIsCastingSong(true);
      const mediaInfo = new chromeCast.media.MediaInfo(song.previewUrl, 'audio/mp4');
      mediaInfo.streamType = chromeCast.media.StreamType.BUFFERED;

      const metadata = new chromeCast.media.MusicTrackMediaMetadata();
      metadata.title = song.title;
      metadata.artist = song.artist;
      metadata.albumName = song.album;
      if (song.artworkUrl) {
        metadata.images = [new chromeCast.Image(song.artworkUrl)];
      }
      mediaInfo.metadata = metadata;

      const request = new chromeCast.media.LoadRequest(mediaInfo);
      request.autoplay = true;
      await session.loadMedia(request);

      setCastStatus('connected');
      setDeviceName(session.getCastDevice?.()?.friendlyName || 'Google Cast');
      setLastCastSongTitle(song.title);
      return true;
    } catch {
      setCastErrorCode('MEDIA_FAILED');
      return false;
    } finally {
      setIsCastingSong(false);
    }
  }, []);

  return {
    castStatus,
    deviceName,
    isCastingSong,
    lastCastSongTitle,
    castErrorCode,
    isInIframe,
    requestCastSession,
    stopCastSession,
    castSong,
  };
}
