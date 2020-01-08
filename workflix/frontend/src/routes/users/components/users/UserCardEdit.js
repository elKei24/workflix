// @flow

import React from 'react'
import { sortBy } from 'lodash'
import type { ProcessGroupType } from '../../../../modules/datatypes/ProcessGroup'
import type { UserRoleType, UserType } from '../../../../modules/datatypes/User'
import TitledCard from '../TitledCard'
import IconRow from '../IconRow'
import listIfNeeded from '../../listIfNeeded'
import { Button, ButtonGroup } from '@blueprintjs/core'
import { Intent } from '@blueprintjs/core/lib/cjs/common/intent'
import ProcessGroupMultiSelect from '../../../../modules/common/components/ProcessGroupMultiselect'
import { toastifyError } from '../../../../modules/common/toastifyError'

type PropsType = {|
  user: UserType,
  processGroups: Map<number, ProcessGroupType>,
  roles: Map<number, UserRoleType>,
  onSetEditing: (boolean) => void
|}

type StateType = {|
  selectedGroups: ProcessGroupType[],
  loading: boolean
|}

class UserCardEdit extends React.Component<PropsType, StateType> {
  state = {
    selectedGroups: this.props.user.processGroupIds.map(id => this.props.processGroups.get(id)).filter(Boolean),
    loading: false
  }

  onSave = () => {
    this.setState({ loading: true })
    Promise.resolve(null) // TODO do the real saving
      .then(() => {
        this.setState({ loading: false })
        this.props.onSetEditing(false)
      })
      .catch(toastifyError)
  }

  onCancel = () => this.props.onSetEditing(false)
  onSelectedGroupsChanged = (selectedGroups: ProcessGroupType[]) => this.setState({ selectedGroups })

  render () {
    const { user, processGroups, roles } = this.props
    const { loading, selectedGroups } = this.state
    const usersRoles = sortBy(user.userRoleIds.map(id => roles.get(id)).filter(Boolean),
      role => role.name)
    return <TitledCard key={user.id} title={user.name}>
        <IconRow icon='person'>{user.displayname}</IconRow>
        <IconRow icon='envelope'><a href={`mailto:${user.email}`}>{user.email}</a></IconRow>
        <IconRow icon='office'>
          <ProcessGroupMultiSelect allGroups={processGroups} selectedGroups={selectedGroups}
                                   onSelectionChanged={this.onSelectedGroupsChanged}/>
        </IconRow>
        <IconRow icon='badge'>
          {listIfNeeded(usersRoles, role => role.id,
            role => role.name)}
        </IconRow>
      <ButtonGroup fill style={{ marginTop: '5px' }}>
        <Button onClick={this.onSave} icon='floppy-disk' small text='Save' intent={Intent.PRIMARY} loading={loading}/>
        <Button onClick={this.onCancel} icon='undo' small text='Cancel' intent={Intent.DANGER} loading={loading}/>
      </ButtonGroup>
    </TitledCard>
  }
}

export default UserCardEdit
