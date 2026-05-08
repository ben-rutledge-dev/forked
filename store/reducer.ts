import type React from 'react';

export const SHOW_MODAL = 'SHOW_MODAL';
export const HIDE_MODAL = 'HIDE_MODAL';
export const SHOW_MESSAGE = 'SHOW_MESSAGE';
export const HIDE_MESSAGE = 'HIDE_MESSAGE';

type ModalState = {
  show: boolean
  Component: React.FC<Record<string, unknown>> | null
  cancelValue: unknown
  props: Record<string, unknown>
  maxWidth?: string
  allowClose?: boolean
  backgroundScroll?: boolean
};

type MessageState = {
  show: boolean
  id: string
  text: string
  icon: string | null
  hideAfter: number
};

export type GlobalState = {
  modal: ModalState
  message: MessageState
};

export const initialState: GlobalState = {
  modal: {
    show: false,
    Component: null,
    cancelValue: null,
    props: {},
  },
  message: {
    show: false,
    id: '',
    text: '',
    icon: null,
    hideAfter: 5000,
  },
};

type ShowModalAction = {
  type: typeof SHOW_MODAL
  payload: {
    maxWidth?: string
    allowClose?: boolean
    backgroundScroll?: boolean
    Component: React.FC<Record<string, unknown>>
    cancelValue?: unknown
    props?: Record<string, unknown>
  }
};

type HideModalAction = { type: typeof HIDE_MODAL };

type ShowMessageAction = {
  type: typeof SHOW_MESSAGE
  payload: {
    id?: string
    text: string
    icon?: string | null
    hideAfter?: number
  }
};

type HideMessageAction = { type: typeof HIDE_MESSAGE };

export type GlobalAction
  = | ShowModalAction
    | HideModalAction
    | ShowMessageAction
    | HideMessageAction;

export const reducer = (state: GlobalState, action: GlobalAction): GlobalState => {
  switch (action.type) {
    case SHOW_MODAL:
      return {
        ...state,
        modal: {
          ...state.modal,
          show: true,
          maxWidth: action.payload.maxWidth,
          allowClose: action.payload.allowClose,
          backgroundScroll: action.payload.backgroundScroll,
          Component: action.payload.Component,
          cancelValue: action.payload.cancelValue ?? initialState.modal.cancelValue,
          props: action.payload.props ?? initialState.modal.props,
        },
      };
    case HIDE_MODAL:
      return {
        ...state,
        modal: {
          ...state.modal,
          show: false,
        },
      };
    case SHOW_MESSAGE:
      return {
        ...state,
        message: {
          show: true,
          id: action.payload.id ?? '',
          text: action.payload.text,
          icon: action.payload.icon ?? null,
          hideAfter: action.payload.hideAfter ?? initialState.message.hideAfter,
        },
      };
    case HIDE_MESSAGE:
      return {
        ...state,
        message: {
          ...state.message,
          show: false,
        },
      };
    default:
      return state;
  }
};
