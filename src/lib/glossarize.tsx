import { Children, Fragment, type ReactNode } from 'react';
import { GlossaryText } from '../components/ui/Glossary';

/**
 * Applies <GlossaryText> to the direct string children of an element,
 * e.g. a markdown paragraph, list item or table cell. Text inside links,
 * bold text and headings is left alone.
 */
export function glossarize(children: ReactNode): ReactNode {
  return Children.map(children, (child, index) =>
    typeof child === 'string' ? (
      <Fragment key={index}>
        <GlossaryText text={child} />
      </Fragment>
    ) : (
      child
    )
  );
}
