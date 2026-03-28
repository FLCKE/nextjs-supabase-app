/**
 * Moneroo Test Numbers and Scenarios
 * For sandbox/development testing
 */

export interface TestScenario {
  phone: string;
  scenario: 'success' | 'failed' | 'pending';
  currency: string;
  description: string;
}

// Test phone numbers for USD (US) - simulating different transaction scenarios
export const MONEROO_TEST_NUMBERS: TestScenario[] = [
  {
    phone: '4149518161',
    scenario: 'success',
    currency: 'USD',
    description: 'Successful transaction',
  },
  {
    phone: '4149518162',
    scenario: 'failed',
    currency: 'USD',
    description: 'Failed transaction',
  },
  {
    phone: '4149518163',
    scenario: 'pending',
    currency: 'USD',
    description: 'Pending transaction',
  },
];

/**
 * Check if a phone number is a test number
 */
export function isTestPhoneNumber(phone: string): boolean {
  return MONEROO_TEST_NUMBERS.some(
    (test) =>
      test.phone === phone ||
      phone.includes('4149518161') ||
      phone.includes('4149518162') ||
      phone.includes('4149518163')
  );
}

/**
 * Get test scenario for a phone number
 */
export function getTestScenario(phone: string): TestScenario | undefined {
  return MONEROO_TEST_NUMBERS.find(
    (test) =>
      test.phone === phone ||
      phone.includes('4149518161') ||
      phone.includes('4149518162') ||
      phone.includes('4149518163')
  );
}

/**
 * Flag to check if we're in test mode
 */
export function isTestMode(): boolean {
  return process.env.NODE_ENV === 'development' || 
         process.env.NEXT_PUBLIC_MONEROO_TEST_MODE === 'true';
}
