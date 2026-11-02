import { RefObject, useState } from 'react';
import { Platform, type ViewInstance } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';

/** Tamanho de um story do Instagram: a imagem sai nitida mesmo de um cartao pequeno na tela. */
export const STORY_SIZE = { width: 1080, height: 1920 };

type ShareOptions = { fileName: string; dialogTitle?: string; size?: { width: number; height: number } };

async function shareOnWeb(dataUri: string, fileName: string) {
  const blob = await (await fetch(dataUri)).blob();
  const file = new File([blob], `${fileName}.png`, { type: 'image/png' });
  const nav = navigator as Navigator & { canShare?: (data: { files: File[] }) => boolean };
  if (nav.canShare?.({ files: [file] })) {
    await nav.share({ files: [file] });
    return;
  }
  const link = document.createElement('a');
  link.href = dataUri;
  link.download = `${fileName}.png`;
  link.click();
}

/**
 * Transforma a view do cartao numa imagem PNG e abre o compartilhamento do sistema; na web,
 * usa o compartilhamento do navegador ou baixa o arquivo.
 */
export function useShareImage(ref: RefObject<ViewInstance | null>) {
  const [sharing, setSharing] = useState(false);

  const share = async ({ fileName, dialogTitle, size = STORY_SIZE }: ShareOptions): Promise<boolean> => {
    if (!ref.current || sharing) return false;
    setSharing(true);
    try {
      if (Platform.OS === 'web') {
        await shareOnWeb(await captureRef(ref, { format: 'png', result: 'data-uri' }), fileName);
      } else {
        const uri = await captureRef(ref, { format: 'png', result: 'tmpfile', ...size });
        if (!(await Sharing.isAvailableAsync())) return false;
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle, UTI: 'public.png' });
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      return true;
    } catch {
      return false;
    } finally {
      setSharing(false);
    }
  };

  return { share, sharing };
}
