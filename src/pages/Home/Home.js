import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { Row, Col, Image } from 'react-bootstrap';

import PageContent from '../../components/layout/PageContent';
import Icon from '../../components/icons';

import withLinks from '../../helpers/withLinks';
import { URL_PATH_PREFIX } from '../../redux/helpers/api/tools';

const Home = ({ links: { GITHUB_BUGS_URL } }) => (
  <PageContent
    title={
      <FormattedMessage
        id="app.homepage.title"
        defaultMessage="ReCodEx — Code Examinator Reloaded"
        description="Homepage title"
      />
    }
    description={
      <FormattedMessage
        id="app.homepage.description"
        defaultMessage="ReCodEx - homepage"
        description="Homepage description"
      />
    }>
    <div>
      <Row style={{ marginTop: '80px' }}>
        <Col sm={6}>
          <Image
            src={`${URL_PATH_PREFIX}/public/logo.png`}
            className="img-responsive center-block"
          />
        </Col>
        <Col sm={6}>
          <h2>
            <FormattedMessage
              id="app.homepage.whatIsRecodex"
              defaultMessage="What is ReCodEx?"
            />
          </h2>
          <p>
            <FormattedMessage
              id="app.homepage.whatIsRecodexContent"
              defaultMessage="ReCodEx is a system for dynamic analysis and evaluation of programming exercises. It is a set of components, which allows assigning practical programming problems to students by theit supervisors throught web interface. After solving the problem students upload their solution to the system and ReCodEx automaticaly evaluates them (typically checking corectness of program output) and assigns corresponding amount of points. Students have quick feedback about their solution and supervisors does not have to manually check each solution for basic coretness (like that the program compiles and gives correct results in reasonable time)."
            />
          </p>
        </Col>
      </Row>
      <Row style={{ marginTop: '40px' }}>
        <Col sm={6}>
          <h2>
            <FormattedMessage
              id="app.homepage.aboutTitle"
              defaultMessage="About"
            />
          </h2>
          <p>
            <FormattedHTMLMessage
              id="app.homepage.aboutContentP1"
              defaultMessage='ReCodEx was born in 2016 as final work for <i>Software project</i> class. It is replacement for old system CodEx used at MFF UK since 2006. The project is opensource under <a href="https://opensource.org/licenses/MIT">MIT</a> licence hosted on <a href="https://github.com/ReCodEx">GitHub</a>. More detailed info is on <a href="https://github.com/ReCodEx/wiki/wiki">Wiki</a> page of the project.'
            />
          </p>
          <p>
            <FormattedHTMLMessage
              id="app.homepage.aboutContentP2"
              defaultMessage='During development was found number of <a href="https://github.com/ReCodEx/wiki/wiki/Conclusion#further-improvements">topics</a> for following student works of differend kinds. In case of interest in make this project more awesome, please contact one of the <a href="https://github.com/orgs/ReCodEx/people">authors</a> or teachers.'
            />
          </p>
          <p>
            <FormattedMessage
              id="app.homepage.howToGiveFeedback"
              defaultMessage="For any kind of feedback, either positive or negative, feel free to create an issue on GitHub. Just please give your feedback the tag 'feedback' so we can distinguish those from bugs. We will try to respond to your feedback and we will see if there is something that can be done about it. We thank you for all your feedback in advance!"
            />
          </p>
        </Col>
        <Col sm={6}>
          <h2>
            <FormattedMessage
              id="app.homepage.acknowledgementTitle"
              defaultMessage="Acknowledgement"
            />
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
              defaultMessage='If you have any issues with ReCodEx, please consult the <a href="https://github.com/ReCodEx/wiki/wiki/User-documentation">user documentation</a> first.'
            />
          </p>
        </Col>
        <Col sm={6}>
          <h2>
            <FormattedMessage
              id="app.homepage.whereToReportBugs"
              defaultMessage="Where can I report bugs?"
            />
          </h2>
          <p>
            <FormattedMessage
              id="app.homepage.whereToReportBugsText"
              defaultMessage="Every software contains bugs and we are well avare of this fact. From time to time you might find a bug that nobody else has reported and which has not been fixed yet. Please report all bugs to our issue tracker on GitHub - just file a new issue and give it a label 'bug'. We will try to investigate and release a bugfix as soon as possible."
            />
          </p>
          <p className="text-center">
            <a
              href={GITHUB_BUGS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-flat btn-default">
              <Icon icon={['fab', 'github']} gapRight />
              <FormattedMessage
                defaultMessage="ReCodEx Webapp Repository"
                id="app.homepage.githubWebappRepository"
              />
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
