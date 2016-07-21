import React, { PropTypes, Component } from 'react';
import Helmet from 'react-helmet';
import { Grid, Col, Row } from 'react-bootstrap';

import PageContent from '../../components/PageContent';
import AssignmentDetails from '../../components/AssignmentDetails';
import SubmitSolutionButton from '../../components/SubmitSolutionButton';
import SubmissionsTable from '../../components/SubmissionsTable';
import SubmitSolutionContainer from '../../containers/SubmitSolutionContainer';

// @todo fetch from the API server
const assignment = {
  id: 'klajhfd415asd',
  title: 'Hrošíci',
  description: `Lorem ipsum dolor sit amet, **consectetur** adipiscing elit. Donec eget ligula elit. Duis vulputate augue ac feugiat iaculis. Quisque hendrerit mauris ligula, et molestie mi auctor sit amet. Nulla purus purus, eleifend a consequat nec, mollis vitae mi. Nulla vitae vulputate nibh. Quisque pellentesque quam non turpis ultrices, gravida vulputate lectus commodo. Maecenas id consectetur ex. Curabitur felis orci, sollicitudin non ipsum eget, convallis finibus sem. Mauris pretium eros at finibus rutrum. Morbi sed laoreet enim. Sed tempor, lorem nec molestie vehicula, elit mauris fermentum est, ut laoreet ligula arcu ut purus. Aenean tincidunt ipsum metus, a mollis eros aliquet a. In vestibulum turpis sed nisi ullamcorper condimentum.

\`\`\`js
var React = require('react');
var Markdown = require('react-markdown');

React.render(
    <Markdown source="# Your markdown here" />,
    document.getElementById('content')
);
\`\`\`

Nullam bibendum ex non convallis tincidunt. Aliquam semper, massa sed tempor molestie, augue nisl volutpat risus, ullamcorper molestie ante ante in diam. Fusce libero eros, fermentum in vestibulum vel, placerat sit amet nibh. Sed in mauris ac justo posuere tempus eget a nisl. Vivamus ut neque a felis feugiat pulvinar eget sed dui. Nunc ut justo magna. Phasellus accumsan nec enim eget semper. Proin at viverra mauris. In ac ultrices nisi. Proin rhoncus facilisis dignissim. Aliquam nulla enim, fringilla eu nunc quis, vulputate feugiat nisl. Sed sit amet placerat sapien. Phasellus consequat iaculis ipsum, maximus bibendum dolor fermentum id. Duis mauris magna, auctor vitae diam id, consectetur fringilla ipsum.`,
  deadline: 1462888755
};

const submissions = [
  { id: 'asdasda', date: 1462888755, percent: 1, description: 'teď už to musí vyjít!' },
  { id: 'asdfds', date: 1462288756, percent: .80, description: 'opraven chybějící středník' },
  { id: 'asdfdg', date: 1462858575, percent: .30, description: '' },
  { id: 'asdfghfgh', date: 1462885855, percent: .10, description: 'využití explicitního zásobníku' },
  { id: 'asdtr', date: 1462888455, percent: .60, description: '' },
  { id: 'asddfgr', date: 1462889855, percent: .57, description: '' }
];

class Assignment extends Component {

  state = { isSubmitSolutionModalOpen: false };

  showSubmissionModal = () => this.setState({ isSubmitSolutionModalOpen: true });
  hideSubmissionModal = () => this.setState({ isSubmitSolutionModalOpen: false });

  render() {
    const { children, params: { assignmentId } } = this.props;
    const { isSubmitSolutionModalOpen } = this.state;

    return (
      <PageContent title={`${assignment.title} - zadání úlohy`}>
        <Row>
          <Col lg={6}>
            <AssignmentDetails
              assignment={assignment} />

            <p className='text-center'>
              <SubmitSolutionButton assignmentId={assignment.id} onClick={this.showSubmissionModal} />
              <SubmitSolutionContainer isOpen={isSubmitSolutionModalOpen} onCancel={this.hideSubmissionModal} />
            </p>
          </Col>
          <Col lg={6}>
            <SubmissionsTable submissions={submissions} assignmentId={assignmentId} />
            {children}
          </Col>
        </Row>
      </PageContent>
    );
  }

}

export default Assignment;
