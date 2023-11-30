import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import { identity } from '../../../helpers/common';
import styles from './CodeFragmentSelector.less';

// Process fragments and generate a list of start+end markers sorted by offset.
const _getMarkers = fragments => {
  const res = [];
  fragments.forEach((fragment, idx) => {
    const offset = fragment.o !== undefined ? fragment.o : fragment.offset;
    const length = fragment.l !== undefined ? fragment.l : fragment.length;
    res.push({ offset, idx, start: true }, { offset: offset + length, idx, end: true });
  });
  res.sort((a, b) => a.offset - b.offset);
  return res;
};

// Extracts and formats fragment info into object { fragment, references }.
const _fragment = (content, startOffset, endOffset, refs, selectedFragment) => {
  const isSelected = Boolean(refs[selectedFragment]);
  const refsArr = Object.keys(refs)
    .map(x => Number(x))
    .sort((a, b) => a - b);

  // click and double click data passed to the respective handlers
  // double click works only if there are no signle click actions (as secondary fragments)
  const clickData = refsArr.map(idx => refs[idx].clickData).filter(identity);
  const doubleClickData = refsArr.map(idx => refs[idx].doubleClickData).filter(identity);

  return {
    key: startOffset,
    content: content.substring(startOffset, endOffset),
    isSelected,
    clickData: clickData.length > 0 ? clickData : null,
    // if click is empty, double click may be present
    doubleClickData: clickData.length === 0 && doubleClickData.length > 0 ? doubleClickData : null,
    count: clickData.length || doubleClickData.length,
  };
};

/**
 * Helper that splits the content based on the fragment information and prepares an array of fragments.
 * @return {Array} of objects, each object holds { fragment, selected, next }
 */
const chopContent = (content, fragments, selected) => {
  // get the list of all openings and closings sorted by offset
  const markers = _getMarkers(fragments);
  const res = [];
  const references = {};
  let lastOffset = 0;

  // go through all the markers
  for (let i = 0; i < markers.length; ) {
    const { offset } = markers[i];
    if (offset > content.length) break;

    if (lastOffset < offset) {
      res.push(_fragment(content, lastOffset, offset, references, selected));
    }

    // process all markers at this offset (adjust the open references index)
    lastOffset = offset;
    while (i < markers.length && markers[i].offset === lastOffset) {
      const { idx, start } = markers[i];
      if (start) {
        references[idx] = fragments[idx]; // opening new position
      } else if (references[idx]) {
        delete references[idx]; // closing a position
      }
      ++i;
    }
  }

  if (lastOffset < content.length) {
    res.push(_fragment(content, lastOffset, content.length, references, selected));
  }

  return res;
};

const mouseDownHandler = ev => {
  if (ev.detail > 1) {
    ev.preventDefault();
  }
};

class CodeFragmentSelector extends React.Component {
  render() {
    const { content = '', fragments = [], selected = null, clickHandler = null, doubleClickHandler } = this.props;
    return (
      <pre className={styles.codeFragments}>
        {chopContent(content, fragments, selected).map(
          ({ key, content, isSelected, clickData, doubleClickData, count }) => (
            <span
              key={key}
              className={classnames({
                [styles.selectable]: count > 0,
                [styles.overlap]: count > 1,
                [styles.overlapMore]: count > 2,
                [styles.clickable]: (clickData && clickHandler) || (doubleClickData && doubleClickHandler),
                [styles.selected]: isSelected,
                [styles.secondary]: !clickData && doubleClickData,
              })}
              onClick={
                clickData && clickHandler
                  ? ev => {
                      clickHandler(clickData);
                      ev.preventDefault();
                    }
                  : null
              }
              onDoubleClick={
                doubleClickData && doubleClickHandler
                  ? ev => {
                      doubleClickHandler(doubleClickData);
                      ev.preventDefault();
                    }
                  : null
              }
              onMouseDown={mouseDownHandler}>
              {content}
            </span>
          )
        )}
      </pre>
    );
  }
}

CodeFragmentSelector.propTypes = {
  content: PropTypes.string,
  fragments: PropTypes.array,
  selected: PropTypes.number,
  clickHandler: PropTypes.func,
  doubleClickHandler: PropTypes.func,
};

export default CodeFragmentSelector;
