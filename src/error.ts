export enum PortalErrorCode {
  Ignore = 'Ignore',
  PortalAlreadyExists = 'PortalAlreadyExists',
  CloseByOverlayPress = 'CloseByOverlayPress',
  CloseByHardwareBackPress = 'CloseByHardwareBackPress',
  CloseByUserCancel = 'CloseByUserCancel',
}

export class PortalError extends Error {
  public code: PortalErrorCode;

  constructor(message: string, code: PortalErrorCode = PortalErrorCode.Ignore) {
    super(message);
    // Fix for React Native 0.81: ensure prototype chain is correct
    Object.setPrototypeOf(this, PortalError.prototype);
    this.name = 'PortalError';
    this.code = code;
  }

  isPortalAlreadyExistsError() {
    return this.code === PortalErrorCode.PortalAlreadyExists;
  }

  isCloseByOverlayPressError() {
    return this.code === PortalErrorCode.CloseByOverlayPress;
  }

  isCloseByHardwareBackPressError() {
    return this.code === PortalErrorCode.CloseByHardwareBackPress;
  }

  isCloseByUserCancelError() {
    return this.code === PortalErrorCode.CloseByUserCancel;
  }
}
