export interface GaplessFunctionInfo {
  gaplessKey: string;
  executionID: string;
  args: any[];
}

export type GaplessFunctionResult<T> = GaplessFunctionInfo &{
  result: T;
};

export type GaplessFunctionRequest = GaplessFunctionInfo & {
  // Maybe I'll regret making this its own type even though it's empty, but who cares
};

