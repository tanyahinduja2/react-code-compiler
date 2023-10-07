import { useState } from "react";
import Editor from "@monaco-editor/react";
import Navbar from "./Components/Navbar";
import Axios from "axios";
import spinner from "./Spinner.svg";
import "./App.css";

function App() {
  const [userCode, setUserCode] = useState(``);
  const [userLanguage, setUserLanguage] = useState("java");
  const [userTheme, setUserTheme] = useState("vs-dark");
  const [fontSize, setFontSize] = useState(16);
  const [userInput, setUserInput] = useState("");
  const [userOutput, setUserOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const options = {
    fontSize: fontSize,
  };

  function Compile() {
    setLoading(true);
    if (userCode === ``) return;
    Axios.post(
      "http://localhost:8000/compile",
      {
        code: userCode,
        language: userLanguage,
        input: userInput,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => {
        setUserOutput(res.data.output);
      })
      .then(() => {
        setLoading(false);
      });
  }

  function clearOutput() {
    setUserOutput("");
  }

  return (
    <div className="App">
      <Navbar
        userLanguage={userLanguage}
        setUserLanguage={setUserLanguage}
        userTheme={userTheme}
        setUserTheme={setUserTheme}
        fontSize={fontSize}
        setFontSize={setFontSize}
      />
      <div className="main">
        <div className="left-container">
          <div className="editor-container">
            <Editor
              options={options}
              width={`100%`}
              theme={userTheme}
              language={userLanguage}
              defaultLanguage="java"
              defaultValue="//Start Coding Here....."
              onChange={(value) => {
                setUserCode(value);
              }}
            />
          </div>
          <button className="run-btn" onClick={() => Compile()}>
            Run
          </button>
        </div>
        <div className="right-container">
          <div className="input-box">
            <h4>Input: </h4>
            <textarea
              id="code-input"
              onChange={(e) => setUserInput(e.target.value)}
            ></textarea>
          </div>
          {loading ? (
            <div className="output-box">
            <h4>Output: </h4>
            <div className="spinner-box">
              <img src={spinner} alt="Loading....." />
            </div>
          </div>
          ) : (
            <div className="output-box">
              <h4>Output: </h4>
              <pre>{userOutput}</pre>
              <button
                onClick={() => {
                  clearOutput();
                }}
                className="clear-btn"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
