import { KeyboardSensor, PointerSensor, useSensor, useSensors, type PointerSensorOptions } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

type Params = {
  activationConstraint?: PointerSensorOptions['activationConstraint']
};

export const useDndSensors = ({ activationConstraint }: Params = {}) => useSensors(
  useSensor(PointerSensor, activationConstraint ? { activationConstraint } : undefined),
  useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
);
