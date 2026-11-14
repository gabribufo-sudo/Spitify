import { Download, WifiOff } from 'lucide-react';
import { useOnlineStatus, usePWAInstall } from '../hooks/usePWAInstall';
import type { Translations } from '../i18n/translations';

interface PWAInstallButtonProps {
  t: Translations['pwa'];
}

export function PWAInstallButton({ t }: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => void install()}
        className="px-3.5 py-1.5 rounded-full bg-[#C6F100] hover:brightness-95 text-[#20251E] text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 cursor-pointer"
      >
        <Download className="w-3.5 h-3.5" />
        <span>{t.installApp}</span>
      </button>
    );
  }

  return (
    <a
      href="/scarica"
      target="_blank"
      rel="noopener noreferrer"
      className="px-3.5 py-1.5 rounded-full border border-[#D6D6CF] dark:border-[#2C3027] bg-[#FBFBFA] dark:bg-[#161912] hover:border-[#536716] dark:hover:border-[#C6F100] text-[#20251E] dark:text-[#EEF1E6] text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
    >
      <Download className="w-3.5 h-3.5 text-[#536716] dark:text-[#C6F100]" />
      <span>{t.downloadChromeBtn}</span>
    </a>
  );
}

export function OfflineIndicator({ label }: { label: string }) {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-16 lg:bottom-4 left-4 z-50 flex items-center gap-2 rounded-full bg-[#161912] border border-[#C6F100]/40 px-4 py-2 text-xs font-medium text-[#EEF1E6] shadow-lg"
    >
      <WifiOff className="w-3.5 h-3.5 text-[#C6F100] shrink-0" />
      <span>{label}</span>
    </div>
  );
}
