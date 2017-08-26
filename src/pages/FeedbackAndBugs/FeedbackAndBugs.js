import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import Icon from 'react-fontawesome';

import PageContent from '../../components/layout/PageContent';
import withLinks from '../../hoc/withLinks';

const FeedbackAndBugs = ({ links: { GITHUB_BUGS_URL } }) =>
  <PageContent
    title={
      <FormattedMessage
        id="app.feedbackAndBugs.title"
        defaultMessage="Feedback and Bugs Reporting"
      />
    }
    description={
      <FormattedMessage
        id="app.feedbackAndBugs.description"
        defaultMessage="Ooh.. you found a bug?"
      />
    }
  >
    <div>
      <Row>
        <Col sm={6}>
          <h2>
            <FormattedMessage
              id="app.feedbackAndBugs.whereToReportBugs"
              defaultMessage="Where can I report bugs?"
            />
          </h2>
          <p>
            <FormattedMessage
              id="app.feedbackAndBugs.whereToReportBugsText"
              defaultMessage="Every software contains bugs and we are well avare of this fact. From time to time you might find a bug that nobody else has reported and which hasn't been fixed yet. Please report all bugs to our issue tracker on GitHub - just file a new issue and give it a label 'bug'. We will try to investigate and release a bugfix as soon as possible."
            />
          </p>
          <p>
            <FormattedMessage
              id="app.feedbackAndBugs.contribution"
              defaultMessage="If you are interested in frontend web development, feel free to fix the bug itself and send a pull request! Any help will be much appreciated!"
            />
          </p>
        </Col>
        <Col sm={6}>
          <h2>
            <FormattedMessage
              id="app.feedbackAndBugs.feedbackTitle"
              defaultMessage="How can I give you feedback?"
            />
          </h2>
          <p>
            <FormattedMessage
              id="app.feedbackAndBugs.howToGiveFeedback"
              defaultMessage="For any kind of feedback, either positive or negative, feel free to create an issue on GitHub. Just please give your feedback the tag 'feedback' so we can distinguish those from bugs. We will try to respond to your feedback and we will see if there is something that can be done about it. We thank you for all your feedback in advance!"
            />
          </p>
        </Col>
      </Row>
      <Row>
        <Col lg={12}>
          <p className="text-center">
            <a href={GITHUB_BUGS_URL} className="btn btn-flat btn-default">
              <Icon name="github" />{' '}
              <FormattedMessage
                defaultMessage="Open ReCodEx webapp repository"
                id="app.recodex.bugsAndFeedbackUrl"
              />
            </a>
          </p>
        </Col>
      </Row>
    </div>
  </PageContent>;

FeedbackAndBugs.propTypes = {
  links: PropTypes.object
};

export default withLinks(FeedbackAndBugs);
