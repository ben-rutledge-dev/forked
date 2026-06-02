export type Payload = {
  entryId: string
};

export type PatchEntryPayload = {
  entryId: string
  slotId: string
  date: string
  orderIndex: number
};

export type Params = {
  mealPlanId?: string
  startDate?: string
};
