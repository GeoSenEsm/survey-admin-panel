import { SectionVisibilityTrigger } from "./section.visibility.trigger";

export interface NumberRangeModel {
    from: number,
    to: number,
    step: number,
    sectionVisibilityTrigger: SectionVisibilityTrigger
}