'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
// Components
import { Button } from '@/components/Button';
// Types
import { RecipeWithRelations } from '@/types';

type Props = {
  recipe: RecipeWithRelations
  backHref: string
};

export const CookMode = ({ recipe, backHref }: Props) => {
  const steps = recipe.steps;
  const t = useTranslations('cookMode');
  const [stepIndex, setStepIndex] = useState(0);
  const [showIngredients, setShowIngredients] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const currentStep = steps[stepIndex];

  useEffect(() => {
    const acquireWakeLock = async () => {
      if ('wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        }
        catch {
          // wake lock not available, ignore
        }
      }
    };
    acquireWakeLock();
    return () => {
      wakeLockRef.current?.release();
    };
  }, []);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimerRunning(false);
  }, []);

  useEffect(() => {
    // Reset timer state when step changes
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTimerRunning(false);

    setTimerRemaining(currentStep?.timerSeconds ?? null);
  }, [stepIndex, currentStep?.timerSeconds]);

  const stopSpeaking = useCallback(() => {
    if (speechSupported) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [speechSupported]);

  useEffect(() => {
    // Stop speech when step changes
    if (speechSupported) window.speechSynthesis.cancel();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSpeaking(false);
  }, [stepIndex, speechSupported]);

  useEffect(() => {
    return () => {
      if (speechSupported) window.speechSynthesis.cancel();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const speakInstruction = () => {
    if (!speechSupported) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentStep.instruction);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const startTimer = () => {
    if (!timerRemaining) return;
    setTimerRunning(true);
    intervalRef.current = setInterval(() => {
      setTimerRemaining((prev) => {
        if (prev === null || prev <= 1) {
          stopTimer();
          try {
            new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAA').play().catch(() => {});
          }
          catch {}
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetTimer = () => {
    stopTimer();
    setTimerRemaining(currentStep?.timerSeconds ?? null);
  };

  const goTo = (i: number) => {
    stopTimer();
    stopSpeaking();
    setStepIndex(i);
  };

  const mins = timerRemaining !== null ? Math.floor(timerRemaining / 60) : 0;
  const secs = timerRemaining !== null ? timerRemaining % 60 : 0;

  if (steps.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-stone-50 px-4">
        <p className="text-stone-500">{t('noSteps')}</p>
        <Link href={backHref} className="mt-4 text-stone-700 underline">
          {t('goBack')}
        </Link>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-stone-50 overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-stone-200">
        <Link href={backHref} className="text-sm text-stone-500 hover:text-stone-700 transition-colors">
          ←
          {' '}
          {recipe.title}
        </Link>
        <span className="text-sm text-stone-400">
          {stepIndex + 1}
          {' '}
          /
          {steps.length}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowIngredients(v => !v)}
        >
          {t('ingredients')}
        </Button>
      </div>

      {showIngredients && (
        <div className="border-b border-stone-200 bg-white px-4 py-4">
          <h3 className="text-sm font-medium text-stone-700 mb-2">{t('ingredients')}</h3>
          <ul className="space-y-1 text-sm text-stone-600">
            {recipe.ingredients.map(ing => (
              <li key={ing.id} className="flex gap-2">
                {(ing.quantity || ing.unit) && (
                  <span className="text-stone-400 min-w-[4rem]">
                    {ing.quantity}
                    {' '}
                    {ing.unit}
                  </span>
                )}
                <span>{ing.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center px-6 py-8 max-w-2xl mx-auto w-full">
        {currentStep.imageUrl && (
          <div className="mb-6 relative h-64">
            <Image
              src={currentStep.imageUrl}
              alt=""
              fill
              className="object-cover rounded-xl"
              sizes="(max-width: 672px) 100vw, 672px"
            />
          </div>
        )}
        <p className="text-2xl leading-relaxed text-stone-900 sm:text-3xl">
          {currentStep.instruction}
        </p>

        {speechSupported && (
          <div className="mt-4 flex items-center gap-3">
            {!isSpeaking
              ? (
                  <Button
                    variant="secondary"
                    size="md"
                    shape="pill"
                    onClick={speakInstruction}
                    className="flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M10.5 3.75a.75.75 0 0 0-1.264-.546L5.203 7H2.667a.75.75 0 0 0-.75.75v4.5c0 .414.336.75.75.75h2.536l4.033 3.796a.75.75 0 0 0 1.264-.546V3.75ZM13.463 4.6a.75.75 0 0 1 1.06.038 9 9 0 0 1 0 12.723.75.75 0 0 1-1.098-1.022 7.5 7.5 0 0 0 0-10.678.75.75 0 0 1 .038-1.061Zm-1.92 2.31a.75.75 0 0 1 1.06.04 6 6 0 0 1 0 8.497.75.75 0 1 1-1.1-1.02 4.5 4.5 0 0 0 0-6.456.75.75 0 0 1 .04-1.06Z" />
                    </svg>
                    {t('readAloud')}
                  </Button>
                )
              : (
                  <Button
                    variant="secondary"
                    size="md"
                    shape="pill"
                    onClick={stopSpeaking}
                    className="flex items-center gap-2 bg-stone-100 text-stone-700 hover:bg-stone-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M5.25 3A2.25 2.25 0 0 0 3 5.25v9.5A2.25 2.25 0 0 0 5.25 17h9.5A2.25 2.25 0 0 0 17 14.75v-9.5A2.25 2.25 0 0 0 14.75 3h-9.5Z" />
                    </svg>
                    {t('stop')}
                  </Button>
                )}
          </div>
        )}

        {timerRemaining !== null && (
          <div className="mt-8 flex items-center gap-4">
            <span className="text-4xl font-semibold tabular-nums text-stone-900">
              {String(mins).padStart(2, '0')}
              :
              {String(secs).padStart(2, '0')}
            </span>
            <div className="flex gap-2">
              {!timerRunning
                ? (
                    <Button
                      variant="primary"
                      size="md"
                      shape="pill"
                      onClick={startTimer}
                      disabled={timerRemaining === 0}
                    >
                      {timerRemaining === 0 ? t('done') : t('startTimer')}
                    </Button>
                  )
                : (
                    <Button
                      variant="secondary"
                      size="md"
                      shape="pill"
                      onClick={stopTimer}
                    >
                      {t('pause')}
                    </Button>
                  )}
              {(timerRemaining !== currentStep.timerSeconds || timerRunning) && (
                <Button
                  variant="secondary"
                  size="md"
                  shape="pill"
                  onClick={resetTimer}
                >
                  {t('reset')}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 px-4 pb-8 pt-4">
        <Button
          variant="secondary"
          size="xl"
          shape="square"
          onClick={() => goTo(stepIndex - 1)}
          disabled={stepIndex === 0}
          className="flex-1"
        >
          {t('back')}
        </Button>
        <div className="flex gap-1">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === stepIndex ? 'bg-primary-500' : 'bg-stone-300'
              }`}
            />
          ))}
        </div>
        <Button
          variant="secondary"
          size="xl"
          shape="square"
          onClick={() => goTo(stepIndex + 1)}
          disabled={stepIndex === steps.length - 1}
          className="flex-1"
        >
          {t('next')}
        </Button>
      </div>
    </div>
  );
};
