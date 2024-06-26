export type WindowState = {
  screenX: number; // pixel top
  screenY: number; // pixel left
  width: number; // pixel width
  height: number; // pixel height
};

export type GlobalState = {
  current: WindowState;
  other: WindowState[];
};

export type MessageT<Action extends string, Payload extends unknown> = {
  action: Action;
  payload: Payload;
};

type WindowStateChangedPayload = {
  oldWindow: WindowState;
  newWindow: WindowState;
  id: number;
};

type AttributedIdPayload = {
  id: number;
};

type WindowUnloadedPayload = {
  id: number;
};

export type WorkerMessage =
  | MessageT<"connected", { state: WindowState }>
  | MessageT<"sync", { allWindows: { windowState: WindowState; id: number }[] }>
  | MessageT<"windowStateChanged", WindowStateChangedPayload>
  | MessageT<"attributedId", AttributedIdPayload>
  | MessageT<"windowUnloaded", WindowUnloadedPayload>;
