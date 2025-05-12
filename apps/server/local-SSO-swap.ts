import { PrismaClient, session_userprofile } from '@prisma/client'
import { prompt } from 'enquirer'
import * as readline from 'readline'

import settings from './src/settings'

// readline.Interface 인스턴스 생성
class PrismaClientMock extends PrismaClient {
  constructor() {
    const ormOption = settings().ormconfig()
    super(ormOption)
  }
}

const prisma = new PrismaClientMock()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, (input) => resolve(input))
  })
}

function objectToStringWithTabs(obj: object): string {
  // Object.entries를 사용하여 객체의 키-값 쌍을 배열로 변환하고,
  // map 함수를 사용하여 각 키-값 쌍을 문자열로 변환합니다.
  // 각 필드는 "\t"로 구분됩니다.
  // 여기서 value가 객체인 경우, 재귀적으로 처리하거나 JSON.stringify 등을 사용할 수 있습니다.
  const keyValuePairs = Object.entries(obj).map(([_key, value]) => `${value}`)
  // Array.join 메서드를 사용하여 모든 필드를 "\t"로 연결합니다.
  return keyValuePairs.join('\t')
}

function keysToStringWithTabs(obj: object): string {
  // Object.keys 메서드로 객체의 모든 키를 배열로 가져옵니다.
  const keys = Object.keys(obj)

  // Array.join 메서드로 모든 키를 "\t"로 구분하여 하나의 문자열로 합칩니다.
  return keys.join('\t')
}

async function chooseUser(users: session_userprofile[]) {
  console.log(keysToStringWithTabs(users[0]))

  const choices = users.map((user) => ({
    name: objectToStringWithTabs(user),
    value: user.id,
  }))

  const response: { userId: string } = await prompt({
    type: 'select',
    name: 'userId',
    message: 'Choose a user:',
    choices,
  })

  const userId = Number(response.userId.split('\t')[0])

  console.log(`Selected User ID: ${userId}`)
  return userId
}

async function update_sid(email1: string, email2: string) {
  try {
    await prisma.$connect()
    console.log('db connect')

    const users1 = await prisma.session_userprofile.findMany({
      where: {
        email: email1,
      },
      orderBy: {
        date_joined: 'desc',
      },
    })
    if (users1 == null || users1.length === 0) {
      return
    }
    const user1_id = await chooseUser(users1)

    const users2 = await prisma.session_userprofile.findMany({
      where: {
        email: email2,
      },
      orderBy: {
        date_joined: 'desc',
      },
    })

    if (users2 == null || users2.length === 0) {
      return
    }
    const user2_id = await chooseUser(users2)

    const user1 = await prisma.session_userprofile.findUnique({
      where: {
        id: user1_id,
      },
    })

    const user2 = await prisma.session_userprofile.findUnique({
      where: {
        id: user2_id,
      },
    })

    if (user1 == null || user2 == null) {
      console.log('no users with given id')
    }
    await prisma.$transaction(async (tx) => {
      await tx.session_userprofile.update({
        where: {
          id: user1?.id,
        },
        data: {
          sid: user2?.sid,
        },
      })

      await tx.session_userprofile.update({
        where: {
          id: user2?.id,
        },
        data: {
          sid: user1?.sid,
        },
      })

      console.log('Complete Swap Sid')
      return true
    })
  }
  catch (e) {
    console.error(e)
  }
  finally {
    await prisma.$disconnect()
  }
}

async function main() {
  // email1과 email2를 순차적으로 입력받기
  const email1 = await question('Enter email1: ')
  const email2 = await question('Enter email2: ')
  // main 함수 호출

  await update_sid(email1, email2)

  // readline 인터페이스 종료
  rl.close()
  return true
}

main()
  .then(() => {
    console.log('done')
  })
  .catch((e) => {
    console.error(e)
  })
  .finally(() => {
    process.exit(0)
  })
