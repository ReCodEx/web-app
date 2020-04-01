import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { Row, Col, Image } from 'react-bootstrap';

import PageContent from '../../components/layout/PageContent';
import Icon from '../../components/icons';

import withLinks from '../../helpers/withLinks';
import { URL_PATH_PREFIX } from '../../helpers/config';

const Home = ({ links: { GITHUB_BUGS_URL } }) => (
  <PageContent
    title={
      <FormattedMessage
        id="app.homepage.title"
        defaultMessage="ReCoVid — Code Examinator Reloaded"
        description="Homepage title"
      />
    }
    description={
      <FormattedMessage
        id="app.homepage.description"
        defaultMessage="ReCoVid - homepage"
        description="Homepage description"
      />
    }>
    <div>
      <Row style={{ marginTop: '80px' }}>
        <Col sm={6}>
          <Image src={`${URL_PATH_PREFIX}/public/logo.png`} className="img-responsive center-block" />
        </Col>
        <Col sm={6}>
          <h2>
            <FormattedMessage id="app.homepage.whatIsRecodex" defaultMessage="What is ReCoVid?" />
          </h2>
          <p>
            <FormattedMessage
              id="app.homepage.whatIsRecodexContent"
              defaultMessage="ReCoVid is a system for dynamic analysis and evaluation of programming exercises. It is a set of components that allow supervisors to assign practical programming problems to students through a web interface. After solving each problem, students upload their solution to the system and ReCoVid automaticaly evaluates it (typically checking the correctness of program output) and assigns an appropriate number of points. Students have quick feedback about their solution and supervisors do not have to manually check each solution for basic correctness (like that the program compiles and gives correct results in a reasonable amount of time)."
            />
          </p>
        </Col>
      </Row>
      <Row style={{ marginTop: '40px' }}>
        <Col sm={6}>
          <h2>
            <FormattedMessage id="app.homepage.aboutTitle" defaultMessage="About" />
          </h2>
          <p>
            <FormattedHTMLMessage
              id="app.homepage.aboutContentP1"
              defaultMessage='ReCoVid was born in 2016 as a project for the <i>Software Project</i> class. It is a replacement for the previous system CodEx used at MFF UK since 2006. The project is open source under the <a href="https://opensource.org/licenses/MIT">MIT</a> licence hosted on <a href="https://github.com/ReCodEx">GitHub</a>. More detailed info is on the <a href="https://github.com/ReCodEx/wiki/wiki">Wiki</a> page of the project.'
            />
          </p>
          <p>
            <FormattedHTMLMessage
              id="app.homepage.aboutContentP2"
              defaultMessage='During development we found a number of <a href="https://github.com/ReCodEx/wiki/wiki/Conclusion#further-improvements">topics</a> for subsequent student projects of various kinds. If you are interested in making this project more awesome, please contact one of the <a href="https://github.com/orgs/ReCodEx/people">authors</a> or teachers.'
            />
          </p>
          <p>
            <FormattedMessage
              id="app.homepage.howToGiveFeedback"
              defaultMessage="For any kind of feedback, either positive or negative, feel free to create an issue on GitHub. Just please give your feedback the tag 'feedback' so we can distinguish it from bugs. We will try to respond to your feedback and we will see if there is something that can be done about it. We thank you for all your feedback in advance!"
            />
          </p>
        </Col>
        <Col sm={6}>
          <h2>
            <FormattedMessage id="app.homepage.acknowledgementTitle" defaultMessage="Acknowledgement" />
          </h2>
          <Row>
            <Col sm={6}>
              <p>
                <FormattedHTMLMessage
                  id="app.homepage.acknowledgementContent"
                  defaultMessage="This project was supported by the Student Grant Program (SFG) of the Faculty of Mathematics and Physics, Charles University."
                />
              </p>
            </Col>
            <Col sm={6}>
              <Image
                src={`${URL_PATH_PREFIX}/public/matfyz_logo.png`}
                className="img-responsive center-block"
                width={250}
              />
            </Col>
          </Row>
        </Col>
      </Row>
      <Row>
        <Col sm={6}>
          <h2>
            <FormattedMessage id="app.homepage.help" defaultMessage="Help" />
          </h2>
          <p>
            <FormattedHTMLMessage
              id="app.homepage.helpContent"
              defaultMessage='If you have any issues with ReCoVid, please consult the <a href="https://github.com/ReCodEx/wiki/wiki/User-documentation">user documentation</a> first.'
            />
          </p>
        </Col>
        <Col sm={6}>
          <h2>
            <FormattedMessage id="app.homepage.whereToReportBugs" defaultMessage="Where can I report bugs?" />
          </h2>
          <p>
            <FormattedMessage
              id="app.homepage.whereToReportBugsText"
              defaultMessage="Every software system contains bugs and we are well aware of this fact. From time to time you might find a bug that nobody else has reported and which has not been fixed yet. Please report all bugs to our issue tracker on GitHub - just file a new issue and give it the label 'bug'. We will try to investigate and release a bug fix as soon as possible."
            />
          </p>
          <p className="text-center">
            <a href={GITHUB_BUGS_URL} target="_blank" rel="noopener noreferrer" className="btn btn-flat btn-default">
              <Icon icon={['fab', 'github']} gapRight />
              <FormattedMessage defaultMessage="ReCoVid Webapp Repository" id="app.homepage.githubWebappRepository" />
            </a>
          </p>
        </Col>
      </Row>
    </div>
  </PageContent>
);

Home.propTypes = {
  links: PropTypes.object,
};

export default withLinks(Home);
