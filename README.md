# 🍽️ AI Meal Planner

An intelligent React Native app that analyzes grocery flyers using AI and generates personalized meal plans with cost estimates. The app stores meal plans in Supabase for easy access across devices.

## 📱 Features

- **Smart Flyer Analysis**: Take photos of grocery flyers and extract product information using GPT-4 Vision
- **Personalized Meal Plans**: AI generates meal plans based on your family size, allergies, and dietary restrictions
- **Cost Optimization**: Get accurate cost estimates for your weekly meal plans
- **Dietary Compliance**: Supports vegetarian, vegan, keto, paleo, and allergy-friendly meal planning
- **Save & Retrieve Plans**: Store your meal plans in the cloud using Supabase
- **Device Identification**: Unique device tracking for personalized experience
- **Saved Plans Management**: View, manage, and delete your saved meal plans

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- OpenAI API key
- Supabase account and project
- Expo Go app on your phone

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/meal-plan-expo.git
cd meal-plan-expo
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env and add your OpenAI API key and Supabase credentials
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
meal-plan-expo/
├── App.tsx                    # Main app component with navigation
├── babel.config.js           # Babel configuration
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies and scripts
├── app.json                  # Expo configuration
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
└── src/
    ├── screens/              # App screens
    │   ├── HomeScreen.tsx
    │   ├── PreferenceScreen.tsx
    │   ├── CameraScreen.tsx
    │   ├── FlyerResultsScreen.tsx
    │   ├── MealPlanScreen.tsx
    │   └── SavedPlansScreen.tsx
    ├── components/           # Reusable UI components
    │   ├── camera/           # Camera-related components
    │   ├── flyerResults/     # Flyer analysis result components
    │   ├── home/             # Home screen components
    │   ├── mealplan/         # Meal plan display components
    │   ├── preferences/      # User preference components
    │   ├── savedPlans/       # Saved plans management components
    │   └── shared/           # Shared UI components
    ├── services/             # External services
    │   ├── deviceService.ts  # Device identification
    │   ├── mealPlanStorage.ts # Supabase integration
    │   └── openaiService.ts  # OpenAI API integration
    ├── types/                # TypeScript definitions
    └── utils/                # Utility functions
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file with the following:
```
EXPO_PUBLIC_OPENAI_API_KEY=sk-your-key-here
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Supabase Setup
1. Create a new project at [Supabase](https://supabase.com)
2. Set up a `meal_plans` table with appropriate columns
3. Add your Supabase URL and anon key to the `.env` file

### OpenAI API Setup
1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add it to your `.env` file

### Permissions
The app requires camera and photo library permissions:
- **iOS**: Configured in `app.json` with usage descriptions
- **Android**: Camera and storage permissions included

## 📖 How to Use

1. **Set Preferences**: Configure family size, allergies, and dietary restrictions
2. **Scan Flyers**: Take photos of up to 3 grocery flyers
3. **Review Flyer Results**: Verify the extracted product information
4. **Generate Plan**: AI analyzes flyers and creates personalized meal plans
5. **View Results**: Browse meals with ingredients, instructions, and costs
6. **Save Plan**: Store your meal plan to Supabase for future reference
7. **View Saved Plans**: Access your previously saved meal plans

## 🎯 Development Features

### Local Storage Fallback
The app uses AsyncStorage as a fallback when Supabase credentials are not available:
```typescript
// In mealPlanStorage.ts
if (!supabase) {
  // Fall back to AsyncStorage
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}
```

### Device Identification
Unique device identification for user experience personalization:
```typescript
// In deviceService.ts
export const getDeviceId = async () => {
  try {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = generateUniqueId();
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch (error) {
    console.error("Error getting device ID:", error);
    return generateUniqueId();
  }
};
```

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
- **Supabase**: Free tier available, paid plans for higher usage
- **Expo**: Free for development, paid plans for production features
- **App Stores**: $99/year (iOS), $25 one-time (Android)

## 🔒 Privacy & Security

- User preferences stored locally with AsyncStorage
- Meal plans stored in Supabase with secure authentication
- Images processed by OpenAI (see their privacy policy)
- API keys handled securely through environment variables
- Device IDs generated and stored locally for identification

## 🛠️ Tech Stack

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and build service
- **TypeScript**: Type-safe JavaScript
- **React Navigation**: Screen navigation
- **AsyncStorage**: Local data persistence
- **Supabase**: Backend as a service for data storage
- **OpenAI GPT-4**: AI image analysis and meal planning
- **Expo Camera**: Photo capture functionality
- **React Hook Form**: Form handling and validation
- **React Native Elements**: UI component library

## 📞 Support

For issues with:
- **Expo**: Check [Expo Documentation](https://docs.expo.dev/)
- **OpenAI**: Check [OpenAI Documentation](https://platform.openai.com/docs)
- **Supabase**: Check [Supabase Documentation](https://supabase.com/docs)
- **React Native**: Check [React Native Documentation](https://reactnative.dev/)

---

Built with ❤️ using React Native, Expo, and Supabase
