import { describe, it, expect } from 'vitest';
import {
  isValidStatusTransition,
  getAvailableNextStatuses,
  isTerminalStatus,
  canCancelOrder,
  canReturnOrder,
  STATUS_LABELS,
  VALID_TRANSITIONS,
} from '../../src/features/orders/utils/stateMachine';
import {
  normalizePakistaniPhone,
  matchesPakistaniPhone,
  formatPakistaniPhoneDisplay,
} from '../../src/features/orders/utils/phone';
import {
  orderTrackingSchema,
  updateOrderStatusSchema,
  orderFilterSchema,
} from '../../src/features/orders/validation';

describe('Pakistani COD Order State Machine & Lifecycle Rules', () => {
  it('enforces valid forward state transitions in the COD order lifecycle', () => {
    expect(VALID_TRANSITIONS.PENDING_VERIFICATION).toContain('CONFIRMED');
    expect(STATUS_LABELS.PENDING_VERIFICATION).toBe('Pending Verification');
    expect(isValidStatusTransition('PENDING_VERIFICATION', 'CONFIRMED')).toBe(true);
    expect(isValidStatusTransition('PENDING_VERIFICATION', 'CANCELLED')).toBe(true);
    expect(isValidStatusTransition('CONFIRMED', 'PROCESSING')).toBe(true);
    expect(isValidStatusTransition('CONFIRMED', 'SHIPPED')).toBe(true);
    expect(isValidStatusTransition('PROCESSING', 'SHIPPED')).toBe(true);
    expect(isValidStatusTransition('SHIPPED', 'DELIVERED')).toBe(true);
    expect(isValidStatusTransition('DELIVERED', 'RETURNED')).toBe(true);
  });

  it('blocks illegal status transitions (e.g. jumping DELIVERED -> PENDING_VERIFICATION or modifying CANCELLED orders)', () => {
    expect(isValidStatusTransition('DELIVERED', 'PENDING_VERIFICATION')).toBe(false);
    expect(isValidStatusTransition('CANCELLED', 'CONFIRMED')).toBe(false);
    expect(isValidStatusTransition('RETURNED', 'SHIPPED')).toBe(false);
    expect(isValidStatusTransition('PENDING_VERIFICATION', 'DELIVERED')).toBe(false);
    expect(isValidStatusTransition('CONFIRMED', 'CONFIRMED')).toBe(false);
  });

  it('identifies terminal order statuses correctly', () => {
    expect(isTerminalStatus('CANCELLED')).toBe(true);
    expect(isTerminalStatus('RETURNED')).toBe(true);
    expect(isTerminalStatus('PENDING_VERIFICATION')).toBe(false);
    expect(isTerminalStatus('CONFIRMED')).toBe(false);
    expect(isTerminalStatus('SHIPPED')).toBe(false);
  });

  it('computes allowed next statuses for admin dropdown selector', () => {
    expect(getAvailableNextStatuses('PENDING_VERIFICATION')).toEqual([
      'CONFIRMED',
      'CANCELLED',
    ]);
    expect(getAvailableNextStatuses('SHIPPED')).toEqual([
      'DELIVERED',
      'RETURNED',
    ]);
    expect(getAvailableNextStatuses('CANCELLED')).toEqual([]);
  });

  it('checks cancellation and return eligibility rules', () => {
    expect(canCancelOrder('PENDING_VERIFICATION')).toBe(true);
    expect(canCancelOrder('CONFIRMED')).toBe(true);
    expect(canCancelOrder('PROCESSING')).toBe(true);
    expect(canCancelOrder('SHIPPED')).toBe(false);

    expect(canReturnOrder('SHIPPED')).toBe(true);
    expect(canReturnOrder('DELIVERED')).toBe(true);
    expect(canReturnOrder('CONFIRMED')).toBe(false);
  });
});

describe('Pakistani Mobile Number Normalization & Matching', () => {
  it('normalizes various Pakistani phone number formats to standard 03XX... 11-digit string', () => {
    expect(normalizePakistaniPhone('0300-1234567')).toBe('03001234567');
    expect(normalizePakistaniPhone('0300 1234567')).toBe('03001234567');
    expect(normalizePakistaniPhone('+92300-1234567')).toBe('03001234567');
    expect(normalizePakistaniPhone('923001234567')).toBe('03001234567');
    expect(normalizePakistaniPhone('00923001234567')).toBe('03001234567');
    expect(normalizePakistaniPhone('3001234567')).toBe('03001234567');
  });

  it('matches Pakistani mobile numbers across different user input representations', () => {
    expect(matchesPakistaniPhone('+92300-1234567', '03001234567')).toBe(true);
    expect(matchesPakistaniPhone('0300-1234567', '0300 1234567')).toBe(true);
    expect(matchesPakistaniPhone('0300-1234567', '0301-1234567')).toBe(false);
  });

  it('formats standard 11-digit phone as 03XX-XXXXXXX for UI display', () => {
    expect(formatPakistaniPhoneDisplay('03001234567')).toBe('0300-1234567');
    expect(formatPakistaniPhoneDisplay('+923001234567')).toBe('0300-1234567');
  });
});

describe('Order Validation Zod Schemas', () => {
  it('validates order tracking input with Pakistani mobile verification', () => {
    const valid = orderTrackingSchema.parse({
      orderNumber: '#PK-10001',
      phone: '0300-1234567',
    });
    expect(valid.orderNumber).toBe('#PK-10001');

    expect(() =>
      orderTrackingSchema.parse({
        orderNumber: '#PK-10001',
        phone: '12345',
      })
    ).toThrow(/Please enter a valid 11-digit Pakistani mobile number/);
  });

  it('validates order status change input requiring mandatory audit comment', () => {
    const valid = updateOrderStatusSchema.parse({
      status: 'SHIPPED',
      comment: 'Dispatched via TCS courier with tracking ID #12345',
      restockInventory: true,
    });
    expect(valid.status).toBe('SHIPPED');
    expect(valid.restockInventory).toBe(true);

    expect(() =>
      updateOrderStatusSchema.parse({
        status: 'SHIPPED',
        comment: 'ab',
      })
    ).toThrow(/Audit comment is mandatory/);
  });

  it('validates order filter schema defaults', () => {
    const filter = orderFilterSchema.parse({});
    expect(filter.page).toBe(1);
    expect(filter.limit).toBe(20);
  });
});
