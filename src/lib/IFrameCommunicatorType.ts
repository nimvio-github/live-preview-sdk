/* eslint-disable @typescript-eslint/consistent-type-definitions */
export enum IFrameMessageFrom {
  send = 'nimvio-live-preview',
  received = 'nimvio-content-editor'
}

interface RouteChangePayloadData {
  route: string
}

export interface OpenContentPayloadData {
  contentId: string
  templateName?: string
  projectId?: string
}

/**
 * Map value between message payload Type and Data. Where: Key -> Payload Type, Value -> Payload Data
 */
export type IFrameMessageTypeDataMap = {
  'init': null
  'route-change': RouteChangePayloadData
  'open-content': OpenContentPayloadData
}

export interface IFrameMessagePayload<T extends keyof IFrameMessageTypeDataMap> {
  type: T
  data?: IFrameMessageTypeDataMap[T]
  from: IFrameMessageFrom.send
}

export interface ContentChangeReceivedPayloadData<T> {
  formData: T
  id: string
}

export interface ToggleWeblinkReceivedPayloadData {
  isEnabled: boolean
}

export interface OpenContentReceivedPayloadData<T> {
  id: string
  templateName: string
  status: string
  formData: T
}

/**
 * Map value between received message payload Type and Data. Where: Key -> Payload Type, Value -> Payload Data
 */
export type IFrameReceivedMessageCallbackMap<T = any> = {
  'change': IFrameMessageCallback<ContentChangeReceivedPayloadData<T>>
  'refresh': IFrameMessageCallback
  'toggle-weblink': IFrameMessageCallback<ToggleWeblinkReceivedPayloadData>
  'open-content': IFrameMessageCallback<OpenContentReceivedPayloadData<T>>
  'new-content': IFrameMessageCallback<OpenContentReceivedPayloadData<T>>
  'sync': IFrameMessageCallback
}

export interface IFrameReceivedMessagePayload<T extends keyof IFrameReceivedMessageCallbackMap<any>> {
  type: T
  data?: Parameters<IFrameReceivedMessageCallbackMap[T]>[0]
  from: IFrameMessageFrom.received
}

export type IFrameMessageCallback<TEventData = undefined> = (
  data: TEventData,
) => void
