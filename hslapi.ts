import { gql } from "@apollo/client";


export interface HslStopTimeWithoutPatterns {
    scheduledArrival: number,
    realtimeArrival: number,
    arrivalDelay: number,
    scheduledDeparture: number,
    realtimeDeparture: number,
    departureDelay: number,
    realtime: boolean,
    realtimeState: string,
    serviceDay: number,
    headsign: string,
    trip: { routeShortName: string }
}


export interface HslArrivalQueryResponse {
    stop: {
        name: string,
        stoptimesWithoutPatterns: HslStopTimeWithoutPatterns[]
    }
}

export interface HslNode {
    stop: {
        gtfsId: string,
        name: string
    }
    distance: number
}

interface HslEdge {
    node: HslNode
}

export interface HslStopsByRadius {
    stopsByRadius: {
        edges: HslEdge[]
    }
}

export const getStopsByRadiusQuery = (latitude: number, longitude: number) => gql`
query { 
  stopsByRadius(lat:${latitude}, lon:${longitude}, radius:500) {
      edges {
        node {
          stop {
            gtfsId
            name
          }
          distance
        }
      }
  }
}`

export const getStopDetailsQuery = (stopId: string) => gql`
query {
    stop(id: "${stopId}") {
        name
        stoptimesWithoutPatterns {
          scheduledArrival
          realtimeArrival
          arrivalDelay
          scheduledDeparture
          realtimeDeparture
          departureDelay
          realtime
          realtimeState
          serviceDay
          headsign
          trip{
            routeShortName
          }
        }
    }  
}`