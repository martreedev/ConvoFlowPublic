// Home.jsx
import React, { useEffect, useState } from "react";
import "../css/home.css";
import "../css/slide1.css";
import "../css/main.css";
import "../css/Anylatics.css";
import { useSpeechRecognition } from "react-speech-kit";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import SupportedBrowsers from "../Components/ListOfBrowsers";
import UseGpt from "../JavaScript/UseGPT";
import handleTextToSpeech from "../JavaScript/useTextToSpeech";
import logo from "../images/logo.png";
import gptlogo from "../images/gptlogo.png";
import pfp from "../images/pfp.jpg";
import parseText from "../JavaScript/parseText";
import premadeAudio from "../audio/premadeAudio.mp3";
import mic from "../images/mic.png";
import micon from "../images/mic-red.png";
import micDisabled from "../images/mic-disabled.png";
import { Oval } from "react-loader-spinner";
import convoHistroy from "../JavaScript/convoHistroyToPrompt";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import getAnalytics from "../JavaScript/convoAnalytics";

export default function Home() {
  const [showAnylatics, setShowAnylatics] = useState(false);// conditional to render analytics page

  useEffect(() => {//used to remove the analytics from local storage on page refresh
    localStorage.removeItem("analytics");
    localStorage.setItem("conversation-data", JSON.stringify([]));

  }, [])
  //User states
  const [isRecording, setisRecording] = useState(false); // used to determine if the user microphone is currently being recorded
  const [value, setValue] = useState("");// users transcripted voice data as text
  const [showLabel, setShowLabel] = useState(true);// prevent user from utilizing microphone while AI is speaking or generating
  const [UserStartConvo, setUserStartConvo] = useState(null);

  //conversation states
  const [FirstTimeRunning, setFirstTimeRunning] = useState(true);// if this is the first conversation of the session
  const [LastArrayLength, setLastArrayLength] = useState(0);// the last recorded length of the conversation
  const [swiper, setSwiper] = useState(null);// swiping the page down
  const [ErrorDidOccur, setErrorDidOccur] = useState(false);// used to determine if an error occured at any point in GPT generation


  //analytics states
  const [UseOfLanguage, setUseOfLanguage] = useState(0); //UseOfLanguage section of graph
  const [Adaptibility, setAdaptibility] = useState(0); //Adaptibility section of graph
  const [Relevance, setRelevance] = useState(0); //Relevance section of graph
  const [Engagement, setEngagement] = useState(0);//Engagement section of graph
  const [Initiative, setInitiative] = useState(0);//Initiative section of graph

  const [isHovered, setIsHovered] = useState(false); // used to detect if mouse is above the ? button on the analytics popup
  const [showAnalyticsButton, setShowAnalyticsButton] = useState(false); // renders the analytics button
  const [HasGottenAnalytics, setHasGottenAnalytics] = useState(false);// if the user has previously generated their analytics


  //speech recognition library
  const { listen, stop, supported } = useSpeechRecognition({
    onResult: (result) => {
      setValue(result);
    },
  });
  ////////////////////

  let ConvoList = JSON.parse(localStorage.getItem("conversation-data")) || [];// conversation pulled from local storage

  // if the user doesnt wish to start the convo
  if (UserStartConvo == false) {
    if (FirstTimeRunning) {// if this is the first conversation of the session
      //pull the conversation data from local storage
      let existingArray =
        JSON.parse(localStorage.getItem("conversation-data")) || [];
      let AI_First_words = [
        "AI",
        "Hey there! Nice to meet you. I couldn't help but notice your friendly vibe. Mind if we strike up a conversation?",
      ];
      // push the first conversation node into the array and save it back into local storage
      existingArray.push(AI_First_words);
      localStorage.setItem("conversation-data", JSON.stringify(existingArray));

      //set the audio state to the premade conversation audio
      let premade = new Audio(premadeAudio);
      premade.volume = 0.5;
      setAudio(premade);
      setFirstTimeRunning(false);
    }
  }
  //scrolls to the bottom of the conversation
  const scrollToBottom = () => {
    const transcriptDiv = document.querySelector(".Home-Transcript");
    transcriptDiv.scrollTop = transcriptDiv.scrollHeight;
  };
  useEffect(scrollToBottom, [ConvoList]);


  //AI speech states
  const [audio, setAudio] = useState(null);// audio object for the Eleven labs api audio
  const [IsSpeaking, setIsSpeaking] = useState(false);// if the AI is currently speaking
  const [IsLoading, setIsLoading] = useState(false); // if the AI is currently loading speech

  // if there is an audio object in the usestate and this function is called it will pause it
  const stopAI = () => {
    if (audio) {
      audio.pause();
      //console.log("AI audio stopped");
      setIsSpeaking(false);
      setAudio(null);
    }
  };
  // post convo analytics sections
  const data = [
    { name: "Use of Language", "Conversation Analysis": UseOfLanguage },
    { name: "Adaptability", "Conversation Analysis": Adaptibility },
    { name: "Relevance", "Conversation Analysis": Relevance },
    { name: "Engagement", "Conversation Analysis": Engagement },
    { name: "Initiative", "Conversation Analysis": Initiative },
  ];

  // start recording the users mic
  const startRecording = () => {
    setErrorDidOccur(false);
    listen({ continuous: true });
    setisRecording(true);
    setShowLabel(false);
  };
  //////////////////////////this is the big boy, future extraction of certain segments is a must, 
  //                        but compromises had to be made for the time crunch

  const stopRecording = () => {// function called when user presses the mic button after recording
    stop();// stop recording user microphone

    //pull convo array from local storage
    let existingArray =
      JSON.parse(localStorage.getItem("conversation-data")) || [];
    //push the user microphone transcription into the array as a new convo node
    let myObject = ["Human", value];
    existingArray.push(myObject);
    //store new convo array
    localStorage.setItem("conversation-data", JSON.stringify(existingArray));

    if (existingArray.length + 1 > 3) {//if the convo is longer than 3 messages
      setShowAnalyticsButton(true);// show the analytics button
    }
    setisRecording(false);
    if (value) {// if user has spoken at all
      // pull conversation from local storage
      let existingArray =
        JSON.parse(localStorage.getItem("conversation-data")) || [];
      let prompt;// declare prompt variable
      if (existingArray.length > 0) {// if the conversation is not empty
        prompt = convoHistroy();// set prompt equal to the conversation history
      } else {
        //set conversation equal to this gpt prompt and the convo history
        //(it remembers)
        prompt = `You are an AI conversation bot designed to help users practice their conversation abilities.if the humans asks any personal questions use fictional data instead. Encourage users to engage in diverse and meaningful conversations.Limit your response to a few sentences: ${value}`;
      }

      setIsLoading(true);
      UseGpt(prompt).then((res) => {//use gpt function for uploading prompt and getting response
        if (res != "somethingbad-error") {// if no error
          // send text to eleven labs to get audio
          handleTextToSpeech(res).then((blob) => {
            const tmp = new Audio(blob);
            tmp.volume = 0.5;
            setAudio(tmp);// set the audio state to the returned audio object
            // spawn new chat element with ai text
            let existingArray =
              JSON.parse(localStorage.getItem("conversation-data")) || [];

            const AItext = parseText(res);// parse the gpt response text
            let parsedStr = AItext.replace("AI: ", "");
            let myObject = ["AI", parsedStr];
            existingArray.push(myObject);// push ai conversation node into conversation array

            localStorage.setItem(
              "conversation-data",
              JSON.stringify(existingArray)
            );
            setIsLoading(false);
          });
        } else {
          setErrorDidOccur(true);
        }
      });
    }
  };
  // if an audio object is detected in the State then play it
  useEffect(() => {
    if (audio) {
      // Play the audio
      audio.play();
      setIsSpeaking(true);

      audio.onended = () => {// once the audio is finished reset the audio object state
        setIsSpeaking(false);
        setAudio(null);
      };
    }
  }, [audio]); // Re-run the effect when 'audio' state changes

  // function for fetching analytics
  const AnalyticsFetch = async () => {
    let lastArr = JSON.parse(localStorage.getItem("conversation-data")) || [];

    if (LastArrayLength != lastArr.length) {// if the current conversation length is not the same as the last recorded conversation length
      setHasGottenAnalytics(false)// reset this state
      setLastArrayLength(lastArr.length)// set the length equal to the current length
    }
    if (!HasGottenAnalytics) {
      const anal = getAnalytics().then((res) => {// call the get analytics function
        let convoHistroy = JSON.parse(localStorage.getItem("conversation-data")) || [];
        // set the graph data equal to the reponses from the getAnalytics function
        setUseOfLanguage(res[0].data);
        setAdaptibility(res[1].data);
        setRelevance(res[2].data);
        setEngagement(res[3].data);
        setInitiative(res[4].data);
        setLastArrayLength(convoHistroy.length)// set the length equal to the current length
      });
      setHasGottenAnalytics(true);
    }
  };
  return (
    <Swiper
      direction={"vertical"}
      spaceBetween={0}
      slidesPerView={1}
      navigation
      pagination={{ clickable: true }}
      className="lol"
      onSwiper={setSwiper}
      allowTouchMove={false}
    >
      <SwiperSlide>
        <div className="mainWrapperSlide1">
          <img src={logo} className="logo" />
          <label className="H1">ConvoFlow</label>
          <label className="H2">Do You wish to start the Convo?</label>

          <div className="Slide1ButtonContainer">
            <button
              onClick={() => {
                setUserStartConvo(true);
                if (swiper) {
                  swiper.slideNext();
                }
              }}
              className="Slide1Button"
            >
              Yes
            </button>
            <button
              onClick={() => {
                setUserStartConvo(false);
                if (swiper) {
                  swiper.slideNext();
                }
              }}
              className="Slide1Button"
            >
              No
            </button>
          </div>
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div className="mainWrapperHome">
          {showAnylatics && (
            <div className="Anylatics">
              <button
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="CloseButtonAnylatics"
              >
                ?
              </button>
              <ResponsiveContainer width="90%" height="90%">
                <BarChart width={150} height={40} data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis type="number" domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Conversation Analysis" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
              <button
                onClick={() =>
                  setShowAnylatics((prevShowAnylatics) => !prevShowAnylatics)
                }
                className="CloseButtonAnylatics"
              >
                X
              </button>

              {isHovered && (
                <div className="HoverToolTip">
                  <li>
                    Use of Language: Assess the user's vocabulary, grammar, and
                    overall language proficiency in expressing themselves
                    effectively
                  </li>
                  <li>
                    Adaptability: Assess how well the user adapts their
                    communication style and tone based on the context and the
                    preferences of their conversation partners
                  </li>
                  <li>
                    Relevance: Measure the extent to which the user stays
                    on-topic and responds appropriately to the conversation's
                    context
                  </li>
                  <li>
                    Engagement: Measure the user's ability to keep the
                    conversation engaging and interesting.
                  </li>
                  <li>
                    Initiative: Observe whether the user takes the initiative to
                    ask questions, share ideas, or move the conversation forward
                    actively.
                  </li>
                </div>
              )}
            </div>
          )}
          <div className="main-content">
            <div className="Home-Container">
              {!supported ? (
                <div className="supportedContinaer">
                  <label>Your browser does not support Speech to Text :/</label>
                  <label>
                    Here is a list of browsers that do support the feature:
                  </label>
                  <SupportedBrowsers></SupportedBrowsers>
                </div>
              ) : (
                <div className="Home-Mic">
                  {showLabel && (
                    <label className="ExplainText">
                      Press the microphone button to start talking. Press it
                      again to stop
                    </label>
                  )}

                  {
                    // First check if the application is loading
                    !IsLoading ? (
                      // Then check if the AI is speaking
                      !IsSpeaking ? (
                        // If it isn't, then check if we are recording
                        !isRecording ? (// if youre not recording, then start recording
                          <button
                            onClick={startRecording}
                            className="RecordingButton"
                          >
                            <img src={mic} className="RecordingIMG" />
                          </button>
                        ) : (// else if you are recording, then stop
                          <button
                            onClick={stopRecording}
                            className="RecordingButton"
                          >
                            <img src={micon} className="RecordingIMG" />
                          </button>
                        )
                      ) : (
                        // If the AI is speaking, render a disabled button
                        <button disabled className="RecordingButton">
                          <img src={micDisabled} className="RecordingIMG" />
                        </button>
                      )
                    ) : (
                      <Oval
                        height={80}
                        width={80}
                        color="#8250ff"
                        wrapperStyle={{}}
                        ariaLabel="oval-loading"
                        secondaryColor="#380ca4"
                        strokeWidth={2}
                        strokeWidthSecondary={2}
                      />
                    )
                  }

                  <label className="LiveText">
                    <p className="LiveText-p">Your Voice</p>
                    {value}
                  </label>
                  <div className="bottombuttonsContainer">
                    {showAnalyticsButton ? (
                      <button
                        onClick={() => {
                          setShowAnylatics(
                            (prevShowAnylatics) => !prevShowAnylatics
                          );
                          AnalyticsFetch();
                        }}
                        className="showAnylaticsButton"
                      >
                        Show Analytics
                      </button>
                    ) : null}
                    {IsSpeaking ? (
                      <button
                        onClick={stopAI}
                        type="button"
                        className="Home-stopButton"
                      >
                        Stop AI
                      </button>
                    ) : (
                      <button
                        disabled
                        onClick={stopAI}
                        type="button"
                        className="Home-stopButtonInvis"
                      >
                        Stop AI
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="Home-TranscriptContainer">
              <div className="Home-Transcript">
                {ConvoList.map((convo, index) =>
                  convo[0] === "Human" ? (
                    <div key={index} className="Transcript-HumanContainer">
                      <img src={pfp} className="Transcript-HumanIMG"></img>
                      <label className="Transcript-Human">{convo[1]}</label>
                    </div>
                  ) : (
                    <div key={index} className="Transcript-AIContainer">
                      <img src={gptlogo} className="Transcript-AIIMG"></img>
                      <label className="Transcript-AI">{convo[1]}</label>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </SwiperSlide>
      /* Other slides can go here */
    </Swiper>
  );
}
