# Build Steps to be followed for Successful builds on Android & iOS

## Intro
- this repo uses Ionic Version 1

## Steps to be taken
1. Ensure you environment matches the below.  Check this by running `ionic info`

    ```
    Your system information:

    Cordova CLI: 7.0.1 
    Ionic CLI Version: 2.2.1
    Ionic App Lib Version: 2.2.0
    ios-deploy version: 1.9.2  (normally not present on windows)
    ios-sim version: 6.1.2     (normally not present on windows)
    OS: macOS Sierra
    Node Version: v8.6.0
    ```
    
2. Ensure you select `MASTER` branch in the repo, then sync the repo to get the latest changes.

3. For a clean install - MANUALLY Remove all existing packages by deleting folders: `Node_modules`, `Plugins`, `Platforms`

4. Change the bundle identifier of the app in `Config.xml` file to match your app.

5. if you are using the system versions mentioned above, you may need need to delete the `gulpfile.js` file.  Ionic 2 requires this, but ionic 1 has an issue with it.

6. **iOS Steps**
   
   1. `ionic platform add ios`
   
   2. `ionic build ios`
   
   3.  Open Xcode file in `platforms/iOS/`
   

7. **Android Steps**

   1. `ionic platform add android`

   2. `ionic build android`


## Developing in web mode

A [`tileserver`](https://www.npmjs.com/package/tileserver-gl-light) has been installed and configured to allow develop in web mode. To use it:

```bash
$ npm run tileserver

$ ionic serve
```

Tileserver is configured in `8070` as default and there is a constant in the `OfflineMap` resource pointing to this port. 
If you need to change the port you also have to change this value.


#### Notes
Cordova automatically modifies `package.json`, `package-lock.json`, and `config.xml` to change from the use of specific pinned versions to "^ Compatible with version" version numbers ([explained more here]( https://docs.npmjs.com/files/package.json#dependencies)). In theory this should not happen, and perhaps a newer version of ionic will fix this issue.  This can often cause issues when reinstalling a platform, however repeating the steps in this document should resolve the issues as the 1st download of plugins/platforms etc will respect the pinned version numbers.

