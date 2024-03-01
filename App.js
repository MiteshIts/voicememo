import { Component } from "react";
import { View } from "react-native";
import AppNavigation from "./src/Navigation/AppNavigation";
import  store  from './src/Store';
import { Provider } from 'react-redux';
class App extends Component {
  constructor(props) {
    super(props);
  
  } 
  render() {
    return (
      <Provider store={store}>
        <AppNavigation/>
        </Provider>
    );
  }
}

export default App;