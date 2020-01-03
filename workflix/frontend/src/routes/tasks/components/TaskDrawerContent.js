// @flow

import React from 'react'
import type { TaskTemplateType, TaskType } from '../../../modules/datatypes/Task'
import styled from 'styled-components'
import TaskAssignmentSelect from './TaskAssignmentSelect'
import TaskComments from './TaskComments'
import type { UserType } from '../../../modules/datatypes/User'
import { H4 } from '@blueprintjs/core'

const StyledContainer = styled<{}, {}, 'div'>('div')`
  margin: 8px;
`

type PropsType = {
  task: TaskType,
  taskTemplates: Map<number, TaskTemplateType>,
  onTaskModified: (TaskType) => void,
  users: Map<string, UserType>
}

class TaskDrawerContent extends React.Component<PropsType> {
  render () {
    const task = this.props.task
    const taskTemplate = this.props.taskTemplates.get(task.taskTemplateId)
    return <StyledContainer>
      <H4>Description</H4>
      <p>{taskTemplate ? taskTemplate.description : ''}</p>

      <H4>Assignee</H4>
      <TaskAssignmentSelect task={task} onTaskModified={this.props.onTaskModified} users={this.props.users}/>

      <H4>Comments</H4>
      <TaskComments task={task} users={this.props.users} onTaskModified={this.props.onTaskModified}/>
    </StyledContainer>
  }
}

export default TaskDrawerContent
