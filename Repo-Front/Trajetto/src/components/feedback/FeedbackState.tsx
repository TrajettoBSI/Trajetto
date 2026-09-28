// A aparência única dos avisos do app. Todo aviso tem a mesma anatomia: símbolo, título
// curto, mensagem que orienta e, quando faz sentido, um botão que oferece uma saída.
//
// As palavras padrão vêm do arquivo de idiomas (common:feedback), então o aviso fala a
// língua escolhida pelo usuário; as cores vêm do tema, para o aviso acompanhar o app.

import React from 'react';
import { ActivityIndicator, StyleProp, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColors } from '@/src/theme';
import { styles } from './styles';

export type FeedbackVariant = 'loading' | 'error' | 'empty';

/**
 * Quanto espaço o aviso ocupa:
 * - `screen`: a tela inteira, quando não há mais nada para mostrar;
 * - `block`: só o seu espaço, quando o resto da tela continua em pé;
 * - `inline`: uma faixa curta, para avisar sem empurrar o conteúdo para fora da vista.
 */
export type FeedbackLayout = 'screen' | 'block' | 'inline';

/** O texto de um aviso. Toda tela pode trocar essas palavras pelas do caso dela. */
export interface FeedbackCopy {
  icon?: string;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export interface FeedbackStateProps extends FeedbackCopy {
  variant: FeedbackVariant;
  layout?: FeedbackLayout;
  style?: StyleProp<ViewStyle>;
}

const ICONE_PADRAO: Record<FeedbackVariant, string> = {
  loading: '',
  error: '⚠️',
  empty: '📭',
};

export function FeedbackState({
  variant,
  layout = 'screen',
  style,
  icon,
  title,
  message,
  actionLabel,
  onAction,
}: FeedbackStateProps) {
  const { t } = useTranslation('common');
  const colors = useColors();
  const s = styles(colors);

  const textoDoTitulo = title ?? t(`feedback.${variant}.title`);
  const textoDaMensagem = message ?? t(`feedback.${variant}.message`);
  const simbolo = icon ?? ICONE_PADRAO[variant];

  // Carregar não é uma situação da qual o usuário precise ser tirado; as outras duas são.
  const textoDaAcao = variant === 'loading' ? '' : actionLabel ?? t(`feedback.${variant}.action`);
  // Sem ação para onde ir, o botão seria enfeite.
  const mostrarAcao = Boolean(onAction && textoDaAcao);

  if (layout === 'inline') {
    const erro = variant === 'error';

    return (
      <View
        style={[s.inline, erro ? s.inlineError : s.inlineNeutral, style]}
        accessibilityRole="summary"
      >
        {variant === 'loading'
          ? <ActivityIndicator size="small" color={colors.primaryDark} />
          : <Text style={s.inlineIcon}>{simbolo}</Text>}

        <View style={s.inlineTexts}>
          {Boolean(textoDoTitulo) && (
            <Text style={[s.inlineTitle, erro && s.inlineTitleError]}>{textoDoTitulo}</Text>
          )}
          {Boolean(textoDaMensagem) && (
            <Text style={[s.inlineMessage, erro && s.inlineMessageError]}>{textoDaMensagem}</Text>
          )}
        </View>

        {mostrarAcao && (
          <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
            <Text style={s.inlineAction}>{textoDaAcao}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={[layout === 'screen' ? s.screen : s.block, style]} accessibilityRole="summary">
      {variant === 'loading'
        ? <ActivityIndicator size="large" color={colors.primaryDark} />
        : <Text style={s.icon}>{simbolo}</Text>}

      {Boolean(textoDoTitulo) && <Text style={s.title}>{textoDoTitulo}</Text>}
      {Boolean(textoDaMensagem) && <Text style={s.message}>{textoDaMensagem}</Text>}

      {mostrarAcao && (
        <TouchableOpacity style={s.action} onPress={onAction} activeOpacity={0.85}>
          <Text style={s.actionText}>{textoDaAcao}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default FeedbackState;
