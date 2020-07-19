import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { defaultMemoize } from 'reselect';
import { Link } from 'react-router-dom';

import Explanation from '../../widgets/Explanation';
import { NeedFixingIcon, CheckRequiredIcon, LinkIcon } from '../../icons';
import withLinks from '../../../helpers/withLinks';

export const exerciseCalloutsAreVisible = ({ isBroken, hasReferenceSolutions }) => isBroken || !hasReferenceSolutions;

const errorTypes = [
  'no-texts',
  'no-tests',
  'score',
  'no-runtimes',
  'runtimes',
  'no-configs',
  'no-hwgroups',
  'config',
  'limits',
];

const errorMessages = {
  'no-texts': (
    <FormattedMessage
      id="app.exercise.validationErrors.noTexts"
      defaultMessage="Exercise has no specification in any language"
    />
  ),
  'no-tests': <FormattedMessage id="app.exercise.validationErrors.noTests" defaultMessage="Exercise has no tests" />,
  score: (
    <FormattedMessage
      id="app.exercise.validationErrors.score"
      defaultMessage="Algorithm for computing solution correctness is not properly set"
    />
  ),
  'no-runtimes': (
    <FormattedMessage
      id="app.exercise.validationErrors.noRuntimes"
      defaultMessage="Exercise has no runtime environments selected"
    />
  ),
  runtimes: (
    <FormattedMessage
      id="app.exercise.validationErrors.runtimes"
      defaultMessage="Selected runtime environments have no configuration"
    />
  ),
  'no-configs': (
    <FormattedMessage
      id="app.exercise.validationErrors.noConfigs"
      defaultMessage="Configuration of some tests is incorrect or missing"
    />
  ),
  'no-hwgroups': (
    <FormattedMessage
      id="app.exercise.validationErrors.noHwGroups"
      defaultMessage="Exercise has no hardware group selected"
    />
  ),
  config: (
    <FormattedMessage
      id="app.exercise.validationErrors.config"
      defaultMessage="Configuration of some tests is incomplete; this typically happens when you add a test or delete a file"
    />
  ),
  limits: (
    <FormattedMessage
      id="app.exercise.validationErrors.limits"
      defaultMessage="Memory or time limits are not properly set"
    />
  ),
};

const errorLinkCaptions = {
  'no-texts': <FormattedMessage id="app.exercise.validationLinks.noTexts" defaultMessage="update exercise settings" />,
  'no-tests': <FormattedMessage id="app.exercise.validationLinks.tests" defaultMessage="update tests form" />,
  score: <FormattedMessage id="app.exercise.validationLinks.tests" defaultMessage="update tests form" />,
  'no-runtimes': (
    <FormattedMessage id="app.exercise.validationLinks.runtimes" defaultMessage="update runtime environments form" />
  ),
  runtimes: <FormattedMessage id="app.exercise.validationLinks.noConfigs" defaultMessage="update configuration form" />,
  'no-configs': (
    <FormattedMessage id="app.exercise.validationLinks.noConfigs" defaultMessage="update configuration form" />
  ),
  config: <FormattedMessage id="app.exercise.validationLinks.noConfigs" defaultMessage="update configuration form" />,
  'no-hwgroups': (
    <FormattedMessage id="app.exercise.validationLinks.noHwGroups" defaultMessage="select hardware group" />
  ),
  limits: <FormattedMessage id="app.exercise.validationLinks.limits" defaultMessage="update limits form" />,
};

const errorLinks = {
  'no-texts': 'EXERCISE_EDIT_URI_FACTORY',
  'no-tests': 'EXERCISE_EDIT_CONFIG_URI_FACTORY',
  score: 'EXERCISE_EDIT_CONFIG_URI_FACTORY',
  'no-runtimes': 'EXERCISE_EDIT_CONFIG_URI_FACTORY',
  runtimes: 'EXERCISE_EDIT_CONFIG_URI_FACTORY',
  'no-configs': 'EXERCISE_EDIT_CONFIG_URI_FACTORY',
  'no-hwgroups': 'EXERCISE_EDIT_LIMITS_URI_FACTORY',
  config: 'EXERCISE_EDIT_CONFIG_URI_FACTORY',
  limits: 'EXERCISE_EDIT_LIMITS_URI_FACTORY',
};

const errorLinksHashes = {
  'no-texts': '#texts-form',
  'no-tests': '#tests-score-form',
  score: '#tests-score-form',
  'no-runtimes': '#runtimes-form',
  runtimes: '#exercise-config-form',
  'no-configs': '#exercise-config-form',
  'no-hwgroups': '#hwgroup-form',
  config: '#exercise-config-form',
  limits: '#limits-form',
};

const createErrorLink = (tag, exerciseId, links) => {
  if (!errorLinks[tag] || !errorLinkCaptions[tag]) {
    return null;
  }

  const link = links[errorLinks[tag]](exerciseId) + (errorLinksHashes[tag] || '');
  return (
    <React.Fragment>
      (<Link to={link}>{errorLinkCaptions[tag]}</Link>)
    </React.Fragment>
  );
};

const transformErrors = defaultMemoize((errors, exerciseId, links) => {
  const taggedErrors = {};
  errors.split('\n').forEach(error => {
    const match = error.match(/^@(?<tag>[-a-zA-Z0-9_]+)[ ](?<rest>.*)$/);
    let { tag = '@', rest = error } = (match && match.groups) || {};
    if (!errorMessages[tag]) {
      tag = '@';
    }
    if (!taggedErrors[tag]) {
      taggedErrors[tag] = [];
    }
    taggedErrors[tag].push(rest);
  });

  return (
    <React.Fragment>
      {errorTypes
        .filter(tag => taggedErrors[tag])
        .map(tag => (
          <li key={tag}>
            {errorMessages[tag]} {createErrorLink(tag, exerciseId, links)}
            <Explanation
              id={tag}
              title={
                <FormattedMessage
                  id="app.exercise.validationErrors.rawTitle"
                  defaultMessage="Raw message from backend"
                />
              }>
              {taggedErrors[tag].map((error, idx) => (
                <p key={idx}>
                  <code>{error}</code>
                </p>
              ))}
            </Explanation>
          </li>
        ))}

      {taggedErrors['@'] &&
        taggedErrors['@'].map(error => (
          <li key={error}>
            <code>{error}</code>
          </li>
        ))}
    </React.Fragment>
  );
});

const ExerciseCallouts = ({
  id,
  isBroken = false,
  hasReferenceSolutions,
  validationError = null,
  permissionHints = null,
  links,
}) => (
  <React.Fragment>
    {isBroken && (
      <div className="callout callout-warning">
        <h4>
          <NeedFixingIcon gapRight />
          <FormattedMessage
            id="app.exercise.isBroken"
            defaultMessage="Exercise configuration is incomplete and needs fixing."
          />
        </h4>

        {validationError && <ul>{transformErrors(validationError, id, links)}</ul>}
      </div>
    )}

    {!isBroken && !hasReferenceSolutions && (
      <div className="callout callout-info">
        <h4>
          <CheckRequiredIcon gapRight />
          <FormattedMessage
            id="app.exercise.noReferenceSolutions"
            defaultMessage="There are no reference solutions for this exercise yet."
          />
        </h4>
        <p>
          <FormattedMessage
            id="app.exercise.noReferenceSolutionsDetailed"
            defaultMessage="The exercise configuration should be verified on one reference solution at least before it can be assigned."
          />
        </p>
        {permissionHints && permissionHints.addReferenceSolution && (
          <p>
            <FormattedMessage
              id="app.exercise.addReferenceSolutionDetailed"
              defaultMessage="A reference solution can be added on the exercise detail page."
            />
            <Link to={`${links.EXERCISE_URI_FACTORY(id)}#reference-solutions`}>
              <LinkIcon gapLeft />
            </Link>
          </p>
        )}
      </div>
    )}
  </React.Fragment>
);

ExerciseCallouts.propTypes = {
  id: PropTypes.string.isRequired,
  isBroken: PropTypes.bool,
  hasReferenceSolutions: PropTypes.bool,
  validationError: PropTypes.string,
  permissionHints: PropTypes.object,
  links: PropTypes.object,
};

export default withLinks(ExerciseCallouts);
