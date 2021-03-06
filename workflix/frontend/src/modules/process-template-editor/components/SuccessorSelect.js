// @flow

import React from 'react'
import { Button, MenuItem, Tooltip } from '@blueprintjs/core'
import type { ItemPredicate } from '@blueprintjs/select'
import { ItemRenderer, MultiSelect } from '@blueprintjs/select'
import highlightText from '../../common/highlightText'
import { difference } from 'lodash'
import type { IncompleteTaskTemplateType } from '../ProcessTemplateEditorTypes'

type PropsType = {
  task: IncompleteTaskTemplateType,
  onChange: (task: IncompleteTaskTemplateType) => void,
  allTasks: IncompleteTaskTemplateType[],
  succs: IncompleteTaskTemplateType[],
  possibleSuccs: IncompleteTaskTemplateType[]
}

const TemplateSelect = MultiSelect.ofType<IncompleteTaskTemplateType>()

const filterTaskTemplates: ItemPredicate<IncompleteTaskTemplateType> = (query, task, _index, exactMatch) => {
  const normalizedName = task.name.toLocaleLowerCase()
  const normalizedQuery = query.toLocaleLowerCase()
  return exactMatch ? normalizedName === normalizedQuery : normalizedName.indexOf(normalizedQuery) >= 0
}

const tagRenderer = (task: IncompleteTaskTemplateType) => task.name

class SuccessorSelect extends React.Component<PropsType> {
  renderTaskTemplate: ItemRenderer<IncompleteTaskTemplateType> = (task, { handleClick, modifiers, query }) => {
    if (!modifiers.matchesPredicate) {
      return null
    }
    const menuItem = <MenuItem
      active={modifiers.active}
      disabled={modifiers.disabled}
      icon={modifiers.disabled ? 'disable' : task.predecessors.includes(this.props.task.id) ? 'tick' : 'blank'}
      key={task.id}
      onClick={handleClick}
      shouldDismissPopover={false}
      text={highlightText(task.name, query)}/>
    return modifiers.disabled ? <div key={task.id}><Tooltip content='Adding this would create a cyclic dependency.'>
        {menuItem}
      </Tooltip></div>
      : menuItem
  }

  handleTagRemove = (_tag: string, index: number) => {
    const { task, onChange, succs } = this.props
    const successor = succs[index]
    onChange({
      ...successor,
      predecessors: difference(successor.predecessors, [task.id])
    })
  }

  handleClearSuccs = () => {
    const { succs, onChange, task } = this.props
    succs.forEach(successor => onChange({
      ...successor,
      predecessors: difference(successor.predecessors, [task.id])
    }))
  }

  itemDisabled = (item: IncompleteTaskTemplateType) => this.props.possibleSuccs.indexOf(item) < 0

  render () {
    const { task, allTasks, succs } = this.props

    const clearButton = task.predecessors.length > 0 &&
      <Button icon='key-backspace' minimal onClick={this.handleClearSuccs}/>

    return <TemplateSelect
      items={allTasks}
      itemPredicate={filterTaskTemplates}
      itemRenderer={this.renderTaskTemplate}
      tagRenderer={tagRenderer}
      itemDisabled={this.itemDisabled}
      tagInputProps={{
        onRemove: this.handleTagRemove,
        rightElement: clearButton
      }}
      fill
      selectedItems={succs}
      onItemSelect={this.handleSuccTaskSelect}
      popoverProps={{ usePortal: false }}
      resetOnSelect
    />
  }

  handleSuccTaskSelect = (selectedTask: IncompleteTaskTemplateType) => {
    const { task, onChange } = this.props
    if (selectedTask.predecessors.indexOf(task.id) < 0) {
      onChange({
        ...selectedTask,
        predecessors: [...selectedTask.predecessors, task.id]
      })
    } else {
      onChange({
        ...selectedTask,
        predecessors: difference(selectedTask.predecessors, [task.id])
      })
    }
  }
}

export default SuccessorSelect
