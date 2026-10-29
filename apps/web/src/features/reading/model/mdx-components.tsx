import type { ElementType, ReactNode } from 'react';
import { CardGrid } from '../components/card-grid/card-grid';
import { ConnectionCard } from '../components/connection-card/connection-card';
import { DecisionBox } from '../components/decision-box/decision-box';
import { DiagramNode } from '../components/diagram-node/diagram-node';
import { OfficialSource } from '../components/official-source/official-source';
import { headingIdFrom } from './heading-id';

interface HeadingProps {
  readonly children?: ReactNode;
}

export const SectionHeading = ({ children }: HeadingProps) => (
  <h2 id={headingIdFrom(children)}>{children}</h2>
);

export const mdxComponents: Record<string, ElementType> = {
  h2: SectionHeading,
  CardGrid,
  ConnectionCard,
  DecisionBox,
  DiagramNode,
  OfficialSource,
};
