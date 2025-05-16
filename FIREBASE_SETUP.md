# Firebase Setup Instructions

## Fix Missing or Insufficient Permissions Error

The app shows "Missing or insufficient permissions" errors because the Firebase security rules need to be updated. Follow these steps to fix this issue:

1. Install Firebase CLI:
```
npm install -g firebase-tools
```

2. Login to Firebase:
```
firebase login
```

3. Initialize Firebase in your project (if not already done):
```
firebase init
```
- Select Firestore, Hosting (if you want to deploy the web app)
- Select your existing Firebase project
- Accept defaults for other options

4. Deploy the security rules:
```
firebase deploy --only firestore:rules
```

This will deploy the `firestore.rules` file to your Firebase project, which allows read/write access to all collections.

## Firebase Configuration

Your Firebase configuration is already set up in `config/firebase.ts`. Make sure the Firebase project you deploy to matches the credentials in this file:

```
apiKey: "AIzaSyAWXS24CE_gNcbfzJV8ccuURhQy0ydKvrQ",
authDomain: "scheduledb2.firebaseapp.com",
databaseURL: "https://scheduledb2-default-rtdb.asia-southeast1.firebasedatabase.app",
projectId: "scheduledb2",
storageBucket: "scheduledb2.firebasestorage.app",
messagingSenderId: "660758443044",
appId: "1:660758443044:web:274384050b7af96570d4b1",
measurementId: "G-NXB608LZD7"
```

## Security Considerations

The current security rules allow anyone to read and write to your database. For a production application, you should implement proper authentication and authorization rules to secure your data.

## Collections Structure

The app uses the following collections:
- `classes` - For teacher class events
- `shifts` - For doctor shift events
- `teacherOffDays` - For teacher off days
- `doctorOffDays` - For doctor off days
- `onCallDays` - For doctor on-call days 