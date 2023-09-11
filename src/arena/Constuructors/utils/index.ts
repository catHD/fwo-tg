import type { FailArgs, SuccessArgs } from '../types';

export const isSuccessResult = (result: SuccessArgs | FailArgs): result is SuccessArgs => {
  return !('message' in result);
};

export const isSuccessDamageResult = (result: SuccessArgs | FailArgs) => {
  if (isSuccessResult(result)) {
    return ('dmg' in result);
  }

  return false;
};