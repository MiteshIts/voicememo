import React, {useState, Component} from 'react';
import {
  StyleSheet,
} from 'react-native';
import { connect } from 'react-redux';
import { increment, decrement } from '../Store/actions/countAction';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../Content/HomeScreen';
import ReduxTrialScreen from '../Content/ReduxTrialScreen';
import AllRecordingScreen from '../Content/AllRecordingScreen';

const Stack = createNativeStackNavigator();

class AppNavigation extends Component {
  constructor(props) {
    super(props);
   
  }

 
  render() { 
   

    return (
        <NavigationContainer>
        <Stack.Navigator>
        <Stack.Screen name="AllRecording" component={AllRecordingScreen} />

          <Stack.Screen  name="Home" component={HomeScreen} />
          <Stack.Screen name="ReduxTrialScreen" component={ReduxTrialScreen} />
      
      
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems:'center',

  },
  title_text: {
    fontSize: 28,
    fontWeight: '300',
    color: 'black',

   
  },
  counter_text: {
    fontSize: 34,
    fontWeight: '900',
    margin: 15,
    color: 'red',

  },
  btn: {
    backgroundColor: '#086972',

    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    margin: 10,
  },
  btn_text: {
    fontSize: 18,
    color: 'white',
  },
});

const mapStateToProps = (state) => ({
    
    count: state.count.count,
  });
  
  const mapDispatchToProps = (dispatch) => ({
    increment: () => dispatch(increment()),
    decrement: () => dispatch(decrement()),
  });
  
  export default connect(mapStateToProps, mapDispatchToProps)(AppNavigation);
  