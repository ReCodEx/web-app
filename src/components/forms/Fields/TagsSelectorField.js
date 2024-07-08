import React from 'react';
import PropTypes from 'prop-types';
import { FormLabel, Badge } from 'react-bootstrap';
import { lruMemoize } from 'reselect';
import classnames from 'classnames';

import { AddIcon, CloseIcon } from '../../icons';
import { getTagStyle } from '../../../helpers/exercise/tags.js';

const activeTagsIndex = lruMemoize(fields => {
  const res = {};
  fields.forEach((_, index) => (res[fields.get(index)] = index));
  return res;
});

const TagsSelectorField = ({ tags = [], fields, label = null }) => {
  const active = activeTagsIndex(fields);

  return (
    <>
      {Boolean(label) && <FormLabel>{label}</FormLabel>}
      <div className="larger">
        {tags.sort().map(tag => (
          <Badge
            key={tag}
            style={getTagStyle(tag)}
            className={classnames({
              'tag-margin': true,
              'halfem-padding': true,
              timid: active[tag] === undefined,
              clickable: true,
            })}
            onClick={() => (active[tag] === undefined ? fields.push(tag) : fields.remove(active[tag]))}>
            {tag}
            {active[tag] === undefined ? <AddIcon gapLeft /> : <CloseIcon gapLeft />}
          </Badge>
        ))}
      </div>
    </>
  );
};

TagsSelectorField.propTypes = {
  tags: PropTypes.array,
  fields: PropTypes.object.isRequired,
  meta: PropTypes.shape({
    active: PropTypes.bool,
    dirty: PropTypes.bool,
    error: PropTypes.any,
    warning: PropTypes.any,
  }).isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  noItems: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  validateEach: PropTypes.func,
};

export default TagsSelectorField;
