import { Promise } from 'bluebird'
import * as pm2Cb from 'pm2'
import * as swStats from 'swagger-stats'
import { uuid } from 'uuidv4'

/* if you use Bluebird, it makes using PM2 API easier, creating *Async functions */
const pm2 = Promise.promisifyAll(pm2Cb) as any

/** Total timeout for workers, ms */
const TIMEOUT = 2000
const promClient = swStats.getPromClient()
/** The global message topic for gathering Prometheus metrics */
const TOPIC = 'get_prom_register'
/** Singleton instance of PM2 message bus */
let pm2Bus: { off: (arg0: string) => void, on: (arg0: string, arg1: (packet: ResponsePacket) => void) => void }
const instanceId = Number(process.env.pm_id)

/* Info returned by pm2.list() */
interface PM2InstanceData {
  pm_id: number
}

/** Response packet sent to the master instance */
interface ResponsePacket {
  type: string
  data: {
    instanceId: number
    register: any
    success: boolean
    reqId: string
  }
}

/** IPC request packet sent from the master instance to the others */
interface RequestPacket {
  topic: 'get_prom_register'
  data: {
    /** ID if the master instance */
    targetInstanceId: number
    /** Unique request ID to prevent collisions from multiple requests */
    reqId: string
  }
}

/** Every process listens on the IPC channel for the metric request TOPIC,
 responding with Prometheus metrics when needed. */
process.on('message', (packet: RequestPacket) => {
  try {
    if (packet.topic === TOPIC) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      process.send({
        type: `process:${packet.data.targetInstanceId}`,
        data: {
          instanceId,
          register: promClient.register.getMetricsAsJSON(),
          success: true,
          reqId: packet.data.reqId,
        },
      } as ResponsePacket)
    }
  }
  catch (e) {
    console.error('Error sending metrics to master node', e)
  }
})

async function requestNeighboursData(instancesData: PM2InstanceData[], reqId: string) {
  const requestData: RequestPacket = {
    topic: TOPIC,
    data: {
      targetInstanceId: instanceId,
      reqId,
    },
  }

  const promises = []
  for (const instanceData of Object.values(instancesData)) {
    const targetId = instanceData.pm_id
    // don't send message to self
    if (targetId !== instanceId) {
      promises.push(pm2.sendDataToProcessIdAsync(targetId, requestData).catch((e: any) => console.error(e)))
    }
  }

  // Resolves when all responses have been received
  return Promise.all(promises)
}

/** Master process gathering aggregated metrics data */
async function getAggregatedRegistry(instancesData: PM2InstanceData[]) {
  if (!instancesData || !instancesData.length) {
    return
  }

  // assigning a unique request ID
  const reqId = uuid()

  const registryPromise = new Promise<any>((resolve, reject) => {
    const instancesCount = instancesData.length
    const registersPerInstance: any[] = []
    const busEventName = `process:${instanceId}`
    // master process metrics
    registersPerInstance[instanceId] = promClient.register.getMetricsAsJSON()
    let registersReady = 1

    const finish = () => {
      // deregister event listener to prevent memory leak
      pm2Bus.off(busEventName)
      resolve(promClient.AggregatorRegistry.aggregate(registersPerInstance))
    }

    // we can only resolve/reject this promise once
    // this safety timeout deregisters the listener in case of an issue
    const timeout = setTimeout(finish, TIMEOUT)

    /** Listens to slave instances' responses */
    pm2Bus.on(busEventName, (packet: ResponsePacket) => {
      try {
        if (packet.data.reqId === reqId) {
          // array fills up in order of responses
          registersPerInstance[packet.data.instanceId] = packet.data.register
          // eslint-disable-next-line no-plusplus
          registersReady++

          if (registersReady === instancesCount) {
            // resolve when all responses have been received
            clearTimeout(timeout)
            finish()
          }
        }
      }
      catch (e) {
        reject(e)
      }
    })
  })

  // request instance data after the response listener has been set up
  // we are not awaiting, resolution is handled by the bus event listener
  requestNeighboursData(instancesData, reqId)

  // eslint-disable-next-line consistent-return
  return registryPromise
}

/** Main middleware function */
export default async function swaggerStatsMetrics(req: any, res: { send: (arg0: string) => void }, _next: any) {
  try {
    // create or use bus singleton
    pm2Bus = pm2Bus || (await pm2.launchBusAsync())
    // get current instances (threads) data
    const instancesData = await pm2.listAsync()
    if (instancesData.length > 1) {
      // multiple threads - aggregate
      const register = await getAggregatedRegistry(instancesData)
      res.send(register.metrics())
    }
    else {
      // 1 thread - send local stats
      res.send(swStats.getPromStats())
    }
  }
  catch (e) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    throw new Error(e)
  }
}
