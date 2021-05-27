import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, TextInput, KeyboardAvoidingView, ToastAndroid} from 'react-native';
import * as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner';
import firebase from 'firebase';
import db from '../config';

export default class Transaction extends React.Component {
 
  constructor(){
    super();
    this.state={
      hasCameraPermisssions:null,
      scanned:false,
      scannedBookId:'',
      scannedStudentId:'',
      buttonState:"normal",
    }
  }
  getCameraPermissions = async (id) =>{
    const {status} = await Permissions.askAsync(Permissions.CAMERA);
    
    this.setState({
      hasCameraPermissions: status === 'granted',
      buttonState:id,
      scanned: false
    });
  }

  
  handleBarCodeScanned = async({data})=>{

    if(this.state.buttonState==='BookId'){
      this.setState({
        scanned: true,
        scannedBookId: data,
        buttonState: 'normal'
      });
    }
    else if(this.state.buttonState==='StudentId'){
      this.setState({
        scanned: true,
        scannedStudentId: data,
        buttonState: 'normal'
      });
    }
  }

  initiateBookIssue = async()=>{
    db.collection("transaction").add({
      studentID:this.state.scannedStudentId,
      bookID:this.state.scannedBookId,
      date:firebase.firestore.Timestamp.now().toDate(),
      transactionType:"issue",
    })
    db.collection("books").doc(this.state.scannedBookId).update({
      bookAvailability:false,
    });
    db.collection("students").doc(this.state.scannedStudentId).update({
      noOfBooksIssued:firebase.firestore.FieldValue.increment(1),
    });
  }

  initiateBookReturn = async()=>{
    db.collection("transaction").add({
      studentID:this.state.scannedStudentId,
      bookID:this.state.scannedBookId,
      date:firebase.firestore.Timestamp.now().toDate(),
      transactionType:"return",
    })
    db.collection("books").doc(this.state.scannedBookId).update({
      bookAvailability:true,
    });
    db.collection("students").doc(this.state.scannedStudentId).update({
      noOfBooksIssued:firebase.firestore.FieldValue.increment(-1),
    });
  }

  handleTransaction = async()=>{
    var data;
    db.collection("books").doc(this.state.scannedBookId).get().
    then((doc)=>{
      var book=doc.data();
      if(book.bookAvailability){
        this.initiateBookIssue();
        data = "bookIssued";
        ToastAndroid.show(data,ToastAndroid.LONG)
      }
      else{
        this.initiateBookReturn();
        data = "bookReturned";
        ToastAndroid.show(data,ToastAndroid.LONG)
      }
    }
    );
  }

  render() {
    const hasCameraPermissions = this.state.hasCameraPermissions;
    const scanned = this.state.scanned;
    const buttonState = this.state.buttonState;

    if (buttonState !== "normal" && hasCameraPermissions){
      return(
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      );
    }

    else if (buttonState === "normal"){
      return(
        <KeyboardAvoidingView
        style={styles.container}
        behavior="padding" enabled
        >
          <View style={styles.container}>
          <Text style={styles.displayText}>{
            hasCameraPermissions===true ? undefined: "Request Camera Permission"
          }</Text>     
          <TextInput
          placeholder="BookId"
          value={this.state.scannedBookId}
          onChangeText={(text)=>{
            this.setState({
              scannedBookId:text,
            });
          }}
          />
          <TouchableOpacity
            onPress={()=>{this.getCameraPermissions("BookId")}}
            style={styles.scanButton}>
            <Text style={styles.buttonText}>Scan Book</Text>
          </TouchableOpacity>

          <TextInput
          placeholder="StudentId"
          value={this.state.scannedStudentId}
          onChangeText={(text)=>{
            this.setState({
              scannedStudentId:text,
            });
          }}
          />
          <TouchableOpacity
            onPress={()=>{this.getCameraPermissions("StudentId")}}
            style={styles.scanButton}>
            <Text style={styles.buttonText}>Scan Student</Text>
          </TouchableOpacity>
          <View>
            <TouchableOpacity
              onPress={()=>{this.handleTransaction()}}
              style={styles.submitButton}
              >
              <Text
              style={styles.submitButtonText}
              >Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  displayText:{
    fontSize: 15,
    textDecorationLine: 'underline'
  },
  scanButton:{
    backgroundColor: '#2196F3',
    padding: 10,
    margin: 10
  },
  buttonText:{
    fontSize: 20,
  },
  submitButton:{
    backgroundColor: '#FBC02D',
    width: 100,
    height:50
  },
  submitButtonText:{
    padding: 10,
    textAlign: 'center',
    fontSize: 20,
    fontWeight:"bold",
    color: 'white'
  }
});