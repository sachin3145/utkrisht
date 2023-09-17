import React, { useEffect, useRef } from "react";
import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/clike/clike";
import "codemirror/mode/python/python";
import "codemirror/theme/monokai.css";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
const ACTIONS = require("../Actions");

function Editor({ socketRef, roomId, onCodeChange, onLanguageChange, languageRef }) {
  const editorRef = useRef(null);
  const inputRef = useRef(null);
  const outputRef = useRef(null);

  function changeLanguage(event) {
    const lang = event.target.value;
    onLanguageChange(lang);

    if (!editorRef.current) return;
    if (lang === "JavaScript") {
      editorRef.current.setOption("mode", "javascript");
    } else if (lang === "Python") {
      editorRef.current.setOption("mode", "text/x-python");
    } else if (lang === "C/C++") {
      editorRef.current.setOption("mode", "text/x-c++src");
    }
  socketRef.current.emit(ACTIONS.LANGUAGE_CHANGE, {
    roomId,
    language: lang,
  });
    
  }

  function runCode() {
    if (editorRef.current.getValue() === "") {
      alert("Please enter some valid code!");
      return;
    }
    outputRef.current.value = "Running...";
    socketRef.current.emit(ACTIONS.RUN_CODE, {
      language: languageRef.current,
      code: editorRef.current.getValue(),
      input: inputRef.current.value,
      roomId: roomId,
    });
  }

  useEffect(() => {
    async function init() {
      editorRef.current = CodeMirror.fromTextArea(
        document.getElementById("realtimeEditor"),
        {
          mode: { name: "javascript", json: true },
          theme: "monokai",
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
        }
      );
      editorRef.current.on("change", (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        onCodeChange(code);
        if (origin !== "setValue") {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          });
        }
      });
      inputRef.current = document.getElementById("editorInput");
      
      inputRef.current.addEventListener("input", event => {
        const inputText = inputRef.current.value;
        socketRef.current.emit(ACTIONS.INPUT_CHANGE, { roomId, inputText });
      });
      
      outputRef.current = document.getElementById("editorOutput");
      outputRef.current.readOnly = true;
    }
    init();
  }, []);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null) {
          editorRef.current.setValue(code);
          editorRef.current.focus();
          editorRef.current.setCursor(editorRef.current.lineCount(), 0);
        }
      });
      
      socketRef.current.on(ACTIONS.LANGUAGE_CHANGE, ({ language }) => {
        onLanguageChange(language);
        const element = document.getElementById("curLanguage");
        element.value = language;
        if (language === "JavaScript") {
          editorRef.current.setOption("mode", "javascript");
        } else if (language === "Python") {
          editorRef.current.setOption("mode", "text/x-python");
        } else if (language === "C/C++") {
          editorRef.current.setOption("mode", "text/x-c++src");
        }
      });

      socketRef.current.on(ACTIONS.INPUT_CHANGE, ({ inputText }) => {
        if (inputText !== null) {
          inputRef.current.value = inputText;
        }
      });
      socketRef.current.on(ACTIONS.OUTPUT_CHANGE, ({ data }) => {;
        if (data !== null) {
            outputRef.current.value = data["stdout"]+ '\n' + data['error'] + '\n' + data['stderr'];
        }
      });
    }
    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE);
      socketRef.current.off(ACTIONS.LANGUAGE_CHANGE);
      socketRef.current.off(ACTIONS.INPUT_CHANGE);
      socketRef.current.off(ACTIONS.OUTPUT_CHANGE);
    };
  }, [socketRef.current]);

  return (
    <div id="editorContent">
      <div id="editorNav">
        <select
          id="curLanguage"
          onChange={changeLanguage}
          defaultValue={"JavaScript"}
        >
          <option value="JavaScript">JavaScript</option>
          <option value="C/C++">C/C++</option>
          <option value="Python">Python</option>
        </select>
        
        <button id="run" onClick={runCode}>RUN</button>
      </div>
      <div id="editorPanes">
        <textarea id="realtimeEditor"></textarea>
        <div id="sep"></div>
        <div id="io">
          <label>Input</label>
          <textarea id="editorInput" placeholder="Enter Input"></textarea>
          <label>Output</label>
          <textarea id="editorOutput" placeholder="Output Appears Here"></textarea>
        </div>
      </div>
    </div>
  );
}

export default Editor;
