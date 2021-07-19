import { IBasePayload } from './IPayloads';

export interface ActionResult<generic extends IBasePayload> {
  type: string;
  payload?: generic;
}

export type Action<generic extends IBasePayload> = (
  payload: generic
) => ActionResult<generic>;
