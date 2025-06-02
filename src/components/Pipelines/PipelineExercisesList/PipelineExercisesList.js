import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Table } from 'react-bootstrap';
import { injectIntl, FormattedMessage } from 'react-intl';
import { lruMemoize } from 'reselect';

import Button, { TheButtonGroup } from '../../widgets/TheButton';
import { DetailIcon, EditIcon, LimitsIcon, LoadingIcon, TestsIcon, WarningIcon } from '../../icons';
import { resourceStatus } from '../../../redux/helpers/resourceManager';
import { getLocalizedName } from '../../../helpers/localizedData.js';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import withLinks from '../../../helpers/withLinks.js';

const COLLAPSE_LIMIT = 50;
const PREVIEW_SIZE = 10;

const nameComparator = locale => (a, b) =>
  getLocalizedName(a, locale).localeCompare(getLocalizedName(b, locale), locale);

const preprocessExercises = lruMemoize((exercises, locale, offset = 0, limit = 1000) =>
  exercises
    .toJS()
    .sort(nameComparator(locale))
    .slice(offset >= exercises.size ? offset : 0, offset + Math.max(limit, 10))
);

const PipelineExercisesList = ({
  pipelineExercises = null,
  intl: { locale },
  links: {
    EXERCISE_URI_FACTORY,
    EXERCISE_EDIT_URI_FACTORY,
    EXERCISE_EDIT_CONFIG_URI_FACTORY,
    EXERCISE_EDIT_LIMITS_URI_FACTORY,
  },
}) => {
  const [fullView, setFullView] = useState(false);

  if (!pipelineExercises || pipelineExercises === resourceStatus.PENDING) {
    return (
      <div className="text-center p-2">
        <LoadingIcon gapRight={2} />
        <FormattedMessage id="generic.loading" defaultMessage="Loading..." />
      </div>
    );
  }

  if (pipelineExercises === resourceStatus.REJECTED) {
    return (
      <div className="text-center p-2">
        <WarningIcon gapRight={2} className="text-danger" />
        <FormattedMessage id="app.resourceRenderer.loadingFailed" defaultMessage="Loading failed." />
      </div>
    );
  }

  const exercises = preprocessExercises(
    pipelineExercises,
    locale,
    0,
    fullView || pipelineExercises.size < COLLAPSE_LIMIT ? 1000000 : PREVIEW_SIZE
  );
  return (
    <Table hover={pipelineExercises.size > 0} className="mb-1" size="xs">
      {pipelineExercises.size > 0 && (
        <thead>
          <tr>
            <th className="ps-4">
              <FormattedMessage id="generic.name" defaultMessage="Name" />
            </th>
            <th>
              <FormattedMessage id="generic.author" defaultMessage="Author" />
            </th>
            <th className="shrink-col text-nowrap">
              {pipelineExercises.size > 5 && (
                <small className="text-body-secondary">
                  <FormattedMessage
                    id="app.pipelineExercisesList.totalCount"
                    defaultMessage="Total exercises: {count}"
                    values={{ count: pipelineExercises.size }}
                  />
                </small>
              )}
            </th>
          </tr>
        </thead>
      )}

      <tbody>
        {exercises.map(exercise => (
          <tr key={exercise.id}>
            <td className="ps-4">{getLocalizedName(exercise, locale)}</td>
            <td>
              <UsersNameContainer
                userId={exercise.authorId}
                showEmail="icon"
                noAvatar={exercises.length > COLLAPSE_LIMIT}
                noAutoload
                listItem
              />
            </td>
            <td className="shrink-col text-nowrap">
              {exercise.canViewDetail && (
                <TheButtonGroup>
                  <Link to={EXERCISE_URI_FACTORY(exercise.id)}>
                    <Button size="xs" variant="secondary">
                      <DetailIcon gapRight={2} />
                      <FormattedMessage id="generic.detail" defaultMessage="Detail" />
                    </Button>
                  </Link>

                  <Link to={EXERCISE_EDIT_URI_FACTORY(exercise.id)}>
                    <Button size="xs" variant="warning">
                      <EditIcon gapRight={2} />
                      <FormattedMessage id="app.exercises.listEdit" defaultMessage="Settings" />
                    </Button>
                  </Link>

                  <Link to={EXERCISE_EDIT_CONFIG_URI_FACTORY(exercise.id)}>
                    <Button size="xs" variant="warning">
                      <TestsIcon gapRight={2} />
                      <FormattedMessage id="app.exercises.listEditConfig" defaultMessage="Tests" />
                    </Button>
                  </Link>

                  <Link to={EXERCISE_EDIT_LIMITS_URI_FACTORY(exercise.id)}>
                    <Button size="xs" variant="warning">
                      <LimitsIcon gapRight={2} />
                      <FormattedMessage id="app.exercises.listEditLimits" defaultMessage="Limits" />
                    </Button>
                  </Link>
                </TheButtonGroup>
              )}
            </td>
          </tr>
        ))}

        {pipelineExercises.size === 0 && (
          <tr>
            <td className="text-center text-body-secondary" colSpan={3}>
              <FormattedMessage
                id="app.pipelineExercisesList.empty"
                defaultMessage="There are no exercises using this pipeline at the moment."
              />
            </td>
          </tr>
        )}
      </tbody>

      {pipelineExercises.size >= COLLAPSE_LIMIT && (
        <tfoot>
          <tr>
            <td className="text-center" colSpan={3}>
              {fullView ? (
                <a
                  href=""
                  onClick={ev => {
                    setFullView(false);
                    ev.preventDefault();
                  }}>
                  <FormattedMessage
                    id="app.pipelineExercisesList.collapse"
                    defaultMessage="Collapse the list and show only short preview."
                  />
                </a>
              ) : (
                <a
                  href=""
                  onClick={ev => {
                    setFullView(true);
                    ev.preventDefault();
                  }}>
                  <FormattedMessage
                    id="app.pipelineExercisesList.expand"
                    defaultMessage="Expand the list and show all {count} exercises."
                    values={{ count: pipelineExercises.size }}
                  />
                </a>
              )}
            </td>
          </tr>
        </tfoot>
      )}
    </Table>
  );
};

PipelineExercisesList.propTypes = {
  pipelineExercises: PropTypes.any,
  intl: PropTypes.object.isRequired,
  links: PropTypes.object,
};

export default withLinks(injectIntl(PipelineExercisesList));
