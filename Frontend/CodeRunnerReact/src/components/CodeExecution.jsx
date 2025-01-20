import React, { useState } from "react";
import axios from "axios";
import Editor from "@monaco-editor/react";
import styles from "./CodeExecution.module.css";

const codingQuestions = [
  {
    id: 1,
    question_id: 101,
    prompt: "Write a function to add two numbers.",
    test_cases: [
      { input: [1, 2], expected_output: [3] },
      { input: [10, 20], expected_output: [30] },
      { input: [5, 7], expected_output: [12] },
    ],
  },
  {
    id: 2,
    question_id: 102,
    prompt: "Write a function to check if a string is a palindrome.",
    test_cases: [
      { input: ["madam"], expected_output: [true] },
      { input: ["hello"], expected_output: [false] },
    ],
  },
];

const CodeExecution = () => {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("python");
  const [selectedQuestion, setSelectedQuestion] = useState(codingQuestions[0]);
  
  const executeCode = async () => {
    setLoading(true);
    setOutput("");
    setError("");
    try {
      const response = await axios.post(
        "http://localhost:5000/api/codeexecution/run",
        {
          language: selectedLanguage,
          code,
          test_cases: selectedQuestion.test_cases,
        }
      );
  
      const actualOutputs = Array.isArray(response.data.output)
        ? response.data.output.map((item) => item.trim())
        : response.data.output.split("\n").map((item) => item.trim());
  
      const results = selectedQuestion.test_cases.map((testCase, index) => {
        const inputStr = Array.isArray(testCase.input)
          ? testCase.input.join(", ")
          : testCase.input;
        const expectedStr = Array.isArray(testCase.expected_output)
          ? testCase.expected_output.join(", ")
          : testCase.expected_output;
        const actualStr = actualOutputs[index];
  
        const isPass = expectedStr === actualStr;
  
        return {
          testCase: inputStr,
          expected: expectedStr,
          actual: actualStr,
          result: isPass ? "Pass" : "Fail",
        };
      });
  
      setOutput(results);
    } catch (err) {
      console.error("Error occurred:", err); // Log error for debugging
      setError(err.response?.data?.error || "An error occurred while executing code");
      setOutput("");
    } finally {
      setLoading(false);
    }
  };
  
  
  const handleLanguageChange = (e) => {
    const language = e.target.value;
    setSelectedLanguage(language);
    setCode(
      language === "python"
        ? `# ${selectedQuestion.prompt}\n\ndef solution():\n    pass`
        : `// ${selectedQuestion.prompt}\n\nfunction solution() {\n    // Write your code here\n}`
    );
  };

  const handleQuestionChange = (question) => {
    setSelectedQuestion(question);
    setCode(
      selectedLanguage === "python"
        ? `# ${question.prompt}\n\ndef solution():\n    pass`
        : `// ${question.prompt}\n\nfunction solution() {\n    // Write your code here\n}`
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>Questions</h2>
        <ul className={styles.questionList}>
          {codingQuestions.map((question) => (
            <li key={question.id} className={styles.questionItem}>
              <details>
                <summary
                  onClick={() => handleQuestionChange(question)}
                  className={styles.questionSummary}
                >
                  {question.prompt}
                </summary>
                <p>Test Cases:</p>
                <ul>
                  {question.test_cases.map((test, index) => (
                    <li key={index}>
                      Input: {test.input}, Expected: {test.expected_output}
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.mainContent}>
        <h1 className={styles.title}>Solve a Coding Challenge</h1>
        <label htmlFor="languageSelector">Select Language:</label>
        <select
          id="languageSelector"
          value={selectedLanguage}
          onChange={handleLanguageChange}
          className={styles.languageSelector}
        >
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
        </select>
        <Editor
          height="400px"
          language={selectedLanguage}
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || "")}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            wordWrap: "on",
          }}
        />
        <button
          className={styles.runButton}
          onClick={executeCode}
          disabled={loading || !code.trim()}
        >
          {loading ? "Running..." : "Run Code"}
        </button>
        <div className={styles.outputSection}>
          <h2 className={styles.outputTitle}>Output</h2>
          {output.length > 0 ? (
            <ul>
              {output.map((result, index) => (
                <li key={index}>
                  <strong>Test Case {index + 1}: </strong>
                  <span>Input: {result.testCase}</span>
                  <br />
                  <span>Expected: {result.expected}</span>
                  <br />
                  <span>Actual: {result.actual}</span>
                  <br />
                  <span
                    style={{
                      color: result.result === "Pass" ? "green" : "red",
                    }}
                  >
                    {result.result}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <pre className={styles.output}>
              {loading ? "Executing..." : "Your output will appear here"}
            </pre>
          )}
          {error && (
            <div className={styles.errorBox}>
              <h3 className={styles.errorTitle}>Error:</h3>
              <pre>{error}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeExecution;
