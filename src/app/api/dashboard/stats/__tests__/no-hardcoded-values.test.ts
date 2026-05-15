/**
 * Tests de validation - Vérifie que l'API Dashboard Stats
 * ne contient PAS de valeurs hardcodées
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('Dashboard Stats API - No Hardcoded Values', () => {
  const apiFilePath = join(
    process.cwd(),
    'src/app/api/dashboard/stats/route.ts'
  );

  let fileContent: string;

  beforeAll(() => {
    if (existsSync(apiFilePath)) {
      fileContent = readFileSync(apiFilePath, 'utf-8');
    } else {
      fileContent = '';
    }
  });

  describe('Hardcoded Values Detection', () => {
    it('should NOT contain hardcoded top item', () => {
      const hardcodedItemPattern = /['"]Pizza\s+Margherita['"]/gi;
      const matches = fileContent.match(hardcodedItemPattern);

      expect(matches).toBeNull();
    });

    it('should NOT contain hardcoded percentage estimates', () => {
      // Pattern for hardcoded percentages like '+15.2%', '+5.3%', '-2.3%'
      const hardcodedPercentPattern /['"]\+?\d+\.\d+%['"]/g;
      const matches = fileContent.match(hardcodedPercentPattern);

      // Allow calculated percentages but not hardcoded ones
      // Check if percentages are part of a calculation
      if (matches) {
        const hasCalculation = fileContent.includes('.toFixed(1)') ||
                               fileContent.includes('Math.round') ||
                               fileContent.includes('* 100');
        expect(hasCalculation).toBe(true);
      }
    });

    it('should NOT contain hardcoded order IDs', () => {
      // Pattern for hardcoded order IDs like #2400, #2399
      const hardcodedIdPattern /#(2400|2399|2398)/g;
      const matches = fileContent.match(hardcodedIdPattern);

      expect(matches).toBeNull();
    });

    it('should NOT contain hardcoded table assignments', () => {
      // Pattern for hardcoded table like "Table 1", "Table 2" without data lookup
      const lines = fileContent.split('\n');
      let hasHardcodedTable = false;

      lines.forEach((line, index) => {
        // Skip comments and actual data transformations
        if (line.includes('Table') &&
            !line.includes('table?.label') &&
            !line.includes('table.label') &&
            !line.includes('table_id') &&
            !line.includes('//') &&
            line.includes('`Table')) {
          hasHardcodedTable = true;
        }
      });

      expect(hasHardcodedTable).toBe(false);
    });
  });

  describe('Real Data Fetching', () => {
    it('should fetch from order_items for top item', () => {
      const hasOrderItemsFetch = fileContent.includes('order_items') &&
                                  fileContent.includes('menu_item_id');
      expect(hasOrderItemsFetch).toBe(true);
    });

    it('should calculate percentage change from real data', () => {
      const hasPercentageCalc = fileContent.includes('percentageChange') &&
                                fileContent.includes('yesterday') &&
                                (fileContent.includes('/ yesterdayCount') ||
                                 fileContent.includes('/ yesterdayCount'));
      expect(hasPercentageCalc).toBe(true);
    });

    it('should use actual order data for recent orders', () => {
      const hasRealOrders = fileContent.includes('orders') &&
                            fileContent.includes('.sort') &&
                            fileContent.includes('.slice');
      expect(hasRealOrders).toBe(true);
    });

    it('should fetch payments for revenue calculation', () => {
      const hasPaymentsFetch = fileContent.includes('payments') &&
                               fileContent.includes('amount_cts');
      expect(hasPaymentsFetch).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should have try-catch block', () => {
      const hasTryCatch = fileContent.includes('try') &&
                          fileContent.includes('catch');
      expect(hasTryCatch).toBe(true);
    });

    it('should return error response on failure', () => {
      const hasErrorResponse = fileContent.includes('success: false') &&
                               fileContent.includes('status: 500');
      expect(hasErrorResponse).toBe(true);
    });
  });
});
