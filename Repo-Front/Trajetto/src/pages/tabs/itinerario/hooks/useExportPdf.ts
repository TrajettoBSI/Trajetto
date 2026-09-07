import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import i18n from '@/src/i18n';
import { Itinerary } from '@/hooks/itineraryStore';
import { getErrorMessage } from '@/utils/apiError';
import { showAlert } from '@/src/components/alerts/alertService';
import { formatDate, formatTime } from '@/src/i18n/format';
import { adminAccent } from '@/src/theme';

const PDF_PRIMARY = adminAccent.primary;

function buildItineraryHtml(itinerary: Itinerary) {
  const t = (key: string) => i18n.t(`itinerario:exportPdfDoc.${key}`);
  const sortedPlaces = [...itinerary.places].sort((a, b) => a.orderIndex - b.orderIndex);

  let placesHtml = '';
  sortedPlaces.forEach((place, index) => {
    placesHtml += `
      <div style="margin-bottom: 20px; padding: 15px; border-left: 5px solid ${PDF_PRIMARY}; background-color: #f8fafc; border-radius: 4px;">
        <h3 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 18px;">${index + 1}. ${place.name}</h3>
        <p style="margin: 4px 0; font-size: 14px; color: #4a5568;"><strong>🕒 ${t('estimatedTime')}</strong> ${formatTime(place.estimatedVisitTime)}</p>
        <p style="margin: 4px 0; font-size: 14px; color: #4a5568;"><strong>📍 ${t('address')}</strong> ${place.address}</p>
        ${place.category ? `<p style="margin: 4px 0; font-size: 14px; color: #4a5568;"><strong>🏷️ ${t('category')}</strong> ${place.category}</p>` : ''}
        ${place.openingHours ? `<p style="margin: 4px 0; font-size: 14px; color: #4a5568;"><strong>🕐 ${t('openingHours')}</strong> ${place.openingHours}</p>` : ''}
      </div>
    `;
  });

  return `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid ${PDF_PRIMARY}; padding-bottom: 20px; }
          .header h1 { color: ${PDF_PRIMARY}; margin: 0 0 10px 0; font-size: 28px; }
          .header p { margin: 5px 0; font-size: 16px; color: #64748b; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${t('title')}</h1>
          <p><strong>${t('period')}</strong> ${formatDate(itinerary.startDate)} ${t('periodJoiner')} ${formatDate(itinerary.endDate)}</p>
          <p><strong>${t('totalStops')}</strong> ${sortedPlaces.length}</p>
        </div>
        <h2 style="color: ${PDF_PRIMARY}; margin-bottom: 20px;">${t('stopsTitle')}</h2>
        ${placesHtml}
        <div class="footer">
          <p>${t('footer')}</p>
        </div>
      </body>
    </html>
  `;
}

export function useExportPdf() {
  const handleExportPDF = async (itinerary: Itinerary | null) => {
    if (!itinerary) return;

    const html = buildItineraryHtml(itinerary);
    const shareDialogTitle = i18n.t('itinerario:exportPdfDoc.shareDialogTitle');

    try {
      const { uri } = await Print.printToFileAsync({ html });

      if (Platform.OS === 'android') {
        const StorageAccessFramework = (FileSystem as any).StorageAccessFramework;
        if (StorageAccessFramework) {
          const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
          if (permissions.granted) {
            const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
            const newUri = await StorageAccessFramework.createFileAsync(permissions.directoryUri, 'Trajetto_Roteiro.pdf', 'application/pdf');
            await FileSystem.writeAsStringAsync(newUri, base64, { encoding: 'base64' });
            showAlert(i18n.t('itinerario:exportPdfDoc.androidSuccess'), { title: i18n.t('common:success') });
            return;
          }
        }
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: shareDialogTitle });
      } else {
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: shareDialogTitle });
      }
    } catch (error) {
      showAlert(getErrorMessage(error, i18n.t('itinerario:exportPdfDoc.genericError')), { title: i18n.t('common:error') });
    }
  };

  return { handleExportPDF };
}
