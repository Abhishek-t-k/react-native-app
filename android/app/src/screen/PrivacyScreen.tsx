import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const PrivacyPage = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Privacy Policy</Text>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.introText}>
          Welcome to our privacy policy page. We value your privacy and want to be transparent
          about how we collect, use, and protect your information.
        </Text>

        <Text style={styles.subtitle}>1. Information We Collect</Text>
        <Text style={styles.text}>
          We may collect personal information such as your name, email, and other details that
          you provide when using our services.
        </Text>

        <Text style={styles.subtitle}>2. How We Use Your Information</Text>
        <Text style={styles.text}>
          We use the information to improve our services, provide customer support, and keep you
          informed about updates and news.
        </Text>

        <Text style={styles.subtitle}>3. Data Security</Text>
        <Text style={styles.text}>
          We take the security of your personal data seriously and implement appropriate measures
          to protect it from unauthorized access.
        </Text>

        <Text style={styles.subtitle}>4. Third-Party Services</Text>
        <Text style={styles.text}>
          We may share your data with trusted third-party service providers to help us operate
          and improve our services. These providers are required to protect your information
          according to this policy.
        </Text>

        <Text style={styles.subtitle}>5. Your Rights</Text>
        <Text style={styles.text}>
          You have the right to access, update, or delete your personal information at any time.
          Please contact us if you have any questions or concerns.
        </Text>

        <Text style={styles.subtitle}>6. Changes to This Policy</Text>
        <Text style={styles.text}>
          We may update this privacy policy from time to time. Any changes will be posted on this
          page, and the date of the latest revision will be indicated at the top.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4B0082', // Indigo color
  },
  contentContainer: {
    marginBottom: 30,
  },
  introText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4B0082', // Indigo color
    marginTop: 20,
  },
  text: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
});

export default PrivacyPage;
