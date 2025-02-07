export interface Form<T> {
  model: T;
  dirty: boolean;
  status: string;
  errors: unknown;
}
