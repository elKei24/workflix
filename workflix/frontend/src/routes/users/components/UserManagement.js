// @flow

import React from 'react'
import withPromiseResolver from '../../../modules/app/hocs/withPromiseResolver'
import type { UserRoleType, UserType } from '../../../modules/datatypes/User'
import UsersApi from '../../../modules/api/UsersApi'
import ProcessGroupsApi from '../../../modules/api/ProcessGroupsApi'
import type { ProcessGroupType } from '../../../modules/datatypes/ProcessGroup'
import UserCards from './users/UserCards'
import ProcessGroupCards from './groups/ProcessGroupCards'
import RoleCards from './roles/RoleCards'
import { uniq, without } from 'lodash'

type PropsType = {|
  initialUsers: Map<string, UserType>,
  initialProcessGroups: Map<number, ProcessGroupType>,
  initialRoles: Map<number, UserRoleType>
|}

type StateType = {|
  mode: 'USERS' | 'GROUPS' | 'ROLES',
  users: Map<string, UserType>,
  processGroups: Map<number, ProcessGroupType>,
  roles: Map<number, UserRoleType>
|}

class UserManagement extends React.Component<PropsType, StateType> {
  state = {
    mode: 'USERS',
    users: this.props.initialUsers,
    processGroups: this.props.initialProcessGroups,
    roles: this.props.initialRoles
  }

  onProcessGroupSelected = (group: ProcessGroupType) => {
    this.setState({ mode: 'GROUPS' })
  }

  onRoleSelected = (role: UserRoleType) => {
    this.setState({ mode: 'ROLES' })
  }

  onUserSelected = (user: UserType) => {
    this.setState({ mode: 'USERS' })
  }

  onGroupMembershipAdded = (group: ProcessGroupType, user: UserType) => {
    this.setState(oldState => ({
      processGroups: oldState.processGroups.set(group.id, {
        ...group,
        membersIds: uniq([...group.membersIds, user.id])
      }),
      users: oldState.users.set(user.id, {
        ...user,
        processGroupIds: uniq([...user.processGroupIds, group.id])
      })
    }))
  }

  onGroupMembershipRemoved = (group: ProcessGroupType, user: UserType) => {
    this.setState(oldState => ({
      processGroups: oldState.processGroups.set(group.id, {
        ...group,
        membersIds: without(group.membersIds, user.id)
      }),
      users: oldState.users.set(user.id, {
        ...user,
        processGroupIds: without(user.processGroupIds, group.id)
      })
    }))
  }

  render () {
    const { processGroups, roles, users } = this.state
    switch (this.state.mode) {
      case 'USERS':
        return <UserCards users={users} processGroups={processGroups} roles={roles}
                          onRoleSelected={this.onRoleSelected} onProcessGroupSelected={this.onProcessGroupSelected}
                          onGroupMembershipAdded={this.onGroupMembershipAdded}
                          onGroupMembershipRemoved={this.onGroupMembershipRemoved}/>
      case 'ROLES':
        return <RoleCards roles={roles} users={users} onUserSelected={this.onUserSelected}/>
      case 'GROUPS':
        return <ProcessGroupCards processGroups={processGroups} users={users} onUserSelected={this.onUserSelected}/>
    }
    return null
  }
}

const promiseCreator = () => Promise.all([
  new UsersApi().getUsers(),
  new ProcessGroupsApi().getProcessGroups(),
  new UsersApi().getUserRoles()
])
  .then(([users, processGroups, roles]) => ({
    initialUsers: users,
    initialProcessGroups: processGroups,
    initialRoles: roles
  }))

export default withPromiseResolver<*, *>(promiseCreator)(UserManagement)
