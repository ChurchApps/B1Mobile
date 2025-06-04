import React from 'react';
import { BlueHeader } from '@/src/components/BlueHeader';
import { ApiHelper, Constants as ConstantsHelper, EnvironmentHelper, LoginResponseInterface, UserHelper, globalStyles } from '@/src/helpers';
import { DimensionHelper } from '@/src/helpers/DimensionHelper';
// Fontisto will be replaced by PaperTextInput.Icon
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Linking, SafeAreaView, ScrollView, View, StyleSheet } from 'react-native'; // Text, TextInput, TouchableOpacity removed
import RNRestart from 'react-native-restart';
import { LoadingWrapper } from "@/src/components/wrapper/LoadingWrapper";
import { Button as PaperButton, Text as PaperText, TextInput as PaperTextInput, useTheme, Surface } from 'react-native-paper';

const Login = (props: any) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");



  const validateDetails = () => {
    if (email != '') {
      let emailReg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,6})+$/;
      if (emailReg.test(email) === false) {
        Alert.alert("Alert", 'Please enter valid email.');
        return false;
      } else {
        if (password != '') {
          return true;
        } else {
          Alert.alert("Alert", 'Please enter password.');
          return false;
        }
      }
    } else {
      Alert.alert("Alert", 'Please enter email.');
      return false;
    }
  }


  const loginApiCall = () => {
    let params = { "email": email, "password": password }
    setLoading(true);
    ApiHelper.postAnonymous("/users/login", params, "MembershipApi").then(async (data: LoginResponseInterface) => {
      setLoading(false);
      console.log("Called login")
      if (data.user != null) {
        console.log("Login successful", data);
        await UserHelper.handleLogin(data as any);
        console.log("handled Login.  Restarting")

        // router.replace('(drawer)/dashboard');
        // props.navigation.reset({
        //   index: 0,
        //   routes: [{ name: 'MainStack' }]
        // }, 500)
        //DevSettings.reload();
        router.navigate('/');  //Expo seems to remember the page you were on.
        //RNRestart.Restart();
      }
      else Alert.alert("Alert", "Invalid login");
    }).catch(() => {
      setLoading(false);
      Alert.alert("Alert", "Invalid login");
    });
  }



  const forgotLink = EnvironmentHelper.B1WebRoot.replace("{subdomain}.", "") + "/login?action=forgot";
  const registerLink = EnvironmentHelper.B1WebRoot.replace("{subdomain}.", "") + "/login?action=register";

  // Define styles using StyleSheet and theme
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background, // Use theme color
    },
    scrollViewContent: {
      paddingBottom: 20, // Ensure scroll content is not hidden
    },
    mainContainer: { // Replaces globalStyles.grayContainer
      flex: 1,
      alignItems: 'center',
      padding: DimensionHelper.wp(5),
      backgroundColor: theme.colors.surface, // Or background if preferred
      margin: DimensionHelper.wp(4),
      borderRadius: theme.roundness * 2,
    },
    welcomeText: { // Replaces globalStyles.mainText
      fontSize: DimensionHelper.wp(5.5),
      fontWeight: 'bold',
      marginBottom: DimensionHelper.wp(6),
      color: theme.colors.onSurface,
    },
    textInput: { // Common style for PaperTextInput
      width: DimensionHelper.wp(80),
      marginBottom: DimensionHelper.wp(4),
    },
    privacyTextContainer: { // Replaces globalStyles.privacyPolicyView
      width: DimensionHelper.wp(80),
      marginBottom: DimensionHelper.wp(4),
    },
    privacyText: { // Replaces globalStyles.privacyText
      fontSize: DimensionHelper.wp(3.5),
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
    },
    privacyLink: {
      color: theme.colors.primary,
      textDecorationLine: 'underline',
    },
    loginButton: { // Replaces globalStyles.roundBlueButton
      width: DimensionHelper.wp(80),
      marginTop: DimensionHelper.wp(2),
      paddingVertical: DimensionHelper.wp(1),
    },
    loginLinksContainer: { // Replaces globalStyles.loginLinks
      flexDirection: 'row',
      marginTop: DimensionHelper.wp(6),
      alignItems: 'center',
    },
    linkText: { // Replaces globalStyles.simpleLink
      color: theme.colors.primary,
      fontSize: DimensionHelper.wp(4),
      marginHorizontal: DimensionHelper.wp(2)
    },
    separatorText: {
      color: theme.colors.onSurfaceVariant,
      fontSize: DimensionHelper.wp(4),
    }
  });

  return (
    <LoadingWrapper loading={loading}>
      <Surface style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <SafeAreaView>
            <BlueHeader />
            <Surface style={styles.mainContainer} elevation={2}>
              <PaperText style={styles.welcomeText}>Welcome, Please Login.</PaperText>
              <PaperTextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.textInput}
                autoCapitalize="none"
                keyboardType="email-address"
                left={<PaperTextInput.Icon icon="email" />}
                mode="outlined"
              />
              <PaperTextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                style={styles.textInput}
                secureTextEntry={true}
                autoCapitalize="none"
                left={<PaperTextInput.Icon icon="key-variant" />} // Changed from 'key' for MDI
                mode="outlined"
              />
              <View style={styles.privacyTextContainer}>
                <PaperText style={styles.privacyText}>
                  By clicking on Login, I confirm that I have read the{' '}
                  <PaperText style={styles.privacyLink} onPress={() => router.navigate('/auth/privacy')}>
                    privacy policy.
                  </PaperText>
                </PaperText>
              </View>

              <PaperButton
                mode="contained"
                onPress={() => { validateDetails() && loginApiCall() }}
                style={styles.loginButton}
                loading={loading}
                disabled={loading}
                labelStyle={{fontSize: DimensionHelper.wp(4.5)}}
              >
                LOGIN
              </PaperButton>

              <View style={styles.loginLinksContainer}>
                <PaperText style={styles.linkText} onPress={() => Linking.openURL(forgotLink)}>
                  Forgot Password
                </PaperText>
                <PaperText style={styles.separatorText}> | </PaperText>
                <PaperText style={styles.linkText} onPress={() => router.navigate("/auth/register")}>
                  Register
                </PaperText>
              </View>

            </Surface>
          </SafeAreaView>
        </ScrollView>
      </Surface>
    </LoadingWrapper>
  )
}

export default Login
