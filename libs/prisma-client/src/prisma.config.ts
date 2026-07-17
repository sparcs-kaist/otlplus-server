export interface PrismaPostgresUrlOptions {
  readonly datasourceUrl?: string
  host?: string
  port?: number
  user?: string
  password?: string
  database?: string
  connectionLimit?: number
}

export interface PrismaConnectionOptions {
  datasourceUrl?: string
}

export const buildPostgresDatasourceUrl = ({
  datasourceUrl,
  host,
  port = 5432,
  user,
  password,
  database,
  connectionLimit,
}: PrismaPostgresUrlOptions): string | undefined => {
  if (datasourceUrl) {
    const url = new URL(datasourceUrl)

    if (connectionLimit != null && !url.searchParams.has('connection_limit')) {
      url.searchParams.set('connection_limit', String(connectionLimit))
    }

    return url.toString()
  }

  if (!host || !user || !database) {
    return undefined
  }

  const auth = password == null ? encodeURIComponent(user) : `${encodeURIComponent(user)}:${encodeURIComponent(password)}`
  const urlHost = host.includes(':') && !(host.startsWith('[') && host.endsWith(']')) ? `[${host}]` : host
  const url = new URL(`postgresql://${auth}@${urlHost}:${port}/${encodeURIComponent(database)}`)

  if (connectionLimit != null) {
    url.searchParams.set('connection_limit', String(connectionLimit))
  }

  return url.toString()
}
