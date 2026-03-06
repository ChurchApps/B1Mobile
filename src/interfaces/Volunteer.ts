import { PlanInterface, PositionInterface, TimeInterface } from "@churchapps/helpers";

export interface PositionWithCount extends PositionInterface {
  filledCount: number;
}

export interface SignupPlanData {
  plan: PlanInterface & { signupDeadlineHours?: number; showVolunteerNames?: boolean };
  positions: PositionWithCount[];
  times: TimeInterface[];
}
