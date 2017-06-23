import React from 'react';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { Row, Col, Image } from 'react-bootstrap';

import PageContent from '../../components/layout/PageContent';

const Home = () => (
  <PageContent
    title={
      <FormattedMessage
        id="app.homepage.title"
        defaultMessage="ReCodEx - Code Examinator Reloaded"
        description="Homepage title"
      />
    }
    description={
      <FormattedMessage
        id="app.homepage.description"
        defaultMessage="ReCodEx - homepage"
        description="Homepage description"
      />
    }
  >
    <div>
      <Row style={{ marginTop: '80px' }}>
        <Col sm={6}>
          <Image
            src={'/public/logo.png'}
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
              defaultMessage="ReCodEx was born in 2016 as final work for <i>Software project</i> class. It is replacement for old system CodEx used at MFF UK since 2006. The project is opensource under <a href=&quot;https://opensource.org/licenses/MIT&quot;>MIT</a> licence hosted on <a href=&quot;https://github.com/ReCodEx&quot;>GitHub</a>. More detailed info is on <a href=&quot;https://github.com/ReCodEx/wiki/wiki&quot;>Wiki</a> page of the project."
            />
          </p>
          <p>
            <FormattedHTMLMessage
              id="app.homepage.aboutContentP2"
              defaultMessage="During development was found number of <a href=&quot;https://github.com/ReCodEx/wiki/wiki/Conclusion#further-improvements&quot;>topics</a> for following student works of differend kinds. In case of interest in make this project more awesome, please contact one of the <a href=&quot;https://github.com/orgs/ReCodEx/people&quot;>authors</a> or teachers."
            />
          </p>
        </Col>
        <Col sm={6}>
          <h2>
            <FormattedMessage
              id="app.homepage.androidApp"
              defaultMessage="Android App"
            />
          </h2>
          <p>
            <FormattedHTMLMessage
              id="app.homepage.aboutAndroidApp"
              defaultMessage="We have also developed a simple Android app which can help you check new assignments and your statistics while you are on a tram or a bus."
            />
          </p>
          <p>
            <a href="https://play.google.com/store/apps/details?id=io.github.recodex.android&amp;pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1">
              <Image
                alt={'Get it on Google Play'}
                src={
                  'https://play.google.com/intl/en_us/badges/images/generic/en_badge_web_generic.png'
                }
                width={181}
              />
            </a>
          </p>
        </Col>
      </Row>
      <Row>
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
                src={'/public/matfyz_logo.png'}
                className="img-responsive center-block"
                width={250}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  </PageContent>
);

export default Home;
