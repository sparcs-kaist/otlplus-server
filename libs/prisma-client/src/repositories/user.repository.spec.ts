import { PrismaService } from '../prisma.service'
import { UserRepository } from './user.repository'

it('does not look up an arbitrary user when a token has no sid', async () => {
  const findFirst = jest.fn()
  const repository = new UserRepository({ session_userprofile: { findFirst } } as unknown as PrismaService)
  expect(await repository.findBySid(undefined as unknown as string)).toBeNull()
  expect(await repository.findBySid('')).toBeNull()
  expect(findFirst).not.toHaveBeenCalled()
})
