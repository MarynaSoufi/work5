import { StyleSheet, Text, View, FlatList, Image, Pressable, ScrollView, } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../firebase/auth';
import { useFirestoreQuery } from '../firebase/useFirestoreQuery';
import { firestore, storage  } from '../firebase/firebase';
import { ActivityIndicator, Screen, ReqResListItem, Button } from '../components';
import { AppForm, SelectFromField, SubmitButton, CalendarSeelectField, ErrorMessage, MultiSliderField } from '../components/forms';
import color from '../config/colors';
import Dialog from "react-native-dialog";
import { useFirestoreCrud } from '../firebase/useFirestoreCrud';
import Modal from "react-native-modal";
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import useLocation from '../hooks/useLocation';

const kindOfPet = [
  { label: "Dog", value: "Dog" },
  { label: "Cat", value: "Cat" },
  { label: "Rodent", value: "Rodent" },
  { label: "Bird", value: "Bird" },
  { label: "Fish", value: "Fish" },
  { label: "Reptiles", value: "Reptiles" },
  ];

export default function RequestsScreen() {
  const {user} = useAuth();
  const location = useLocation();
  const [ requests, setRequests ] = useState([]);
  const [visibleDelete, setVisibleDelete] = useState(false);
  const [visibleAdd, setVisibleAdd] = useState(false);
  const [itemId, setItemId] = useState('');
  const { data } = useFirestoreQuery(firestore.collection('settings'));
  const { deleteDoc } = useFirestoreCrud(firestore.collection('settings'));
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(false);

  const setData = () => {
    setRequests(data?.map(i => ({...i})).filter(f=> f.isRequest === true && f.user === user.uid))
  }

  useEffect(() => {
    setData();
  }, [data])

  const showDialogDelete = (item) => {
    setItemId(item.id);
    setVisibleDelete(true);
  };

  
  const handleCancelDelete = () => {
    setVisibleDelete(false);
    setItemId('');
  }

  const handleDelete = () => {
    deleteDoc(itemId);
    setItemId('');
    setVisibleDelete(false);
  }
  
  const showDialog = () => {
    setVisibleAdd(true);
  };

  const handleCancelAdd = () => {
    setVisibleAdd(false);
  };

  const handleAdd = async (info) => {
      try {
        setLoading(true);
        const request = {
          user: user.uid,
          pet: info.pet,
          fromDate: info.dates.from.toISOString(),
          tillDate: info.dates.till.toISOString(),
          myLocation: location,
          range: +info.range,
          isRequest: true
        };
        let doc = firestore.collection('settings');
        await doc.add(request);
        setVisibleAdd(false);
        setLoading(false);
      }
      catch(error){
        setFailed(true);
        setLoading(false);
      }
  }
    return (
      <>
        <ActivityIndicator visible={loading}/>
        <Screen>
        <Image style={styles.logo} source={require('../assets/iconPetlyS.png')}/>
        <View style={styles.welcomeWrap}>
          <Text style={styles.welcome}>Hello {user.displayName},</Text>
          <Text style={styles.match}>You can see, add or delete your requests</Text>
        </View>
        <View>
          <FlatList 
              style={styles.matchList}
              nestedScrollEnabled={true}
              data={requests}
              keyExtractor={d => d.id.toString()}
              renderItem={({item}) =>
              <ReqResListItem
                from={item.fromDate}
                till={item.tillDate}
                pet={item.pet}
                range={item.range}
                onPress={()=>showDialogDelete(item)}
              />
                }
                />
        </View>
        <Button onPress={showDialog} styleBtn={styles.btn} iconName='plus-circle' iconSize={50} iconColor={color.orange}/>
        <View style={styles.modal}>
          <Button title="Show dialog" onPress={showDialogDelete} />
          <Dialog.Container visible={visibleDelete}>
            <Dialog.Title>Delete request</Dialog.Title>
            <Dialog.Description>
              Do you want to delete this request? You cannot undo this action.
            </Dialog.Description>
            <Dialog.Button label="Cancel" onPress={handleCancelDelete} />
            <Dialog.Button label="Delete" onPress={handleDelete} />
          </Dialog.Container>
        </View>

        <Modal
        style={styles.modalView}
        animationType="slide"
        transparent={true}
        visible={visibleAdd}
        swipeDirection="right"
        onBackdropPress = { ( )  =>  handleCancelAdd() }
        onRequestClose={() => {
          handleCancelAdd()
        }}>
          <View style={styles.modalContainer}>
              <Pressable style={styles.press}>
                <MaterialCommunityIcons name="close" size={24} color={color.green} onPress={() => handleCancelAdd()}/>
              </Pressable>
              <ScrollView scrollbars="none">
                <AppForm
                initialValues={{pet: "",  dates:{from: "", till: "" }, range: 5}}
                onSubmit={handleAdd}
              >
                <ErrorMessage error="You need to fill all fields" visible={failed} />
                <SelectFromField name="pet" arr={kindOfPet} text="Choose your pet to look after"/>
                <CalendarSeelectField name="dates" tillName="dates.till" fromName="dates.from" text="Pick dates when your pet needs to be looked after"/>
                <MultiSliderField text="Pick dates when your are ready to look after the guest pe" name="range"/>
                <SubmitButton title="CONFIRM"/>
                </AppForm>
              </ScrollView> 
          </View>
    </Modal>
      </Screen>
      </>
      
  
  )
}

const styles = StyleSheet.create({
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'flex-start'
  },
  welcome: {
    color: color.grayMiddle,
    paddingHorizontal: 10,
    fontSize: Platform.OS === "android" ? 14 : 16,
    fontFamily: Platform.OS === "android" ? "Roboto" : "Avenir",
  },
  match: {
    color: color.text,
    fontWeight: '700',
    paddingHorizontal: 10,
    fontSize: Platform.OS === "android" ? 18 : 20,
    fontFamily: Platform.OS === "android" ? "Roboto" : "Avenir",
  },
  modal: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  btn: {
    alignItems: "center",
    alignSelf: 'flex-end',
    marginHorizontal: 20,
    marginVertical: 20,
    position: 'absolute',
    paddingHorizontal: 10,
    bottom: 0,

  }, 
  icon: {
    alignSelf: 'center',
   },
   modalContainer: {
    paddingHorizontal: 5,
    backgroundColor: color.white,
    paddingVertical: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,

    elevation: 10,
  },
  modalView: {
    width: "100%",
    alignSelf: 'center',
  },
  press: {
    position: 'absolute',
    right: 10,
    top: 10
  },
  welcomeWrap: {
    marginBottom: 20
  }
})