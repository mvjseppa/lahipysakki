/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native'

import {
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen'

import GetLocation from 'react-native-get-location'

import { ApolloClient, InMemoryCache, ApolloProvider, useQuery } from '@apollo/client'

import {getStopDetailsQuery, getStopsByRadiusQuery, HslArrivalQueryResponse, HslNode, HslStopsByRadius} from './hslapi'

// Initialize Apollo Client
const client = new ApolloClient({
  uri: 'https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql',
  cache: new InMemoryCache()
})

type SectionProps = {
  children: React.ReactNode,
  title: string
}

const Section = ({ children, title }: SectionProps) => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
};

const NearestBusStops = () => {
  const [location, setLocation] = React.useState<GetLocation.Location | undefined>(undefined)

  React.useEffect(() => {
    (async () => {
      try {
        const newLocation = await GetLocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 })
        setLocation(newLocation)
      } catch (error) {
        console.warn(error)
      }
    })()

  }, [])

  if(!location) return <Text>Loading ...</Text>

  return (<BusStops location={location}/>)
}

type BusStopsProps = {
  location: GetLocation.Location
}

const BusStops = ({location}: BusStopsProps) => {
  const query = getStopsByRadiusQuery(location.latitude, location.longitude)
  const { loading, error, data } = useQuery<HslStopsByRadius>(query, {pollInterval: 60000});

  if (loading) return <Text>Loading...</Text>   
  if (error || data == undefined) return <Text>Error {error}</Text>  

  return (
      <FlatList 
        style={styles.flatList}
        data={data.stopsByRadius.edges.slice(0,4)} 
        renderItem = {({item}) => <StopDetails node={item.node}/>}
        keyExtractor={(item, index) => item.node.stop.gtfsId}
      />
  )
}

type StopDetailsProps = {
  node: HslNode
}

const StopDetails = ({ node }: StopDetailsProps) => {
  const query = getStopDetailsQuery(node.stop.gtfsId)
  const { loading, error, data } = useQuery<HslArrivalQueryResponse>(query, {pollInterval: 20000});

  if (loading) return <Text>Loading...</Text>
  if (error || data == undefined) return <Text>Error {error}</Text>
  
  const stopData = data.stop.stoptimesWithoutPatterns[0]
  const waitTime = (stopData.realtimeArrival + stopData.serviceDay - Date.now() / 1000)

  return (
    <View style={styles.sectionContainer}>
      <Text>{data.stop.name} ({node.distance} m)</Text>
      <View style={{flexDirection: 'row'}}>
        <Text style={styles.sectionTitle}>{stopData.trip.routeShortName}</Text>
        <Timer startTime={waitTime}/>
      </View>
    </View>
  )
}

type TimerProps = {startTime: number}

const Timer = ({startTime}: TimerProps) => {
  const [time, setTime] = useState<number>(startTime)

  useEffect(() => {
    const interval = setInterval(() => {time >= 1 ? setTime(time-1) : setTime(0)}, 1000)
    return () => {
      clearInterval(interval);
    };
  }, [time]);

  useEffect(() => {
    setTime(startTime)
  }, [startTime]);

  return <Text style={styles.sectionTitle}>{formatTime(time)}</Text>
}

const formatTime = (time: number) => {
  const zeroPad = (num: number) => {return String(num).padStart(2, '0')}
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)

  return `${zeroPad(minutes)}:${zeroPad(seconds)}`
}

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <ApolloProvider client={client}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>L??hipys??kki</Text>
          <NearestBusStops />
        </View>
      </ApolloProvider>


      <View
        style={{
          backgroundColor: isDarkMode ? Colors.black : Colors.white,
        }}>
        <Section title="See Your Changes">
          <ReloadInstructions />
        </Section>
        <Section title="Debug">
          <DebugInstructions />
        </Section>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flatList: {
    marginTop: 16,
    paddingHorizontal: 24,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginRight: 10
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;

