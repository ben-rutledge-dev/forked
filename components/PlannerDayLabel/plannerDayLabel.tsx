type PlannerDayLabelProps = {
  dateStr: string
  isToday?: boolean
};

export const PlannerDayLabel: React.FC<PlannerDayLabelProps> = (props) => {
  const { dateStr, isToday = false } = props;
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const weekday = new Intl.DateTimeFormat(undefined, { weekday: 'short', timeZone: 'UTC' }).format(date).toUpperCase();
  const dayNum = date.getUTCDate();

  return (
    <div className="w-10 shrink-0 pt-0.5 text-center">
      <p className={`text-[10px] font-semibold uppercase tracking-wide ${isToday ? 'text-primary-500' : 'text-stone-400 dark:text-stone-500'}`}>
        {weekday}
      </p>
      <p className={`text-base font-semibold leading-tight ${isToday ? 'text-primary-600' : 'text-stone-700 dark:text-stone-300'}`}>
        {dayNum}
      </p>
    </div>
  );
};
