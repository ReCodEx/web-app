import React from 'react';
import PropTypes from 'prop-types';

// For the time being, highlighed text is handled by simple style (may be changed in the future)
const HIGHLIGH_STYLE = {
  backgroundColor: 'yellow',
};

/**
 * Split the stirng in tokens which are complete decomposition of the original
 * (when joined by empty string, we get the original). Even tokens are matches, odd ones comprise the rest.
 * @param {string} str stirng to be decomposed
 * @param {string} regex regular expression that match highlighted parts (without separator or flags)
 * @returns {string[]} array of tokens
 */
const splitHighlightedTokens = (str, regex) => {
  const regexObj = new RegExp(regex, 'gd');
  const res = [];
  let match = null;
  let lastIdx = 0; // index of first unprocessed character
  while ((match = regexObj.exec(str))) {
    const [startIdx, endIdx] = match.indices[0];
    res.push(str.substr(lastIdx, startIdx - lastIdx)); // prefix is inserted as odd (not-highlighted) token
    res.push(str.substr(startIdx, endIdx - startIdx)); // matched substring is inserted as even token
    lastIdx = endIdx;
  }

  if (lastIdx < str.length) {
    res.push(str.substr(lastIdx)); // end of the original needs to be appended at odd position
  }
  return res;
};

// Inset panel replaces old <Well> component from bootstrap 3
const HighlightedText = React.memo(({ children, regex }) => (
  <>
    {splitHighlightedTokens(children, regex).map((str, idx) =>
      idx % 2 === 1 ? (
        <span key={idx} style={HIGHLIGH_STYLE}>
          {str}
        </span>
      ) : (
        str
      )
    )}
  </>
));

HighlightedText.propTypes = {
  regex: PropTypes.string.isRequired,
  children: PropTypes.string.isRequired,
};

export default HighlightedText;
