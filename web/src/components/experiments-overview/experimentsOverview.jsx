/* eslint-disable implicit-arrow-linebreak */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Navbar from '../navbar/navbar';
import ProjectContainer from '../projectContainer';
import './experimentsOverview.css';
import pipelinesApi from '../../apis/PipelinesApi';
import {
  SKIPPED,
  filesForExperimentsDetails,
} from '../../dataTypes';
import ExperimentDetails from '../experiment-details/experimentDetails';
import ExperimentCard from './experimentCard';

class ExperimentsOverview extends Component {
  constructor(props) {
    super(props);
    const project = this.props.projects.selectedProject;

    this.state = {
      project,
      branches: [],
      experiments: [],
      selectedExperiment: null,
    };

    this.setSelectedExperiment = this.setSelectedExperiment.bind(this);
    const branches = this.props.branches.filter((branch) => branch.name.startsWith('experiment'));
    pipelinesApi.getPipesByProjectId(project.id).then((res) => {
      const pipes = res.filter((pipe) => pipe.status !== SKIPPED);
      const experiments = branches.map((branch) => {
        const pipeBranch = pipes.filter((pipe) => pipe.ref === branch.name)[0];
        if (pipeBranch) {
          const experiment = {};
          experiment.status = pipeBranch.status;
          experiment.name = branch.name;
          experiment.authorName = branch.author_name;
          experiment.commit = branch.commit;
          return experiment;
        }

        return null;
      });

      this.setState({ experiments });
    });
  }

  setSelectedExperiment(experiment) {
    this.setState({ selectedExperiment: experiment });
  }

  handleButtonsClick(e) {
    e.target.parentNode.childNodes.forEach((childNode) => {
      if (childNode.id !== e.target.id) {
        childNode.classList.remove('active-border-light-blue');
        childNode.classList.add('non-active-black-border');
      }
    });
    e.target.classList.add('active-border-light-blue');
    e.target.classList.remove('non-active-black-border');
  }

  render() {
    const { project, selectedExperiment, experiments } = this.state;
    return (
      <div id="experiments-overview-container">
        <Navbar />
        <ProjectContainer
          project={project}
          activeFeature="experiments"
          folders={['Group Name', project.name, 'Data', 'Experiments']}
        />
        <br />
        <br />
        <div className="main-content">
          {selectedExperiment === null && (
          <>
            <br />
            <div id="line" />
            <br />
          </>
          )}
          {selectedExperiment === null && (
          <div id="buttons-container">
            <button
              id="all"
              type="button"
              className="non-active-black-border experiment-button"
              onClick={(e) => this.handleButtonsClick(e)}
            >
                            All
            </button>
            <button
              id="running"
              type="button"
              className="non-active-black-border experiment-button"
              onClick={(e) => this.handleButtonsClick(e)}
            >
                            Running
            </button>
            <button
              id="open"
              type="button"
              className="non-active-black-border experiment-button"
              onClick={(e) => this.handleButtonsClick(e)}
            >
                            Open
            </button>
            <button
              id="completed"
              type="button"
              className="non-active-black-border experiment-button"
              onClick={(e) => this.handleButtonsClick(e)}
            >
                            Completed
            </button>
            <button
              id="aborted"
              type="button"
              className="non-active-black-border experiment-button"
              onClick={(e) => this.handleButtonsClick(e)}
            >
              Aborted
            </button>
            <Link
              id="new-experiment"
              to={`/my-projects/${project.id}/new-experiment`}
              style={{ height: '0.1em' }}
              className="light-green-button experiment-button"
            >
              <b>
                New experiment
              </b>
            </Link>
          </div>
          )}
          {selectedExperiment === null
            && experiments.map((experiment, index) =>
              experiment && (
              <ExperimentCard
                key={`${experiment.name}-${index}`}
                params={{
                  projectId: project.id,
                  currentState: experiment.status,
                  experiments: [{
                    currentState: experiment.status,
                    descTitle: experiment.name,
                    userName: experiment.commit.author_name,
                    percentProgress: '100',
                    eta: '0',
                    modelTitle: 'Resnet 50',
                    timeCreatedAgo: experiment.commit.created_at,
                    averageParams: [],
                    data: {},
                  }],
                }}
                setSelectedExperiment={this.setSelectedExperiment}
              />
              ))}
          {selectedExperiment
            && (
            <ExperimentDetails
              setNullExperiment={this.setSelectedExperiment}
              experiment={selectedExperiment}
              files={filesForExperimentsDetails}
            />
            )}
        </div>
        <br />
        <br />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    projects: state.projects,
    branches: state.branches,
  };
}

export default connect(mapStateToProps)(ExperimentsOverview);