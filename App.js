import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Camera, CameraType } from "expo-camera";
import { SafeAreaView } from "react-native-safe-area-context";
import * as FaceDetector from "expo-face-detector";
import { useState } from "react";
import React from "react";
import questions from "./data/questions.json";

export default function App() {
  const [cameraPermission, requestCameraPermission] =
    Camera.useCameraPermissions();
  const [animating, setAnimating] = useState(false);
  const [yesSymbol, setYesSymbol] = useState("");
  const [noSymbol, setNoSymbol] = useState("");

  const [bounds, setBounds] = useState({ origin: { x: 0, y: 0 } });
  const [yawAngle, setYawAngle] = useState(0);
  const [rollAngle, setRollAngle] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [yesCount, setYesCount] = useState(0);
  const [noCount, setNoCount] = useState(0);
  const [isDOne, setIsDone] = useState(false);

  if (!cameraPermission) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Text style={styles.text}>İzinler yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  if (!cameraPermission.granted && !cameraPermission.canAskAgain) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Text style={styles.text}>Kamera kullanımı için izin gereklidir!</Text>
        <TouchableOpacity style={styles.buttonDisabled} disabled={true}>
          <Text style={styles.buttonText}>İzin Reddeldi</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!cameraPermission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Text style={styles.text}>Kamera kullanımı için izin gereklidir!</Text>
        <View style={styles.permissionButton}>
          <TouchableOpacity
            style={animating ? styles.buttonDisabled : styles.button}
            disabled={animating}
            onPress={() => {
              setAnimating(true);
              requestCameraPermission().then(() => setAnimating(false));
            }}
          >
            {animating ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>İzin Ver</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.denyButton}
            onPress={() => Camera.requestCameraPermissionsAsync()}
          >
            <Text style={styles.denyButtonText}>Reddet</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleFacesDetected = ({ faces }) => {
    if (faces.length === 0) {
      return;
    }
    const face = faces[0];
    const { bounds, yawAngle, rollAngle } = face;
    setBounds(bounds);
    setYawAngle(yawAngle);
    setRollAngle(rollAngle);

    if (rollAngle > 24 && rollAngle < 26) {
      handleAnswer("NO");
    }

    if (rollAngle > 347 && rollAngle < 349) {
      handleAnswer("YES");
    }
  };

  const handleAnswer = (answer) => {
    let newSymbol = "";
    if (answer === "YES") {
      setYesCount(yesCount + 1);
      newSymbol = "✅";
    } else if (answer === "NO") {
      setNoCount(noCount + 1);
      newSymbol = "❌";
    }

    if (questionNumber === questions.length - 1) {
      setIsDone(true);
    } else {
      setQuestionNumber(questionNumber + 1);
    }
    if (newSymbol) {
      if (answer === "YES") {
        setYesSymbol(newSymbol);
      } else if (answer === "NO") {
        setNoSymbol(newSymbol);
      }
    }
  };

  const handleStartAgain = () => {
    setQuestionNumber(0);
    setIsDone(false);
    setYesCount(0);
    setNoCount(0);
  };

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={CameraType.front}
        onFacesDetected={handleFacesDetected}
        faceDetectorSettings={{
          mode: FaceDetector.FaceDetectorMode.fast,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
          runClassifications: FaceDetector.FaceDetectorClassifications.none,
          minDetectionInterval: 100,
          tracking: true,
        }}
      >
        <View
          style={[
            styles.faceBorder,
            {
              left: bounds.origin.x - 25,
              top: bounds.origin.y - 130,
              transform: [
                { rotateX: `${0}deg` },
                { rotateY: `${0}deg` },
                { rotateZ: `${rollAngle}deg` },
              ],
            },
          ]}
        >
          {isDOne ? (
            yesCount > noCount ? (
              <View style={styles.textContainer}>
                <Text style={styles.questionText}>Toxic İlişki</Text>
                <TouchableOpacity
                  style={styles.again}
                  onPress={handleStartAgain}
                >
                  <Text style={styles.answer}>TEKRAR</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.textContainer}>
                <Text style={styles.questionText}>Normal İlişki</Text>
                <TouchableOpacity
                  style={styles.again}
                  onPress={handleStartAgain}
                >
                  <Text style={styles.answer}>TEKRAR</Text>
                </TouchableOpacity>
              </View>
            )
          ) : (
            <>
              <View style={styles.textContainer}>
                <Text style={styles.questionText}>
                  {questions[questionNumber].id}
                  {" - "}
                  {questions[questionNumber].text}
                </Text>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.buttonYes}>
                  {yesSymbol ? (
                    <Text style={styles.answer}>EVET{yesSymbol}</Text>
                  ) : null}
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonNo}>
                  <Text style={styles.answer}>HAYIR{noSymbol}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    width: "100%",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },

  permissionButton: {
    flexDirection: "row",
  },
  button: {
    backgroundColor: "#1a73e8",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginRight: 10,
  },

  buttonDisabled: {
    backgroundColor: "#dcdcdc",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },

  denyButton: {
    backgroundColor: "#ff4d4f",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },

  denyButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  camera: {
    flex: 1,
  },
  faceBorder: {
    position: "absolute",
    backgroundColor: "transparent",
  },
  textContainer: {
    backgroundColor: "#1E91FF",
    width: 250,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  questionText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  buttonYes: {
    backgroundColor: "#369E07",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 30,
    flex: 1,
  },
  buttonNo: {
    backgroundColor: "#F5242D",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 30,
    flex: 1,
  },
  answer: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
  again: {
    backgroundColor: "red",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginTop: 10,
  },
});
