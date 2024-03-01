import React, {useState, Component} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  SafeAreaView,
} from 'react-native';

import { connect } from 'react-redux';
import { increment, decrement } from '../Store/actions/countAction';

class HomeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      counter: 0,
    };
  }

   handleincreament = () => {
    this.setState({counter: this.state.counter + 1});
  };

  handleDecreament = () => {
    this.setState({counter: this.state.counter - 1});
  };
  render() { 
    const { count, increment, decrement } = this.props;

    return (
      <SafeAreaView style={{alignItems:'center',}}>
        <View style={styles.container}>
 
            <Text style={styles.title_text}>Counter App</Text>
            <Text style={styles.counter_text}>{count}</Text>
   
          <TouchableOpacity onPress={increment} style={styles.btn}>
            <Text style={styles.btn_text}> Increment </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={decrement}
            style={{...styles.btn, backgroundColor: '#6e3b3b'}}>
            <Text style={styles.btn_text}> Decrement </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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
  
  export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);
  