# 🍽️ AI Meal Planner

An intelligent React Native app that analyzes grocery flyers using AI and generates personalized meal plans with cost estimates.

## 📱 Features

- **Smart Flyer Analysis**: Take photos of grocery flyers and extract product information using GPT-4 Vision
- **Personalized Meal Plans**: AI generates meal plans based on your family size, allergies, and dietary restrictions
- **Cost Optimization**: Get accurate cost estimates for your weekly meal plans
- **Dietary Compliance**: Supports vegetarian, vegan, keto, paleo, and allergy-friendly meal planning
- **Easy Sharing**: Share your meal plans with family and friends

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- OpenAI API key
- Expo Go app on your phone

### Installation

1. **Clone or create the project:**
```bash
mkdir ai-meal-planner
cd ai-meal-planner
npx create-expo-app . --template blank-typescript
```

2. **Install dependencies:**
```bash
npm install @react-navigation/native @react-navigation/stack
npm install @react-native-async-storage/async-storage
npm install expo-camera expo-image-picker
npm install react-native-gesture-handler react-native-reanimated
npm install react-native-safe-area-context react-native-screens
```

3. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

4. **Start the development server:**
```bash
npx expo start
```

5. **Test on your device:**
- Install Expo Go on your phone
- Scan the QR code from your terminal
- Start testing!

## 🏗️ Project Structure

```
ai-meal-planner/
├── App.tsx                    # Main app component with navigation
├── babel.config.js           # Babel configuration
├── metro.config.js           # Metro bundler configuration
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies and scripts
├── app.json                  # Expo configuration
├── .env.example              # Environment variables template
├── .gitignore               # Git ignore rules
└── src/
    ├── screens/             # App screens
    │   ├── HomeScreen.tsx
    │   ├── PreferencesScreen.tsx
    │   ├── CameraScreen.tsx
    │   └── MealPlanScreen.tsx
    ├── services/            # External services
    │   └── openaiService.ts
    └── types/               # TypeScript definitions
        └── index.ts
```

## 🔧 Configuration

### OpenAI API Setup
1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add it to your `.env` file:
```
EXPO_PUBLIC_OPENAI_API_KEY=sk-your-key-here
```

### Permissions
The app requires camera and photo library permissions:
- **iOS**: Configured in `app.json` with usage descriptions
- **Android**: Camera and storage permissions included

## 📖 How to Use

1. **Set Preferences**: Configure family size, allergies, and dietary restrictions
2. **Scan Flyers**: Take photos of up to 3 grocery flyers
3. **Generate Plan**: AI analyzes flyers and creates personalized meal plans
4. **View Results**: Browse meals with ingredients, instructions, and costs
5. **Share**: Export your meal plan to share with others

## 🎯 Development Features

### For Testing Without API Costs
Replace the OpenAI call with mock data:
```typescript
// In CameraScreen.tsx
const mealPlan = createMockMealPlan(preferences);
```

### Hot Reload
- Changes automatically refresh in Expo Go
- TypeScript errors show in real-time
- Fast iteration and testing

## 🚀 Deployment

### Development
- Use Expo Go for testing
- All features work in development mode

### Production
```bash
# Build for iOS
npx eas build --platform ios

# Build for Android  
npx eas build --platform android

# Submit to stores
npx eas submit --platform ios
npx eas submit --platform android
```

## 💰 Cost Considerations

- **OpenAI API**: ~$0.01-0.03 per flyer image
- **Expo**: Free for development, paid plans for production features
- **App Stores**: $99/year (iOS), $25 one-time (Android)

## 🔒 Privacy & Security

- User preferences stored locally only
- Images processed by OpenAI (see their privacy policy)
- No personal data collection by the app
- API keys handled securely

## 🛠️ Tech Stack

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and build service
- **TypeScript**: Type-safe JavaScript
- **React Navigation**: Screen navigation
- **AsyncStorage**: Local data persistence
- **OpenAI GPT-4**: AI image analysis and meal planning
- **Expo Camera**: Photo capture functionality

## 📝 License

This project is created for educational and personal use. Please respect OpenAI's terms of service when using their API.

## 🤝 Contributing

This is a template project - feel free to fork and customize for your needs!

## 📞 Support

For issues with:
- **Expo**: Check [Expo Documentation](https://docs.expo.dev/)
- **OpenAI**: Check [OpenAI Documentation](https://platform.openai.com/docs)
- **React Native**: Check [React Native Documentation](https://reactnative.dev/)

---

Built with ❤️ using React Native and Expo
