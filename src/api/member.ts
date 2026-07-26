import type { ChangePasswordRequest, LoginRequest, MemberResource } from '@/service/types'
import { authLoginUsingPost, authLogoutUsingPost, authMeUsingGet, authPasswordUsingPut } from '@/service/auth'

export type Member = Omit<MemberResource, 'name' | 'email' | 'mobile' | 'last_login_at'> & {
  name: string | null
  email: string | null
  mobile: string | null
  last_login_at: string | null
}
export type LoginCredentials = LoginRequest
export type PasswordChange = ChangePasswordRequest

export async function login(credentials: LoginCredentials, hideErrorToast = false) {
  const response = await authLoginUsingPost({ body: credentials, options: { auth: 'public', hideErrorToast } })
  return response.data as Omit<typeof response.data, 'member'> & { member: Member }
}

export async function getMember() {
  const response = await authMeUsingGet({})
  return response.data.member as Member
}

export async function changePassword(password: PasswordChange) {
  await authPasswordUsingPut({ body: password })
}

export async function logout(accessToken: string) {
  await authLogoutUsingPost({
    options: {
      auth: 'public',
      hideErrorToast: true,
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  })
}
