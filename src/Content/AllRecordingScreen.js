import React, {useState, Component} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  SafeAreaView,
  Image,
  FlatList,
  Modal,
  Dimensions,
  PermissionsAndroid
} from 'react-native';

import {connect} from 'react-redux';
import {increment, decrement} from '../Store/actions/countAction';

import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  OutputFormatAndroidType,
  AVModeIOSOption,
  AVLinearPCMBitDepthKeyIOSType,
} from 'react-native-audio-recorder-player';

import moment from 'moment';
import Slider from '@react-native-community/slider';


var RNFS = require("react-native-fs");

const { height, width } = Dimensions.get('window');
class AllRecordingScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {

      isRecordingStarted: false,
      isPlayerStarted: false,
      isPlayerPaused : false ,

      showDialog: false,
      recordings: [
        // Add more recordings as needed
      ],

      recordSecs: 0,
      recordTime: '00:00:00',

      currentPositionSec: 0,
      currentDurationSec: 0,
      playTime: '00:00',
      duration: '00:00',
      currentPlayUri: '',

      recordingCount: 0,

      currentRecordingState: {},

    };

    this.audioRecorderPlayer = new AudioRecorderPlayer();
    this.audioRecorderPlayer.setSubscriptionDuration(0.1);
  }

  onStartRecord = async () => {
    if (Platform.OS === 'android') {

      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);
  
        if (
          grants['android.permission.WRITE_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.READ_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.RECORD_AUDIO'] ===
            PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('permissions granted');
        } else {
          console.log('All required permissions not granted');
          return;
        }
      } catch (err) {
        console.warn(err);

        return;
      }
    }

    const audioSet = {
      AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
      AudioSourceAndroid: AudioSourceAndroidType.MIC,
      AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
      AVNumberOfChannelsKeyIOS: 2,
      AVFormatIDKeyIOS: AVEncodingOption.aac,
      OutputFormatAndroid: OutputFormatAndroidType.AAC_ADTS,
    };

    console.log('audioSet', audioSet);

    const filePath = Platform.select({
      ios: 'voice_memo__00' + String(this.state.recordings.length + 1)+".m4a",
      android:
        RNFS.CachesDirectoryPath +
        '/' +
        'voice_memo__00' +
        String(this.state.recordingCount) + ".mp3",
    });

    this.setState;
    const uri = await this.audioRecorderPlayer.startRecorder(
      filePath,
      audioSet,
    );

    this.audioRecorderPlayer.addRecordBackListener(e => {
      // console.log('record-back', e);
     
      this.setState(
        {
          recordSecs: e.currentPosition,
          recordTime: this.audioRecorderPlayer.mmssss(
            Math.floor(e.currentPosition),
          ),
          isRecordingStarted: true,
        },
        () => {
          const newRecording = {
            id: this.state.recordings.length + 1, // Assign a unique ID
            name: uri.substr(uri.lastIndexOf('/') + 1), // Example name
            duration: this.state.recordTime, // Example duration
            isCreated: moment(new Date()).format('DD-MM-YYYY hh:mm a'), // Example created date
            path: uri,
          };

          this.setState({currentRecordingState: newRecording});
        },
      );
    });
    this.setState({currentRecordingState: {}});
    console.log(`uri: ${uri}`);
  };

  onStopRecord = async () => {
    const result = await this.audioRecorderPlayer.stopRecorder();
    this.audioRecorderPlayer.removeRecordBackListener();
    this.setState(
      {
        recordSecs: 0,
        isRecordingStarted: false,
        recordTime: '00:00:00',
      },
      () => {
        this.setState(prevState => ({
          recordings: [
            ...prevState.recordings,
            this.state.currentRecordingState,
          ],
        }));
      },
    );
    console.log(result);
  };

  onStartPlay = async path => {
    console.log('onStartPlay', path);

    try {
      const msg = await this.audioRecorderPlayer.startPlayer(path);

      //? Default path
      // const msg = await this.audioRecorderPlayer.startPlayer();
      const volume = await this.audioRecorderPlayer.setVolume(1.0);
      console.log(`path: ${msg}`, `volume: ${volume}`);

      this.audioRecorderPlayer.addPlayBackListener(e => {
        console.log('playBackListener', e);
        this.setState({
          currentPositionSec: e.currentPosition,
          currentDurationSec: e.duration,
          playTime: this.audioRecorderPlayer.mmss(
            Math.floor(e.currentPosition/1000)
          ),
          duration: this.audioRecorderPlayer.mmss(Math.floor(e.duration/1000)),
          isPlayerStarted : true,
          isPlayerPaused: false
        });
      });


      // this.audioRecorderPlayer.addPlayBackStoppedListener(() => {
      //   // Handle playback stopped event
      //   console.log('Playback stopped');
      //   this.onStopPlay()
      //   // You can add your logic here when the playback stops
      // });
    } catch (err) {
      console.log('startPlayer error', err);
    }
  };

  onPausePlay = async () => {
    this.setState({isPlayerPaused: true});
    await this.audioRecorderPlayer.pausePlayer();
  };

  onResumePlay = async () => {
    this.setState({isPlayerPaused: false});
    await this.audioRecorderPlayer.resumePlayer();
  };

  onStopPlay = async () => {
    this.setState({isPlayerStarted: false,isPlayerPaused:true});
    this.audioRecorderPlayer.stopPlayer();
    this.audioRecorderPlayer.removePlayBackListener();
  };

  renderRecordingItem = ({item}) => (
    <TouchableOpacity
      style={styles.recordingItem}
      onPress={() => {
        this.setState({currentPlayUri: item.path}, () => {
          this.toggleDialog();
        });
      }}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <View style={{flex: 1}}>
          <Text style={styles.recordingName}>{item.name}</Text>
          <Text style={styles.recordingDuration}>{item.isCreated}</Text>
        </View>
        <View>
          <Text style={styles.recordingDuration}>
            {item.duration.split(':').slice(0, 2).join(':')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  toggleDialog = () => {

    this.setState(prevState => ({
      showDialog: !prevState.showDialog,
      isPlayerStarted :false,

    }));

    this.onStopPlay()
  
  };

  MyDialog = () => {
    return (
      <Modal
        visible={this.state.showDialog}
        transparent={true}
        animationType="fade"
        onRequestClose={this.toggleDialog}>
        <View style={styles.container1}>
          <View style={styles.dialog}>
          <Text style={styles.message}>{'Playing Recording'}</Text>
            <Text style={styles.title}>{this.state.currentPlayUri.substr(this.state.currentPlayUri.lastIndexOf('/') + 1)}</Text>
           
         
            <TouchableOpacity
              onPress={this.toggleDialog}
              style={{
                ...styles.button,
                position: 'absolute',
                top: 10,
                right: 10,
              }}>
              <Image
                style={{
                  width: 16,
                  height: 16,
                }}
                source={require('../assets/arrow.png')}
              />
            </TouchableOpacity>

            <View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.btn_text}>{this.state.playTime}</Text>

              <Slider
                style={{
                  width: width / 1.8,
                  height: 30,
                  alignSelf: 'center',
                }}
                minimumValue={0}
                maximumValue={this.state.currentDurationSec}
                value={this.state.currentPositionSec}
                minimumTrackTintColor={'blue'}
                maximumTrackTintColor={'gray'}
                thumbTintColor={'purple'}
                onSlidingStart={() => this.audioRecorderPlayer.pausePlayer()}
                onSlidingComplete={value => {
                  if (this.audioRecorderPlayer != null) {
                    this.audioRecorderPlayer.seekToPlayer(value * 1000);
                    this.audioRecorderPlayer.resumePlayer();
                  }
                }}
              />
              <Text style={styles.btn_text}>{this.state.duration}</Text>
            </View>

            <View style={{marginTop:10}}>
              {!this.state.isPlayerStarted ? (

                <TouchableOpacity
                  activeOpacity={9}
                  onPress={() => !this.isRecordingStarted ? this.onStartPlay(this.state.currentPlayUri) : null}
                  style={{
                    
                    alignItems: 'center',

                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 10,
                  }}>
                  <Image
                    style={{
                      width: 16,
                      height: 16,
                      tintColor: 'black',
                    }}
                    source={require('../assets/play_button.png')}
                  />
                </TouchableOpacity>
              ) : (
                this.state.isPlayerPaused ?

                <TouchableOpacity
                activeOpacity={9}
                onPress={() => this.onResumePlay(this.state.currentPlayUri)}
                style={{
                  
                  alignItems: 'center',

                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 10,
                }}>
                <Image
                  style={{
                    width: 16,
                    height: 16,
                    tintColor: 'black',
                  }}
                  source={require('../assets/play_button.png')}
                />
              </TouchableOpacity>:
                <TouchableOpacity
                  activeOpacity={9}
                  onPress={() => this.onPausePlay()}
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 10,
                  }}>
                  <Image
                    style={{
                      width: 16,
                      height: 16,

                      tintColor: 'black',
                    }}
                    source={require('../assets/pause.png')}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
          </View>
        </View>
      </Modal>
    );
  };

  render() {
    const {isRecordingStarted} = this.state;
    return (
      <SafeAreaView style={{flex: 1}}>
        {this.MyDialog()}

        <View style={styles.container}>
          <FlatList
            data={this.state.recordings}
            renderItem={this.renderRecordingItem}
            keyExtractor={item => item.id.toString()}
            style={styles.recordingsList}
          />

          <View>
            <Text style={{...styles.counter_text, alignSelf: 'center'}}>
              {this.state.recordTime}
            </Text>

            <TouchableOpacity
              onPress={() => {
                isRecordingStarted ? this.onStopRecord() : this.onStartRecord();
              }}
              style={{...styles.btn, alignItems: 'center'}}>
              <View>
                <Image
                  style={{
                    width: 40,
                    height: 40,
                  }}
                  source={
                    isRecordingStarted
                      ? require('../assets/pause-button.png')
                      : require('../assets/rec-button.png')
                  }
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingTop: 20,
    paddingHorizontal: 10,
  },
  title_text: {
    fontSize: 28,
    fontWeight: '300',
    color: 'black',
  },
  counter_text: {
    fontSize: 24,
    fontWeight: '300',
    margin: 15,
    color: 'red',
  },
  btn: {
    borderRadius: 10,
    height: 40,

    margin: 10,
  },
  btn_text: {
    fontSize: 18,
    color: 'black',
  },
  recordingsList: {
    flex: 1,
  },
  recordingItem: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 10,
  },
  recordingName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  recordingDuration: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },

  container1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dialog: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    
    height:height/4,
    width:width - 50,
   
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
  },
});

const mapStateToProps = state => ({
  count: state.count.count,
});

const mapDispatchToProps = dispatch => ({
  increment: () => dispatch(increment()),
  decrement: () => dispatch(decrement()),
});

export default connect(mapStateToProps, mapDispatchToProps)(AllRecordingScreen);
