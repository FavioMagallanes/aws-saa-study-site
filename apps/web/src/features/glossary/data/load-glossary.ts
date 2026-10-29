import { glossarySchema } from '@arquitecto/contracts/glossary';
import glossaryJson from '../../../../content/glossary.json';

export const glossary = glossarySchema.parse(glossaryJson);
