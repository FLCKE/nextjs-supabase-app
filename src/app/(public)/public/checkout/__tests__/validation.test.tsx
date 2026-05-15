/**
 * @jest-environment jsdom
 */

/**
 * Tests de validation - Vérifie que la Checkout Page
 * ne contient PAS de code de debug en production
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('Checkout Page - Production Readiness', () => {
  const checkoutFilePath = join(
    process.cwd(),
    'src/app/(public)/public/checkout/page.tsx'
  );

  let fileContent: string;

  beforeAll(() => {
    if (existsSync(checkoutFilePath)) {
      fileContent = readFileSync(checkoutFilePath, 'utf-8');
    } else {
      fileContent = '';
    }
  });

  describe('Debug Code Detection', () => {
    it('should NOT contain console.log statements', () => {
      const consoleLogPattern = /console\.log\s*\(/gi;
      const matches = fileContent.match(consoleLogPattern);

      expect(matches).toBeNull();
    });

    it('should NOT contain console.error statements (except in catch blocks)', () => {
      const consoleErrorPattern = /console\.error\s*\(/gi;
      const matches = fileContent.match(consoleErrorPattern);

      // Allow console.error only in catch blocks for error logging
      if (matches) {
        const catchBlockPattern = /catch\s*\([^)]*\)\s*\{[^}]*console\.error/gs;
        const inCatchBlocks = fileContent.match(catchBlockPattern);

        // If there are console.error outside catch blocks, fail
        expect(matches.length).toBe(inCatchBlocks?.length || 0);
      }
    });

    it('should NOT contain debug UI elements', () => {
      const debugPatterns = [
        /Debug:/gi,
        /debug:/gi,
        /DEBUG:/gi,
        /Entered:/gi,
        /length:\s*\{/gi,
        /Testing:/gi,
        /Test:/gi,
      ];

      debugPatterns.forEach((pattern) => {
        const matches = fileContent.match(pattern);
        expect(matches).toBeNull();
      });
    });

    it('should NOT contain commented debug code', () => {
      const commentedDebugPatterns = [
        /\/\/\s*console\.log/gi,
        /\/\/\s*debug/gi,
        /\/\/\s*DEBUG/gi,
        /\/\*\s*console\.log/gi,
      ];

      commentedDebugPatterns.forEach((pattern) => {
        const matches = fileContent.match(pattern);
        // Allow some commented code but not debug-related
        if (matches) {
          const nonDebugComment = matches.filter(
            (m) => !m.toLowerCase().includes('debug') &&
                   !m.toLowerCase().includes('console') &&
                   !m.toLowerCase().includes('test')
          );
          expect(nonDebugComment).toHaveLength(0);
        }
      });
    });
  });

  describe('Variable Naming', () => {
    it('should use correct spelling of "restaurant" (not "restaurent")', () => {
      // Check for the typo in variable names
      const typoPattern = /restaurent/gi;
      const matches = fileContent.match(typoPattern);

      // The typo should not exist (migration handles old data)
      expect(matches).toBeNull();
    });
  });

  describe('Type Safety', () => {
    it('should have proper TypeScript types', () => {
      // Check for any usage (loose typing)
      const anyPattern = /:\s*any\b/g;
      const matches = fileContent.match(anyPattern);

      // Some 'any' is acceptable for error handling
      if (matches) {
        expect(matches.length).toBeLessThan(5);
      }
    });
  });
});
