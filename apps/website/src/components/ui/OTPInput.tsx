'use client';

import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

export interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  onComplete?: (value: string) => void;
  ariaLabel?: string;
  status?: 'default' | 'success' | 'error';
  size?: 'md' | 'lg';
}

export function OTPInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  readOnly = false,
  autoFocus = false,
  onComplete,
  ariaLabel = 'One-time passcode',
  status = 'default',
  size = 'lg',
}: OTPInputProps) {
  const cellsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [focusIdx, setFocusIdx] = useState<number | null>(null);

  const digits = value.padEnd(length, ' ').slice(0, length).split('');

  useEffect(() => {
    if (!autoFocus) return;
    cellsRef.current[0]?.focus();
  }, [autoFocus]);

  useEffect(() => {
    if (value.replace(/\s/g, '').length === length) onComplete?.(value);
  }, [value, length, onComplete]);

  function setDigit(idx: number, digit: string, advance = true) {
    const char = digit.replace(/\D/g, '').slice(-1) || ' ';
    const arr = value.padEnd(length, ' ').split('');
    arr[idx] = char;
    const newVal = arr.join('').replace(/\s+$/g, '');
    onChange(newVal);
    if (advance && idx + 1 < length && char !== ' ') {
      cellsRef.current[idx + 1]?.focus();
      setFocusIdx(idx + 1);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>, idx: number) {
    if (readOnly || disabled) return;
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (value[idx] !== ' ' && value[idx] !== undefined) {
        setDigit(idx, ' ', false);
      } else if (idx > 0) {
        cellsRef.current[idx - 1]?.focus();
        setFocusIdx(idx - 1);
        setDigit(idx - 1, ' ', false);
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      e.preventDefault();
      cellsRef.current[idx - 1]?.focus();
      setFocusIdx(idx - 1);
    } else if (e.key === 'ArrowRight' && idx + 1 < length) {
      e.preventDefault();
      cellsRef.current[idx + 1]?.focus();
      setFocusIdx(idx + 1);
    } else if (e.key === 'Enter') {
      if (value.replace(/\s/g, '').length === length) {
        onComplete?.(value);
      }
    }
  }

  function onPaste(e: ClipboardEvent<HTMLInputElement>, idx: number) {
    if (readOnly || disabled) return;
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length - idx);
    if (!text) return;
    const arr = value.padEnd(length, ' ').split('');
    for (let i = 0; i < text.length && idx + i < length; i++) {
      arr[idx + i] = text[i];
    }
    const newIdx = Math.min(idx + text.length, length - 1);
    onChange(arr.join('').replace(/\s+$/g, ''));
    cellsRef.current[newIdx]?.focus();
    setFocusIdx(newIdx);
  }

  function onInput(e: React.ChangeEvent<HTMLInputElement>, idx: number) {
    if (readOnly || disabled) return;
    setDigit(idx, e.target.value);
  }

  const sizeClass = size === 'lg'
    ? 'h-14 w-12 sm:h-16 sm:w-14 text-2xl'
    : 'h-12 w-10 text-xl';

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex justify-center gap-2 sm:gap-2.5"
      onBlur={() => setFocusIdx(null)}
    >
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { cellsRef.current[i] = el; }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={d === ' ' ? '' : d}
          onChange={(e) => onInput(e, i)}
          onKeyDown={(e) => onKeyDown(e, i)}
          onPaste={(e) => onPaste(e, i)}
          onFocus={() => setFocusIdx(i)}
          disabled={disabled}
          readOnly={readOnly}
          aria-label={`Digit ${i + 1} of ${length}`}
          className={cn(
            'text-center font-medium tabular-nums transition-[border-color,box-shadow,transform] duration-fast ease-spring',
            sizeClass,
            'rounded-md bg-surface border focus:outline-none',
            status === 'error' && 'ring-warm',
            status === 'success' && 'border-accent ring-accent',
            status === 'default' && 'border-border hover:border-border-hover focus:border-accent focus:ring-accent',
            focusIdx === i && 'border-accent ring-accent scale-[1.02]',
            disabled && 'opacity-50 cursor-not-allowed',
            readOnly && 'cursor-default'
          )}
        />
      ))}
    </div>
  );
}
