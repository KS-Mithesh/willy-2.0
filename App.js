import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';

import Transaction from './screens/Transaction';
import Search from './screens/Search';

export default class App extends React.Component {
  render(){
  return  <AppContainer/>;
  }
}

const TabNavigator = createBottomTabNavigator({
  Transaction:{ screen:Transaction},
  Search:{ screen:Search},
},
{
  defaultNavigationOptions:({navigation}) =>({
    //navigation.state.routeName
    tabBarIcon:()=>{
      const routeName=navigation.state.routeName;
      if(routeName==='Transaction'){
        return(
          <Image source={require('./assets/transaction.png')} style={{width:70,height:70}} ></Image>
        )
      }
        else if(routeName==='Search'){
          return(
           <Image source={require('./assets/search.png')} style={{width:70,height:70}} />
          )
        }
      
    }}),
}


);
const AppContainer = createAppContainer(TabNavigator);
