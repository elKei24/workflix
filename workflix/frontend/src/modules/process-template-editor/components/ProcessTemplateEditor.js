// @flow

import React from 'react'
import ProcessChart from './ProcessChart'
import { Button, Drawer, H2 } from '@blueprintjs/core'
import TaskList from './TaskList'
import TaskTemplateEditor from './TaskTemplateEditor'
import type { UserRoleType, UserType } from '../../datatypes/User'
import ProcessDetailsEditor from './ProcessDetailsEditor'
import { calcGraph } from '../graph-utils'
import type { FilledProcessTemplateType } from '../../api/ProcessApi'

export type IncompleteTaskTemplateType = {|
  id: number,
  name: string,
  description: string,
  estimatedDuration: number,
  necessaryClosings: number,
  responsibleUserRoleId: ?number,
  predecessors: number[]
|}

export type IncompleteProcessTemplateType = {|
  tasks: IncompleteTaskTemplateType[],
  title: string,
  description: string,
  durationLimit: ?number,
  owner: ?UserType
|}

type PropsType = {
  users: Map<string, UserType>,
  userRoles: Map<number, UserRoleType>,
  title: string,
  initialProcessTemplate: IncompleteProcessTemplateType,
  onSave: FilledProcessTemplateType => void
}

type StateType = {|
  ...IncompleteProcessTemplateType,
  selectedTaskId: ?number
|}

class ProcessTemplateEditor extends React.Component<PropsType, StateType> {
  state = {
    ...this.props.initialProcessTemplate,
    selectedTaskId: null
  }

  selectTaskId = (id: number) => {
    this.setState({ selectedTaskId: id })
  }

  taskChanged = (task: IncompleteTaskTemplateType) => {
    this.setState(state => ({
      tasks: state.tasks.map(_task => _task.id === task.id ? task : _task)
    }))
  }

  createTask = () => {
    this.setState(state => {
      const newId = Math.max(...state.tasks.map(node => node.id), -1) + 1
      const newTask: IncompleteTaskTemplateType = {
        id: newId,
        predecessors: [],
        name: '',
        estimatedDuration: 1,
        description: '',
        responsibleUserRoleId: null,
        necessaryClosings: 0
      }
      return {
        tasks: [...state.tasks, newTask],
        selectedTaskId: newId
      }
    })
  }

  unselectTask = () => this.setState({ selectedTaskId: null })

  onDeleteTask = () => {
    this.setState(state => ({
      tasks: state.tasks
        .filter(task => task.id !== state.selectedTaskId)
        .map(task => ({
          ...task,
          predecessors: task.predecessors.filter(id => id !== state.selectedTaskId)
        })),
      selectedTaskId: null
    }))
  }

  onTitleChange = (title: string) => this.setState({ title })
  onDescriptionChange = (description: string) => this.setState({ description })
  onDurationLimitChange = (durationLimit: ?number) => this.setState({ durationLimit })
  onOwnerChange = (owner: ?UserType) => this.setState({ owner })

  onSaveClick = () => {
    const { title, description, durationLimit, owner, tasks } = this.state
    if (!durationLimit || !owner) {
      // todo validate
      return alert('mööp')
    }
    this.props.onSave({
      title,
      description,
      durationLimit,
      ownerId: owner?.id,
      taskTemplates: tasks.map(task => ({
        id: task.id,
        responsibleUserRoleId: task.responsibleUserRoleId || 0,
        name: task.name,
        description: task.description,
        estimatedDuration: task.estimatedDuration,
        necessaryClosings: task.necessaryClosings,
        predecessors: task.predecessors
      }))
    })
  }

  render () {
    const { tasks, title, description, durationLimit, owner, selectedTaskId } = this.state
    const { users, userRoles } = this.props
    const task = tasks.find(task => task.id === selectedTaskId)
    const processedNodes = calcGraph(tasks)
    return <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      marginRight: selectedTaskId !== null ? Drawer.SIZE_SMALL : '0',
      transition: 'margin-right 0.3s'
    }}>
      <div style={{
        display: 'flex',
        flowDirection: 'row',
        marginBottom: '10px',
        justifyContent: 'start',
        alignItems: 'center'
      }}>
        <Button icon='floppy-disk' text='Save' intent='primary' onClick={this.onSaveClick}/>
        <H2 style={{
          display: 'inline',
          marginLeft: '40px'
        }}>{this.props.title}</H2>
      </div>
      <ProcessDetailsEditor durationLimit={durationLimit} onDurationLimitChange={this.onDurationLimitChange}
                            onDescriptionChange={this.onDescriptionChange} description={description}
                            onTitleChange={this.onTitleChange} title={title}
                            users={users} owner={owner} onOwnerChange={this.onOwnerChange}/>
      <div style={{ display: 'flex' }}>
        <TaskList selectedId={selectedTaskId} taskTemplates={processedNodes.map(node => node.data)}
                  createTask={this.createTask} selectTaskId={this.selectTaskId}/>
        <ProcessChart tasks={processedNodes}/>
      </div>
      <Drawer size={Drawer.SIZE_SMALL} hasBackdrop={false} isOpen={task != null} title={task?.name || ''}
              onClose={this.unselectTask} style={{ overflow: 'auto' }}>
        {task &&
        <TaskTemplateEditor task={task} onChange={this.taskChanged} allTasks={tasks} onDelete={this.onDeleteTask}
                            userRoles={userRoles}/>}
      </Drawer>
    </div>
  }
}

export default ProcessTemplateEditor
