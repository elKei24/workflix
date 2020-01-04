// @flow

import type { UserType } from '../datatypes/User'
import { safeFetch } from './SafeFetch'

class UsersApi {
  getUsers (): Promise<Map<string, UserType>> {
    return safeFetch('https://wf-backend.herokuapp.com/users')
      .then(response => response.json())
      .then(result => result.users)
      .then((usersArray: UserType[]) => new Map<string, UserType>(usersArray.map(user => [user.id, user])))
  }
}

export default UsersApi
