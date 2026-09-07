type StepGuideProps = {
  lines: string[];
};

export function StepGuide({ lines }: StepGuideProps) {
  return (
    <aside className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
      <p className="font-semibold text-foreground">Helpful guide</p>
      <ul className="mt-2 list-disc space-y-1 pl-4">
        {lines.map((line) => <li key={line}>{line}</li>)}
      </ul>
    </aside>
  );
}
