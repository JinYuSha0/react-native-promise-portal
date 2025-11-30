import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View, Keyboard, StyleSheet } from 'react-native';
import { deferred, noop, randomStr, last, isNil } from './utils';
import { PortalError, PortalErrorCode } from './error';
import Overlay from './Overlay';

export type Closeable = {
  close: (callback: () => void) => void;
};

type Portal<T = void> = {
  _ref?: React.RefObject<Closeable | null>;
  name: string;
  index: number;
  close: (result: T | Error) => void;
};

type PortalComponent<T = void> = React.FC<Portal<T>>;

export type PortalState = Portal<any> & {
  component: PortalComponent<any>;
};

type PromiseWithPortal<T> = Promise<T> & Portal<T>;

export interface ShowPortalMethodParams<T = unknown> {
  name?: string;
  index?: number;
  component: PortalComponent<T>;
}

export interface ShowPortalWithOverlayParams<T = unknown>
  extends ShowPortalMethodParams<T> {
  overlay?: Omit<
    React.ComponentProps<typeof Overlay>,
    'name' | 'onClose' | 'handleBack' | 'children'
  >;
}

export type Placement =
  | 'right'
  | 'left'
  | 'top'
  | 'bottom'
  | 'topLeft'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomRight';

interface PortalContextProps {
  show: <T = void>(props: ShowPortalMethodParams<T>) => PromiseWithPortal<T>;
  showWithOverlay: <T = void>(
    props: ShowPortalWithOverlayParams<T>
  ) => PromiseWithPortal<T>;
  remove: (name: string) => void;
  removeAll: () => void;
}

const isShowPortalWithOverlayParams = <T,>(
  params: ShowPortalMethodParams<T> | ShowPortalWithOverlayParams<T>
): params is ShowPortalWithOverlayParams<T> => {
  return !!(params as ShowPortalWithOverlayParams).overlay;
};

const PortalContext = createContext<PortalContextProps>({
  show: noop,
  showWithOverlay: noop,
  remove: noop,
  removeAll: noop,
});

export class PortalManager {
  private setState: React.Dispatch<
    React.SetStateAction<Map<string, PortalState>>
  >;

  private topPortal: string | undefined;

  constructor(
    setState: React.Dispatch<React.SetStateAction<Map<string, PortalState>>>
  ) {
    this.setState = setState;
    this.getTopPortalName = this.getTopPortalName.bind(this);
    this.setPortals = this.setPortals.bind(this);
    this.remove = this.remove.bind(this);
    this.removeAll = this.removeAll.bind(this);
    this.show = this.show.bind(this);
    this.showWithOverlay = this.showWithOverlay.bind(this);
  }

  private getTopPortalName(portals: Map<string, PortalState>) {
    return last([...portals.values()].sort((a, b) => a.index - b.index))?.name;
  }

  public setPortals(action: React.SetStateAction<Map<string, PortalState>>) {
    if (typeof action === 'function') {
      this.setState((prev) => {
        const res = action(prev);
        this.topPortal = this.getTopPortalName(res);
        return res;
      });
    } else {
      this.setState(action);
      this.topPortal = this.getTopPortalName(action);
    }
  }

  public remove(name: string) {
    this.setPortals((prev) => {
      prev.delete(name);
      return new Map(prev);
    });
  }

  public removeAll() {
    this.setPortals(new Map());
  }

  public show<T = void>(
    props: ShowPortalMethodParams<T> | ShowPortalWithOverlayParams<T>
  ) {
    let { index } = props;
    const { name = `Portal_${randomStr()}`, component } = props;

    const _ref = React.createRef<Closeable>();

    const { promise, resolve, reject } = deferred<T>();

    const close = (result: T | Error) => {
      if (result instanceof Error) {
        reject(result);
      } else {
        resolve(result);
      }
    };

    const overlayClose = (result: T | Error) => {
      if (_ref.current) {
        _ref.current.close(() => close(result));
      } else {
        close(result);
      }
    };

    this.setPortals((prev) => {
      if (prev.has(name)) {
        close(
          new PortalError(
            `Portal ${name} already exists`,
            PortalErrorCode.PortalAlreadyExists
          )
        );
        return prev;
      }
      Keyboard.dismiss();
      promise.finally(this.remove.bind(null, name));
      if (isNil(index)) index = prev.size;
      prev.set(name, {
        _ref,
        name,
        index,
        component: isShowPortalWithOverlayParams(props)
          ? () => (
              <Overlay
                {...props.overlay}
                name={name}
                onClose={overlayClose}
                handleBack={() => name === this.topPortal}
              >
                {React.createElement(props.component, {
                  _ref,
                  name,
                  index: index!,
                  close,
                })}
              </Overlay>
            )
          : component,
        close,
      });
      return new Map(prev);
    });

    const promiseWithClose = promise as PromiseWithPortal<T>;
    promiseWithClose.name = name;
    promiseWithClose.index = index!;
    promiseWithClose.close = close;
    return promiseWithClose;
  }

  public showWithOverlay<T = void>(props: ShowPortalWithOverlayParams<T>) {
    return this.show({
      ...props,
      overlay: {
        ...props.overlay,
      },
    });
  }
}

export const PortalProvider: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  const [portals, _setPortals] = useState<Map<string, PortalState>>(new Map());
  const portalManager = useRef<PortalManager>(
    new PortalManager(_setPortals)
  ).current;
  const value = useMemo(
    () => ({
      show: portalManager.show,
      showWithOverlay: portalManager.showWithOverlay,
      remove: portalManager.remove,
      removeAll: portalManager.removeAll,
    }),
    [portalManager]
  );
  return (
    <PortalContext.Provider value={value}>
      {children}
      <PortalRender portals={portals} />
    </PortalContext.Provider>
  );
};

export const PortalRender: React.FC<{ portals: Map<string, PortalState> }> = ({
  portals,
}) => {
  const renderPortals = useMemo(() => {
    return [...portals.values()].sort((a, b) => a.index - b.index);
  }, [portals]);
  return renderPortals.length > 0 ? (
    <View style={StyleSheet.absoluteFill}>
      {renderPortals.map((portal) =>
        React.createElement(portal.component, {
          ...portal,
          key: `${portal.name}_${portal.index}`,
        })
      )}
    </View>
  ) : null;
};

export const usePortal = () => {
  const context = useContext(PortalContext);
  if (!context)
    throw new Error('You should use "PortalProvider" wrapper this component');
  return context;
};
