# react-native-promise-portal

This is a Portal system for React Native, used to render and manage modal components (such as dialogs, pop-ups, etc.) in your application.

## Installation

```sh
npm install react-native-promise-portal
```

## Screenshots

<div align="center">
  <img src="https://github.com/JinYuSha0/react-native-promise-portal/raw/main/screenshot/screenshot_1.gif" width="200" />
  <img src="https://github.com/JinYuSha0/react-native-promise-portal/raw/main/screenshot/screenshot_2.gif" width="200" />
  <img src="https://github.com/JinYuSha0/react-native-promise-portal/raw/main/screenshot/screenshot_3.gif" width="200" />
  <img src="https://github.com/JinYuSha0/react-native-promise-portal/raw/main/screenshot/screenshot_4.gif" width="200" />
  <img src="https://github.com/JinYuSha0/react-native-promise-portal/raw/main/screenshot/screenshot_5.gif" width="200" />
</div>

## Basic Usage

### 1. Setup PortalProvider

Wrap your app with `PortalProvider`:

```tsx
import { PortalProvider } from 'react-native-promise-portal';

export default function RootLayout() {
  return <PortalProvider>{/* Your app content */}</PortalProvider>;
}
```

### 2. Use Portal Hook

```tsx
import { usePortal } from 'react-native-promise-portal';

function MyComponent() {
  const { show, showWithOverlay } = usePortal();

  const handleShowDialog = async () => {
    try {
      const result = await showWithOverlay<boolean>({
        component: ({ close }) => (
          <Confirm title="Confirm" subTitle="Are you sure?" close={close} />
        ),
      });
      console.log('Result:', result);
    } catch (error) {
      // Handle error
    }
  };

  return <Button onPress={handleShowDialog} title="Show Dialog" />;
}
```

## API Reference

### Portal Methods

#### `show<T>(params: ShowPortalMethodParams<T>): PromiseWithPortal<T>`

Show a portal without overlay.

**Parameters:**

- `name?` (string): Portal name. If not provided, a random name will be generated.
- `index?` (number): Z-index for portal stacking. Higher index renders on top. Defaults to the current portal count.
- `component` (React.FC): The component to render. Receives props: `{ name, index, close, _ref }`

**Example:**

```tsx
const { show } = usePortal();

const result = await show<string>({
  name: 'my-portal',
  index: 10,
  component: ({ close }) => (
    <View>
      <Text>My Portal</Text>
      <Button onPress={() => close('result')} title="Close" />
    </View>
  ),
});
```

#### `showWithOverlay<T>(params: ShowPortalWithOverlayParams<T>): PromiseWithPortal<T>`

Show a portal with overlay (backdrop).

**Parameters:**

All parameters from `show`, plus:

- `overlay?` (object): Overlay configuration
  - `closeable?` (boolean): Whether the portal can be closed. Default: `true`
  - `overlayPressCloaseable?` (boolean): Whether clicking the overlay closes the portal. Default: `true`
  - `orientation?` (string): Portal position. Options:
    - `'leftTop'` | `'leftMiddle'` | `'leftBottom'`
    - `'centerTop'` | `'centerMiddle'` | `'centerBottom'` (default)
    - `'rightTop'` | `'rightMiddle'` | `'rightBottom'`
  - `bgColor?` (string): Overlay background color. Default: `'rgba(0,0,0,0.4)'`
  - `pointerEvents?` ('auto' | 'box-none' | 'box-only' | 'none'): Pointer events handling

**Example:**

```tsx
const { showWithOverlay } = usePortal();

// Center dialog
const result = await showWithOverlay<boolean>({
  component: ({ close }) => <Confirm close={close} />,
  overlay: {
    orientation: 'centerMiddle',
    bgColor: 'rgba(0,0,0,0.5)',
  },
});

// Bottom sheet
const date = await showWithOverlay<string>({
  component: ({ close }) => <DatePicker close={close} />,
  overlay: {
    orientation: 'centerBottom',
  },
});

// Loading (non-closeable)
const { close } = showWithOverlay<void>({
  component: () => <Loading />,
  overlay: {
    closeable: false,
  },
});
```

### Component Props

The component function receives the following props:

- `name` (string): Portal name
- `index` (number): Portal z-index
- `close` (function): Close the portal and resolve the promise
  ```tsx
  close(result: T) // Resolves with the result
  close(error: Error) // Rejects with the error
  ```
- `_ref` (React.RefObject): Reference for closeable components (advanced usage)

### Error Handling

```tsx
import { PortalError } from 'react-native-promise-portal';

try {
  const result = await showWithOverlay<boolean>({
    component: ({ close }) => <Confirm close={close} />,
  });
} catch (error) {
  if (error instanceof PortalError) {
    if (error.isCloseByOverlayPressError()) {
      console.log('Closed by overlay press');
    } else if (error.isCloseByHardwareBackPressError()) {
      console.log('Closed by hardware back button');
    } else if (error.isPortalAlreadyExistsError()) {
      console.log('Portal already exists');
    }
  }
}
```

## Local Portal

Local portals allow you to manage portals in specific parts of your app without using hooks. This is useful for scenarios where you need to show modals without direct UI interaction.

### Setup Local Portal

1. Create a state management solution (e.g., using Zustand):

```tsx
import { create } from 'zustand';
import { type PortalState, PortalManager } from 'react-native-promise-portal';

interface PagePortalsState {
  homePortalContent: Map<string, PortalState>;
  setHomePortalContent: (
    action: React.SetStateAction<Map<string, PortalState>>
  ) => void;
}

export const useLocalPortals = create<PagePortalsState>((set) => ({
  homePortalContent: new Map(),
  setHomePortalContent: (action) =>
    set((state) => {
      if (typeof action === 'function') {
        return {
          ...state,
          homePortalContent: action(state.homePortalContent),
        };
      }
      return { ...state, homePortalContent: action };
    }),
}));

// Create portal manager instance
export const HomePagePortalManager = new PortalManager(
  useLocalPortals.getState().setHomePortalContent
);
```

2. Render portals in your component:

```tsx
import { PortalRender } from 'react-native-promise-portal';
import { useLocalPortals, HomePagePortalManager } from './helper/LocalPortal';

function HomePage() {
  const homePortalContent = useLocalPortals((state) => state.homePortalContent);

  const handleShowLocalPortal = async () => {
    // Can be called from anywhere, even outside React components
    const result = await HomePagePortalManager.showWithOverlay<boolean>({
      component: ({ close }) => (
        <Confirm
          title="Local portal"
          subTitle="This dialog only appears on the home page"
          close={close}
        />
      ),
    });
  };

  return (
    <>
      <View>
        <Button onPress={handleShowLocalPortal} title="Show Local Portal" />
      </View>
      {/* Render local portals */}
      <PortalRender portals={homePortalContent} />
    </>
  );
}
```

### Local Portal Manager API

`PortalManager` provides the same methods as the hook:

- `show<T>(params): PromiseWithPortal<T>`
- `showWithOverlay<T>(params): PromiseWithPortal<T>`
- `remove(name: string): void`
- `removeAll(): void`

**Example:**

```tsx
// Show portal
const result = await HomePagePortalManager.showWithOverlay<boolean>({
  name: 'my-local-portal',
  index: 5,
  component: ({ close }) => <MyComponent close={close} />,
  overlay: {
    orientation: 'centerMiddle',
  },
});

// Remove specific portal
HomePagePortalManager.remove('my-local-portal');

// Remove all portals
HomePagePortalManager.removeAll();
```

## Examples

### Multiple Portals with Different Indexes

```tsx
const { showWithOverlay } = usePortal();

// Show multiple portals
const promise1 = showWithOverlay({ title: 'Dialog 1' });
const promise2 = showWithOverlay({
  index: 10, // Higher index, renders on top
  title: 'Dialog 2',
  subTitle: 'highest level',
});
const promise3 = showWithOverlay({ title: 'Dialog 3' });

Promise.allSettled([promise1, promise2, promise3]).then((results) => {
  console.log('All dialogs closed:', results);
});
```

### Loading Indicator

```tsx
const { showWithOverlay } = usePortal();

const showLoading = () => {
  const { close } = showWithOverlay<void>({
    component: () => <ActivityIndicator />,
    overlay: {
      closeable: false, // Prevent closing
    },
  });

  // Close after async operation
  setTimeout(() => {
    close();
  }, 3000);
};
```

### Date Picker (Bottom Sheet)

```tsx
const { showWithOverlay } = usePortal();

const showDatePicker = async () => {
  const date = await showWithOverlay<string>({
    overlay: {
      orientation: 'centerBottom', // Bottom sheet style
    },
    component: ({ close }) => (
      <DatePicker
        onSelect={(date) => close(date)}
        onCancel={() => close(new Error('Cancelled'))}
      />
    ),
  });
  return date;
};
```

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
