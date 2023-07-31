// Home.jsx
import React, { useEffect, useState } from "react";
import "../css/home.css";
import "../css/slide1.css";
import "../css/main.css";
import "../css/Anylatics.css";
import Sidebar from "../hooks/Sidebar";
import { useSpeechRecognition } from "react-speech-kit";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import SupportedBrowsers from "../hooks/ListOfBrowsers";
import UseGpt from "../hooks/UseGPT";
import handleTextToSpeech from "../hooks/useTextToSpeech";
import logo from "../images/logo.png";
import gptlogo from "../images/gptlogo.png";
import pfp from "../images/pfp.jpg";
import parseText from "../js/parseText";
import premadeAudio from "../audio/premadeAudio.mp3";
import mic from "../images/mic.png";
import micon from "../images/mic-red.png";
import micDisabled from "../images/mic-disabled.png";
import { Oval } from "react-loader-spinner";
import convoHistroy from "../js/convoHistroyToPrompt";
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
import getAnalytics from "../js/convoAnalytics";

export default function Home() {
  const [HasRun, setHasRun] = useState(false);
  const [showAnylatics, setShowAnylatics] = useState(false);
  if (!HasRun) {
    localStorage.removeItem("analytics");
    localStorage.setItem("conversation-data", JSON.stringify([]));
    setHasRun(true);
  }
  const [HasGottenAnalytics, setHasGottenAnalytics] = useState(false);

  const [FirstTimeRunning, setFirstTimeRunning] = useState(true);
  const [IsSpeaking, setIsSpeaking] = useState(false);
  const [IsLoading, setIsLoading] = useState(false);
  const [ErrorDidOccur, setErrorDidOccur] = useState(false);
  const [audio, setAudio] = useState(null);
  const [showLabel, setShowLabel] = useState(true);
  const [showAnalyticsButton, setShowAnalyticsButton] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [UseOfLanguage, setUseOfLanguage] = useState(0);
  const [Adaptibility, setAdaptibility] = useState(0);
  const [Relevance, setRelevance] = useState(0);
  const [Engagement, setEngagement] = useState(0);
  const [Initiative, setInitiative] = useState(0);

  const [isRecording, setisRecording] = useState(false);
  const [value, setValue] = useState("");
  const [swiper, setSwiper] = useState(null);
  const { listen, listening, stop, supported } = useSpeechRecognition({
    onResult: (result) => {
      setValue(result);
    },
  });
  ////////////////////
  const [UserStartConvo, setUserStartConvo] = useState(null);

  let ConvoList = JSON.parse(localStorage.getItem("conversation-data")) || [];

  if (UserStartConvo) {
  } else if (UserStartConvo == false) {
    let prompt;
    if (FirstTimeRunning) {
      let existingArray =
        JSON.parse(localStorage.getItem("conversation-data")) || [];
      let myObject = [
        "AI",
        "Hey there! Nice to meet you. I couldn't help but notice your friendly vibe. Mind if we strike up a conversation?",
      ];
      existingArray.push(myObject);
      localStorage.setItem("conversation-data", JSON.stringify(existingArray));
      let premade = new Audio(premadeAudio);
      premade.volume = 0.5;
      setAudio(premade);

      prompt = `You are an AI conversation bot designed to help users practice their conversation abilities.if the humans asks any personal questions use fictional data instead. Encourage users to engage in diverse and meaningful conversations.Limit your response to a few sentences. pretend you started the conversation and this is what you said "Hey there! Nice to meet you. I couldn't help but notice your friendly vibe. Mind if we strike up a conversation?", this is what the human said: ${value}`;
      setFirstTimeRunning(false);
    } else {
      prompt = `You are an AI conversation bot designed to help users practice their conversation abilities.if the humans asks any personal questions use fictional data instead. Encourage users to engage in diverse and meaningful conversations.Limit your response to a few sentences: ${value}`;
    }
  }
  const scrollToBottom = () => {
    const transcriptDiv = document.querySelector(".Home-Transcript");
    transcriptDiv.scrollTop = transcriptDiv.scrollHeight;
  };

  useEffect(scrollToBottom, [ConvoList]);

  const stopAI = () => {
    if (audio) {
      audio.pause();
      //console.log("AI audio stopped");
      setIsSpeaking(false);
      setAudio(null);
    }
  };
  const data = [
    { name: "Use of Language", "Conversation Analysis": UseOfLanguage },
    { name: "Adaptability", "Conversation Analysis": Adaptibility },
    { name: "Relevance", "Conversation Analysis": Relevance },
    { name: "Engagement", "Conversation Analysis": Engagement },
    { name: "Initiative", "Conversation Analysis": Initiative },
  ];
  const startRecording = () => {
    setErrorDidOccur(false);
    listen({ continuous: true });
    setisRecording(true);
    setShowLabel(false); // Add this line
  };
  const stopRecording = () => {
    stop();
    // spawn user chat element
    let existingArray =
      JSON.parse(localStorage.getItem("conversation-data")) || [];

    let myObject = ["Human", value];
    existingArray.push(myObject);

    localStorage.setItem("conversation-data", JSON.stringify(existingArray));

    if (existingArray.length + 1 > 3) {
      setShowAnalyticsButton(true);
    }
    setisRecording(false);
    if (value) {
      let existingArray =
        JSON.parse(localStorage.getItem("conversation-data")) || [];
      let prompt;
      if (existingArray.length > 0) {
        prompt = convoHistroy();
      } else {
        prompt = `You are an AI conversation bot designed to help users practice their conversation abilities.if the humans asks any personal questions use fictional data instead. Encourage users to engage in diverse and meaningful conversations.Limit your response to a few sentences: ${value}`;
      }

      setIsLoading(true);
      UseGpt(prompt).then((res) => {
        if (res != "somethingbad-error") {
          // send text to eleven labs to get audio
          handleTextToSpeech(res).then((blob) => {
            const tmp = new Audio(blob);
            tmp.volume = 0.5;
            setAudio(tmp);
            setIsLoading(false);
            // spawn new chat element with ai text
            let existingArray =
              JSON.parse(localStorage.getItem("conversation-data")) || [];

            const AItext = parseText(res);
            let parsedStr = AItext.replace("AI: ", "");
            let myObject = ["AI", parsedStr];
            existingArray.push(myObject);

            localStorage.setItem(
              "conversation-data",
              JSON.stringify(existingArray)
            );
          });
        } else {
          setErrorDidOccur(true);
        }
      });
    }
  };
  useEffect(() => {
    if (audio) {
      // Play the audio
      audio.play();
      //console.log("audio started");
      setIsSpeaking(true);
      audio.onended = () => {
        //console.log("audio finished");
        setIsSpeaking(false);
        setAudio(null);
      };
    }

    // Clean up function
  }, [audio]); // Re-run the effect when 'audio' state changes

  const AnalyticsFetch = async () => {
    if (!HasGottenAnalytics) {
      const anal = getAnalytics().then((res) => {
        //console.log(res)
        setUseOfLanguage(res[0].data);
        setAdaptibility(res[1].data);
        setRelevance(res[2].data);
        setEngagement(res[3].data);
        setInitiative(res[4].data);
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
                        !isRecording ? (
                          <button
                            onClick={startRecording}
                            className="RecordingButton"
                          >
                            <img src={mic} className="RecordingIMG" />
                          </button>
                        ) : (
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
