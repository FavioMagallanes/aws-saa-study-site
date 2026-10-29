import guideJson from '../../../../content/exam-guide.json';
import { examGuideSchema } from '../model/exam-guide';

export const examGuide = examGuideSchema.parse(guideJson);
