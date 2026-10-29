import { AbbreviationHelp } from '../../../glossary/components/abbreviation-help/abbreviation-help';
import { glossary } from '../../../glossary/data/load-glossary';
import type { AbbreviationMatch } from '../../../glossary/model/find-abbreviations';
import { annotateAbbreviations } from '../../model/annotate-abbreviations';
import { mdxComponents } from '../../model/mdx-components';
import type { PageContent } from '../../model/page-content';

interface ReadingBodyProps {
  readonly Content: PageContent;
}

const renderAbbreviation = (match: AbbreviationMatch) => (
  <AbbreviationHelp entry={match.entry}>{match.text}</AbbreviationHelp>
);

export const ReadingBody = ({ Content }: ReadingBodyProps) =>
  annotateAbbreviations(Content({ components: mdxComponents }), glossary, renderAbbreviation);
