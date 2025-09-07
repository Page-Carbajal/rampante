# Mobile React Native Stack

## Overview

A cross-platform mobile application stack using React Native for iOS and Android development. Focuses on native performance, code reuse, and rapid development across platforms.

## Philosophy

- **Write Once, Run Anywhere**: Maximum code sharing between platforms
- **Native Performance**: Bridge to native APIs when needed
- **Developer Experience**: Hot reloading, great debugging tools
- **Ecosystem**: Leverage React and JavaScript ecosystem

## Core Technologies

### Mobile Framework

- **React Native 0.72+**: Cross-platform framework
- **TypeScript**: Type safety and better tooling
- **Expo SDK 49**: Managed workflow for faster development
- **React Navigation 6**: Native navigation
- **React Native Paper**: Material Design components

### State & Data

- **Zustand**: Lightweight state management
- **TanStack Query**: Server state and caching
- **MMKV**: Fast key-value storage
- **Realm**: Local database (alternative to SQLite)

### Backend Integration

- **REST API**: Axios for HTTP requests
- **GraphQL**: Apollo Client (optional)
- **WebSocket**: Socket.io client
- **Push Notifications**: Expo Push or OneSignal

### Development Tools

- **Metro**: JavaScript bundler
- **Flipper**: Debugging platform
- **Reactotron**: Inspection tool
- **Detox**: E2E testing
- **Jest**: Unit testing

## Project Structure

```
project-root/
├── src/
│   ├── components/
│   │   ├── common/
│   │   └── screens/
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   └── AuthNavigator.tsx
│   ├── screens/
│   │   ├── Home/
│   │   ├── Profile/
│   │   └── Auth/
│   ├── services/
│   │   ├── api/
│   │   └── storage/
│   ├── store/
│   │   └── index.ts
│   ├── hooks/
│   ├── utils/
│   └── constants/
├── assets/
│   ├── images/
│   └── fonts/
├── ios/
├── android/
├── app.json
└── App.tsx
```

## Navigation Setup

### Stack & Tab Navigation

```typescript
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="Details" component={DetailsScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

## Component Patterns

### Responsive Components

```typescript
import { useWindowDimensions } from 'react-native';

export const ResponsiveGrid: FC<Props> = ({ children }) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  return (
    <View style={[
      styles.container,
      isTablet && styles.tabletContainer
    ]}>
      {children}
    </View>
  );
};
```

### Platform-Specific Code

```typescript
import { Platform } from "react-native";

const styles = StyleSheet.create({
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
```

## Data Management

### API Service

```typescript
class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: Config.API_URL,
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(async (config) => {
      const token = await SecureStore.getItemAsync("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async get<T>(url: string): Promise<T> {
    const { data } = await this.client.get<T>(url);
    return data;
  }
}
```

### Offline Support

```typescript
// Using TanStack Query with offline persistence
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
      retry: (failureCount, error) => {
        if (error.message === "Network Error") return false;
        return failureCount < 3;
      },
    },
  },
});

// Persist cache
const persistor = createSyncStoragePersister({
  storage: MMKV,
});

persistQueryClient({
  queryClient,
  persister: persistor,
});
```

## Native Module Integration

### Camera Example

```typescript
import { Camera } from 'expo-camera';

export function CameraScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <Camera style={styles.camera} type={type}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          setType(
            type === Camera.Constants.Type.back
              ? Camera.Constants.Type.front
              : Camera.Constants.Type.back
          );
        }}>
        <Text style={styles.text}>Flip Camera</Text>
      </TouchableOpacity>
    </Camera>
  );
}
```

## Push Notifications

### Setup & Handling

```typescript
import * as Notifications from "expo-notifications";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Register for push notifications
export async function registerForPushNotifications() {
  const { status } = await Notifications.requestPermissionsAsync();

  if (status !== "granted") {
    return null;
  }

  const token = await Notifications.getExpoPushTokenAsync();

  // Send token to backend
  await api.registerDevice(token.data);

  return token.data;
}

// Handle notification events
export function useNotificationHandler() {
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
      },
    );

    return () => subscription.remove();
  }, []);
}
```

## Performance Optimization

### List Performance

```typescript
import { FlashList } from '@shopify/flash-list';

export function OptimizedList({ data }) {
  return (
    <FlashList
      data={data}
      renderItem={({ item }) => <ListItem item={item} />}
      estimatedItemSize={80}
      keyExtractor={(item) => item.id}
      // Better performance than FlatList
    />
  );
}
```

### Image Optimization

```typescript
import FastImage from 'react-native-fast-image';

export function OptimizedImage({ uri }) {
  return (
    <FastImage
      style={styles.image}
      source={{
        uri,
        priority: FastImage.priority.normal,
        cache: FastImage.cacheControl.immutable,
      }}
      resizeMode={FastImage.resizeMode.cover}
    />
  );
}
```

## Testing Strategy

### Unit Tests

```typescript
// Component testing
import { render, fireEvent } from '@testing-library/react-native';

describe('LoginScreen', () => {
  it('shows error on invalid credentials', async () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'invalid');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(getByText('Invalid credentials')).toBeTruthy();
    });
  });
});
```

### E2E Tests

```typescript
// Detox test
describe("App Flow", () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it("should complete onboarding", async () => {
    await expect(element(by.id("welcome"))).toBeVisible();
    await element(by.id("get-started")).tap();
    await expect(element(by.id("home"))).toBeVisible();
  });
});
```

## Build & Deployment

### Expo Build

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

### Environment Configuration

```typescript
// app.config.js
export default {
  expo: {
    name: process.env.APP_NAME || "MyApp",
    slug: "myapp",
    extra: {
      apiUrl: process.env.API_URL,
      sentryDsn: process.env.SENTRY_DSN,
    },
  },
};

// Access in app
import Constants from "expo-constants";
const apiUrl = Constants.expoConfig.extra.apiUrl;
```

## Context7 Documentation

When using context7, fetch documentation for:

- **React Native**: Core components, APIs, and patterns
- **Expo SDK**: Managed workflow features and APIs
- **React Navigation**: Navigation patterns and configuration
- **TypeScript**: React Native type definitions
- **iOS/Android**: Platform-specific APIs and guidelines
- **Performance**: Optimization techniques for mobile

## Best Practices

1. **Performance**: Use React.memo, useMemo, and useCallback appropriately
2. **Accessibility**: Include accessibility labels and hints
3. **Platform Differences**: Test on both iOS and Android regularly
4. **Memory Management**: Clean up listeners and subscriptions
5. **Error Boundaries**: Implement error boundaries for graceful failures
6. **Deep Linking**: Support universal links for better UX

## Common Gotchas

1. **Metro Cache**: Clear with `npx react-native start --reset-cache`
2. **iOS Pods**: Run `cd ios && pod install` after package changes
3. **Android Gradle**: Clean with `cd android && ./gradlew clean`
4. **Gesture Conflicts**: Be careful with nested gesture handlers
5. **Image Sizing**: Always specify dimensions for images
6. **Text Input**: Handle keyboard avoiding views properly
