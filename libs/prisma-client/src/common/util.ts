export function semesterFilter(year: number, semester: number): { year?: number, semester?: number } {
  let semesterFilters: object = {}
  if (year) {
    semesterFilters = { ...semesterFilters, year }
  }
  if (semester) {
    semesterFilters = { ...semesterFilters, semester }
  }
  return semesterFilters
}

export type orderFilterType = {
  [key: string]: orderFilterType | string
}

function orderDictHelper(orderList: string[], order: string): orderFilterType {
  if (orderList.length === 0) {
    return {}
  }
  if (orderList[0] === '') {
    return orderDictHelper(orderList.slice(1), order)
  }
  if (orderList.length === 1) {
    return { [orderList[0]]: order }
  }
  return { [orderList[0]]: orderDictHelper(orderList.slice(1), order) }
}

export function orderFilter(order: string[] | undefined): orderFilterType[] {
  // TODO: unit test
  if (order === undefined) return []

  const orderFilters: orderFilterType[] = []
  order.forEach((orderList) => {
    const orderBy = orderList.split('-')
    const sortOrder = orderBy[0] === '' ? 'desc' : 'asc'

    const orderDict = orderDictHelper(orderBy[orderBy.length - 1].split('__'), sortOrder)
    orderFilters.push(orderDict)
  })
  return orderFilters
}

export function formatNewLectureCodeWithDot(keyword: string): string {
  // new_code의 .을 수용할 수 있게 과목코드를 바꿔주는 함수

  // 정규식: [알파벳]+[숫자]+ 형식 매칭
  const regex = /^([a-zA-Z]+)(\d+)$/

  // 키워드가 정규식에 매칭되면 변환, 매칭되지 않으면 원래 값을 반환
  const match = keyword.match(regex)
  if (match) {
    const [, letters, numbers] = match // 알파벳 그룹과 숫자 그룹 추출
    return `${letters}.${numbers}` // 알파벳과 숫자 사이에 '.' 삽입
  }

  return keyword // 변환 불가능한 경우 원래 키워드 반환
}
