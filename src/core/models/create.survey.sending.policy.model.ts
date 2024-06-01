import { TimeUnit } from "./time.unit";

export interface CreateSurveySendingPolicyModel{
    surveyId: string,
    start?: Date,
    end?: Date,
    repeatInterval?: number,
    repeatUnit?: TimeUnit
}