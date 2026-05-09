'use client';

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

type Props = {
  steps: StepItem[]
  actions: ReturnType<typeof useListField<StepItem>>
  emptyStep: () => StepItem
  onError: (msg: string) => void
};

export const FormSteps = ({ steps, actions, emptyStep, onError }: Props) => (
  <div>
    <div className="mb-3">
      <SectionHeading>Steps</SectionHeading>
    </div>
    <div className="space-y-0">
      {steps.map((step, i) => (
        <div key={step._id}>
          <div className="flex gap-2 py-1.5">
            <div className="flex flex-col items-center gap-1 pt-1 mr-1">
              <span className="text-xs text-stone-400 font-medium">{i + 1}</span>
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
                  placeholder={`Step ${i + 1} instruction`}
                  className="flex-1"
                />
                <RemoveButton onClick={() => actions.remove(step._id)} label="Remove step" />
              </div>
              <div className="flex items-center gap-4 flex-wrap pt-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-stone-500">Timer (seconds)</label>
                  <TextInput
                    type="number"
                    min="0"
                    value={step.timerSeconds}
                    onChange={e => actions.update(step._id, 'timerSeconds', e.target.value)}
                    placeholder="optional"
                    size="xs"
                    fullWidth={false}
                    className="w-28"
                  />
                </div>
                <ImageUpload
                  value={step.imageUrl ?? ''}
                  onChange={url => actions.update(step._id, 'imageUrl', url)}
                  onError={onError}
                  label="Add photo"
                  previewSize="sm"
                />
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => actions.insert(step._id, emptyStep)}
            className="w-full flex items-center gap-2 py-1 text-xs text-stone-400 hover:text-stone-600 transition-colors group"
          >
            <span className="flex-1 border-t border-dashed border-stone-200 group-hover:border-stone-400 transition-colors" />
            <span>+ add step</span>
            <span className="flex-1 border-t border-dashed border-stone-200 group-hover:border-stone-400 transition-colors" />
          </button>
        </div>
      ))}
    </div>
  </div>
);
