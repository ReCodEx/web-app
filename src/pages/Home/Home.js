import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col, Image } from 'react-bootstrap';
import { connect } from 'react-redux';

import PageContent from '../../components/layout/PageContent';
import UsersNameContainer from '../../containers/UsersNameContainer';
import Icon, {
  AssignmentIcon,
  CodeIcon,
  ExerciseIcon,
  GroupIcon,
  HomeIcon,
  MailIcon,
  ShadowAssignmentIcon,
} from '../../components/icons';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import Markdown from '../../components/widgets/Markdown';
import { getLoggedInUserEffectiveRole } from '../../redux/selectors/users.js';
import { selectedInstance } from '../../redux/selectors/instances.js';
import { isSupervisorRole } from '../../components/helpers/usersRoles.js';
import { getConfigVar, URL_PATH_PREFIX } from '../../helpers/config.js';
import { getLocalizedName, getLocalizedDescription } from '../../helpers/localizedData.js';

const BASIC_HTML = {
  strong: content => <strong>{content}</strong>,
  em: content => <em>{content}</em>,
  code: content => <code>{content}</code>,
};
const EXTERNAL_AUTH_HELPDESK_URL = getConfigVar('EXTERNAL_AUTH_HELPDESK_URL');

const Home = ({ effectiveRole, instance = null, intl: { locale } }) => (
  <PageContent icon={<HomeIcon />} title={<FormattedMessage id="app.homepage.title" defaultMessage="Home Page" />}>
    <div>
      <hr />
      <Row>
        <Col lg={12} xl={6}>
          <Image src={`${URL_PATH_PREFIX}/public/logo.png`} className="text-center m-5 w-100 w-lg-auto" style={{ maxWidth: '66vw' }} />
        </Col>
        <Col lg={12} xl={6}>
          <div className="m-5">
            <h2>
              <FormattedMessage id="app.homepage.aboutReCodEx" defaultMessage="About ReCodEx" />
            </h2>
            <p>
              <FormattedMessage
                id="app.homepage.whatIsRecodexContent"
                defaultMessage="ReCodEx is a system for dynamic analysis and evaluation of programming exercises. It allows the supervisors to assign practical programming problems to students through a web interface. Students upload their solutions as source codes to the system and ReCodEx automatically evaluates them (by compiling and executing the solutions in safe environment). Hence, students get a quick feedback to their solution so they can correct simple mistakes immediately. Furthermore, supervisors do not have to verify functionality of each solution manually which leaves them more time to focus on higher aspects such as the solution code quality."
              />
            </p>
            <a href="https://github.com/ReCodEx" target="_blank" rel="noreferrer">
              <Icon icon={['fab', 'github']} gapRight />
              <FormattedMessage id="app.homepage.githubLink" defaultMessage="GitHub" />
            </a>
            ,
            <a href="https://github.com/ReCodEx/wiki/wiki" target="_blank" rel="noreferrer">
              <Icon icon={['fab', 'wikipedia-w']} largeGapLeft gapRight />
              <FormattedMessage id="app.homepage.wikiLink" defaultMessage="documentation in wiki" />
            </a>
          </div>
        </Col>
      </Row>

      <hr className="my-3" />

      {effectiveRole && (
        <>
          <ResourceRenderer resource={instance} bulkyLoading>
            {instance => (
              <Row>
                <Col xs={false} sm="auto">
                  <h3>
                    <GroupIcon gapLeft gapRight fixedWidth className="text-muted" />
                  </h3>
                </Col>
                <Col xs={12} sm>
                  <h3>{getLocalizedName(instance.rootGroup, locale)}</h3>
                  <Markdown source={getLocalizedDescription(instance.rootGroup, locale)} />

                  <p>
                    <FormattedMessage id="app.homepage.instance.administrator" defaultMessage="Administrator:" />{' '}
                    <strong>
                      <UsersNameContainer userId={instance.adminId} isSimple />,
                    </strong>
                    <a href={EXTERNAL_AUTH_HELPDESK_URL} className="ml-3">
                      <MailIcon gapRight />
                      <FormattedMessage
                        id="app.homepage.instance.techSupport"
                        defaultMessage="Technical support contact"
                      />
                    </a>
                  </p>
                </Col>
              </Row>
            )}
          </ResourceRenderer>

          <hr className="my-3" />
        </>
      )}

      <h2 className="mb-3">
        <FormattedMessage id="app.homepage.quickStart.title" defaultMessage="Quick Start" />
      </h2>

      <Row>
        <Col xs={false} sm="auto">
          <h3>
            <GroupIcon gapLeft gapRight fixedWidth className="text-muted" />
          </h3>
        </Col>
        <Col xs={12} sm>
          <h3>
            <FormattedMessage id="app.homepage.quickStart.groupsTitle" defaultMessage="Groups" />
          </h3>

          <p>
            <FormattedMessage
              id="app.homepage.quickStart.groupsFundamentals"
              defaultMessage="All work is organized in <strong>groups</strong>. A group interconnects coding assignments and people who wish to solve them (referred to as <strong>students</strong>). Groups often reflect real world organizational units like a classes of students or a coding competition events. A group may hold more than one assignment and it may provide complex rules for grading or ranking member users."
              values={BASIC_HTML}
            />
          </p>

          <p>
            <FormattedMessage
              id="app.homepage.quickStart.groupsHierarchy"
              defaultMessage="Groups are organized in a tree so they can better reflect hierarchical structures (e.g., top-level group may correspond to a course whilst its sub-groups correspond to individual lab-groups). The hierarchy is quite important from the perspective of access control. Particularly, a group <strong>admin</strong> is allowed to administrate also the sub-groups. The intermediate nodes of the tree often comprise <strong>organizational</strong> groups (folders for other groups), whilst leaves are regular groups (with students and assignments)."
              values={BASIC_HTML}
            />
          </p>
        </Col>
      </Row>

      {isSupervisorRole(effectiveRole) && (
        <Row>
          <Col xs={false} sm="auto">
            <h3>
              <ExerciseIcon gapLeft gapRight fixedWidth className="text-muted" />
            </h3>
          </Col>
          <Col xs={12} sm>
            <h3>
              <FormattedMessage id="app.homepage.quickStart.exercisesTitle" defaultMessage="Exercises" />
            </h3>

            <p>
              <FormattedMessage
                id="app.homepage.quickStart.exercisesFundamentals"
                defaultMessage="<strong>Exercise</strong> is a template of a coding problem that holds a specification (text in markdown) for the students and various configurations which govern the evaluation process of submitted solutions. Exercises are not visible to students directly, they must be <strong>assigned</strong> to groups first. However, an exercise <strong>resides</strong> in one or more groups which determines the visibility of the exercise to the teachers (an exercise is visible in the group of residence and all transitive sub-groups). In combination with appropriate group hierarchy, the exercises can be easily shared between teachers of the same or related courses (e.g., by placing them into one common root group) whilst separated from other courses."
                values={BASIC_HTML}
              />
            </p>

            <p>
              <FormattedMessage
                id="app.homepage.quickStart.exercisesConfiguration"
                defaultMessage="The exercise configuration has three important parts. The list of enabled <strong>runtime environments</strong> (i.e., programming languages), list of <strong>tests</strong> (sets of inputs and rules for validating outputs), and time and memory <strong>limits</strong> (for each test and runtime environment). Algorithmic exercises tend to offer multiple runtime environments, so a student may choose a programming language of his/her liking, whilst specialized exercises can be set up for one environment only. Some environments are <strong>exclusive</strong>, which means they have specialized configuration that cannot be combined with other environments (e.g., <code>data-only</code> runtime expects that students submits any data instead of source code for evaluation)."
                values={BASIC_HTML}
              />
            </p>

            <p>
              <FormattedMessage
                id="app.homepage.quickStart.exercisesAssignment"
                defaultMessage="The exercise may be assigned to either in <em>Group Assignments</em> page, or into multiple groups at once from the page of the exercise. The assignment actually copies all data of the exercise (including testing configurations), so subsequent modifications of the exercise do not affect already created assignments. An assignment may be explicitly <strong>synchronized</strong> with its original exercise after the exercise is modified."
                values={BASIC_HTML}
              />
            </p>

            <p>
              <FormattedMessage
                id="app.homepage.quickStart.exercisesReferenceSolutions"
                defaultMessage="An exercise may (and <strong>should</strong>) be properly tested without creating an assignment by submitting <strong>reference solutions</strong>. These solutions are evaluated in the same way as regular student solutions, but they are visible only to teachers who can see the exercise. It is strongly recommended to <strong>verify</strong> functionality of each configured runtime environment with at least one ref. solution. Besides the testing, reference solutions may be provided by the author of the exercise to other teachers to demonstrate expected solution(s) of the given problem."
                values={BASIC_HTML}
              />
            </p>
          </Col>
        </Row>
      )}

      <Row>
        <Col xs={false} sm="auto">
          <h3>
            <AssignmentIcon gapLeft gapRight fixedWidth className="text-muted" />
          </h3>
        </Col>
        <Col xs={12} sm>
          <h3>
            <FormattedMessage id="app.homepage.quickStart.assignmentsTitle" defaultMessage="Assignments" />
          </h3>

          <p>
            <FormattedMessage
              id="app.homepage.quickStart.assignmentsFundamentals"
              defaultMessage="<strong>Assignments</strong> are exercises assigned to particular group. An assignment holds copied data of the exercise — a specification (text in markdown) and various configurations which govern the evaluation process of submitted solutions. In addition, the assignment is given a <strong>deadline</strong> and maximal amount of <strong>points</strong> (points awarded for 100% correct solutions). Solutions submitted after the deadline are are still evaluated, but they are awarded no points."
              values={BASIC_HTML}
            />
          </p>

          <p>
            <FormattedMessage
              id="app.homepage.quickStart.assignmentsSolutionLimitations"
              defaultMessage="Assignments employ additional limitations on submissions. The most important one is the maximal number of submissions per student. This limit is mainly imposed to keep the hardware demands of the evaluation system reasonable. Furthermore, the philosophy of the ReCodEx is that the students should submit <strong>finished</strong> solutions, not use ReCodEx for debugging."
              values={BASIC_HTML}
            />
          </p>
        </Col>
      </Row>

      <Row>
        <Col xs={false} sm="auto">
          <h3>
            <CodeIcon gapLeft gapRight fixedWidth className="text-muted" />
          </h3>
        </Col>
        <Col xs={12} sm>
          <h3>
            <FormattedMessage id="app.homepage.quickStart.solutionsTitle" defaultMessage="Submitting Solutions" />
          </h3>

          <p>
            <FormattedMessage
              id="app.homepage.quickStart.solutionsFundamentals"
              defaultMessage="<strong>Solutions</strong> of assignments are submitted as file(s), typically containing the source code (details should be described in the assignment specification). If the assignment allows multiple runtime environments (programming languages), the actual runtime is selected based on the names (extensions) of submitted files. A student may correct the selection in case of ambiguity. Furthermore, some languages (e.g., Python or JavaScript) need to specify the <strong>entry point</strong> — which file holds the main script to be executed (unless the entry point is already specified in the exercise configuration)."
              values={BASIC_HTML}
            />
          </p>

          <p>
            <FormattedMessage
              id="app.homepage.quickStart.solutionsResults"
              defaultMessage="When the solution is evaluated, the ReCodEx will make available the results of the evaluation and award points based on the solution correctness and assignment configuration. Some details (e.g., exact solution outputs) may not be available to students, especially if the testing data are kept secret. Teachers may choose to intervene in the grading process by either assigning <strong>bonus points</strong> or by overriding the points awarded by ReCodEx. Furthermore, the teachers may mark any solution as <strong>revised</strong> (i.e., read by the teacher) or by <strong>accepted</strong> (which also makes ReCodEx ignore all other solutions of the student)."
              values={BASIC_HTML}
            />
          </p>
        </Col>
      </Row>

      {isSupervisorRole(effectiveRole) && (
        <Row>
          <Col xs={false} sm="auto">
            <h3>
              <ShadowAssignmentIcon gapLeft gapRight fixedWidth className="text-muted" />
            </h3>
          </Col>
          <Col xs={12} sm>
            <h3>
              <FormattedMessage
                id="app.homepage.quickStart.shadowAssignmentsTitle"
                defaultMessage="Shadow Assignments"
              />
            </h3>

            <p>
              <FormattedMessage
                id="app.homepage.quickStart.shadowAssignmentsFundamentals"
                defaultMessage="The assignments and their solutions provide quite complex system for grading. Although the supervisor may override grading manually, scored points must be always associated with particular solution (i.e., submitted files). In case the supervisor needs to score additional points not directly associated with students' submissions, shadow assignments provide means just for that."
                values={BASIC_HTML}
              />
            </p>

            <p>
              <FormattedMessage
                id="app.homepage.quickStart.shadowAssignmentsElaborating"
                defaultMessage="Shadow assignment is similar to regular assignment, but students cannot submit any artifacts to ReCodEx. Supervisor may assign points to each user in every shadow assignments and these points are added to the points in a group. Typical use case is to combine points from coding assignments with other form of grading (e.g., lab attendance or a quiz) and let ReCodEx handle the bookkeeping."
                values={BASIC_HTML}
              />
            </p>
          </Col>
        </Row>
      )}

      <hr className="my-3" />

      <h2>
        <FormattedMessage id="app.homepage.acknowledgementTitle" defaultMessage="Acknowledgement" />
      </h2>

      <Row className="pb-4">
        <Col className="align-self-center">
          <FormattedMessage
            id="app.homepage.acknowledgementContent"
            defaultMessage="The initial creation of the project was supported by the Student Grant Program (SFG) of the Faculty of Mathematics and Physics, Charles University. Maintenance and further development is currently funded by School of Computer Science of the same institution."
          />
        </Col>
        <Col xs={12} sm="auto">
          <Image src={`${URL_PATH_PREFIX}/public/matfyz_logo.png`} width={250} />
        </Col>
      </Row>
    </div>
  </PageContent>
);

Home.propTypes = {
  effectiveRole: PropTypes.string,
  instance: ImmutablePropTypes.map,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired,
};

export default connect(state => ({
  effectiveRole: getLoggedInUserEffectiveRole(state),
  instance: selectedInstance(state),
}))(injectIntl(Home));
