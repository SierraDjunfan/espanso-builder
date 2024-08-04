import { useRef, useState } from 'react'
import './App.scss'

enum TextField {
  TextToReplace,
  Replacement
}

interface VarDictionary {
  [key: string]: string
}

const varDictionary: VarDictionary = {
  "{{dd_mm_yy}}": `
    - name: dd_mm_yy
      type: date
      params:
        format: "%d/%m/%y"`,
  "{{ddmmyy}}": `
    - name: ddmmyy
      type: date
      params:
        format: "%d%m%y"`,
  "{{dd_mm_yyyy}}": `
    - name: dd_mm_yyyy
      type: date
      params:
        format: "%d/%m/%Y"`,
  "{{hh_mm_xm}}": `
    - name: hh_mm_xm
      type: date
      params:
        format: "%I:%M%P"`,
  "{{hh_mm}}": `
    - name: hh_mm
      type: date
      params:
        format: "%H:%M"`
}

function App() {
  const [textToReplaceInput, setTextToReplaceInput] = useState("")
  const [replacementTextInput, setReplacementTextInput] = useState("")
  const [yamlTextInput, setYamlTextInput] = useState("")
  const replacementTextAreaRef = useRef<HTMLTextAreaElement>(null);

  function textFieldWasUpdated(textField: TextField, newText: string) {
    if (textField === TextField.Replacement) {
      setReplacementTextInput(newText)
    } else {
      setTextToReplaceInput(newText)
    }
  }

  function clearAllInputs() {
    setTextToReplaceInput("")
    setReplacementTextInput("")
  }

  function onCreateButtonPressed() {

    const output = `  - trigger: "${textToReplaceInput}"
    replace: "${escapeSpecialCharacters(replacementTextInput)}"`

    const vars = Object.keys(varDictionary).filter(key => replacementTextInput.includes(key))

    if (vars.length === 0) {
      setYamlTextInput(output)
    } else {
      const varsSection = `
    vars:
${vars.map(v => varDictionary[v]).join('\n')}`
      const fullOutput = output + varsSection
      setYamlTextInput(fullOutput)
    }
  }

  function clearYamlButtonWasPressed() {
    setYamlTextInput("")
  }

  function cursorPlaceButtonWasPressed() {
    if (replacementTextAreaRef.current) {
      const textArea = replacementTextAreaRef.current
      const startPos = textArea.selectionStart
      const endPos = textArea.selectionEnd

      const newText = replacementTextInput.slice(0, startPos) + "$|$" + replacementTextInput.slice(endPos)
      setReplacementTextInput(newText)

      setTimeout(() => {
        textArea.focus()
        textArea.setSelectionRange(startPos + 3, startPos + 3)
      }, 0)
    }
  }

  function cursorButtonShouldBeDisabled() {
    return replacementTextInput.includes("$|$")
  }

  function dateTimeStampButtonPressed(dateOutput: string) {
    if (replacementTextAreaRef.current) {
      const textArea = replacementTextAreaRef.current
      const startPos = textArea.selectionStart
      const endPos = textArea.selectionEnd

      const newText = replacementTextInput.slice(0, startPos) + dateOutput + replacementTextInput.slice(endPos)
      setReplacementTextInput(newText)

      setTimeout(() => {
        textArea.focus()
        textArea.setSelectionRange(startPos + dateOutput.length, startPos + dateOutput.length)
      }, 0)
    }
  }

  function escapeSpecialCharacters(text: string) {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
      .replace(/"/g, '\\"')
      .replace(/'/g, "\\'")
  }

  function handleTabKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Tab") {
      e.preventDefault()
      const textInput = e.currentTarget
      const start = textInput.selectionStart
      const end = textInput.selectionEnd
      const newText = replacementTextInput.substring(0, start) + "\t" + replacementTextInput.substring(end)
      setReplacementTextInput(newText)

      setTimeout(() => {
        textInput.selectionStart = textInput.selectionEnd = start + 1
      }, 0)
    }
  }

  function copyYAMLButtonPressed() {
    if (yamlTextInput) {
      navigator.clipboard.writeText(yamlTextInput).then(() => {
        alert("YAML copied to clipboard!")
      }).catch((err) => {
        console.error('Failed to copy text: ', err);
      });
    }
  }

  const cursorButtonDescription = "This defines where the cursor will be after the text is replaced. It can only be used once per match."

  return (
    <>
      <header><h1>Espanso Builder Tool</h1></header>
      <div id="main-section">
        <h1>Replace:</h1>
        <input type="text" value={textToReplaceInput} placeholder="/this text" onChange={e => textFieldWasUpdated(TextField.TextToReplace, e.target.value)}></input>
        <h1>with:</h1>
        <div id="replacement-text-section">
          <textarea ref={replacementTextAreaRef} onKeyDown={handleTabKeyDown} value={replacementTextInput} placeholder="this text!" onChange={e => textFieldWasUpdated(TextField.Replacement, e.target.value)}></textarea>
          <div id="replacement-text-controls">
            <h3>Date Stamps</h3>
            <button onClick={() => dateTimeStampButtonPressed("{{dd_mm_yy}}")}>Today dd/mm/yy</button>
            <button onClick={() => dateTimeStampButtonPressed("{{ddmmyy}}")}>Today ddmmyy</button>
            <button onClick={() => dateTimeStampButtonPressed("{{dd_mm_yyyy}}")}>Today dd/mm/yyyy</button>
            <h3>Time Stamp</h3>
            <button title="eg. 06:05am" onClick={() => dateTimeStampButtonPressed("{{hh_mm_xm}}")}>Current Time (12 hour)</button>
            <button title="eg. 22:04" onClick={() => dateTimeStampButtonPressed("{{hh_mm}}")}>Current Time (24 hour)</button>
          </div>
          <div>
            <h3>Other</h3>
            <button title={cursorButtonDescription} onClick={() => cursorPlaceButtonWasPressed()}disabled={cursorButtonShouldBeDisabled()}>Cursor Placement</button>
          </div>
        </div>
        <button onClick={() => onCreateButtonPressed()}>Create</button>
        <div id="yaml-output-section">
          <textarea placeholder="YAML Output" value={yamlTextInput}></textarea>
          <div id="yaml-output-section-controls">
            <button onClick={() => copyYAMLButtonPressed()}>Copy to Clipboard</button>
            <button onClick={() => clearYamlButtonWasPressed()}>Clear Yaml</button>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
