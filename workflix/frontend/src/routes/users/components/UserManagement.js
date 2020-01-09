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
import { mapMap } from '../../../modules/common/mapMap'

type PropsType = {|
  initialUsers: Map<string, UserType>,
  initialProcessGroups: Map<number, ProcessGroupType>,
  initialRoles: Map<number, UserRoleType>
|}

type StateType = {|
  mode: 'USERS' | 'GROUPS' | 'ROLES',
  users: Map<string, UserType>,
  processGroups: Map<number, ProcessGroupType>,
  roles: Map<number, UserRoleType>,
  selectedUserId: ?string,
  selectedGroupId: ?number,
  selectedRoleId: ?number
|}

class UserManagement extends React.Component<PropsType, StateType> {
  state = {
    mode: 'USERS',
    users: this.props.initialUsers,
    processGroups: this.props.initialProcessGroups,
    roles: this.props.initialRoles,
    selectedUserId: null,
    selectedGroupId: null,
    selectedRoleId: null
  }

  onProcessGroupSelected = (group: ?ProcessGroupType) => {
    this.setState({
      mode: 'GROUPS',
      selectedGroupId: group && group.id
    })
  }

  onRoleSelected = (role: ?UserRoleType) => {
    this.setState({
      mode: 'ROLES',
      selectedRoleId: role && role.id
    })
  }

  onUserSelected = (user: ?UserType) => {
    this.setState({
      mode: 'USERS',
      selectedUserId: user && user.id
    })
  }

  onGroupMembershipAdded = (group: ProcessGroupType, user: UserType) => {
    this.setState(oldState => ({
      processGroups: mapMap<number, ProcessGroupType>(oldState.processGroups, (_groupId, _group) =>
        (_groupId !== group.id ? _group : {
          ..._group,
          membersIds: uniq([..._group.membersIds, user.id])
        })),
      users: mapMap<string, UserType>(oldState.users, (_userId, _user) =>
        (_userId !== user.id ? _user : {
          ..._user,
          processGroupIds: uniq([..._user.processGroupIds, group.id])
        }))
    }))
  }

  onGroupMembershipRemoved = (group: ProcessGroupType, user: UserType) => {
    this.setState(oldState => ({
      processGroups: mapMap<number, ProcessGroupType>(oldState.processGroups, (_groupId, _group) =>
        (_groupId !== group.id ? _group : {
          ..._group,
          membersIds: without(_group.membersIds, user.id)
        })),
      users: mapMap<string, UserType>(oldState.users, (_userId, _user) =>
        (_userId !== user.id ? _user : {
          ..._user,
          processGroupIds: without(_user.processGroupIds, group.id)
        }))
    }))
  }

  onRoleMembershipAdded = (role: UserRoleType, user: UserType) => {
    this.setState(oldState => ({
      roles: mapMap<number, UserRoleType>(oldState.roles, (_roleId, _role) =>
        (_roleId !== role.id ? _role : {
          ..._role,
          memberIds: uniq([..._role.memberIds, user.id])
        })),
      users: mapMap<string, UserType>(oldState.users, (_userId, _user) =>
        (_userId !== user.id ? _user : {
          ..._user,
          userRoleIds: uniq([..._user.userRoleIds, role.id])
        }))
    }))
  }

  onRoleMembershipRemoved = (role: UserRoleType, user: UserType) => {
    this.setState(oldState => ({
      roles: mapMap<number, UserRoleType>(oldState.roles, (_roleId, _role) =>
        (_roleId !== role.id ? _role : {
          ..._role,
          memberIds: without(_role.memberIds, user.id)
        })),
      users: mapMap<string, UserType>(oldState.users, (_userId, _user) =>
        (_userId !== user.id ? _user : {
          ..._user,
          userRoleIds: without(_user.userRoleIds, role.id)
        }))
    }))
  }

  render () {
    const { processGroups, roles, users, selectedUserId, selectedGroupId, selectedRoleId } = this.state
    const selectedUser = (selectedUserId && users.get(selectedUserId)) || null
    const selectedRole = (selectedRoleId && roles.get(selectedRoleId)) || null
    const selectedGroup = (selectedGroupId && processGroups.get(selectedGroupId)) || null
    switch (this.state.mode) {
      case 'USERS':
        return <UserCards users={users} processGroups={processGroups} roles={roles} selection={selectedUser}
                          onUserSelected={this.onUserSelected}
                          onRoleSelected={this.onRoleSelected}
                          onProcessGroupSelected={this.onProcessGroupSelected}
                          onGroupMembershipAdded={this.onGroupMembershipAdded}
                          onGroupMembershipRemoved={this.onGroupMembershipRemoved}
                          onRoleMembershipAdded={this.onRoleMembershipAdded}
                          onRoleMembershipRemoved={this.onRoleMembershipRemoved}/>
      case 'ROLES':
        return <RoleCards roles={roles} users={users} onUserSelected={this.onUserSelected} selection={selectedRole}/>
      case 'GROUPS':
        return <ProcessGroupCards processGroups={processGroups} users={users} onUserSelected={this.onUserSelected}
                                  selection={selectedGroup}/>
      default:
        return null
    }
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