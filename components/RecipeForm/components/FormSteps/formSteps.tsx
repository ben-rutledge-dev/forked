'use client';

import { useTranslations } from 'next-intl';
// Hooks
import { useListField } from '@/hooks/useListField';
// Components
import { IconButton } from '@/components/IconButton';
import { ImageUpload } from '@/components/ImageUpload';
import { RemoveButton } from '@/components/RecipeForm/components/RemoveButton';
import { Textarea } from '@/components/Textarea';
import { TextInput } from '@/components/TextInput';
import { SectionHeading } from '@/components/Typography';
// Types
import { StepFormData } from '@/types';

type StepItem = StepFormData & { _id: string };

type FormStepsProps = {
  steps: StepItem[]
  actions: ReturnType<typeof useListField<StepItem>>
  emptyStep: () => StepItem
  onError: (msg: string) => void
};

export const FormSteps: React.FC<FormStepsProps> = (props) => {
  const { steps, actions, emptyStep, onError } = props;
  const t = useTranslations('formSteps');

  return (
    <div>
      <div className="mb-3">
        <SectionHeading>{t('heading')}</SectionHeading>
      </div>
      <div className="space-y-0">
        {steps.map((step, i) => (
          <div key={step._id}>
            <div className="flex gap-2 py-1.5">
              <div className="flex flex-col items-center gap-1 pt-1 mr-1">
                <span className="text-xs text-stone-400 dark:text-stone-500 font-medium">{i + 1}</span>
                <IconButton
                  type="button"
                  onClick={() => actions.move(step._id, -1)}
                  disabled={i === 0}
                >
                  ▲
                </IconButton>
                <IconButton
                  type="button"
                  onClick={() => actions.move(step._id, 1)}
                  disabled={i === steps.length - 1}
                >
                  ▼
                </IconButton>
              </div>
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex gap-2 items-center">
                  <Textarea
                    value={step.instruction}
                    onChange={e => actions.update(step._id, 'instruction', e.target.value)}
                    rows={2}
                    placeholder={t('instructionPlaceholder', { step: i + 1 })}
                    className="flex-1"
                  />
                  <RemoveButton onClick={() => actions.remove(step._id)} label={t('removeStep')} />
                </div>
                <div className="flex items-center gap-4 flex-wrap pt-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-stone-500 dark:text-stone-400">{t('timerLabel')}</label>
                    <TextInput
                      type="number"
                      min="0"
                      value={step.timerSeconds}
                      onChange={e => actions.update(step._id, 'timerSeconds', e.target.value)}
                      placeholder={t('timerPlaceholder')}
                      size="xs"
                      fullWidth={false}
                      className="w-28"
                    />
                  </div>
                  <ImageUpload
                    value={step.imageUrl ?? ''}
                    onChange={url => actions.update(step._id, 'imageUrl', url)}
                    onError={onError}
                    label={t('addPhoto')}
                    previewSize="sm"
                  />
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => actions.insert(step._id, emptyStep)}
              className="w-full flex items-center gap-2 py-1 text-xs text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-400 transition-colors group"
            >
              <span className="flex-1 border-t border-dashed border-stone-200 dark:border-stone-700 group-hover:border-stone-400 dark:group-hover:border-stone-500 transition-colors" />
              <span>{t('addStep')}</span>
              <span className="flex-1 border-t border-dashed border-stone-200 dark:border-stone-700 group-hover:border-stone-400 dark:group-hover:border-stone-500 transition-colors" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
