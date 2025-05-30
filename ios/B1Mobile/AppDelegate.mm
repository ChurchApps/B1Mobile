#import "AppDelegate.h"


#import <Firebase.h>
#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <AppCenterReactNative.h>
#import <AppCenterReactNativeAnalytics.h>
#import <AppCenterReactNativeCrashes.h>
#import <CodePush/CodePush.h>


@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
 self.moduleName = @"B1Mobile";
 // You can add your custom initial props in the dictionary below.
 // They will be passed down to the ViewController used by React Native.
 self.initialProps = @{};
  
  [FIRApp configure];
  [AppCenterReactNative register];
  [AppCenterReactNativeAnalytics registerWithInitiallyEnabled:true];
  [AppCenterReactNativeCrashes registerWithAutomaticProcessing];

 return [super application:application didFinishLaunchingWithOptions:launchOptions];
   
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
 return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
 return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
 return [CodePush bundleURL];
#endif
}

@end

