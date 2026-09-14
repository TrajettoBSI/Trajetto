// Liga o estado de uma busca à aparência dos avisos: a tela entrega o que sabe da busca e
// o que desenhar quando há conteúdo; a escolha do aviso acontece aqui.

import React, { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { getErrorMessage } from '@/utils/apiError';
import { FeedbackCopy, FeedbackLayout, FeedbackState } from './FeedbackState';
import { RequestState, resolveFeedbackStatus } from './feedbackStatus';

export interface AsyncBoundaryProps<T> {
  /** O que se sabe sobre a busca — normalmente o retorno de useAsyncData. */
  state: RequestState<T>;
  /** Ação oferecida no erro e no vazio. Sem ela, o aviso não mostra botão. */
  onRetry?: () => void;
  /** Quanto espaço os avisos ocupam nesta tela. */
  layout?: FeedbackLayout;
  /** Ajuste de espaçamento do aviso nesta tela. */
  style?: StyleProp<ViewStyle>;
  /** Palavras desta tela. O que não for informado usa o texto padrão do app. */
  loading?: FeedbackCopy;
  error?: FeedbackCopy;
  empty?: FeedbackCopy;
  /** O que a tela considera vazio, quando "lista sem itens" não descreve o caso dela. */
  isEmpty?: (data: T | null) => boolean;
  /**
   * Um vazio desenhado pela própria tela, para os casos em que a ausência de conteúdo é
   * um convite e não um aviso — como a tela que ainda não tem roteiro nenhum. A decisão
   * de quando mostrar continua sendo do padrão; só o desenho muda.
   */
  renderEmpty?: () => ReactNode;
  /** O conteúdo, desenhado só quando existe conteúdo para desenhar. */
  children: (data: T) => ReactNode;
}

export function AsyncBoundary<T>({
  state, onRetry, layout, style, loading, error, empty, isEmpty, renderEmpty, children,
}: AsyncBoundaryProps<T>) {
  const status = resolveFeedbackStatus(state, isEmpty);

  if (status === 'loading') {
    return <FeedbackState variant="loading" layout={layout} style={style} {...loading} />;
  }

  if (status === 'error') {
    // A mensagem do backend explica a falha melhor que um texto genérico; o texto da tela
    // entra só quando ela quis dizer algo específico.
    const { message: mensagemDaTela, ...restoDoErro } = error ?? {};

    return (
      <FeedbackState
        variant="error"
        layout={layout}
        style={style}
        message={mensagemDaTela ?? getErrorMessage(state.error)}
        onAction={onRetry}
        {...restoDoErro}
      />
    );
  }

  if (status === 'empty') {
    if (renderEmpty) return <>{renderEmpty()}</>;
    return <FeedbackState variant="empty" layout={layout} style={style} onAction={onRetry} {...empty} />;
  }

  return <>{children(state.data as T)}</>;
}

export default AsyncBoundary;
