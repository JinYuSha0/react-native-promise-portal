export enum PortalErrorCode {
  Ignore = 'Ignore',
  PortalAlreadyExists = 'PortalAlreadyExists',
  CloseByOverlayPress = 'CloseByOverlayPress',
  CloseByHardwareBackPress = 'CloseByHardwareBackPress',
  CloseByUserCancel = 'CloseByUserCancel',
}

export class PortalError extends Error {
  constructor(
    message: string,
    public code: PortalErrorCode = PortalErrorCode.Ignore
  ) {
    super(message);
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
