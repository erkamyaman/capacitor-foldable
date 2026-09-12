export interface FoldablePlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
}
