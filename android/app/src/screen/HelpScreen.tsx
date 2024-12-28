import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';

const HelpScreen = () => {

  const handleContactSupport = () => {
    const email = 'help@example.com';
    Linking.openURL(`mailto:${email}?subject=Support Request`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Help Center</Text>
      <Text style={styles.content}>
        If you have any questions or issues, please contact our support team.
      </Text>

      {/* Button to contact support */}
      <TouchableOpacity style={styles.button} onPress={handleContactSupport}>
        <Text style={styles.buttonText}>Contact Support</Text>
      </TouchableOpacity>

      {/* Additional FAQs or troubleshooting */}
      <View style={styles.faqContainer}>
        <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
        <Text style={styles.faqContent}>1. How do I reset my password?</Text>
        <Text style={styles.faqContent}>2. How can I update my profile?</Text>
        <Text style={styles.faqContent}>3. What should I do if I face technical issues?</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#8134AF',
  },
  content: {
    fontSize: 16,
    textAlign: 'center',
    color: 'indigo',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#8134AF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  faqContainer: {
    marginTop: 20,
    alignItems: 'flex-start',
  },
  faqTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8134AF',
  },
  faqContent: {
    fontSize: 16,
    color: 'indigo',
    marginVertical: 5,
  },
});

export default HelpScreen;
